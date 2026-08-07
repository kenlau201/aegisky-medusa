const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa';

(async () => {
  const client = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });
  await client.connect();

  // Verify no copterparts remains
  const p = await client.query(`SELECT COUNT(*) c FROM aegisky_products WHERE description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%'`);
  const c = await client.query(`SELECT COUNT(*) c FROM aegisky_categories WHERE description ILIKE '%copterparts%'`);
  console.log(`Remaining in products: ${p.rows[0].c}, categories: ${c.rows[0].c}`);

  // Export products
  const prods = await client.query(`SELECT * FROM aegisky_products ORDER BY id`);
  const prodData = prods.rows;
  const prodPaths = [
    path.join(ROOT, 'data', 'mirror', 'products.json'),
    path.join(ROOT, 'storefront', 'data', 'products.json'),
  ];
  for (const p of prodPaths) {
    fs.writeFileSync(p, JSON.stringify(prodData, null, 2), 'utf8');
    console.log(`Products: ${path.basename(path.dirname(path.dirname(p)))}/${path.basename(path.dirname(p))}/products.json (${prodData.length})`);
  }

  // Export categories
  const cats = await client.query(`SELECT * FROM aegisky_categories ORDER BY id`);
  const catPaths = [
    path.join(ROOT, 'data', 'mirror', 'categories.json'),
    path.join(ROOT, 'storefront', 'data', 'categories.json'),
  ];
  for (const cp of catPaths) {
    fs.writeFileSync(cp, JSON.stringify(cats.rows, null, 2), 'utf8');
    console.log(`Categories: ${path.relative(ROOT, cp)} (${cats.rows.length})`);
  }

  // Export brands
  const brands = await client.query(`SELECT * FROM aegisky_brands ORDER BY id`);
  const brandPaths = [
    path.join(ROOT, 'data', 'mirror', 'brands.json'),
    path.join(ROOT, 'storefront', 'data', 'brands.json'),
  ];
  for (const bp of brandPaths) {
    fs.writeFileSync(bp, JSON.stringify(brands.rows, null, 2), 'utf8');
    console.log(`Brands: ${path.relative(ROOT, bp)} (${brands.rows.length})`);
  }

  // Final verification in exported files
  console.log('\n--- Verification in exported files ---');
  for (const fp of [...prodPaths, ...catPaths, ...brandPaths]) {
    const raw = fs.readFileSync(fp, 'utf8');
    const matches = (raw.match(/copterparts/gi) || []).length;
    console.log(`${path.relative(ROOT, fp)}: ${matches} occurrences`);
  }

  await client.end();
})();
