const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check backup table structure
  const cols = await c.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'aegisky_product_categories_backup'
  `);
  console.log('=== BACKUP TABLE COLUMNS ===');
  cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

  // Sample data
  const sample = await c.query('SELECT * FROM aegisky_product_categories_backup LIMIT 5');
  console.log('\n=== SAMPLE ===');
  console.log(JSON.stringify(sample.rows, null, 2));

  // Count products in backup
  const prodCount = await c.query('SELECT COUNT(DISTINCT product_id) as cnt FROM aegisky_product_categories_backup');
  console.log('\nProducts with old category links: ' + prodCount.rows[0].cnt);

  // Get all non-brand categories with product counts from backup
  // First, identify which categories are brands (children of product types that are brand names)
  const brandCats = await c.query(`
    SELECT DISTINCT c.id, c.name, c.slug, c.parent
    FROM aegisky_categories c
    WHERE c.parent IN (
      SELECT id FROM aegisky_categories WHERE parent = 0
    )
    AND c.id < 10000
  `);

  // Get product counts per category from backup
  const catCounts = await c.query(`
    SELECT category_id, COUNT(DISTINCT product_id) as prod_count
    FROM aegisky_product_categories_backup
    GROUP BY category_id
    ORDER BY prod_count DESC
  `);

  console.log('\n=== CATEGORIES WITH PRODUCT COUNTS (from backup) ===');
  const catMap = {};
  for (const row of catCounts.rows) {
    const cat = await c.query('SELECT id, name, slug, parent FROM aegisky_categories WHERE id = $1', [row.category_id]);
    if (cat.rows.length > 0) {
      const c2 = cat.rows[0];
      catMap[c2.id] = { ...c2, count: parseInt(row.prod_count) };
    }
  }

  // Print root categories with counts
  const roots = await c.query('SELECT id, name, slug FROM aegisky_categories WHERE parent = 0 AND id < 10000 ORDER BY name');
  console.log('\n=== ROOT PRODUCT TYPE CATEGORIES ===');
  for (const r of roots.rows) {
    const count = catMap[r.id]?.count || 0;
    if (count > 0) {
      console.log(`  [${r.id}] ${r.name} (${r.slug}): ${count} products`);
    }
  }

  await c.end();
})();
