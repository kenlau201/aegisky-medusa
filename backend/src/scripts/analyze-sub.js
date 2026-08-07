const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Get all categories with product counts
  const cats = await c.query(`
    SELECT id, name, slug, parent, product_count
    FROM aegisky_categories WHERE id >= 10000
    ORDER BY parent, product_count DESC
  `);

  const byId = {};
  for (const cat of cats.rows) byId[cat.id] = cat;

  // Print tree with counts
  console.log('=== CURRENT CATEGORY TREE WITH COUNTS ===\n');
  function printTree(parentId, depth) {
    const children = cats.rows.filter(c => c.parent === parentId).sort((a,b) => b.product_count - a.product_count);
    for (const child of children) {
      const indent = '  '.repeat(depth);
      console.log(`${indent}[${child.id}] ${child.name}: ${child.product_count}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  // Analyze product names in large categories to find subcategories
  console.log('\n=== ANALYZING LARGE CATEGORIES FOR SUBDIVISION ===\n');

  const largeCats = [
    { id: 10002, name: 'FPV Racing & Freestyle Drones' },
    { id: 10003, name: 'Industrial Quadcopters' },
    { id: 10015, name: 'Brushless Motors' },
    { id: 10016, name: 'ESC' },
    { id: 10021, name: 'Servo Motors & Actuators' },
    { id: 10023, name: 'Flight Controllers & Autopilots' },
    { id: 10027, name: 'RC Transmitters' },
    { id: 10028, name: 'RC Receivers' },
    { id: 10029, name: 'Antennas' },
    { id: 10030, name: 'Video Transmitters (VTX)' },
    { id: 10032, name: 'Two-Way Radios & Walkie-Talkies' },
    { id: 10034, name: 'FPV Goggles' },
    { id: 10038, name: 'FPV & Action Cameras' },
    { id: 10043, name: 'Thermal Imaging Cameras' },
    { id: 10046, name: 'Gimbal Stabilizers' },
    { id: 10047, name: 'Counter-UAV & Anti-Drone Systems' },
    { id: 10049, name: 'LiPo/Li-ion Batteries' },
    { id: 10050, name: 'Battery Chargers' },
    { id: 10054, name: 'Drone Frames' },
    { id: 10057, name: 'ICs, Chips & Modules' },
    { id: 10061, name: 'Single-Board Computers' },
    { id: 10062, name: 'Robotics Systems' },
    { id: 10064, name: 'Assembly & Soldering Tools' },
    { id: 10066, name: 'Accessories' },
    { id: 10067, name: 'Lighting & Illumination' },
    { id: 10004, name: 'Russian-Made Drones' },
  ];

  for (const lc of largeCats) {
    if (lc.product_count < 30) continue;
    // Get sample product names
    const products = await c.query(`
      SELECT name FROM aegisky_products
      WHERE categories @> '[{"id": ${lc.id}}]'::jsonb
      ORDER BY name
    `);
    console.log(`\n--- ${lc.name} (${products.rowCount} products) ---`);
    // Show first 20 names to find patterns
    const names = products.rows.map(p => p.name).filter(Boolean);
    names.slice(0, 15).forEach(n => console.log(`  ${n.substring(0, 80)}`));
  }

  await c.end();
})();
