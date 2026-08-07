const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  const cats = await c.query(`
    SELECT id, name, slug, parent, product_count
    FROM aegisky_categories WHERE id >= 10000
    ORDER BY parent, id
  `);

  console.log(`Total new categories: ${cats.rows.length}\n`);

  function printTree(parentId, depth) {
    const children = cats.rows.filter(c => c.parent === parentId);
    for (const child of children) {
      console.log(`${'  '.repeat(depth)}[${child.id}] ${child.name}: ${child.product_count}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  // Check products without categories
  const uncat = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE jsonb_array_length(categories) = 0 OR categories IS NULL`);
  console.log(`\nUncategorized products: ${uncat.rows[0].cnt}`);

  // Total products
  const total = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products`);
  console.log(`Total products: ${total.rows[0].cnt}`);

  await c.end();
})();
