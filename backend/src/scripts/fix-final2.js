const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Case-insensitive replace in name
  const r1 = await c.query(`
    UPDATE aegisky_products SET name = REGEXP_REPLACE(name, 'copterparts', 'Aegisky', 'gi')
    WHERE name ILIKE '%copterparts%'
  `);
  console.log(`Names updated: ${r1.rowCount}`);

  // Also do case-insensitive replace in all text fields to catch any remaining variants
  await c.query(`
    UPDATE aegisky_products SET
      description = REGEXP_REPLACE(description, 'copterparts\.ru', 'aegisky.com', 'gi'),
      short_description = REGEXP_REPLACE(short_description, 'copterparts\.ru', 'aegisky.com', 'gi')
    WHERE description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%'
  `);
  await c.query(`
    UPDATE aegisky_products SET
      description = REGEXP_REPLACE(description, 'copterparts', 'aegisky', 'gi'),
      short_description = REGEXP_REPLACE(short_description, 'copterparts', 'aegisky', 'gi')
    WHERE description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%'
  `);

  // Final count
  const total = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products
    WHERE name ILIKE '%copterparts%' OR description ILIKE '%copterparts%'
       OR short_description ILIKE '%copterparts%' OR permalink ILIKE '%copterparts%'
       OR categories::text ILIKE '%copterparts%' OR brands::text ILIKE '%copterparts%'
       OR tags::text ILIKE '%copterparts%' OR attributes::text ILIKE '%copterparts%'`);
  console.log(`Total remaining in products: ${total.rows[0].cnt}`);

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
