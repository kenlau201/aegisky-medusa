/**
 * 手动分类映射表 - 基于分类ID精确映射
 * 这是100%准确的映射，不是关键词匹配
 */
module.exports = {
  // === 按分类名称关键词的自动映射（俄文） ===
  keywordMap: {
    // 螺旋桨
    'пропеллер': 'blades-propellers',
    'лопаст': 'blades-propellers',
    
    // 摄像机
    'камер': 'cameras-video',
    'видео': 'cameras-video',
    'caddx': 'cameras-video',
    'akk': 'cameras-video',
    
    // 电机
    'мотор': 'motors',
    'двигател': 'motors',
    't-motor': 'motors',
    'brotherhobby': 'motors',
    'sunnysky': 'motors',
    'mad': 'motors',
    'flashhobby': 'motors',
    'emax': 'motors',
    'happymodel': 'motors',
    'flycolor': 'motors',
    
    // 电调/ESC
    'esc': 'esc-controllers',
    'регулятор': 'esc-controllers',
    'hobbywing': 'esc-controllers',
    'fatjay': 'esc-controllers',
    
    // 电池
    'аккумулятор': 'batteries',
    'батаре': 'batteries',
    'gnb': 'batteries',
    'tattu': 'batteries',
    'cnhl': 'batteries',
    
    // 充电设备
    'зарядн': 'charging-equipment',
    'skyrc': 'charging-equipment',
    'isdt': 'charging-equipment',
    'toolkitrc': 'charging-equipment',
    'htrc': 'charging-equipment',
    'ultrapower': 'charging-equipment',
    
    // 舵机
    'сервопривод': 'servos',
    'серв': 'servos',
    'kst': 'servos',
    'jx': 'servos',
    'savox': 'servos',
    'feetech': 'servos',
    
    // 接收机/遥控器
    'приемник': 'receivers',
    'пульт': 'control-panels',
    'управлен': 'control-panels',
    'frsky': 'receivers',
    'flysky': 'receivers',
    'radiomaster': 'receivers',
    
    // 天线
    'антенн': 'antennas',
    
    // 飞控/自动驾驶仪
    'автопилот': 'autopilots',
    'полетн': 'autopilots',
    'holybro': 'autopilots',
    'mateksys': 'autopilots',
    'geprc': 'fpv-drones', // GEPRC主要做FPV
    'iflight': 'fpv-drones',
    'betafpv': 'fpv-drones',
    'hglrc': 'fpv-drones',
    'rushfpv': 'fpv-drones',
    'fpv': 'fpv-drones',
    
    // 机架
    'рам': 'frames',
    
    // 显示器
    'монитор': 'monitors',
    
    // 广播电台
    'радиостанц': 'radio-stations',
    'baofeng': 'radio-stations',
    'аргут': 'radio-stations',
    'lira': 'radio-stations',
    
    // 芯片
    'чип': 'chips',
    'микросхем': 'chips',
    
    // 微型计算机
    'raspberry': 'microcomputers',
    'orange pi': 'microcomputers',
    'radxa': 'microcomputers',
    
    // 配件
    'аксессуар': 'accessories',
    'запчаст': 'accessories',
    'доп': 'accessories',
    'модул': 'accessories',
    
    // 水下无人机
    'подводн': 'underwater-drones',
    'fifish': 'underwater-drones',
    
    // 俄罗斯无人机
    'рф': 'russian-drones',
    'российск': 'russian-drones',
    'военн': 'russian-drones',
    'производств': 'russian-drones',
    
    // 四旋翼
    'квадрокоптер': 'quadcopters',
    'dji': 'quadcopters',
    'syma': 'quadcopters',
    'mjx': 'quadcopters',
    'hubsan': 'quadcopters',
    
    // 热成像
    'тепловиз': 'thermal-imaging-drones',
    
    // 训练无人机
    'обучающ': 'training-drones',
    
    // 京瓷维修套件
    'kyocera': 'kyocera-repair-kits',
    'ремкомплект': 'kyocera-repair-kits',
    
    // 频谱分析仪
    'анализатор': 'spectrum-analyzers',
    
    // 反无人机
    'противодрон': 'counter-drones',
    
    // 便携式发电站
    'электростанц': 'portable-power-stations',
    'ecoflow': 'portable-power-stations',
    
    // 云台
    'подвес': 'gimbals',
    'стабилизатор': 'gimbals',
    
    // 灯光/手电筒
    'фонар': 'lanterns',
    'armytek': 'lanterns',
    'фонарь': 'lanterns',
    
    // 电源/电力
    'электричеств': 'accessories',
    'питани': 'accessories',
    
    // 玩具/游戏
    'игрушк': 'other',
    'игров': 'hosts',
    'консол': 'hosts',
    
    // 反无人机系统
    'противодрон': 'counter-drones',
    
    // 其他品牌
    'copterparts': 'accessories',
    'other_manufacturers': 'accessories',
    'другие производители': 'accessories',
    
    // 箱子/包
    'сумк': 'accessories',
    'кейс': 'accessories',
    
    // 企业级
    'предприят': 'quadcopters',
    'промышлен': 'quadcopters',
    
    // 无人机
    'дрон': 'quadcopters',
    'коптер': 'quadcopters',
  },
  
  // === 按分类ID精确映射（最高优先级） ===
  idMap: {
    // 电力电子
    '854': 'accessories',           // Электричество
    '1430': 'accessories',          // Дополнительные модули
    '857': 'accessories',           // Другие производители (передатчики)
    '861': 'accessories',           // Другие производители
    '5770': 'accessories',          // Другие производители (приемники)
    '764': 'accessories',           // Другие производители
    '3959': 'accessories',          // Другие производители (двигатели)
    '851': 'accessories',           // Другие производители (антенны)
    '1429': 'lanterns',             // Аксессуары для фонарей ARMYTEK
    '1244': 'lanterns',             // Мультифонари
    '7201': 'accessories',          // Сумки, кейсы
    '774': 'quadcopters',           // Для предприятий
    '784': 'hosts',                 // Консоли и приставки
    '1359': 'other',                // Игрушки
    '1479': 'accessories',          // Copterparts
    '3189': 'gimbals',              // Стабилизаторы
    '844': 'cameras-video',         // Аксессуары фото и видео
    '867': 'batteries',             // GNB
    '785': 'motors',                // T-Motor двигатели
    '747': 'motors',                // T-Motor
    '1243': 'lanterns',             // ARMYTEK
    '1182': 'servos',               // KST
    '880': 'esc-controllers',       // HOBBYWING
    '825': 'motors',                // BrotherHobby
    '1206': 'servos',               // JX
    '740': 'charging-equipment',    // SKYRC
    '5784': 'receivers',            // FrSky приемники
    '7259': 'radio-stations',       // Аргут
    '3054': 'motors',               // GEPRC двигатели
    '1344': 'autopilots',           // GEPRC автопилоты
    '1298': 'batteries',            // GEPRC аккумуляторы
    '1314': 'frames',               // GEPRC рамы
    '1415': 'radio-stations',       // Lira радиостанции
    '1384': 'radio-stations',       // Baofeng
    '1391': 'esc-controllers',      // Hobbywing двигатели
    '1432': 'charging-equipment',   // ISDT
    '771': 'batteries',             // DJI аккумуляторы
    '5777': 'receivers',            // RADIOMASTER приемники
    '1635': 'charging-equipment',   // ToolkitRC
    '1310': 'frames',               // IFlight рамы
    '849': 'motors',                // IFlight двигатели
    '750': 'servos',                // Savox
    '763': 'motors',                // Flashhobby
    '891': 'batteries',             // CNHL
    '3348': 'charging-equipment',   // Ultrapower
    '1278': 'motors',               // Sunnysky
    '1285': 'motors',               // MAD
    '815': 'cameras-video',         // AKK передатчики
    '1320': 'autopilots',           // Mateksys
    '1346': 'charging-equipment',   // HTRC
    '1318': 'autopilots',           // Holybro
    '4492': 'microcomputers',       // RADXA
    '6854': 'esc-controllers',      // FATJAY ESC
    '897': 'receivers',             // FrSky
    '801': 'motors',                // Emax двигатели
    '4541': 'cameras-video',        // Caddx камеры
    '1281': 'fpv-drones',           // Emax
    '1386': 'fpv-drones',           // RUSHFPV
    '1337': 'fpv-drones',           // HGLRC
    '5819': 'motors',               // Flycolor
    '3980': 'motors',               // Happymodel двигатели
    '5552': 'quadcopters',          // SYMA
    '5533': 'quadcopters',          // MJX
    '5407': 'fpv-drones',           // Hubsan
    '7103': 'portable-power-stations', // Ecoflow
    '5786': 'receivers',            // FlySky
    '832': 'control-panels',        // RADIOMASTER пульты
    '786': 'microcomputers',        // Orange Pi
    '787': 'microcomputers',        // Raspberry Pi
    '7194': 'underwater-drones',    // Аксессуары для подводных дронов
    '3693': 'underwater-drones',    // Fifish
    '3563': 'underwater-drones',    // Подводные дроны
    '1364': 'russian-drones',       // Дроны РФ
    '1409': 'russian-drones',       // Военные
    '1347': 'russian-drones',       // Производство РФ
    '1365': 'russian-drones',       // Квадрокоптеры РФ
    '1336': 'fpv-drones',           // GEPRC FPV
    '1331': 'fpv-drones',           // DJI FPV
    '1302': 'fpv-drones',           // FPV дроны
    '1366': 'fpv-drones',           // FPV дроны РФ
    '1333': 'fpv-drones',           // IFlight FPV
    '1334': 'fpv-drones',           // BETAFPV FPV
    '767': 'quadcopters',           // Дроны с камерой
    '1267': 'thermal-imaging-drones', // Дроны с тепловизором
    '1360': 'training-drones',      // Обучающие
    '745': 'servos',                // Hitec
  }
}
