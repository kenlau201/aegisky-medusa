/**
 * Article Lifecycle Manager
 *
 * Rules:
 * - Each brand max 6 articles
 * - Articles scored by GEO value
 * - When brand has >6, remove lowest-scoring articles
 * - Never remove if brand has <=6 articles
 * - GEO value determines retention: high-value stays, low-value gets rotated out
 */

import { pool as db } from '../control-tower/db';
import { scoreArticle, shouldKeepArticle } from './geo-scoring';

const MAX_ARTICLES_PER_BRAND = 6;

export interface LifecycleReport {
  totalScored: number;
  brandsProcessed: number;
  articlesRemoved: number;
  articlesKept: number;
  topPerformers: Array<{ id: number; title: string; brand: string; score: number; grade: string }>;
  removedArticles: Array<{ id: number; title: string; brand: string; score: number; reason: string }>;
}

export async function runArticleLifecycle(dryRun: boolean = false): Promise<LifecycleReport> {
  const report: LifecycleReport = {
    totalScored: 0,
    brandsProcessed: 0,
    articlesRemoved: 0,
    articlesKept: 0,
    topPerformers: [],
    removedArticles: [],
  };

  // Get all articles with brand info
  const result = await db.query(`
    SELECT a.id, a.title, a.summary, a.content, a.category, a.published_date,
           a.brand_id, b.name as brand_name, b.product_count, b.slug as brand_slug,
           a.geo_score, a.created_at
    FROM brand_articles a
    JOIN aegisky_brands b ON a.brand_id = b.id
    ORDER BY b.name, a.published_date DESC NULLS LAST
  `);

  // Group by brand
  const brandMap = new Map<number, any[]>();
  for (const article of result.rows) {
    if (!brandMap.has(article.brand_id)) {
      brandMap.set(article.brand_id, []);
    }
    brandMap.get(article.brand_id)!.push(article);
  }

  console.log(`Processing ${brandMap.size} brands with ${result.rows.length} total articles...`);

  for (const [brandId, articles] of brandMap) {
    report.brandsProcessed++;

    // Score all articles for this brand
    const scoredArticles = articles.map(article => {
      const score = scoreArticle({
        title: article.title,
        summary: article.summary || '',
        content: article.content || '',
        category: article.category || 'generic',
        published_date: article.published_date,
        brand_name: article.brand_name,
        product_count: article.product_count,
      });

      return { ...article, score };
    });

    // Update scores in database
    for (const sa of scoredArticles) {
      report.totalScored++;
      if (!dryRun) {
        await db.query(
          `UPDATE brand_articles
           SET geo_score = $1,
               geo_keywords = $2,
               content_quality_score = $3,
               search_intent = $4,
               word_count = $5,
               last_evaluated_at = NOW()
           WHERE id = $6`,
          [sa.score.total, sa.score.foundKeywords, sa.score.total, sa.score.intentType, sa.score.wordCount, sa.id]
        );
      }
    }

    // Sort by score descending
    scoredArticles.sort((a, b) => b.score.total - a.score.total);

    // Track top performers
    if (scoredArticles.length > 0) {
      const top = scoredArticles[0];
      report.topPerformers.push({
        id: top.id,
        title: top.title,
        brand: top.brand_name,
        score: top.score.total,
        grade: top.score.qualityGrade,
      });
    }

    // If brand has more than MAX_ARTICLES_PER_BRAND, always remove lowest-scoring ones
    // Rule: max 6 per brand, GEO score determines which stay (highest) and which go (lowest)
    if (scoredArticles.length > MAX_ARTICLES_PER_BRAND) {
      const toRemove = scoredArticles.slice(MAX_ARTICLES_PER_BRAND);

      for (const article of toRemove) {
        const ageDays = article.published_date
          ? Math.floor((Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60 * 24))
          : 365;

        // Always remove articles beyond the top 6 - GEO score determines ranking
        report.articlesRemoved++;
        report.removedArticles.push({
          id: article.id,
          title: article.title,
          brand: article.brand_name,
          score: article.score.total,
          reason: `GEO score ${article.score.total} (${article.score.qualityGrade}), rank #${scoredArticles.indexOf(article) + 1} of ${scoredArticles.length}, age ${ageDays}d - below top ${MAX_ARTICLES_PER_BRAND}`,
        });

        if (!dryRun) {
          await db.query('DELETE FROM brand_articles WHERE id = $1', [article.id]);
        }
      }
    } else {
      report.articlesKept += scoredArticles.length;
    }
  }

  // Sort top performers by score
  report.topPerformers.sort((a, b) => b.score - a.score);

  console.log(`\n=== Article Lifecycle Report ===`);
  console.log(`Brands processed: ${report.brandsProcessed}`);
  console.log(`Articles scored: ${report.totalScored}`);
  console.log(`Articles removed: ${report.articlesRemoved}`);
  console.log(`Articles kept: ${report.articlesKept}`);

  if (report.removedArticles.length > 0) {
    console.log(`\nRemoved articles:`);
    for (const r of report.removedArticles.slice(0, 10)) {
      console.log(`  [${r.brand}] "${r.title.substring(0, 60)}..." (score: ${r.score})`);
    }
  }

  return report;
}

/**
 * Score a single new article and determine if it should be added
 */
export async function evaluateNewArticle(article: {
  title: string;
  summary: string;
  content: string;
  category: string;
  published_date: string | null;
  brand_id: number;
}): Promise<{ shouldAdd: boolean; score: number; grade: string; reason: string }> {
  // Get brand info
  const brandResult = await db.query(
    'SELECT name, product_count FROM aegisky_brands WHERE id = $1',
    [article.brand_id]
  );

  if (brandResult.rows.length === 0) {
    return { shouldAdd: false, score: 0, grade: 'F', reason: 'Brand not found' };
  }

  const brand = brandResult.rows[0];

  const score = scoreArticle({
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    published_date: article.published_date,
    brand_name: brand.name,
    product_count: brand.product_count,
  });

  // Count existing articles for this brand
  const countResult = await db.query(
    'SELECT COUNT(*) FROM brand_articles WHERE brand_id = $1',
    [article.brand_id]
  );
  const existingCount = parseInt(countResult.rows[0].count);

  // If under max, always add
  if (existingCount < MAX_ARTICLES_PER_BRAND) {
    return {
      shouldAdd: true,
      score: score.total,
      grade: score.qualityGrade,
      reason: `Brand has ${existingCount}/${MAX_ARTICLES_PER_BRAND} articles, adding`,
    };
  }

  // If at max, only add if score is higher than the lowest existing
  const lowestResult = await db.query(
    'SELECT id, geo_score, title FROM brand_articles WHERE brand_id = $1 ORDER BY geo_score ASC LIMIT 1',
    [article.brand_id]
  );
  const lowestScore = lowestResult.rows[0]?.geo_score || 0;

  if (score.total > lowestScore) {
    return {
      shouldAdd: true,
      score: score.total,
      grade: score.qualityGrade,
      reason: `Score ${score.total} > lowest existing ${lowestScore}, will replace lowest`,
    };
  }

  return {
    shouldAdd: false,
    score: score.total,
    grade: score.qualityGrade,
    reason: `Score ${score.total} <= lowest existing ${lowestScore}, brand at ${MAX_ARTICLES_PER_BRAND}/${MAX_ARTICLES_PER_BRAND}`,
  };
}

// Run if called directly
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  runArticleLifecycle(dryRun)
    .then(() => {
      console.log(dryRun ? '\n[DRY RUN] No changes made.' : '\nLifecycle management complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Lifecycle management failed:', err);
      process.exit(1);
    });
}
