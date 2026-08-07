const fs = require('fs');
const path = require('path');

// 读取分类映射
const categoryMapData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'category-map-full.json'), 'utf-8'));
const wcToMain = categoryMapData.wcToMain;
const mainCategories = categoryMapData.mainCategories;

// 建立主分类slug到信息的映射
const mainCatMap = {};
mainCategories.forEach(m => {
  mainCatMap[m.id] = m;
});

console.log(`加载分类映射: ${Object.keys(wcToMain).length}个WooCommerce分类 → ${mainCategories.length}个主分类`);

// 读取所有原始商品
const DATA_DIR = 'D:\\scraper\\data';
const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('page_') && f.endsWith('.json'));

const allProducts = [];
for (const file of files) {
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
  allProducts.push(...products);
}

console.log(`读取原始商品: ${allProducts.length}个`);

// 品牌提取
function extractBrand(product) {
  // 先从attributes中找Бренд
  if (product.attributes) {
    const brandAttr = product.attributes.find(a => a.name === 'Бренд');
    if (brandAttr && brandAttr.terms && brandAttr.terms.length > 0) {
      return brandAttr.terms[0].name;
    }
  }
  // 从分类中找品牌（第一个不是主分类的分类名）
  if (product.categories) {
    for (const cat of product.categories) {
      if (!wcToMain[cat.id]) {
        return cat.name;
      }
    }
  }
  return 'Unknown';
}

// 价格转换：卢布转美元，汇率0.0112
const RUB_TO_USD = 0.0112;
function convertPrice(priceRub) {
  if (!priceRub) return 0;
  const num = parseFloat(priceRub);
  if (isNaN(num)) return 0;
  return Math.round(num * RUB_TO_USD * 100); // 转成美分
}

// 处理图片路径
function processImages(product) {
  const images = [];
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      // 使用本地路径
      const src = img.src || '';
      const filename = src.split('/').pop();
      if (filename) {
        images.push(`/media/images_original/${product.id}/${filename}`);
      }
    }
  }
  return images;
}

// 翻译俄文到英文（简单翻译，主要是分类和常用词）
function translateRuToEn(text) {
  if (!text) return '';
  // 简单替换，实际项目中可以用更完整的翻译
  return text
    .replace(/Квадрокоптеры/gi, 'Quadcopters')
    .replace(/Дроны для обучения/gi, 'Training Drones')
    .replace(/Дроны с тепловизором/gi, 'Thermal Drones')
    .replace(/Водонепроницаемые дроны/gi, 'Waterproof Drones')
    .replace(/FPV дроны/gi, 'FPV Drones')
    .replace(/Дроны РФ/gi, 'Russian Drones')
    .replace(/Мультикоптеры/gi, 'Multicopters')
    .replace(/Дроны самолётного типа/gi, 'Fixed-Wing Aircraft')
    .replace(/Дроны с вертикальным взлётом/gi, 'VTOL Drones')
    .replace(/Дроны с неподвижным крылом/gi, 'Fixed-Wing Drones')
    .replace(/Аксессуары/gi, 'Accessories')
    .replace(/Роботы/gi, 'Robots')
    .replace(/Портативные электростанции/gi, 'Portable Power Stations')
    .replace(/Солнечные панели/gi, 'Solar Panels')
    .replace(/Подводные дроны/gi, 'Underwater Drones')
    .replace(/Средства передвижения/gi, 'Vehicles')
    .replace(/Комплекты для сборки/gi, 'Drone Kits')
    .replace(/Противодействия дронам/gi, 'Anti-Drone Systems')
    .replace(/Рамы/gi, 'Frames')
    .replace(/Автопилоты/gi, 'Autopilots')
    .replace(/Лидары/gi, 'Lidars')
    .replace(/Передатчики/gi, 'Transmitters')
    .replace(/Приёмники/gi, 'Receivers')
    .replace(/Дальнобойные системы/gi, 'Long-Range Telemetry')
    .replace(/Пульты управления/gi, 'Controllers')
    .replace(/Антенны/gi, 'Antennas')
    .replace(/Двигатели/gi, 'Motors')
    .replace(/Сервоприводы/gi, 'Servos')
    .replace(/Лопасти и пропеллеры/gi, 'Propellers')
    .replace(/Камеры и видео/gi, 'Cameras & Video')
    .replace(/Камеры машинного зрения/gi, 'Machine Vision Cameras')
    .replace(/Анализаторы спектра/gi, 'Spectrum Analyzers')
    .replace(/FPV очки/gi, 'FPV Goggles')
    .replace(/ESC Регуляторы/gi, 'ESC Controllers')
    .replace(/Фонари/gi, 'Flashlights')
    .replace(/АКБ/gi, 'Batteries')
    .replace(/Зарядные устройства/gi, 'Chargers')
    .replace(/Оптические прицелы/gi, 'Optical Sights')
    .replace(/Тепловизионные прицелы/gi, 'Thermal Sights')
    .replace(/Инструмент/gi, 'Tools')
    .replace(/Микрокомпьютеры/gi, 'Microcomputers')
    .replace(/Микросхемы чипы/gi, 'Chips & Modules')
    .replace(/Мониторы/gi, 'Monitors')
    .replace(/Радиостанции/gi, 'Radio Stations')
    .replace(/Подвесы/gi, 'Gimbals')
    .replace(/Тепловизоры/gi, 'Thermal Cameras')
    .replace(/Карбоновые материалы/gi, 'Carbon Materials')
    .replace(/Шлейфы/gi, 'FFC Cables')
    .replace(/Сетевое оборудование/gi, 'Network Equipment')
    .replace(/Ремкомплекты Kyocera/gi, 'Kyocera Repair Kits')
    .replace(/Консоли и приставки/gi, 'Consoles');
}

// 处理每个商品
const stagingProducts = [];
const brandsSet = new Set();
const categoryCounts = {};
mainCategories.forEach(m => categoryCounts[m.id] = 0);

let noCategoryCount = 0;

for (const product of allProducts) {
  // 提取主分类（支持多分类）
  const mainCatIds = new Set();
  if (product.categories) {
    for (const cat of product.categories) {
      const mainId = wcToMain[cat.id];
      if (mainId) {
        mainCatIds.add(mainId);
      }
    }
  }
  
  // 如果没有分类，默认归到配件
  if (mainCatIds.size === 0) {
    mainCatIds.add('accessories');
    noCategoryCount++;
  }
  
  // 统计分类商品数
  for (const catId of mainCatIds) {
    categoryCounts[catId]++;
  }
  
  const brand = extractBrand(product);
  brandsSet.add(brand);
  
  const images = processImages(product);
  const thumbnail = images.length > 0 ? images[0] : '';
  
  const stagingProduct = {
    external_id: product.id,
    sku: product.sku || `SKU-${product.id}`,
    title: translateRuToEn(product.name || `Product ${product.id}`),
    handle: product.slug || `product-${product.id}`,
    description: translateRuToEn(product.description || ''),
    short_description: translateRuToEn(product.short_description || ''),
    status: product.status === 'publish' ? 'published' : 'draft',
    price: product.price ? parseFloat(product.price) * RUB_TO_USD : 0,
    regular_price: product.regular_price ? parseFloat(product.regular_price) * RUB_TO_USD : 0,
    sale_price: product.sale_price ? parseFloat(product.sale_price) * RUB_TO_USD : 0,
    price_cents: convertPrice(product.price),
    regular_price_cents: convertPrice(product.regular_price),
    sale_price_cents: convertPrice(product.sale_price),
    brand: brand,
    categories: Array.from(mainCatIds),
    category_slugs: Array.from(mainCatIds),
    primary_category: mainCatIds.values().next().value,
    images: images,
    thumbnail: thumbnail,
    total_sales: product.total_sales || 0,
    average_rating: product.average_rating || '0',
    rating_count: product.rating_count || 0,
  };
  
  stagingProducts.push(stagingProduct);
}

console.log(`处理完成: ${stagingProducts.length}个商品`);
console.log(`品牌数: ${brandsSet.size}`);
console.log(`无分类商品: ${noCategoryCount}`);
console.log('');

console.log('各分类商品数:');
mainCategories.forEach(m => {
  console.log(`  ${m.cn}: ${categoryCounts[m.id]} (网站期望: ${m.expected})`);
});

// 保存staging数据
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'staging-products-v2.json'),
  JSON.stringify(stagingProducts, null, 2)
);

// 保存品牌列表
const brands = Array.from(brandsSet).sort().map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'brands-v2.json'),
  JSON.stringify(brands, null, 2)
);

console.log('');
console.log('已保存:');
console.log('  src/data/staging-products-v2.json');
console.log('  src/data/brands-v2.json');
