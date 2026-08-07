const fs = require('fs');
const path = require('path');

const dataDir = 'D:\\scraper\\data';
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('page_') && f.endsWith('.json'));

// Load standard categories
const standardCats = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'export', 'standard_52_categories.json'), 'utf8')
);
const stdById = {};
standardCats.forEach(c => { stdById[c.id] = c; });

// Known brand names to identify brand categories
const knownBrands = new Set([
  't-motor', 'armytek', 'gnb', 'kst', 'hobbywing', 'brotherhobby', 'geprc', 'iflight',
  'dji', 'betafpv', 'hglrc', 'rushfpv', 'happymodel', 'jhemcu', 'flycolor', 'rcinpower',
  'emax', 'sunnySky', 'caddx', 'runcam', 'gopro', 'frsky', 'flysky', 'crossfire', 'elrs',
  'expresslrs', 'tattu', 'cnhl', 'skyrc', 'ultrapower', 'isdt', 'hota', 'savox', 'jx',
  'feetech', 'hitec', 'flashhobby', 'mad', 'akk', 'hubsan', 'holybro', 'radxa', 'fatjay',
  'siyl', 'tarot', 'gremsy', 'nanopi', 'lilygo', 'ecoflow', 'baofeng', 'syma', 'orange pi',
  'raspberry', 'arduino', 'matek', 'pixhawk', 'cube', 'gemfan', 'hqprop', 'dalprop',
  'fifish', 'copterparts', 'lira', 'delta', 'scorpion', 'maytech', 'htrc', 'argut',
  'flywoo', 'speedybee', 'diatone', 'armattan', 'impulserc', 'shendrones', 'tbs',
  'team blacksheep', 'fatshark', 'skyzone', 'eachine', 'wltoys', 'jjrc', 'cheerson',
  'holy stone', 'potensic', 'ryze', 'autel', 'parrot', 'yuneec', 'skydio', 'wingsland',
  'xiro', 'zero tech', 'ehang', 'jjpro', 'furibee', 'eachine', 'ldarc', 'kingkong',
  'flyegg', 'transTEC', 'qav', 'lumenier', 'airblade', 'uav', 't-motor', 'tmotor',
  'у-уппо', 'аргут'
]);

// Check if a category name looks like a brand
function isBrandCategory(name) {
  const lower = name.toLowerCase().trim();
  // If the name is short and mostly uppercase/ASCII, likely a brand
  if (/^[A-Z0-9][A-Z0-9\-+]+$/.test(name.trim()) && name.length < 15) return true;
  // Check against known brands
  for (const brand of knownBrands) {
    if (lower.includes(brand)) return true;
  }
  return false;
}

// Product name keyword mapping (fallback when categories don't help)
const productNameRules = [
  [/квадрокоптер|quadcopter/i, 1],
  [/fpv.*дрон|fpv.*коптер|fpv drone|fpv.*комплект/i, 5],
  [/обучающ|учебн|трениров/i, 2],
  [/тепловиз|thermal/i, 3],
  [/водонепроницаем|waterproof|подводн/i, 4],
  [/российск|производств.*рф|дроны.*рф/i, 6],
  [/мультиротор|multirotor/i, 7],
  [/авиацион|aerial/i, 8],
  [/свп|vtol|вертикальн.*взлет/i, 9],
  [/фиксированн.*крыл|fixed.*wing|самолет/i, 10],
  [/аксессуар|accessor|комплектующ|запчаст/i, 11],
  [/робот|robot/i, 12],
  [/электростанц|power.*station|генератор|generator/i, 13],
  [/солнечн.*панел|solar.*panel/i, 14],
  [/подводн.*аппарат|fifish|underwater/i, 15],
  [/вездеход|rover|автомобил/i, 16],
  [/набор.*для.*сборк|конструктор|assembly.*kit/i, 17],
  [/противодрон|counter.*drone|anti.*drone|подавитель/i, 18],
  [/рам|frame|каркас/i, 19],
  [/автопилот|autopilot|контроллер.*полет|flight.*controller|pixhawk/i, 20],
  [/лидар|lidar/i, 21],
  [/пусков|катапульт|catapult/i, 22],
  [/приемник|receiver/i, 23],
  [/радиометр|дозиметр|radiation/i, 24],
  [/пульт.*управлен|remote.*control|аппаратур/i, 25],
  [/антенн|antenna/i, 26],
  [/мотор|motor|двигател|brushless|бесщеточн/i, 27],
  [/сервопривод|servo|сервомашинк/i, 28],
  [/пропеллер|propeller|лопаст/i, 29],
  [/камер|camera/i, 30],
  [/машинн.*зрен|machine.*vision/i, 31],
  [/спектральн.*анализатор|spectrum.*analyzer/i, 32],
  [/esc|регулятор.*скорост|speed.*controller/i, 34],
  [/фонарь|lantern|фара|светодиод|led/i, 35],
  [/аккумулятор|батаре|battery|li-po|lipo|li-ion/i, 36],
  [/зарядк|charger|зарядное/i, 37],
  [/оптическ.*прицел|rifle.*scope/i, 38],
  [/теплов.*прицел|thermal.*scope/i, 39],
  [/инструмент|tool|паяльник/i, 40],
  [/raspberry|arduino|orange.*pi|одноплатн/i, 41],
  [/чип|chip|микросхем|процессор|stm32|esp32/i, 42],
  [/монитор|monitor|дисплей|экран|очки.*fpv|видеошлем/i, 43],
  [/радиостанц|radio|передатчик|transmitter|радиомодуль/i, 44],
  [/подвес|gimbal|стабилизатор/i, 45],
  [/карбон|carbon.*fiber|углепластик/i, 47],
  [/кольц|ring/i, 48],
  [/сетев|network|wifi|wi-fi|маршрутизатор|роутер/i, 49],
  [/kyocera/i, 50],
  [/хост|host|блок.*управлен/i, 51],
];

// Category name -> standard category ID (extended)
const categoryNameToId = [
  [/квадрокоптер/i, 1],
  [/обучающ|учебн|трениров/i, 2],
  [/тепловиз.*дрон|тепловизионн.*дрон/i, 3],
  [/водонепроницаем/i, 4],
  [/fpv.*дрон|fpv.*коптер/i, 5],
  [/российск|производств.*рф|дроны.*рф/i, 6],
  [/мультиротор/i, 7],
  [/авиацион/i, 8],
  [/свп|vtol/i, 9],
  [/фиксированн.*крыл|самолет.*тип/i, 10],
  [/аксессуар|комплектующ|запчаст|дополнительн.*модул|электричеств|электронник/i, 11],
  [/робот/i, 12],
  [/электростанц|генератор/i, 13],
  [/солнечн/i, 14],
  [/подводн.*дрон|подводн.*аппарат|fifish/i, 15],
  [/вездеход|автомобил|vehicle/i, 16],
  [/набор.*сборк|конструктор/i, 17],
  [/противодрон|подавитель|глушил/i, 18],
  [/рам(ы|а)|каркас/i, 19],
  [/автопилот|контроллер.*полет/i, 20],
  [/лидар/i, 21],
  [/пусков|катапульт/i, 22],
  [/приемник/i, 23],
  [/радиометр|дозиметр|радиац/i, 24],
  [/пульт.*управлен|аппаратур.*управлен/i, 25],
  [/антенн/i, 26],
  [/мотор|двигател|бесщеточн/i, 27],
  [/сервопривод|сервомашинк/i, 28],
  [/пропеллер|лопаст/i, 29],
  [/камер/i, 30],
  [/машинн.*зрен/i, 31],
  [/спектральн.*анализатор/i, 32],
  [/fpv.*интеграц|fpv.*комплект/i, 33],
  [/esc|регулятор.*скорост/i, 34],
  [/фонарь|фара|свет|фонарик|мультифонар/i, 35],
  [/аккумулятор|батаре/i, 36],
  [/зарядк/i, 37],
  [/оптическ.*прицел/i, 38],
  [/теплов.*прицел/i, 39],
  [/инструмент/i, 40],
  [/микрокомпьютер|raspberry|orange.*pi|одноплатн|nanopi|lilygo|radxa/i, 41],
  [/чип|микросхем/i, 42],
  [/монитор|дисплей|экран|консоли|приставк/i, 43],
  [/радиостанц|передатчик|радиомодем|радиомодуль/i, 44],
  [/подвес|стабилизатор/i, 45],
  [/теплов.*камер/i, 46],
  [/карбон|углепластик/i, 47],
  [/кольц/i, 48],
  [/сетев|wifi|wi-fi|маршрутизатор|роутер/i, 49],
  [/kyocera/i, 50],
  [/хост|главн.*блок|основн.*блок/i, 51],
  [/сумк|кейс|чехол|packaging|box/i, 11], // bags/cases are accessories
  [/провод|кабель|разъем|коннектор/i, 11], // cables/connectors are accessories
  [/винт|болт|гайк|шайб|крепеж/i, 11], // fasteners are accessories
  [/наклейк|стикер|sticker/i, 11],
  [/амортизатор|damper|виброизол/i, 11],
  [/фильтр|filter/i, 11],
  [/переключатель|switch|кнопк/i, 11],
  [/регулятор.*напряжен|bec|ubec|power.*module/i, 11],
  [/buzzer|пищалк|зуммер/i, 11],
  [/gps|гпс|навигац/i, 20], // GPS modules go with autopilots
  [/barometer|барометр|compass|компас/i, 20],
  [/sensor|датчик/i, 20],
];

function mapCategoryName(name) {
  for (const [pattern, id] of categoryNameToId) {
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
console.log('Processing all products...');
let totalProducts = 0;
let categoryMapped = 0;
let nameMapped = 0;
let stillOther = 0;

const categoryCounts = {};
standardCats.forEach(c => { categoryCounts[c.id] = 0; });

const unmappedExamples = [];

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  for (const product of products) {
    totalProducts++;
    let stdCatId = 52; // default to "other"
    
    // 1. Try non-brand categories first
    if (product.categories && Array.isArray(product.categories)) {
      const nonBrandCats = product.categories.filter(c => !isBrandCategory(c.name));
      const brandCats = product.categories.filter(c => isBrandCategory(c.name));
      
      // Try non-brand categories first
      for (const cat of nonBrandCats) {
        const mapped = mapCategoryName(cat.name);
        if (mapped) {
          stdCatId = mapped;
          break;
        }
      }
      
      // If still other, try all categories including brand ones (brand slug might contain product type)
      if (stdCatId === 52) {
        for (const cat of product.categories) {
          const mapped = mapCategoryName(cat.name);
          if (mapped) {
            stdCatId = mapped;
            break;
          }
        }
      }
    }
    
    // 2. If still "other", try product name
    if (stdCatId === 52) {
      const nameMappedId = mapProductName(product.name || '');
      if (nameMappedId) {
        stdCatId = nameMappedId;
        nameMapped++;
      }
    }
    
    if (stdCatId !== 52) {
      if (categoryMapped === 0 || (stdCatId !== 52 && !nameMapped)) categoryMapped++;
    } else {
      stillOther++;
      if (unmappedExamples.length < 30) {
        unmappedExamples.push({
          id: product.id,
          name: product.name,
          categories: product.categories ? product.categories.map(c => c.name) : []
        });
      }
    }
    
    categoryCounts[stdCatId]++;
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`Total products: ${totalProducts}`);
console.log(`Mapped via category: ${categoryMapped}`);
console.log(`Mapped via product name: ${nameMapped}`);
console.log(`Still "other": ${stillOther}`);
console.log(`Overall accuracy: ${(((totalProducts - stillOther) / totalProducts) * 100).toFixed(1)}%`);

console.log(`\n=== PRODUCTS PER CATEGORY ===`);
standardCats
  .map(c => ({ ...c, count: categoryCounts[c.id] }))
  .sort((a, b) => b.count - a.count)
  .forEach(c => {
    console.log(`${c.name}: ${c.count} products`);
  });

console.log(`\n=== SAMPLE UNMAPPED PRODUCTS ===`);
unmappedExamples.forEach((p, i) => {
  console.log(`${i+1}. [${p.id}] ${p.name}`);
  console.log(`   Categories: ${p.categories.join(', ')}`);
});
