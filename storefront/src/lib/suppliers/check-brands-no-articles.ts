import { pool as db } from '../control-tower/db';

async function checkBrands() {
  // Brands without articles
  const noArticles = await db.query(`
    SELECT b.id, b.name, b.slug, b.product_count, b.verified
    FROM aegisky_brands b
    LEFT JOIN brand_articles a ON b.id = a.brand_id
    WHERE a.id IS NULL
    ORDER BY b.verified DESC, b.product_count DESC
    LIMIT 30
  `);
  console.log('Top 30 brands WITHOUT articles:');
  noArticles.rows.forEach(r => console.log(`  ${r.verified ? '✓' : ' '} ${r.name} (${r.slug}) - ${r.product_count} products`));

  // Check if specific brands exist
  const checkBrands = ['wingtra', 'uavionix', 'skydio', 'sensefly', 'freefly', 'jouav', 'agriculture-drone', 'quantum-systems', 'delair'];
  for (const slug of checkBrands) {
    const r = await db.query('SELECT id, name, slug FROM aegisky_brands WHERE slug = $1', [slug]);
    if (r.rows.length > 0) {
      console.log(`\nFound: ${r.rows[0].name} (${r.rows[0].slug}) id=${r.rows[0].id}`);
    } else {
      // Try partial match
      const partial = await db.query("SELECT id, name, slug FROM aegisky_brands WHERE name ILIKE $1 OR slug ILIKE $1 LIMIT 5", [`%${slug}%`]);
      if (partial.rows.length > 0) {
        console.log(`\nPartial match for '${slug}':`);
        partial.rows.forEach(p => console.log(`  ${p.name} (${p.slug}) id=${p.id}`));
      } else {
        console.log(`\nNOT FOUND: ${slug}`);
      }
    }
  }

  // Total stats
  const total = await db.query('SELECT COUNT(*) FROM aegisky_brands');
  const withArticles = await db.query('SELECT COUNT(DISTINCT brand_id) FROM brand_articles');
  console.log(`\nTotal brands: ${total.rows[0].count}, with articles: ${withArticles.rows[0].count}, without: ${total.rows[0].count - withArticles.rows[0].count}`);

  await db.end();
}

checkBrands().catch(console.error);
