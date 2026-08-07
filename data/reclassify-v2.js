/**
 * Improved product classification script v2
 * Uses hierarchical keyword matching with priority ordering
 */
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'enriched/products_enriched.json'), 'utf8'));

// Category priority: more specific categories first
// Each rule: { category, patterns (in name), descPatterns (in description), exclude (if found, NOT this category) }
const classificationRules = [
  // === COMPLETE DRONES (highest priority for drone identification) ===
  {
    category: 'underwater-drones',
    namePatterns: ['подводн', 'underwater', 'rov', 'fifish', 'qysea', 'seaflyer', 'camoro.*underwater', 'submarine', 'глубин', 'водяной'],
    descPatterns: ['подводный аппарат', 'подводный дрон', 'подводный робот', 'rov ', 'remotely operated underwater'],
    mustBeDrone: true
  },
  {
    category: 'military-drones',
    namePatterns: ['военный', 'military', 'боевой', 'ударный', 'герань', 'шахед', 'ланцет', 'куб-?бла',
                   'оружие', 'боеприпас', 'fpv.*ударн', 'fpv.*боев', 'камикадзе', 'barrage', 'loitering munition'],
    descPatterns: ['военного назначения', 'боевое применение', 'ударный беспилотник'],
    mustBeDrone: true
  },
  {
    category: 'agricultural-drones',
    namePatterns: ['агродрон', 'agricultural', 'сельскохоз', 'опрыскивател', 'распылител', 'агрокоптер',
                   'для опрыскивания', 't10', 't20p', 't30', 't40', 'agr.*drone', 'spraying drone'],
    descPatterns: ['сельского хозяйства', 'опрыскивания', 'внесения удобрений', 'аграрный'],
    mustBeDrone: true
  },
  {
    category: 'racing-drones',
    namePatterns: ['racing drone', 'гоночный', 'гонк', 'race.*quad', 'fpv.*racer', 'tinywhoop', 'tiny whoop',
                   'cinewhoop', 'cinematic.*fpv', 'speed.*drone'],
    descPatterns: ['гоночный дрон', 'для гонок', 'racing quadcopter'],
    mustBeDrone: true
  },
  {
    category: 'fpv-drones',
    namePatterns: ['fpv.*drone', 'fpv.*quad', 'fpv.*коптер', 'fpv.*комплект', 'fpv.*набор',
                   'analog.*fpv', 'digital.*fpv', 'elrs.*drone', 'crossfire.*drone',
                   'nazgul', 'venom', 'crux3', 'meteor', 'protek', 'iflight.*fpv',
                   'для fpv', 'fpv.*ready', 'rtf.*fpv', 'bnf.*fpv', 'pnp.*fpv'],
    descPatterns: ['fpv полеты', 'для fpv полетов', 'fpv комплект', 'готовый к полетам fpv'],
    mustBeDrone: true
  },
  {
    category: 'thermal-drones',
    namePatterns: ['thermal.*drone', 'тепловизион.*дрон', 'с тепловизором', 'thermal.*quad',
                   'mavic.*thermal', 'm3t', 'm30t', 'm350.*thermal', 'h20t', 'h30t',
                   'дрон.*теплови'],
    descPatterns: ['тепловизионная камера', 'тепловизор', 'thermal imaging'],
    mustBeDrone: true
  },
  {
    category: 'enterprise-drones',
    namePatterns: ['matrice', 'm30 ', 'm30t', 'm300', 'm350', 'm400', 'm4e', 'm4t', 'm4td',
                   'mavic 3e', 'mavic 3t', 'mavic 3 enterprise', 'mavic 3m',
                   'phantom 4 rtk', 'phantom 4 multisp',
                   'enterprise.*drone', 'для предприятий', 'профессиональный дрон',
                   'inspire 3', 'djii.*enterprise', 'wingtra', 'delair'],
    descPatterns: ['корпоративный', 'для инспекций', 'промышленной инспекции', 'rtk.*позиционирован'],
    mustBeDrone: true
  },
  {
    category: 'industrial-drones',
    namePatterns: ['промышленный дрон', 'industrial.*drone', 'грузовой дрон', 'cargo drone',
                   'heavy lift', 'большой грузоподъем', 'корвет', 'грузовой.*коптер',
                   'транспортный дрон', 'transport drone', 'h300', 'h200',
                   'профессиональный квадрокоптер', 'professional quadcopter'],
    descPatterns: ['промышленного назначения', 'грузоподъемность', 'для перевозки грузов'],
    mustBeDrone: true
  },
  {
    category: 'professional-drones',
    namePatterns: ['pro.*drone', 'professional.*drone', 'профессиональный.*дрон',
                   'autel.*evo', 'skydio', 'parrot.*anafi', 'anafi.*ai',
                   'mavic 3 pro', 'mavic 3 classic', 'mavic 3 cine',
                   'air 3', 'air 2s', 'mini 4 pro', 'mini 3 pro'],
    mustBeDrone: true
  },
  {
    category: 'consumer-drones',
    namePatterns: ['quadcopter', 'квадрокоптер', 'дрон', 'drone', 'беспилотник', 'коптер',
                   'mavic', 'mini', 'spark', 'tello', 'syma', 'hubsan', 'eachine',
                   'jjrc', 'holy stone', 'potensic', 'ryze', 'flip', 'avata'],
    mustBeDrone: true
  },
  {
    category: 'toy-drones',
    namePatterns: ['игрушк', 'toy.*drone', 'детский', 'mini.*drone.*toy', 'indoor.*drone'],
    mustBeDrone: true
  },

  // === ANTI-DRONE & COUNTER-DRONE ===
  {
    category: 'anti-drone-guns',
    namePatterns: ['антидрон', 'anti-?drone.*gun', 'ружье.*подавитель', 'подавитель.*ружье',
                   'глушилка.*дрон', 'drone.*jammer.*gun', 'portable.*anti-?drone',
                   'противодроновое ружье', 'бластер'],
    descPatterns: ['подавитель дронов', 'антидроновое ружье', 'блокировка дронов']
  },
  {
    category: 'drone-detectors',
    namePatterns: ['обнаружитель.*дрон', 'детектор.*дрон', 'drone.*detect', 'система.*обнаружения.*дрон',
                   'радар.*дрон', 'radar.*drone', 'пеленгатор', 'радиопеленгатор',
                   'аэроскоп', 'aeroscope', 'дедект', 'sensor.*drone'],
    descPatterns: ['обнаружение беспилотников', 'детектирование дронов', 'мониторинг воздушного пространства']
  },
  {
    category: 'anti-drone',
    namePatterns: ['антидрон', 'anti-?drone', 'подавитель.*дрон', 'противодрон', 'counter.?drone',
                   'глушилка.*fpv', 'глушилка.*дрон', 'jammer.*drone', 'купол.*защита',
                   'система.*подавлен.*беспилотник', 'защита.*от.*дрон'],
    descPatterns: ['подавление беспилотников', 'блокировка управления дронами', 'противодроновая защита']
  },
  {
    category: 'spectrum-analyzers',
    namePatterns: ['спектр.*анализатор', 'spectrum.*analyz', 'анализатор.*спектр', 'частот.*анализатор'],
    descPatterns: ['анализ спектра частот']
  },

  // === FLIGHT CONTROL ===
  {
    category: 'flight-controllers',
    namePatterns: ['полетный контроллер', 'flight controller', 'flight control', 'fc ', ' fc$',
                   'f4 ', 'f7 ', 'h7 ', 'f405', 'f411', 'f722', 'f745', 'h743', 'h7a3',
                   'betaflight', 'inav', 'ardupilot', 'pixhawk', 'cube', 'pixracer',
                   'matek', 'speedybee', 'iflight.*fc', 'diatone.*mamba', 'mamba.*f',
                   'контроллер полета', 'плата управления'],
    descPatterns: ['полетный контроллер', 'flight controller board', 'процессор stm32']
  },
  {
    category: 'autopilots',
    namePatterns: ['автопилот', 'autopilot', 'pixhawk', 'cube orange', 'cube black',
                   'ardupilot.*set', 'px4.*autopilot', 'navigator'],
    descPatterns: ['система автопилотирования']
  },
  {
    category: 'esc',
    namePatterns: ['esc ', ' esc$', 'регулятор.*скорост', 'регулятор.*хода', 'speed controller',
                   'blheli', 'blheli_s', 'blheli_32', 'am32', '4in1.*esc', '4-в-1.*esc',
                   'hakrc', 't-motor.*esc', 'iflight.*esc', 'hobbywing.*esc', 'tmotor.*esc',
                   '12a', '20a', '30a', '35a', '40a', '45a', '50a', '55a', '60a', '80a', '100a', '120a'],
    descPatterns: ['электронный регулятор скорости', 'electronic speed controller', 'поддержка dshot']
  },
  {
    category: 'power-modules',
    namePatterns: ['power module', 'модуль питания', 'pm02', 'pm06', 'pm07', 'bec ', ' ubec',
                   'voltage regulator', 'регулятор напряжения', 'power distribution', 'pdb'],
    descPatterns: ['модуль питания', 'power distribution board']
  },
  {
    category: 'sbc',
    namePatterns: ['raspberry pi', 'raspberrypi', 'orange pi', 'jetson', 'rockchip',
                   'одноплатный компьютер', 'single board', 'sbc ', ' sbc$'],
    descPatterns: ['одноплатный компьютер']
  },
  {
    category: 'sensors',
    namePatterns: ['sensor', 'датчик', 'imu ', ' imu$', 'барометр', 'barometer', 'магнитометр',
                   'compass', 'компас', 'акселерометр', 'accelerometer', 'гироскоп', 'gyroscope',
                   'gps.*module', 'gnss.*module', 'tof.*sensor', 'range.*sensor', 'distance sensor',
                   'оптический поток', 'optical flow', 'lidar-lite', 'tf-luna', 'tf02', 'vl53'],
    descPatterns: ['датчик расстояния', 'инерциальный измерительный блок']
  },
  {
    category: 'lidar',
    namePatterns: ['лидар', 'lidar', 'лазерный.*дальномер', 'laser.*range', '3d.*lidar',
                   '2d.*lidar', 'ydlidar', 'rplidar', 'unitree.*l', 'zenmuse.*l1', 'zenmuse.*l2',
                   'zenmuse.*l3', 'livox', 'velodyne', 'ouster', 'slamtec', 'ld06', 'ld19',
                   'stl27l', 'dtof'],
    descPatterns: ['лазерный дальномер', 'lidar sensor', 'лидарный сканер']
  },
  {
    category: 'gps',
    namePatterns: ['gps ', ' gps$', 'gnss', 'gps модуль', 'gps module', 'gps-', 'm8n', 'm8p', 'm9n', 'm10',
                   'ublox', 'neo-', 'nmea', 'rtk.*gps', 'gps.*rtk', 'compass.*gps',
                   'навигационный модуль', 'спутниковый приемник'],
    descPatterns: ['gps приемник', 'спутниковая навигация', 'gnss модуль']
  },

  // === POWER SYSTEMS ===
  {
    category: 'motors',
    namePatterns: ['motor ', ' motor$', 'мотор', 'двигатель', 'brushless', 'бесколлекторный',
                   't-motor', 'tmotor', 'mad.*motor', 'iflight.*motor', 'emax', 'brotherhobby',
                   'xnova', 'scorpion', 'hacker', 'dualsky', 'sunnysky', 'rcinpower',
                   '2204', '2205', '2206', '2207', '2306', '2307', '2406', '2507', '2807', '2812', '2814',
                   'kv ', ' kv$', '2400kv', '2700kv', '1750kv', '1900kv', '2300kv', '2500kv',
                   'ipower', 'gbm', 'gm35', 'atway', 'tad'],
    descPatterns: ['бесколлекторный двигатель', 'brushless motor', 'k v rating', 'об/мин']
  },
  {
    category: 'propellers',
    namePatterns: ['propeller', 'пропеллер', 'проп', 'лопаст', 'винт', 'airscrew',
                   '2-blade', '3-blade', '2 лопаст', '3 лопаст', 'двухлопаст', 'трехлопаст',
                   'dalprop', 'hqprop', 'gemfan', 't-motor.*p', 'foxeer.*prop',
                   '5040', '5140', '6040', '7040', '9045', '1050', '1250', '1555', '1655', '1855',
                   'carbon.*prop', 'деревянные.*винт'],
    descPatterns: ['пропеллер', 'воздушный винт', 'carbon fiber propeller']
  },
  {
    category: 'propellers-2-blade',
    namePatterns: ['2-blade', 'двухлопаст', '2 лопаст', '2x blade', 'two blade'],
    descPatterns: ['двухлопастной винт']
  },
  {
    category: 'propellers-3-blade',
    namePatterns: ['3-blade', 'трехлопаст', '3 лопаст', '3x blade', 'three blade', 'tri-blade'],
    descPatterns: ['трехлопастной винт']
  },
  {
    category: 'servos',
    namePatterns: ['сервопривод', 'сервомашин', 'servo ', ' servo$', 'servo motor',
                   'feetech', 'k-power', 'hbl', 'ds3218', 'mg996r', 'sg90', 'ds90',
                   'цифровой сервопривод', 'digital servo', 'analog servo'],
    descPatterns: ['сервопривод', 'servo drive', 'крутящий момент']
  },
  {
    category: 'batteries',
    namePatterns: ['battery', 'аккумулятор', 'аккум ', ' lipo', 'li-po', 'lihv', 'li-ion',
                   'lithium', 'литиевый', 'smart battery', 'интеллектуальный аккумулятор',
                   'tb60', 'tb55', 'tb47', 'wb37', '2s', '3s', '4s', '5s', '6s', '8s', '12s', '14s',
                   'mah', '1000mah', '1500mah', '2200mah', '3000mah', '4000mah', '5000mah',
                   '6000mah', '8000mah', '10000mah', '12000mah', '16000mah', '22000mah',
                   'tattu', 'grepow', 'gens ace', 'dinogy', 'fullymax', 'atway', 'честная'],
    descPatterns: ['литий-полимерный', 'li-po аккумулятор', 'емкость.*mah', 'разъем.*xt60']
  },
  {
    category: 'chargers',
    namePatterns: ['зарядное', 'charger', 'зарядка', 'balance charger', 'балансировочное зарядное',
                   'toolkitrc', 'isdt', 'hota', 'skyrc', 'imars', 'd6 ', 'd10', 'm6d', 'm8s',
                   'ac/dc charger', 'battery charger', 'power supply.*charger'],
    descPatterns: ['зарядное устройство', 'балансировочная зарядка', 'поддержка.*lipo']
  },
  {
    category: 'power-supplies',
    namePatterns: ['блок питания', 'power supply', 'источник питания', 'адаптер питания',
                   'ac adapter', 'dc power supply', 'лабораторный блок', 'korad', 'rd6018',
                   '24v.*power', '12v.*power', '48v.*power'],
    descPatterns: ['источник питания', 'выходное напряжение']
  },

  // === FPV & VIDEO ===
  {
    category: 'fpv-cameras',
    namePatterns: ['fpv.*camera', 'fpv.*камера', 'камера.*fpv', 'camera.*fpv',
                   'runcam', 'caddx', 'foxeer', 'dji.*o3', 'dji.*o4', 'vista', 'air unit',
                   'predator', 'tarsier', 'nano.*camera', 'micro.*camera.*fpv',
                   '1080p.*fpv', '720p.*fpv', 'low latency.*camera', '1/3.*camera',
                   'siyi.*a2', 'siyi.*r1m'],
    descPatterns: ['fpv камера', 'камера для fpv', 'низкая задержка']
  },
  {
    category: 'fpv-goggles',
    namePatterns: ['очки', 'goggles', 'шлем.*fpv', 'fpv.*очки', 'fpv.*goggles', 'fpv.*шлем',
                   'dji.*goggles', 'fatshark', 'fat shark', 'skyzone', 'eachine.*ev200',
                   'ev300', 'hd3', 'v2 goggles', 'v3 goggles', 'integra',
                   'видеошлем', 'video goggles', 'gl1'],
    descPatterns: ['fpv очки', 'видеоочки для fpv']
  },
  {
    category: 'fpv-goggle-accessories',
    namePatterns: ['goggles.*accessor', 'очки.*аксессуар', 'маска.*для.*очков', 'линза.*для.*очков',
                   'goggle.*lens', 'goggle.*antenna', 'goggle.*battery', 'goggle.*strap',
                   'faceplate.*goggle'],
    descPatterns: ['аксессуары для очков']
  },
  {
    category: 'vtx',
    namePatterns: ['vtx ', ' vtx$', 'video transmitter', 'видеопередатчик', 'передатчик.*видео',
                   '5.8g.*vtx', '2.4g.*vtx', '1.2g.*vtx', '1.3g.*vtx',
                   'tbs.*unity', 'tbs.*unify', 'akk', 'rush.*tank', 'rush.*solo',
                   'matek.*vtx', 'iflight.*vtx', 'dji.*vista', 'dji.*air unit', 'dji.*o3', 'dji.*o4',
                   '25mw', '200mw', '400mw', '600mw', '800mw', '1w.*vtx', '2w.*vtx',
                   'sk7200', 'hm30', 'siyl.*fm30', 'цифровая.*система.*видеопередач',
                   'video.*transmission.*system', 'цифровая.*передача.*изображен'],
    descPatterns: ['видеопередатчик', 'video transmitter', 'мощность.*mw', 'частота.*5.8']
  },
  {
    category: 'vrx',
    namePatterns: ['vrx ', ' vrx$', 'video receiver', 'видеоприемник', 'приемник.*видео',
                   '5.8g.*receiver', 'diversity.*receiver', 'rx5808', 'rapidfire',
                   'tbs.*fusion', 'true-d', 'axii.*receiver'],
    descPatterns: ['видеоприемник', 'video receiver']
  },
  {
    category: 'antennas',
    namePatterns: ['антенна', 'antenna', 'patch.*antenna', 'dipole', 'omni.*antenna',
                   'lollipop', 'pagoda', 'axii', 'triple feed', 'crosshair', 'menace',
                   '5.8g.*antenna', '2.4g.*antenna', '1.2g.*antenna', '1.3g.*antenna',
                   'rhcp', 'lhcp', 'sma', 'mmcx', 'u.fl', 'ipex',
                   'всенаправленная.*антенна', 'направленная.*антенна', 'панельная.*антенна',
                   'антенный.*модуль'],
    descPatterns: ['антенна', 'коэффициент усиления.*dbi']
  },
  {
    category: 'monitors',
    namePatterns: ['монитор', 'monitor', 'fpv.*monitor', '5.*monitor', '7.*monitor',
                   'diversity.*monitor', 'hdmi.*monitor', 'ips.*monitor',
                   'экран.*fpv', 'дисплей.*fpv', 'sky.*monitor', 'eachine.*monitor'],
    descPatterns: ['монитор для fpv', 'разрешение экрана']
  },
  {
    category: 'cameras',
    namePatterns: ['camera', 'камера', 'фотокамера', 'action camera', 'экшен-камера',
                   'gopro', 'hero 13', 'hero 12', 'hero 11', 'hero 10', 'osmo.*action',
                   'insta360', 'one x', 'one r', 'one rs', 'x3', 'x4',
                   'hd camera', '4k camera', '8k camera', 'usb camera', 'webcam',
                   'elp.*camera', 'global shutter', 'machine vision', 'промышленная.*камера',
                   'zed.*camera', 'stereo.*camera', 'zed x', 'zed 2',
                   'h20n', 'h30t', 'h30', 'p1', 'zenmuse.*p1', 'zenmuse.*h20', 'zenmuse.*h30',
                   'siyi.*zr30', 'siyi.*zt30', 'viewpro.*camera', 'камера.*4k'],
    descPatterns: ['разрешение.*мегапиксел', 'матрица.*cmos', 'объектив.*мм']
  },
  {
    category: 'camera-lenses',
    namePatterns: ['объектив', 'lens', 'fisheye', 'wide angle', 'pinhole', 'm12 lens',
                   'cs-mount', 'c-mount', '2.1mm', '2.5mm', '3.6mm', '6mm', '8mm', '12mm',
                   'линза', 'линзы'],
    descPatterns: ['объектив', 'фокусное расстояние.*мм']
  },
  {
    category: 'thermal-cameras',
    namePatterns: ['тепловизор', 'thermal camera', 'тепловизионная.*камера', 'thermal imaging',
                   'infrared camera', 'инфракрасная.*камера', 'ir camera',
                   'flir', 'seek thermal', 'zenmuse.*xt', 'h20t', 'h30t', 'zt30',
                   '640×512', '320×240', '384×288', 'тепловизионный модуль'],
    descPatterns: ['тепловизор', 'инфракрасный датчик', 'температурное разрешение']
  },

  // === RADIO & CONTROL ===
  {
    category: 'transmitters',
    namePatterns: ['пульт.*управления', 'аппаратура', 'передатчик.*управления', 'transmitter',
                   'radio controller', 'rc transmitter', 'remote controller',
                   'flysky', 'frsky', 'spektrum', 'futaba', 'radiomaster', 'jumper',
                   'taranis', 'q7', 'x9', 'x-lite', 'tx16s', 'tx12', 'zorro', 'boxer',
                   'paladin', 'pl18', 'skydroid', 'siyi.*mk15', 'siyi.*mk32', 'siyi.*mk',
                   'пульт.*dji', 'dji.*rc', 'rc-n3', 'rc pro', 'smart controller',
                   'elrs.*пульт', 'radiomaster.*elrs'],
    descPatterns: ['аппаратура управления', 'radio control', 'каналов.*управления']
  },
  {
    category: 'receivers',
    namePatterns: ['приемник', 'receiver', 'rx ', ' rx$', 'elrs.*receiver', 'frsky.*receiver',
                   'flysky.*receiver', 'dsmx.*receiver', 'dsm2.*receiver',
                   'r-xsr', 'xm+', 'r9', 'r12', 'elrs.*rx', 'ep1', 'ep2', 'er5a',
                   'superd', 'bp6s', 'flywoo.*elrs', 'tcxo.*elrs'],
    descPatterns: ['приемник сигнала', 'radio receiver']
  },
  {
    category: 'controller-accessories',
    namePatterns: ['switch.*transmitter', 'gimbal.*transmitter', 'antenna.*transmitter',
                   'пульт.*аксессуар', 'стик.*пульта', 'держатель.*телефона.*пульт',
                   'трекер.*головы', 'head tracker', 'strap.*transmitter'],
    descPatterns: ['аксессуары для аппаратуры']
  },
  {
    category: 'networking',
    namePatterns: ['коммутатор', 'switch', 'router', 'маршрутизатор', 'd-link', 'tp-link',
                   'mikrotik', 'ubiquiti', 'edgeos', 'poe.*switch', 'l2.*switch', 'l3.*switch',
                   'сетевой.*коммутатор', 'гигабитный.*коммутатор', 'des-', 'dgs-',
                   'ethernet switch', 'network switch'],
    descPatterns: ['сетевой коммутатор', 'количество портов']
  },
  {
    category: 'radios',
    namePatterns: ['радиостанция', 'radio ', ' radio$', 'радиомодуль', 'radio module',
                   'ddlab', 'airborne radio', 'цифровая.*радиостанция', 'dmr', 'td-',
                   'uhf radio', 'vhf radio', 'long range radio', 'data link',
                   'радиомодем', 'radio modem', 'wireless link', 'microhard'],
    descPatterns: ['радиостанция', 'радиомодуль', 'дальность связи.*км']
  },

  // === AIRFRAME & GIMBALS ===
  {
    category: 'frames',
    namePatterns: ['frame', 'рама', 'каркас', 'кит.*рамы', 'frame kit', 'arm.*frame',
                   'geprc', 'iflight.*frame', 'nazgul.*frame', 'xl5', 'xl7', 'xl10',
                   'tbs.*source', 'impulserc', 'armattan', 'diatone.*frame',
                   '5.*frame', '7.*frame', '10.*frame', '13.*frame',
                   'луч.*рамы', 'запчасти.*рамы', 'beam.*frame', 'cl20', 'cl25',
                   'flybee', 'walksnail.*frame'],
    descPatterns: ['рама квадрокоптера', 'frame kit', 'материал рамы', 'колесная база']
  },
  {
    category: 'landing-gear',
    namePatterns: ['шасси', 'landing gear', 'посадочное.*шасси', 'ноги.*для.*рамы',
                   'landing skid', 'опора.*шасси'],
    descPatterns: ['посадочное шасси']
  },
  {
    category: 'gimbals',
    namePatterns: ['подвес', 'gimbal', 'стабилизатор.*камеры', '3-axis.*gimbal', 'трехосевой.*подвес',
                   '2-axis.*gimbal', 'двухосевой.*подвес',
                   'gremsy', 'tarot.*gimbal', 'viewpro.*gimbal', 'siyi.*gimbal', 'zhiyun',
                   'ronin', 'zenmuse.*z15', 'zenmuse.*z30', 'zenmuse.*xt',
                   'гимбал', 'camera gimbal', 'подвес.*камеры'],
    descPatterns: ['стабилизированный подвес', '3-axis stabilization', 'гимбал']
  },
  {
    category: 'gimbal-accessories',
    namePatterns: ['gimbal.*accessor', 'подвес.*аксессуар', 'damper.*gimbal',
                   'виброразвязка', 'виброподвес', 'gimbal.*mount', 'кронштейн.*подвеса',
                   'dual.*gimbal.*connector', 'площадка.*подвеса', 'adapter.*gimbal'],
    descPatterns: ['аксессуары для подвеса']
  },

  // === PAYLOADS & ACCESSORIES ===
  {
    category: 'payload-release',
    namePatterns: ['сброс.*груза', 'payload release', 'устройство.*сброса', 'drop mechanism',
                   'механизм.*сброса', 'thrower', 'захват.*груза', 'gripper',
                   'th4', 'czi.*th', 'device.*drop', 'airdrop'],
    descPatterns: ['устройство сброса груза', 'payload release mechanism']
  },
  {
    category: 'lights',
    namePatterns: ['фара', 'прожектор', 'spotlight', 'strobe', 'маяк', 'beacon',
                   'led.*light', 'светодиод.*фара', 'ночная.*подсветка',
                   'zenmuse.*s1', 'светодиодный.*прожектор'],
    descPatterns: ['светодиодная фара', 'прожектор для дрона']
  },
  {
    category: 'speakers',
    namePatterns: ['громкоговоритель', 'speaker', 'мегафон', 'megaphone',
                   'audio.*broadcast', 'zenmuse.*v1', 'speaker.*drone'],
    descPatterns: ['громкоговоритель', 'megaphone for drone']
  },
  {
    category: 'cases-bags',
    namePatterns: ['кейс', 'чехол', 'сумка', 'case', 'bag', 'рюкзак', 'backpack',
                   'hard case', 'waterproof case', 'транспортировочный.*кейс',
                   'pelican', 'nanuk', 'peli', 'кейс.*для.*дрона'],
    descPatterns: ['защитный кейс', 'транспортировочный чехол']
  },
  {
    category: 'memory-cards',
    namePatterns: ['microsd', 'micro sd', 'sd card', 'карта.*памяти', 'memory card',
                   'tf card', 'sdxc', 'uhs', '128gb', '256gb', '512gb', '64gb',
                   'sandisk', 'samsung.*evo', 'lexar', 'kingston'],
    descPatterns: ['карта памяти', 'скорость чтения']
  },
  {
    category: 'tools',
    namePatterns: ['инструмент', 'tool', 'отвертка', 'screwdriver', 'ключ', 'wrench',
                   'паяльник', 'soldering', 'кусачки', 'nipper', 'пинцет', 'tweezers',
                   'hex.*key', 'imbalance', 'балансир.*проп', 'prop.*balancer',
                   'мультиметр', 'multimeter', 'тестер'],
    descPatterns: ['инструмент для', 'набор инструментов']
  },
  {
    category: 'cables-wires',
    namePatterns: ['кабель', 'провод', 'cable', 'wire', 'lead', 'шлейф', 'flat cable',
                   'usb.*cable', 'hdmi.*cable', 'silicon.*wire', 'silicone.*wire',
                   'разъем.*кабель', 'переходник.*кабель', 'extension.*cable',
                   'коаксиальный', 'coaxial', 'antenna.*cable', 'laird', 'rg316', 'rg58'],
    descPatterns: ['соединительный кабель', 'длина провода']
  },
  {
    category: 'connectors',
    namePatterns: ['разъем', 'connector', 'штекер', 'гнездо', 'plug', 'socket', 'jack',
                   'xt60', 'xt90', 'xt30', 'xt-60', 'xt-90', 'deans', 't-plug', 'ec3', 'ec5',
                   'jst', 'sh1.0', 'ph2.0', 'xh2.54', 'sma', 'mmcx', 'u.fl', 'ipex',
                   'banana plug', 'клемм', 'terminal block', 'db9', 'db15', 'db25'],
    descPatterns: ['соединительный разъем', 'тип разъема']
  },
  {
    category: 'accessories',
    namePatterns: ['аксессуар', 'accessory', 'запчасть', 'spare part', 'комплект', 'kit',
                   'mount', 'крепление', 'holder', 'держатель', 'adapter', 'адаптер',
                   'strap', 'стяжка', 'липучка', 'velcro', 'zip tie', 'хомут',
                   'винт', 'bolt', 'гайка', 'nut', 'шайба', 'washer', 'standoff',
                   'фильтр', 'filter', 'кольцо', 'ring', 'прокладка', 'gasket',
                   'защитный.*колпак', 'protection', 'canopy', 'кабина'],
    descPatterns: ['аксессуар', 'запасная часть']
  },
  {
    category: 'spare-parts',
    namePatterns: ['запчасти', 'spare parts', 'запасная часть', 'ремкомплект', 'repair kit',
                   'запчасти.*для', 'spare.*for', 'part.*number', 'оригинальная.*запчасть',
                   'крышка', 'корпус', 'housing', 'shell', 'cover',
                   'мотор.*запчасти', 'arm.*spare', 'leg.*spare', 'blade.*spare'],
    descPatterns: ['запасные части', 'ремонтный комплект']
  },
  {
    category: 'repair-kits',
    namePatterns: ['ремкомплект', 'repair kit', 'набор.*для.*ремонта', 'service kit',
                   'восстановительный.*набор', 'mk-', 'kyocera'],
    descPatterns: ['ремонтный комплект']
  },

  // === ELECTRONICS ===
  {
    category: 'electronic-modules',
    namePatterns: ['модуль', 'module', 'плата', 'board', 'адаптер', 'converter', 'преобразователь',
                   'inverter', 'инвертор', 'relay', 'реле', 'opto', 'optocoupler',
                   'dc-dc', 'dc/dc', 'step-down', 'step-up', 'buck', 'boost',
                   'arduino', 'esp32', 'esp8266', 'stm32', 'development board', 'отладочная.*плата',
                   'sensor.*module', 'модуль.*датчика', 't201', 'seneca',
                   'fmc.*board', 'alinh', 'fmc.*interface', 'expansion board',
                   'преобразователь.*тока', 'current.*transducer', 'гальваническая развязка',
                   'tof.*module', 'vl53l1x', 'laser.*module', 'дальномер.*модуль'],
    descPatterns: ['электронный модуль', 'плата расширения']
  },
  {
    category: 'chips-ics',
    namePatterns: ['чип', 'микросхема', 'chip', ' ic ', ' ic$', 'integrated circuit',
                   'stm32', 'atmega', 'esp32.*chip', 'processor', 'процессор', 'mcu',
                   'fpga', 'cpld', 'memory chip', 'flash.*chip', 'ram.*chip',
                   'транзистор', 'transistor', 'диод', 'diode', 'резистор', 'resistor',
                   'конденсатор', 'capacitor', 'индуктивность', 'inductor'],
    descPatterns: ['интегральная схема', 'микросхема']
  },
  {
    category: 'software',
    namePatterns: ['программное обеспечение', 'software', 'license', 'лицензия', 'прошивка',
                   'firmware', 'app', 'приложение', 'программа', 'subscription', 'подписка',
                   'mission planner', 'qgroundcontrol', 'dji.*terra', 'dji.*pilot',
                   'lidar360', 'pix4d', 'drone deploy'],
    descPatterns: ['программное обеспечение', 'лицензионный ключ']
  },
  {
    category: 'robotics',
    namePatterns: ['робот', 'robot', 'робототехника', 'роботизированный', 'servo.*robot',
                   'actuator', 'актуатор', 'joint', 'сустав', 'manipulator', 'манипулятор',
                   'unitree', 'go1', 'go2', 'b1', 'b2', ' quadruped', 'четырехногий',
                   'гуманоид', 'humanoid', 'робопес', 'robot dog'],
    descPatterns: ['робототехника', 'роботизированная платформа']
  },
];

// Drone identification patterns (to check if something is actually a complete drone)
const droneIndicators = [
  /квадрокоптер/i, /quadcopter/i, /квадр[оo]коптер/i,
  /\bdrone\b/i, /\bdrones\b/i, /дрон[аеоу]?/i, /беспилотник/i,
  /коптер/i, /copter/i,
  /\brtf\b/i, /\bbnf\b/i, /\bpnf\b/i, /\barf\b/i,
  /готовый.*к.*полетам/i, /ready.*to.*fly/i,
  /\bfpv\b.*(?:комплект|набор|kit|set|ready|drone|quad)/i,
  /(?:комплект|набор|kit|set).*\bfpv\b/i,
  /quad/i, /гексакоптер/i, /hexacopter/i, /октокоптер/i, /octocopter/i,
  /трикоптер/i, /tricopter/i,
  /самолет/i, /крыло/i, /\bplane\b/i, /fixed.?wing/i, /летающее.*крыло/i, /flying wing/i,
  /vtol/i, /вертикального.*взлета/i,
  /подводный.*аппарат/i, /подводный.*робот/i, /\brov\b/i,
];

function isDrone(name, description) {
  const text = (name + ' ' + (description || '')).toLowerCase();
  for (const pattern of droneIndicators) {
    if (pattern.test(text)) return true;
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

function classifyProduct(product) {
  const name = product.name?.en || product.name || '';
  const nameRu = product.name?.ru || '';
  const desc = product.description?.ru || product.description?.en || '';
  const fullText = name + ' ' + nameRu + ' ' + desc.substring(0, 3000);

  // Check each rule in priority order
  for (const rule of classificationRules) {
    const nameMatch = matchesPatterns(fullText, rule.namePatterns);
    if (nameMatch) {
      // If this category requires it to be a drone, verify
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

  // Fallback: if it looks like a drone but didn't match specific type
  if (isDrone(name + ' ' + nameRu, desc)) {
    return 'consumer-drones';
  }

  // Default fallback
  return 'accessories';
}

// Reclassify all products
console.log('Reclassifying', products.length, 'products...');
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
const outPath = path.join(__dirname, 'enriched/products_enriched.json');
fs.writeFileSync(outPath, JSON.stringify(products), 'utf8');
console.log('\nSaved to', outPath);

// Verify specific products
console.log('\n=== Verification ===');
const matrice = products.find(p => p.id === '4712');
console.log('Matrice 300 RTK:', matrice.primaryCategory);

const underwaterCheck = products.filter(p => p.primaryCategory === 'underwater-drones');
console.log('Underwater drones:', underwaterCheck.length);
underwaterCheck.slice(0, 5).forEach(p => console.log('  -', p.name?.en?.substring(0, 60)));

const militaryCheck = products.filter(p => p.primaryCategory === 'military-drones');
console.log('Military drones:', militaryCheck.length);
militaryCheck.slice(0, 5).forEach(p => console.log('  -', p.name?.en?.substring(0, 60)));
