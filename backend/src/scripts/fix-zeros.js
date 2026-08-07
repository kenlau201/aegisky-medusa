const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check Military category products
  console.log('=== Military & Defense UAV products ===');
  const mil = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10074}]'::jsonb
    ORDER BY name
  `);
  for (const p of mil.rows) {
    const cats = await c.query(`SELECT id FROM jsonb_array_elements(categories) AS c WHERE (c->>'id')::int IN (10075,10076,10077,10078,10079,10119,10120,10121,10122)`);
    const subIds = cats.rows.map(r => r.id);
    console.log(`  [${p.id}] ${p.name?.substring(0, 70)} | subs: ${subIds.join(',')}`);
  }

  // Check what products are in 5" monitors category
  console.log('\n=== Products that should be 5" FPV Monitors ===');
  const monitors = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10035}]'::jsonb
    ORDER BY name
  `);
  for (const p of monitors.rows) {
    console.log(`  [${p.id}] ${p.name?.substring(0, 80)}`);
  }

  // Check strobe/light products
  console.log('\n=== Lighting products (first 30) ===');
  const lights = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10067}]'::jsonb
    ORDER BY name
  `);
  for (const p of lights.rows.slice(0, 30)) {
    console.log(`  [${p.id}] ${p.name?.substring(0, 80)}`);
  }

  // Check heat gun/rework products
  console.log('\n=== Tools products (first 30) ===');
  const tools = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10064}]'::jsonb
    ORDER BY name
  `);
  for (const p of tools.rows.slice(0, 30)) {
    console.log(`  [${p.id}] ${p.name?.substring(0, 80)}`);
  }

  await c.end();
})();
