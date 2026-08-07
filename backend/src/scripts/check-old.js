const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });
(async () => {
  await c.connect();
  // Show old root categories
  const r = await c.query("SELECT id, name, slug, parent FROM aegisky_categories WHERE id < 10000 AND parent = 0 ORDER BY id");
  console.log('Old root categories:');
  for (const row of r.rows) {
    console.log(`  [${row.id}] ${row.name} | slug: ${row.slug}`);
  }
  // Count old categories
  const cnt = await c.query("SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id < 10000");
  console.log(`\nTotal old categories: ${cnt.rows[0].cnt}`);
  await c.end();
})();
