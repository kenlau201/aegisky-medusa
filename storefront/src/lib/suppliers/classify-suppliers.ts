/**
 * Technology Category Classifier for Suppliers
 *
 * Maps 439 suppliers to 12 technology solution categories based on:
 * 1. Their actual product categories (primary signal)
 * 2. Brand name keywords
 * 3. Brand description/tagline analysis
 *
 * Key principle: Supplier technology classification is DIFFERENT from product
 * classification. It answers "what technology domain does this supplier serve?"
 * not "what type of product is this?"
 */

import { pool as db } from '../control-tower/db';

// Product category ID → Solution category mapping
// Based on analysis of Russian product categories from copterparts.ru
const CATEGORY_TO_SOLUTION: Record<number, string[]> = {
  // Counter-UAS
  1387: ['counter-uas'], // Противодействия дронам и БПЛА

  // Command, Control & Communications
  809: ['command-control'],  // Передатчики (Transmitters/VTX)
  5769: ['command-control'], // Приёмники (Receivers)
  804: ['command-control'],  // Пульты управления (Remote controls)
  761: ['command-control'],  // Радиостанции (Radios)
  818: ['command-control'],  // Антенны (Antennas)
  789: ['command-control'],  // Сетевое оборудование (Network equipment)
  8051: ['command-control'], // Дальнобойные системы радиометрии
  7808: ['command-control'], // Анализаторы спектра (Spectrum analyzers)
  808: ['command-control', 'electronics'], // FPV очки (FPV goggles)

  // Electronics & Subsystems
  760: ['electronics'],  // Микросхемы чипы (Chips/ICs)
  737: ['electronics', 'software'], // Микрокомпьютеры (Microcomputers)
  783: ['electronics'],  // Шлейфы (Cables)
  762: ['electronics'],  // Мониторы (Monitors)
  784: ['electronics'],  // Консоли и приставки (Consoles)
  7197: ['electronics'], // Аксессуары (Accessories)
  753: ['electronics'],  // Инструмент (Tools)
  799: ['electronics'],  // Ремкомплекты (Repair kits)
  1242: ['electronics'], // Фонари (Flashlights)
  8052: ['electronics', 'sensors'], // Камеры машинного зрения

  // Structural & Mechanical
  824: ['structural'],   // Рамы (Frames)
  735: ['structural', 'electronics'], // Сервоприводы (Servos)
  1421: ['structural', 'materials'], // Карбоновые материалы

  // Positioning, Navigation & Timing
  831: ['positioning', 'software'], // Автопилоты (Autopilots/FC)

  // Mission Sensors & Payloads
  751: ['sensors'],    // Камеры и видео (Cameras and video)
  800: ['sensors'],    // Подвесы (Gimbals)
  775: ['sensors'],    // Тепловизоры (Thermal imagers)
  7178: ['sensors'],   // Лидары (Lidars)
  1267: ['sensors', 'vehicles'], // Дроны с тепловизором
  1208: ['sensors'],   // Оптические прицелы
  1210: ['sensors'],   // Прицелы CRS
  1211: ['sensors'],   // Прицелы LRS
  1272: ['sensors'],   // Тепловизионные прицелы

  // Propulsion & Power
  741: ['propulsion'],  // Двигатели (Motors)
  746: ['propulsion', 'electronics'], // ESC Регуляторы
  743: ['propulsion'],  // Лопасти и пропеллеры (Propellers)
  770: ['propulsion'],  // АКБ (Batteries)
  739: ['propulsion', 'electronics'], // Зарядные устройства (Chargers)
  7067: ['propulsion'], // Портативные электростанции
  7091: ['propulsion'], // Солнечные панели

  // Materials & Manufacture
  // (1421 already mapped above)

  // Safety Systems
  // (Will be detected by keyword matching)

  // Unmanned Vehicles & Platforms
  765: ['vehicles'],    // Квадрокоптеры (Quadcopters)
  1302: ['vehicles'],   // FPV дроны (FPV drones)
  7765: ['vehicles'],   // VTOL дроны
  7766: ['vehicles'],   // Fixed-wing drones
  7788: ['vehicles'],   // Airplane-type drones
  7781: ['vehicles'],   // Multicopters
  5719: ['vehicles'],   // Waterproof drones
  3563: ['vehicles'],   // Underwater drones
  1364: ['vehicles'],   // Дроны РФ
  2537: ['vehicles'],   // Training drones
  1342: ['vehicles'],   // Build kits
  1358: ['vehicles', 'electronics'], // Роботы (Robots)
  1477: ['vehicles'],   // Средства передвижения
  7969: ['vehicles'],   // Transport of the future
  7973: ['vehicles'],   // Transport - batteries
  7975: ['vehicles'],   // Transport - motors
  7981: ['vehicles'],   // Transport - FPV drones
  5719: ['vehicles'],   // Waterproof drones
  110: [],              // Прочее (Other) - skip
  1209: [],             // ARTELV - skip
};

// Brand name keyword → Solution category mapping
const BRAND_KEYWORDS: Array<{ pattern: RegExp; categories: string[] }> = [
  // Counter-UAS brands
  { pattern: /dedrone|d-fend|fortem|liteye|anduril|sRC inc|raytheon|lockheed|northrop|brinc|teal|percepto|anti-drone|counter-uav|c-uas|drone detection|jammer|drone gun|drone shield|dronebuster|airspace security|faselase/i, categories: ['counter-uas'] },

  // Propulsion specialists - motors, ESCs, propellers, batteries, chargers, power
  { pattern: /t-motor|tiger motor|hobbywing|brotherhobby|flashhobby|sunnysky|dualsky|mad components|ipower|scorpion|emax|maytech|dys|tattu|gens ace|gaoneng|gnb|cnhl|isdt|toolkitrc|skyrc|junsi|ev-peak|eflite|spektrum|rcinpower|qx-motor|qxmotor|freerchobby|maniax|spedix|ztw|xxd|herewin|sunpadow|zeee|hrb|gensace|liitokala|hota|makerbase|gt power|imax|nitecore|turnigy|hobbyking|hobbywing|t-motor|bluex|bluetti|ecoflow|jackery|allpowers|romoss|solar|power station|battery|lipo|li-ion|charger|motor|esc|propeller|thrust/i, categories: ['propulsion'] },

  // Command & Control specialists - radios, transmitters, receivers, antennas, VTX
  { pattern: /frsky|radiomaster|jumper|flysky|hitec|radiolink|team blacksheep|tbs|akk|crossfire|expresslrs|elrs|immersionrc|bayckrc|helloradio|hawkeye|skydroid|superbat|turbo|microzone|yagi|antenna|transmitter|receiver|radio|vtx|telemetry|baofeng|hytera|motorola|anytone|quansheng|tyt|walksnail|hdzero|fatshark|skyzone|fpv goggle|starlink|ubiquiti|d-link|zyxel|quectel|hackrf|rf explorer|tbeam|beacon/i, categories: ['command-control'] },

  // Sensor/camera/lidar specialists
  { pattern: /flir|teledyne|gopro|insta360|caddx|runcam|foxeer|walksnail|hdzero|fatshark|skyzone|ouster|velodyne|livox|leica|topcon|garmin|gremsy|sony|hesai|robosense|slamtec|benewake|ydlidar|lidar|viewpro|siminics|seyond|stereolabs|unitree|thermal|camera|gimbal|infrared|ranging|tof|depth sensor/i, categories: ['sensors'] },

  // Flight controller/autopilot specialists
  { pattern: /pixhawk|ardupilot|px4|holybro|matek|cuav|mamba|speedybee|hglrc|rushfpv|betaflight|inav|diatone|drotek|chcnav|prinCe|gnss|gps|rtk|compass|imu|barometer|autopilot|flight controller|fc stack/i, categories: ['positioning', 'software', 'electronics'] },

  // Airframe/vehicle specialists
  { pattern: /dji|autel|parrot|skydio|yuneec|geprc|iflight|betafpv|happymodel|flywoo|axisflying|darwinfpv|diatone|emax|eachine|hubsan|syma|wltoys|risingsky|armattan|shendrones|swellpro|tdrones|walkera|fimi|sjrc|cheerson|lyzrc|rufus|skyeye|xiro|zlrc|mugin|skywalker|makeflyeasy|eft|sub250|drone|quadcopter|multirotor|vtol|fixed.wing|uav|uas|rover|submarine/i, categories: ['vehicles'] },

  // Software/AI/SBC companies
  { pattern: /auterion|airmap|skyward|dronedeploy|pix4d|sensefly|wingcopter|freefly|wingtra|quantum-systems|delair|ehang|xag|aerovironment|insitu|textron|shield ai|hivemind|raspberry pi|arduino|orange pi|nanopi|radxa|banana pi|lattepanda|khadas|lilygo|nvidia|intel|repka pi|gmktec|flipper|bigtreetech|sipeed|waveshare|wavgat|fdrobot|atway|sky-drones|software|firmware|autonomy|ai |machine learning|computer vision|sbc|microcontroller/i, categories: ['software', 'electronics'] },

  // Materials/manufacturing
  { pattern: /carbon|composite|3d print|cnc|titanium|aluminum|alloy|armattan|readymaderc|lumenier|taulman|prusa|creality|formlabs|markforged|kevlar|fiberglass|extrudr|polymaker|esun|hatchbox|matterhackers|filament|resin|carbon fiber|carbon plate|cnc machin|injection mold/i, categories: ['materials', 'structural'] },

  // Services
  { pattern: /training|consulting|survey|mapping|inspection|photogrammetry|repair service|flight school|certification|uav service|drone service|aerial survey|geospatial|integration service/i, categories: ['services'] },

  // Safety systems
  { pattern: /parachute|fruity|parazero|safesystem|failsafe|collision avoidance|ads-b|pingrid|foreflight|safetech|airspace|geofence|return to home|recovery|crash|emergency|redundancy|ballistic|flare|safeair|iris|skycat|fruitychutes|marss|sagetech|uavionix|kirisun|marsriva/i, categories: ['safety'] },

  // Servo/actuator specialists → structural + electronics
  { pattern: /servo|actuator|kserv|k-power|powerhd|dsservo|spt servo|gxservo|feetech|savox|jx |kstdigital|kingmax|oversky|cys|dspower/i, categories: ['structural', 'electronics'] },

  // Display/monitor specialists
  { pattern: /feelworld|seetec|avmatrix|osee|monitor|display|fpv screen/i, categories: ['electronics'] },

  // Power station / solar
  { pattern: /power station|solar panel|generator|inverter|ups|battery pack|power bank/i, categories: ['propulsion', 'electronics'] },

  // Safety
  { pattern: /parachute|fruity|parazero|safesystem|failsafe|collision avoidance|ads-b|pingrid|foreflight/i, categories: ['safety'] },
];

// Known brand → categories manual mapping for major brands
const KNOWN_BRANDS: Record<string, string[]> = {
  'DJI': ['vehicles', 'sensors', 'propulsion', 'software', 'positioning', 'command-control'],
  'Autel': ['vehicles', 'sensors', 'command-control', 'propulsion'],
  'Parrot': ['vehicles', 'sensors', 'software'],
  'Skydio': ['vehicles', 'software', 'sensors'],
  'Yuneec': ['vehicles', 'propulsion', 'electronics'],
  'T-MOTOR': ['propulsion', 'vehicles', 'sensors'],
  'Hobbywing': ['propulsion', 'electronics'],
  'FrSky': ['command-control', 'electronics'],
  'iFlight': ['vehicles', 'propulsion', 'structural', 'electronics'],
  'GEPRC': ['vehicles', 'propulsion', 'electronics', 'structural'],
  'BETAFPV': ['vehicles', 'propulsion', 'electronics', 'command-control'],
  'Foxeer': ['sensors', 'electronics', 'command-control'],
  'RunCam': ['sensors', 'electronics'],
  'Caddx': ['sensors', 'electronics'],
  'Walksnail': ['sensors', 'command-control', 'electronics'],
  'HDZero': ['sensors', 'command-control', 'electronics'],
  'FatShark': ['sensors', 'command-control', 'electronics'],
  'Skyzone': ['sensors', 'command-control', 'electronics'],
  'Gemfan': ['propulsion', 'materials'],
  'HQProp': ['propulsion', 'materials'],
  'Dalprop': ['propulsion', 'materials'],
  'Ouster': ['sensors', 'electronics'],
  'Velodyne': ['sensors', 'electronics'],
  'Livox': ['sensors', 'electronics'],
  'FLIR': ['sensors', 'counter-uas'],
  'GoPro': ['sensors', 'electronics'],
  'Insta360': ['sensors', 'electronics'],
  'Garmin': ['positioning', 'sensors', 'electronics'],
  'Gremsy': ['sensors', 'structural'],
  'Tattu': ['propulsion'],
  'GNB': ['propulsion'],
  'CNHL': ['propulsion'],
  'ISDT': ['propulsion', 'electronics'],
  'ToolkitRC': ['propulsion', 'electronics'],
  'Tarot': ['structural', 'vehicles', 'electronics'],
  'MAD': ['propulsion', 'vehicles'],
  'SIYI': ['command-control', 'sensors'],
  'CUAV': ['positioning', 'software', 'electronics', 'command-control'],
  'Holybro': ['positioning', 'software', 'electronics', 'command-control'],
  'Mateksys': ['positioning', 'electronics', 'command-control'],
  'RADIOMASTER': ['command-control', 'electronics'],
  'Jumper': ['command-control', 'electronics'],
  'Flysky': ['command-control', 'electronics'],
  'Hitec': ['command-control', 'structural', 'electronics'],
  'Eachine': ['vehicles', 'electronics', 'propulsion'],
  'Diatone': ['vehicles', 'propulsion', 'electronics'],
  'EMAX': ['vehicles', 'propulsion', 'electronics'],
  'HappyModel': ['vehicles', 'propulsion', 'electronics'],
  'HGLRC': ['vehicles', 'electronics', 'propulsion', 'command-control'],
  'RUSHFPV': ['command-control', 'electronics', 'sensors'],
  'Speedybee': ['electronics', 'command-control', 'positioning'],
  'DarwinFPV': ['vehicles', 'propulsion', 'electronics'],
  'Flywoo': ['vehicles', 'electronics', 'propulsion'],
  'BrotherHobby': ['propulsion'],
  'Axisflying': ['vehicles', 'structural', 'propulsion'],
  'Flashhobby': ['propulsion'],
  'Fifish': ['vehicles', 'sensors'],
  'Lumenier': ['vehicles', 'propulsion', 'electronics'],
  'Aegisky': ['vehicles', 'propulsion', 'electronics', 'sensors', 'command-control'],
  'Team BlackSheep': ['command-control', 'vehicles', 'sensors'],
  'Orange Pi': ['electronics', 'software'],
  'Raspberry Pi': ['electronics', 'software'],
  'Ecoflow': ['propulsion', 'electronics'],
  'SKYRC': ['propulsion', 'electronics'],
  'KST': ['electronics', 'structural'],
  'JX': ['electronics', 'structural'],
  'Feetech': ['electronics', 'structural'],
  'Savox': ['electronics', 'structural'],
  'Sunnysky': ['propulsion'],
  'Dualsky': ['propulsion'],
  'Maytech': ['propulsion', 'vehicles'],
  'DYS': ['propulsion', 'electronics'],
  'AKK': ['command-control', 'electronics'],
  'Mamba System': ['electronics', 'positioning'],
  'BeastFPV': ['vehicles', 'electronics'],
  'ReadyToSky': ['electronics', 'propulsion'],
  'FATJAY': ['electronics'],
  'JHEMCU': ['electronics', 'positioning'],
  'SYMA': ['vehicles', 'electronics'],
  'Аргут': ['command-control', 'electronics'],
  'VVP Group': ['propulsion', 'structural'],
  'Lira': ['structural', 'propulsion'],
  'МВМ-АВИА': ['vehicles', 'propulsion'],
  'Aocoda-RC': ['electronics', 'vehicles'],
  'Hubsan': ['vehicles', 'electronics'],
  'MJX': ['vehicles', 'electronics'],
  'Radiolink': ['command-control', 'positioning'],
  'Flipsky': ['propulsion', 'electronics'],
  'Завод №50': ['vehicles', 'propulsion'],
  'Skystars': ['electronics', 'positioning'],
  'Freefly': ['vehicles', 'sensors'],
  'Wingtra': ['vehicles', 'software'],
  'Quantum-Systems': ['vehicles', 'software'],
  'Delair': ['vehicles', 'software', 'sensors'],
  'EHang': ['vehicles', 'software'],
  'XAG': ['vehicles', 'propulsion', 'sensors'],
  'AeroVironment': ['vehicles', 'counter-uas', 'sensors'],
  'Anduril': ['counter-uas', 'vehicles', 'software'],
  'Shield AI': ['software', 'vehicles'],
  'Teal Drones': ['vehicles', 'counter-uas'],
  'BRINC': ['vehicles', 'counter-uas'],
  'Percepto': ['vehicles', 'sensors', 'software'],
  'Dedrone': ['counter-uas', 'software'],
  'D-Fend': ['counter-uas'],
  'Fortem': ['counter-uas', 'sensors'],
  'Liteye': ['counter-uas', 'sensors'],
  'Lockheed': ['vehicles', 'counter-uas'],
  'Raytheon': ['counter-uas', 'sensors'],
  'Northrop': ['vehicles', 'counter-uas'],
  'General Atomics': ['vehicles', 'sensors'],
  'Insitu': ['vehicles', 'software'],
  'Textron': ['vehicles', 'sensors'],
  'iPower': ['propulsion'],
  'Scorpion': ['propulsion'],
  'ARRIS': ['propulsion'],
  'LattePanda': ['electronics', 'software'],
  'Aeronaut CAM Carbon': ['propulsion', 'materials'],
  'GAONENG': ['propulsion'],
  'Junsi iCharger': ['propulsion', 'electronics'],
  'EV-Peak': ['propulsion', 'electronics'],
  'Mamba System': ['electronics', 'command-control'],
  'ORT': ['command-control', 'electronics'],
  'Sony': ['sensors', 'electronics'],
  // Materials & Manufacturing
  'ReadymadeRC': ['materials', 'vehicles', 'propulsion'],
  'Armattan': ['materials', 'vehicles', 'structural'],
  'Lumenier': ['vehicles', 'propulsion', 'electronics', 'materials'],
  'SunnyLife': ['materials', 'structural', 'electronics'],
  // Safety
  'Fruity Chutes': ['safety'],
  'ParaZero': ['safety'],
  'SafeAir': ['safety'],
  'Iris Automation': ['safety', 'sensors', 'software'],
  'Sagetech': ['safety', 'command-control'],
  'uAvionix': ['safety', 'positioning', 'command-control'],
  // Counter-UAS
  'aSel': ['counter-uas', 'command-control'],
  'DroneShield': ['counter-uas', 'sensors'],
  'D-Fend Solutions': ['counter-uas'],
  'Fortem Technologies': ['counter-uas', 'sensors', 'vehicles'],
  'Dedrone': ['counter-uas', 'software', 'sensors'],
  'Liteye Systems': ['counter-uas', 'sensors'],
  // Services
  'Leica': ['sensors', 'services', 'positioning'],
  'Topcon': ['sensors', 'services', 'positioning'],
  'Trimble': ['positioning', 'services', 'sensors'],
  // Software
  'ArduPilot': ['software', 'positioning'],
  'PX4': ['software', 'positioning'],
  'Nvidia': ['electronics', 'software', 'sensors'],
  'Intel': ['electronics', 'sensors', 'software'],
  'Raspberry Pi': ['electronics', 'software'],
  'Arduino': ['electronics', 'software'],
  'Khadas': ['electronics', 'software'],
  'LattePanda': ['electronics', 'software'],
  'Orange Pi': ['electronics', 'software'],
  'NanoPi': ['electronics', 'software'],
  'RADXA': ['electronics', 'software'],
  'Banana Pi': ['electronics', 'software'],
  // Additional propulsion
  'RCINPOWER': ['propulsion'],
  'Flycolor': ['propulsion', 'electronics'],
  'HTRC': ['propulsion', 'electronics'],
  'HAKRC': ['propulsion', 'electronics', 'positioning'],
  'TopON': ['propulsion', 'electronics'],
  'Ultrapower': ['propulsion', 'electronics'],
  // Additional sensors
  'YDLIDAR': ['sensors', 'electronics'],
  'Benewake': ['sensors', 'electronics'],
  'Slamtec': ['sensors', 'electronics'],
  'Akusense': ['sensors', 'electronics'],
  'Waveshare': ['electronics', 'sensors', 'software'],
  'Sipeed': ['electronics', 'sensors', 'software'],
  // Additional vehicles
  'Walkera': ['vehicles', 'propulsion', 'command-control'],
  'FIMI': ['vehicles', 'sensors'],
  'SJRC': ['vehicles', 'electronics'],
  'EACHINE': ['vehicles', 'electronics', 'propulsion'],
  'Cheerson': ['vehicles', 'electronics'],
  'Mugin': ['vehicles', 'structural'],
  'Skywalker': ['vehicles', 'structural'],
  'Makeflyeasy': ['vehicles', 'structural'],
  'EFT': ['vehicles', 'structural', 'propulsion'],
  // Additional C2
  'Baofeng': ['command-control', 'electronics'],
  'CORONA': ['command-control', 'electronics', 'structural'],
  'HotRC': ['command-control', 'electronics'],
  'DumboRC': ['command-control', 'electronics'],
  'Boscam': ['command-control', 'sensors', 'electronics'],
  'TrueRC': ['command-control', 'electronics'],
  'Starlink': ['command-control'],
  'Alientech': ['command-control', 'electronics'],
  // Additional structural
  'DSSERVO': ['structural', 'electronics'],
  'K-Power': ['structural', 'electronics'],
  'PowerHD': ['structural', 'electronics'],
  'SPT Servo': ['structural', 'electronics'],
  'GXservo': ['structural', 'electronics'],
  'Futaba': ['command-control', 'structural', 'electronics'],
  'Align': ['vehicles', 'propulsion', 'structural'],
  'ZMR': ['structural', 'vehicles'],
  'HSKRC': ['structural', 'vehicles'],
  'OddityRC': ['structural', 'vehicles'],
  'AlfaRC': ['structural', 'vehicles'],
  'Sub250': ['vehicles', 'structural'],
  'INJORA': ['structural', 'vehicles'],
  // Additional electronics
  'LILYGO': ['electronics', 'software', 'command-control'],
  'ATWAY': ['electronics', 'positioning', 'software'],
  'FDROBOT': ['electronics', 'positioning', 'software'],
  'Bigtreetech': ['electronics', 'software'],
  'Atmel': ['electronics'],
  'SoloGood': ['electronics', 'positioning', 'propulsion'],
  'VIFLY': ['electronics', 'propulsion', 'safety'],
  'SEQURE': ['electronics', 'propulsion', 'positioning'],
  'Jijie': ['electronics', 'positioning'],
  'KISS': ['electronics', 'propulsion', 'positioning'],
  'Misnodes': ['electronics', 'positioning'],
  'Oculus': ['electronics', 'sensors'],
  'Pixhawk': ['positioning', 'software', 'electronics'],
  'Repka Pi': ['electronics', 'software'],
  'GMKtec': ['electronics', 'software'],
  'Flipper': ['electronics', 'command-control'],
  'Toothpick': ['vehicles', 'electronics'],
  'Sparkhobby': ['electronics', 'propulsion'],
  'JMT': ['vehicles', 'electronics'],
  'Firefly': ['vehicles', 'sensors', 'software'],
  'Mugin': ['vehicles', 'structural'],
  'Yahboom': ['vehicles', 'electronics', 'sensors'],
  'EBOYU': ['vehicles', 'electronics'],
  'FlyfishRC': ['vehicles', 'structural', 'electronics'],
  'WAVGAT': ['electronics'],
  'Feichao': ['structural', 'vehicles'],
  'Lichuan': ['structural', 'electronics'],
  '9imod': ['structural', 'electronics', 'command-control'],
  'SURPASS': ['structural', 'electronics', 'propulsion'],
  'HawkSpeed': ['structural', 'electronics'],
  'РЗЭ': ['electronics'],
  'У-УППО': ['structural', 'propulsion'],
  'Уралхимаппарат': ['materials', 'propulsion'],
  'Волгаэнергохим': ['materials', 'propulsion'],
  'МВМ-АВИА': ['vehicles', 'propulsion'],
  'Транспорт Будущего': ['vehicles', 'propulsion'],
  'Завод №50': ['vehicles', 'propulsion'],
  'Аргут': ['command-control', 'electronics'],
  'VVP Group': ['propulsion', 'structural'],
  'Lira': ['structural', 'propulsion'],
  'Aocoda-RC': ['electronics', 'vehicles'],
  'Sky-Drones': ['software', 'positioning', 'command-control'],
  'PrinCe': ['positioning', 'electronics'],
  'Leica': ['sensors', 'services', 'positioning'],
  'aSel': ['counter-uas', 'command-control'],
  'ARTELV': ['vehicles', 'propulsion'],
  'SanDisk': ['electronics'],
  'Samsung': ['electronics', 'propulsion'],
  'Seetec': ['electronics', 'sensors'],
  'SEETEC': ['electronics', 'sensors'],
  'Happymodel': ['vehicles', 'propulsion', 'electronics'],
  'Walksnail': ['sensors', 'command-control', 'electronics'],
  'HDZero': ['sensors', 'command-control', 'electronics'],
  'FatShark': ['sensors', 'command-control', 'electronics'],
  'Skyzone': ['sensors', 'command-control', 'electronics'],
  'RunCam': ['sensors', 'electronics'],
  'Caddx': ['sensors', 'electronics'],
  'Foxeer': ['sensors', 'electronics', 'command-control'],
  'GNB': ['propulsion'],
  'Tattu': ['propulsion'],
  'CNHL': ['propulsion'],
  'ISDT': ['propulsion', 'electronics'],
  'ToolkitRC': ['propulsion', 'electronics'],
  'SKYRC': ['propulsion', 'electronics'],
  'Junsi iCharger': ['propulsion', 'electronics'],
  'EV-Peak': ['propulsion', 'electronics'],
  'GAONENG': ['propulsion'],
  'DYS': ['propulsion', 'electronics'],
  'Maytech': ['propulsion', 'vehicles'],
  'BrotherHobby': ['propulsion'],
  'Flashhobby': ['propulsion'],
  'Sunnyside': ['propulsion'],
  'Dualsky': ['propulsion'],
  'iPower': ['propulsion'],
  'Scorpion': ['propulsion'],
  'ARRIS': ['propulsion'],
  'Flipsky': ['propulsion', 'electronics'],
  'MAD': ['propulsion', 'vehicles'],
  'Gemfan': ['propulsion', 'materials'],
  'HQProp': ['propulsion', 'materials'],
  'Dalprop': ['propulsion', 'materials'],
  'Aeronaut CAM Carbon': ['propulsion', 'materials'],
  'Tattu': ['propulsion'],
  'Eachine': ['vehicles', 'electronics', 'propulsion'],
  'Diatone': ['vehicles', 'propulsion', 'electronics'],
  'EMAX': ['vehicles', 'propulsion', 'electronics'],
  'HGLRC': ['vehicles', 'electronics', 'propulsion', 'command-control'],
  'RUSHFPV': ['command-control', 'electronics', 'sensors'],
  'Speedybee': ['electronics', 'command-control', 'positioning'],
  'DarwinFPV': ['vehicles', 'propulsion', 'electronics'],
  'Flywoo': ['vehicles', 'electronics', 'propulsion'],
  'Axisflying': ['vehicles', 'structural', 'propulsion'],
  'Fifish': ['vehicles', 'sensors'],
  'Lumenier': ['vehicles', 'propulsion', 'electronics', 'materials'],
  'Team BlackSheep': ['command-control', 'vehicles', 'sensors'],
  'Ecoflow': ['propulsion', 'electronics'],
  'KST': ['electronics', 'structural'],
  'JX': ['electronics', 'structural'],
  'Feetech': ['electronics', 'structural'],
  'Savox': ['electronics', 'structural'],
  'Hitec': ['command-control', 'structural', 'electronics'],
  'Jumper': ['command-control', 'electronics'],
  'Flysky': ['command-control', 'electronics'],
  'Radiolink': ['command-control', 'positioning'],
  'SIYI': ['command-control', 'sensors'],
  'CUAV': ['positioning', 'software', 'electronics', 'command-control'],
  'Holybro': ['positioning', 'software', 'electronics', 'command-control'],
  'Mateksys': ['positioning', 'electronics', 'command-control'],
  'RADIOMASTER': ['command-control', 'electronics'],
  'FrSky': ['command-control', 'electronics'],
  'Tarot': ['structural', 'vehicles', 'electronics'],
  'BeastFPV': ['vehicles', 'electronics'],
  'ReadyToSky': ['electronics', 'propulsion'],
  'FATJAY': ['electronics'],
  'JHEMCU': ['electronics', 'positioning'],
  'SYMA': ['vehicles', 'electronics'],
  'Hubsan': ['vehicles', 'electronics'],
  'MJX': ['vehicles', 'electronics'],
  'Skystars': ['electronics', 'positioning'],
  'Aegisky': ['vehicles', 'propulsion', 'electronics', 'sensors', 'command-control'],
  'Aeronaut': ['propulsion', 'materials'],
  'DJI': ['vehicles', 'sensors', 'propulsion', 'software', 'positioning', 'command-control'],
  'Autel': ['vehicles', 'sensors', 'command-control', 'propulsion'],
  'T-MOTOR': ['propulsion', 'vehicles', 'sensors'],
  'T-Motor': ['propulsion', 'vehicles', 'sensors'],
  'Hobbywing': ['propulsion', 'electronics'],
  'iFlight': ['vehicles', 'propulsion', 'structural', 'electronics'],
  'GEPRC': ['vehicles', 'propulsion', 'electronics', 'structural'],
  'BETAFPV': ['vehicles', 'propulsion', 'electronics', 'command-control'],
  'Ouster': ['sensors', 'electronics'],
  'Velodyne': ['sensors', 'electronics'],
  'Livox': ['sensors', 'electronics'],
  'FLIR': ['sensors', 'counter-uas'],
  'GoPro': ['sensors', 'electronics'],
  'Insta360': ['sensors', 'electronics'],
  'Garmin': ['positioning', 'sensors', 'electronics'],
  'Gremsy': ['sensors', 'structural'],
  'Freefly': ['vehicles', 'sensors'],
  'Wingtra': ['vehicles', 'software'],
  'Quantum-Systems': ['vehicles', 'software'],
  'Delair': ['vehicles', 'software', 'sensors'],
  'EHang': ['vehicles', 'software'],
  'XAG': ['vehicles', 'propulsion', 'sensors'],
  'AeroVironment': ['vehicles', 'counter-uas', 'sensors'],
  'Anduril': ['counter-uas', 'vehicles', 'software'],
  'Shield AI': ['software', 'vehicles'],
  'Teal Drones': ['vehicles', 'counter-uas'],
  'BRINC': ['vehicles', 'counter-uas'],
  'Percepto': ['vehicles', 'sensors', 'software'],
  'Dedrone': ['counter-uas', 'software', 'sensors'],
  'D-Fend': ['counter-uas'],
  'Fortem': ['counter-uas', 'sensors', 'vehicles'],
  'Liteye': ['counter-uas', 'sensors'],
  'Lockheed': ['vehicles', 'counter-uas'],
  'Raytheon': ['counter-uas', 'sensors'],
  'Northrop': ['vehicles', 'counter-uas'],
  'General Atomics': ['vehicles', 'sensors'],
  'Insitu': ['vehicles', 'software'],
  'Textron': ['vehicles', 'sensors'],
  'Parrot': ['vehicles', 'sensors', 'software'],
  'Skydio': ['vehicles', 'software', 'sensors'],
  'Yuneec': ['vehicles', 'propulsion', 'electronics'],
  'AKK': ['command-control', 'electronics'],
  'Mamba System': ['electronics', 'command-control'],
  // Additional known brands for accuracy
  'Hesai': ['sensors', 'electronics'],
  'RoboSense': ['sensors', 'electronics'],
  'Stereolabs': ['sensors', 'software'],
  'Unitree': ['vehicles', 'electronics'],
  'Quectel': ['command-control', 'electronics'],
  'CHCNAV': ['positioning', 'electronics'],
  'SwellPro': ['vehicles', 'propulsion', 'command-control'],
  'T-Drones': ['vehicles', 'propulsion'],
  'Viewpro': ['sensors'],
  'Hikvision': ['sensors', 'electronics'],
  'Infiray': ['sensors'],
  'Guide': ['sensors'],
  'Fluke': ['sensors', 'electronics'],
  'Omron': ['electronics', 'sensors'],
  'SICK': ['sensors', 'electronics'],
  'Panasonic': ['propulsion', 'electronics'],
  'Motorola': ['command-control'],
  'Hytera': ['command-control'],
  'Baofeng': ['command-control', 'electronics'],
  'Ubiquiti': ['command-control', 'electronics'],
  'Starlink': ['command-control'],
  'D-Link': ['command-control', 'electronics'],
  'Zyxel': ['command-control', 'electronics'],
  'Logitech': ['sensors', 'electronics'],
  'Sennheiser': ['command-control', 'electronics'],
  'ImmersionRC': ['command-control', 'electronics'],
  'Spektrum': ['command-control', 'propulsion'],
  'Turnigy': ['propulsion', 'electronics'],
  'GensAce': ['propulsion'],
  'HRB': ['propulsion'],
  'Herewin': ['propulsion'],
  'Molicel': ['propulsion'],
  'Jackery': ['propulsion', 'electronics'],
  'Bluetti': ['propulsion', 'electronics'],
  'Ecoflow': ['propulsion', 'electronics'],
  'Allpowers': ['propulsion'],
  'Feelworld': ['electronics'],
  'AVMATRIX': ['electronics'],
  'HackRF': ['electronics', 'command-control'],
  'Drotek': ['positioning', 'electronics'],
  'QX-Motor': ['propulsion'],
  'Spedix': ['propulsion', 'electronics'],
  'ZTW': ['propulsion', 'electronics'],
  'XXD': ['propulsion', 'electronics'],
  'iPower': ['propulsion'],
  'RCINPOWER': ['propulsion'],
  'BrotherHobby': ['propulsion'],
  'Flashhobby': ['propulsion'],
  'Sunnysky': ['propulsion'],
  'Dualsky': ['propulsion'],
  'Scorpion': ['propulsion'],
  'Tattu': ['propulsion'],
  'GNB': ['propulsion'],
  'CNHL': ['propulsion'],
  'GAONENG': ['propulsion'],
  'ISDT': ['propulsion', 'electronics'],
  'ToolkitRC': ['propulsion', 'electronics'],
  'SKYRC': ['propulsion', 'electronics'],
  'Junsi iCharger': ['propulsion', 'electronics'],
  'EV-Peak': ['propulsion', 'electronics'],
  'HOTA': ['propulsion', 'electronics'],
  'Ultrapower': ['propulsion', 'electronics'],
  'TopON': ['propulsion', 'electronics'],
  'HTRC': ['propulsion', 'electronics'],
  'Flycolor': ['propulsion', 'electronics'],
  'Flipsky': ['propulsion', 'electronics'],
  'MAD': ['propulsion', 'vehicles'],
  'Maytech': ['propulsion', 'vehicles'],
  'DYS': ['propulsion', 'electronics'],
  'Lumenier': ['vehicles', 'propulsion', 'electronics', 'materials'],
  'Tarot': ['structural', 'vehicles', 'electronics'],
  'SunnyLife': ['materials', 'structural', 'electronics'],
  'ReadymadeRC': ['materials', 'vehicles', 'propulsion'],
  'Armattan': ['materials', 'vehicles', 'structural'],
  'Gemfan': ['propulsion', 'materials'],
  'HQProp': ['propulsion', 'materials'],
  'Dalprop': ['propulsion', 'materials'],
  'Aeronaut CAM Carbon': ['propulsion', 'materials'],
  'KIRISUN': ['command-control', 'safety'],
  'MARSRIVA': ['propulsion', 'safety'],
  'FaseLase': ['sensors', 'counter-uas'],
  'Test Brand': ['electronics'],
};

export interface ClassificationResult {
  brand_id: number;
  brand_name: string;
  categories: string[];
  method: 'known' | 'products' | 'keywords' | 'default';
  productSignals: Record<string, number>;
}

export function classifyBrand(
  brand: { id: number; name: string; description?: string; tagline?: string; long_description?: string },
  productCategoryIds: number[]
): ClassificationResult {
  const categories = new Set<string>();
  const productSignals: Record<string, number> = {};

  // Method 1: Known brands manual mapping (highest confidence, case-insensitive)
  const normalizedName = brand.name.toLowerCase().trim();
  const knownMatch = Object.entries(KNOWN_BRANDS).find(
    ([name]) => name.toLowerCase().trim() === normalizedName
  );
  if (knownMatch) {
    knownMatch[1].forEach(c => categories.add(c));
    return {
      brand_id: brand.id,
      brand_name: brand.name,
      categories: Array.from(categories),
      method: 'known',
      productSignals: {},
    };
  }

  // Method 2: Product category mapping (primary signal)
  for (const catId of productCategoryIds) {
    const solutions = CATEGORY_TO_SOLUTION[catId];
    if (solutions) {
      for (const s of solutions) {
        categories.add(s);
        productSignals[s] = (productSignals[s] || 0) + 1;
      }
    }
  }

  // Method 3: Brand name keyword matching
  const text = `${brand.name} ${brand.description || ''} ${brand.tagline || ''} ${brand.long_description || ''}`;
  for (const { pattern, categories: kwCats } of BRAND_KEYWORDS) {
    if (pattern.test(text)) {
      kwCats.forEach(c => categories.add(c));
    }
  }

  // If still no categories, default to electronics (most common for component sellers)
  if (categories.size === 0) {
    categories.add('electronics');
    return {
      brand_id: brand.id,
      brand_name: brand.name,
      categories: ['electronics'],
      method: 'default',
      productSignals: {},
    };
  }

  return {
    brand_id: brand.id,
    brand_name: brand.name,
    categories: Array.from(categories),
    method: productCategoryIds.length > 0 ? 'products' : 'keywords',
    productSignals,
  };
}

export async function classifyAllBrands(): Promise<ClassificationResult[]> {
  // Get all brands
  const brandsResult = await db.query(`
    SELECT id, name, slug, description, tagline, long_description, product_count
    FROM aegisky_brands
    ORDER BY product_count DESC NULLS LAST, name
  `);

  // Get all product category IDs grouped by brand in one efficient query
  // categories is JSONB array of objects like {"id": 741, "name": "...", "slug": "..."}
  const productCatsResult = await db.query(`
    SELECT
      (cat->>'id')::integer as brand_id,
      array_agg(DISTINCT (c->>'id')::integer) as category_ids
    FROM aegisky_products p,
    jsonb_array_elements(p.brands) as cat,
    jsonb_array_elements(p.categories) as c
    GROUP BY (cat->>'id')::integer
  `);

  // Build lookup map
  const brandCategories = new Map<number, number[]>();
  for (const row of productCatsResult.rows) {
    brandCategories.set(row.brand_id, row.category_ids);
  }

  const results: ClassificationResult[] = [];

  for (const brand of brandsResult.rows) {
    const categoryIds = brandCategories.get(brand.id) || [];
    const result = classifyBrand(brand, categoryIds);
    results.push(result);
  }

  return results;
}

export async function applyClassificationToDb(results: ClassificationResult[]): Promise<void> {
  console.log('Applying classification to database...');
  let updated = 0;

  for (const r of results) {
    await db.query(
      `UPDATE aegisky_brands SET solution_categories = $1::text[] WHERE id = $2`,
      [r.categories, r.brand_id]
    );
    updated++;
  }

  console.log(`Updated ${updated} brands.`);
}

// Run if called directly
if (require.main === module) {
  const applyMode = process.argv.includes('--apply');

  classifyAllBrands()
    .then(async results => {
      // Print summary
      const dist: Record<string, number> = {};
      for (const r of results) {
        for (const c of r.categories) {
          dist[c] = (dist[c] || 0) + 1;
        }
      }

      console.log('\n=== Classification Summary ===');
      console.log(`Total brands classified: ${results.length}`);
      console.log('\nCategory distribution:');
      for (const [cat, count] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${cat}: ${count} brands`);
      }

      const methods: Record<string, number> = {};
      for (const r of results) {
        methods[r.method] = (methods[r.method] || 0) + 1;
      }
      console.log('\nClassification methods:');
      for (const [m, c] of Object.entries(methods)) {
        console.log(`  ${m}: ${c}`);
      }

      // Show brands with only default classification
      const defaults = results.filter(r => r.method === 'default');
      if (defaults.length > 0) {
        console.log(`\nDefault-classified brands (${defaults.length}):`);
        for (const d of defaults.slice(0, 30)) {
          console.log(`  ${d.brand_name}`);
        }
      }

      if (applyMode) {
        await applyClassificationToDb(results);
        console.log('\nDatabase updated successfully!');
      } else {
        console.log('\nDry run only. Use --apply to write to database.');
      }

      process.exit(0);
    })
    .catch(err => {
      console.error('Classification failed:', err);
      process.exit(1);
    });
}
