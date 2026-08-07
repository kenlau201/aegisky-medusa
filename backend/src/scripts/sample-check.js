const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  const cats = ['brushless-motors', 'esc', 'propellers', 'battery', 'flight-controller',
                'transmitter', 'fpv-goggles', 'thermal-imaging', 'lidar', 'gimbal-system',
                'charger', 'servo-systems', 'antenna-system', 'video-transmitter-vtx',
                'receiver', 'eo-camera', 'fpv-monitor', 'embedded-computer', 'chips',
                'assembly-tools', 'frames', 'solar-energy', 'underwater-robot', 'robotics-systems'];

  for (const slug of cats) {
    const r = await c.query('SELECT id, name FROM aegisky_categories WHERE slug = $1', [slug]);
    if (r.rows.length === 0) { console.log(slug + ': NOT FOUND'); continue; }
    const catId = r.rows[0].id;
    const prods = await c.query(`SELECT name FROM aegisky_products
      WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = $1)
      ORDER BY id LIMIT 3`, [catId]);
    console.log('\n=== ' + r.rows[0].name + ' ===');
    prods.rows.forEach(p => console.log('  - ' + p.name?.substring(0, 75)));
  }

  await c.end();
})();
