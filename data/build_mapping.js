const fs = require('fs');
const path = require('path');

// Load WooCommerce categories
const wooCategories = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'woocommerce_categories.json'), 'utf8')
);

// Load 52 standard categories
const standardCats = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'export', 'standard_52_categories.json'), 'utf8')
);

// Build standard category lookup by slug
const stdBySlug = {};
standardCats.forEach(c => { stdBySlug[c.slug] = c; });

// Mapping rules: [regex pattern, standard category slug]
// Order matters - more specific patterns first
const mappingRules = [
  // Drones by type
  [/квадрокоптер|quadcopter/i, 'quadcopters'],
  [/fpv.*дрон|fpv.*коптер|fpv drone/i, 'fpv-drones'],
  [/обучающ|учебн|трениров|train|practice/i, 'training-drones'],
  [/тепловиз|thermal.*imag|тепловизион.*дрон/i, 'thermal-imaging-drones'],
  [/водонепроницаем|waterproof|подводн.*дрон|underwater.*drone/i, 'waterproof-drones'],
  [/российск|производств.*рф|дроны.*рф|рф.*производ/i, 'russian-drones'],
  [/мультиротор|multirotor|multi.*rotor/i, 'multirotors'],
  [/авиацион|aerial|авиац/i, 'aerial-drones'],
  [/свп|vtol|вертикальн.*взлет|vertical.*takeoff/i, 'vtol-drones'],
  [/фиксированн.*крыл|fixed.*wing|самолет.*тип|крылат/i, 'fixed-wing-drones'],
  [/подводн.*аппарат|подводн.*робот|fifish|underwater/i, 'underwater-drones'],
  [/военн|военного назначения|military|боев/i, 'quadcopters'], // Military drones go to quadcopters as main category
  [/игрушк|toy|syma|syma/i, 'quadcopters'], // Toy drones are mostly quadcopters
  [/дрон.*с.*камер|drone.*camera/i, 'quadcopters'],
  [/готов.*дрон|готовый коптер|rtf|bnf/i, 'quadcopters'],
  [/профессиональн.*дрон|промышленн.*дрон/i, 'quadcopters'],
  [/сельскохозяйственн|agricultur|агродрон/i, 'quadcopters'],
  [/грузов|доставк|cargo|heavy.*lift/i, 'quadcopters'],
  
  // Counter drones
  [/противодрон|counter.*drone|anti.*drone|подавитель|глушил|ружье.*дрон/i, 'counter-drones'],
  
  // Robot
  [/робот|robot|робототехник|гуманоид|робопес/i, 'robots'],
  
  // Vehicle / Rover
  [/вездеход|rover|автомобил|vehicle|машинк.*управляем|грунтов/i, 'vehicles'],
  
  // Power
  [/электростанц|power.*station|генератор|generator|портативн.*электростанц/i, 'portable-power-stations'],
  [/солнечн.*панел|solar.*panel|солнечн.*батаре/i, 'solar-panels'],
  
  // Drone kits
  [/набор.*для.*сборк|конструктор|assembly.*kit|kit.*дрон|набор.*коптер|собери.*сам/i, 'drone-kits'],
  
  // Frames
  [/рам|frame|каркас|рама.*коптер|корпус/i, 'frames'],
  
  // Autopilot / Flight controller
  [/автопилот|autopilot|контроллер.*полет|flight.*controller|полетн.*контроллер|pixhawk|cube|matek/i, 'autopilots'],
  
  // Lidar
  [/лидар|lidar|лазерн.*радар|laser.*radar|лидар.*сканирован/i, 'lidar'],
  
  // Launch pad / Catapult
  [/пусков|launch.*pad|катапульт|catapult|стартов.*площадк/i, 'launch-pads'],
  
  // Receiver
  [/приемник|receiver|приемопередатчик|rx/i, 'receivers'],
  
  // Radiometry / Dosimeter
  [/радиометр|radiometry|радиац|radiation|дозиметр|дозиметрич/i, 'remote-radiometry'],
  
  // Control panel / Remote control
  [/пульт.*управлен|control.*panel|remote.*control|аппаратур.*управлен|передатчик.*управлен|пульт/i, 'control-panels'],
  
  // Antenna
  [/антенн|antenna/i, 'antennas'],
  
  // Motors / Engines
  [/мотор|motor|двигател|engine|бесщеточн.*двигатель|brushless|т-мотор|t-motor|brotherhobby|flashhobby|emax|sunnySky|iFlight.*мотор/i, 'motors'],
  
  // Servo
  [/сервопривод|servo|сервомашинк|servomotor|kst|jx|feetech|hitec/i, 'servos'],
  
  // Propellers / Blades
  [/пропеллер|propeller|лопаст|blade|проп.*2.*лопаст|проп.*3.*лопаст|gemfan|hqprop|dalprop/i, 'blades-propellers'],
  
  // Cameras
  [/машинн.*зрен|machine.*vision|техническ.*зрен/i, 'machine-vision-cameras'],
  [/камер|camera|видеокамер|фотокамер|экшен.*камер|action.*cam|caddx|runcam|gopro/i, 'cameras-video'],
  
  // Spectrum analyzer
  [/спектральн.*анализатор|spectrum.*analyzer|анализатор.*спектра/i, 'spectrum-analyzers'],
  
  // FPV integration
  [/fpv.*интеграц|fpv.*integration|комплектующ.*fpv|fpv.*комплект|fpv.*систем/i, 'fpv-integration'],
  
  // ESC
  [/esc|регулятор.*скорост|speed.*controller|регулятор.*хода|хоббивинг|hobbywing|t-motor.*esc/i, 'esc-controllers'],
  
  // Lantern / Light
  [/фонарь|lantern|фара|светодиод|led.*свет|подсветк|освещен|armytek|фонарик/i, 'lanterns'],
  
  // Battery
  [/аккумулятор|батаре|battery|li-po|lipo|li-ion|литий|tattu|cnhl|gnb.*аккум|аккум.*18650|аккум.*21700/i, 'batteries'],
  
  // Charger
  [/зарядк|charger|зарядное.*устройство|charging|skyrc|ultrapower|isdt|hota/i, 'charging-equipment'],
  
  // Rifle scope
  [/оптическ.*прицел|rifle.*scope|прицел.*оптическ|коллиматорн.*прицел/i, 'rifle-scopes'],
  
  // Thermal scope
  [/теплов.*прицел|thermal.*scope|тепловизионн.*прицел/i, 'thermal-scopes'],
  
  // Thermal camera
  [/теплов.*камер|thermal.*camera|тепловизионн.*камер/i, 'thermal-cameras'],
  
  // Tools
  [/инструмент|tool|паяльник|отвертк|ключ.*шестигран|кусачк|пинцет|мультиметр/i, 'tools'],
  
  // Microcomputer
  [/микрокомпьютер|raspberry|arduino|orange.*pi|одноплатн.*компьютер|одноплатник/i, 'microcomputers'],
  
  // Chips
  [/чип|chip|микросхем|microchip|процессор|stm32|esp32|atmega/i, 'chips'],
  
  // Monitor / Display
  [/монитор|monitor|дисплей|display|экран|экранчик|fpv.*монитор|видеошлем|очки.*fpv/i, 'monitors'],
  
  // Radio / Transmitter
  [/радиостанц|radio|передатчик|transmitter|радиомодем|радиомодуль|frsky|expresslrs|elrs|crossfire|аргут/i, 'radio-stations'],
  
  // Gimbal
  [/подвес|gimbal|стабилизатор|стабилизац|камер.*подвес/i, 'gimbals'],
  
  // Carbon materials
  [/карбон|carbon.*fiber|углепластик|карбонов|carbon.*plate|carbon.*tube/i, 'carbon-materials'],
  
  // Rings
  [/кольц|ring|карбон.*кольц|амортизационн.*кольц/i, 'rings'],
  
  // Network
  [/сетев|network|wifi|wi-fi|маршрутизатор|роутер|router|свитч|switch|сетев.*оборудован/i, 'network-equipment'],
  
  // Kyocera repair kits
  [/kyocera|京瓷|ремонтн.*комплект.*kyocera/i, 'kyocera-repair-kits'],
  
  // Host / Main unit
  [/хост|host|главн.*блок|основн.*блок|блок.*управлен|main.*unit|центральн.*блок/i, 'hosts'],
  
  // Accessories (general)
  [/аксессуар|accessor|комплектующ|дополнительн.*аксессуар|запчаст|запасн.*част/i, 'accessories'],
  
  // Additional modules - map to accessories
  [/дополнительн.*модул|additional.*module|модуль.*расширен/i, 'accessories'],
  
  // Electronics / Electricity - general
  [/электричеств|электронник|electronics|электронн.*компонент|провод|кабель|разъем|коннектор|connector/i, 'accessories'],
  
  // For enterprises - map to accessories
  [/для.*предприят|for.*enterprise|корпоративн/i, 'accessories'],
  
  // Other manufacturers - map to other
  [/друг.*производител|other.*manufacturer/i, 'other'],
  
  // Copterparts brand - map to accessories
  [/copterparts/i, 'accessories'],
];

// Apply mapping
const results = wooCategories.map(cat => {
  let mappedSlug = 'other';
  let matchedRule = null;
  
  for (const [pattern, slug] of mappingRules) {
    if (pattern.test(cat.name)) {
      mappedSlug = slug;
      matchedRule = pattern.toString();
      break;
    }
  }
  
  const stdCat = stdBySlug[mappedSlug];
  return {
    woo_id: cat.id,
    woo_name: cat.name,
    product_count: cat.count,
    mapped_std_id: stdCat ? stdCat.id : 52,
    mapped_std_name: stdCat ? stdCat.name : '其他',
    mapped_std_slug: mappedSlug,
    matched_by: matchedRule || 'default'
  };
});

// Statistics
const stats = {};
let mappedCount = 0;
let unmappedCount = 0;
let mappedProducts = 0;
let unmappedProducts = 0;

results.forEach(r => {
  if (r.mapped_std_slug !== 'other') {
    mappedCount++;
    mappedProducts += r.product_count;
  } else {
    unmappedCount++;
    unmappedProducts += r.product_count;
  }
  
  if (!stats[r.mapped_std_slug]) {
    stats[r.mapped_std_slug] = {
      name: r.mapped_std_name,
      categories: 0,
      products: 0
    };
  }
  stats[r.mapped_std_slug].categories++;
  stats[r.mapped_std_slug].products += r.product_count;
});

console.log('=== MAPPING STATISTICS ===');
console.log(`Total WooCommerce categories: ${results.length}`);
console.log(`Mapped to specific categories: ${mappedCount} categories (${mappedProducts} products)`);
console.log(`Mapped to "other": ${unmappedCount} categories (${unmappedProducts} products)`);
console.log(`Category coverage: ${((mappedCount/results.length)*100).toFixed(1)}%`);
console.log(`Product coverage: ${((mappedProducts/(mappedProducts+unmappedProducts))*100).toFixed(1)}%`);

console.log('\n=== PRODUCTS PER STANDARD CATEGORY ===');
Object.entries(stats)
  .sort((a,b) => b[1].products - a[1].products)
  .forEach(([slug, s]) => {
    console.log(`${s.name}: ${s.categories} categories, ${s.products} products`);
  });

console.log('\n=== UNMAPPED CATEGORIES (top 50 by product count) ===');
results
  .filter(r => r.mapped_std_slug === 'other')
  .sort((a,b) => b.product_count - a.product_count)
  .slice(0, 50)
  .forEach(r => {
    console.log(`[${r.woo_id}] ${r.woo_name} - ${r.product_count} products`);
  });

// Save mapping
fs.writeFileSync(
  path.join(__dirname, 'category_mapping.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);

// Also save a simple ID map for quick lookup
const idMap = {};
results.forEach(r => {
  idMap[r.woo_id] = {
    std_id: r.mapped_std_id,
    std_slug: r.mapped_std_slug,
    std_name: r.mapped_std_name
  };
});

fs.writeFileSync(
  path.join(__dirname, 'category_id_map.json'),
  JSON.stringify(idMap, null, 2),
  'utf8'
);

console.log('\nSaved mapping to category_mapping.json and category_id_map.json');
