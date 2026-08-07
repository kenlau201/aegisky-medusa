const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check Security & Inspection Drones (10128) - 267 products, seems too many
  console.log('=== Security & Inspection Drones (10128) - first 30 ===');
  const sec = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10128}]'::jsonb
    ORDER BY id LIMIT 30
  `);
  for (const p of sec.rows) {
    console.log(`  [${p.id}] ${(p.name||'').substring(0, 70)}`);
  }

  // Check how many are actually drones vs components
  const drones = await c.query(`
    SELECT COUNT(*) as cnt FROM aegisky_products
    WHERE categories @> '[{"id": 10128}]'::jsonb
    AND (name ILIKE '%квадрокоптер%' OR name ILIKE '%дрон%' OR name ILIKE '%drone%' OR name ILIKE '%коптер%')
  `);
  console.log(`\n  Actually drones/quadcopters: ${drones.rows[0].cnt}`);

  // Check Sensors & IMU Modules (10151) - 327 products
  console.log('\n=== Sensors & IMU Modules (10151) - sample ===');
  const sensors = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10151}]'::jsonb
    ORDER BY id LIMIT 20
  `);
  for (const p of sensors.rows) {
    console.log(`  [${p.id}] ${(p.name||'').substring(0, 70)}`);
  }

  // Check FPV & Action Cameras (10038) - 284 products
  console.log('\n=== FPV & Action Cameras (10038) - sample ===');
  const cams = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10038}]'::jsonb
    ORDER BY id LIMIT 20
  `);
  for (const p of cams.rows) {
    console.log(`  [${p.id}] ${(p.name||'').substring(0, 70)}`);
  }

  // Check what's in Other RC Receivers (10096) - 133 products
  console.log('\n=== Other RC Receivers (10096) - sample ===');
  const rx = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10096}]'::jsonb
    ORDER BY id LIMIT 15
  `);
  for (const p of rx.rows) {
    console.log(`  [${p.id}] ${(p.name||'').substring(0, 70)}`);
  }

  await c.end();
})();
