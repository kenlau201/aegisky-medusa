const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check all categories >= 10000
  const cats = await c.query(`
    SELECT id, name, slug, parent, product_count
    FROM aegisky_categories WHERE id >= 10000
    ORDER BY id
  `);

  console.log('=== ALL CATEGORIES (ID >= 10000) ===\n');
  for (const cat of cats.rows) {
    const parentName = cat.parent > 0 ? (cats.rows.find(p => p.id === cat.parent)?.name || '?') : '(root)';
    console.log(`[${cat.id}] ${cat.name} | parent: ${parentName} | products: ${cat.product_count} | slug: ${cat.slug}`);
  }

  // Check how many products have categories
  const total = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products`);
  const withCats = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE jsonb_array_length(categories) > 0`);
  console.log(`\nTotal products: ${total.rows[0].cnt}, with categories: ${withCats.rows[0].cnt}`);

  // Check products in Russian-Made Drones that might be military
  console.log('\n=== Russian-Made Drones product names (first 30) ===');
  const rusDrones = await c.query(`
    SELECT id, name, price FROM aegisky_products
    WHERE categories @> '[{"id": 10004}]'::jsonb
    ORDER BY price DESC NULLS LAST
  `);
  for (const p of rusDrones.rows.slice(0, 30)) {
    console.log(`  [${p.id}] ${p.name?.substring(0, 80)} - ${p.price}`);
  }

  // Check products in current Military category
  console.log('\n=== Current Military & Defense products ===');
  const milDrones = await c.query(`
    SELECT id, name, price FROM aegisky_products
    WHERE categories @> '[{"id": 10074}]'::jsonb
    ORDER BY price DESC NULLS LAST
  `);
  for (const p of milDrones.rows) {
    console.log(`  [${p.id}] ${p.name?.substring(0, 80)} - ${p.price}`);
  }

  await c.end();
})();
