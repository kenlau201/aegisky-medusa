const { Client } = require('pg');
(async () => {
  const c = new Client({ host:'localhost', port:5434, user:'medusa', password:'medusa_password', database:'medusa-aegisky' });
  await c.connect();
  
  // Check category by slug
  const cat = await c.query("SELECT id, name, slug FROM aegisky_categories WHERE slug = 'propulsion-systems'");
  console.log('Category:', cat.rows[0]);
  
  // Check recursive children
  const tree = await c.query(`
    WITH RECURSIVE cat_tree AS (
      SELECT id, parent FROM aegisky_categories WHERE slug = 'propulsion-systems'
      UNION ALL
      SELECT c.id, c.parent FROM aegisky_categories c INNER JOIN cat_tree ct ON c.parent = ct.id
    ) SELECT id FROM cat_tree
  `);
  console.log('Category tree IDs:', tree.rows.map(r => r.id));
  
  // Check products via aegisky_product_categories
  const pcCount = await c.query(`
    SELECT COUNT(DISTINCT product_id) as cnt FROM aegisky_product_categories WHERE category_id = ANY($1)
  `, [tree.rows.map(r => r.id)]);
  console.log('Products via association table:', pcCount.rows[0].cnt);
  
  // Check products via JSONB
  const jsonCount = await c.query(`
    SELECT COUNT(*) as cnt FROM aegisky_products p
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(p.categories) AS cat
      WHERE (cat->>'id')::int = ANY($1)
    )
  `, [tree.rows.map(r => r.id)]);
  console.log('Products via JSONB:', jsonCount.rows[0].cnt);
  
  // Sample product categories
  const sample = await c.query("SELECT id, name, categories FROM aegisky_products LIMIT 1");
  console.log('\nSample product categories JSONB:', JSON.stringify(sample.rows[0].categories, null, 2));
  
  await c.end();
})();
