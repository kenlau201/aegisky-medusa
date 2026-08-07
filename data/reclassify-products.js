/**
 * Reclassify products using keyword matching
 * Maps products from "accessories" to correct categories based on product name keywords
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'enriched');

// Keyword patterns -> standard category slug
// Order matters - more specific patterns first
const KEYWORD_CLASSIFIER = [
  // Drones
  { pattern: /квадрокоптер|мультикоптер|беспилотник|дрон\b/i, category: 'consumer-drones', priority: 1 },
  { pattern: /FPV\s*дрон|FPV\s*drone|гоночн.*дрон/i, category: 'fpv-drones', priority: 2 },
  { pattern: /подводн.*дрон|подводн.*робот|Fifish/i, category: 'underwater-drones', priority: 2 },
  { pattern: /военн.*дрон|дрон\s*РФ|БПЛА|ударн.*дрон/i, category: 'military-drones', priority: 2 },
  { pattern: /промышленн.*дрон|корпоративн.*дрон/i, category: 'industrial-drones', priority: 2 },
  { pattern: /сельскохозяйственн.*дрон|агродрон/i, category: 'agricultural-drones', priority: 2 },
  { pattern: /тепловизионн.*дрон|дрон.*тепловизионн/i, category: 'thermal-drones', priority: 2 },
  { pattern: /игрушечн.*дрон|мини\s*дрон/i, category: 'toy-drones', priority: 2 },

  // FPV Goggles
  { pattern: /FPV\s*очки|FPV\s*goggles|видеошлем/i, category: 'fpv-goggles', priority: 2 },
  { pattern: /аксессуар.*для\s*FPV\s*очков|аксессуар.*для\s*goggles/i, category: 'fpv-goggle-accessories', priority: 2 },

  // FPV Cameras
  { pattern: /FPV\s*камера|FPV\s*camera|камера\s*для\s*FPV|RunCam|Caddx|Foxeer|Runcam|Phoenix|Nano\s*cam/i, category: 'fpv-cameras', priority: 2 },

  // VTX/VRX
  { pattern: /видеопередатчик|VTX|видео\s*передатчик|5\.8G\s*TX|2\.4G\s*TX|1\.2G\s*TX/i, category: 'vtx', priority: 2 },
  { pattern: /видеоприемник|VRX|видео\s*приемник|5\.8G\s*RX|приемник\s*видео/i, category: 'vrx', priority: 2 },

  // Antennas
  { pattern: /антенна|патч\s*антенна|клевер|диполь|patch\s*antenna|RHCP|LHCP/i, category: 'antennas', priority: 2 },

  // Radio/Transmitters/Receivers
  { pattern: /пульт\s*управления|аппаратура\s*управления|радиопульт|RadioMaster|Jumper|FrSky|FlySky|Skydroid|DumboRC|TX\s*радио/i, category: 'transmitters', priority: 2 },
  { pattern: /приемник\s*управления|радиоприемник|RX\s*приемник|FrSky\s*RX|FlySky\s*RX|ExpressLRS\s*RX|ELRS\s*RX/i, category: 'receivers', priority: 2 },
  { pattern: /аксессуар.*для\s*пульт|аксессуар.*для\s*аппаратур/i, category: 'controller-accessories', priority: 2 },

  // Motors
  { pattern: /двигатель|мотор|бесколлекторн.*двигатель|brushless\s*motor|T-Motor|BrotherHobby|EMAX\s*motor|2207|2306|2204|1806|1404|1103/i, category: 'motors', priority: 2 },

  // ESCs
  { pattern: /ESC|регулятор\s*скорости|регулятор\s*хода|4в1\s*ESC|BLHeli|BLHeli_S|BLHeli_32|AM32|ESC\s*45A|ESC\s*30A|ESC\s*20A/i, category: 'esc', priority: 2 },

  // Propellers
  { pattern: /пропеллер.*3\s*лопаст|3-лопастн.*пропеллер|3\s*blade\s*prop|T5143|T5147|HQProp\s*3|Gemfan\s*3/i, category: 'propellers-3-blade', priority: 3 },
  { pattern: /пропеллер.*2\s*лопаст|2-лопастн.*пропеллер|2\s*blade\s*prop|HQProp\s*2|Gemfan\s*2/i, category: 'propellers-2-blade', priority: 3 },
  { pattern: /пропеллер|лопаст|пропы|propeller|HQProp|Gemfan|Dalprop|T-Motor\s*P/i, category: 'propellers', priority: 1 },

  // Servos
  { pattern: /сервопривод|серва|servo\s*motor|JX\s*Servo|KST|Corona|Hitec|MG90S|SG90/i, category: 'servos', priority: 2 },

  // Frames
  { pattern: /рама\s|карбоновая\s*рама|рама\s*для|frame\s*kit|GEPRC\s*GEP|iFlight\s*frame|Armattan|Sub250|whoop\s*frame|дюймов.*рама/i, category: 'frames', priority: 2 },
  { pattern: /шасси|посадочн.*шасси|landing\s*gear|ножки\s*для/i, category: 'landing-gear', priority: 2 },

  // Gimbals
  { pattern: /подвес|стабилизатор\s*камеры|gimbal|карданный\s*подвес|SIYI\s*ZR|Gremsy|T-Motor\s*gimbal/i, category: 'gimbals', priority: 2 },
  { pattern: /аксессуар.*для\s*подвес|аксессуар.*для\s*gimbal/i, category: 'gimbal-accessories', priority: 2 },

  // Cameras
  { pattern: /камера\s|видеокамера|экшн\s*камера|action\s*camera|Hikvision|DJI\s*camera|GoPro|Insta360|камера\s*машинного\s*зрения/i, category: 'cameras', priority: 2 },
  { pattern: /объектив|линза|lens|fisheye|wide\s*angle/i, category: 'camera-lenses', priority: 2 },
  { pattern: /тепловизор|тепловизионн.*камера|thermal\s*camera|iRay|FLIR|тепловизионн.*модуль/i, category: 'thermal-cameras', priority: 2 },

  // Monitors
  { pattern: /монитор|дисплей\s*для|FPV\s*монитор|5\s*дюйм.*монитор|7\s*дюйм.*монитор|HDMI\s*монитор/i, category: 'monitors', priority: 2 },

  // Batteries
  { pattern: /аккумулятор|LiPo\s*аккумулятор|Li-ion\s*аккумулятор|батарея\s*для|Tattu|GNB\s*LiPo|4S\s*аккумулятор|6S\s*аккумулятор|1S\s*аккумулятор|mAh\s*аккумулятор/i, category: 'batteries', priority: 2 },

  // Chargers
  { pattern: /зарядное\s*устройство|зарядка\s*для|балансир|ToolkitRC|ISDT|SkyRC|HOTA\s*charger|LiPo\s*charger|зарядн.*устройство/i, category: 'chargers', priority: 2 },

  // Power supplies
  { pattern: /блок\s*питания|источник\s*питания|power\s*supply|AC\s*DC\s*адаптер|DC\s*DC\s*преобразователь|BEC\s*модуль|модуль\s*питания/i, category: 'power-supplies', priority: 2 },

  // Flight controllers
  { pattern: /полетн.*контроллер|flight\s*controller|FC\s*плата|Matek|Pixhawk|Cube\s*Orange|SpeedyBee|Betaflight\s*FC|INAV\s*FC|F4\s*FC|F7\s*FC|H7\s*FC/i, category: 'flight-controllers', priority: 2 },
  { pattern: /автопилот|autopilot|Pixhawk\s*6|Cube\s*Black|ArduPilot|PX4/i, category: 'autopilots', priority: 2 },
  { pattern: /модуль\s*питания|PDB|power\s*module|PM02|PM06/i, category: 'power-modules', priority: 2 },

  // Electronics
  { pattern: /микросхема|чип|IC\s*chip|транзистор|резистор|конденсатор|STM32|ESP32|Arduino\s*chip/i, category: 'chips-ics', priority: 2 },
  { pattern: /одноплатн.*компьютер|Raspberry\s*Pi|Orange\s*Pi|SBC|Rockchip|Allwinner/i, category: 'sbc', priority: 2 },
  { pattern: /датчик|сенсор|барометр|магнитометр|акселерометр|гироскоп|IMU|MPU6050|BMP280|GPS\s*модуль/i, category: 'sensors', priority: 2 },
  { pattern: /лидар|LiDAR|лазерн.*дальномер|range\s*finder|TF-Luna|TF-Mini|Benewake/i, category: 'lidar', priority: 2 },
  { pattern: /GPS\s*модуль|GNSS\s*модуль|GPS\s*антенна|UBLOX|NEO-6M|NEO-M8N|M10\s*GPS/i, category: 'gps', priority: 2 },
  { pattern: /сетев.*оборудование|роутер|маршрутизатор|ретранслятор|mesh\s*radio|телеметр.*радио|WiFi\s*модуль|Bluetooth\s*модуль/i, category: 'networking', priority: 2 },
  { pattern: /дополнительн.*модуль|модуль\s*расширения|плата\s*расширения|доп\s*модуль/i, category: 'electronic-modules', priority: 1 },

  // Payloads
  { pattern: /система\s*сброса|сброс\s*груза|payload\s*release|механизм\s*сброса/i, category: 'payload-release', priority: 2 },
  { pattern: /крепление\s*на\s*оружие|оружейн.*крепление|weapon\s*mount|кронштейн\s*для\s*прицела/i, category: 'weapon-mounts', priority: 2 },
  { pattern: /фонарь|светодиодн.*фонарь|стробоскоп|LED\s*свет|маячный\s*фонарь|навигационн.*огни/i, category: 'lights', priority: 2 },
  { pattern: /динамик|громкоговоритель|speaker\s*system|мегафон\s*для\s*дрона/i, category: 'speakers', priority: 2 },

  // Anti-drone
  { pattern: /противодронн.*ружье|ружье\s*против\s*дронов|антидрон.*ружье|anti-drone\s*gun|jamming\s*gun/i, category: 'anti-drone-guns', priority: 2 },
  { pattern: /детектор\s*дронов|обнаружитель\s*БПЛА|drone\s*detector|радар.*дрон|пеленгатор.*дрон/i, category: 'drone-detectors', priority: 2 },
  { pattern: /анализатор\s*спектра|spectrum\s*analyzer|частотн.*анализатор/i, category: 'spectrum-analyzers', priority: 2 },
  { pattern: /противодронн.*систем|РЭБ|радиоэлектронн.*борьб|подавитель\s*БПЛА|глушилка.*дрон|jammer.*drone|купол.*антидрон/i, category: 'anti-drone', priority: 2 },

  // Cases, tools
  { pattern: /кейс|сумка\s*для|чехол\s*для|hardcase|рюкзак\s*для| protective\s*case/i, category: 'cases-bags', priority: 2 },
  { pattern: /карта\s*памяти|microSD|SD\s*карта|SanDisk|Samsung\s*EVO|TF\s*карта/i, category: 'memory-cards', priority: 2 },
  { pattern: /инструмент|отвертка|паяльник|ключ\s*для|гаечн.*ключ|кусачки|пинцет|hex\s*tool|tool\s*kit/i, category: 'tools', priority: 2 },
  { pattern: /кабель|провод\s*для|USB\s*кабель|HDMI\s*кабель|питаниев.*кабель|silicone\s*wire/i, category: 'cables-wires', priority: 2 },
  { pattern: /разъем|разъём|коннектор|штекер|XT60|XT30|XT90|JST\s*connector|connector\s*set|банан.*разъем/i, category: 'connectors', priority: 2 },

  // Software
  { pattern: /программн.*обеспечен|прошивка|firmware|лиценз.*программ|software\s*license/i, category: 'software', priority: 2 },

  // Spare parts
  { pattern: /запасн.*част|запчасть|spare\s*part|ремкомплект|repair\s*kit/i, category: 'spare-parts', priority: 2 },

  // Robotics
  { pattern: /робот|робототехника|робопес|гуманоидн.*робот|промышленн.*робот|robot\s*arm/i, category: 'robotics', priority: 2 },

  // Two-way radios
  { pattern: /радиостанция|рация|walkie\s*talkie|двухсторонн.*радио/i, category: 'radios', priority: 2 },
];

function classifyProduct(product) {
  const name = (product.name && (product.name.ru || product.name.en)) || '';
  const description = (product.description && (product.description.ru || product.description.en)) || '';
  const text = name + ' ' + description;

  let bestMatch = null;
  let bestPriority = 0;

  for (const rule of KEYWORD_CLASSIFIER) {
    if (rule.pattern.test(text)) {
      if (rule.priority > bestPriority) {
        bestMatch = rule.category;
        bestPriority = rule.priority;
      }
    }
  }

  return bestMatch;
}

// Load products
console.log('Loading products...');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products_enriched.json'), 'utf8'));
console.log(`Total products: ${products.length}`);

// Count before
const beforeCounts = {};
products.forEach(p => {
  const cat = p.primaryCategory || 'unknown';
  beforeCounts[cat] = (beforeCounts[cat] || 0) + 1;
});

// Reclassify
let reclassified = 0;
products.forEach(product => {
  // Only reclassify if currently in accessories or other
  if (product.primaryCategory === 'accessories' || product.primaryCategory === 'other') {
    const newCategory = classifyProduct(product);
    if (newCategory && newCategory !== product.primaryCategory) {
      product.primaryCategory = newCategory;
      // Update primaryCategoryName
      const stdCats = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'standard_categories.json'), 'utf8'));
      const catInfo = stdCats.find(c => c.slug === newCategory);
      if (catInfo) {
        product.primaryCategoryName = catInfo.name;
      }
      reclassified++;
    }
  }
});

console.log(`Reclassified: ${reclassified} products`);

// Count after
const afterCounts = {};
products.forEach(p => {
  const cat = p.primaryCategory || 'unknown';
  afterCounts[cat] = (afterCounts[cat] || 0) + 1;
});

console.log();
console.log('=== Category distribution after reclassification ===');
Object.entries(afterCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    const before = beforeCounts[cat] || 0;
    const diff = count - before;
    const diffStr = diff > 0 ? `(+${diff})` : diff < 0 ? `(${diff})` : '';
    console.log(`  ${cat}: ${count} ${diffStr}`);
  });

// Save
console.log();
console.log('Saving updated products...');
fs.writeFileSync(path.join(DATA_DIR, 'products_enriched.json'), JSON.stringify(products, null, 2));
console.log('Done!');
