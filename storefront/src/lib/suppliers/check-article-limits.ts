import { pool as db } from '../control-tower/db';

async function check() {
  // Current article count per brand
  const result = await db.query(`
    SELECT b.name, b.slug, b.website_url, COUNT(a.id) as article_count
    FROM aegisky_brands b
    LEFT JOIN brand_articles a ON a.brand_id = b.id
    GROUP BY b.id, b.name, b.slug, b.website_url
    HAVING COUNT(a.id) > 0
    ORDER BY article_count DESC
  `);

  console.log('=== Current Article Distribution ===');
  console.log(`Brands with articles: ${result.rows.length}`);
  let total = 0;
  for (const row of result.rows) {
    console.log(`  ${row.name}: ${row.article_count} articles (${row.website_url || 'no website'})`);
    total += parseInt(row.article_count);
  }
  console.log(`Total: ${total} articles`);

  // Brands at limit (6+)
  const atLimit = result.rows.filter(r => parseInt(r.article_count) >= 6);
  console.log(`\nBrands at/over 6-article limit: ${atLimit.length}`);

  // Brands under limit
  const underLimit = result.rows.filter(r => parseInt(r.article_count) < 6);
  console.log(`Brands under 6-article limit: ${underLimit.length}`);

  await db.end();
}

check().catch(console.error);
