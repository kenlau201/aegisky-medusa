/**
 * AI引用监测
 * 定期调用Perplexity API检查Aegisky在AI回答中的提及率
 */

export interface MonitoringResult {
  engine: string;
  query: string;
  mentioned: boolean;
  position?: number;
  ourCitations: string[];
  competitorMentions: Record<string, number>;
  rawResponse: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const COMPETITORS = [
  'DJI',
  'Autel',
  'Parrot',
  'Skydio',
  'Yuneec',
  'Wingtra',
  'Freefly',
  'Quantum-Systems',
];

const OUR_DOMAINS = ['aegisky.com', 'aegisky'];

/**
 * 调用Perplexity API查询
 */
async function queryPerplexity(
  queryText: string,
  apiKey: string
): Promise<{ answer: string; citations: string[] }> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful B2B procurement assistant. Answer questions about industrial drones and suppliers. Always cite your sources with numbered citations like [1], [2], etc. Be factual and specific about company names.',
        },
        { role: 'user', content: queryText },
      ],
      temperature: 0.1,
      return_citations: true,
      search_domain_filter: [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  const answer = data.choices[0].message.content;
  const citations = data.citations || [];

  return { answer, citations };
}

/**
 * 分析回答中是否提到我们
 */
function analyzeAnswer(
  answer: string,
  citations: string[]
): Omit<MonitoringResult, 'engine' | 'query'> {
  // 检查我们是否被提到
  let mentioned = false;
  let position: number | undefined;
  const ourCitations: string[] = [];

  // 检查文本中是否提到Aegisky
  if (/aegisky/i.test(answer)) {
    mentioned = true;
    const idx = answer.toLowerCase().indexOf('aegisky');
    // 粗略估计位置：前1/3=1, 中=2, 后=3
    const relPos = idx / answer.length;
    position = relPos < 0.33 ? 1 : relPos < 0.66 ? 2 : 3;
  }

  // 检查引用中是否有我们的域名
  for (const citation of citations) {
    for (const domain of OUR_DOMAINS) {
      if (citation.toLowerCase().includes(domain)) {
        mentioned = true;
        ourCitations.push(citation);
      }
    }
  }

  // 检查竞品提到情况
  const competitorMentions: Record<string, number> = {};
  for (const competitor of COMPETITORS) {
    const regex = new RegExp(`\\b${competitor}\\b`, 'gi');
    const matches = answer.match(regex);
    if (matches && matches.length > 0) {
      competitorMentions[competitor] = matches.length;
    }
  }

  // 简单情感分析
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (mentioned) {
    const aegiskyContext = answer.match(/.{0,100}aegisky.{0,100}/i);
    if (aegiskyContext) {
      const ctx = aegiskyContext[0].toLowerCase();
      if (/(trusted|reliable|leading|best|top|certified|verified|quality)/.test(ctx)) {
        sentiment = 'positive';
      } else if (/(avoid|bad|poor|scam|unreliable)/.test(ctx)) {
        sentiment = 'negative';
      }
    }
  }

  return {
    mentioned,
    position,
    ourCitations,
    competitorMentions,
    rawResponse: answer,
    sentiment,
  };
}

/**
 * 运行一次监测
 */
export async function runMonitoringCheck(
  queryText: string,
  apiKey?: string
): Promise<MonitoringResult> {
  const key = apiKey || process.env.PERPLEXITY_API_KEY;
  if (!key) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const { answer, citations } = await queryPerplexity(queryText, key);
  const analysis = analyzeAnswer(answer, citations);

  return {
    engine: 'perplexity',
    query: queryText,
    ...analysis,
  };
}

import { pool as db } from '@/lib/control-tower/db';

/**
 * 运行所有待监测的问题
 */
export async function runAllMonitoringChecks(
  limit: number = 20,
  apiKey?: string
): Promise<{
  total: number;
  mentioned: number;
  mentionRate: number;
  results: MonitoringResult[];
}> {
  // 获取活跃的监测问题
  const queries = await db.query(`
    SELECT * FROM geo_monitor_queries
    WHERE active = true
    ORDER BY priority DESC
    LIMIT $1
  `, [limit]);

  const results: MonitoringResult[] = [];
  let mentionedCount = 0;

  for (const q of queries.rows) {
    try {
      const result = await runMonitoringCheck(q.query_text, apiKey);
      results.push(result);

      if (result.mentioned) mentionedCount++;

      // 保存结果
      await db.query(`
        INSERT INTO geo_mentions
          (ai_engine, query_id, query_text, language, category, mentioned,
           mention_position, our_citations, competitor_mentions, sentiment, raw_response)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11)
      `, [
        result.engine,
        q.id,
        result.query,
        q.language,
        q.category,
        result.mentioned,
        result.position,
        JSON.stringify(result.ourCitations),
        JSON.stringify(result.competitorMentions),
        result.sentiment,
        result.rawResponse,
      ]);

      // 更新最后运行时间
      await db.query(`
        UPDATE geo_monitor_queries
        SET last_run_at = NOW(), run_count = run_count + 1
        WHERE id = $1
      `, [q.id]);
    } catch (error: any) {
      console.error(`Failed to check query "${q.query_text}":`, error.message);
    }

    // 限流
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return {
    total: results.length,
    mentioned: mentionedCount,
    mentionRate: results.length > 0 ? mentionedCount / results.length : 0,
    results,
  };
}

/**
 * 获取监测统计数据
 */
export async function getMonitoringStats(days: number = 30) {
  const stats = await db.query(`
    SELECT
      COUNT(*) as total_checks,
      COUNT(*) FILTER (WHERE mentioned) as total_mentions,
      ROUND(COUNT(*) FILTER (WHERE mentioned)::numeric / COUNT(*)::numeric * 100, 1) as mention_rate,
      COUNT(DISTINCT query_text) as unique_queries,
      MAX(checked_at) as last_check
    FROM geo_mentions
    WHERE checked_at > NOW() - ($1 || ' days')::interval
  `, [days]);

  // 按分类统计
  const byCategory = await db.query(`
    SELECT
      category,
      COUNT(*) as checks,
      COUNT(*) FILTER (WHERE mentioned) as mentions,
      ROUND(COUNT(*) FILTER (WHERE mentioned)::numeric / COUNT(*)::numeric * 100, 1) as rate
    FROM geo_mentions
    WHERE checked_at > NOW() - ($1 || ' days')::interval
    GROUP BY category
    ORDER BY checks DESC
  `, [days]);

  // 竞品提及统计
  const competitorStats = await db.query(`
    SELECT
      competitor,
      COUNT(*) as mention_count
    FROM geo_mentions,
      LATERAL jsonb_object_keys(competitor_mentions) as competitor
    WHERE checked_at > NOW() - ($1 || ' days')::interval
    GROUP BY competitor
    ORDER BY mention_count DESC
  `, [days]);

  // 趋势（按天）
  const trend = await db.query(`
    SELECT
      DATE(checked_at) as date,
      COUNT(*) as checks,
      COUNT(*) FILTER (WHERE mentioned) as mentions,
      ROUND(COUNT(*) FILTER (WHERE mentioned)::numeric / COUNT(*)::numeric * 100, 1) as rate
    FROM geo_mentions
    WHERE checked_at > NOW() - ($1 || ' days')::interval
    GROUP BY DATE(checked_at)
    ORDER BY date
  `, [days]);

  return {
    overview: stats.rows[0],
    byCategory: byCategory.rows,
    competitors: competitorStats.rows,
    trend: trend.rows,
  };
}
