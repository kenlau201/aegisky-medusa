const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check each field
  const fields = ['description', 'short_description', 'categories::text', 'brands::text', 'tags::text', 'attributes::text', 'permalink', 'name'];
  for (const f of fields) {
    const r = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE ${f} ILIKE '%copterparts%'`);
    if (parseInt(r.rows[0].cnt) > 0) {
      console.log(`${f}: ${r.rows[0].cnt}`);
      const sample = await c.query(`SELECT id, ${f} as val FROM aegisky_products WHERE ${f} ILIKE '%copterparts%' LIMIT 2`);
      sample.rows.forEach(s => console.log(`  [${s.id}] ${String(s.val).substring(0, 250)}`));
    }
  }

  // Check category id 6393
  const cat6393 = await c.query(`SELECT id, name, slug FROM aegisky_categories WHERE id = 6393 OR name ILIKE '%copterparts%' OR slug ILIKE '%copterparts%'`);
  console.log('\nCategories with copterparts:', cat6393.rows.length);
  cat6393.rows.forEach(r => console.log(`  [${r.id}] ${r.name} (${r.slug})`));

  await c.end();
})();
