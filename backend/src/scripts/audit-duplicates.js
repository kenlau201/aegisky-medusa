const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // 1. Total count
  const total = await c.query('SELECT COUNT(*) as cnt FROM aegisky_products');
  console.log(`=== Total products in DB: ${total.rows[0].cnt} ===\n`);

  // 2. Duplicate IDs
  const dupIds = await c.query(`
    SELECT id, COUNT(*) as cnt 
    FROM aegisky_products 
    GROUP BY id HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);
  console.log(`Duplicate IDs: ${dupIds.rows.length}`);
  if (dupIds.rows.length > 0) {
    dupIds.rows.slice(0, 20).forEach(r => console.log(`  ID ${r.id}: ${r.cnt} times`));
  }

  // 3. Duplicate SKUs
  const dupSkus = await c.query(`
    SELECT sku, COUNT(*) as cnt 
    FROM aegisky_products 
    WHERE sku IS NOT NULL AND sku != ''
    GROUP BY sku HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);
  console.log(`\nDuplicate SKUs: ${dupSkus.rows.length}`);
  if (dupSkus.rows.length > 0) {
    dupSkus.rows.slice(0, 20).forEach(r => console.log(`  SKU "${r.sku}": ${r.cnt} times`));
  }

  // 4. Duplicate slugs
  const dupSlugs = await c.query(`
    SELECT slug, COUNT(*) as cnt 
    FROM aegisky_products 
    WHERE slug IS NOT NULL AND slug != ''
    GROUP BY slug HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);
  console.log(`\nDuplicate slugs: ${dupSlugs.rows.length}`);
  if (dupSlugs.rows.length > 0) {
    dupSlugs.rows.slice(0, 20).forEach(r => console.log(`  Slug "${r.slug}": ${r.cnt} times`));
  }

  // 5. Duplicate permalinks
  const dupPerms = await c.query(`
    SELECT permalink, COUNT(*) as cnt 
    FROM aegisky_products 
    WHERE permalink IS NOT NULL AND permalink != ''
    GROUP BY permalink HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);
  console.log(`\nDuplicate permalinks: ${dupPerms.rows.length}`);
  if (dupPerms.rows.length > 0) {
    dupPerms.rows.slice(0, 20).forEach(r => console.log(`  Permalink "${r.permalink.substring(0,80)}": ${r.cnt} times`));
  }

  // 6. Duplicate names (same name)
  const dupNames = await c.query(`
    SELECT name, COUNT(*) as cnt 
    FROM aegisky_products 
    WHERE name IS NOT NULL AND name != ''
    GROUP BY name HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 30
  `);
  console.log(`\nDuplicate names: ${dupNames.rows.length} (showing top 30)`);
  dupNames.rows.forEach(r => console.log(`  "${r.name.substring(0,70)}": ${r.cnt} times`));

  // 7. ID range
  const idRange = await c.query('SELECT MIN(id) as min_id, MAX(id) as max_id FROM aegisky_products');
  console.log(`\nID range: ${idRange.rows[0].min_id} - ${idRange.rows[0].max_id}`);

  // 8. Null/empty fields
  const nulls = await c.query(`
    SELECT 
      COUNT(*) FILTER (WHERE sku IS NULL OR sku = '') as no_sku,
      COUNT(*) FILTER (WHERE slug IS NULL OR slug = '') as no_slug,
      COUNT(*) FILTER (WHERE permalink IS NULL OR permalink = '') as no_permalink,
      COUNT(*) FILTER (WHERE name IS NULL OR name = '') as no_name,
      COUNT(*) FILTER (WHERE price IS NULL) as no_price
    FROM aegisky_products
  `);
  console.log(`\nEmpty fields:`);
  console.log(`  No SKU: ${nulls.rows[0].no_sku}`);
  console.log(`  No slug: ${nulls.rows[0].no_slug}`);
  console.log(`  No permalink: ${nulls.rows[0].no_permalink}`);
  console.log(`  No name: ${nulls.rows[0].no_name}`);
  console.log(`  No price: ${nulls.rows[0].no_price}`);

  await c.end();
})();
