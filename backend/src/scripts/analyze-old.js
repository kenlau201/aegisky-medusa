const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check tables
  const tables = await c.query("SELECT tablename FROM pg_tables WHERE tablename LIKE 'aegisky%' ORDER BY tablename");
  console.log('=== TABLES ===');
  tables.rows.forEach(r => console.log('  ' + r.tablename));

  // Check backup table
  try {
    const backup = await c.query('SELECT COUNT(*) as cnt FROM aegisky_product_categories_backup');
    console.log('\nBackup table rows: ' + backup.rows[0].cnt);
  } catch(e) {
    console.log('\nNo backup table: ' + e.message);
  }

  // Get all root categories (parent=0) with their direct product counts
  // We need to count from the original data - check if products still have old category IDs
  // Actually products.categories was updated. Let's check what's in there now
  const sample = await c.query('SELECT id, name, categories FROM aegisky_products LIMIT 1');
  if (sample.rows.length > 0) {
    console.log('\nSample product categories:');
    console.log(JSON.stringify(sample.rows[0].categories, null, 2));
  }

  // Get all old root categories that are NOT brands
  // A root category is a product type if it has children that are brands
  const roots = await c.query(`
    SELECT id, name, slug,
      (SELECT COUNT(*) FROM aegisky_categories child WHERE child.parent = p.id) as child_count
    FROM aegisky_categories p
    WHERE p.parent = 0 AND p.id < 10000
    ORDER BY p.name
  `);

  console.log('\n=== OLD ROOT CATEGORIES (product types) ===');
  console.log('Total: ' + roots.rows.length);
  roots.rows.forEach(r => {
    console.log(`  [${r.id}] ${r.name} (${r.slug}) - ${r.child_count} children`);
  });

  await c.end();
})();
