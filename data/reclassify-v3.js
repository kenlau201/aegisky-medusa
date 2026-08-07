/**
 * Improved product classification script v3
 * Stricter drone identification, better priority ordering
 */
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'enriched/products_enriched.json'), 'utf8'));

// Patterns that indicate this is NOT a complete drone even if "drone" appears
const NOT_DRONE_PATTERNS = [
  /anti-?drone/i, /counter.?drone/i, /противодрон/i, /антидрон/i,
  /drone.*detect/i, /обнаружитель.*дрон/i, /детектор.*дрон/i,
  /drone.*jammer/i, /подавитель.*дрон/i, /глушилка.*дрон/i,
  /for.*drone/i, /для.*дрон/i, /for.*quad/i, /для.*квадрокоптер/i,
  /drone.*accessor/i, /аксессуар.*для.*дрон/i,
  /drone.*part/i, /запчаст.*для.*дрон/i,
  /drone.*repair/i, /ремонт.*дрон/i,
  /drone.*charger/i, /зарядное.*для.*дрон/i,
  /drone.*battery/i, /аккумулятор.*для.*дрон/i,
  /drone.*propeller/i, /пропеллер.*для.*дрон/i,
  /drone.*motor/i, /мотор.*для.*дрон/i,
  /drone.*case/i, /кейс.*для.*дрон/i,
  /drone.*bag/i, /сумка.*для.*дрон/i,
  /drone.*strap/i,
  /drone.*light/i, /фара.*для.*дрон/i,
  /drone.*speaker/i, /мегафон.*для.*дрон/i,
  /drone.*drop/i, /сброс.*для.*дрон/i,
  /drone.*payload/i, /полезная.*нагрузка.*для/i,
  /drone.*landing/i, /посадочная.*площадка/i,
  /drone.*pad/i,
  /spare.*part/i, /запасная часть/i,
  /mount.*for/i, /крепление.*для/i,
  /holder.*for/i, /держатель.*для/i,
  /adapter.*for/i, /адаптер.*для/i,
  /cable.*for/i, /кабель.*для/i,
  /connector.*for/i, /разъем.*для/i,
  /filter.*for/i, /фильтр.*для/i,
  /lens.*for/i, /объектив.*для/i,
  /guard.*for/i, /защита.*для/i,
  /arm.*for/i, /луч.*для/i,
  /leg.*for/i, /нога.*для/i,
  /shell.*for/i, /корпус.*для/i,
  /cover.*for/i, /крышка.*для/i,
  /set.*for/i, /набор.*для/i,
  /kit.*for/i, /комплект.*для/i,
  /replacement/i, /сменный/i, /замена/i,
  /compatible.*with/i, /совместим.*с/i,
  /designed.*for/i, /предназначен.*для/i,
  /suitable.*for/i, /подходит.*для/i,
  /fits.*dji/i, /fits.*matrice/i, /fits.*mavic/i,
  /для.*dji/i, /для.*matrice/i, /для.*mavic/i, /для.*phantom/i,
  /для.*iflight/i, /для.*geprc/i, /для.*t-motor/i,
];

// Positive indicators that this IS a complete drone
const DRONE_POSITIVE = [
  /квадрокоптер/i, /quadcopter/i,
  /\brtf\b/i, /\bbnf\b/i, /\bpnf\b/i, /\barf\b/i,
  /готовый.*к.*полетам/i, /ready.*to.*fly/i, /bind.*and.*fly/i, /plug.*and.*fly/i,
  /гексакоптер/i, /hexacopter/i,
  /октокоптер/i, /octocopter/i,
  /трикоптер/i, /tricopter/i,
  /самолет.*р\/у/i, /\brc\s*plane/i, /fixed.?wing.*drone/i, /vtol.*drone/i,
  /подводный.*аппарат/i, /подводный.*дрон/i, /\brov\b/i,
  /fpv.*(?:комплект|набор|kit|set|ready|drone|quad|copter)/i,
  /(?:комплект|набор|kit|set).*fpv/i,
  /\bdrone\b.*(?:combo|kit|set|package|ready|rtf|bnf|pnp)/i,
  /(?:combo|kit|set|package|ready|rtf|bnf|pnp).*\bdrone\b/i,
  /квадр[оo]коптер/i,
  /дрон.*(?:комплект|набор|готовый|rtf|bnf)/i,
  /(?:комплект|набор|готовый|rtf|bnf).*дрон/i,
];

function isDrone(name, description) {
  const text = (name + ' ' + (description || '')).toLowerCase();

  // First check exclusions
  for (const pattern of NOT_DRONE_PATTERNS) {
    if (pattern.test(text)) {
      // But if it also has strong positive indicators, it might still be a drone
      // e.g., "drone combo with accessories" - but "battery for drone" is clearly not
      const strongPositive = DRONE_POSITIVE.some(p => p.test(text));
      if (!strongPositive) return false;
    }
  }

  // Check positive indicators
  for (const pattern of DRONE_POSITIVE) {
    if (pattern.test(text)) return true;
  }

  // Check for standalone "drone" or "дрон" not in exclusion context
  // Must be a complete product, not an accessory
  const standaloneDrone = /(?:^|[\s\-])(?:drone|дрон[аеуо]?м?и?)(?:[\s\-,.]|$)/i.test(text);
  if (standaloneDrone) {
    // Additional check: does it have drone-like specs?
    const hasFlightTime = /(?:flight time|время полета|время полёта)/i.test(text);
    const hasCamera = /(?:with camera|с камерой|камера)/i.test(text);
    const hasGps = /\bgps\b/i.test(text);
    const hasQuadcopterContext = /(?:ось|axis|мотор|motor|пропеллер|propeller|аккумулятор|battery|взлет|takeoff|посадка|landing)/i.test(text);
    if (hasFlightTime || (hasCamera && hasGps) || (hasQuadcopterContext && /\bdrone\b/i.test(text))) {
      return true;
    }
  }

  return false;
}

function matchesPatterns(text, patterns) {
  if (!patterns) return false;
  for (const p of patterns) {
    const regex = new RegExp(p, 'i');
    if (regex.test(text)) return true;
  }
  return false;
}

// Classification rules in priority order
const classificationRules = [
  // === COUNTER-DRONE (not drones) ===
  {
    category: 'anti-drone-guns',
    namePatterns: ['антидрон.*ружье', 'anti-?drone.*gun', 'противодроновое ружье',
                   'портативный.*подавитель.*дрон', 'portable.*drone.*jammer',
                   'глушилка.*дрон.*ружье', 'drone.*jammer.*gun', 'бластер'],
    descPatterns: ['подавитель дронов', 'антидроновое ружье']
  },
  {
    category: 'drone-detectors',
    namePatterns: ['обнаружитель.*дрон', 'детектор.*дрон', 'drone.*detect',
                   'система.*обнаружения.*дрон', 'радар.*дрон', 'radar.*drone',
                   'пеленгатор.*дрон', 'аэроскоп', 'aeroscope',
                   'система.*мониторинга.*воздушного'],
    descPatterns: ['обнаружение беспилотников', 'детектирование дронов']
  },
  {
    category: 'anti-drone',
    namePatterns: ['антидрон', 'anti-?drone', 'подавитель.*беспилотник',
                   'противодрон', 'counter.?drone', 'глушилка.*fpv',
                   'jammer.*drone', 'система.*подавлен.*беспилотник',
                   'защита.*от.*дрон', 'купол.*защита', 'шторм.*мини'],
    descPatterns: ['подавление беспилотников', 'блокировка управления дронами']
  },
  {
    category: 'spectrum-analyzers',
    namePatterns: ['спектр.*анализатор', 'spectrum.*analyz', 'анализатор.*спектр'],
    descPatterns: ['анализ спектра частот']
  },

  // === COMPLETE DRONES (must be verified as actual drones) ===
  {
    category: 'underwater-drones',
    namePatterns: ['подводн.*аппарат', 'подводн.*дрон', 'underwater.*drone', 'underwater.*rov',
                   'rov ', ' rov$', 'fifish', 'qysea', 'seaflyer', 'camoro.*underwater',
                   'водяной.*про', 'водяной-\\d+', 'submarine.*drone', 'глубоководный'],
    descPatterns: ['подводный аппарат', 'подводный дрон', 'подводный робот',
                   'remotely operated underwater', 'глубина погружения'],
    mustBeDrone: true
  },
  {
    category: 'military-drones',
    namePatterns: ['военный.*дрон', 'military.*drone', 'боевой.*дрон', 'ударный.*дрон',
                   'герань', 'шахед', 'ланцет', 'куб-?бла',
                   'fpv.*ударн', 'fpv.*боев', 'камикадзе.*дрон',
                   'barrage.*munition', 'loitering.*munition', 'дрон-?камикадзе',
                   'охранник.*м', 'сторож.*дрон'],
    descPatterns: ['военного назначения', 'боевое применение', 'ударный беспилотник'],
    mustBeDrone: true
  },
  {
    category: 'agricultural-drones',
    namePatterns: ['агродрон', 'agricultural.*drone', 'сельскохоз.*дрон',
                   'опрыскивател.*дрон', 'распылител.*дрон', 'агрокоптер',
                   'дрон.*для.*опрыскивания', 'spraying.*drone',
                   't10.*drone', 't20p.*drone', 't30.*drone', 't40.*drone',
                   'agr.*drone', 'корвет.*агро', 'грузовой.*агродрон'],
    descPatterns: ['сельского хозяйства', 'опрыскивания', 'внесения удобрений'],
    mustBeDrone: true
  },
  {
    category: 'racing-drones',
    namePatterns: ['racing.*drone', 'гоночный.*дрон', 'гонк.*дрон', 'race.*quad',
                   'fpv.*racer', 'tinywhoop', 'tiny whoop', 'cinewhoop',
                   'speed.*drone', 'гоночный.*квадрокоптер'],
    descPatterns: ['гоночный дрон', 'для гонок', 'racing quadcopter'],
    mustBeDrone: true
  },
  {
    category: 'enterprise-drones',
    namePatterns: ['matrice', 'm30 ', 'm30t', 'm300', 'm350', 'm400', 'm4e', 'm4t', 'm4td',
                   'mavic 3e', 'mavic 3t', 'mavic 3 enterprise', 'mavic 3m',
                   'phantom 4 rtk', 'phantom 4 multisp',
                   'enterprise.*drone', 'дрон.*для.*предприятий',
                   'inspire 3', 'wingtra', 'delair',
                   'm30.*rtk', 'm300.*rtk', 'm350.*rtk',
                   'matrice.*combo', 'matrice.*rtk',
                   'dj.*i.*matrice', 'm200', 'm210', 'm300', 'm350',
                   'm30t.*combo', 'm30.*combo'],
    descPatterns: ['корпоративный', 'для инспекций', 'промышленной инспекции', 'rtk.*позиционирован'],
    mustBeDrone: true
  },
  {
    category: 'thermal-drones',
    namePatterns: ['thermal.*drone', 'тепловизион.*дрон', 'дрон.*с.*тепловизор',
                   'thermal.*quad', 'mavic.*thermal', 'm3t.*drone',
                   'h20t.*combo', 'h30t.*combo', 'дрон.*теплови'],
    descPatterns: ['тепловизионная камера', 'тепловизор.*в.*комплекте'],
    mustBeDrone: true
  },
  {
    category: 'industrial-drones',
    namePatterns: ['промышленный.*дрон', 'industrial.*drone', 'грузовой.*дрон',
                   'cargo.*drone', 'heavy.*lift.*drone', 'большой.*грузоподъем.*дрон',
                   'транспортный.*дрон', 'transport.*drone', 'h300.*drone', 'h200.*drone',
                   'copilot.*h\\d+', 'корвет.*дрон'],
    descPatterns: ['промышленного назначения', 'грузоподъемность.*кг', 'для перевозки грузов'],
    mustBeDrone: true
  },
  {
    category: 'fpv-drones',
    namePatterns: ['fpv.*drone', 'fpv.*quad', 'fpv.*коптер', 'fpv.*комплект', 'fpv.*набор',
                   'fpv.*ready', 'rtf.*fpv', 'bnf.*fpv', 'pnp.*fpv',
                   'analog.*fpv.*drone', 'digital.*fpv.*drone', 'elrs.*drone',
                   'nazgul.*fpv', 'venom.*fpv', 'crux3', 'meteor.*fpv', 'protek.*fpv',
                   'iflight.*fpv.*drone', 'iflight.*nazgul', 'flywoo.*venom',
                   'для fpv.*полетов.*комплект', 'fpv.*комплект.*готовый',
                   'гексакоптер.*fpv', 'hexacopter.*fpv',
                   'fpv.*сет', 'fpv.*set', 'fpv.*kit'],
    descPatterns: ['fpv полеты', 'готовый к полетам fpv', 'fpv комплект'],
    mustBeDrone: true
  },
  {
    category: 'professional-drones',
    namePatterns: ['pro.*drone', 'professional.*drone', 'профессиональный.*дрон',
                   'autel.*evo', 'skydio', 'parrot.*anafi', 'anafi.*ai',
                   'mavic 3 pro', 'mavic 3 classic', 'mavic 3 cine',
                   'air 3', 'air 2s', 'mini 4 pro', 'mini 3 pro',
                   'evo.*max', 'evo.*lite', 'evo.*ii'],
    mustBeDrone: true
  },
  {
    category: 'consumer-drones',
    namePatterns: ['quadcopter', 'квадрокоптер', 'дрон', 'drone', 'беспилотник',
                   'mavic', 'mini', 'spark', 'tello', 'syma', 'hubsan', 'eachine',
                   'jjrc', 'holy stone', 'potensic', 'ryze', 'flip', 'avata',
                   'dji.*mini', 'dji.*air', 'dji.*avata', 'dji.*neo',
                   'dji.*mavic', 'phantom', 'cetus', 'бетавр',
                   'коптер.*готовый', 'дрон.*с.*камерой'],
    mustBeDrone: true
  },
  {
    category: 'toy-drones',
    namePatterns: ['игрушк.*дрон', 'toy.*drone', 'детский.*дрон', 'indoor.*drone'],
    mustBeDrone: true
  },

  // === FLIGHT CONTROL ===
  {
    category: 'flight-controllers',
    namePatterns: ['полетный контроллер', 'flight controller', 'flight control board',
                   '\\bfc\\b', 'f4 ', 'f7 ', 'h7 ', 'f405', 'f411', 'f722', 'f745', 'h743', 'h7a3',
                   'betaflight.*fc', 'inav.*fc', 'ardupilot.*fc', 'pixhawk', 'cube ',
                   'matek.*f', 'speedybee.*f', 'iflight.*f', 'mamba.*f', 'diatone.*mamba',
                   'контроллер полета', 'плата управления полетом']
  },
  {
    category: 'autopilots',
    namePatterns: ['автопилот', 'autopilot', 'pixhawk.*set', 'cube orange', 'cube black',
                   'ardupilot.*autopilot', 'px4.*autopilot', 'navigator.*flight']
  },
  {
    category: 'esc',
    namePatterns: ['\\besc\\b', 'регулятор.*скорост', 'регулятор.*хода', 'speed controller',
                   'blheli', 'blheli_s', 'blheli_32', 'am32', '4in1.*esc', '4-в-1.*esc',
                   'hakrc.*esc', 't-motor.*esc', 'iflight.*esc', 'hobbywing.*esc',
                   '12a.*esc', '20a.*esc', '30a.*esc', '35a.*esc', '40a.*esc', '45a.*esc',
                   '50a.*esc', '55a.*esc', '60a.*esc', '80a.*esc', '100a.*esc', '120a.*esc',
                   'esc.*регулятор', 'esc.*12s', 'esc.*6s', 'esc.*4s']
  },
  {
    category: 'power-modules',
    namePatterns: ['power module', 'модуль питания', '\\bbec\\b', '\\bubec\\b',
                   'voltage regulator', 'регулятор напряжения', 'power distribution', 'pdb',
                   'pm02', 'pm06', 'pm07']
  },
  {
    category: 'sbc',
    namePatterns: ['raspberry pi', 'raspberrypi', 'orange pi', 'jetson', 'rockchip',
                   'одноплатный компьютер', 'single board computer', '\\bsbc\\b']
  },
  {
    category: 'sensors',
    namePatterns: ['sensor', 'датчик', '\\bimu\\b', 'барометр', 'barometer', 'магнитометр',
                   'compass', 'компас', 'акселерометр', 'accelerometer', 'гироскоп', 'gyroscope',
                   'tof.*sensor', 'range.*sensor', 'distance sensor', 'оптический поток',
                   'optical flow', 'lidar-lite', 'tf-luna', 'tf02', 'vl53',
                   'inertial.*measurement', 'ins ', ' ins$']
  },
  {
    category: 'lidar',
    namePatterns: ['лидар', 'lidar', 'лазерный.*дальномер', 'laser.*range.*finder',
                   '3d.*lidar', '2d.*lidar', 'ydlidar', 'rplidar', 'unitree.*l[123]',
                   'zenmuse.*l1', 'zenmuse.*l2', 'zenmuse.*l3',
                   'livox', 'velodyne', 'ouster', 'slamtec', 'ld06', 'ld19',
                   'stl27l', 'dtof.*lidar', 'realsense.*l5']
  },
  {
    category: 'gps',
    namePatterns: ['gps.*модуль', 'gps.*module', 'gnss.*module', 'gps-', '\\bgps\\b',
                   'm8n', 'm8p', 'm9n', 'm10', 'ublox', 'neo-', 'nmea', 'rtk.*gps',
                   'gps.*rtk', 'compass.*gps', 'навигационный модуль', 'спутниковый приемник',
                   'gnss.*приемник']
  },

  // === POWER SYSTEMS ===
  {
    category: 'motors',
    namePatterns: ['brushless.*motor', 'бесколлекторный.*двигатель', 'бесколлекторный.*мотор',
                   't-motor.*motor', 'tmotor.*motor', 'mad.*motor', 'iflight.*motor',
                   'emax.*motor', 'brotherhobby.*motor', 'xnova.*motor', 'scorpion.*motor',
                   'hacker.*motor', 'dualsky.*motor', 'sunnysky.*motor', 'rcinpower.*motor',
                   'ipower.*motor', 'gbm\\d+', 'gm\\d+', 'atway.*motor',
                   'motor.*\\d+kv', '\\d+kv.*motor', 'motor.*tad', 'tad\\d+',
                   'мотор.*бесколлекторный', 'двигатель.*бесколлекторный',
                   '2204', '2205', '2206', '2207', '2306', '2307', '2406', '2507', '2807', '2812', '2814',
                   '3115', '3110', '3214', '3506', '3508', '4004', '4006', '4014', '5008', '6018', '6218']
  },
  {
    category: 'propellers',
    namePatterns: ['propeller', 'пропеллер', 'проп', 'лопаст.*для.*мотора', 'воздушный винт',
                   '2-blade', '3-blade', '2 лопаст', '3 лопаст', 'двухлопаст', 'трехлопаст',
                   'dalprop', 'hqprop', 'gemfan', 'foxeer.*prop', 't-motor.*p\\d',
                   '5040', '5140', '6040', '7040', '9045', '1050', '1250', '1555', '1655', '1855',
                   'carbon.*prop', 'деревянные.*винт', 'airscrew']
  },
  {
    category: 'propellers-2-blade',
    namePatterns: ['2-blade.*prop', 'двухлопаст.*проп', '2 лопаст.*проп']
  },
  {
    category: 'propellers-3-blade',
    namePatterns: ['3-blade.*prop', 'трехлопаст.*проп', '3 лопаст.*проп', 'tri-blade.*prop']
  },
  {
    category: 'servos',
    namePatterns: ['сервопривод', 'сервомашин', 'servo motor', 'digital servo', 'analog servo',
                   'feetech.*servo', 'k-power.*servo', 'hbl\\d+', 'ds3218', 'mg996r', 'sg90',
                   'цифровой сервопривод']
  },
  {
    category: 'batteries',
    namePatterns: ['lipo.*battery', 'li-po.*аккумулятор', 'lihv.*battery', 'li-ion.*battery',
                   'lithium.*battery', 'литиевый.*аккумулятор', 'smart battery',
                   'интеллектуальный аккумулятор', 'tb60', 'tb55', 'tb47', 'wb37',
                   '\\d+s.*lipo', 'lipo.*\\d+s', '\\d+mah', '\\d+\\s*mah',
                   'tattu.*battery', 'grepow.*battery', 'gens.*ace.*battery',
                   'dinogy.*battery', 'fullymax.*battery', 'atway.*battery',
                   'честная.*battery', 'b&c.*lipo',
                   'аккумулятор.*\\d+mah', 'battery.*\\d+mah',
                   'battery.*dji.*matrice', 'аккумулятор.*dji.*matrice',
                   'tb65', 'intelligent flight battery']
  },
  {
    category: 'chargers',
    namePatterns: ['balance charger', 'балансировочное зарядное', 'battery charger',
                   'toolkitrc', 'isdt.*charger', 'hota.*charger', 'skyrc.*charger',
                   'imars', 'd6.*charger', 'd10.*charger', 'm6d.*charger', 'm8s.*charger',
                   'ac/dc.*charger', 'зарядное.*устройство.*для.*аккумулятор',
                   'зарядная станция']
  },
  {
    category: 'power-supplies',
    namePatterns: ['блок питания', 'power supply', 'источник питания', 'адаптер питания',
                   'ac adapter', 'dc power supply', 'лабораторный блок', 'korad', 'rd6018',
                   '24v.*power supply', '12v.*power supply', '48v.*power supply']
  },

  // === FPV & VIDEO ===
  {
    category: 'fpv-cameras',
    namePatterns: ['fpv.*camera', 'fpv.*камера', 'камера.*fpv', 'camera.*fpv',
                   'runcam', 'caddx', 'foxeer.*camera', 'dji.*o3.*air', 'dji.*o4.*air',
                   'vista.*camera', 'air unit.*camera',
                   'predator.*camera', 'tarsier.*camera', 'nano.*fpv', 'micro.*fpv.*camera',
                   'siyi.*a2', 'siyi.*r1m', '1080p.*fpv.*camera', '720p.*fpv.*camera']
  },
  {
    category: 'fpv-goggles',
    namePatterns: ['fpv.*очки', 'fpv.*goggles', 'fpv.*шлем', 'goggles.*fpv',
                   'dji.*goggles', 'fatshark', 'fat shark', 'skyzone.*goggle',
                   'ev300', 'ev200', 'hd3.*goggle', 'v2.*goggle', 'v3.*goggle', 'integra',
                   'видеошлем', 'video goggles', 'gl1.*goggle', 'swellpro.*gl1']
  },
  {
    category: 'fpv-goggle-accessories',
    namePatterns: ['goggle.*accessor', 'очки.*аксессуар', 'goggle.*lens', 'goggle.*antenna',
                   'goggle.*battery', 'goggle.*strap', 'faceplate.*goggle',
                   'маска.*для.*очков', 'линза.*для.*очков']
  },
  {
    category: 'vtx',
    namePatterns: ['\\bvtx\\b', 'video transmitter', 'видеопередатчик', 'передатчик.*видео',
                   '5.8g.*vtx', '2.4g.*vtx', '1.2g.*vtx', '1.3g.*vtx',
                   'tbs.*unity', 'tbs.*unify', 'akk.*vtx', 'rush.*tank', 'rush.*solo',
                   'matek.*vtx', 'iflight.*vtx', 'dji.*vista', 'dji.*air unit', 'dji.*o3', 'dji.*o4',
                   '25mw.*vtx', '200mw.*vtx', '400mw.*vtx', '600mw.*vtx', '800mw.*vtx',
                   '1w.*vtx', '2w.*vtx', 'sk7200', 'hm30', 'siyi.*fm30',
                   'цифровая.*система.*видеопередач', 'video.*transmission.*system',
                   'цифровая.*передача.*изображен', 'siyl.*air unit']
  },
  {
    category: 'vrx',
    namePatterns: ['\\bvrx\\b', 'video receiver', 'видеоприемник', 'приемник.*видео',
                   '5.8g.*receiver.*video', 'diversity.*receiver', 'rx5808', 'rapidfire',
                   'tbs.*fusion', 'true-d', 'axii.*receiver']
  },
  {
    category: 'antennas',
    namePatterns: ['антенна', 'antenna', 'patch.*antenna', 'dipole.*antenna', 'omni.*antenna',
                   'lollipop.*antenna', 'pagoda.*antenna', 'axii', 'triple feed', 'crosshair',
                   '5.8g.*antenna', '2.4g.*antenna', '1.2g.*antenna', '1.3g.*antenna',
                   'rhcp.*antenna', 'lhcp.*antenna', 'sma.*antenna', 'mmcx.*antenna',
                   'u.fl.*antenna', 'ipex.*antenna',
                   'всенаправленная.*антенна', 'направленная.*антенна', 'панельная.*антенна',
                   'skyzone.*patch', 'siyi.*mk.*antenna', 'siyi.*lollipop']
  },
  {
    category: 'monitors',
    namePatterns: ['fpv.*monitor', '5.*monitor.*fpv', '7.*monitor.*fpv',
                   'diversity.*monitor', 'hdmi.*monitor.*fpv', 'ips.*monitor.*fpv',
                   'экран.*fpv', 'дисплей.*fpv', 'seetec.*monitor',
                   'eachine.*monitor', 'sky.*monitor']
  },
  {
    category: 'cameras',
    namePatterns: ['action camera', 'экшен-камера', 'gopro.*hero', 'hero.*13', 'hero.*12',
                   'hero.*11', 'hero.*10', 'osmo.*action', 'insta360', 'one x[234]?', 'one r',
                   'one rs', 'x3.*camera', 'x4.*camera',
                   'hd camera', '4k camera', '8k camera', 'usb camera', 'webcam',
                   'elp.*camera', 'global shutter.*camera', 'machine vision.*camera',
                   'zed.*camera', 'stereo.*camera', 'zed x', 'zed 2',
                   'h20n', 'h30.*camera', 'zenmuse.*p1', 'zenmuse.*h20n',
                   'siyi.*zr30', 'viewpro.*camera', 'промышленная.*камера',
                   'камера.*4k', 'камера.*8mp', 'камера.*12mp']
  },
  {
    category: 'camera-lenses',
    namePatterns: ['объектив', 'camera lens', 'fisheye lens', 'wide angle lens', 'pinhole lens',
                   'm12 lens', 'cs-mount lens', 'c-mount lens',
                   '2.1mm.*lens', '2.5mm.*lens', '3.6mm.*lens', '6mm.*lens', '8mm.*lens', '12mm.*lens',
                   'линза.*для.*камеры']
  },
  {
    category: 'thermal-cameras',
    namePatterns: ['тепловизор', 'thermal camera', 'тепловизионная.*камера', 'thermal imaging',
                   'infrared camera', 'инфракрасная.*камера', 'ir camera',
                   'flir.*thermal', 'seek.*thermal', 'zenmuse.*xt',
                   '640×512.*thermal', '320×240.*thermal', '384×288.*thermal',
                   'тепловизионный модуль', 'zt30.*thermal']
  },

  // === RADIO & CONTROL ===
  {
    category: 'transmitters',
    namePatterns: ['пульт.*управления', 'аппаратура.*управления', 'radio controller',
                   'rc transmitter', 'remote controller', 'передатчик.*управления',
                   'flysky.*transmitter', 'frsky.*transmitter', 'spektrum.*transmitter',
                   'futaba.*transmitter', 'radiomaster.*tx', 'jumper.*tx',
                   'taranis', 'q7.*transmitter', 'x9.*transmitter', 'x-lite',
                   'tx16s', 'tx12', 'zorro', 'boxer',
                   'paladin.*pl18', 'skydroid.*h30', 'siyi.*mk15', 'siyi.*mk32',
                   'dji.*rc ', 'dji.*rc$', 'rc-n3', 'rc pro', 'smart controller',
                   'elrs.*пульт', 'flysky.*paladin', 'flysky.*el18']
  },
  {
    category: 'receivers',
    namePatterns: ['приемник.*управления', 'radio receiver', 'rc receiver',
                   'elrs.*receiver', 'frsky.*receiver', 'flysky.*receiver',
                   'dsmx.*receiver', 'dsm2.*receiver',
                   'r-xsr', 'xm+', 'r9.*receiver', 'r12.*receiver',
                   'ep1.*receiver', 'ep2.*receiver', 'er5a.*receiver',
                   'superd.*receiver', 'bp6s.*receiver', 'flywoo.*elrs.*receiver',
                   'tcxo.*elrs.*receiver', 'flywoo.*el24e']
  },
  {
    category: 'controller-accessories',
    namePatterns: ['switch.*transmitter', 'gimbal.*transmitter', 'antenna.*transmitter',
                   'пульт.*аксессуар', 'стик.*пульта', 'держатель.*телефона.*пульт',
                   'трекер.*головы', 'head tracker', 'strap.*transmitter']
  },
  {
    category: 'networking',
    namePatterns: ['сетевой.*коммутатор', 'ethernet switch', 'network switch',
                   'router', 'маршрутизатор', 'd-link.*switch', 'tp-link.*switch',
                   'mikrotik.*switch', 'ubiquiti.*switch', 'poe.*switch',
                   'l2.*switch', 'l3.*switch', 'des-', 'dgs-',
                   'коммутатор.*d-link', 'коммутатор.*tp-link']
  },
  {
    category: 'radios',
    namePatterns: ['радиостанция', 'radio module', 'радиомодуль', 'радиомодем',
                   'ddlab.*radio', 'airborne radio', 'цифровая.*радиостанция',
                   'uhf radio', 'vhf radio', 'long range radio', 'data link',
                   'radio modem', 'wireless link', 'microhard.*radio',
                   '20.*watt.*radio', 'watt.*airborne']
  },

  // === AIRFRAME & GIMBALS ===
  {
    category: 'frames',
    namePatterns: ['frame kit', 'рама.*квадрокоптера', 'каркас.*коптера',
                   'geprc.*frame', 'iflight.*frame', 'nazgul.*frame',
                   'tbs.*source.*frame', 'impulserc.*frame', 'armattan.*frame',
                   'diatone.*frame', 'xl5.*frame', 'xl7.*frame', 'xl10.*frame',
                   '5.*inch.*frame', '7.*inch.*frame', '10.*inch.*frame', '13.*inch.*frame',
                   'луч.*рамы', 'arm.*frame.*part', 'cl20.*frame', 'cl25.*frame',
                   'flywoo.*frame', 'walksnail.*frame', 'beastfpv.*frame']
  },
  {
    category: 'landing-gear',
    namePatterns: ['шасси.*для', 'landing gear', 'посадочное.*шасси', 'ноги.*для.*рамы',
                   'landing skid', 'опора.*шасси']
  },
  {
    category: 'gimbals',
    namePatterns: ['камерный.*подвес', 'camera gimbal', '3-axis.*gimbal', 'трехосевой.*подвес',
                   '2-axis.*gimbal', 'двухосевой.*подвес',
                   'gremsy.*gimbal', 'tarot.*gimbal', 'viewpro.*gimbal', 'siyi.*gimbal',
                   'zhiyun.*gimbal', 'ronin.*gimbal',
                   'zenmuse.*z15', 'zenmuse.*z30', 'zenmuse.*xt.*gimbal',
                   'гимбал', 'подвес.*камеры', 'tarot.*peeper']
  },
  {
    category: 'gimbal-accessories',
    namePatterns: ['gimbal.*accessor', 'подвес.*аксессуар', 'damper.*gimbal',
                   'виброразвязка', 'виброподвес', 'gimbal.*mount', 'кронштейн.*подвеса',
                   'dual.*gimbal.*connector', 'площадка.*подвеса', 'adapter.*gimbal']
  },

  // === PAYLOADS & ACCESSORIES ===
  {
    category: 'payload-release',
    namePatterns: ['устройство.*сброса.*груза', 'payload release', 'механизм.*сброса',
                   'drop mechanism', 'thrower.*drone', 'захват.*груза', 'gripper.*drone',
                   'th4.*release', 'czi.*th', 'airdrop.*device']
  },
  {
    category: 'lights',
    namePatterns: ['фара.*для.*дрона', 'прожектор.*для.*дрона', 'spotlight.*drone',
                   'strobe.*drone', 'маяк.*дрона', 'beacon.*drone',
                   'led.*light.*drone', 'ночная.*подсветка.*дрона',
                   'zenmuse.*s1', 'светодиодный.*прожектор.*дрон']
  },
  {
    category: 'speakers',
    namePatterns: ['громкоговоритель.*для.*дрона', 'speaker.*drone', 'мегафон.*дрона',
                   'megaphone.*drone', 'audio.*broadcast.*drone', 'zenmuse.*v1']
  },
  {
    category: 'cases-bags',
    namePatterns: ['кейс.*для.*дрона', 'чехол.*для.*дрона', 'сумка.*для.*дрона',
                   'hard case.*drone', 'waterproof case.*drone', 'транспортировочный.*кейс',
                   'pelican.*case', 'nanuk.*case', 'peli.*case', 'рюкзак.*для.*дрона',
                   'backpack.*drone']
  },
  {
    category: 'memory-cards',
    namePatterns: ['microsd.*card', 'micro sd.*card', 'sd card.*\\d+gb', 'карта.*памяти.*\\d+gb',
                   'memory card.*\\d+gb', 'tf card.*\\d+gb', 'sdxc.*card',
                   '128gb.*sd', '256gb.*sd', '512gb.*sd', '64gb.*sd',
                   'sandisk.*sd', 'samsung.*evo.*sd', 'lexar.*sd', 'kingston.*sd']
  },
  {
    category: 'tools',
    namePatterns: ['отвертка.*для', 'screwdriver.*set', 'ключ.*для.*проп', 'wrench.*prop',
                   'паяльник.*для', 'soldering.*iron', 'кусачки.*для', 'nipper.*for',
                   'пинцет.*для', 'tweezers.*for', 'hex.*key.*set',
                   'балансир.*проп', 'prop.*balancer', 'мультиметр.*для', 'multimeter.*for',
                   'набор.*инструментов.*для']
  },
  {
    category: 'cables-wires',
    namePatterns: ['кабель.*для.*дрона', 'провод.*для', 'cable.*for.*drone', 'wire.*for.*drone',
                   'usb.*cable.*dji', 'hdmi.*cable.*for', 'silicon.*wire', 'silicone.*wire',
                   'extension.*cable.*for', 'коаксиальный.*кабель', 'coaxial.*cable',
                   'antenna.*cable.*rg', 'rg316', 'rg58', 'шлейф.*для']
  },
  {
    category: 'connectors',
    namePatterns: ['разъем.*для', 'connector.*for', 'штекер.*для', 'гнездо.*для',
                   'xt60.*connector', 'xt90.*connector', 'xt30.*connector',
                   'deans.*connector', 't-plug.*connector', 'ec3.*connector', 'ec5.*connector',
                   'jst.*connector', 'sh1.0.*connector', 'ph2.0.*connector', 'xh2.54.*connector',
                   'sma.*connector', 'mmcx.*connector', 'u.fl.*connector', 'ipex.*connector',
                   'banana plug', 'клемм.*connector', 'terminal block', 'db9.*connector']
  },
  {
    category: 'spare-parts',
    namePatterns: ['запчасти.*для', 'spare parts.*for', 'запасная часть.*для',
                   'part.*number.*for', 'оригинальная.*запчасть.*для',
                   'крышка.*для', 'корпус.*для', 'housing.*for', 'shell.*for', 'cover.*for',
                   'arm.*for.*matrice', 'leg.*for.*matrice', 'blade.*for.*matrice',
                   'пропеллер.*для.*matrice', 'пропеллер.*для.*mavic',
                   'соединитель.*луча', 'шлейф.*ptz', 'косичка.*для']
  },
  {
    category: 'repair-kits',
    namePatterns: ['ремкомплект.*для', 'repair kit.*for', 'набор.*для.*ремонта',
                   'service kit.*for', 'mk-\\d+', 'kyocera.*mk']
  },
  {
    category: 'electronic-modules',
    namePatterns: ['электронный.*модуль', 'electronic module', 'плата.*расширения',
                   'development board', 'отладочная.*плата', 'arduino.*board', 'esp32.*board',
                   'stm32.*board', 'преобразователь.*тока', 'current.*transducer',
                   'dc-dc.*converter', 'dc/dc.*converter', 'step-down.*converter',
                   'step-up.*converter', 'buck.*converter', 'boost.*converter',
                   't201.*seneca', 'seneca.*t201', 'fmc.*board', 'alinh.*fl',
                   'tof.*module.*vl', 'vl53l1x.*module', 'laser.*module.*дальномер',
                   'гальваническая развязка', 'inverter.*module', 'релейный.*модуль']
  },
  {
    category: 'chips-ics',
    namePatterns: ['интегральная.*схема', 'integrated circuit', 'микросхема',
                   'stm32f', 'atmega', 'процессор.*для', 'mcu.*chip',
                   'fpga.*chip', 'cpld.*chip', 'flash.*chip', 'ram.*chip',
                   'транзистор.*\\w+', 'диод.*\\w+', 'резистор.*набор', 'конденсатор.*набор']
  },
  {
    category: 'software',
    namePatterns: ['программное обеспечение', 'software license', 'лицензия.*на',
                   'прошивка.*для', 'firmware.*for', 'subscription.*for', 'подписка.*на',
                   'mission planner', 'qgroundcontrol', 'dji.*terra', 'dji.*pilot',
                   'pix4d.*license', 'drone deploy.*license']
  },
  {
    category: 'robotics',
    namePatterns: ['робот.*собака', 'robot dog', 'quadruped.*robot', 'четырехногий.*робот',
                   'unitree.*go', 'unitree.*b[12]', 'гуманоид.*робот', 'humanoid.*robot',
                   'робот.*манипулятор', 'robot.*manipulator', 'актуатор.*робот',
                   'servo.*robot.*joint']
  },
  {
    category: 'accessories',
    namePatterns: ['аксессуар', 'accessory', 'mount.*for', 'крепление.*для',
                   'holder.*for', 'держатель.*для', 'adapter.*for', 'адаптер.*для',
                   'strap.*for', 'стяжка.*для', 'липучка.*для', 'zip tie.*for', 'хомут.*для',
                   'винт.*для', 'bolt.*for', 'гайка.*для', 'nut.*for', 'шайба.*для',
                   'standoff.*for', 'фильтр.*для', 'filter.*for', 'кольцо.*для',
                   'прокладка.*для', 'gasket.*for', 'защитный.*колпак.*для',
                   'canopy.*for', 'кабина.*для', 'protection.*for']
  },
];

function classifyProduct(product) {
  const name = product.name?.en || product.name || '';
  const nameRu = product.name?.ru || '';
  const desc = product.description?.ru || product.description?.en || '';
  const fullText = name + ' ' + nameRu + ' ' + desc.substring(0, 3000);

  for (const rule of classificationRules) {
    const nameMatch = matchesPatterns(fullText, rule.namePatterns);
    if (nameMatch) {
      if (rule.mustBeDrone && !isDrone(name + ' ' + nameRu, desc)) {
        continue;
      }
      return rule.category;
    }
    const descMatch = matchesPatterns(fullText, rule.descPatterns);
    if (descMatch) {
      if (rule.mustBeDrone && !isDrone(name + ' ' + nameRu, desc)) {
        continue;
      }
      return rule.category;
    }
  }

  // Final check: is it a drone that didn't match specific type?
  if (isDrone(name + ' ' + nameRu, desc)) {
    return 'consumer-drones';
  }

  return 'accessories';
}

// Reclassify
console.log('Reclassifying', products.length, 'products with v3...');
let categoryCounts = {};
let changed = 0;

products.forEach(p => {
  const oldCategory = p.primaryCategory;
  const newCategory = classifyProduct(p);
  if (oldCategory !== newCategory) {
    p.primaryCategory = newCategory;
    changed++;
  }
  categoryCounts[newCategory] = (categoryCounts[newCategory] || 0) + 1;
});

console.log('Changed classification for', changed, 'products');
console.log('\n=== New category distribution ===');
Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

// Save
fs.writeFileSync(path.join(__dirname, 'enriched/products_enriched.json'), JSON.stringify(products), 'utf8');
console.log('\nSaved.');

// Verification
console.log('\n=== Verification ===');
const matrice = products.find(p => p.id === '4712');
console.log('Matrice 300 RTK (ID 4712):', matrice.primaryCategory, '-', matrice.name?.en?.substring(0, 50));

const underwater = products.filter(p => p.primaryCategory === 'underwater-drones');
console.log('\nUnderwater drones:', underwater.length);
underwater.slice(0, 8).forEach(p => console.log('  -', p.name?.en?.substring(0, 65)));

const military = products.filter(p => p.primaryCategory === 'military-drones');
console.log('\nMilitary drones:', military.length);
military.slice(0, 8).forEach(p => console.log('  -', p.name?.en?.substring(0, 65)));

const enterprise = products.filter(p => p.primaryCategory === 'enterprise-drones');
console.log('\nEnterprise drones:', enterprise.length);
enterprise.slice(0, 8).forEach(p => console.log('  -', p.name?.en?.substring(0, 65)));

const consumer = products.filter(p => p.primaryCategory === 'consumer-drones');
console.log('\nConsumer drones:', consumer.length);
consumer.slice(0, 5).forEach(p => console.log('  -', p.name?.en?.substring(0, 65)));
