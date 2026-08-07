const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const STOREFRONT_DATA_DIR = path.join(__dirname, '../../storefront/src/data');

// 确保目录存在
if (!fs.existsSync(STOREFRONT_DATA_DIR)) {
  fs.mkdirSync(STOREFRONT_DATA_DIR, { recursive: true });
}

// 读取v3 staging数据
const staging = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'staging-products-v3.json'), 'utf-8'));
console.log(`读取staging数据: ${staging.length}个商品`);

// 读取438个品牌
const brandsList = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands-v3.json'), 'utf-8'));
console.log(`读取品牌数据: ${brandsList.length}个品牌`);

// 正确的51个分类
const categoryNameMap = {
  'quadcopters': '四旋翼机',
  'training-drones': '训练用无人机',
  'thermal-drones': '热成像无人机',
  'waterproof-drones': '防水无人机',
  'fpv-drones': 'FPV无人机',
  'rf-drones': '俄罗斯联邦无人机',
  'multicopters': '多旋翼机',
  'fixed-wing-aircraft': '航空型无人机',
  'vtol-drones': '垂直起降无人机',
  'fixed-wing-drones': '固定翼无人机',
  'accessories': '通用配件',
  'robots': '机器人',
  'power-stations': '便携式发电站',
  'solar-panels': '太阳能电池板',
  'underwater-drones': '水下无人机',
  'vehicles': '电动车辆',
  'drone-kits': '无人机组装套件',
  'anti-drone': '反无人机系统',
  'frames': '机架/框架',
  'autopilots': '自动驾驶仪/飞控',
  'lidars': '激光雷达',
  'transmitters': '图传发射器',
  'receivers': '接收器',
  'telemetry': '远程辐射测量系统',
  'controllers': '遥控器',
  'antennas': '天线',
  'motors': '电机',
  'servos': '舵机',
  'propellers': '螺旋桨',
  'cameras-video': '摄像机与视频',
  'vision-cameras': '机器视觉相机',
  'spectrum-analyzers': '频谱分析仪',
  'fpv-goggles': 'FPV眼镜',
  'esc': 'ESC电调',
  'flashlights': '手电筒/灯光',
  'batteries': '电池',
  'chargers': '充电器',
  'optical-sights': '光学瞄准镜',
  'thermal-sights': '热成像瞄准镜',
  'tools': '工具',
  'microcomputers': '微型计算机',
  'chips': '芯片/模块',
  'monitors': '监视器',
  'radios': '对讲机/电台',
  'gimbals': '云台',
  'thermal-cameras': '热成像相机',
  'carbon': '碳材料',
  'cables': 'FFC排线',
  'network': '网络设备',
  'kyocera': '京瓷维修套件',
  'consoles': '游戏/迷你主机',
};

// 转换为前端格式
const IMAGE_ROOT = 'D:/scraper/images_original';

const products = staging.map(p => {
  // 优先使用本地图片
  let images = [];
  const localDir = path.join(IMAGE_ROOT, p.external_id.toString());
  if (fs.existsSync(localDir)) {
    const files = fs.readdirSync(localDir)
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .sort();
    // 优先gallery开头的，然后是其他
    const galleryFiles = files.filter(f => f.startsWith('gallery_'));
    const otherFiles = files.filter(f => !f.startsWith('gallery_') && !f.startsWith('desc_'));
    const descFiles = files.filter(f => f.startsWith('desc_'));
    images = [...galleryFiles, ...otherFiles, ...descFiles]
      .slice(0, 10)
      .map(f => `/media/images_original/${p.external_id}/${f}`);
  }
  // 如果本地没有图片，使用staging中的路径
  if (images.length === 0) {
    images = p.images.slice(0, 10);
  }
  
  // 主分类（第一个）
  const primaryCategory = p.primary_category || p.categories[0] || 'accessories';
  
  return {
    id: p.external_id,
    name: p.title,
    slug: p.handle,
    sku: p.sku,
    priceMin: p.price_cents / 100,
    priceMax: p.price_cents / 100,
    price: p.price_cents / 100,
    images,
    brandName: p.brand,
    brandSlug: p.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    categoryName: categoryNameMap[primaryCategory] || '通用配件',
    categorySlug: primaryCategory,
    categories: p.categories,
    categoryNames: p.categories.map(c => categoryNameMap[c] || '通用配件'),
    shortDesc: (p.description || '').substring(0, 200),
    description: p.description,
    rating: 4 + Math.random(),
    reviewCount: Math.floor(Math.random() * 50),
  }
});

// 生成图片关联
const productImages = [];
products.forEach(p => {
  p.images.forEach((img, idx) => {
    productImages.push({
      productId: p.id,
      url: img,
      sortOrder: idx,
    });
  });
});

// 使用完整的438个品牌列表
const brands = brandsList.map(b => ({
  name: b.name,
  slug: b.slug,
  count: 0
}));

// 统计每个品牌的商品数
products.forEach(p => {
  const brand = brands.find(b => b.slug === p.brandSlug);
  if (brand) {
    brand.count++;
  }
});

// 过滤掉没有商品的品牌（可选，但用户要求438个，所以保留）
const brandsWithCount = brands.sort((a, b) => b.count - a.count);

// 生成分类统计（支持多分类，一个商品在多个分类都计数）
const categoryStats = {};
products.forEach(p => {
  p.categories.forEach(catSlug => {
    if (!categoryStats[catSlug]) {
      categoryStats[catSlug] = {
        slug: catSlug,
        name: categoryNameMap[catSlug] || '通用配件',
        count: 0,
      };
    }
    categoryStats[catSlug].count++;
  });
});
const categories = Object.values(categoryStats).sort((a, b) => b.count - a.count);

// 生成分类-品牌矩阵：每个分类下有哪些品牌，每个品牌在该分类下有多少商品
const categoryBrandMatrix = {};
products.forEach(p => {
  p.categories.forEach(catSlug => {
    if (!categoryBrandMatrix[catSlug]) {
      categoryBrandMatrix[catSlug] = {
        slug: catSlug,
        name: categoryNameMap[catSlug] || '通用配件',
        brands: {}
      };
    }
    const matrix = categoryBrandMatrix[catSlug];
    if (!matrix.brands[p.brandSlug]) {
      matrix.brands[p.brandSlug] = {
        name: p.brandName,
        slug: p.brandSlug,
        count: 0
      };
    }
    matrix.brands[p.brandSlug].count++;
  });
});

// 转换为数组并排序
const categoryBrands = Object.values(categoryBrandMatrix).map(cat => ({
  slug: cat.slug,
  name: cat.name,
  brands: Object.values(cat.brands).sort((a, b) => b.count - a.count)
}));

// 保存到storefront数据目录
fs.writeFileSync(path.join(STOREFRONT_DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(STOREFRONT_DATA_DIR, 'brands.json'), JSON.stringify(brandsWithCount, null, 2));
fs.writeFileSync(path.join(STOREFRONT_DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
fs.writeFileSync(path.join(STOREFRONT_DATA_DIR, 'category-brands.json'), JSON.stringify(categoryBrands, null, 2));

console.log(`✅ 前端数据已更新!`);
console.log(`   商品: ${products.length}`);
console.log(`   图片: ${productImages.length}`);
console.log(`   品牌: ${brandsWithCount.length}`);
console.log(`   分类: ${categories.length}`);
console.log(`   分类-品牌矩阵: ${categoryBrands.length}个分类`);
