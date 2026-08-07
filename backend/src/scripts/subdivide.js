const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

function catJson(id) {
  return `jsonb_build_array(jsonb_build_object('id', ${id}))`;
}

(async () => {
  await c.connect();

  async function removeCategory(productId, catId) {
    await c.query(`
      UPDATE aegisky_products
      SET categories = (
        SELECT jsonb_agg(elem ORDER BY (elem->>'id')::int)
        FROM jsonb_array_elements(categories) AS elem
        WHERE (elem->>'id')::int != $2
      )
      WHERE id = $1 AND categories @> ${catJson(catId)}
    `, [productId, catId]);
  }

  async function addCategory(productId, catId) {
    const parents = [];
    let p = catId;
    while (p) {
      parents.push(p);
      const res = await c.query('SELECT parent FROM aegisky_categories WHERE id = $1', [p]);
      p = res.rows[0]?.parent;
      if (!p || p === 0) break;
    }
    const cats = [];
    for (const cid of [...parents].sort((a,b) => a-b)) {
      const info = await c.query('SELECT id, name, slug FROM aegisky_categories WHERE id = $1', [cid]);
      if (info.rows[0]) cats.push({ id: cid, name: info.rows[0].name, slug: info.rows[0].slug });
    }
    const prod = await c.query('SELECT categories FROM aegisky_products WHERE id = $1', [productId]);
    const existing = prod.rows[0]?.categories || [];
    const existingIds = new Set(existing.map(e => e.id));
    const merged = [...existing];
    for (const cat of cats) {
      if (!existingIds.has(cat.id)) merged.push(cat);
    }
    merged.sort((a,b) => a.id - b.id);
    await c.query('UPDATE aegisky_products SET categories = $1::jsonb WHERE id = $2',
      [JSON.stringify(merged), productId]);
  }

  console.log('=== FIXING MIS-CATEGORIZED PRODUCTS ===\n');

  // 1. Clean Security & Inspection Drones
  console.log('1. Cleaning Security & Inspection Drones...');
  const secProducts = await c.query(`SELECT id, name FROM aegisky_products WHERE categories @> ${catJson(10128)}`);
  let removedSec = 0;
  for (const p of secProducts.rows) {
    const name = (p.name||'').toLowerCase();
    const isDrone = /квадрокоптер|дрон|drone|коптер|беспилотник|uav|quadcopter/.test(name);
    if (!isDrone) { await removeCategory(p.id, 10128); removedSec++; }
  }
  console.log(`   Removed ${removedSec} non-drones`);

  // 2. Clean Sensors
  console.log('2. Cleaning Sensors & IMU Modules...');
  const sensorProducts = await c.query(`SELECT id, name FROM aegisky_products WHERE categories @> ${catJson(10151)}`);
  let removedSensors = 0;
  for (const p of sensorProducts.rows) {
    const name = (p.name||'').toLowerCase();
    if (/видеопередатчик|vtx|радиопередатчик|радиоконтроллер|передатчик и приемник|ремень|ремешок|зарядн|аккумулятор|батарея/.test(name)) {
      await removeCategory(p.id, 10151); removedSensors++;
    }
  }
  console.log(`   Removed ${removedSensors} non-sensors`);

  // 3. Move VRX from RC Receivers to VTX/VRX
  console.log('3. Moving video receivers...');
  const rxProducts = await c.query(`SELECT id, name FROM aegisky_products WHERE categories @> ${catJson(10096)}`);
  let movedVrx = 0;
  for (const p of rxProducts.rows) {
    const name = (p.name||'').toLowerCase();
    if (/видеоприемник|vrx|video receiver|приемник hd|приёмник для очков/.test(name)) {
      await removeCategory(p.id, 10096); await addCategory(p.id, 10092); movedVrx++;
    }
  }
  console.log(`   Moved ${movedVrx} VRX`);

  // 4. Add new subcategories
  console.log('\n4. Adding new subcategories...');
  const newCats = [
    { id: 10169, name: 'Analog FPV Cameras', slug: 'analog-fpv-cameras', parent: 10038 },
    { id: 10170, name: 'Digital HD FPV Cameras', slug: 'digital-hd-fpv-cameras', parent: 10038 },
    { id: 10171, name: 'Action & Sports Cameras', slug: 'action-sports-cameras', parent: 10038 },
    { id: 10172, name: 'Low-Light & Night Cameras', slug: 'low-light-night-cameras', parent: 10038 },
    { id: 10173, name: '5" Racing Motors (2207/2306)', slug: '5inch-racing-motors', parent: 10081 },
    { id: 10174, name: 'Freestyle & Long-Range Motors', slug: 'freestyle-longrange-motors', parent: 10081 },
    { id: 10175, name: '4-in-1 ESC Stacks', slug: '4in1-esc-stacks', parent: 10085 },
    { id: 10176, name: 'Single & Individual ESC', slug: 'single-individual-esc', parent: 10085 },
    { id: 10177, name: 'F4 Flight Controllers', slug: 'f4-flight-controllers', parent: 10101 },
    { id: 10178, name: 'F7/H7 Flight Controllers', slug: 'f7-h7-flight-controllers', parent: 10101 },
    { id: 10179, name: 'AIO Whoop FC Boards', slug: 'aio-whoop-fc', parent: 10101 },
    { id: 10180, name: 'Low Power VTX (≤200mW)', slug: 'low-power-vtx', parent: 10090 },
    { id: 10181, name: 'High Power VTX (≥500mW)', slug: 'high-power-vtx', parent: 10090 },
    { id: 10182, name: '4S LiPo Batteries', slug: '4s-lipo-batteries', parent: 10106 },
    { id: 10183, name: '6S LiPo Batteries', slug: '6s-lipo-batteries', parent: 10106 },
    { id: 10184, name: 'Single Channel Chargers', slug: 'single-channel-chargers', parent: 10109 },
    { id: 10185, name: 'Dual Channel Chargers', slug: 'dual-channel-chargers', parent: 10109 },
    { id: 10186, name: '4+ Channel Professional Chargers', slug: 'multi-channel-chargers', parent: 10109 },
    { id: 10187, name: 'IMU & Gyro Modules', slug: 'imu-gyro-modules', parent: 10151 },
    { id: 10188, name: 'Barometer & Altimeter Modules', slug: 'barometer-altimeter-modules', parent: 10151 },
    { id: 10189, name: 'Magnetometer & Compass Modules', slug: 'magnetometer-compass-modules', parent: 10151 },
    { id: 10190, name: 'Optical Flow & Position Sensors', slug: 'optical-flow-position-sensors', parent: 10151 },
    { id: 10191, name: 'Air Speed Sensors', slug: 'air-speed-sensors', parent: 10151 },
    { id: 10192, name: '9g Micro Servos', slug: '9g-micro-servos', parent: 10088 },
    { id: 10193, name: 'Standard Size Servos', slug: 'standard-size-servos', parent: 10088 },
    { id: 10194, name: 'Digital Metal Gear Servos', slug: 'digital-metal-gear-servos', parent: 10088 },
    { id: 10195, name: 'DJI Digital FPV Goggles', slug: 'dji-digital-fpv-goggles', parent: 10134 },
    { id: 10196, name: 'HDZero & Walksnail Goggles', slug: 'hdzero-walksnail-goggles', parent: 10134 },
    { id: 10197, name: 'Power Cables & Adapters', slug: 'power-cables-adapters', parent: 10161 },
    { id: 10198, name: 'Signal & Data Cables', slug: 'signal-data-cables', parent: 10161 },
    { id: 10199, name: 'Antenna Connectors & Adapters', slug: 'antenna-connectors-adapters', parent: 10161 },
  ];
  for (const cat of newCats) {
    const exists = await c.query('SELECT id FROM aegisky_categories WHERE id = $1', [cat.id]);
    if (!exists.rows[0]) {
      await c.query('INSERT INTO aegisky_categories (id, name, slug, parent, description, image_url, product_count) VALUES ($1, $2, $3, $4, $5, $6, 0)',
        [cat.id, cat.name, cat.slug, cat.parent, '', '']);
      console.log(`   Added: [${cat.id}] ${cat.name}`);
    }
  }

  // 5. Map products to new subcategories
  console.log('\n5. Mapping products...');

  async function mapByName(catId, patterns, exclude = []) {
    let where = `categories @> ${catJson(catId)}`;
    // This maps products already in parent category
    return;
  }

  // Analog FPV Cameras
  let res;
  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10038)} AND (name ILIKE '%1200tvl%' OR name ILIKE '%tvl%' OR name ILIKE '%analog%' OR name ILIKE '%predator%' OR name ILIKE '%razer%' OR name ILIKE '%runcam%' OR name ILIKE '%foxeer%mini%' OR name ILIKE '%caddx%ant%') AND NOT name ILIKE '%hd%' AND NOT name ILIKE '%4k%' AND NOT name ILIKE '%1080p%' AND NOT name ILIKE '%gopro%' AND NOT name ILIKE '%dji%' AND NOT name ILIKE '%walksnail%' AND NOT name ILIKE '%hdzero%' AND NOT name ILIKE '%night%'`);
  for (const p of res.rows) await addCategory(p.id, 10169);
  console.log(`   Analog FPV Cameras: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10038)} AND (name ILIKE '%hd%' OR name ILIKE '%walksnail%' OR name ILIKE '%hdzero%' OR name ILIKE '%dji%' OR name ILIKE '%avatar%' OR name ILIKE '%polar%vista%' OR name ILIKE '%nebula%' OR name ILIKE '%vista%kit%')`);
  for (const p of res.rows) await addCategory(p.id, 10170);
  console.log(`   Digital HD FPV: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10038)} AND (name ILIKE '%gopro%' OR name ILIKE '%hero%' OR name ILIKE '%runcam 5%' OR name ILIKE '%action cam%' OR name ILIKE '%4k%' OR name ILIKE '%1080p%')`);
  for (const p of res.rows) await addCategory(p.id, 10171);
  console.log(`   Action Cameras: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10038)} AND (name ILIKE '%night%' OR name ILIKE '%ночного видения%' OR name ILIKE '%0.00001lux%')`);
  for (const p of res.rows) await addCategory(p.id, 10172);
  console.log(`   Night Cameras: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10101)} AND (name ILIKE '%f4%' OR name ILIKE '%f405%' OR name ILIKE '%f411%') AND NOT (name ILIKE '%f7%' OR name ILIKE '%h7%')`);
  for (const p of res.rows) await addCategory(p.id, 10177);
  console.log(`   F4 FC: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10101)} AND (name ILIKE '%f7%' OR name ILIKE '%h7%' OR name ILIKE '%f722%' OR name ILIKE '%f745%' OR name ILIKE '%h743%')`);
  for (const p of res.rows) await addCategory(p.id, 10178);
  console.log(`   F7/H7 FC: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10106)} AND name ILIKE '%4s%'`);
  for (const p of res.rows) await addCategory(p.id, 10182);
  console.log(`   4S: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10106)} AND name ILIKE '%6s%'`);
  for (const p of res.rows) await addCategory(p.id, 10183);
  console.log(`   6S: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10090)} AND (name ILIKE '%1.6w%' OR name ILIKE '%2w%' OR name ILIKE '%2.5w%' OR name ILIKE '%1w%' OR name ILIKE '%1000mw%' OR name ILIKE '%1600mw%' OR name ILIKE '%2000mw%' OR name ILIKE '%2500mw%' OR name ILIKE '%high power%' OR name ILIKE '%long range%')`);
  for (const p of res.rows) await addCategory(p.id, 10181);
  console.log(`   High Power VTX: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10090)} AND NOT categories @> ${catJson(10181)} AND (name ILIKE '%25mw%' OR name ILIKE '%100mw%' OR name ILIKE '%200mw%' OR name ILIKE '%350mw%' OR name ILIKE '%400mw%' OR name ILIKE '%nano%' OR name ILIKE '%micro%' OR name ILIKE '%whoop%')`);
  for (const p of res.rows) await addCategory(p.id, 10180);
  console.log(`   Low Power VTX: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10109)} AND (name ILIKE '%duo%' OR name ILIKE '%dual%' OR name ILIKE '%d2%' OR name ILIKE '%d6%')`);
  for (const p of res.rows) await addCategory(p.id, 10185);
  console.log(`   Dual Chargers: ${res.rows.length}`);

  res = await c.query(`SELECT id FROM aegisky_products WHERE categories @> ${catJson(10109)} AND (name ILIKE '%quad%' OR name ILIKE '%4 channel%' OR name ILIKE '%icharger 4%' OR name ILIKE '%q6%' OR name ILIKE '%q8%' OR name ILIKE '%multi%')`);
  for (const p of res.rows) await addCategory(p.id, 10186);
  console.log(`   Multi Chargers: ${res.rows.length}`);

  // Update counts
  console.log('\n6. Updating counts...');
  const allCats = await c.query('SELECT id FROM aegisky_categories WHERE id >= 10000');
  for (const cat of allCats.rows) {
    const count = await c.query(`SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS c WHERE (c->>'id')::int = $1)`, [cat.id]);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2', [parseInt(count.rows[0].cnt), cat.id]);
  }

  // Print tree
  console.log('\n=== TREE ===\n');
  const tree = await c.query('SELECT id, name, parent, product_count FROM aegisky_categories WHERE id >= 10000 ORDER BY parent, id');
  function printTree(parentId, depth) {
    const children = tree.rows.filter(c => c.parent === parentId);
    for (const child of children) {
      console.log(`${'  '.repeat(depth)}[${child.id}] ${child.name}: ${child.product_count}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  const totalCats = await c.query('SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id >= 10000');
  const zeroCats = await c.query('SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id >= 10000 AND product_count = 0');
  console.log(`\nTotal: ${totalCats.rows[0].cnt} categories, ${zeroCats.rows[0].cnt} empty`);

  await c.end();
})();
