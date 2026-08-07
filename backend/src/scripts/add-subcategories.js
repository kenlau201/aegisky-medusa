const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

// New sub-categories to add (starting from 10074)
const newSubCats = [
  // === Military & Defense under UAV Complete Systems (10000) ===
  { id: 10074, name: 'Military & Defense UAV', slug: 'military-defense-uav', parent: 10000, desc: 'Military-grade drones, combat UAVs, cargo drones, tethered systems, and unmanned ground vehicles for defense applications.' },
  { id: 10075, name: 'Combat & Strike Drones', slug: 'combat-strike-drones', parent: 10074, desc: 'FPV strike drones, fixed-wing attack UAVs, loitering munitions, and grenade-launching drones.' },
  { id: 10076, name: 'Heavy-Lift Cargo Drones', slug: 'heavy-lift-cargo-drones', parent: 10074, desc: 'Heavy-payload logistics drones from 50kg to 200kg capacity for military supply and transport.' },
  { id: 10077, name: 'Tethered Drone Systems', slug: 'tethered-drone-systems', parent: 10074, desc: 'Tethered power-supply drones for persistent surveillance, communications relay, and continuous flight.' },
  { id: 10078, name: 'Munitions & Payload Systems', slug: 'munitions-payload-systems', parent: 10074, desc: 'Drone munitions, weapon systems, and payload delivery mechanisms including DLM series.' },
  { id: 10079, name: 'Unmanned Ground Vehicles', slug: 'unmanned-ground-vehicles', parent: 10074, desc: 'Robot dogs, UGVs, and ground-based unmanned systems for reconnaissance and logistics.' },

  // === Brushless Motors sub-categories (10015) ===
  { id: 10080, name: 'Micro FPV Motors (11xx-15xx)', slug: 'micro-fpv-motors', parent: 10015, desc: 'Tiny whoop and toothpick motors 11xx-15xx for micro FPV drones.' },
  { id: 10081, name: 'Racing & Freestyle Motors (18xx-23xx)', slug: 'racing-freestyle-motors', parent: 10015, desc: '18xx-23xx size motors for 5-inch FPV racing and freestyle drones.' },
  { id: 10082, name: 'Cinelifter & X-Class Motors (24xx-29xx)', slug: 'cinelifter-xclass-motors', parent: 10015, desc: '24xx-29xx motors for cinelifters, X-class, and 7-10 inch long-range builds.' },
  { id: 10083, name: 'Industrial & Heavy-Lift Motors (30xx+)', slug: 'industrial-heavylift-motors', parent: 10015, desc: '30xx, 40xx, 50xx, 60xx+ large motors for industrial multirotors and heavy-lift UAVs.' },

  // === ESC sub-categories (10016) ===
  { id: 10084, name: 'Mini & Whoop ESC (≤20A)', slug: 'mini-whoop-esc', parent: 10016, desc: 'Compact ESC up to 20A for micro whoops, toothpicks, and 1-3S builds.' },
  { id: 10085, name: 'FPV Racing ESC (25-55A)', slug: 'fpv-racing-esc', parent: 10016, desc: '25-55A ESC for 5-inch FPV racing, freestyle, and 4-6S builds.' },
  { id: 10086, name: 'HV & Industrial ESC (≥60A)', slug: 'hv-industrial-esc', parent: 10016, desc: '60A+ high-voltage, waterproof, and industrial ESC for heavy-lift and commercial drones.' },

  // === Servo sub-categories (10021) ===
  { id: 10087, name: 'Micro & Mini Servos', slug: 'micro-mini-servos', parent: 10021, desc: '9g and smaller micro servos for RC planes, small UAVs, and lightweight mechanisms.' },
  { id: 10088, name: 'Standard & Digital Servos', slug: 'standard-digital-servos', parent: 10021, desc: 'Standard size digital and analog servos for general RC and UAV applications.' },
  { id: 10089, name: 'High-Torque & Industrial Servos', slug: 'high-torque-industrial-servos', parent: 10021, desc: 'Large high-torque servos for industrial UAVs, robotic arms, and heavy mechanisms.' },

  // === VTX sub-categories (10030) ===
  { id: 10090, name: '5.8GHz Video Transmitters', slug: '5-8ghz-vtx', parent: 10030, desc: '5.8GHz VTX for standard FPV, from 25mW to 3W power levels.' },
  { id: 10091, name: '1.2/1.3GHz Video Transmitters', slug: '1-2-1-3ghz-vtx', parent: 10030, desc: 'Low-frequency 1.2GHz and 1.3GHz VTX for long-range FPV and penetration.' },
  { id: 10092, name: 'Other Frequency VTX & VRX', slug: 'other-frequency-vtx-vrx', parent: 10030, desc: '2.4GHz, digital HD, and other frequency video transmitters and receivers.' },

  // === RC Receivers sub-categories (10028) ===
  { id: 10093, name: 'ELRS Receivers (ExpressLRS)', slug: 'elrs-receivers', parent: 10028, desc: 'ExpressLRS 2.4GHz and 900MHz receivers for low-latency long-range control.' },
  { id: 10094, name: 'Crossfire & 900MHz Receivers', slug: 'crossfire-900mhz-receivers', parent: 10028, desc: 'TBS Crossfire, ExpressLRS 900MHz, and other sub-GHz long-range receivers.' },
  { id: 10095, name: 'FrSky & 2.4GHz Receivers', slug: 'frsky-2-4ghz-receivers', parent: 10028, desc: 'FrSky, Flysky, DSMX, and other 2.4GHz protocol receivers.' },
  { id: 10096, name: 'Other RC Receivers', slug: 'other-rc-receivers', parent: 10028, desc: 'PWM, PPM, SBUS, and other standard RC receivers.' },

  // === Antennas sub-categories (10029) ===
  { id: 10097, name: '5.8GHz FPV Antennas', slug: '5-8ghz-fpv-antennas', parent: 10029, desc: '5.8GHz dipole, patch, pagoda, and directional antennas for FPV.' },
  { id: 10098, name: '433/868/915MHz Long-Range Antennas', slug: 'sub-ghz-long-range-antennas', parent: 10029, desc: 'Sub-GHz antennas for ELRS, Crossfire, LoRa, and long-range radio systems.' },
  { id: 10099, name: '2.4GHz WiFi & RC Antennas', slug: '2-4ghz-wifi-rc-antennas', parent: 10029, desc: '2.4GHz antennas for RC, WiFi, Bluetooth, and general 2.4GHz radio.' },
  { id: 10100, name: 'Multi-band & Cellular Antennas', slug: 'multiband-cellular-antennas', parent: 10029, desc: 'Multi-band, 4G/5G cellular, and wideband antennas for UAV data links.' },

  // === Flight Controllers sub-categories (10023) ===
  { id: 10101, name: 'FPV Flight Controllers (F4/F7/AIO)', slug: 'fpv-flight-controllers', parent: 10023, desc: 'F4, F7, H7 and AIO flight controllers for FPV racing, freestyle, and multirotors.' },
  { id: 10102, name: 'Industrial Autopilots (Pixhawk/CUAV)', slug: 'industrial-autopilots', parent: 10023, desc: 'Pixhawk, CUAV, Holybro, and ArduPilot/PX4 industrial autopilots for commercial UAVs.' },
  { id: 10103, name: 'GPS & Navigation Modules', slug: 'gps-navigation-modules', parent: 10023, desc: 'GPS modules, GNSS receivers, compasses, rangefinders, and navigation sensors.' },
  { id: 10104, name: 'PDB, PMU & FC Accessories', slug: 'pdb-pmu-fc-accessories', parent: 10023, desc: 'Power distribution boards, PMUs, pitot tubes, and flight controller accessories.' },

  // === Batteries sub-categories (10049) ===
  { id: 10105, name: '1-3S LiPo Batteries', slug: '1-3s-lipo-batteries', parent: 10049, desc: '1S to 3S LiPo batteries for micro whoops, small FPV, and lightweight builds.' },
  { id: 10106, name: '4-6S LiPo Batteries', slug: '4-6s-lipo-batteries', parent: 10049, desc: '4S to 6S LiPo batteries for 5-inch FPV, freestyle, and medium multirotors.' },
  { id: 10107, name: '6S+ LiPo & Li-ion Batteries', slug: '6s-plus-lipo-liion-batteries', parent: 10049, desc: 'High-voltage 6S+ LiPo and Li-ion battery packs for industrial and long-range UAVs.' },
  { id: 10108, name: 'Smart & Intelligent Batteries', slug: 'smart-intelligent-batteries', parent: 10049, desc: 'DJI Intelligent Flight Batteries and other smart battery management system packs.' },

  // === Chargers sub-categories (10050) ===
  { id: 10109, name: 'RC/FPV Balance Chargers', slug: 'rc-fpv-balance-chargers', parent: 10050, desc: 'HOTA, ToolkitRC, ISDT, SkyRC balance chargers for LiPo/LiHV RC batteries.' },
  { id: 10110, name: 'Industrial & Multi-Chemistry Chargers', slug: 'industrial-multichemistry-chargers', parent: 10050, desc: 'Multi-chemistry chargers for Li-ion, Pb, NiMH, and industrial battery packs.' },
  { id: 10111, name: 'Power Supplies & Adapters', slug: 'power-supplies-adapters', parent: 10050, desc: 'Power supply units, AC/DC adapters, and charging accessories.' },

  // === Robotics sub-categories (10062) ===
  { id: 10112, name: 'Quadruped Robot Dogs', slug: 'quadruped-robot-dogs', parent: 10062, desc: 'Four-legged robot dogs for inspection, surveillance, and research applications.' },
  { id: 10113, name: 'UGV & Tracked Robots', slug: 'ugv-tracked-robots', parent: 10062, desc: 'Wheeled and tracked unmanned ground vehicles for logistics and reconnaissance.' },
  { id: 10114, name: 'Robot Parts & Controllers', slug: 'robot-parts-controllers', parent: 10062, desc: 'Robot motors, controllers, sensors, and spare parts for robotic systems.' },

  // === Thermal Cameras sub-categories (10043) ===
  { id: 10115, name: 'Handheld Thermal Cameras', slug: 'handheld-thermal-cameras', parent: 10043, desc: 'Portable handheld thermal imagers for inspection and surveillance.' },
  { id: 10116, name: 'Drone-Mounted Thermal Cameras', slug: 'drone-mounted-thermal-cameras', parent: 10043, desc: 'Thermal cameras designed for UAV integration and aerial thermography.' },

  // === Gimbals sub-categories (10046) ===
  { id: 10117, name: 'FPV & Action Camera Gimbals', slug: 'fpv-action-camera-gimbals', parent: 10046, desc: 'Lightweight gimbals for FPV and action cameras on small multirotors.' },
  { id: 10118, name: 'Camera & Payload Gimbals', slug: 'camera-payload-gimbals', parent: 10046, desc: 'Professional gimbals for mirrorless/DSLR cameras, thermal payloads, and industrial use.' },
];

(async () => {
  await c.connect();

  // Insert new sub-categories
  console.log('Inserting new sub-categories...');
  for (const cat of newSubCats) {
    await c.query(`
      INSERT INTO aegisky_categories (id, name, slug, parent, description, product_count, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 0, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET name=$2, slug=$3, parent=$4, description=$5
    `, [cat.id, cat.name, cat.slug, cat.parent, cat.desc]);
  }
  console.log(`Inserted ${newSubCats.length} new sub-categories`);

  // Get all products for re-mapping
  const products = await c.query('SELECT id, name, price FROM aegisky_products');
  const allCats = await c.query('SELECT id, name, slug, parent FROM aegisky_categories WHERE id >= 10000');
  const catById = {};
  for (const cat of allCats.rows) catById[cat.id] = cat;

  // Build parent lookup
  const parentLookup = {};
  for (const cat of allCats.rows) parentLookup[cat.id] = cat.parent;

  function getAllParents(catId) {
    const parents = [];
    let p = parentLookup[catId];
    while (p > 0) {
      parents.push(p);
      p = parentLookup[p];
    }
    return parents;
  }

  // Classification functions
  function classifyMotor(name) {
    const n = name.toLowerCase();
    // Extract motor size like 2207, 2806, 4214, 1305, etc.
    const sizeMatch = n.match(/(\d{4})\s*[kvм]/);
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1]);
      const firstTwo = Math.floor(size / 100);
      if (firstTwo <= 15) return [10080]; // micro
      if (firstTwo >= 18 && firstTwo <= 23) return [10081]; // racing
      if (firstTwo >= 24 && firstTwo <= 29) return [10082]; // cinelifter
      if (firstTwo >= 30) return [10083]; // industrial
    }
    // Fallback by keywords
    if (n.match(/\b\d{2}\d{2}\b/)) {
      const m = n.match(/\b(\d{2})(\d{2})\b/);
      if (m) {
        const stator = parseInt(m[1]);
        if (stator <= 15) return [10080];
        if (stator >= 18 && stator <= 23) return [10081];
        if (stator >= 24 && stator <= 29) return [10082];
        if (stator >= 30) return [10083];
      }
    }
    if (n.includes('whoop') || n.includes('tiny') || n.includes('mobula') || n.includes('1s')) return [10080];
    if (n.includes('industrial') || n.includes('t-motor p6') || n.includes('t-motor p8') || n.includes('u-powe') || n.includes('mad ')) return [10083];
    return [10081]; // default to racing
  }

  function classifyESC(name) {
    const n = name.toLowerCase();
    const ampMatch = n.match(/(\d+)\s*[аa]/);
    if (ampMatch) {
      const amps = parseInt(ampMatch[1]);
      if (amps <= 20) return [10084];
      if (amps >= 25 && amps <= 55) return [10085];
      if (amps >= 60) return [10086];
    }
    if (n.includes('aio') || n.includes('whoop') || n.includes('1s') || n.includes('13a') || n.includes('20a')) return [10084];
    if (n.includes('wp') || n.includes('waterproof') || n.includes('hv') || n.includes('100a') || n.includes('80a') || n.includes('150a') || n.includes('500a')) return [10086];
    return [10085]; // default to FPV racing
  }

  function classifyServo(name) {
    const n = name.toLowerCase();
    if (n.includes('9g') || n.includes('micro') || n.includes('nano') || n.includes('sg90') || n.includes('mg90')) return [10087];
    if (n.includes('high torque') || n.includes('large') || n.includes('industrial') || n.includes('100kg') || n.includes('50kg') || n.includes('20kg')) return [10089];
    if (n.includes('digital') || n.includes('standard') || n.includes('mg996') || n.includes('ds32')) return [10088];
    return [10088]; // default to standard
  }

  function classifyVTX(name) {
    const n = name.toLowerCase();
    if (n.includes('5.8') || n.includes('5,8') || n.includes('5800') || n.includes('5.8g')) return [10090];
    if (n.includes('1.2') || n.includes('1,2') || n.includes('1.3') || n.includes('1,3') || n.includes('1.2g') || n.includes('1.3g')) return [10091];
    if (n.includes('elrs') || n.includes('2.4') || n.includes('hd') || n.includes('walksnail') || n.includes('hdzero') || n.includes('vista')) return [10092];
    return [10090]; // default to 5.8
  }

  function classifyReceiver(name) {
    const n = name.toLowerCase();
    if (n.includes('elrs') || n.includes('expresslrs')) return [10093];
    if (n.includes('crossfire') || n.includes('915') || n.includes('900mhz') || n.includes('868') || n.includes('433')) return [10094];
    if (n.includes('frsky') || n.includes('flysky') || n.includes('dsmx') || n.includes('dsm2') || n.includes('sfus') || n.includes('xsr') || n.includes('xm+') || n.includes('r-xsr')) return [10095];
    return [10096];
  }

  function classifyAntenna(name) {
    const n = name.toLowerCase();
    if (n.includes('5.8') || n.includes('5,8') || n.includes('pagoda') || n.includes('cherry') || n.includes('fpv') || n.includes('rhcp') || n.includes('lhcp')) return [10097];
    if (n.includes('433') || n.includes('868') || n.includes('915') || n.includes('yagi') || n.includes('long range') || n.includes('crossfire') || n.includes('elrs')) return [10098];
    if (n.includes('2.4') || n.includes('wifi') || n.includes('bluetooth') || n.includes('2,4')) return [10099];
    if (n.includes('4g') || n.includes('5g') || n.includes('cellular') || n.includes('lte') || n.includes('gsm') || n.includes('multi-band') || n.includes('multiband')) return [10100];
    return [10097]; // default to 5.8 FPV
  }

  function classifyFC(name) {
    const n = name.toLowerCase();
    if (n.includes('gps') || n.includes('gnss') || n.includes('m9n') || n.includes('m8n') || n.includes('m10') || n.includes('compass') || n.includes('rangefinder') || n.includes('высотомер') || n.includes('радиовысотомер') || n.includes('pitot') || n.includes('скорости')) return [10103];
    if (n.includes('pixhawk') || n.includes('cuav') || n.includes('holybro') || n.includes('ardupilot') || n.includes('px4') || n.includes('autopilot') || n.includes('x25') || n.includes('v5+') || n.includes('durandal')) return [10102];
    if (n.includes('pdb') || n.includes('power distribution') || n.includes('pmu') || n.includes('battery monitor') || n.includes('распределительн')) return [10104];
    if (n.includes('f4') || n.includes('f7') || n.includes('h7') || n.includes('aio') || n.includes('flight controller') || n.includes('полётн') || n.includes('blitz') || n.includes('hakrc') || n.includes('matek') || n.includes('geprc') || n.includes('iflight') || n.includes('stack')) return [10101];
    return [10101]; // default to FPV FC
  }

  function classifyBattery(name) {
    const n = name.toLowerCase();
    if (n.includes('mavic') || n.includes('phantom') || n.includes('spark') || n.includes('intelligent') || n.includes('dji') || n.includes('интеллектуальн')) return [10108];
    const sMatch = n.match(/(\d)s\b/) || n.match(/(\d)\s*s\s/);
    if (sMatch) {
      const s = parseInt(sMatch[1]);
      if (s <= 3) return [10105];
      if (s >= 4 && s <= 6) return [10106];
      if (s > 6) return [10107];
    }
    if (n.includes('1s') || n.includes('2s') || n.includes('3s') || n.includes('bt2') || n.includes('ph2.0')) return [10105];
    if (n.includes('li-ion') || n.includes('li ion') || n.includes('li-ion') || n.includes('18650') || n.includes('21700') || n.includes('20700') || n.includes('22000') || n.includes('16000') || n.includes('30000') || n.includes('60ач') || n.includes('10s')) return [10107];
    if (n.includes('4s') || n.includes('5s') || n.includes('6s')) return [10106];
    return [10106]; // default to 4-6S
  }

  function classifyCharger(name) {
    const n = name.toLowerCase();
    if (n.includes('adapter') || n.includes('power supply') || n.includes('блок питания') || n.includes('адаптер') || n.includes('psu') || n.includes('24v') || n.includes('12v')) return [10111];
    if (n.includes('hota') || n.includes('toolkitrc') || n.includes('isdt') || n.includes('skyrc') || n.includes('imax') || n.includes('gensace') || n.includes('gt power') || n.includes('ev peak') || n.includes('ultra power') || n.includes('up1') || n.includes('m6') || n.includes('m7') || n.includes('m8') || n.includes('d6') || n.includes('b6') || n.includes('c4') || n.includes('nc2500')) return [10109];
    if (n.includes('multi') || n.includes('industrial') || n.includes('pb') || n.includes('nimh') || n.includes('lead') || n.includes('universal')) return [10110];
    return [10109]; // default to RC charger
  }

  function classifyRobot(name) {
    const n = name.toLowerCase();
    if (n.includes('собака') || n.includes('dog') || n.includes('dg2') || n.includes('db2') || n.includes('quadruped') || n.includes('go2') || n.includes('b2')) return [10112];
    if (n.includes('dfl-10') || n.includes('dfl-12') || n.includes('гусеничн') || n.includes('tracked') || n.includes('wheeled') || n.includes('ugv') || n.includes('колесн')) return [10113];
    return [10114];
  }

  function classifyThermal(name) {
    const n = name.toLowerCase();
    if (n.includes('handheld') || n.includes('портативн') || n.includes('ручн') || n.includes('monocular') || n.includes('scope') || n.includes('прицел')) return [10115];
    return [10116];
  }

  function classifyGimbal(name) {
    const n = name.toLowerCase();
    if (n.includes('fpv') || n.includes('action') || n.includes('gopro') || n.includes('insta360') || n.includes('osmo') || n.includes('tiny')) return [10117];
    return [10118];
  }

  // Military product IDs from backup
  const milProducts = await c.query(`
    SELECT DISTINCT product_id FROM aegisky_product_categories_backup WHERE category_id IN (1409, 1459)
  `);
  const milProductIds = new Set(milProducts.rows.map(r => r.product_id));

  function classifyMilitary(name) {
    const n = name.toLowerCase();
    const cats = [10074]; // always in Military parent
    if (n.includes('боеприпас') || n.includes('dlm') || n.includes('munitions') || n.includes('payload system') || n.includes('оружие') || n.includes('гранатомет')) {
      cats.push(10078);
    } else if (n.includes('привязн') || n.includes('tethered') || n.includes('fy-x') || n.includes('fxxl') || n.includes('fyxl')) {
      cats.push(10077);
    } else if (n.includes('грузовик') || n.includes('cargo') || n.includes('лифт') || n.includes('cp150') || n.includes('cp100') || n.includes('50 кг') || n.includes('200 кг') || n.includes('150 кг') || n.includes('100 кг')) {
      cats.push(10076);
    } else if (n.includes('робот') || n.includes('robot') || n.includes('собака') || n.includes('dog') || n.includes('dfl-')) {
      cats.push(10079);
    } else if (n.includes('ударн') || n.includes('strike') || n.includes('combat') || n.includes('крылат') || n.includes('attack') || n.includes('fpv') || n.includes('дрон') || n.includes('dhf')) {
      cats.push(10075);
    } else {
      cats.push(10075); // default to combat
    }
    return cats;
  }

  // Map each product to its existing new categories + new sub-categories
  console.log('Classifying products into sub-categories...');
  let classified = 0;

  for (const prod of products.rows) {
    const name = prod.name || '';
    const n = name.toLowerCase();

    // Get existing categories from product
    const existingResult = await c.query('SELECT categories FROM aegisky_products WHERE id = $1', [prod.id]);
    let existingCats = [];
    try {
      existingCats = existingResult.rows[0]?.categories || [];
    } catch(e) {}

    const existingIds = new Set(existingCats.map(c => c.id));
    const newCatsToAdd = new Set();

    // Military classification
    if (milProductIds.has(prod.id)) {
      for (const mc of classifyMilitary(name)) {
        newCatsToAdd.add(mc);
      }
    }

    // Motor sub-classification
    if (existingIds.has(10015)) {
      for (const sc of classifyMotor(name)) newCatsToAdd.add(sc);
    }

    // ESC sub-classification
    if (existingIds.has(10016)) {
      for (const sc of classifyESC(name)) newCatsToAdd.add(sc);
    }

    // Servo sub-classification
    if (existingIds.has(10021)) {
      for (const sc of classifyServo(name)) newCatsToAdd.add(sc);
    }

    // VTX sub-classification
    if (existingIds.has(10030)) {
      for (const sc of classifyVTX(name)) newCatsToAdd.add(sc);
    }

    // Receiver sub-classification
    if (existingIds.has(10028)) {
      for (const sc of classifyReceiver(name)) newCatsToAdd.add(sc);
    }

    // Antenna sub-classification
    if (existingIds.has(10029)) {
      for (const sc of classifyAntenna(name)) newCatsToAdd.add(sc);
    }

    // FC sub-classification
    if (existingIds.has(10023)) {
      for (const sc of classifyFC(name)) newCatsToAdd.add(sc);
    }

    // Battery sub-classification
    if (existingIds.has(10049)) {
      for (const sc of classifyBattery(name)) newCatsToAdd.add(sc);
    }

    // Charger sub-classification
    if (existingIds.has(10050)) {
      for (const sc of classifyCharger(name)) newCatsToAdd.add(sc);
    }

    // Robot sub-classification
    if (existingIds.has(10062)) {
      for (const sc of classifyRobot(name)) newCatsToAdd.add(sc);
    }

    // Thermal sub-classification
    if (existingIds.has(10043)) {
      for (const sc of classifyThermal(name)) newCatsToAdd.add(sc);
    }

    // Gimbal sub-classification
    if (existingIds.has(10046)) {
      for (const sc of classifyGimbal(name)) newCatsToAdd.add(sc);
    }

    // Add all parent categories for new sub-cats
    const finalCats = new Set([...existingIds]);
    for (const newCatId of newCatsToAdd) {
      finalCats.add(newCatId);
      for (const pid of getAllParents(newCatId)) finalCats.add(pid);
    }

    // Build categories JSON
    const catsJson = [...finalCats].map(id => ({
      id: id,
      name: catById[id]?.name || `Category ${id}`,
      slug: catById[id]?.slug || `cat-${id}`
    }));

    await c.query('UPDATE aegisky_products SET categories = $1::jsonb WHERE id = $2',
      [JSON.stringify(catsJson), prod.id]);
    classified++;
  }

  console.log(`Classified ${classified} products`);

  // Update product counts
  console.log('Updating product counts...');
  const allNewCats = await c.query('SELECT id FROM aegisky_categories WHERE id >= 10000');
  for (const cat of allNewCats.rows) {
    const count = await c.query(`
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS c WHERE (c->>'id')::int = $1)
    `, [cat.id]);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2',
      [parseInt(count.rows[0].cnt), cat.id]);
  }

  // Print final tree
  console.log('\n=== FINAL CATEGORY TREE ===\n');
  const finalCats = await c.query('SELECT id, name, slug, parent, product_count FROM aegisky_categories WHERE id >= 10000 ORDER BY id');
  function printTree(parentId, depth) {
    const children = finalCats.rows.filter(c => c.parent === parentId).sort((a,b) => b.product_count - a.product_count);
    for (const child of children) {
      console.log(`${'  '.repeat(depth)}[${child.id}] ${child.name}: ${child.product_count}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  await c.end();
})();
