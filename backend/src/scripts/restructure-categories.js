/**
 * Aegisky Category Restructuring Migration
 * 
 * Creates a professional 14-top-level category structure with 3-4 level hierarchy.
 * Maps existing Russian categories to new English categories.
 * Preserves all product data and brand associations.
 * 
 * SAFETY: Does NOT delete old categories. Creates new ones starting from ID 10000.
 * Products get NEW category associations; old associations are backed up.
 */

const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5434,
    user: 'medusa',
    password: 'medusa_password',
    database: 'medusa-aegisky',
  });

  await client.connect();
  console.log('Connected to database. Starting category migration...\n');

  // Step 1: Backup existing product_categories
  console.log('[1/7] Backing up existing category associations...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS aegisky_product_categories_backup AS 
    SELECT * FROM aegisky_product_categories
  `);
  const backupCount = await client.query('SELECT COUNT(*) as cnt FROM aegisky_product_categories_backup');
  console.log(`  Backed up ${backupCount.rows[0].cnt} product-category associations`);

  // Step 2: Define new category structure
  console.log('\n[2/7] Preparing new category structure...');

  // New category tree: [name, slug, children]
  // Each entry: { name, slug, children: [...] }
  const newCategories = [
    {
      name: 'UAV Platforms',
      slug: 'uav-platforms',
      children: [
        {
          name: 'Multirotor UAV',
          slug: 'multirotor-uav',
          children: [
            { name: 'Micro Quadcopters', slug: 'micro-quadcopters' },
            { name: 'Racing FPV', slug: 'racing-fpv' },
            { name: 'Freestyle FPV', slug: 'freestyle-fpv' },
            { name: 'Long Range FPV', slug: 'long-range-fpv' },
            { name: 'Industrial Multirotor', slug: 'industrial-multirotor' },
            { name: 'Heavy Lift UAV', slug: 'heavy-lift-uav' },
          ]
        },
        {
          name: 'Fixed Wing UAV',
          slug: 'fixed-wing-uav',
          children: [
            { name: 'Mapping Aircraft', slug: 'mapping-aircraft' },
            { name: 'Surveillance UAV', slug: 'surveillance-uav' },
            { name: 'Long Endurance', slug: 'long-endurance' },
            { name: 'Hybrid Aircraft', slug: 'hybrid-aircraft' },
          ]
        },
        {
          name: 'VTOL UAV',
          slug: 'vtol-uav',
          children: [
            { name: 'QuadPlane', slug: 'quadplane' },
            { name: 'Tilt Rotor', slug: 'tilt-rotor' },
            { name: 'Tail Sitter', slug: 'tail-sitter' },
            { name: 'Hybrid VTOL', slug: 'hybrid-vtol' },
          ]
        },
        {
          name: 'Cargo UAV',
          slug: 'cargo-uav',
          children: [
            { name: 'Delivery UAV', slug: 'delivery-uav' },
            { name: 'Heavy Cargo UAV', slug: 'heavy-cargo-uav' },
            { name: 'Autonomous Delivery System', slug: 'autonomous-delivery-system' },
          ]
        },
        {
          name: 'Autonomous Drone System',
          slug: 'autonomous-drone-system',
          children: [
            { name: 'Drone-in-a-Box', slug: 'drone-in-a-box' },
            { name: 'Dock Station', slug: 'dock-station' },
            { name: 'Autonomous Charging', slug: 'autonomous-charging' },
            { name: 'Fleet Management', slug: 'fleet-management' },
          ]
        },
      ]
    },
    {
      name: 'Airframe & Mechanical Structures',
      slug: 'airframe-mechanical-structures',
      children: [
        {
          name: 'Frames',
          slug: 'frames',
          children: [
            { name: 'FPV Carbon Frame', slug: 'fpv-carbon-frame' },
            { name: 'Industrial Frame', slug: 'industrial-frame' },
            { name: 'Folding Frame', slug: 'folding-frame' },
            { name: 'Custom Airframe', slug: 'custom-airframe' },
          ]
        },
        { name: 'Arms', slug: 'arms' },
        { name: 'Landing Gear', slug: 'landing-gear' },
        { name: 'Payload Mount', slug: 'payload-mount' },
        { name: 'Gimbal Mount', slug: 'gimbal-mount' },
        { name: 'Carbon Fiber Material', slug: 'carbon-fiber-material' },
        { name: 'Mechanical Hardware', slug: 'mechanical-hardware' },
      ]
    },
    {
      name: 'Propulsion Systems',
      slug: 'propulsion-systems',
      children: [
        {
          name: 'Brushless Motors',
          slug: 'brushless-motors',
          children: [
            { name: 'FPV Motor', slug: 'fpv-motor' },
            { name: 'Industrial Motor', slug: 'industrial-motor' },
            { name: 'High Torque Motor', slug: 'high-torque-motor' },
            { name: 'Waterproof Motor', slug: 'waterproof-motor' },
            { name: 'Gimbal Motor', slug: 'gimbal-motor' },
          ]
        },
        {
          name: 'ESC',
          slug: 'esc',
          children: [
            { name: 'Single ESC', slug: 'single-esc' },
            { name: '4-in-1 ESC', slug: '4-in-1-esc' },
            { name: 'High Current ESC', slug: 'high-current-esc' },
            { name: 'Industrial ESC', slug: 'industrial-esc' },
          ]
        },
        {
          name: 'Propellers',
          slug: 'propellers',
          children: [
            { name: 'Carbon Propeller', slug: 'carbon-propeller' },
            { name: 'Folding Propeller', slug: 'folding-propeller' },
            { name: 'FPV Propeller', slug: 'fpv-propeller' },
            { name: 'Industrial Propeller', slug: 'industrial-propeller' },
          ]
        },
        { name: 'Servo Systems', slug: 'servo-systems' },
        { name: 'Motor Accessories', slug: 'motor-accessories' },
      ]
    },
    {
      name: 'Flight Control & Navigation',
      slug: 'flight-control-navigation',
      children: [
        {
          name: 'Flight Controller',
          slug: 'flight-controller',
          children: [
            { name: 'F405 Series', slug: 'f405-series' },
            { name: 'F722 Series', slug: 'f722-series' },
            { name: 'F743 Series', slug: 'f743-series' },
            { name: 'H7 Series', slug: 'h7-series' },
            { name: 'Custom FC', slug: 'custom-fc' },
          ]
        },
        {
          name: 'Autopilot',
          slug: 'autopilot',
          children: [
            { name: 'PX4 Ecosystem', slug: 'px4-ecosystem' },
            { name: 'Ardupilot Ecosystem', slug: 'ardupilot-ecosystem' },
            { name: 'Industrial Autopilot', slug: 'industrial-autopilot' },
          ]
        },
        {
          name: 'Navigation',
          slug: 'navigation',
          children: [
            { name: 'GPS Module', slug: 'gps-module' },
            { name: 'GNSS', slug: 'gnss' },
            { name: 'RTK', slug: 'rtk' },
            { name: 'INS', slug: 'ins' },
          ]
        },
        { name: 'IMU', slug: 'imu' },
        { name: 'Compass', slug: 'compass' },
        { name: 'Flight Software', slug: 'flight-software' },
      ]
    },
    {
      name: 'Communication & Data Link',
      slug: 'communication-data-link',
      children: [
        {
          name: 'RC Control System',
          slug: 'rc-control-system',
          children: [
            { name: 'Transmitter', slug: 'transmitter' },
            { name: 'Receiver', slug: 'receiver' },
            { name: 'Industrial Remote Controller', slug: 'industrial-remote-controller' },
          ]
        },
        { name: 'Telemetry System', slug: 'telemetry-system' },
        { name: 'Long Range Radio', slug: 'long-range-radio' },
        { name: 'Digital Data Link', slug: 'digital-data-link' },
        { name: 'Antenna System', slug: 'antenna-system' },
        { name: 'Ground Station', slug: 'ground-station' },
        { name: 'Network Equipment', slug: 'network-equipment' },
      ]
    },
    {
      name: 'Imaging & Payload Systems',
      slug: 'imaging-payload-systems',
      children: [
        {
          name: 'EO Camera',
          slug: 'eo-camera',
          children: [
            { name: 'Industrial Camera', slug: 'industrial-camera' },
            { name: 'Zoom Camera', slug: 'zoom-camera' },
            { name: 'Machine Vision Camera', slug: 'machine-vision-camera' },
          ]
        },
        {
          name: 'Thermal Imaging',
          slug: 'thermal-imaging',
          children: [
            { name: 'Thermal Camera', slug: 'thermal-camera' },
            { name: 'Thermal Sensor', slug: 'thermal-sensor' },
            { name: 'Infrared Module', slug: 'infrared-module' },
          ]
        },
        { name: 'Night Vision', slug: 'night-vision' },
        {
          name: 'LiDAR',
          slug: 'lidar',
          children: [
            { name: 'Mapping LiDAR', slug: 'mapping-lidar' },
            { name: 'Distance LiDAR', slug: 'distance-lidar' },
            { name: '3D Scanner', slug: '3d-scanner' },
          ]
        },
        { name: 'Radar Sensor', slug: 'radar-sensor' },
        { name: 'Gimbal System', slug: 'gimbal-system' },
        { name: 'Payload Controller', slug: 'payload-controller' },
      ]
    },
    {
      name: 'FPV Systems',
      slug: 'fpv-systems',
      children: [
        { name: 'FPV Camera', slug: 'fpv-camera' },
        { name: 'Analog Video System', slug: 'analog-video-system' },
        { name: 'Digital Video System', slug: 'digital-video-system' },
        { name: 'Video Transmitter (VTX)', slug: 'video-transmitter-vtx' },
        { name: 'FPV Goggles', slug: 'fpv-goggles' },
        { name: 'FPV Monitor', slug: 'fpv-monitor' },
        { name: 'FPV Accessories', slug: 'fpv-accessories' },
      ]
    },
    {
      name: 'Power & Energy',
      slug: 'power-energy',
      children: [
        {
          name: 'Battery',
          slug: 'battery',
          children: [
            { name: 'LiPo Battery', slug: 'lipo-battery' },
            { name: 'Li-ion Battery', slug: 'li-ion-battery' },
            { name: 'Smart Battery', slug: 'smart-battery' },
            { name: 'Industrial Battery Pack', slug: 'industrial-battery-pack' },
          ]
        },
        { name: 'Charger', slug: 'charger' },
        { name: 'Power Module', slug: 'power-module' },
        { name: 'BMS', slug: 'bms' },
        { name: 'Power Distribution Board', slug: 'power-distribution-board' },
        { name: 'Portable Power Station', slug: 'portable-power-station' },
      ]
    },
    {
      name: 'Embedded Computing & AI',
      slug: 'embedded-computing-ai',
      children: [
        {
          name: 'Embedded Computer',
          slug: 'embedded-computer',
          children: [
            { name: 'ARM Board', slug: 'arm-board' },
            { name: 'Industrial Computer', slug: 'industrial-computer' },
            { name: 'Edge Computer', slug: 'edge-computer' },
          ]
        },
        { name: 'AI Accelerator', slug: 'ai-accelerator' },
        { name: 'GPU Module', slug: 'gpu-module' },
        { name: 'Micro Computer', slug: 'micro-computer' },
        { name: 'Chips', slug: 'chips' },
        { name: 'Development Board', slug: 'development-board' },
        { name: 'AI Vision Module', slug: 'ai-vision-module' },
      ]
    },
    {
      name: 'Robotics Systems',
      slug: 'robotics-systems',
      children: [
        { name: 'Ground Robot', slug: 'ground-robot' },
        { name: 'Mobile Robot', slug: 'mobile-robot' },
        { name: 'Autonomous Vehicle', slug: 'autonomous-vehicle' },
        { name: 'Robot Controller', slug: 'robot-controller' },
        { name: 'Robot Sensors', slug: 'robot-sensors' },
        { name: 'Robot Components', slug: 'robot-components' },
      ]
    },
    {
      name: 'Counter UAV Systems',
      slug: 'counter-uav-systems',
      children: [
        {
          name: 'Drone Detection',
          slug: 'drone-detection',
          children: [
            { name: 'RF Detection', slug: 'rf-detection' },
            { name: 'Radar Detection', slug: 'radar-detection' },
            { name: 'Optical Detection', slug: 'optical-detection' },
          ]
        },
        {
          name: 'Counter Drone Equipment',
          slug: 'counter-drone-equipment',
          children: [
            { name: 'RF Jammer', slug: 'rf-jammer' },
            { name: 'Anti Drone System', slug: 'anti-drone-system' },
            { name: 'Protection System', slug: 'protection-system' },
          ]
        },
      ]
    },
    {
      name: 'Electronics Components',
      slug: 'electronics-components',
      children: [
        { name: 'PCB Modules', slug: 'pcb-modules' },
        { name: 'Sensors', slug: 'sensors' },
        { name: 'Connectors', slug: 'connectors' },
        { name: 'Cables', slug: 'cables' },
        { name: 'Communication Modules', slug: 'communication-modules' },
        { name: 'Electronic Accessories', slug: 'electronic-accessories' },
      ]
    },
    {
      name: 'Manufacturing & Maintenance',
      slug: 'manufacturing-maintenance',
      children: [
        { name: 'Assembly Tools', slug: 'assembly-tools' },
        { name: 'Soldering Equipment', slug: 'soldering-equipment' },
        { name: 'Testing Equipment', slug: 'testing-equipment' },
        { name: 'Spare Parts', slug: 'spare-parts' },
        { name: 'Repair Kits', slug: 'repair-kits' },
        { name: 'Consumables', slug: 'consumables' },
      ]
    },
    {
      name: 'Industrial Equipment Extension',
      slug: 'industrial-equipment-extension',
      children: [
        { name: 'Solar Energy', slug: 'solar-energy' },
        { name: 'Electric Mobility', slug: 'electric-mobility' },
        { name: 'Portable Energy', slug: 'portable-energy' },
        { name: 'Marine Drone', slug: 'marine-drone' },
        { name: 'Underwater Robot', slug: 'underwater-robot' },
        { name: 'Industrial Accessories', slug: 'industrial-accessories' },
      ]
    },
  ];

  // Insert new categories with IDs starting from 10000
  let nextId = 10000;
  const newIdMap = {}; // slug -> new id
  const allNewCats = []; // flat list for insertion

  function processCategory(cat, parentId, depth, pathArr) {
    const id = nextId++;
    newIdMap[cat.slug] = id;
    const path = [...pathArr, { id, name: cat.name, slug: cat.slug }];
    allNewCats.push({
      id,
      name: cat.name,
      slug: cat.slug,
      parent: parentId,
      depth,
      path: JSON.stringify(path),
      children: cat.children || [],
    });
    if (cat.children) {
      cat.children.forEach(child => processCategory(child, id, depth + 1, path));
    }
  }

  newCategories.forEach(cat => processCategory(cat, 0, 0, []));

  // Resolve slug conflicts with old categories
  const allNewSlugs = new Set(allNewCats.map(c => c.slug));
  let renamedCount = 0;
  for (const slug of allNewSlugs) {
    const existing = await client.query('SELECT id, name FROM aegisky_categories WHERE slug = $1 AND id < 10000', [slug]);
    if (existing.rows.length > 0) {
      const newSlug = slug + '-legacy';
      await client.query('UPDATE aegisky_categories SET slug = $1 WHERE id = $2', [newSlug, existing.rows[0].id]);
      renamedCount++;
    }
  }
  console.log(`  Renamed ${renamedCount} old categories with conflicting slugs`);

  // Insert all new categories
  for (const cat of allNewCats) {
    await client.query(
      `INSERT INTO aegisky_categories (id, name, slug, parent, depth, path, product_count, children_count, description, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, 0, $7, '', '', NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET name=$2, slug=$3, parent=$4, depth=$5, path=$6::jsonb, children_count=$7`,
      [cat.id, cat.name, cat.slug, cat.parent, cat.depth, cat.path, cat.children.length]
    );
  }
  console.log(`  Created ${allNewCats.length} new categories (IDs 10000-${nextId - 1})`);

  // Step 4: Define old category ID -> new category slug mapping
  console.log('\n[4/7] Building category mapping...');
  
  // Old Russian category ID -> new category slug
  // Key: old category ID, Value: new category slug
  const oldToNew = {
    // === UAV Platforms ===
    765: 'industrial-multirotor',     // Квадрокоптеры (Quadcopters)
    1302: 'fpv-systems',              // FPV дроны (FPV drones - map to FPV systems)
    7781: 'industrial-multirotor',    // Мультикоптеры
    7766: 'fixed-wing-uav',           // Дроны с неподвижным крылом
    7788: 'fixed-wing-uav',           // Дроны самолётного типа
    7765: 'vtol-uav',                 // Дроны с вертикальным взлётом
    1364: 'uav-platforms',            // Дроны РФ (Russian drones - map to parent)
    1267: 'industrial-multirotor',    // Дроны с тепловизором (drones with thermal)
    5719: 'industrial-multirotor',    // Водонепроницаемые дроны (waterproof drones)
    2537: 'uav-platforms',            // Дроны для обучения (training drones)
    1342: 'uav-platforms',            // Комплекты для сборки дронов (drone kits)
    1387: 'counter-uav-systems',      // Противодействия дронам (counter-drone)
    
    // === Airframe ===
    824: 'frames',                    // Рамы (Frames)
    1421: 'carbon-fiber-material',    // Карбоновые материалы
    
    // === Propulsion ===
    741: 'brushless-motors',          // Двигатели (Motors)
    746: 'esc',                       // ESC Регуляторы
    743: 'propellers',                // Лопасти и пропеллеры
    735: 'servo-systems',             // Сервоприводы
    
    // === Flight Control ===
    831: 'flight-controller',         // Автопилоты (Autopilots/FC)
    
    // === Communication ===
    804: 'transmitter',               // Пульты управления (Transmitters)
    5769: 'receiver',                 // Приёмники (Receivers)
    809: 'video-transmitter-vtx',     // Передатчики (VTX/Transmitters)
    818: 'antenna-system',            // Антенны (Antennas)
    761: 'long-range-radio',          // Радиостанции (Radios)
    789: 'network-equipment',         // Сетевое оборудование
    8051: 'long-range-radio',         // Дальнобойные системы радиометрии
    
    // === Imaging & Payload ===
    751: 'eo-camera',                 // Камеры и видео (Cameras & video)
    775: 'thermal-imaging',           // Тепловизоры (Thermal)
    800: 'gimbal-system',             // Подвесы (Gimbals)
    7178: 'lidar',                    // Лидары (LiDAR)
    762: 'fpv-monitor',               // Мониторы (Monitors)
    808: 'fpv-goggles',               // FPV очки (FPV Goggles)
    8052: 'machine-vision-camera',    // Камеры машинного зрения
    1272: 'thermal-imaging',          // Тепловизионные прицелы
    1208: 'optical-detection',        // Оптические прицелы
    1210: 'optical-detection',        // Прицелы для ближней охоты
    1211: 'optical-detection',        // Прицелы для дальней охоты
    
    // === Power ===
    770: 'battery',                   // АКБ (Batteries)
    739: 'charger',                   // Зарядные устройства (Chargers)
    7067: 'portable-power-station',   // Портативные электростанции
    7091: 'solar-energy',             // Солнечные панели
    
    // === Computing & AI ===
    737: 'embedded-computer',         // Микрокомпьютеры
    760: 'chips',                     // Микросхемы чипы
    
    // === Robotics ===
    1358: 'robotics-systems',         // Роботы
    
    // === Counter UAV ===
    // 1387 already mapped above
    7808: 'rf-detection',             // Анализаторы спектра (Spectrum analyzers)
    
    // === Electronics ===
    783: 'cables',                    // Шлейфы (Cables)
    
    // === Manufacturing ===
    753: 'assembly-tools',            // Инструмент (Tools)
    799: 'repair-kits',               // Ремкомплекты Kyocera
    
    // === Industrial Extension ===
    1477: 'electric-mobility',        // Средства передвижения
    3563: 'underwater-robot',         // Подводные дроны
    
    // === Accessories (distribute by sub-type) ===
    7197: 'uav-platforms',            // Аксессуары (general accessories)
    
    // === Other/misc ===
    1242: 'industrial-accessories',   // Фонари (Flashlights)
    784: 'industrial-accessories',    // Консоли и приставки (Game consoles - misc)
    110: 'uav-platforms',             // Прочее (Other)
    
    // Brand-as-category entries (depth=1 children that are actually brands)
    // These will be mapped to their parent's new category
    // We'll handle these dynamically below
  };

  // For brand sub-categories (depth=1 under product type categories),
  // map them to the same new category as their parent
  const brandSubcategoryOverrides = {
    // Motors brands -> map to appropriate motor subcategory based on product type
    // We'll map all motor brands to 'brushless-motors' parent, and let sub-categorization
    // happen via product name analysis
  };

  // Get all old categories to handle brand-as-category cases
  const oldCatsRes = await client.query('SELECT id, name, parent, depth FROM aegisky_categories');
  const oldCatsById = {};
  oldCatsRes.rows.forEach(r => { oldCatsById[r.id] = r; });

  // For any depth-1 category whose parent is mapped, inherit parent's mapping
  // (these are brand sub-categories like T-Motor under Двигатели)
  let inheritedCount = 0;
  for (const [oldId, cat] of Object.entries(oldCatsById)) {
    const oid = parseInt(oldId);
    if (oldToNew[oid]) continue; // already mapped
    if (cat.parent !== 0 && oldToNew[cat.parent]) {
      oldToNew[oid] = oldToNew[cat.parent];
      inheritedCount++;
    }
  }
  console.log(`  Mapped ${Object.keys(oldToNew).length} old categories (${inheritedCount} inherited from parent)`);

  // Step 5: Update product-category associations
  console.log('\n[5/7] Updating product-category associations...');
  
  // Clear old associations for products (keep backup table)
  await client.query('DELETE FROM aegisky_product_categories');
  
  // Get all products with their categories
  const productsRes = await client.query('SELECT id, categories FROM aegisky_products');
  const products = productsRes.rows;
  console.log(`  Processing ${products.length} products...`);

  let assignedCount = 0;
  let unassignedCount = 0;
  const newCategoriesForProduct = {}; // product_id -> Set of new category IDs

  for (const product of products) {
    const oldCats = product.categories || [];
    const newCatSlugs = new Set();
    
    for (const oc of oldCats) {
      const oldId = oc.id || oc.category_id;
      if (oldId && oldToNew[oldId]) {
        newCatSlugs.add(oldToNew[oldId]);
      }
    }
    
    // If no category mapped, assign to 'uav-platforms' as fallback
    if (newCatSlugs.size === 0) {
      newCatSlugs.add('uav-platforms');
      unassignedCount++;
    }
    
    // Convert slugs to IDs and also add parent categories (for hierarchy)
    const newCatIds = new Set();
    for (const slug of newCatSlugs) {
      // Add the category itself
      if (newIdMap[slug]) {
        newCatIds.add(newIdMap[slug]);
      }
      // Add all parent categories by walking the path
      const cat = allNewCats.find(c => c.slug === slug);
      if (cat) {
        // Walk up through parents
        let parentId = cat.parent;
        while (parentId !== 0) {
          newCatIds.add(parentId);
          const parentCat = allNewCats.find(c => c.id === parentId);
          if (parentCat) parentId = parentCat.parent;
          else break;
        }
      }
    }
    
    newCategoriesForProduct[product.id] = newCatIds;
    
    // Insert into aegisky_product_categories
    for (const catId of newCatIds) {
      await client.query(
        'INSERT INTO aegisky_product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [product.id, catId]
      );
    }
    assignedCount++;
  }
  console.log(`  Assigned ${assignedCount} products (${unassignedCount} fallback to UAV Platforms)`);

  // Step 6: Update products' categories JSONB field
  console.log('\n[6/7] Updating products categories JSONB field...');
  
  for (const product of products) {
    const newCatIds = newCategoriesForProduct[product.id];
    if (!newCatIds || newCatIds.size === 0) continue;
    
    // Build new categories JSON array
    const newCatsJson = [];
    for (const catId of newCatIds) {
      const cat = allNewCats.find(c => c.id === catId);
      if (cat) {
        newCatsJson.push({ id: cat.id, name: cat.name, slug: cat.slug });
      }
    }
    
    await client.query(
      'UPDATE aegisky_products SET categories = $1::jsonb, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(newCatsJson), product.id]
    );
  }
  console.log(`  Updated ${products.length} products`);

  // Step 7: Recalculate product_count for new categories
  console.log('\n[7/7] Recalculating category product counts...');
  
  await client.query(`
    UPDATE aegisky_categories c
    SET product_count = COALESCE((
      SELECT COUNT(DISTINCT pc.product_id)
      FROM aegisky_product_categories pc
      WHERE pc.category_id = c.id
    ), 0)
    WHERE c.id >= 10000
  `);
  
  // Show counts for top-level categories
  const topCounts = await client.query(`
    SELECT name, product_count 
    FROM aegisky_categories 
    WHERE depth = 0 AND id >= 10000
    ORDER BY product_count DESC
  `);
  console.log('\n  New top-level category product counts:');
  for (const row of topCounts.rows) {
    console.log(`    ${row.name}: ${row.product_count} products`);
  }

  // Step 7: Verify total
  const totalMapped = await client.query(`
    SELECT COUNT(DISTINCT product_id) as cnt 
    FROM aegisky_product_categories pc
    JOIN aegisky_categories c ON c.id = pc.category_id
    WHERE c.id >= 10000
  `);
  console.log(`\n  Total products in new categories: ${totalMapped.rows[0].cnt}`);

  const totalProducts = await client.query('SELECT COUNT(*) as cnt FROM aegisky_products');
  console.log(`  Total products in database: ${totalProducts.rows[0].cnt}`);

  await client.end();
  console.log('\n✓ Category migration completed successfully!');
  console.log('  Old categories preserved (IDs < 10000). New categories active (IDs >= 10000).');
  console.log('  Next steps: Rebuild Meilisearch index, restart backend, refresh frontend data.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
