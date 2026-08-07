/**
 * Aegisky Medusa - 全量数据整合脚本
 * 从D:\scraper原始数据整合为统一结构化数据
 * 确保分类、品牌、商品、属性、图片互联互通
 */

const fs = require('fs');
const path = require('path');

// 路径配置
const RAW_DATA_DIR = 'D:\\scraper\\data';
const IMAGES_DIR = 'D:\\scraper\\images_original';
const OUTPUT_DIR = path.join(__dirname, 'export');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('========================================');
console.log('Aegisky Medusa - 全量数据整合');
console.log('========================================\n');

// 1. 读取所有分页商品数据
console.log('[1/6] 读取原始商品数据...');
const productFiles = fs.readdirSync(RAW_DATA_DIR)
  .filter(f => f.startsWith('page_') && f.endsWith('.json'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/page_(\d+)\.json/)[1]);
    const numB = parseInt(b.match(/page_(\d+)\.json/)[1]);
    return numA - numB;
  });

const rawProducts = [];
productFiles.forEach(f => {
  try {
    const products = JSON.parse(fs.readFileSync(path.join(RAW_DATA_DIR, f), 'utf8'));
    if (Array.isArray(products)) {
      rawProducts.push(...products);
    }
  } catch (e) {
    console.error(`  读取文件 ${f} 失败:`, e.message);
  }
});

console.log(`  共读取 ${rawProducts.length} 个商品`);

// 2. 提取所有分类
console.log('\n[2/6] 提取分类数据...');
const categoriesMap = new Map();
rawProducts.forEach(p => {
  if (p.categories && Array.isArray(p.categories)) {
    p.categories.forEach(cat => {
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          productCount: 0
        });
      }
      categoriesMap.get(cat.id).productCount++;
    });
  }
});

const categories = Array.from(categoriesMap.values()).sort((a, b) => b.productCount - a.productCount);
console.log(`  共 ${categories.length} 个分类`);
console.log('  TOP 10分类:');
categories.slice(0, 10).forEach(c => {
  console.log(`    - ${c.name}: ${c.productCount}个商品`);
});

// 3. 提取所有品牌
console.log('\n[3/6] 提取品牌数据...');
const brandsMap = new Map();
rawProducts.forEach(p => {
  if (p.brands && Array.isArray(p.brands)) {
    p.brands.forEach(brand => {
      if (!brandsMap.has(brand.id)) {
        brandsMap.set(brand.id, {
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          productCount: 0
        });
      }
      brandsMap.get(brand.id).productCount++;
    });
  }
});

const brands = Array.from(brandsMap.values()).sort((a, b) => b.productCount - a.productCount);
console.log(`  共 ${brands.length} 个品牌`);
console.log('  TOP 10品牌:');
brands.slice(0, 10).forEach(b => {
  console.log(`    - ${b.name}: ${b.productCount}个商品`);
});

// 4. 提取所有属性(Filters)
console.log('\n[4/6] 提取属性(Filters)数据...');
const attributesMap = new Map();
rawProducts.forEach(p => {
  if (p.attributes && Array.isArray(p.attributes)) {
    p.attributes.forEach(attr => {
      if (!attributesMap.has(attr.id)) {
        attributesMap.set(attr.id, {
          id: attr.id,
          name: attr.name,
          taxonomy: attr.taxonomy,
          hasVariations: attr.has_variations,
          terms: new Map(),
          productCount: 0
        });
      }
      const attrData = attributesMap.get(attr.id);
      attrData.productCount++;
      if (attr.terms && Array.isArray(attr.terms)) {
        attr.terms.forEach(term => {
          if (!attrData.terms.has(term.id)) {
            attrData.terms.set(term.id, {
              id: term.id,
              name: term.name,
              slug: term.slug,
              productCount: 0
            });
          }
          attrData.terms.get(term.id).productCount++;
        });
      }
    });
  }
});

const attributes = Array.from(attributesMap.values()).map(attr => ({
  id: attr.id,
  name: attr.name,
  taxonomy: attr.taxonomy,
  hasVariations: attr.hasVariations,
  productCount: attr.productCount,
  terms: Array.from(attr.terms.values()).sort((a, b) => b.productCount - a.productCount)
})).sort((a, b) => b.productCount - a.productCount);

console.log(`  共 ${attributes.length} 个属性(Filters)`);
console.log('  主要属性:');
attributes.slice(0, 15).forEach(a => {
  console.log(`    - ${a.name}: ${a.terms.length}个选项, ${a.productCount}个商品`);
});

// 5. 处理商品数据和图片关联
console.log('\n[5/6] 处理商品数据和图片关联...');

// 辅助函数：生成安全的slug
function generateSlug(name, id) {
  // 只保留英文字母数字，移除特殊字符
  let slug = name
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/&[a-z]+;/gi, '') // 移除HTML实体
    .replace(/[^a-zA-Z0-9\s-]/g, '') // 只保留英文数字空格连字符
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
  
  // 如果slug为空或太短，使用ID
  if (!slug || slug.length < 3) {
    slug = 'product';
  }
  
  return `${slug}-${id}`.toLowerCase();
}

// 辅助函数：获取商品本地图片
function getProductImages(productId) {
  const images = [];
  const productDir = path.join(IMAGES_DIR, String(productId));
  
  if (fs.existsSync(productDir)) {
    try {
      const files = fs.readdirSync(productDir)
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
        .sort();
      
      files.forEach((f, idx) => {
        // 判断是主图(gallery)还是详情图(desc)
        const isGallery = f.startsWith('gallery_') || f.startsWith('original_') || idx < 5;
        images.push({
          url: `/api/media/images_original/${productId}/${f}`,
          sortOrder: idx,
          type: isGallery ? 'gallery' : 'description'
        });
      });
    } catch (e) {}
  }
  
  // 如果本地没有图片，使用原始URL
  if (images.length === 0) {
    // 从商品数据中提取图片
    // 注意：原始数据中的images字段需要检查
  }
  
  return images;
}

// 辅助函数：解析价格
function parsePrice(prices) {
  if (!prices) return { price: 0, regularPrice: 0, salePrice: 0, currency: 'RUB', formatted: 'Цена по запросу' };
  
  const minorUnit = prices.currency_minor_unit || 2;
  const divisor = Math.pow(10, minorUnit);
  
  const price = prices.price ? parseInt(prices.price, 10) / divisor : 0;
  const regularPrice = prices.regular_price ? parseInt(prices.regular_price, 10) / divisor : price;
  const salePrice = prices.sale_price ? parseInt(prices.sale_price, 10) / divisor : price;
  
  return {
    price,
    regularPrice,
    salePrice,
    currency: prices.currency_code || 'RUB',
    currencySymbol: prices.currency_symbol || '₽',
    onSale: salePrice < regularPrice,
    formatted: price > 0 
      ? `${price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ${prices.currency_symbol || '₽'}`
      : 'Цена по запросу'
  };
}

// 处理每个商品
const products = rawProducts.map(p => {
  // 提取品牌
  const brand = p.brands && p.brands.length > 0 ? p.brands[0] : null;
  
  // 提取主分类（取第一个）
  const mainCategory = p.categories && p.categories.length > 0 ? p.categories[0] : null;
  
  // 解析价格
  const priceData = parsePrice(p.prices);
  
  // 获取图片
  const images = getProductImages(p.id);
  
  // 提取属性为键值对
  const attributesMap = {};
  if (p.attributes && Array.isArray(p.attributes)) {
    p.attributes.forEach(attr => {
      if (attr.terms && attr.terms.length > 0) {
        attributesMap[attr.name] = attr.terms.map(t => t.name).join(', ');
      }
    });
  }
  
  // 提取描述中的图片
  const descImages = [];
  if (p.description) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    while ((match = imgRegex.exec(p.description)) !== null) {
      descImages.push(match[1]);
    }
  }
  
  return {
    id: String(p.id),
    name: p.name,
    slug: generateSlug(p.name, p.id),
    sku: p.sku || '',
    permalink: p.permalink || '',
    
    // 分类
    categoryIds: p.categories ? p.categories.map(c => c.id) : [],
    categories: p.categories ? p.categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })) : [],
    mainCategory: mainCategory ? { id: mainCategory.id, name: mainCategory.name, slug: mainCategory.slug } : null,
    
    // 品牌
    brandId: brand ? brand.id : null,
    brand: brand ? { id: brand.id, name: brand.name, slug: brand.slug } : null,
    
    // 价格
    price: priceData.price,
    regularPrice: priceData.regularPrice,
    salePrice: priceData.salePrice,
    currency: priceData.currency,
    priceFormatted: priceData.formatted,
    onSale: priceData.onSale,
    
    // 描述
    shortDescription: p.short_description || '',
    description: p.description || '',
    descriptionImages: descImages,
    
    // 图片
    images: images.map(img => img.url),
    galleryImages: images.filter(img => img.type === 'gallery').map(img => img.url),
    imageCount: images.length,
    
    // 属性/规格
    attributes: attributesMap,
    rawAttributes: p.attributes || [],
    
    // 评分
    rating: parseFloat(p.average_rating) || 0,
    reviewCount: parseInt(p.review_count, 10) || 0,
    
    // 库存
    inStock: p.is_in_stock !== false,
    stockStatus: p.is_in_stock ? 'instock' : 'outofstock',
    
    // 重量尺寸
    weight: p.weight || '',
    dimensions: p.dimensions || {},
    
    // 类型
    type: p.type || 'simple',
    isPurchasable: p.is_purchasable !== false,
    
    // SEO
    metaData: {}
  };
});

console.log(`  处理了 ${products.length} 个商品`);

// 统计有图片的商品
const withImages = products.filter(p => p.images.length > 0).length;
console.log(`  有图片的商品: ${withImages}`);
const withGallery = products.filter(p => p.galleryImages.length > 0).length;
console.log(`  有主图的商品: ${withGallery}`);

// 6. 保存数据
console.log('\n[6/6] 保存结构化数据...');

// 保存分类
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'categories.json'),
  JSON.stringify(categories, null, 2),
  'utf8'
);
console.log(`  保存 categories.json (${categories.length} 分类)`);

// 保存品牌
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'brands.json'),
  JSON.stringify(brands, null, 2),
  'utf8'
);
console.log(`  保存 brands.json (${brands.length} 品牌)`);

// 保存属性
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'attributes.json'),
  JSON.stringify(attributes, null, 2),
  'utf8'
);
console.log(`  保存 attributes.json (${attributes.length} 属性)`);

// 保存商品（分块保存避免文件过大）
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'products.json'),
  JSON.stringify(products),
  'utf8'
);
console.log(`  保存 products.json (${products.length} 商品)`);

// 生成统计摘要
const stats = {
  generatedAt: new Date().toISOString(),
  totalProducts: products.length,
  totalCategories: categories.length,
  totalBrands: brands.length,
  totalAttributes: attributes.length,
  totalImages: products.reduce((sum, p) => sum + p.imageCount, 0),
  productsWithImages: withImages,
  productsWithGallery: withGallery,
  productsWithPrice: products.filter(p => p.price > 0).length,
  productsInStock: products.filter(p => p.inStock).length,
  averageRating: products.reduce((sum, p) => sum + p.rating, 0) / products.length,
  priceRange: {
    min: Math.min(...products.filter(p => p.price > 0).map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  }
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'stats.json'),
  JSON.stringify(stats, null, 2),
  'utf8'
);

console.log('\n========================================');
console.log('数据整合完成!');
console.log('========================================');
console.log(`商品总数: ${stats.totalProducts}`);
console.log(`分类总数: ${stats.totalCategories}`);
console.log(`品牌总数: ${stats.totalBrands}`);
console.log(`属性总数: ${stats.totalAttributes}`);
console.log(`图片总数: ${stats.totalImages}`);
console.log(`价格范围: ${stats.priceRange.min.toLocaleString('ru-RU')}₽ - ${stats.priceRange.max.toLocaleString('ru-RU')}₽`);
console.log(`平均评分: ${stats.averageRating.toFixed(2)}`);
console.log(`输出目录: ${OUTPUT_DIR}`);
