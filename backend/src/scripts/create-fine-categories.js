const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

// New fine-grained category tree for professional B2B drone supply chain
// Structure: parentSlug -> [children]
// Each category: { name, slug, oldCatIds: [old category IDs that map here] }
const NEW_CATEGORIES = [
  // ===== 1. UAV COMPLETE SYSTEMS =====
  {
    name: 'UAV Complete Systems', slug: 'uav-complete-systems',
    children: [
      { name: 'Multirotor UAV', slug: 'multirotor-uav', oldIds: [765, 1302, 1364, 7781], children: [
        { name: 'FPV Racing & Freestyle Drones', slug: 'fpv-racing-freestyle-drones', oldIds: [1302, 1334] },
        { name: 'Industrial Quadcopters', slug: 'industrial-quadcopters', oldIds: [765, 7781] },
        { name: 'Russian-Made Drones', slug: 'russian-made-drones', oldIds: [1364] },
        { name: 'Training Drones', slug: 'training-drones', oldIds: [2537] },
        { name: 'Waterproof Drones', slug: 'waterproof-drones', oldIds: [5719] },
      ]},
      { name: 'Fixed-Wing UAV', slug: 'fixed-wing-uav', oldIds: [7766, 7788], children: [
        { name: 'Mapping & Survey Aircraft', slug: 'mapping-survey-aircraft', oldIds: [7766] },
        { name: 'Long-Range Fixed-Wing', slug: 'long-range-fixed-wing', oldIds: [7788] },
      ]},
      { name: 'VTOL UAV', slug: 'vtol-uav', oldIds: [7765] },
      { name: 'Thermal Imaging Drones', slug: 'thermal-imaging-drones', oldIds: [1267] },
      { name: 'Underwater ROV & Drones', slug: 'underwater-rov-drones', oldIds: [3563] },
      { name: 'Drone DIY Kits', slug: 'drone-diy-kits', oldIds: [1342] },
    ]
  },

  // ===== 2. PROPULSION SYSTEMS =====
  {
    name: 'Propulsion Systems', slug: 'propulsion-systems',
    children: [
      { name: 'Brushless Motors', slug: 'brushless-motors', oldIds: [741] },
      { name: 'ESC (Electronic Speed Controllers)', slug: 'esc', oldIds: [746] },
      { name: 'Propellers & Blades', slug: 'propellers-blades', oldIds: [743], children: [
        { name: '2-Blade Propellers', slug: '2-blade-propellers', oldIds: [778] },
        { name: '3-Blade Propellers', slug: '3-blade-propellers', oldIds: [826] },
        { name: 'Folding Blades', slug: 'folding-blades', oldIds: [780] },
      ]},
      { name: 'Servo Motors & Actuators', slug: 'servo-motors-actuators', oldIds: [735] },
    ]
  },

  // ===== 3. FLIGHT CONTROL & NAVIGATION =====
  {
    name: 'Flight Control & Navigation', slug: 'flight-control-navigation',
    children: [
      { name: 'Flight Controllers & Autopilots', slug: 'flight-controllers-autopilots', oldIds: [831] },
      { name: 'LiDAR & Distance Sensors', slug: 'lidar-distance-sensors', oldIds: [7178] },
      { name: 'RF Spectrum Analyzers', slug: 'rf-spectrum-analyzers', oldIds: [7808] },
    ]
  },

  // ===== 4. RC & DATA LINK =====
  {
    name: 'RC Control & Data Link', slug: 'rc-control-data-link',
    children: [
      { name: 'RC Transmitters', slug: 'rc-transmitters', oldIds: [804] },
      { name: 'RC Receivers', slug: 'rc-receivers', oldIds: [5769] },
      { name: 'Antennas', slug: 'antennas', oldIds: [818] },
      { name: 'Video Transmitters (VTX)', slug: 'video-transmitters-vtx', oldIds: [809] },
      { name: 'Long-Range Radio Modems', slug: 'long-range-radio-modems', oldIds: [8051] },
      { name: 'Two-Way Radios & Walkie-Talkies', slug: 'two-way-radios', oldIds: [761] },
    ]
  },

  // ===== 5. FPV SYSTEMS =====
  {
    name: 'FPV Systems', slug: 'fpv-systems',
    children: [
      { name: 'FPV Goggles', slug: 'fpv-goggles', oldIds: [808] },
      { name: 'FPV Monitors & Displays', slug: 'fpv-monitors-displays', oldIds: [762] },
    ]
  },

  // ===== 6. IMAGING & PAYLOAD =====
  {
    name: 'Imaging & Payload Systems', slug: 'imaging-payload-systems',
    children: [
      { name: 'Cameras & Video Equipment', slug: 'cameras-video-equipment', oldIds: [751], children: [
        { name: 'FPV & Action Cameras', slug: 'fpv-action-cameras', oldIds: [757] },
        { name: 'Mirrorless & DSLR Cameras', slug: 'mirrorless-dslr-cameras', oldIds: [755] },
        { name: 'Camera Lenses', slug: 'camera-lenses', oldIds: [756] },
        { name: 'Tripods & Mounts', slug: 'tripods-mounts', oldIds: [752] },
      ]},
      { name: 'Machine Vision Cameras', slug: 'machine-vision-cameras', oldIds: [8052] },
      { name: 'Thermal Imaging Cameras', slug: 'thermal-imaging-cameras', oldIds: [775] },
      { name: 'Thermal Weapon Scopes', slug: 'thermal-weapon-scopes', oldIds: [1272] },
      { name: 'Optical Scopes & Sights', slug: 'optical-scopes-sights', oldIds: [1208, 1210, 1211] },
      { name: 'Gimbal Stabilizers', slug: 'gimbal-stabilizers', oldIds: [800] },
      { name: 'Counter-UAV & Anti-Drone Systems', slug: 'counter-uav-systems', oldIds: [1387] },
    ]
  },

  // ===== 7. POWER SYSTEMS =====
  {
    name: 'Power & Energy Systems', slug: 'power-energy-systems',
    children: [
      { name: 'LiPo/Li-ion Batteries', slug: 'lipo-liion-batteries', oldIds: [770] },
      { name: 'Battery Chargers', slug: 'battery-chargers', oldIds: [739] },
      { name: 'Portable Power Stations', slug: 'portable-power-stations', oldIds: [7067] },
      { name: 'Solar Panels', slug: 'solar-panels', oldIds: [7091] },
    ]
  },

  // ===== 8. AIRFRAME & MECHANICAL =====
  {
    name: 'Airframe & Mechanical Structures', slug: 'airframe-mechanical-structures',
    children: [
      { name: 'Drone Frames', slug: 'drone-frames', oldIds: [824] },
      { name: 'Carbon Fiber Materials', slug: 'carbon-fiber-materials', oldIds: [1421] },
    ]
  },

  // ===== 9. ELECTRONIC COMPONENTS =====
  {
    name: 'Electronic Components', slug: 'electronic-components',
    children: [
      { name: 'ICs, Chips & Modules', slug: 'ics-chips-modules', oldIds: [760] },
      { name: 'Cables, Ribbons & Wiring', slug: 'cables-ribbons-wiring', oldIds: [783] },
      { name: 'Network Equipment', slug: 'network-equipment', oldIds: [789] },
    ]
  },

  // ===== 10. EMBEDDED COMPUTING =====
  {
    name: 'Embedded Computing & AI', slug: 'embedded-computing-ai',
    children: [
      { name: 'Single-Board Computers', slug: 'single-board-computers', oldIds: [737] },
    ]
  },

  // ===== 11. ROBOTICS =====
  {
    name: 'Robotics Systems', slug: 'robotics-systems', oldIds: [1358] },

  // ===== 12. TOOLS & MAINTENANCE =====
  {
    name: 'Tools & Maintenance', slug: 'tools-maintenance',
    children: [
      { name: 'Assembly & Soldering Tools', slug: 'assembly-soldering-tools', oldIds: [753] },
      { name: 'Repair Kits & Spare Parts', slug: 'repair-kits-spare-parts', oldIds: [799] },
    ]
  },

  // ===== 13. ACCESSORIES =====
  {
    name: 'Accessories', slug: 'accessories', oldIds: [7197] },

  // ===== 14. LIGHTING =====
  {
    name: 'Lighting & Illumination', slug: 'lighting-illumination', oldIds: [1242] },

  // ===== 15. ELECTRIC MOBILITY =====
  {
    name: 'Electric Mobility', slug: 'electric-mobility',
    children: [
      { name: 'Electric Scooters', slug: 'electric-scooters', oldIds: [1478] },
      { name: 'Electric Motorcycles', slug: 'electric-motorcycles', oldIds: [1480] },
    ]
  },

  // ===== 16. INDUSTRIAL & OTHER =====
  {
    name: 'Industrial & Other Equipment', slug: 'industrial-other-equipment',
    children: [
      { name: 'Game Consoles & Industrial PCs', slug: 'industrial-pcs-consoles', oldIds: [784] },
      { name: 'Miscellaneous', slug: 'miscellaneous', oldIds: [110, 1209, 834, 7930, 7969, 7973, 7975, 7981] },
    ]
  },
];

(async () => {
  await c.connect();

  // Step 1: Delete existing new categories (id >= 10000)
  console.log('Deleting old new categories...');
  await c.query('DELETE FROM aegisky_categories WHERE id >= 10000');

  // Step 2: Create new categories
  console.log('Creating new category tree...\n');
  let nextId = 10000;
  const oldToNew = {}; // oldCatId -> newCatId
  const allNewCats = [];

  async function createCategory(catDef, parentId, depth) {
    const id = nextId++;
    const parentVal = parentId || 0;
    await c.query(
      'INSERT INTO aegisky_categories (id, name, slug, parent, description, product_count, depth) VALUES ($1, $2, $3, $4, $5, 0, $6)',
      [id, catDef.name, catDef.slug, parentVal, '', depth]
    );
    allNewCats.push({ id, name: catDef.name, slug: catDef.slug, parent: parentVal, depth });

    // Map old category IDs to this new category
    if (catDef.oldIds) {
      for (const oldId of catDef.oldIds) {
        oldToNew[oldId] = id;
      }
    }

    // Create children
    if (catDef.children) {
      for (const child of catDef.children) {
        await createCategory(child, id, depth + 1);
      }
    }
  }

  for (const topCat of NEW_CATEGORIES) {
    await createCategory(topCat, 0, 0);
  }

  console.log(`Created ${allNewCats.length} new categories`);

  // Step 3: Map products to new categories
  console.log('\nMapping products to new categories...');

  // Get all old category-product relationships from backup
  const links = await c.query('SELECT product_id, category_id FROM aegisky_product_categories_backup');
  const productNewCats = {}; // productId -> Set of newCatIds

  for (const link of links.rows) {
    const newCatId = oldToNew[link.category_id];
    if (newCatId) {
      if (!productNewCats[link.product_id]) productNewCats[link.product_id] = new Set();
      productNewCats[link.product_id].add(newCatId);
    }
  }

  // Also need to inherit parent categories (if product is in child, it's also in parent)
  // Build parent lookup
  const parentLookup = {};
  for (const cat of allNewCats) {
    parentLookup[cat.id] = cat.parent;
  }

  function getAllParents(catId) {
    const parents = [];
    let p = parentLookup[catId];
    while (p > 0) {
      parents.push(p);
      p = parentLookup[p];
    }
    return parents;
  }

  // For each product, add all parent categories
  let mappedCount = 0;
  for (const [productId, catIds] of Object.entries(productNewCats)) {
    const allCatIds = new Set(catIds);
    for (const cid of catIds) {
      for (const pid of getAllParents(cid)) {
        allCatIds.add(pid);
      }
    }

    // Build categories JSONB
    const catsJson = [...allCatIds].map(cid => {
      const cat = allNewCats.find(c => c.id === cid);
      return { id: cid, name: cat.name, slug: cat.slug };
    });

    await c.query(
      'UPDATE aegisky_products SET categories = $1::jsonb WHERE id = $2',
      [JSON.stringify(catsJson), productId]
    );
    mappedCount++;
  }

  console.log(`Mapped ${mappedCount} products to new categories`);

  // Step 4: Update product counts
  console.log('\nUpdating product counts...');
  for (const cat of allNewCats) {
    const count = await c.query(`
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS c WHERE (c->>'id')::int = $1)
    `, [cat.id]);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2',
      [parseInt(count.rows[0].cnt), cat.id]);
  }

  // Step 5: Reset old category counts to 0
  await c.query('UPDATE aegisky_categories SET product_count = 0 WHERE id < 10000');

  // Print summary
  console.log('\n=== NEW CATEGORY TREE ===\n');
  function printTree(parentId, depth) {
    const children = allNewCats.filter(c => c.parent === parentId);
    for (const child of children) {
      const indent = '  '.repeat(depth);
      console.log(`${indent}[${child.id}] ${child.name} (${child.slug})`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  // Stats
  const totalProducts = await c.query('SELECT COUNT(*) as cnt FROM aegisky_products WHERE jsonb_array_length(categories) > 0');
  const emptyProducts = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products p
    WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS c WHERE (c->>'id')::int >= 10000)`);
  console.log(`\nProducts with categories: ${totalProducts.rows[0].cnt}`);
  console.log(`Products without new categories: ${emptyProducts.rows[0].cnt}`);

  await c.end();
  console.log('\nDone!');
})();
