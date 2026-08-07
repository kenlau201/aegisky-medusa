const fs = require('fs');
const path = require('path');

const dataDir = 'D:\\scraper\\data';
const exportDir = path.join(__dirname, 'export');
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('page_') && f.endsWith('.json'));

// Load standard categories
const standardCats = JSON.parse(
  fs.readFileSync(path.join(exportDir, 'standard_52_categories.json'), 'utf8')
);

// Known brand names to identify brand categories
const knownBrands = new Set([
  't-motor', 'armytek', 'gnb', 'kst', 'hobbywing', 'brotherhobby', 'geprc', 'iflight',
  'dji', 'betafpv', 'hglrc', 'rushfpv', 'happymodel', 'jhemcu', 'flycolor', 'rcinpower',
  'emax', 'sunnysky', 'caddx', 'runcam', 'gopro', 'frsky', 'flysky', 'crossfire', 'elrs',
  'expresslrs', 'tattu', 'cnhl', 'skyrc', 'ultrapower', 'isdt', 'hota', 'savox', 'jx',
  'feetech', 'hitec', 'flashhobby', 'mad', 'akk', 'hubsan', 'holybro', 'radxa', 'fatjay',
  'siyl', 'siyi', 'tarot', 'gremsy', 'nanopi', 'lilygo', 'ecoflow', 'baofeng', 'syma',
  'orange pi', 'raspberry', 'arduino', 'matek', 'pixhawk', 'cube', 'gemfan', 'hqprop',
  'dalprop', 'fifish', 'copterparts', 'lira', 'delta', 'scorpion', 'maytech', 'htrc',
  'argut', 'flywoo', 'speedybee', 'diatone', 'armattan', 'impulserc', 'shendrones', 'tbs',
  'fatshark', 'skyzone', 'eachine', 'wltoys', 'jjrc', 'cheerson', 'holy stone', 'potensic',
  'ryze', 'autel', 'parrot', 'yuneec', 'skydio', 'wingsland', 'xiro', 'zero tech', 'ehang',
  'ldarc', 'kingkong', 'transtec', 'lumenier', 'airblade', 'futaba', 'hotrc', 'dumborc',
  'bayckrc', 'flytofpv', 'beastfpv', 'hawkeye', 'lattepanda', 'bigtreetech', 'nvidia',
  'jetson', 'artway', 'emax', 'openipc', 'wyvern', 'caddxfpv', 'walksnail', 'hdzero',
  'twinrx', 'xrotor', 'tmotor', 'uav', 'у-уппо', 'аргут', '5.8g', '2.4g', '1.2g', '1.3g'
]);

function isBrandCategory(name) {
  const lower = name.toLowerCase().trim();
  if (/^[A-Z0-9][A-Z0-9\-+.]+$/.test(name.trim()) && name.length < 20) return true;
  for (const brand of knownBrands) {
    if (lower.includes(brand)) return true;
  }
  return false;
}

// Category name patterns -> standard category ID
const categoryRules = [
  // Drones
  [/квадрокоптер/i, 1],
  [/обучающ|учебн|трениров/i, 2],
  [/тепловиз.*дрон|тепловизионн.*дрон/i, 3],
  [/водонепроницаем/i, 4],
  [/fpv.*дрон|fpv.*коптер/i, 5],
  [/российск|производств.*рф|дроны.*рф|производство.*рф/i, 6],
  [/мультиротор/i, 7],
  [/авиацион/i, 8],
  [/свп|vtol|вертикальн.*взлет/i, 9],
  [/фиксированн.*крыл|самолет.*тип|крылат/i, 10],
  [/подводн.*дрон|подводн.*аппарат|fifish/i, 15],
  [/военн|боев/i, 1],
  [/игрушк/i, 1],
  [/дрон.*камер|готов.*дрон|готовый коптер|rtf|bnf/i, 1],
  [/профессиональн.*дрон|промышленн.*дрон|для.*предприят/i, 1],
  [/сельскохозяйственн|агродрон/i, 1],
  [/грузов|доставк|cargo|heavy.*lift/i, 1],
  
  // Counter drones
  [/противодрон|противодрон|counter.*drone|anti.*drone|подавитель|глушил|ружье.*дрон|подавлен.*дрон/i, 18],
  
  // Robot
  [/робот|робототехник|гуманоид|робопес/i, 12],
  
  // Vehicle
  [/вездеход|rover|автомобил|vehicle|грунтов/i, 16],
  
  // Power
  [/электростанц|power.*station|генератор|generator/i, 13],
  [/солнечн/i, 14],
  
  // Kits
  [/набор.*сборк|конструктор|assembly.*kit/i, 17],
  
  // Frames
  [/рам(ы|а|у)|каркас|корпус.*коптер/i, 19],
  
  // Autopilot
  [/автопилот|контроллер.*полет|полетн.*контроллер|pixhawk|matek|holybro/i, 20],
  [/gps|гпс|навигац|барометр|компас|датчик|sensor/i, 20],
  
  // Lidar
  [/лидар|lidar|лазерн.*радар/i, 21],
  
  // Launch pad
  [/пусков|катапульт|catapult|стартов.*площадк/i, 22],
  
  // Receiver (note: приёмник with ё)
  [/приемник|приёмник|receiver|приемопередатчик|приёмопередатчик|видеоприем|видеоприём|vrx/i, 23],
  
  // Radiometry
  [/радиометр|дозиметр|радиац/i, 24],
  
  // Control panel / transmitter
  [/пульт.*управлен|аппаратур.*управлен|передатчик.*управлен|пульт/i, 25],
  
  // Antenna
  [/антенн|antenna/i, 26],
  
  // Motors
  [/мотор|двигател|бесщеточн|brushless|т-мотор|t-motor.*двиг|brotherhobby|flashhobby|emax.*мотор|sunnySky|iFlight.*мотор|mad.*мотор|scorpion.*мотор|maytech.*мотор|xrotor/i, 27],
  
  // Servo
  [/сервопривод|сервомашинк|servo|servomotor|kst|jx.*серв|feetech|hitec.*серв|savox/i, 28],
  
  // Propellers
  [/пропеллер|проп|лопаст|лопатк|gemfan|hqprop|dalprop/i, 29],
  
  // Machine vision camera
  [/машинн.*зрен|machine.*vision|техническ.*зрен/i, 31],
  
  // Cameras
  [/камер|camera|видеокамер|фотокамер|экшен.*камер|caddx|runcam|gopro|камер.*задн.*вида/i, 30],
  
  // Spectrum analyzer
  [/спектральн.*анализатор|анализатор.*спектра|spectrum/i, 32],
  
  // FPV integration
  [/fpv.*интеграц|fpv.*систем|fpv.*комплект/i, 33],
  
  // ESC
  [/esc|регулятор.*скорост|регулятор.*хода|speed.*controller|хоббивинг|hobbywing.*esc|flycolor/i, 34],
  
  // Light/Lantern
  [/фонарь|фонарик|фара|светодиод|led.*свет|подсветк|освещен|armytek|мультифонар/i, 35],
  
  // Battery
  [/аккумулятор|батаре|battery|li-po|lipo|li-ion|литий|tattu|cnhl|gnb.*аккум|18650|21700|аккум.*сборк/i, 36],
  
  // Charger
  [/зарядк|charger|зарядное|charging|skyrc|ultrapower|isdt|hota|htrc|зарядн.*станци/i, 37],
  
  // Rifle scope
  [/оптическ.*прицел|прицел.*оптическ|коллиматорн.*прицел/i, 38],
  
  // Thermal scope
  [/теплов.*прицел|тепловизионн.*прицел/i, 39],
  
  // Thermal camera
  [/теплов.*камер|тепловизионн.*камер/i, 46],
  
  // Tools
  [/инструмент|паяльник|отвертк|ключ.*шестигран|кусачк|пинцет|мультиметр/i, 40],
  
  // Microcomputer
  [/микрокомпьютер|миникомпьютер|raspberry|arduino|orange.*pi|одноплатн|одноплатник|nanopi|lilygo|radxa|lattepanda|jetson|bigtreetech|материнск.*плат/i, 41],
  
  // Chips
  [/чип|микросхем|процессор|stm32|esp32|atmega|микросхемы/i, 42],
  
  // Monitor / Display / FPV goggles
  [/монитор|дисплей|экран|fpv.*очки|видеошлем|очки.*fpv|консоли|приставк|hawkeye/i, 43],
  
  // Radio / Transmitter / Repeater
  [/радиостанц|радио|передатчик|transmitter|радиомодем|радиомодуль|frsky|expresslrs|elrs|crossfire|ретранслятор|повторитель|усилитель.*сигнал|видеопередатчик|vtx/i, 44],
  
  // Gimbal
  [/подвес|gimbal|стабилизатор|стабилизац|tarot|gremsy/i, 45],
  
  // Carbon
  [/карбон|carbon|углепластик|карбонов/i, 47],
  
  // Rings
  [/кольц|ring/i, 48],
  
  // Network
  [/сетев|network|wifi|wi-fi|маршрутизатор|роутер|router|свитч|switch/i, 49],
  
  // Kyocera
  [/kyocera/i, 50],
  
  // Host
  [/хост|главн.*блок|основн.*блок|блок.*управлен|центральн.*блок/i, 51],
  
  // Accessories - general
  [/аксессуар|комплектующ|запчаст|запасн.*част|дополнительн.*модул|доп.*модуль/i, 11],
  [/электричеств|электронник|электронн.*компонент/i, 11],
  [/провод|кабель|разъем|коннектор|connector/i, 11],
  [/винт|болт|гайк|шайб|крепеж/i, 11],
  [/наклейк|стикер|sticker/i, 11],
  [/амортизатор|damper|виброизол/i, 11],
  [/фильтр|filter/i, 11],
  [/переключатель|switch|кнопк|тумблер/i, 11],
  [/регулятор.*напряжен|bec|ubec|power.*module/i, 11],
  [/buzzer|пищалк|зуммер/i, 11],
  [/сумк|кейс|чехол|box|packaging/i, 11],
  [/плата|плата.*управлен|плата.*развод/i, 11],
  [/модуль|module/i, 11],
  [/защита|protection|предохранитель/i, 11],
  [/термоусадк|изолент|скотч/i, 11],
  [/липучк|стяжк|хомут/i, 11],
  [/подшипник|bearing/i, 11],
  [/вал|ось|shaft/i, 11],
  [/шестерн|gear|редуктор/i, 11],
];

// Product name fallback rules
const productNameRules = [
  [/квадрокоптер|quadcopter/i, 1],
  [/fpv.*(дрон|коптер|комплект|набор)|fpv drone/i, 5],
  [/обучающ|учебн|трениров/i, 2],
  [/тепловиз|thermal.*imag/i, 3],
  [/водонепроницаем|waterproof|подводн/i, 4],
  [/российск|производств.*рф|дроны.*рф/i, 6],
  [/мультиротор|multirotor/i, 7],
  [/авиацион|aerial/i, 8],
  [/свп|vtol|вертикальн.*взлет/i, 9],
  [/фиксированн.*крыл|fixed.*wing|самолет/i, 10],
  [/подводн.*аппарат|fifish|underwater/i, 15],
  [/противодрон|counter.*drone|anti.*drone|подавитель|ружье/i, 18],
  [/робот|robot/i, 12],
  [/вездеход|rover|автомобил/i, 16],
  [/электростанц|power.*station|генератор|generator/i, 13],
  [/солнечн.*панел|solar.*panel/i, 14],
  [/набор.*сборк|конструктор|assembly.*kit/i, 17],
  [/рам(а|ы|у)|frame|каркас/i, 19],
  [/автопилот|autopilot|flight.*controller|pixhawk|matek/i, 20],
  [/лидар|lidar/i, 21],
  [/пусков|катапульт/i, 22],
  [/приемник|приёмник|receiver|vrx/i, 23],
  [/радиометр|дозиметр|radiation/i, 24],
  [/пульт|remote.*control|аппаратур/i, 25],
  [/антенн|antenna/i, 26],
  [/мотор|motor|двигател|brushless|бесщеточн/i, 27],
  [/сервопривод|servo|сервомашинк/i, 28],
  [/пропеллер|propeller|лопаст/i, 29],
  [/камер|camera/i, 30],
  [/машинн.*зрен|machine.*vision/i, 31],
  [/спектральн.*анализатор|spectrum/i, 32],
  [/esc|регулятор.*скорост|speed.*controller/i, 34],
  [/фонарь|lantern|фара|светодиод|led/i, 35],
  [/аккумулятор|батаре|battery|li-po|lipo|li-ion/i, 36],
  [/зарядк|charger|зарядное/i, 37],
  [/оптическ.*прицел|rifle.*scope/i, 38],
  [/теплов.*прицел|thermal.*scope/i, 39],
  [/инструмент|tool|паяльник/i, 40],
  [/raspberry|arduino|orange.*pi|одноплатн|jetson|lattepanda|nanopi|lilygo|radxa/i, 41],
  [/чип|chip|микросхем|процессор|stm32|esp32|плата.*bigtreetech/i, 42],
  [/монитор|monitor|дисплей|экран|очки.*fpv|видеошлем/i, 43],
  [/радиостанц|радио|передатчик|transmitter|vtx|ретранслятор/i, 44],
  [/подвес|gimbal|стабилизатор/i, 45],
  [/теплов.*камер|thermal.*camera/i, 46],
  [/карбон|carbon|углепластик/i, 47],
  [/кольц|ring/i, 48],
  [/сетев|network|wifi|wi-fi|маршрутизатор|роутер/i, 49],
  [/kyocera/i, 50],
  [/хост|host|блок.*управлен/i, 51],
  [/аксессуар|accessor|комплектующ|запчаст|кабель|разъем|коннектор/i, 11],
  [/goggles|очки/i, 43],
];

function mapCategoryName(name) {
  for (const [pattern, id] of categoryRules) {
    if (pattern.test(name)) return id;
  }
  return null;
}

function mapProductName(name) {
  for (const [pattern, id] of productNameRules) {
    if (pattern.test(name)) return id;
  }
  return null;
}

// Process all products
console.log('Processing all 6384 products with improved mapping...');
const allProducts = [];
let totalProducts = 0;
let viaCategory = 0;
let viaName = 0;
let stillOther = 0;
const categoryCounts = {};
standardCats.forEach(c => { categoryCounts[c.id] = 0; });

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  for (const product of products) {
    totalProducts++;
    let stdCatId = 52;
    let mappingSource = 'default';
    
    // 1. Try non-brand categories first
    if (product.categories && Array.isArray(product.categories)) {
      const nonBrandCats = product.categories.filter(c => !isBrandCategory(c.name));
      
      for (const cat of nonBrandCats) {
        const mapped = mapCategoryName(cat.name);
        if (mapped) {
          stdCatId = mapped;
          mappingSource = 'category:' + cat.name;
          viaCategory++;
          break;
        }
      }
      
      // 2. If still other, try all categories
      if (stdCatId === 52) {
        for (const cat of product.categories) {
          const mapped = mapCategoryName(cat.name);
          if (mapped) {
            stdCatId = mapped;
            mappingSource = 'category_all:' + cat.name;
            viaCategory++;
            break;
          }
        }
      }
    }
    
    // 3. If still "other", try product name
    if (stdCatId === 52) {
      const nameMapped = mapProductName(product.name || '');
      if (nameMapped) {
        stdCatId = nameMapped;
        mappingSource = 'name';
        viaName++;
      } else {
        stillOther++;
      }
    }
    
    categoryCounts[stdCatId]++;
    
    // Build standard category object
    const stdCat = standardCats.find(c => c.id === stdCatId);
    allProducts.push({
      ...product,
      standard_category_id: stdCatId,
      standard_category_name: stdCat ? stdCat.name : '其他',
      standard_category_slug: stdCat ? stdCat.slug : 'other',
      _mapping_source: mappingSource
    });
  }
}

console.log(`\n=== FINAL RESULTS ===`);
console.log(`Total products: ${totalProducts}`);
console.log(`Mapped via category: ${viaCategory} (${(viaCategory/totalProducts*100).toFixed(1)}%)`);
console.log(`Mapped via product name: ${viaName} (${(viaName/totalProducts*100).toFixed(1)}%)`);
console.log(`Still "other": ${stillOther} (${(stillOther/totalProducts*100).toFixed(1)}%)`);
console.log(`Overall accuracy: ${((totalProducts - stillOther) / totalProducts * 100).toFixed(1)}%`);

console.log(`\n=== PRODUCTS PER CATEGORY (sorted) ===`);
const sortedCats = standardCats
  .map(c => ({ ...c, count: categoryCounts[c.id] }))
  .sort((a, b) => b.count - a.count);

sortedCats.forEach(c => {
  const pct = (c.count / totalProducts * 100).toFixed(1);
  console.log(`${c.name}: ${c.count} products (${pct}%)`);
});

// Save
const outputPath = path.join(exportDir, 'products_with_standard_category.json');
fs.writeFileSync(outputPath, JSON.stringify(allProducts), 'utf8');
console.log(`\nSaved ${allProducts.length} products to ${outputPath}`);

// Also save category stats
fs.writeFileSync(
  path.join(exportDir, 'category_stats.json'),
  JSON.stringify(sortedCats, null, 2),
  'utf8'
);
console.log('Saved category stats to category_stats.json');
