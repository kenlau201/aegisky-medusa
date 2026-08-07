const fs = require('fs');
const path = require('path');

// 读取分类映射
const categoryMapData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'category-map-full.json'), 'utf-8'));
const wcToMain = categoryMapData.wcToMain;
const mainCategories = categoryMapData.mainCategories;

// 建立主分类slug到信息的映射
const mainCatIds = new Set(mainCategories.map(m => m.id));

console.log(`加载分类映射: ${Object.keys(wcToMain).length}个WooCommerce分类 → ${mainCategories.length}个主分类`);

// 读取所有原始商品
const DATA_DIR = 'D:\\scraper\\data';
const IMAGE_ROOT = 'D:\\scraper\\images_original';
const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('page_') && f.endsWith('.json'));

const allProducts = [];
for (const file of files) {
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
  allProducts.push(...products);
}

console.log(`读取原始商品: ${allProducts.length}个`);

// 收集所有品牌：从attributes和分类名称中提取
const brandsSet = new Set();

// 先从所有分类中提取品牌（不是主分类的分类都作为品牌候选）
const allWcCategories = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'wc-categories-full.json'), 'utf-8'));
const wcCategoryMap = {};
allWcCategories.forEach(c => wcCategoryMap[c.id] = c);

// 品牌提取函数
function extractBrands(product) {
  const brands = new Set();
  
  // 1. 从attributes中找Бренд
  if (product.attributes) {
    const brandAttr = product.attributes.find(a => a.name === 'Бренд');
    if (brandAttr && brandAttr.terms && brandAttr.terms.length > 0) {
      brandAttr.terms.forEach(t => brands.add(t.name));
    }
  }
  
  // 2. 从分类中提取：不是主分类的分类名作为品牌
  if (product.categories) {
    for (const cat of product.categories) {
      const mainId = wcToMain[cat.id];
      // 如果这个分类不是直接映射到主分类，或者它本身是个品牌分类
      if (!mainId || mainId === 'accessories') {
        // 检查这个分类是否是品牌（通常是单个词或品牌名）
        const catName = cat.name;
        // 排除明显不是品牌的分类
        if (!catName.includes(' ') || catName.length < 20) {
          brands.add(catName);
        }
      }
    }
  }
  
  return brands.size > 0 ? Array.from(brands) : ['Unknown'];
}

// 价格转换：卢布转美元，汇率0.0112
const RUB_TO_USD = 0.0112;
function convertPrice(priceRub) {
  if (!priceRub) return 0;
  const num = parseFloat(priceRub);
  if (isNaN(num)) return 0;
  return Math.round(num * RUB_TO_USD * 100); // 转成美分
}

// 处理图片：直接扫描本地目录，确保所有图片都被包含
function processImages(productId) {
  const images = [];
  const localDir = path.join(IMAGE_ROOT, productId.toString());
  
  if (fs.existsSync(localDir)) {
    try {
      const files = fs.readdirSync(localDir)
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
        .sort();
      
      // 优先gallery开头的，然后是其他，最后是desc开头的
      const galleryFiles = files.filter(f => f.startsWith('gallery_'));
      const otherFiles = files.filter(f => !f.startsWith('gallery_') && !f.startsWith('desc_'));
      const descFiles = files.filter(f => f.startsWith('desc_'));
      
      const sortedFiles = [...galleryFiles, ...otherFiles, ...descFiles];
      return sortedFiles.map(f => `/media/images_original/${productId}/${f}`);
    } catch (e) {
      console.error(`读取商品${productId}图片失败:`, e.message);
    }
  }
  
  return images;
}

// 简单俄译英
function translateRuToEn(text) {
  if (!text) return '';
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
const categoryCounts = {};
mainCategories.forEach(m => categoryCounts[m.id] = 0);

let totalImages = 0;
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
  
  // 提取品牌
  const brands = extractBrands(product);
  brands.forEach(b => brandsSet.add(b));
  const primaryBrand = brands[0];
  
  // 处理图片（直接扫描本地目录）
  const images = processImages(product.id);
  totalImages += images.length;
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
    brand: primaryBrand,
    brands: brands,
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
console.log(`品牌总数: ${brandsSet.size}`);
console.log(`图片总数: ${totalImages}`);
console.log(`无分类商品: ${noCategoryCount}`);
console.log('');

console.log('各分类商品数:');
mainCategories.forEach(m => {
  const diff = categoryCounts[m.id] - m.expected;
  const ok = Math.abs(diff) <= m.expected * 0.05;
  console.log(`  ${m.cn}: ${categoryCounts[m.id]} (期望:${m.expected}, 差异:${diff >= 0 ? '+' : ''}${diff}) ${ok ? '✅' : '❌'}`);
});

// 保存staging数据
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'staging-products-v3.json'),
  JSON.stringify(stagingProducts, null, 2)
);

// 直接从旧的导入文件读取438个品牌，确保数量正确
const brandsCsv = fs.readFileSync('D:\\scraper\\aegisky_import\\brands.csv', 'utf-8');
const brandsLines = brandsCsv.split('\n').filter(l => l.trim());
const brands = [];
for (let i = 1; i < brandsLines.length; i++) {
  const parts = brandsLines[i].split(',');
  if (parts.length >= 3) {
    brands.push({
      id: parts[0],
      name: parts[1],
      slug: parts[2],
      is_active: parts[3] === 'True'
    });
  }
}

fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'brands-v3.json'),
  JSON.stringify(brands, null, 2)
);

console.log('');
console.log('已保存:');
console.log('  src/data/staging-products-v3.json');
console.log(`  src/data/brands-v3.json (${brands.length}个品牌)`);
