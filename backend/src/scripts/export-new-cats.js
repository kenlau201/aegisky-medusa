const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Export categories
  const cats = await c.query(`
    SELECT id, name, slug, parent, description, image_url, product_count, depth
    FROM aegisky_categories WHERE id >= 10000 ORDER BY parent, id
  `);
  const categories = cats.rows.map(r => ({
    id: r.id, name: r.name, slug: r.slug, parent: r.parent,
    description: r.description || '', image: r.image_url || '',
    productCount: r.product_count, depth: r.depth || 0
  }));

  const dataDir = path.join(__dirname, '..', '..', 'data', 'mirror');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2));
  console.log(`Exported ${categories.length} categories to data/mirror/categories.json`);

  // Build legacy map using actual old slugs from DB
  const oldCats = await c.query(`SELECT id, name, slug, parent FROM aegisky_categories WHERE id < 10000 ORDER BY id`);

  // Map old root slugs to new category slugs
  const slugMap = {
    // Motors & Propulsion
    'двигатели': 'brushless-motors',
    'esc-регуляторы': 'esc-electronic-speed-controllers',
    'лопасти-и-пропеллеры': 'propellers-blades',
    'сервоприводы-для-квадрокоптера': 'servo-motors-actuators',
    // Flight Control
    'автопилоты': 'flight-controllers-autopilots',
    // RC & Data Link
    'пульты-управления': 'rc-transmitters',
    'приёмники': 'rc-receivers',
    'антенны': 'antennas',
    'передатчики': 'video-transmitters-vtx',
    'радиостанции': 'two-way-radios-walkie-talkies',
    'дальнобойные-системы-радиометрии': 'long-range-radio-modems',
    'анализаторы-спектра': 'rf-spectrum-analyzers',
    // FPV
    'fpv-очки': 'fpv-goggles',
    'мониторы': 'fpv-monitors-displays',
    'fpv-дроны': 'fpv-racing-freestyle-drones',
    // Cameras & Imaging
    'фото-и-видео': 'cameras-video-equipment',
    'тепловизоры': 'thermal-imaging-cameras',
    'тепловизионные-прицелы': 'thermal-weapon-scopes',
    'подвесы': 'gimbal-stabilizers',
    'противодействия-дронам-и-бпла': 'counter-uav-anti-drone-systems',
    'камеры-машинного-зрения': 'machine-vision-cameras',
    'дроны-с-тепловизором': 'thermal-imaging-drones',
    'оптические-прицелы': 'optical-scopes-sights',
    // Power
    'акб': 'lipoli-ion-batteries',
    'зарядные-устроиства': 'battery-chargers',
    'портативные-электростанции-2': 'portable-power-stations',
    'солнечные-панели-2': 'solar-panels',
    // Drones
    'квадрокоптеры': 'multirotor-uav',
    'мультикоптеры': 'multirotor-uav',
    'дроны-рф': 'russian-made-drones',
    'дроны-с-неподвижным-крылом': 'fixed-wing-uav',
    'дроны-самолётного-типа': 'fixed-wing-uav',
    'дроны-с-вертикальным-взлётом-и-посадк': 'vtol-uav',
    'подводные-дроны': 'underwater-rov-drones',
    'дроны-для-обучения': 'training-drones',
    'водонепроницаемые-дроны': 'waterproof-drones',
    'комплекты-для-сборки-дронов': 'drone-diy-kits',
    // Airframe
    'купить-раму-для-квадрокоптера': 'drone-frames',
    'карбоновые-материалы': 'carbon-fiber-materials',
    // Electronics
    'микросхемы-чипы': 'ics-chips-modules',
    'шлейфы': 'cables-ribbons-wiring',
    'сетевое-оборудование': 'network-equipment',
    'микрокомпьютеры': 'single-board-computers',
    // Robotics
    'роботы': 'robotics-systems',
    // Tools
    'инструмент': 'tools-maintenance',
    // Accessories
    'аксессуары': 'accessories',
    'фонари': 'lighting-illumination',
    // Other
    'прочее': 'miscellaneous',
    'игровые-консоли-и-приставки': 'game-consoles-industrial-pcs',
    'средства-передвижения': 'electric-mobility',
    'ремкомплекты-kyocera': 'repair-kits-spare-parts',
    // Military
    'российские-военные-дроны': 'military-defense-uav',
  };

  const legacyMap = {};
  for (const old of oldCats.rows) {
    // Decode URL-encoded slug
    let slug = old.slug;
    try { slug = decodeURIComponent(slug); } catch(e) {}
    if (slugMap[slug]) {
      legacyMap[old.slug] = slugMap[slug];
    } else if (slugMap[old.slug]) {
      legacyMap[old.slug] = slugMap[old.slug];
    }
  }

  // Also add URL-encoded versions
  for (const [oldSlug, newSlug] of Object.entries(slugMap)) {
    const encoded = encodeURIComponent(oldSlug);
    if (encoded !== oldSlug) legacyMap[encoded] = newSlug;
    legacyMap[oldSlug] = newSlug;
  }

  // Write backend legacy redirects
  const backendLibDir = path.join(__dirname, '..', 'lib');
  const legacyJs = `// Legacy category redirects - auto-generated ${new Date().toISOString()}
module.exports.LEGACY_CATEGORY_MAP = ${JSON.stringify(legacyMap, null, 2)};
`;
  fs.writeFileSync(path.join(backendLibDir, 'legacy-redirects.js'), legacyJs);
  console.log(`Updated backend legacy-redirects.js with ${Object.keys(legacyMap).length} mappings`);

  // Write frontend legacy slugs
  const frontendLibDir = path.join(__dirname, '..', '..', 'storefront', 'src', 'lib');
  if (!fs.existsSync(frontendLibDir)) fs.mkdirSync(frontendLibDir, { recursive: true });
  const legacyTs = `// Legacy category slug redirects - auto-generated
export const LEGACY_SLUG_MAP: Record<string, string> = ${JSON.stringify(legacyMap, null, 2)};
`;
  fs.writeFileSync(path.join(frontendLibDir, 'legacy-slugs.ts'), legacyTs);
  console.log(`Updated frontend legacy-slugs.ts with ${Object.keys(legacyMap).length} mappings`);

  await c.end();
  console.log('\nDone!');
})();
