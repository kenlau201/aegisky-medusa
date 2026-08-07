const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Helper: add category to product
  async function addCategoryToProducts(catId, productIds) {
    let count = 0;
    for (const pid of productIds) {
      const res = await c.query(`
        UPDATE aegisky_products
        SET categories = (
          SELECT jsonb_agg(elem ORDER BY (elem->>'id')::int)
          FROM (
            SELECT DISTINCT ON (elem->>'id') elem
            FROM jsonb_array_elements(
              CASE
                WHEN categories @> '[{"id": ${catId}}]'::jsonb THEN categories
                ELSE categories || '{"id": ${catId}}'::jsonb
              END
            ) AS elem
          ) sub
        )
        WHERE id = $1 AND NOT categories @> '[{"id": ${catId}}]'::jsonb
        RETURNING id
      `, [pid]);
      if (res.rowCount > 0) count++;
    }
    return count;
  }

  // Helper: move products from one category to another (add new, keep old)
  async function addCategoryByName(catId, namePatterns) {
    const results = [];
    for (const pattern of namePatterns) {
      const res = await c.query(`
        SELECT id, name FROM aegisky_products
        WHERE name ILIKE $1
        AND NOT categories @> $2::jsonb
      `, [`%${pattern}%`, JSON.stringify([{id: catId}])]);
      results.push(...res.rows);
    }
    const ids = [...new Set(results.map(r => r.id))];
    const added = await addCategoryToProducts(catId, ids);
    return { found: results.length, unique: ids.length, added };
  }

  console.log('=== FIXING CATEGORY MAPPING ===\n');

  // 1. Thermal-Equipped Military Drones (10121)
  console.log('1. Thermal-Equipped Military Drones (10121):');
  const thermalMil = await addCategoryByName(10121, [
    'с тепловизором', 'thermal', 'тепловизион', '3T', 'M30T', 'M3T',
    'H20T', '640T', 'Dual 640', 'EVO Max 4T', 'Охранник-3T',
    'Разведчик', 'наблюдени', 'охранн'
  ]);
  console.log(`   Added: ${thermalMil.added} products`);

  // Also add all products from Thermal Imaging Drones (10011) that are also military/surveillance
  const thermalDrones = await c.query(`
    SELECT id FROM aegisky_products WHERE categories @> '[{"id": 10011}]'::jsonb
  `);
  const added10121 = await addCategoryToProducts(10121, thermalDrones.rows.map(r => r.id));
  console.log(`   From Thermal Imaging Drones: ${added10121} added`);

  // 2. Move military products from Russian-Made Drones to Military categories
  console.log('\n2. Russian-made military drones to Military & Defense:');

  // Heavy-lift cargo drones (10076)
  const cargo = await addCategoryByName(10076, [
    'грузовик', 'Лифт В', 'CP150', 'CP100', '200 кг', '150 кг', '100 кг',
    'грузоподъемн'
  ]);
  console.log(`   Heavy-Lift Cargo: ${cargo.added}`);

  // Tethered drone systems (10077)
  const tethered = await addCategoryByName(10077, [
    'привязн', 'tethered', 'FY-X30', 'FY-X1000', 'FYXL-TD0', '系留'
  ]);
  console.log(`   Tethered Systems: ${tethered.added}`);

  // Combat & strike drones (10075)
  const combat = await addCategoryByName(10075, [
    'ударн', 'крылат', 'barrage', 'kamikaze', 'javelin',
    'DHF-25', 'гранатомет'
  ]);
  console.log(`   Combat & Strike: ${combat.added}`);

  // Munitions (10078 + 10122)
  const munitions = await addCategoryByName(10078, [
    'боеприпас', 'DLM-', 'munition', 'payload system'
  ]);
  const kamikaze = await addCategoryByName(10122, [
    'камикадз', 'loitering', 'FPV ударн'
  ]);
  console.log(`   Munitions: ${munitions.added}, Kamikaze: ${kamikaze.added}`);

  // UGV / Robot dogs (10079)
  const ugv = await addCategoryByName(10079, [
    'робот-собак', 'робот собак', 'DB2', 'DG2', 'UGV', 'гусенич'
  ]);
  console.log(`   UGV/Robot Dogs: ${ugv.added}`);

  // Military FPV (10119) - FPV drones from Russian-made
  const milFpv = await addCategoryByName(10119, [
    'ATWAY', 'ПУТЬ', 'FPV дрон', 'FPV-дрон', 'Девятый'
  ]);
  console.log(`   Military FPV: ${milFpv.added}`);

  // Military Quadcopters (10120) - Russian security/survey quads
  const milQuad = await addCategoryByName(10120, [
    'Спасатель', 'Разведчик', 'Охранник', 'Гигант', 'Кречет',
    'FY-X30', 'FY-X1000', 'FYXL', 'промышленн'
  ]);
  console.log(`   Military Quadcopters: ${milQuad.added}`);

  // 3. Fix Miscellaneous mis-categorized products
  console.log('\n3. Fixing Miscellaneous mis-categorized products:');

  // FPV drones in misc
  const miscFpv = await addCategoryByName(10002, ['FPV дрон', 'FPV-дрон', 'Девятый']);
  const miscQuad = await addCategoryByName(10003, ['Кречет', 'квадрокоптер']);
  const miscMotor = await addCategoryByName(10015, ['Электродвигатель для FPV', '2812']);
  const miscCam = await addCategoryByName(10038, ['Камера Zoom', 'Sony CCD']);
  const miscAnt = await addCategoryByName(10029, ['антенн', 'Antenna']);
  const miscThermal = await addCategoryByName(10044, ['тепловиз', 'ARTELV']);
  const miscBatt = await addCategoryByName(10049, ['Аккумулятор Транспорт']);
  const miscStack = await addCategoryByName(10101, ['Стек ТБ']);
  console.log(`   FPV: ${miscFpv.added}, Quad: ${miscQuad.added}, Motor: ${miscMotor.added}`);
  console.log(`   Camera: ${miscCam.added}, Antenna: ${miscAnt.added}, Thermal: ${miscThermal.added}`);
  console.log(`   Battery: ${miscBatt.added}, FC Stack: ${miscStack.added}`);

  // 4. Fix 0-product categories - try to find products
  console.log('\n4. Finding products for 0-count categories:');

  // 5" FPV Monitors (10136)
  const monitors5 = await addCategoryByName(10136, ['5" monitor', '5 дюйм.*монитор', '5inch monitor']);
  console.log(`   5" FPV Monitors: ${monitors5.added}`);

  // Handheld Thermal Cameras (10115)
  const handheldThermal = await addCategoryByName(10115, [
    'ручной тепловиз', 'handheld thermal', 'тепловизор для охоты',
    'iRay', 'InfiRay', 'Pulsar', 'Seek Thermal'
  ]);
  console.log(`   Handheld Thermal: ${handheldThermal.added}`);

  // Drone Strobe & Navigation Lights (10164)
  const strobes = await addCategoryByName(10164, [
    'strobe', 'навигационн.*огни', 'navigation light', 'проблесков'
  ]);
  console.log(`   Strobe/Nav Lights: ${strobes.added}`);

  // Heat Guns & Rework Tools (10158)
  const heatGuns = await addCategoryByName(10158, [
    'фен', 'heat gun', 'термовозд', 'паяльн.*станц'
  ]);
  console.log(`   Heat Guns: ${heatGuns.added}`);

  // Industrial Chargers (10110)
  const indChargers = await addCategoryByName(10110, [
    'industrial charger', 'промышленн.*зарядн', 'multi-chemistry'
  ]);
  console.log(`   Industrial Chargers: ${indChargers.added}`);

  // 5. Further subdivide categories
  console.log('\n5. Further subdividing:');

  // Check if we need more categories - look at large leaf categories
  const largeLeaves = await c.query(`
    SELECT id, name, product_count FROM aegisky_categories
    WHERE id >= 10000 AND product_count >= 50
    AND id NOT IN (SELECT parent FROM aegisky_categories WHERE id >= 10000 AND parent IS NOT NULL)
    ORDER BY product_count DESC
  `);
  console.log('   Large leaf categories (potential for further subdivision):');
  for (const cat of largeLeaves.rows) {
    console.log(`     [${cat.id}] ${cat.name}: ${cat.product_count}`);
  }

  // Update product counts
  console.log('\n6. Updating product counts...');
  const allNewCats = await c.query('SELECT id FROM aegisky_categories WHERE id >= 10000');
  for (const cat of allNewCats.rows) {
    const count = await c.query(`
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS c WHERE (c->>'id')::int = $1)
    `, [cat.id]);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2',
      [parseInt(count.rows[0].cnt), cat.id]);
  }

  // Final stats
  const totalCats = await c.query('SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id >= 10000');
  const totalProd = await c.query('SELECT COUNT(*) as cnt FROM aegisky_products WHERE jsonb_array_length(categories) > 0');
  const zeroCats = await c.query('SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id >= 10000 AND product_count = 0');

  console.log(`\n=== FINAL STATS ===`);
  console.log(`Total categories: ${totalCats.rows[0].cnt}`);
  console.log(`Products with categories: ${totalProd.rows[0].cnt}`);
  console.log(`Categories with 0 products: ${zeroCats.rows[0].cnt}`);

  // Print tree
  console.log('\n=== UPDATED CATEGORY TREE ===\n');
  const cats = await c.query(`
    SELECT id, name, parent, product_count FROM aegisky_categories WHERE id >= 10000 ORDER BY parent, id
  `);
  function printTree(parentId, depth) {
    const children = cats.rows.filter(c => c.parent === parentId);
    for (const child of children) {
      console.log(`${'  '.repeat(depth)}[${child.id}] ${child.name}: ${child.product_count}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  await c.end();
})();
