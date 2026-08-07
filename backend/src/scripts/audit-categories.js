const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // 1. Check total products
  const totalProd = await c.query('SELECT COUNT(*) as cnt FROM aegisky_products');
  console.log('=== TOTAL PRODUCTS:', totalProd.rows[0].cnt, '===');

  // 2. Check products mapped to new categories (id >= 10000)
  const mappedToNew = await c.query(`
    SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(p.categories) AS cat
      WHERE (cat->>'id')::int >= 10000
    )
  `);
  console.log('Products mapped to NEW categories:', mappedToNew.rows[0].cnt);

  // 3. Products NOT mapped to any new category
  const notMapped = await c.query(`
    SELECT p.id, p.name, p.sku, p.categories FROM aegisky_products p
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p.categories) AS cat
      WHERE (cat->>'id')::int >= 10000
    )
    LIMIT 20
  `);
  console.log('Products NOT mapped to new categories:', notMapped.rows.length);
  if (notMapped.rows.length > 0) {
    console.log('Sample unmapped products:');
    notMapped.rows.forEach(p => {
      const catIds = (p.categories || []).map(cat => cat.id || cat.name).join(', ');
      console.log(`  [${p.id}] ${p.name?.substring(0, 60)} | cats: ${catIds}`);
    });
  }

  // 4. Count products mapped to old categories only
  const oldOnly = await c.query(`
    SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(p.categories) AS cat
      WHERE (cat->>'id')::int < 10000
    )
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p.categories) AS cat
      WHERE (cat->>'id')::int >= 10000
    )
  `);
  console.log('Products mapped ONLY to old categories:', oldOnly.rows[0].cnt);

  // 5. New categories with actual product counts
  console.log('\n=== NEW CATEGORIES (id >= 10000) - Actual vs Stored ===');
  const newCats = await c.query(`
    SELECT id, name, slug, parent, product_count, depth FROM aegisky_categories
    WHERE id >= 10000
    ORDER BY id
  `);
  
  let mismatches = 0;
  let totalNewCatProducts = 0;
  
  for (const cat of newCats.rows) {
    // Count products in this category AND its children
    const actual = await c.query(`
      WITH RECURSIVE cat_tree AS (
        SELECT id FROM aegisky_categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM aegisky_categories c INNER JOIN cat_tree ct ON c.parent = ct.id
      )
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(p.categories) AS cat
        WHERE (cat->>'id')::int IN (SELECT id FROM cat_tree)
      )
    `, [cat.id]);
    
    const actualCount = parseInt(actual.rows[0].cnt);
    totalNewCatProducts = Math.max(totalNewCatProducts, actualCount);
    
    // Direct products (not via children)
    const direct = await c.query(`
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(p.categories) AS cat
        WHERE (cat->>'id')::int = $1
      )
    `, [cat.id]);
    const directCount = parseInt(direct.rows[0].cnt);
    
    const diff = actualCount - cat.product_count;
    if (Math.abs(diff) > 0 && cat.depth <= 1) {
      console.log(`  [${cat.id}] ${cat.name}: stored=${cat.product_count}, actual(with children)=${actualCount}, direct=${directCount} ${diff !== 0 ? '⚠️ MISMATCH' : ''}`);
      mismatches++;
    }
  }
  
  console.log(`\nTotal new categories: ${newCats.rows.length}`);
  console.log(`Categories with count mismatches (depth<=1): ${mismatches}`);

  // 6. List root categories (depth=0) with counts
  console.log('\n=== ROOT CATEGORIES (depth=0) ===');
  const roots = newCats.rows.filter(c => c.parent === 0);
  for (const r of roots) {
    const actual = await c.query(`
      WITH RECURSIVE cat_tree AS (
        SELECT id FROM aegisky_categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM aegisky_categories c INNER JOIN cat_tree ct ON c.parent = ct.id
      )
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(p.categories) AS cat
        WHERE (cat->>'id')::int IN (SELECT id FROM cat_tree)
      )
    `, [r.id]);
    console.log(`  [${r.id}] ${r.name}: ${actual.rows[0].cnt} products`);
  }

  await c.end();
})();
