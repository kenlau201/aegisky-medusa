import { NextRequest, NextResponse } from 'next/server';
import { runCrawlCycle } from '@/lib/suppliers/article-crawler';
import { runArticleLifecycle } from '@/lib/suppliers/article-lifecycle';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { mode = 'full', dryRun = false } = body;

    const results: any = {
      started_at: new Date().toISOString(),
      mode,
      dry_run: dryRun,
    };

    if (mode === 'crawl' || mode === 'full') {
      results.crawl = await runCrawlCycle({ dryRun });
    }

    if (mode === 'lifecycle' || mode === 'score' || mode === 'full') {
      results.lifecycle = await runArticleLifecycle(dryRun);
    }

    results.finished_at = new Date().toISOString();

    return NextResponse.json({ success: true, ...results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { pool } = await import('@/lib/control-tower/db');
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_articles,
        COUNT(DISTINCT brand_id) as brands_with_articles,
        ROUND(AVG(geo_score)) as avg_geo_score,
        ROUND(AVG(word_count)) as avg_word_count,
        COUNT(*) FILTER (WHERE geo_score >= 70) as high_value_count,
        COUNT(*) FILTER (WHERE geo_score >= 55 AND geo_score < 70) as medium_value_count,
        COUNT(*) FILTER (WHERE geo_score < 55) as low_value_count,
        MAX(last_evaluated_at) as last_scored,
        (SELECT COUNT(*) FROM aegisky_brands WHERE product_count > 0) as total_brands_with_products
      FROM brand_articles
    `);

    const brandsAtCapacity = await pool.query(`
      SELECT b.name, b.slug, COUNT(a.id) as article_count,
             ROUND(AVG(a.geo_score)) as avg_score,
             MAX(a.published_date) as latest_article
      FROM brand_articles a
      JOIN aegisky_brands b ON a.brand_id = b.id
      GROUP BY b.id, b.name, b.slug
      HAVING COUNT(a.id) >= 6
      ORDER BY avg_score DESC
    `);

    const topArticles = await pool.query(`
      SELECT a.id, a.title, b.name as brand, a.geo_score,
             a.search_intent, a.word_count, a.published_date
      FROM brand_articles a
      JOIN aegisky_brands b ON a.brand_id = b.id
      ORDER BY a.geo_score DESC
      LIMIT 10
    `);

    await pool.end();

    return NextResponse.json({
      stats: stats.rows[0],
      brands_at_capacity: brandsAtCapacity.rows,
      top_articles: topArticles.rows,
      max_articles_per_brand: 6,
      feeds_configured: 7,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
