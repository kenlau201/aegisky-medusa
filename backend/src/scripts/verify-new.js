const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check actual counts from DB
  const cats = await c.query(`
    SELECT id, name, slug, parent, product_count
    FROM aegisky_categories WHERE id >= 10000
    ORDER BY id
  `);

  console.log('=== ACTUAL COUNTS FROM DB ===\n');
  function printTree(parentId, depth) {
    const children = cats.rows.filter(c => c.parent === parentId);
    for (const child of children) {
      console.log(`${'  '.repeat(depth)}[${child.id}] ${child.name}: ${child.product_count}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  // Verify products have categories
  const sample = await c.query(`
    SELECT id, name, categories FROM aegisky_products
    WHERE jsonb_array_length(categories) > 0
    LIMIT 3
  `);
  console.log('\n=== SAMPLE PRODUCTS ===');
  for (const p of sample.rows) {
    console.log(`[${p.id}] ${p.name?.substring(0, 60)}`);
    console.log('  Categories:', p.categories.map(c => c.name).join(' > '));
  }

  // Total with categories
  const total = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE jsonb_array_length(categories) > 0`);
  console.log(`\nTotal products with categories: ${total.rows[0].cnt}`);

  await c.end();
})();
