/**
 * GEO内容优化器
 * 5种优化策略：structure/schema/answer_first/authority/faq
 * 调用DeepSeek API批量优化产品/供应商/分类内容
 */

export type OptimizationStrategy =
  | 'structure'
  | 'schema'
  | 'answer_first'
  | 'authority'
  | 'faq';

export interface OptimizationRequest {
  contentType: 'product' | 'supplier' | 'category' | 'solution';
  contentId: string;
  language: string;
  originalContent: string;
  title: string;
  strategies?: OptimizationStrategy[];
  metadata?: Record<string, any>;
}

export interface OptimizationResult {
  optimizedContent: string;
  scoreBefore: number;
  scoreAfter: number;
  strategiesApplied: OptimizationStrategy[];
  faq?: Array<{ question: string; answer: string }>;
}

const STRATEGY_PROMPTS: Record<OptimizationStrategy, string> = {
  structure: `Add clear hierarchical structure:
- Use H2/H3 headings for major sections
- Use bullet points for lists of features/specs
- Break long paragraphs into short, scannable chunks
- Add bold for key specifications and numbers`,

  schema: `Make it schema-friendly for AI extraction:
- State specifications in clear "Name: Value" format
- Include exact numbers with units (e.g., "60 minutes flight time", "5kg payload")
- Mention brand, manufacturer, MPN explicitly
- List certifications clearly (CE, FCC, ISO, etc.)`,

  answer_first: `Put the most important information FIRST:
- Start with what the product is and its primary use case
- Lead with key differentiators and specifications
- Answer the most common buyer question immediately
- B2B buyers care about: MOQ, lead time, certifications, use cases`,

  authority: `Add authority and trust signals:
- Mention relevant certifications and compliance standards
- Reference industry use cases
- Include quality assurance statements
- Mention manufacturing capabilities if relevant`,

  faq: `Add a FAQ section at the end with 5-6 common B2B buyer questions:
- MOQ and pricing questions
- Lead time and shipping
- Customization/OEM availability
- Certification and compliance
- Warranty and support
- Format as "Q: question" / "A: answer"`,
};

/**
 * 估算GEO分数（0-100）
 * 简单的启发式评分，用于优化前后对比
 */
export function estimateGeoScore(content: string): number {
  let score = 0;

  // 有标题结构
  if (content.includes('## ')) score += 15;
  // 有列表
  if (content.includes('- ')) score += 10;
  // 有数字+单位
  if (/\d+\s*(min|kg|km|m|mm|V|Ah|GHz|MP|m)/i.test(content)) score += 15;
  // 有认证
  if (/(CE|FCC|ISO|RoHS|REACH|FAA|ECCN)/i.test(content)) score += 15;
  // 有FAQ
  if (/Q:|FAQ|Frequently Asked/i.test(content)) score += 15;
  // 长度合适（300-2000字）
  const len = content.length;
  if (len > 300 && len < 3000) score += 15;
  else if (len > 100) score += 5;
  // 有B2B关键词
  if (/(MOQ|lead time|OEM|ODM|bulk|wholesale|manufacturer)/i.test(content)) score += 15;
  // 有使用场景
  if (/(inspection|agriculture|surveying|mapping|construction|public safety)/i.test(content)) score += 15;

  return Math.min(100, score);
}

/**
 * 构建优化Prompt
 */
function buildOptimizationPrompt(req: OptimizationRequest): string {
  const strategies = req.strategies || ['structure', 'schema', 'answer_first', 'authority', 'faq'];

  const strategyInstructions = strategies
    .map(s => STRATEGY_PROMPTS[s])
    .join('\n\n');

  return `You are an expert B2B industrial drone copywriter optimizing content for Generative Engine Optimization (GEO).
Your goal is to make this content rank well in AI search results (ChatGPT, Perplexity, Claude, Gemini).

Content type: ${req.contentType}
Title: ${req.title}
Language: ${req.language}
${req.metadata?.category ? `Category: ${req.metadata.category}` : ''}
${req.metadata?.brand ? `Brand/Manufacturer: ${req.metadata.brand}` : ''}
${req.metadata?.specs ? `Key specs: ${JSON.stringify(req.metadata.specs)}` : ''}

Apply these specific optimizations:

${strategyInstructions}

Important rules:
1. Do NOT make up specifications or certifications that aren't mentioned
2. Keep all factual information from the original content
3. Write for B2B engineering/procurement buyers, not consumers
4. Be specific and technical, not marketing fluff
5. Output valid Markdown
6. Do NOT include any preamble or explanation, just output the optimized content directly

Original content:
---
${req.originalContent}
---

Optimized content:`;
}

/**
 * 调用DeepSeek API优化内容
 */
export async function optimizeContent(
  req: OptimizationRequest,
  apiKey?: string
): Promise<OptimizationResult> {
  const key = apiKey || process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error('DEEPSEEK_API_KEY not configured. Set DEEPSEEK_API_KEY in .env.local');
  }

  const scoreBefore = estimateGeoScore(req.originalContent);
  const prompt = buildOptimizationPrompt(req);

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a senior B2B industrial technology copywriter specializing in unmanned systems and drones. You write clear, technical, factual content that procurement engineers trust.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const optimizedContent = data.choices[0].message.content.trim();
  const scoreAfter = estimateGeoScore(optimizedContent);

  // 提取FAQ（如果有）
  let faq: OptimizationResult['faq'];
  const faqSection = optimizedContent.match(/##?\s*(FAQ|Frequently Asked)[\s\S]*$/i);
  if (faqSection) {
    const qaMatches = [...optimizedContent.matchAll(/Q:\s*(.+?)\n+A:\s*(.+?)(?=\n+Q:|$)/gs)];
    if (qaMatches.length > 0) {
      faq = qaMatches.map(m => ({
        question: m[1].trim(),
        answer: m[2].trim(),
      }));
    }
  }

  return {
    optimizedContent,
    scoreBefore,
    scoreAfter,
    strategiesApplied: req.strategies || ['structure', 'schema', 'answer_first', 'authority', 'faq'],
    faq,
  };
}

import { pool as db } from '@/lib/control-tower/db';

/**
 * 批量优化队列中的内容
 * 每次处理一批，避免API限流
 */
export async function processOptimizationQueue(
  batchSize: number = 5,
  apiKey?: string
): Promise<{ processed: number; success: number; failed: number }> {
  // 取出待处理的内容
  const pending = await db.query(`
    SELECT * FROM geo_content
    WHERE status = 'pending'
    ORDER BY priority DESC, created_at ASC
    LIMIT $1
  `, [batchSize]);

  let success = 0;
  let failed = 0;

  for (const item of pending.rows) {
    try {
      // 标记为处理中
      await db.query(
        `UPDATE geo_content SET status = 'optimizing' WHERE id = $1`,
        [item.id]
      );

      const result = await optimizeContent(
        {
          contentType: item.content_type,
          contentId: item.content_id,
          language: item.language,
          originalContent: item.original_content || '',
          title: item.title || '',
          strategies: item.strategies_applied,
          metadata: item.metadata,
        },
        apiKey
      );

      // 更新结果
      await db.query(`
        UPDATE geo_content
        SET status = 'optimized',
            optimized_content = $1,
            geo_score_before = $2,
            geo_score_after = $3,
            strategies_applied = $4,
            optimized_at = NOW(),
            updated_at = NOW()
        WHERE id = $5
      `, [
        result.optimizedContent,
        result.scoreBefore,
        result.scoreAfter,
        result.strategiesApplied,
        item.id,
      ]);

      success++;
    } catch (error: any) {
      console.error(`Failed to optimize ${item.id}:`, error.message);
      await db.query(`
        UPDATE geo_content
        SET status = 'failed',
            error_message = $1,
            updated_at = NOW()
        WHERE id = $2
      `, [error.message, item.id]);
      failed++;
    }

    // 限流：每秒1个请求
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return {
    processed: pending.rows.length,
    success,
    failed,
  };
}
