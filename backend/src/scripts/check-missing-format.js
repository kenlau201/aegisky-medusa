const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Load original data
  const origFile = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\data\\mirror\\products_backup_before_cleanup.json';
  const origArr = JSON.parse(fs.readFileSync(origFile, 'utf8'));
  const origMap = new Map(origArr.map(p => [Number(p.id), p]));

  const missingIds = [75763, 63439, 63147, 63139, 63131, 63123, 26064, 25583, 8522];

  // Check image format in original data for these products
  console.log('=== Image paths in original data for missing products ===');
  for (const id of missingIds) {
    const p = origMap.get(id);
    console.log(`\n[${id}] ${p.name.substring(0, 60)}`);
    console.log(`  images field: ${JSON.stringify(p.images).substring(0, 300)}`);
    console.log(`  main_image: ${p.main_image}`);
    if (p.videos) console.log(`  videos: ${JSON.stringify(p.videos).substring(0, 100)}`);
  }

  // Check table columns
  const cols = await c.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'aegisky_products' 
    ORDER BY ordinal_position
  `);
  console.log('\n=== Table columns ===');
  console.log(cols.rows.map(r => r.column_name).join(', '));

  // Check a sample existing product to see the exact format
  const sample = await c.query('SELECT * FROM aegisky_products WHERE id = 63146');
  if (sample.rows.length > 0) {
    console.log('\n=== Sample existing product (63146) ===');
    for (const [key, val] of Object.entries(sample.rows[0])) {
      const display = typeof val === 'string' && val.length > 100 ? val.substring(0, 100) + '...' : val;
      console.log(`  ${key}: ${display}`);
    }
  }

  await c.end();
})();
