const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const EXPORT_DIR = path.join(__dirname, '../../../data/export');

// 读取最新的staging数据
const staging = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'staging-products.json'), 'utf8'));
console.log(`读取staging数据: ${staging.length}个商品`);

// 52分类映射
const categoryNameMap = {
  'quadcopters': '四旋翼机',
  'training-drones': '训练用无人机',
  'thermal-imaging-drones': '热成像无人机',
  'waterproof-drones': '防水无人机',
  'fpv-drones': 'FPV无人机',
  'russian-drones': '俄罗斯联邦无人机',
  'multirotors': '多旋翼机',
  'aerial-drones': '航空型无人机',
  'vtol-drones': '垂直起降无人机',
  'fixed-wing-drones': '固定翼无人机',
  'accessories': '配件',
  'robots': '机器人',
  'portable-power-stations': '便携式发电站',
  'solar-panels': '太阳能电池板',
  'underwater-drones': '水下无人机',
  'vehicles': '车辆',
  'drone-kits': '无人机组装套件',
  'counter-drones': '反无人机',
  'frames': '框架',
  'autopilots': '自动驾驶仪',
  'lidar': '激光雷达',
  'launch-pads': '发射台',
  'receivers': '接收器',
  'remote-radiometry': '远程辐射测量系统',
  'control-panels': '控制面板',
  'antennas': '天线',
  'motors': '电机',
  'servos': '舵机',
  'blades-propellers': '螺旋桨',
  'cameras-video': '摄像机',
  'machine-vision-cameras': '机器视觉摄像机',
  'spectrum-analyzers': '频谱分析仪',
  'fpv-integration': 'FPV积分',
  'esc-controllers': 'ESC电调',
  'lanterns': '灯光',
  'batteries': '电池',
  'charging-equipment': '充电设备',
  'rifle-scopes': '步枪瞄准镜',
  'thermal-scopes': '热成像瞄准镜',
  'tools': '工具',
  'microcomputers': '微型计算机',
  'chips': '芯片',
  'monitors': '监视器',
  'radio-stations': '广播电台',
  'gimbals': '云台',
  'thermal-cameras': '热成像相机',
  'carbon-materials': '碳材料',
  'rings': '环形',
  'network-equipment': '网络设备',
  'kyocera-repair-kits': '京瓷维修套件',
  'hosts': '主机',
  'other': '其他',
};

// 转换为前端格式
const IMAGE_ROOT = 'D:/scraper/images_original';

const products = staging.map(p => {
  // 优先使用本地图片
  let images = [];
  const localDir = path.join(IMAGE_ROOT, p.external_id);
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
      .map(f => `/api/media/images_original/${p.external_id}/${f}`);
  }
  // 如果本地没有图片，使用原始URL
  if (images.length === 0) {
    images = p.images.slice(0, 10);
  }
  
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
    categoryName: categoryNameMap[p.category_slug] || '其他',
    categorySlug: p.category_slug,
    shortDesc: p.description?.substring(0, 200),
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

// 生成品牌列表
const brandStats = {};
products.forEach(p => {
  if (!brandStats[p.brandName]) {
    brandStats[p.brandName] = { name: p.brandName, slug: p.brandSlug, count: 0 };
  }
  brandStats[p.brandName].count++;
});
const brands = Object.values(brandStats).sort((a, b) => b.count - a.count);

// 生成分类统计
const categoryStats = {};
products.forEach(p => {
  if (!categoryStats[p.categorySlug]) {
    categoryStats[p.categorySlug] = {
      slug: p.categorySlug,
      name: p.categoryName,
      count: 0,
    };
  }
  categoryStats[p.categorySlug].count++;
});
const categories = Object.values(categoryStats).sort((a, b) => b.count - a.count);

// 生成分类-品牌矩阵：每个分类下有哪些品牌，每个品牌在该分类下有多少商品
const categoryBrandMatrix = {};
products.forEach(p => {
  if (!categoryBrandMatrix[p.categorySlug]) {
    categoryBrandMatrix[p.categorySlug] = {
      slug: p.categorySlug,
      name: p.categoryName,
      brands: {}
    };
  }
  const matrix = categoryBrandMatrix[p.categorySlug];
  if (!matrix.brands[p.brandSlug]) {
    matrix.brands[p.brandSlug] = {
      name: p.brandName,
      slug: p.brandSlug,
      count: 0
    };
  }
  matrix.brands[p.brandSlug].count++;
});

// 转换为数组并排序
const categoryBrands = Object.values(categoryBrandMatrix).map(cat => ({
  slug: cat.slug,
  name: cat.name,
  brands: Object.values(cat.brands).sort((a, b) => b.count - a.count)
}));

// 保存
fs.writeFileSync(path.join(EXPORT_DIR, 'products_with_standard_category.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(EXPORT_DIR, 'product_images.json'), JSON.stringify(productImages, null, 2));
fs.writeFileSync(path.join(EXPORT_DIR, 'brands.json'), JSON.stringify(brands, null, 2));
fs.writeFileSync(path.join(EXPORT_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
fs.writeFileSync(path.join(EXPORT_DIR, 'category_brands.json'), JSON.stringify(categoryBrands, null, 2));

console.log(`✅ 前端数据已更新!`);
console.log(`   商品: ${products.length}`);
console.log(`   图片: ${productImages.length}`);
console.log(`   品牌: ${brands.length}`);
console.log(`   分类: ${categories.length}`);
console.log(`   分类-品牌矩阵: ${categoryBrands.length}个分类`);
console.log(``);
console.log(`分类分布:`);
categories.forEach(c => console.log(`  ${c.name}: ${c.count}个`));
