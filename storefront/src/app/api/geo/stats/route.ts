import { NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET() {
  try {
    // 1. 总览数据
    const overview = await db.query(`
      SELECT
        COUNT(*) as total_checks,
        COUNT(*) FILTER (WHERE mentioned) as total_mentions,
        ROUND(COUNT(*) FILTER (WHERE mentioned)::numeric / NULLIF(COUNT(*),0)::numeric * 100, 1) as mention_rate,
        COUNT(DISTINCT query_text) as unique_queries,
        MAX(checked_at) as last_check
      FROM geo_mentions
      WHERE checked_at > NOW() - INTERVAL '30 days'
    `);

    // 2. 按分类统计
    const byCategory = await db.query(`
      SELECT
        category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE mentioned) as mentions,
        ROUND(COUNT(*) FILTER (WHERE mentioned)::numeric / NULLIF(COUNT(*),0)::numeric * 100, 1) as mention_rate
      FROM geo_mentions
      WHERE checked_at > NOW() - INTERVAL '30 days'
      GROUP BY category
      ORDER BY total DESC
    `);

    // 3. 竞品提及统计（从competitor_mentions JSONB字段提取）
    const competitors = await db.query(`
      SELECT
        jsonb_object_keys(competitor_mentions) as competitor,
        COUNT(*) as mention_count
      FROM geo_mentions
      WHERE checked_at > NOW() - INTERVAL '30 days'
        AND competitor_mentions IS NOT NULL
      GROUP BY competitor
      ORDER BY mention_count DESC
    `);

    // 4. 7天趋势
    const trend = await db.query(`
      SELECT
        DATE(checked_at) as date,
        COUNT(*) as checks,
        COUNT(*) FILTER (WHERE mentioned) as mentions,
        ROUND(COUNT(*) FILTER (WHERE mentioned)::numeric / NULLIF(COUNT(*),0)::numeric * 100, 1) as mention_rate
      FROM geo_mentions
      WHERE checked_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(checked_at)
      ORDER BY date ASC
    `);

    // 5. 内容优化统计
    const contentStats = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'optimized') as optimized,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) as total,
        ROUND(AVG(geo_score_after - geo_score_before), 1) as avg_score_improvement
      FROM geo_content
    `);

    // 6. 最近的监测结果
    const recentMentions = await db.query(`
      SELECT query_text, category, mentioned, mention_position, sentiment, checked_at
      FROM geo_mentions
      ORDER BY checked_at DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      overview: {
        ...overview.rows[0],
        content_pending: contentStats.rows[0]?.pending || 0,
        content_optimized: contentStats.rows[0]?.optimized || 0,
        avg_score_improvement: contentStats.rows[0]?.avg_score_improvement || 0,
      },
      byCategory: byCategory.rows,
      competitors: competitors.rows,
      trend: trend.rows,
      recentMentions: recentMentions.rows,
      contentStats: contentStats.rows[0] || {},
    });
  } catch (error: any) {
    console.error('GEO stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
