/**
 * Aegisky Medusa - Standard B2B Category System
 * Maps 1033 raw WooCommerce categories to ~55 standard drone industry categories
 */

// Standard categories with English/Russian names and hierarchy
const STANDARD_CATEGORIES = [
  // === DRONES & COMPLETE SYSTEMS ===
  { id: 'drones-consumer', name: { en: 'Consumer Drones', ru: 'Потребительские дроны' }, slug: 'consumer-drones', parent: null, icon: 'drone' },
  { id: 'drones-professional', name: { en: 'Professional Drones', ru: 'Профессиональные дроны' }, slug: 'professional-drones', parent: null, icon: 'briefcase' },
  { id: 'drones-fpv', name: { en: 'FPV Drones', ru: 'FPV дроны' }, slug: 'fpv-drones', parent: null, icon: 'goggles' },
  { id: 'drones-racing', name: { en: 'Racing Drones', ru: 'Гоночные дроны' }, slug: 'racing-drones', parent: 'drones-fpv', icon: 'trophy' },
  { id: 'drones-enterprise', name: { en: 'Enterprise Drones', ru: 'Корпоративные дроны' }, slug: 'enterprise-drones', parent: null, icon: 'building' },
  { id: 'drones-industrial', name: { en: 'Industrial Drones', ru: 'Промышленные дроны' }, slug: 'industrial-drones', parent: 'drones-enterprise', icon: 'factory' },
  { id: 'drones-agricultural', name: { en: 'Agricultural Drones', ru: 'Сельскохозяйственные дроны' }, slug: 'agricultural-drones', parent: 'drones-enterprise', icon: 'wheat' },
  { id: 'drones-military', name: { en: 'Defense & Military', ru: 'Военные дроны' }, slug: 'military-drones', parent: null, icon: 'shield' },
  { id: 'drones-underwater', name: { en: 'Underwater Drones', ru: 'Подводные дроны' }, slug: 'underwater-drones', parent: null, icon: 'waves' },
  { id: 'drones-toys', name: { en: 'Toy Drones', ru: 'Игрушечные дроны' }, slug: 'toy-drones', parent: null, icon: 'gamepad' },
  { id: 'drones-thermal', name: { en: 'Thermal Imaging Drones', ru: 'Дроны с тепловизором' }, slug: 'thermal-drones', parent: 'drones-enterprise', icon: 'thermometer' },

  // === FLIGHT CONTROLLERS & AUTOPILOTS ===
  { id: 'flight-controllers', name: { en: 'Flight Controllers', ru: 'Полетные контроллеры' }, slug: 'flight-controllers', parent: null, icon: 'cpu' },
  { id: 'autopilots', name: { en: 'Autopilots', ru: 'Автопилоты' }, slug: 'autopilots', parent: 'flight-controllers', icon: 'navigation' },
  { id: 'esc', name: { en: 'ESCs & Speed Controllers', ru: 'Регуляторы скорости' }, slug: 'esc', parent: null, icon: 'zap' },
  { id: 'power-modules', name: { en: 'Power Modules', ru: 'Модули питания' }, slug: 'power-modules', parent: 'esc', icon: 'battery' },

  // === MOTORS & PROPULSION ===
  { id: 'motors', name: { en: 'Motors', ru: 'Двигатели' }, slug: 'motors', parent: null, icon: 'rotate-cw' },
  { id: 'propellers', name: { en: 'Propellers', ru: 'Пропеллеры' }, slug: 'propellers', parent: null, icon: 'wind' },
  { id: 'propellers-2blade', name: { en: '2-Blade Propellers', ru: 'Пропеллеры, 2 лопасти' }, slug: 'propellers-2-blade', parent: 'propellers', icon: 'wind' },
  { id: 'propellers-3blade', name: { en: '3-Blade Propellers', ru: 'Пропеллеры, 3 лопасти' }, slug: 'propellers-3-blade', parent: 'propellers', icon: 'wind' },
  { id: 'servos', name: { en: 'Servos & Actuators', ru: 'Сервоприводы' }, slug: 'servos', parent: null, icon: 'settings' },

  // === FRAMES & BUILD PARTS ===
  { id: 'frames', name: { en: 'Frames', ru: 'Рамы' }, slug: 'frames', parent: null, icon: 'square' },
  { id: 'landing-gear', name: { en: 'Landing Gear', ru: 'Шасси' }, slug: 'landing-gear', parent: 'frames', icon: 'arrow-down' },
  { id: 'gimbals', name: { en: 'Camera Gimbals', ru: 'Подвесы' }, slug: 'gimbals', parent: null, icon: 'camera' },
  { id: 'gimbal-accessories', name: { en: 'Gimbal Accessories', ru: 'Аксессуары для подвесов' }, slug: 'gimbal-accessories', parent: 'gimbals', icon: 'settings' },

  // === CAMERAS & VIDEO ===
  { id: 'cameras', name: { en: 'Cameras', ru: 'Камеры' }, slug: 'cameras', parent: null, icon: 'camera' },
  { id: 'camera-lenses', name: { en: 'Lenses', ru: 'Объективы' }, slug: 'camera-lenses', parent: 'cameras', icon: 'eye' },
  { id: 'fpv-cameras', name: { en: 'FPV Cameras', ru: 'FPV камеры' }, slug: 'fpv-cameras', parent: 'cameras', icon: 'video' },
  { id: 'thermal-cameras', name: { en: 'Thermal Cameras', ru: 'Тепловизоры' }, slug: 'thermal-cameras', parent: 'cameras', icon: 'thermometer' },
  { id: 'monitors', name: { en: 'Monitors & Displays', ru: 'Мониторы' }, slug: 'monitors', parent: null, icon: 'monitor' },

  // === FPV SYSTEMS ===
  { id: 'fpv-goggles', name: { en: 'FPV Goggles', ru: 'FPV очки' }, slug: 'fpv-goggles', parent: null, icon: 'eye' },
  { id: 'fpv-goggle-accessories', name: { en: 'FPV Goggle Accessories', ru: 'Аксессуары для FPV-очков' }, slug: 'fpv-goggle-accessories', parent: 'fpv-goggles', icon: 'settings' },
  { id: 'vtx', name: { en: 'Video Transmitters (VTX)', ru: 'Видеопередатчики' }, slug: 'vtx', parent: null, icon: 'radio' },
  { id: 'vrx', name: { en: 'Video Receivers (VRX)', ru: 'Видеоприемники' }, slug: 'vrx', parent: null, icon: 'radio' },
  { id: 'antennas', name: { en: 'Antennas', ru: 'Антенны' }, slug: 'antennas', parent: null, icon: 'signal' },

  // === RADIO & CONTROL ===
  { id: 'transmitters', name: { en: 'Radio Transmitters', ru: 'Передатчики' }, slug: 'transmitters', parent: null, icon: 'radio' },
  { id: 'receivers', name: { en: 'Receivers', ru: 'Приемники' }, slug: 'receivers', parent: null, icon: 'radio' },
  { id: 'controller-accessories', name: { en: 'Controller Accessories', ru: 'Аксессуары для пультов' }, slug: 'controller-accessories', parent: null, icon: 'settings' },

  // === BATTERIES & POWER ===
  { id: 'batteries', name: { en: 'Batteries', ru: 'Аккумуляторы' }, slug: 'batteries', parent: null, icon: 'battery' },
  { id: 'chargers', name: { en: 'Battery Chargers', ru: 'Зарядные устройства' }, slug: 'chargers', parent: null, icon: 'plug' },
  { id: 'power-supplies', name: { en: 'Power Supplies', ru: 'Блоки питания' }, slug: 'power-supplies', parent: null, icon: 'zap' },

  // === ELECTRONICS & COMPONENTS ===
  { id: 'electronic-modules', name: { en: 'Electronic Modules', ru: 'Дополнительные модули' }, slug: 'electronic-modules', parent: null, icon: 'cpu' },
  { id: 'chips-ics', name: { en: 'Chips & ICs', ru: 'Микросхемы чипы' }, slug: 'chips-ics', parent: 'electronic-modules', icon: 'cpu' },
  { id: 'sbc', name: { en: 'Single Board Computers', ru: 'Одноплатные компьютеры' }, slug: 'sbc', parent: 'electronic-modules', icon: 'hard-drive' },
  { id: 'sensors', name: { en: 'Sensors', ru: 'Датчики' }, slug: 'sensors', parent: 'electronic-modules', icon: 'activity' },
  { id: 'lidar', name: { en: 'LiDAR & Range Finders', ru: 'Лидары' }, slug: 'lidar', parent: 'sensors', icon: 'crosshair' },
  { id: 'gps', name: { en: 'GPS Modules', ru: 'GPS модули' }, slug: 'gps', parent: 'sensors', icon: 'map-pin' },
  { id: 'networking', name: { en: 'Networking Equipment', ru: 'Сетевое оборудование' }, slug: 'networking', parent: 'electronic-modules', icon: 'wifi' },

  // === PAYLOADS & ACCESSORIES ===
  { id: 'payload-release', name: { en: 'Payload Release Systems', ru: 'Системы сброса груза' }, slug: 'payload-release', parent: null, icon: 'package' },
  { id: 'weapon-mounts', name: { en: 'Weapon Mounts', ru: 'Крепления на оружие' }, slug: 'weapon-mounts', parent: null, icon: 'crosshair' },
  { id: 'lights', name: { en: 'Lights & Strobes', ru: 'Фонари' }, slug: 'lights', parent: null, icon: 'sun' },
  { id: 'speakers', name: { en: 'Speakers & PA', ru: 'Динамики' }, slug: 'speakers', parent: null, icon: 'volume-2' },

  // === ANTI-DRONE & SECURITY ===
  { id: 'anti-drone', name: { en: 'Anti-Drone Systems', ru: 'Противодронные системы' }, slug: 'anti-drone', parent: null, icon: 'shield' },
  { id: 'anti-drone-guns', name: { en: 'Anti-Drone Guns', ru: 'Противодронные ружья' }, slug: 'anti-drone-guns', parent: 'anti-drone', icon: 'target' },
  { id: 'drone-detectors', name: { en: 'Drone Detectors', ru: 'Детекторы дронов' }, slug: 'drone-detectors', parent: 'anti-drone', icon: 'radar' },
  { id: 'spectrum-analyzers', name: { en: 'Spectrum Analyzers', ru: 'Анализаторы спектра' }, slug: 'spectrum-analyzers', parent: 'anti-drone', icon: 'bar-chart' },

  // === CASES, STORAGE & TOOLS ===
  { id: 'cases-bags', name: { en: 'Cases & Bags', ru: 'Сумки, кейсы' }, slug: 'cases-bags', parent: null, icon: 'briefcase' },
  { id: 'memory-cards', name: { en: 'Memory Cards', ru: 'Карты памяти' }, slug: 'memory-cards', parent: null, icon: 'sd-card' },
  { id: 'tools', name: { en: 'Tools & Equipment', ru: 'Инструменты' }, slug: 'tools', parent: null, icon: 'wrench' },
  { id: 'cables-wires', name: { en: 'Cables & Wires', ru: 'Кабели и провода' }, slug: 'cables-wires', parent: null, icon: 'zap' },
  { id: 'connectors', name: { en: 'Connectors', ru: 'Разъемы' }, slug: 'connectors', parent: 'cables-wires', icon: 'plug' },

  // === SOFTWARE & ACCESSORIES ===
  { id: 'software', name: { en: 'Software & Firmware', ru: 'Программное обеспечение' }, slug: 'software', parent: null, icon: 'code' },
  { id: 'accessories', name: { en: 'Accessories', ru: 'Аксессуары' }, slug: 'accessories', parent: null, icon: 'plus' },
  { id: 'spare-parts', name: { en: 'Spare Parts', ru: 'Запчасти' }, slug: 'spare-parts', parent: null, icon: 'settings' },
  { id: 'repair-kits', name: { en: 'Repair Kits', ru: 'Ремкомплекты' }, slug: 'repair-kits', parent: 'spare-parts', icon: 'wrench' },

  // === OTHER ===
  { id: 'robotics', name: { en: 'Robotics', ru: 'Роботы' }, slug: 'robotics', parent: null, icon: 'cpu' },
  { id: 'radios', name: { en: 'Two-Way Radios', ru: 'Радиостанции' }, slug: 'radios', parent: null, icon: 'radio' },
  { id: 'other', name: { en: 'Other', ru: 'Другое' }, slug: 'other', parent: null, icon: 'box' },
];

// Mapping: Russian category name pattern -> standard category slug
const CATEGORY_MAPPING = {
  // Drones
  'Квадрокоптеры': 'drones-consumer',
  'Дроны с камерой': 'drones-consumer',
  'Дроны с тепловизором': 'drones-thermal',
  'FPV дроны': 'drones-fpv',
  'Промышленные дроны': 'drones-industrial',
  'Сельскохозяйственные дроны': 'drones-agricultural',
  'Подводные дроны': 'drones-underwater',
  'Игрушки': 'drones-toys',
  'Военные': 'drones-military',
  'Мультикоптеры': 'drones-professional',
  'Для предприятий': 'drones-enterprise',
  'Обучающие': 'drones-toys',
  'Квадрокоптеры Autuel': 'drones-professional',
  'Дроны РФ': 'drones-military',
  'Производство РФ': 'drones-military',

  // Flight controllers
  'Автопилоты': 'autopilots',
  'Стабилизаторы': 'flight-controllers',

  // Motors & Propulsion
  'Двигатели': 'motors',
  'Пропеллеры, 2 лопасти': 'propellers-2blade',
  'Пропеллеры, 3 лопасти': 'propellers-3blade',
  'Сервоприводы': 'servos',

  // Frames & Gimbals
  'Рамы': 'frames',
  'Шасси': 'landing-gear',
  'Подвесы': 'gimbals',
  'Аксессуары для подвесов': 'gimbal-accessories',

  // Cameras & Video
  'Камеры': 'cameras',
  'Объективы': 'camera-lenses',
  'Мониторы': 'monitors',
  'Тепловизоры': 'thermal-cameras',

  // FPV
  'FPV очки': 'fpv-goggles',
  'Аксессуары для FPV-очков': 'fpv-goggle-accessories',
  'Передатчики': 'vtx',

  // Batteries & Power
  'Электричество': 'power-supplies',
  'Зарядные устройства': 'chargers',

  // Electronics
  'Дополнительные модули': 'electronic-modules',
  'Микросхемы чипы': 'chips-ics',
  'Консоли и приставки': 'sbc',
  'Сетевое оборудование': 'networking',
  'Лидары': 'lidar',
  'Анализаторы спектра': 'spectrum-analyzers',
  'Радиостанции': 'radios',

  // Payloads
  'Системы сброса груза': 'payload-release',
  'Крепления на оружие': 'weapon-mounts',
  'Мультифонари': 'lights',
  'Свет на каждый день': 'lights',

  // Anti-drone
  'Противодронные установки': 'anti-drone',
  'Противодронные ружья': 'anti-drone-guns',
  'Детекторы дронов': 'drone-detectors',

  // Cases & Storage
  'Сумки, кейсы': 'cases-bags',
  'Карты памяти': 'memory-cards',

  // Accessories
  'Аксессуары': 'accessories',
  'Аксессуары и расходники': 'accessories',
  'Аксессуары для дронов': 'accessories',
  'Аксессуары для подводных дронов': 'accessories',
  'Аксессуары для пультов управления': 'controller-accessories',
  'Ремкомплекты Kyocera': 'repair-kits',
  'Аксессуары и Расходники iRay': 'accessories',
  'Роботы-гуманоиды': 'robotics',
  'Промышленные роботы': 'robotics',
  'Футбол': 'other',
  'Другие производители': 'other',
  'Прицелы для ближней охоты': 'accessories',
  'Прицелы для дальней охоты': 'accessories',
};

module.exports = { STANDARD_CATEGORIES, CATEGORY_MAPPING };
