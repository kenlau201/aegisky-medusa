/**
 * Article Pipeline Orchestrator
 *
 * Runs the full article collection and lifecycle pipeline:
 * 1. Crawl RSS feeds for new articles
 * 2. Match to brands, deduplicate, score
 * 3. Insert valuable new articles
 * 4. Run lifecycle management (enforce 6-per-brand limit by GEO score)
 * 5. Generate report
 *
 * Usage:
 *   npx tsx src/lib/suppliers/run-article-pipeline.ts           # Full run
 *   npx tsx src/lib/suppliers/run-article-pipeline.ts --dry-run # Preview only
 *   npx tsx src/lib/suppliers/run-article-pipeline.ts --score-only  # Just re-score existing
 */

import { pool as db } from '../control-tower/db';
import { runCrawlCycle } from './article-crawler';
import { runArticleLifecycle } from './article-lifecycle';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const scoreOnly = args.includes('--score-only');

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Aegisky GUTN - Article Pipeline v6.4.4         ║');
  console.log('║  GEO-Driven Article Collection & Lifecycle      ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'} | ${new Date().toISOString()}\n`);

  try {
    // Step 1: Get current stats
    const beforeStats = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT brand_id) as brands,
        ROUND(AVG(geo_score)) as avg_score
      FROM brand_articles
    `);
    console.log(`Current state: ${beforeStats.rows[0].total} articles across ${beforeStats.rows[0].brands} brands (avg GEO score: ${beforeStats.rows[0].avg_score})\n`);

    // Step 2: Crawl for new articles (unless score-only mode)
    if (!scoreOnly) {
      console.log('━━━ Step 1: Crawling for new articles ━━━\n');
      const crawlStats = await runCrawlCycle({ dryRun });
      console.log('');
    } else {
      console.log('━━━ Step 1: SKIPPED (score-only mode) ━━━\n');
    }

    // Step 3: Run lifecycle management (score + enforce 6-per-brand)
    console.log('━━━ Step 2: GEO scoring & lifecycle management ━━━\n');
    const lifecycleReport = await runArticleLifecycle(dryRun);

    // Step 4: Get after stats
    const afterStats = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT brand_id) as brands,
        ROUND(AVG(geo_score)) as avg_score,
        ROUND(AVG(word_count)) as avg_words
      FROM brand_articles
    `);

    // Step 5: Get top articles
    const topArticles = await db.query(`
      SELECT a.id, a.title, b.name as brand, a.geo_score, a.search_intent, a.word_count
      FROM brand_articles a
      JOIN aegisky_brands b ON a.brand_id = b.id
      ORDER BY a.geo_score DESC
      LIMIT 10
    `);

    console.log('\n━━━ Final Report ━━━\n');
    console.log(`Total articles: ${afterStats.rows[0].total} (was ${beforeStats.rows[0].total})`);
    console.log(`Brands with articles: ${afterStats.rows[0].brands}`);
    console.log(`Average GEO score: ${afterStats.rows[0].avg_score}`);
    console.log(`Average word count: ${afterStats.rows[0].avg_words}`);

    console.log('\nTop 10 GEO-performing articles:');
    for (const a of topArticles.rows) {
      console.log(`  [${a.geo_score}] ${a.brand} - "${a.title.substring(0, 55)}..." (${a.word_count}w, ${a.search_intent})`);
    }

    // Brands at capacity
    const fullBrands = await db.query(`
      SELECT b.name, b.slug, COUNT(a.id) as article_count, ROUND(AVG(a.geo_score)) as avg_score
      FROM brand_articles a
      JOIN aegisky_brands b ON a.brand_id = b.id
      GROUP BY b.id, b.name, b.slug
      HAVING COUNT(a.id) >= 6
      ORDER BY article_count DESC, avg_score DESC
    `);

    if (fullBrands.rows.length > 0) {
      console.log('\nBrands at capacity (6/6 articles):');
      for (const b of fullBrands.rows) {
        console.log(`  ${b.name}: ${b.article_count} articles (avg GEO: ${b.avg_score})`);
      }
    }

    // Brands needing more content
    const emptyBrands = await db.query(`
      SELECT b.name, b.slug, b.product_count
      FROM aegisky_brands b
      LEFT JOIN brand_articles a ON b.id = a.brand_id
      WHERE a.id IS NULL AND b.product_count > 0
      ORDER BY b.product_count DESC
      LIMIT 15
    `);

    if (emptyBrands.rows.length > 0) {
      console.log(`\nBrands with products but NO articles (${emptyBrands.rows.length} shown):`);
      for (const b of emptyBrands.rows) {
        console.log(`  ${b.name} (${b.product_count} products)`);
      }
    }

    console.log(`\n${dryRun ? '[DRY RUN] No changes made.' : 'Pipeline complete.'}`);

  } catch (err) {
    console.error('Pipeline failed:', err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
