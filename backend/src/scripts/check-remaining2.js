const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Find which field still has it
  const fields = ['name', 'description', 'short_description', 'permalink', 'categories::text', 'brands::text', 'tags::text', 'attributes::text'];
  for (const f of fields) {
    const r = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE ${f} ILIKE '%copterparts%'`);
    if (parseInt(r.rows[0].cnt) > 0) {
      console.log(`${f}: ${r.rows[0].cnt}`);
      const sample = await c.query(`SELECT id, ${f} as val FROM aegisky_products WHERE ${f} ILIKE '%copterparts%' LIMIT 3`);
      sample.rows.forEach(s => console.log(`  [${s.id}] ${String(s.val).substring(0, 300)}`));
    }
  }

  await c.end();
})();
