const { Client } = require('pg');
(async () => {
  const c = new Client({ host:'localhost', port:5434, user:'medusa', password:'medusa_password', database:'medusa-aegisky' });
  await c.connect();
  
  const categorySlug = 'propulsion-systems';
  
  // Test the recursive CTE exactly as in the API
  const catResult = await c.query(
    'WITH RECURSIVE cat_tree AS (SELECT id, parent FROM aegisky_categories WHERE slug = $1 UNION ALL SELECT c.id, c.parent FROM aegisky_categories c INNER JOIN cat_tree ct ON c.parent = ct.id) SELECT id FROM cat_tree',
    [categorySlug]
  );
  const catIds = catResult.rows.map(r => r.id);
  console.log('Category IDs from CTE:', catIds);
  console.log('Count:', catIds.length);
  
  if (catIds.length > 0) {
    // Test the product query
    const products = await c.query(
      `SELECT id, name FROM aegisky_products 
       WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($1::int[]))
       LIMIT 3`,
      [catIds]
    );
    console.log('\nProducts found:', products.rows.length);
    products.rows.forEach(p => console.log('  -', p.name));
  }
  
  await c.end();
})();
