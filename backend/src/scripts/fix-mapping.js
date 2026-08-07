const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Get all old categories
  const oldCats = await c.query('SELECT id, name, slug, parent FROM aegisky_categories WHERE id < 10000');
  const oldById = {};
  for (const cat of oldCats.rows) oldById[cat.id] = cat;

  // Get all new categories
  const newCats = await c.query('SELECT id, name, slug, parent FROM aegisky_categories WHERE id >= 10000 ORDER BY id');
  const newById = {};
  for (const cat of newCats.rows) newById[cat.id] = cat;

  // Build old-to-new mapping from the script logic
  // We need to find which new category each old category maps to
  // Product type root categories map directly
  // Brand children map to the same new category as their parent
  // Spec children have their own mapping

  const oldRootToNew = {
    741: 10015,  // Двигатели -> Brushless Motors
    746: 10016,  // ESC -> ESC
    743: 10017,  // Лопасти -> Propellers & Blades
    778: 10018,  // 2-blade -> 2-Blade
    826: 10019,  // 3-blade -> 3-Blade
    780: 10020,  // Лопасти -> Folding Blades
    735: 10021,  // Сервоприводы -> Servo
    831: 10023,  // Автопилоты -> Flight Controllers
    7178: 10024, // Лидары -> LiDAR
    7808: 10025, // Анализаторы спектра -> RF Analyzers
    804: 10027,  // Пульты -> RC Transmitters
    5769: 10028, // Приёмники -> RC Receivers
    818: 10029,  // Антенны -> Antennas
    809: 10030,  // Передатчики -> VTX
    8051: 10031, // Дальнобойные -> Long-Range Radio
    761: 10032,  // Радиостанции -> Two-Way Radios
    808: 10034,  // FPV очки -> FPV Goggles
    762: 10035,  // Мониторы -> FPV Monitors
    751: 10037,  // Камеры -> Cameras & Video
    757: 10038,  // Камеры (sub) -> FPV/Action Cameras
    755: 10039,  // Фотоаппараты -> Mirrorless/DSLR
    756: 10040,  // Объективы -> Lenses
    752: 10041,  // Штативы -> Tripods
    8052: 10042, // Камеры машинного зрения -> Machine Vision
    775: 10043,  // Тепловизоры -> Thermal Cameras
    1272: 10044, // Тепловизионные прицелы -> Thermal Scopes
    1208: 10045, // Оптические прицелы -> Optical Scopes
    1210: 10045, // CRS -> Optical Scopes
    1211: 10045, // LRS -> Optical Scopes
    800: 10046,  // Подвесы -> Gimbals
    1387: 10047, // Противодействия -> Counter-UAV
    770: 10049,  // АКБ -> Batteries
    739: 10050,  // Зарядные -> Chargers
    7067: 10051, // Портативные -> Power Stations
    7091: 10052, // Солнечные -> Solar Panels
    824: 10054,  // Рамы -> Frames
    1421: 10055, // Карбоновые -> Carbon Fiber
    760: 10057,  // Микросхемы -> ICs/Chips
    783: 10058,  // Шлейфы -> Cables
    789: 10059,  // Сетевое -> Network
    737: 10061,  // Микрокомпьютеры -> SBC
    1358: 10062, // Роботы -> Robotics
    753: 10064,  // Инструмент -> Tools
    799: 10065,  // Ремкомплекты -> Repair Kits
    7197: 10066, // Аксессуары -> Accessories
    1242: 10067, // Фонари -> Lighting
    1477: 10068, // Средства передвижения -> E-Mobility
    1478: 10069, // Электросамокаты -> Scooters
    1480: 10070, // Мотоциклы -> Motorcycles
    784: 10072,  // Консоли -> Industrial PCs
    110: 10073,  // Прочее -> Misc
    1209: 10073, // ARTELV -> Misc
    834: 10073,  // RADIOMASTER (root) -> Misc
    7930: 10073, // Sony (root) -> Misc
    7969: 10073, 7973: 10073, 7975: 10073, 7981: 10073, // Транспорт будущего -> Misc
    // UAV categories
    765: 10003,  // Квадрокоптеры -> Industrial Quadcopters
    1302: 10002, // FPV дроны -> FPV Drones
    1334: 10002, // BETAFPV FPV -> FPV Drones
    1364: 10004, // Дроны РФ -> Russian-Made
    2537: 10005, // Дроны для обучения -> Training
    5719: 10006, // Водонепроницаемые -> Waterproof
    7766: 10008, // Неподвижное крыло -> Mapping Aircraft
    7788: 10009, // Самолётного типа -> Long-Range Fixed-Wing
    7765: 10010, // VTOL -> VTOL
    1267: 10011, // С тепловизором -> Thermal Drones
    3563: 10012, // Подводные -> Underwater
    1342: 10013, // Комплекты -> DIY Kits
    7781: 10003, // Мультикоптеры -> Industrial Quadcopters
  };

  // For old categories not directly mapped, inherit from parent
  function resolveNewCatId(oldCatId) {
    if (oldRootToNew[oldCatId]) return oldRootToNew[oldCatId];
    const oldCat = oldById[oldCatId];
    if (!oldCat || !oldCat.parent || oldCat.parent === 0) return null;
    return resolveNewCatId(oldCat.parent);
  }

  // Build complete old->new mapping
  const oldToNew = {};
  for (const oldCat of oldCats.rows) {
    const newId = resolveNewCatId(oldCat.id);
    if (newId) oldToNew[oldCat.id] = newId;
  }

  console.log(`Mapped ${Object.keys(oldToNew).length} old categories to new categories`);

  // Now re-map all products from backup
  const links = await c.query('SELECT product_id, category_id FROM aegisky_product_categories_backup');
  const productNewCats = {};

  for (const link of links.rows) {
    const newCatId = oldToNew[link.category_id];
    if (newCatId) {
      if (!productNewCats[link.product_id]) productNewCats[link.product_id] = new Set();
      productNewCats[link.product_id].add(newCatId);
    }
  }

  // Add parent categories
  const parentLookup = {};
  for (const cat of newCats.rows) parentLookup[cat.id] = cat.parent;

  function getAllParents(catId) {
    const parents = [];
    let p = parentLookup[catId];
    while (p > 0) {
      parents.push(p);
      p = parentLookup[p];
    }
    return parents;
  }

  let mappedCount = 0;
  let unmappedProducts = 0;

  for (const [productId, catIds] of Object.entries(productNewCats)) {
    const allCatIds = new Set(catIds);
    for (const cid of catIds) {
      for (const pid of getAllParents(cid)) allCatIds.add(pid);
    }

    const catsJson = [...allCatIds].map(cid => {
      const cat = newById[cid];
      return { id: cid, name: cat.name, slug: cat.slug };
    });

    await c.query('UPDATE aegisky_products SET categories = $1::jsonb WHERE id = $2',
      [JSON.stringify(catsJson), productId]);
    mappedCount++;
  }

  // Check for unmapped products
  const total = await c.query('SELECT COUNT(*) as cnt FROM aegisky_products');
  const unmapped = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products p
    WHERE jsonb_array_length(categories) = 0 OR categories IS NULL`);

  console.log(`Mapped ${mappedCount} products`);
  console.log(`Total products: ${total.rows[0].cnt}`);
  console.log(`Unmapped: ${unmapped.rows[0].cnt}`);

  // Update product counts
  console.log('\nUpdating counts...');
  for (const cat of newCats.rows) {
    const count = await c.query(`
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS c WHERE (c->>'id')::int = $1)
    `, [cat.id]);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2',
      [parseInt(count.rows[0].cnt), cat.id]);
  }

  // Print counts
  console.log('\n=== NEW CATEGORIES WITH COUNTS ===\n');
  function printTree(parentId, depth) {
    const children = newCats.rows.filter(c => c.parent === parentId).sort((a,b) => a.id - b.id);
    for (const child of children) {
      const cnt = child.product_count || 0;
      console.log(`${'  '.repeat(depth)}[${child.id}] ${child.name}: ${cnt}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  await c.end();
})();
