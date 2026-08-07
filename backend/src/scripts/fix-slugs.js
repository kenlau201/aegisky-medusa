const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Fix slugs in products
  const r1 = await c.query(`
    UPDATE aegisky_products SET slug = REGEXP_REPLACE(slug, 'copterparts', 'aegisky', 'gi')
    WHERE slug ILIKE '%copterparts%'
  `);
  console.log(`Product slugs updated: ${r1.rowCount}`);

  // Fix slugs in categories
  const r2 = await c.query(`
    UPDATE aegisky_categories SET
      slug = REGEXP_REPLACE(slug, 'copterparts', 'aegisky', 'gi'),
      path = REGEXP_REPLACE(path::text, 'copterparts', 'aegisky', 'gi')::jsonb
    WHERE slug ILIKE '%copterparts%' OR path::text ILIKE '%copterparts%'
  `);
  console.log(`Category slugs/paths updated: ${r2.rowCount}`);

  // Also fix any remaining text fields case-insensitively across ALL columns
  // This catches anything we might have missed
  const columns = ['name', 'description', 'short_description', 'permalink', 'sku'];
  for (const col of columns) {
    await c.query(`
      UPDATE aegisky_products SET "${col}" = REGEXP_REPLACE("${col}", 'copterparts\\.ru', 'aegisky.com', 'gi')
      WHERE "${col}" ILIKE '%copterparts%'
    `);
    await c.query(`
      UPDATE aegisky_products SET "${col}" = REGEXP_REPLACE("${col}", 'copterparts', 'aegisky', 'gi')
      WHERE "${col}" ILIKE '%copterparts%'
    `);
  }

  // JSONB columns - do a full text replace on the serialized JSON
  const jsonbCols = ['categories', 'brands', 'tags', 'attributes', 'images', 'videos'];
  for (const col of jsonbCols) {
    await c.query(`
      UPDATE aegisky_products SET "${col}" = REGEXP_REPLACE("${col}"::text, 'copterparts\\.ru', 'aegisky.com', 'gi')::jsonb
      WHERE "${col}"::text ILIKE '%copterparts%'
    `);
    await c.query(`
      UPDATE aegisky_products SET "${col}" = REGEXP_REPLACE("${col}"::text, 'copterparts', 'aegisky', 'gi')::jsonb
      WHERE "${col}"::text ILIKE '%copterparts%'
    `);
  }

  // Final verification
  const total = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products
    WHERE name ILIKE '%copterparts%' OR description ILIKE '%copterparts%'
       OR short_description ILIKE '%copterparts%' OR permalink ILIKE '%copterparts%'
       OR slug ILIKE '%copterparts%' OR sku ILIKE '%copterparts%'
       OR categories::text ILIKE '%copterparts%' OR brands::text ILIKE '%copterparts%'
       OR tags::text ILIKE '%copterparts%' OR attributes::text ILIKE '%copterparts%'
       OR images::text ILIKE '%copterparts%' OR videos::text ILIKE '%copterparts%'`);
  console.log(`\nTotal remaining in products: ${total.rows[0].cnt}`);

  const catTotal = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_categories
    WHERE name ILIKE '%copterparts%' OR slug ILIKE '%copterparts%'
       OR description ILIKE '%copterparts%' OR path::text ILIKE '%copterparts%'
       OR image_url ILIKE '%copterparts%'`);
  console.log(`Remaining in categories: ${catTotal.rows[0].cnt}`);

  // Re-export
  const fs = require('fs');
  const path = require('path');
  const ROOT = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa';

  const prods = await c.query(`SELECT * FROM aegisky_products ORDER BY id`);
  const cats = await c.query(`SELECT * FROM aegisky_categories ORDER BY id`);
  const brands = await c.query(`SELECT * FROM aegisky_brands ORDER BY id`);

  for (const p of [path.join(ROOT, 'data', 'mirror', 'products.json'), path.join(ROOT, 'storefront', 'data', 'products.json')]) {
    fs.writeFileSync(p, JSON.stringify(prods.rows, null, 2), 'utf8');
  }
  for (const cp of [path.join(ROOT, 'data', 'mirror', 'categories.json'), path.join(ROOT, 'storefront', 'data', 'categories.json')]) {
    fs.writeFileSync(cp, JSON.stringify(cats.rows, null, 2), 'utf8');
  }
  for (const bp of [path.join(ROOT, 'data', 'mirror', 'brands.json'), path.join(ROOT, 'storefront', 'data', 'brands.json')]) {
    fs.writeFileSync(bp, JSON.stringify(brands.rows, null, 2), 'utf8');
  }

  // Verify exported files
  console.log('\n--- Exported file verification ---');
  for (const fp of [
    path.join(ROOT, 'data', 'mirror', 'products.json'),
    path.join(ROOT, 'storefront', 'data', 'products.json'),
    path.join(ROOT, 'data', 'mirror', 'categories.json'),
    path.join(ROOT, 'storefront', 'data', 'categories.json'),
    path.join(ROOT, 'data', 'mirror', 'brands.json'),
  ]) {
    const raw = fs.readFileSync(fp, 'utf8');
    const matches = (raw.match(/copterparts/gi) || []).length;
    console.log(`${path.relative(ROOT, fp)}: ${matches} occurrences`);
  }

  await c.end();
  console.log('\n✓ Done!');
})();
