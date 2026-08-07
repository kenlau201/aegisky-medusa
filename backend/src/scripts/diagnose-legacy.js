const { Client } = require('pg');
const slug = decodeURIComponent('%D0%BF%D1%83%D0%BB%D1%8C%D1%82%D1%8B-%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F');
console.log('Decoded slug:', slug);

const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });
(async () => {
  await c.connect();
  
  // Find old category with this slug
  const r = await c.query('SELECT id, name, slug, parent, product_count FROM aegisky_categories WHERE slug = $1', [slug]);
  if (r.rows.length > 0) {
    console.log('Found category:', JSON.stringify(r.rows[0], null, 2));
    // Count products actually mapped to this category
    const p = await c.query(`SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS cat WHERE (cat->>'id')::int = $1)`, [r.rows[0].id]);
    console.log('Products with this category in JSONB:', p.rows[0].cnt);
  } else {
    console.log('Not found. Searching similar...');
    const r2 = await c.query(`SELECT id, name, slug, product_count FROM aegisky_categories WHERE name LIKE '%Пульт%' OR slug LIKE '%пульт%' LIMIT 10`);
    r2.rows.forEach(r => console.log('  id=' + r.id + ' name=' + r.name + ' slug=' + r.slug + ' count=' + r.product_count));
  }
  
  // Also check: how many old categories (id < 10000) have product_count > 0?
  const old = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id < 10000 AND product_count > 0`);
  console.log('\nOld categories (id<10000) with product_count > 0:', old.rows[0].cnt);
  
  // How many new categories (id >= 10000)?
  const newCats = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id >= 10000`);
  console.log('New categories (id>=10000):', newCats.rows[0].cnt);
  
  // Check total categories
  const total = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_categories`);
  console.log('Total categories:', total.rows[0].cnt);
  
  await c.end();
})();
