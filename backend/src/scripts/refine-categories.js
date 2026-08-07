const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

// New subcategories to add (beyond existing 10000-10118)
// We'll add IDs starting from 10119
const newSubcategories = [
  // === Military & Defense UAV (parent: 10074) - reorganized per user request ===
  // Keep existing 10075-10079 but add new ones
  { id: 10119, name: 'Military FPV Drones', slug: 'military-fpv-drones', parent: 10074, desc: 'FPV drones for military applications, including kamikaze/strike FPV systems' },
  { id: 10120, name: 'Military Quadcopters', slug: 'military-quadcopters', parent: 10074, desc: 'Military-grade multirotor UAVs for reconnaissance, surveillance and combat' },
  { id: 10121, name: 'Thermal-Equipped Military Drones', slug: 'thermal-military-drones', parent: 10074, desc: 'Military drones equipped with thermal imaging cameras' },
  { id: 10122, name: 'Kamikaze & Loitering Munitions', slug: 'kamikaze-loitering-munitions', parent: 10074, desc: 'Suicide drones, loitering munitions and winged strike UAVs' },

  // === FPV Racing & Freestyle Drones (parent: 10002) sub-subcategories ===
  { id: 10123, name: '5" FPV Racing Drones', slug: '5-inch-fpv-racing-drones', parent: 10002, desc: 'Standard 5-inch FPV racing and freestyle drones' },
  { id: 10124, name: '7"-10" Long-Range FPV', slug: '7-10-inch-long-range-fpv', parent: 10002, desc: '7-inch, 9-inch, 10-inch long-range and heavy-lift FPV drones' },
  { id: 10125, name: 'Cinewhoop & Tinywhoop', slug: 'cinewhoop-tinywhoop', parent: 10002, desc: 'Indoor, ducted and micro FPV drones (Cinewhoop, Tinywhoop, Toothpick)' },

  // === Industrial Quadcopters (parent: 10003) sub-subcategories ===
  { id: 10126, name: 'Surveying & Mapping Drones', slug: 'surveying-mapping-drones', parent: 10003, desc: 'Professional surveying, mapping and photogrammetry drones' },
  { id: 10127, name: 'Agricultural Drones', slug: 'agricultural-drones', parent: 10003, desc: 'Agricultural spraying and crop monitoring drones' },
  { id: 10128, name: 'Security & Inspection Drones', slug: 'security-inspection-drones', parent: 10003, desc: 'Security patrol, inspection and emergency response drones' },

  // === RC Transmitters (parent: 10027) subcategories ===
  { id: 10129, name: 'Edge/ELRS Transmitters', slug: 'elrs-transmitters', parent: 10027, desc: 'ExpressLRS-based RC transmitters' },
  { id: 10130, name: 'FrSky & Multi-Protocol TX', slug: 'frsky-multiprotocol-tx', parent: 10027, desc: 'FrSky, multi-protocol and traditional RC transmitters' },
  { id: 10131, name: 'Long-Range RC Systems', slug: 'long-range-rc-systems', parent: 10027, desc: 'Crossfire, ELRS 900MHz and other long-range control systems' },

  // === Two-Way Radios (parent: 10032) subcategories ===
  { id: 10132, name: 'Handheld Walkie-Talkies', slug: 'handheld-walkie-talkies', parent: 10032, desc: 'Portable two-way radios and walkie-talkies' },
  { id: 10133, name: 'Mobile & Base Station Radios', slug: 'mobile-base-radios', parent: 10032, desc: 'Vehicle-mounted and base station radio systems' },

  // === FPV Goggles (parent: 10034) subcategories ===
  { id: 10134, name: 'Digital HD FPV Goggles', slug: 'digital-hd-fpv-goggles', parent: 10034, desc: 'Digital HD FPV goggles (DJI, HDZero, Walksnail)' },
  { id: 10135, name: 'Analog FPV Goggles', slug: 'analog-fpv-goggles', parent: 10034, desc: 'Analog FPV goggles with diversity receivers' },

  // === FPV Monitors (parent: 10035) subcategories ===
  { id: 10136, name: '5" FPV Monitors', slug: '5-inch-fpv-monitors', parent: 10035, desc: '5-inch compact FPV field monitors' },
  { id: 10137, name: '7"+ FPV Monitors', slug: '7-inch-plus-fpv-monitors', parent: 10035, desc: '7-inch and larger FPV monitors with DVR' },

  // === LiDAR & Distance Sensors (parent: 10024) subcategories ===
  { id: 10138, name: '2D LiDAR Scanners', slug: '2d-lidar-scanners', parent: 10024, desc: '2D planar LiDAR scanners for obstacle avoidance' },
  { id: 10139, name: '3D LiDAR & Mapping Sensors', slug: '3d-lidar-mapping-sensors', parent: 10024, desc: '3D LiDAR for mapping, SLAM and surveying' },
  { id: 10140, name: 'Range & ToF Sensors', slug: 'range-tof-sensors', parent: 10024, desc: 'Laser rangefinders and ToF distance sensors' },

  // === Counter-UAV (parent: 10047) subcategories ===
  { id: 10141, name: 'Portable Anti-Drone Jammers', slug: 'portable-anti-drone-jammers', parent: 10047, desc: 'Handheld and portable drone jamming systems' },
  { id: 10142, name: 'Fixed Drone Detection Systems', slug: 'fixed-drone-detection-systems', parent: 10047, desc: 'Fixed-site drone detection and neutralization systems' },
  { id: 10143, name: 'Drone Detection Radars', slug: 'drone-detection-radars', parent: 10047, desc: 'Radar systems for UAV detection and tracking' },

  // === Drone Frames (parent: 10054) subcategories ===
  { id: 10144, name: '5" FPV Frames', slug: '5-inch-fpv-frames', parent: 10054, desc: '5-inch FPV racing and freestyle frames' },
  { id: 10145, name: '7"+ Long-Range Frames', slug: '7-inch-plus-frames', parent: 10054, desc: '7-inch, 9-inch, 10-inch long-range FPV frames' },
  { id: 10146, name: 'Cinewhoop & Ducted Frames', slug: 'cinewhoop-ducted-frames', parent: 10054, desc: 'Cinewhoop, ducted and micro FPV frames' },
  { id: 10147, name: 'Industrial Drone Frames', slug: 'industrial-drone-frames', parent: 10054, desc: 'Heavy-lift and industrial multirotor frames' },

  // === ICs, Chips & Modules (parent: 10057) subcategories ===
  { id: 10148, name: 'ESC & Motor Driver ICs', slug: 'esc-motor-driver-ics', parent: 10057, desc: 'Motor driver ICs, ESC chips and power MOSFETs' },
  { id: 10149, name: 'RF & Wireless Modules', slug: 'rf-wireless-modules', parent: 10057, desc: 'RF transceiver modules, WiFi, Bluetooth chips' },
  { id: 10150, name: 'Voltage Regulators & PMICs', slug: 'voltage-regulators-pmics', parent: 10057, desc: 'Voltage regulators, BECs and power management ICs' },
  { id: 10151, name: 'Sensors & IMU Modules', slug: 'sensors-imu-modules', parent: 10057, desc: 'Gyros, accelerometers, barometers and IMU modules' },

  // === Single-Board Computers (parent: 10061) subcategories ===
  { id: 10152, name: 'Raspberry Pi & Alternatives', slug: 'raspberry-pi-alternatives', parent: 10061, desc: 'Raspberry Pi and compatible SBCs' },
  { id: 10153, name: 'NVIDIA Jetson & AI Boards', slug: 'nvidia-jetson-ai-boards', parent: 10061, desc: 'NVIDIA Jetson and other AI computing boards' },
  { id: 10154, name: 'ESP32 & Microcontrollers', slug: 'esp32-microcontrollers', parent: 10061, desc: 'ESP32, STM32 and other microcontroller boards' },

  // === Assembly & Soldering Tools (parent: 10064) subcategories ===
  { id: 10155, name: 'Soldering Stations & Tips', slug: 'soldering-stations-tips', parent: 10064, desc: 'Soldering stations, irons and replacement tips' },
  { id: 10156, name: 'Multimeters & Test Equipment', slug: 'multimeters-test-equipment', parent: 10064, desc: 'Multimeters, oscilloscopes and testing tools' },
  { id: 10157, name: 'Screwdrivers & Hand Tools', slug: 'screwdrivers-hand-tools', parent: 10064, desc: 'Precision screwdrivers, pliers and hand tools' },
  { id: 10158, name: 'Heat Guns & Rework Tools', slug: 'heat-guns-rework-tools', parent: 10064, desc: 'Hot air stations, heat guns and rework equipment' },

  // === Accessories (parent: 10066) subcategories ===
  { id: 10159, name: 'Drone Cases & Backpacks', slug: 'drone-cases-backpacks', parent: 10066, desc: 'Protective cases, backpacks and carrying bags' },
  { id: 10160, name: 'Propeller Guards & Protection', slug: 'propeller-guards-protection', parent: 10066, desc: 'Propeller guards, bumpers and protective gear' },
  { id: 10161, name: 'Cables, Adapters & Connectors', slug: 'cables-adapters-connectors', parent: 10066, desc: 'Cables, adapters, connectors and wiring accessories' },
  { id: 10162, name: 'Stands, Pads & Landing Gear', slug: 'stands-pads-landing-gear', parent: 10066, desc: 'Landing pads, display stands and landing gear' },
  { id: 10163, name: 'Camera Filters & Lens Accessories', slug: 'camera-filters-lens-accessories', parent: 10066, desc: 'ND filters, lens caps and camera accessories' },

  // === Lighting & Illumination (parent: 10067) subcategories ===
  { id: 10164, name: 'Drone Strobe & Navigation Lights', slug: 'drone-strobe-navigation-lights', parent: 10067, desc: 'Anti-collision strobes and navigation lights for drones' },
  { id: 10165, name: 'Flashlights & Headlamps', slug: 'flashlights-headlamps', parent: 10067, desc: 'Tactical flashlights and headlamps' },
  { id: 10166, name: 'Searchlights & Beacons', slug: 'searchlights-beacons', parent: 10067, desc: 'High-power searchlights and emergency beacons' },

  // === Portable Power Stations (parent: 10051) subcategories ===
  { id: 10167, name: 'Compact Power Stations (<500Wh)', slug: 'compact-power-stations', parent: 10051, desc: 'Portable power stations under 500Wh' },
  { id: 10168, name: 'Large Power Stations (500Wh+)', slug: 'large-power-stations', parent: 10051, desc: 'High-capacity portable power stations 500Wh and above' },

  // === Servo subcategories fix - rename/replace 0-count ones ===
  // 10089 High-Torque & Industrial Servos will get products mapped
  // 10110 Industrial Chargers will get products mapped
  // 10115 Handheld Thermal Cameras will get products mapped
];

// Classification rules: keyword-based mapping to leaf categories
// Order matters - first match wins for specific categories
const classificationRules = [
  // === Military FPV Drones (10119) ===
  { catId: 10119, patterns: [/fpv.*(?:воен|боев|удар|арми|спец|пут|зверобой|надзиратель)/i, /(?:воен|боев|удар|арми).*fpv/i, /fpv.*(?:грузовик|тяжел|10.*дюйм|7.*дюйм.*воен)/i, /atway.*путь/i, /fpv.*дрон.*\d+.*дюйм/i] },

  // === Military Quadcopters (10120) ===
  { catId: 10120, patterns: [/(?:квадрокоптер|квадро).*(?:воен|боев|удар|арми|спец|охран|развед|спасат|гигант|промышл).*(?:про|для|на)/i, /(?:промышленный|военный).*квадрокоптер/i, /квадрокоптер.*(?:охран|развед|спасат|гигант|помощник|m300|x30|x1000|td0)/i, /квадрокоптер.*f[yx]/i, /дрон.*грузовик|грузовик.*дрон/i, /дрон.*грузоподъемностью/i, /cp\d+.*x\d+/i, /дрон.*лифт/i, /дрон.*dhf/i, /дрон.*dlm/i] },

  // === Thermal Military Drones (10121) ===
  { catId: 10121, patterns: [/(?:воен|боев|удар|арми|многоцел).*(?:теплов|тепловизион|thermal)/i, /дрон.*с.*тепловиз/i, /(?:теплов|тепловизион).*(?:воен|боев|удар|арми)/i] },

  // === Kamikaze/Loitering Munitions (10122) ===
  { catId: 10122, patterns: [/(?:крылат|ударн|камикадзе|баражирующ|гранатат|бомбардировщик|боевой.*комплекс|ударн.*комплекс)/i, /летящ.*гранат/i, /крылатый ударный/i, /ударн.*крылат/i, /многоцелевой ударный/i, /ударн.*беспилотник/i] },

  // === 5" FPV Racing (10123) ===
  { catId: 10123, patterns: [/5["\s]*дюйм.*fpv|fpv.*5["\s]*дюйм/i, /5["\s]*inch.*fpv|fpv.*5["\s]*inch/i, /racing.*drone.*5/i, /фристайл.*5/i, /(?:mark|mk|elrs|bind.*fly).*5["\s]*inch/i] },

  // === 7-10" Long-Range FPV (10124) ===
  { catId: 10124, patterns: [/[789]\s*["\s]*дюйм|10\s*["\s]*дюйм/i, /[789]\s*["\s]*inch|10\s*["\s]*inch/i, /long.?range.*fpv/i, /дальн.*fpv/i, /7i|7inch|10inch|9inch/i, /(?:тяжел|груз).*fpv/i] },

  // === Cinewhoop/Tinywhoop (10125) ===
  { catId: 10125, patterns: [/cinewhoop|tinywhoop|toothpick|whoop/i, /микро.*fpv|micro.*fpv/i, /室内.*fpv/i, /ducted/i, /\d+s.*whoop/i, /tiny.*whoop/i] },

  // === Surveying/Mapping Drones (10126) ===
  { catId: 10126, patterns: [/(?:съемк|картограф|геодез|маркшейд|фотограмметр|lidar|survey|mapping|surveying)/i, /дрон.*для.*съемк/i, /аэрофотосъемк/i, /картографиров/i] },

  // === Agricultural Drones (10127) ===
  { catId: 10127, patterns: [/(?:сельскохоз|агро|опрыскив|распылит|полив|удобрен|agricultur|spraying|farm)/i, /аграрн.*дрон/i, /дрон.*для.*поля/i, /f50.*сельскохоз/i] },

  // === Security/Inspection Drones (10128) ===
  { catId: 10128, patterns: [/(?:охран|патрул|инспекц|контрол|мониторинг|наблюден|безопасн|инспект|патруль)/i, /дрон.*охран/i, /инспекц.*дрон/i] },

  // === ELRS Transmitters (10129) ===
  { catId: 10129, patterns: [/elrs.*(?:transmitter|пульт|radio|tx)|(?:transmitter|пульт|radio|tx).*elrs/i, /radiomaster.*boxer|radiomaster.*tx12|radiomaster.*zorro|jumper.*t-lite|jumper.*t-pro|betafpv.*literadio|happymodel.*es24/i] },

  // === FrSky/Multi-Protocol TX (10130) ===
  { catId: 10130, patterns: [/frsky.*(?:transmitter|tx|пульт)|(?:transmitter|tx|пульт).*frsky/i, /futaba.*(?:transmitter|tx|пульт)|(?:transmitter|tx|пульт).*futaba/i, /wfly|flysky.*(?:transmitter|tx|пульт)/i, /radiolink.*(?:transmitter|tx|пульт)/i, /multi.?protocol/i] },

  // === Long-Range RC Systems (10131) ===
  { catId: 10131, patterns: [/crossfire.*(?:tx|transmitter|пульт)|(?:tx|transmitter|пульт).*crossfire/i, /long.?range.*(?:radio|system|tx|пульт)/i, /900mhz.*(?:tx|radio|system)/i, /expresslrs.*900/i, /elrs.*long.?range/i] },

  // === Handheld Walkie-Talkies (10132) ===
  { catId: 10132, patterns: [/(?:рация|walkie|портативн|ручна|handheld|portable).*(?:радиостанц|walkie|рация)/i, /baofeng|kenwood|motorola.*(?:radio|walkie)/i, /uv-5r|uv-82|bf-888/i] },

  // === Mobile/Base Radios (10133) ===
  { catId: 10133, patterns: [/(?:автомобильн|мобильн|базов|стационарн|mobile|base|vehicle).*(?:радиостанц|radio)/i, /retevis|baojie.*bj-/i] },

  // === Digital HD FPV Goggles (10134) ===
  { catId: 10134, patterns: [/(?:dji|hdzero|walksnail|hd|цифров|digital).*(?:goggle|очки|шлем)/i, /(?:goggle|очки|шлем).*(?:dji|hdzero|walksnail|hd|цифров|digital)/i, /v2.*goggle|v3.*goggle|goggles.*hd/i, /avatar.*goggle/i] },

  // === Analog FPV Goggles (10135) ===
  { catId: 10135, patterns: [/(?:analog|аналог).*(?:goggle|очки|шлем)/i, /(?:goggle|очки|шлем).*(?:analog|аналог|diversity|5\.8)/i, /ev200|skyzone.*v|fatshark|eachine.*ev/i, /goggle.*5\.8/i] },

  // === 5" FPV Monitors (10136) ===
  { catId: 10136, patterns: [/5["\s]*(?:inch|дюйм).*(?:monitor|дисплей|экран)/i, /(?:monitor|дисплей|экран).*5["\s]*(?:inch|дюйм)/i, /5"?.*fpv.*monitor/i] },

  // === 7"+ FPV Monitors (10137) ===
  { catId: 10137, patterns: [/[789]\s*["\s]*(?:inch|дюйм).*(?:monitor|дисплей|экран)/i, /(?:monitor|дисплей|экран).*[789]\s*["\s]*(?:inch|дюйм)/i, /7"?.*fpv.*monitor|dvr.*monitor/i] },

  // === 2D LiDAR (10138) ===
  { catId: 10138, patterns: [/2d.*lidar|lidar.*2d/i, /rplidar.*a|sick.*tim|hokuyo.*urg|ldrobot.*ld/i, /slamtec.*rplidar.*a/i] },

  // === 3D LiDAR (10139) ===
  { catId: 10139, patterns: [/3d.*lidar|lidar.*3d/i, /(?:velodyne|ouster|hesai|robosense|livox|inno)/i, /rplidar.*m|rs-|vlp-|ouster.*os/i, /solid.state.*lidar/i, /mapping.*lidar/i] },

  // === Range/ToF Sensors (10140) ===
  { catId: 10140, patterns: [/(?:tof|time.of.flight|range.?finder|лазерн.*дальномер|rangefinder|tf.|vl53|benewake|tfmini|tfluna)/i, /дистанц.*датчик/i, /дальномер/i] },

  // === Portable Anti-Drone Jammers (10141) ===
  { catId: 10141, patterns: [/(?:портативн|ручной|handheld|portable|переносн).*(?:противодрон|антидрон|anti.?drone|jammer|глушил|подавител)/i, /(?:противодрон|антидрон|anti.?drone|jammer|глушил|подавител).*(?:портативн|ручной|handheld|portable|переносн)/i, /глушил.*дрон/i, /подавител.*бпла/i, /ружье.*против/i, /anti.?drone.*gun/i] },

  // === Fixed Drone Detection (10142) ===
  { catId: 10142, patterns: [/(?:стационарн|fixed|купольн|капюшон|купольн).*(?:противодрон|антидрон|подавител|обнаруж|detect)/i, /(?:противодрон|антидрон|подавител).*(?:стационарн|fixed|система|комплекс)/i, /пво.*систем/i, /капюшон/i, /систем.*борьбы.*с.*бпла/i] },

  // === Drone Detection Radars (10143) ===
  { catId: 10143, patterns: [/(?:радар|radar|рлс).*(?:обнаруж|дрон|бпла|противодрон)/i, /(?:обнаруж|детект).*(?:радар|radar|рлс)/i] },

  // === 5" FPV Frames (10144) ===
  { catId: 10144, patterns: [/5["\s]*(?:inch|дюйм).*(?:frame|рама|каркас)/i, /(?:frame|рама|каркас).*5["\s]*(?:inch|дюйм)/i, /armattan.*5|gepr.*5|iflight.*5|diatone.*5/i, /mark.*5.*frame/i] },

  // === 7"+ Long-Range Frames (10145) ===
  { catId: 10145, patterns: [/[789]\s*["\s]*(?:inch|дюйм).*(?:frame|рама|каркас)/i, /10\s*["\s]*(?:inch|дюйм).*(?:frame|рама|каркас)/i, /(?:frame|рама|каркас).*[789]\s*["\s]*(?:inch|дюйм)/i, /long.?range.*frame/i, /xl.*frame|lr.*frame/i] },

  // === Cinewhoop/Ducted Frames (10146) ===
  { catId: 10146, patterns: [/cinewhoop.*(?:frame|рама)|(?:frame|рама).*cinewhoop/i, /whoop.*(?:frame|рама)|(?:frame|рама).*whoop/i, /ducted.*(?:frame|рама)|(?:frame|рама).*ducted/i, /toothpick.*(?:frame|рама)/i] },

  // === Industrial Frames (10147) ===
  { catId: 10147, patterns: [/(?:промышлен|heavy.?lift|грузоподъем|индустриал).*(?:frame|рама|каркас)/i, /(?:frame|рама|каркас).*(?:промышлен|heavy.?lift|грузоподъем|индустриал)/i, /x4.*frame|x6.*frame|x8.*frame/i, /квадрокоптер.*рама|рама.*квадрокоптер.*пром/i] },

  // === ESC/Motor Driver ICs (10148) ===
  { catId: 10148, patterns: [/(?:esc|моторн|драйвер|motor.*driver|mosfet|транзистор|ключ).*(?:чип|микросх|ic|chip|модуль)/i, /(?:чип|микросх|ic|chip|модуль).*(?:esc|моторн|драйвер|motor.*driver|mosfet|транзистор|ключ)/i, /bb2|blheli|am32|fd6|tp.*mosfet/i] },

  // === RF/Wireless Modules (10149) ===
  { catId: 10149, patterns: [/(?:rf|радио|wireless|wifi|bluetooth|блютуз|вай.?фай).*(?:модуль|чип|microscheme|ic|chip)/i, /(?:модуль|чип|ic|chip).*(?:rf|радио|wireless|wifi|bluetooth|блютуз|вай.?фай|прием|передат)/i, /esp8266|esp32|nrf24|cc25|sx12|bk48|at8|ch34/i, /expresslrs.*receiver|elrs.*receiver/i] },

  // === Voltage Regulators/PMICs (10150) ===
  { catId: 10150, patterns: [/(?:bec|регулятор.*напряжен|voltage.*reg|step.?down|step.?up|buck|boost|ldo|pmic|преобразовател|импульсн.*стабил)/i, /lm25|mp15|ams11|7805|7812|xl40|mt36/i] },

  // === Sensors & IMU (10151) ===
  { catId: 10151, patterns: [/(?:imu|гироскоп|акселерометр|барометр|магнитометр|compass|sensor|датчик|gyro|accel|baro|mag)/i, /mpu6|mpu9|icm2|icm4|bmi2|bmx0|qmc5|hmc5|ms56|bmp2|spl0/i] },

  // === Raspberry Pi (10152) ===
  { catId: 10152, patterns: [/raspberry.?pi|raspbian|pi ?zero|pi ?[345]/i, /orange.?pi|banana.?pi|rock.?pi|radxa.*zero/i, /одноплатн.*компьютер.*pi/i] },

  // === NVIDIA Jetson (10153) ===
  { catId: 10153, patterns: [/jetson|nvidia.*(?:nano|xavier|orin|tx)|orin|xavier/i, /(?:nano|xavier|orin).*(?:ai|compute|board)/i] },

  // === ESP32/Microcontrollers (10154) ===
  { catId: 10154, patterns: [/esp32|esp8266|stm32|arduino|rp2040|raspberry.*pico/i, /(?:микроконтроллер|microcontroller|мк|mcu)/i, /atmega|attiny|ch32/i] },

  // === Soldering Stations (10155) ===
  { catId: 10155, patterns: [/(?:паяльн.*станци|паяльник|soldering.*station|soldering.*iron|жало.*паяльн)/i, /ts100|ts80|ts101|hakko|quick.*86|sequre|succezz/i] },

  // === Multimeters/Test Equipment (10156) ===
  { catId: 10156, patterns: [/(?:мультиметр|multimeter|тестер|осциллограф|oscilloscope|измерител|ваттметр|токов.*клещ)/i, /dt830|dt92|aneng|uni-?t|fluke|rigol/i] },

  // === Screwdrivers/Hand Tools (10157) ===
  { catId: 10157, patterns: [/(?:отвертк|screwdriver|плоскогубц|кусачк|пассатиж|пинцет|набор.*инструмент|hex.*key|imbus)/i, /wiha|wera|ifixit|proskit/i] },

  // === Heat Guns/Rework (10158) ===
  { catId: 10158, patterns: [/(?:термовоздуш|фен.*паяльн|heat.*gun|hot.?air.*station|реболл|rework|трафарет)/i, /quick.*85|858d|8586|saike|yihua.*8/i] },

  // === Drone Cases/Backpacks (10159) ===
  { catId: 10159, patterns: [/(?:кейс|чехол|рюкзак|сумк|case|backpack|bag).*(?:дрон|квадрокоптер|fpv|аппаратур|пульт|очки)/i, /(?:дрон|квадрокоптер|fpv|аппаратур|пульт|очки).*(?:кейс|чехол|рюкзак|сумк|case|backpack|bag)/i, /защитн.*кейс/i, /hard.?case/i] },

  // === Propeller Guards (10160) ===
  { catId: 10160, patterns: [/(?:защит.*пропеллер|пропеллер.*защит|propeller.*guard|prop.*guard|защитн.*кольц|бампер|bumper)/i, /кожух.*пропеллер/i] },

  // === Cables/Adapters (10161) ===
  { catId: 10161, patterns: [/(?:кабель|провод|адаптер|переходник|разъем|connector|cable|adapter|штекер|гнездо|usb.*type|hdmi|xt6|xt9|deans|t.?plug|банан)/i] },

  // === Stands/Pads/Landing Gear (10162) ===
  { catId: 10162, patterns: [/(?:посадочн.*площадк|landing.*pad|шасси|landing.*gear|подставк|стенд|stand|ножк.*дрон)/i, /launch.?pad/i] },

  // === Camera Filters (10163) ===
  { catId: 10163, patterns: [/(?:фильтр.*объектив|nd.*фильтр|светофильтр|lens.*filter|nd\d+|uv.*filter|polariz.*filter|cpl.*filter)/i, /фильтр.*камер/i, /(?:nd|cpl|uv).*\d{2}mm/i] },

  // === Drone Strobe Lights (10164) ===
  { catId: 10164, patterns: [/(?:строб|strobe|маячки|сигнальн.*огн|антиколлиз|navigation.*light|ночн.*огн|led.*дрон|дрон.*led.*огн)/i, /fire.*arc|lucent|strobon/i] },

  // === Flashlights/Headlamps (10165) ===
  { catId: 10165, patterns: [/(?:фонарь|фонарик|фара|headlamp|налобн.*фонар|карманн.*фонар|tactical.*flashlight|led.*фонар)/i, /convoy|sofirn|olight|nitecore|fenix/i] },

  // === Searchlights/Beacons (10166) ===
  { catId: 10166, patterns: [/(?:прожектор|searchlight|поисков.*фонар|маяк|beacon|аварийн.*сигнал|сигнальн.*ракет|sos)/i, /дрон.*прожектор/i, /подвесн.*фонар/i] },

  // === Compact Power Stations (10167) ===
  { catId: 10167, patterns: [/(?:электростанц|power.*station|портативн.*аккумул).*(?:\d{2,3}\s*(?:wh|втч)|до.*500|мала|компакт)/i, /\d{2,3}\s*wh.*power/i, /ecoflow.*river|anker.*521|bluetti.*eb3/i] },

  // === Large Power Stations (10168) ===
  { catId: 10168, patterns: [/(?:электростанц|power.*station|портативн.*аккумул).*(?:\d{3,4}\s*(?:wh|втч)|[5-9]\d{2}|1\d{3}|больш|мощн)/i, /ecoflow.*delta|anker.*555|anker.*757|bluetti.*ac|jackery.*1000|jackery.*1500/i] },

  // === High-Torque Industrial Servos (10089) ===
  { catId: 10089, patterns: [/(?:сервопривод|servo).*(?:промышлен|тягов|мощн|больш|тяжел|industrial|high.?torque|heavy.?duty|кг.*см|kg.*cm.*\d{2,})/i, /(?:промышлен|тягов|мощн|больш|тяжел|industrial|high.?torque|heavy.?duty).*(?:сервопривод|servo)/i, /\d{2,3}kg.*servo|servo.*\d{2,3}kg/i] },

  // === Industrial/Multi-Chemistry Chargers (10110) ===
  { catId: 10110, patterns: [/(?:зарядн.*устройств|charger).*(?:промышлен|индустриал|multi.?chemistry|универсальн.*для.*всех|мощн.*\d{3,4}w|лифер|lifepo4|свинц|pb|lead.*acid)/i, /(?:промышлен|индустриал|multi.?chemistry|lifepo4|свинц|lead.*acid).*(?:зарядн.*устройств|charger)/i] },

  // === Handheld Thermal Cameras (10115) ===
  { catId: 10115, patterns: [/(?:ручной|портативн|handheld|карманн).*(?:теплов|тепловизион|thermal).*(?:камер|camera|прицел|imager)/i, /(?:теплов|тепловизион|thermal).*(?:ручной|портативн|handheld|карманн)/i, /flir.*one|flir.*c[235]|seek.*thermal|topdon.*tc|hikmicro.*pocket/i] },
];

// Also need to handle existing subcategory mappings for motors/ESC/VTX/receivers/etc.
// Those were already set up by the previous script. We just need to make sure
// products in parent categories also get leaf categories.

// Parent-to-leaf fallback: if a product is in a parent but no leaf matched,
// try to assign to the most common leaf based on existing classification.

(async () => {
  await c.connect();
  console.log('Connected to database');

  // Step 1: Add new subcategories
  console.log(`Adding ${newSubcategories.length} new subcategories...`);
  for (const sc of newSubcategories) {
    await c.query(`
      INSERT INTO aegisky_categories (id, name, slug, parent, description, product_count, image_url, depth)
      VALUES ($1, $2, $3, $4, $5, 0, NULL, 0)
      ON CONFLICT (id) DO UPDATE SET name=$2, slug=$3, parent=$4, description=$5
    `, [sc.id, sc.name, sc.slug, sc.parent, sc.desc]);
  }
  console.log('New subcategories created');

  // Step 2: Get all products
  const products = await c.query('SELECT id, name, categories FROM aegisky_products');
  console.log(`Classifying ${products.rowCount} products...`);

  // Get all categories for building paths
  const allCats = await c.query('SELECT id, name, slug, parent FROM aegisky_categories WHERE id >= 10000');
  const catById = {};
  for (const cat of allCats.rows) catById[cat.id] = cat;

  function getAllParents(catId) {
    const parents = [];
    let p = catById[catId]?.parent;
    while (p > 0) {
      parents.push(p);
      p = catById[p]?.parent;
    }
    return parents;
  }

  let classified = 0;
  let alreadyClassified = 0;

  for (const product of products.rows) {
    const name = product.name || '';
    const existingIds = (product.categories || []).map(c => c.id);

    // Find matching leaf categories from rules
    const newLeafIds = new Set();
    for (const rule of classificationRules) {
      if (rule.patterns.some(p => p.test(name))) {
        newLeafIds.add(rule.catId);
      }
    }

    // Build the complete category set: existing categories + new leaves + their parents
    const finalIds = new Set(existingIds);
    for (const leafId of newLeafIds) {
      finalIds.add(leafId);
      for (const pid of getAllParents(leafId)) {
        finalIds.add(pid);
      }
    }

    // Convert to category objects
    const catsJson = [...finalIds].map(id => {
      const cat = catById[id];
      if (!cat) return null;
      return { id, name: cat.name, slug: cat.slug };
    }).filter(Boolean);

    if (newLeafIds.size > 0) classified++;
    else alreadyClassified++;

    await c.query('UPDATE aegisky_products SET categories = $1::jsonb WHERE id = $2',
      [JSON.stringify(catsJson), product.id]);
  }

  console.log(`Classified: ${classified} products got new leaf categories`);
  console.log(`Already classified: ${alreadyClassified} products`);

  // Step 3: Update product counts
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

  // Step 4: Print final tree
  console.log('\n=== FINAL CATEGORY TREE ===\n');
  const finalCats = await c.query(`
    SELECT id, name, slug, parent, product_count
    FROM aegisky_categories WHERE id >= 10000 ORDER BY parent, product_count DESC
  `);

  function printTree(parentId, depth) {
    const children = finalCats.rows.filter(c => c.parent === parentId).sort((a,b) => b.product_count - a.product_count);
    for (const child of children) {
      console.log(`${'  '.repeat(depth)}[${child.id}] ${child.name}: ${child.product_count}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  // Verify 100% coverage
  const unmapped = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE jsonb_array_length(categories) = 0 OR categories IS NULL`);
  console.log(`\nUnmapped products: ${unmapped.rows[0].cnt}`);

  // Check for 0-count leaf categories
  const zeroLeaves = await c.query(`
    SELECT id, name FROM aegisky_categories
    WHERE id >= 10000 AND product_count = 0
    AND NOT EXISTS (SELECT 1 FROM aegisky_categories child WHERE child.parent = aegisky_categories.id)
  `);
  if (zeroLeaves.rowCount > 0) {
    console.log(`\nWARNING: ${zeroLeaves.rowCount} leaf categories with 0 products:`);
    for (const z of zeroLeaves.rows) console.log(`  [${z.id}] ${z.name}`);
  }

  await c.end();
  console.log('\nDone!');
})();
