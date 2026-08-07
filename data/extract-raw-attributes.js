/**
 * Extract proper attributes from rawAttributes (WooCommerce)
 * Maps Russian attribute names to standard English keys
 */
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'enriched/products_enriched.json'), 'utf8'));

// Map Russian WooCommerce attribute names to standard keys
const ATTR_NAME_MAP = {
  // Flight performance
  'время работы': 'flight_time',
  'время полета': 'flight_time',
  'максимальная высота полета': 'max_altitude',
  'максимальная высота': 'max_altitude',
  'высота полета': 'max_altitude',
  'радиус действия': 'flight_range',
  'дальность полета': 'flight_range',
  'максимальная дальность': 'flight_range',
  'максимальная горизонтальная скорость': 'max_speed',
  'максимальная скорость': 'max_speed',
  'скорость полета': 'max_speed',
  'максимальная вертикальная скорость': 'max_vertical_speed',
  'максимальное время полета': 'flight_time',
  'максимальный вес полезной нагрузки': 'payload_capacity',
  'грузоподъемность': 'payload_capacity',
  'вес полезной нагрузки': 'payload_capacity',
  'максимальный взлетный вес': 'takeoff_weight',
  'взлетный вес': 'takeoff_weight',
  'вес квадрокоптера': 'weight',
  'вес': 'weight',
  'размеры': 'dimensions',
  'габариты': 'dimensions',
  'размер': 'size',

  // Battery
  'тип аккумулятора': 'battery_type',
  'емкость аккумулятора': 'battery_capacity',
  'напряжение аккумулятора': 'voltage',
  'напряжение': 'voltage',
  'количество аккумуляторов в комплекте': 'battery_count',
  'аккумулятор': 'battery_type',
  'время зарядки': 'charging_time',

  // Camera
  'наличие камеры в комплекте': 'has_camera',
  'камера в комплекте': 'has_camera',
  'съемка видео высокой четкости': 'video_recording',
  'вид от первого лица (fpv)': 'has_fpv',
  'fpv': 'has_fpv',
  'максимальный угол обзора (градус)': 'fov',
  'угол обзора': 'fov',
  'режим съемки': 'video_resolution',
  'разрешение камеры': 'resolution',
  'разрешение видео': 'resolution',
  'разрешение': 'resolution',
  'поддержка карт памяти': 'memory_card_support',
  'тип карты памяти': 'memory_card_type',
  'тепловизионная съемка': 'has_thermal',
  'тепловизор': 'has_thermal',

  // Motors/ESC
  'тип моторов': 'motor_type',
  'моторы': 'motor_type',
  'количество моторов': 'motor_count',
  'kv моторов': 'kv_rating',
  'kv': 'kv_rating',
  'размер моторов': 'motor_size',
  'размер мотора': 'motor_size',
  'диаметр вала': 'shaft_diameter',
  'ток esc': 'current',
  'esc': 'esc_spec',
  'регулятор скорости': 'esc_spec',

  // Propellers
  'размер пропеллеров': 'propeller_size',
  'количество лопастей': 'blade_count',
  'пропеллеры': 'propeller_spec',

  // Radio/Control
  'пульт ду в комплекте': 'has_controller',
  'пульт управления в комплекте': 'has_controller',
  'экран пду': 'has_controller_screen',
  'управление со смартфона': 'phone_control',
  'поддержка смартфона/планшета': 'phone_support',
  'крепление мобильного устройства на пду': 'phone_mount',
  'частота': 'frequency',
  'частотный диапазон': 'frequency_range',
  'радиочастота': 'frequency',
  'каналы': 'channels',
  'количество каналов': 'channels',
  'протокол': 'protocol',
  'дальность управления': 'control_range',
  'мощность передатчика': 'power',
  'выходная мощность': 'power',

  // Electronics
  'полетный контроллер': 'flight_controller',
  'процессор': 'processor',
  'gps': 'has_gps',
  'gps модуль': 'has_gps',
  'глонасс': 'has_glonass',
  'датчики': 'sensors',
  'барометр': 'has_barometer',
  'компас': 'has_compass',
  'оптический поток': 'has_optical_flow',
  'система обхода препятствий': 'obstacle_avoidance',
  'обнаружение препятствий': 'obstacle_avoidance',

  // Physical
  'материал корпуса': 'material',
  'материал': 'material',
  'цвет': 'color',
  'страна производства': 'country_of_origin',
  'производитель': 'manufacturer',
  'бренд': 'brand',
  'степень защиты': 'ip_rating',
  'ip рейтинг': 'ip_rating',
  'водонепроницаемость': 'waterproof',
  'рабочая температура': 'operating_temp',
  'диапазон рабочих температур': 'operating_temp',
  'диапазон температур зарядки': 'charging_temp',
  'вес с аккумулятором': 'weight_with_battery',

  // FPV
  'видеопередатчик': 'vtx_spec',
  'мощность видеопередатчика': 'vtx_power',
  'частота видеопередачи': 'vtx_frequency',
  'видео приемник': 'vrx_spec',
  'очки fpv': 'fpv_goggles',
  'антенна': 'antenna_spec',
  'тип антенны': 'antenna_type',
  'коэффициент усиления антенны': 'antenna_gain',

  // Power
  'ток': 'current',
  'максимальный ток': 'max_current',
  'выходное напряжение': 'output_voltage',
  'входное напряжение': 'input_voltage',
  'разъем': 'connector',
  'тип разъема': 'connector',
  'протокол зарядки': 'charging_protocol',
  'количество банок': 'cell_count',
  's аккумулятора': 'cell_count',
  'c рейтинг': 'discharge_rate',
  'токоотдача': 'discharge_rate',

  // Camera/Lens
  'тип матрицы': 'sensor_type',
  'размер матрицы': 'sensor_size',
  'объектив': 'lens_spec',
  'фокусное расстояние': 'focal_length',
  'диафрагма': 'aperture',
  'зум': 'zoom',
  'стабилизация': 'stabilization',
  'подвес': 'gimbal_spec',
  'ось подвеса': 'gimbal_axis',

  // General
  'варианты поставки': 'package_contents',
  'комплектация': 'package_contents',
  'в комплекте': 'package_contents',
  'дополнительные функции полета': 'flight_features',
  'автовзлет и автопосадка': 'auto_takeoff_landing',
  'удержание точки высоты': 'altitude_hold',
  'полет по заданной траектории': 'waypoint_flight',
  'возврат домой': 'return_to_home',
  'совместимые операционные системы': 'os_compatibility',
  'поддержка': 'compatibility',
  'совместимость': 'compatibility',
  'применение': 'application',
  'тип': 'type',
  'состояние': 'condition',
  'гарантия': 'warranty',
  'модель': 'model',
  'артикул': 'sku',
};

// Also map English attribute names
const ATTR_NAME_MAP_EN = {
  'voltage': 'voltage',
  'current': 'current',
  'power': 'power',
  'weight': 'weight',
  'frequency': 'frequency',
  'channels': 'channels',
  'resolution': 'resolution',
  'material': 'material',
  'color': 'color',
  'dimensions': 'dimensions',
  'size': 'size',
  'connector': 'connector',
  'protocol': 'protocol',
  'battery capacity': 'battery_capacity',
  'battery type': 'battery_type',
  'flight time': 'flight_time',
  'max speed': 'max_speed',
  'range': 'flight_range',
  'kv': 'kv_rating',
  'ip rating': 'ip_rating',
};

function normalizeAttrName(name) {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  // Try direct map
  if (ATTR_NAME_MAP[lower]) return ATTR_NAME_MAP[lower];
  if (ATTR_NAME_MAP_EN[lower]) return ATTR_NAME_MAP_EN[lower];
  // Try partial match
  for (const [key, val] of Object.entries(ATTR_NAME_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }
  // Return sanitized key
  return lower.replace(/[^a-z0-9_а-я]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

function extractAttrValue(terms) {
  if (!terms || !Array.isArray(terms)) return '';
  return terms.map(t => t.name || t).join(', ');
}

console.log('Processing', products.length, 'products...');

let totalRawAttrs = 0;
let totalExtracted = 0;
let productsWithRawAttrs = 0;

products.forEach(p => {
  const newAttrs = {};

  // First, extract from rawAttributes (WooCommerce)
  if (p.rawAttributes && Array.isArray(p.rawAttributes)) {
    productsWithRawAttrs++;
    p.rawAttributes.forEach(raw => {
      const key = normalizeAttrName(raw.name);
      const value = extractAttrValue(raw.terms);
      if (key && value) {
        newAttrs[key] = value;
        totalRawAttrs++;
      }
    });
  }

  // Then merge with existing extracted attributes (from description)
  // But only if not already present or if existing is better
  if (p.attributes) {
    Object.entries(p.attributes).forEach(([key, value]) => {
      if (value && !newAttrs[key]) {
        newAttrs[key] = value;
      }
    });
  }

  p.attributes = newAttrs;
  totalExtracted += Object.keys(newAttrs).filter(k => newAttrs[k]).length;
});

console.log('Products with rawAttributes:', productsWithRawAttrs);
console.log('Total raw attributes extracted:', totalRawAttrs);
console.log('Total final attributes:', totalExtracted);
console.log('Average per product:', (totalExtracted / products.length).toFixed(1));

// Verify Matrice 300
const m300 = products.find(p => p.id === '4712');
console.log('\nMatrice 300 RTK attributes after processing:');
Object.entries(m300.attributes).forEach(([k, v]) => {
  if (v) console.log('  ' + k + ': ' + String(v).substring(0, 80));
});

fs.writeFileSync(path.join(__dirname, 'enriched/products_enriched.json'), JSON.stringify(products), 'utf8');
console.log('\nSaved.');

// Stats
let withAttrs = 0;
products.forEach(p => {
  if (Object.keys(p.attributes || {}).filter(k => p.attributes[k]).length > 0) withAttrs++;
});
console.log('Products with attributes:', withAttrs, '/', products.length, '(' + (withAttrs/products.length*100).toFixed(1) + '%)');
