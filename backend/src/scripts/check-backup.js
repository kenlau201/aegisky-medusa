const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check backup table
  const backupInfo = await c.query(`
    SELECT 
      (SELECT COUNT(*) FROM aegisky_product_categories_backup) as backup_count,
      (SELECT COUNT(*) FROM aegisky_categories WHERE id < 10000) as old_cats,
      (SELECT COUNT(*) FROM aegisky_categories WHERE id >= 10000) as new_cats,
      (SELECT COUNT(*) FROM aegisky_products) as total_products
  `);
  console.log('Backup count:', backupInfo.rows[0].backup_count);
  console.log('Old categories (<10000):', backupInfo.rows[0].old_cats);
  console.log('New categories (>=10000):', backupInfo.rows[0].new_cats);
  console.log('Total products:', backupInfo.rows[0].total_products);

  // Check backup table structure
  const cols = await c.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'aegisky_product_categories_backup' ORDER BY ordinal_position
  `);
  console.log('\nBackup table columns:', cols.rows.map(r => r.column_name).join(', '));

  // Sample backup data
  const sample = await c.query(`SELECT * FROM aegisky_product_categories_backup LIMIT 3`);
  console.log('\nSample backup data:');
  for (const row of sample.rows) {
    console.log(' ', JSON.stringify(row).substring(0, 200));
  }

  // Check a sample product's current categories
  const prod = await c.query(`SELECT id, name, categories FROM aegisky_products WHERE id = 17101`);
  if (prod.rows[0]) {
    console.log('\nProduct 17101 (EFT Z30 agricultural drone):');
    console.log('  Current categories:', JSON.stringify(prod.rows[0].categories));
  }

  await c.end();
})();
