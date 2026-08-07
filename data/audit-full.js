/**
 * Aegisky Medusa 全量数据审计脚本
 * 检查：品牌关联、分类关联、商品计数、图片路径、重复商品等
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = 'D:/项目备份/Aegisky-Medusa/aegisky-medusa/data/mirror';
const PUBLIC_DIR = 'D:/项目备份/Aegisky-Medusa/aegisky-medusa/storefront/public';

console.log('='.repeat(70));
console.log('AEGISKY MEDUSA - 全量数据审计');
console.log('='.repeat(70));

// 加载数据
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
const brands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));
const tags = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tags.json'), 'utf8'));
const attributes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'attributes.json'), 'utf8'));

console.log(`\n[数据概览]`);
console.log(`  商品总数: ${products.length}`);
console.log(`  品牌总数: ${brands.length}`);
console.log(`  分类总数: ${categories.length}`);
console.log(`  标签总数: ${tags.length}`);
console.log(`  属性总数: ${attributes.length}`);

// ========== 问题1: 品牌关联缺失 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题1] 品牌关联缺失检查');

// 建立品牌ID到品牌名的映射
const brandMap = new Map();
brands.forEach(b => brandMap.set(b.id, b));

// 检查商品中引用的品牌ID是否都存在于brands.json
const missingBrandRefs = new Set();
const productsWithMissingBrands = [];
products.forEach(p => {
  (p.brands || []).forEach(b => {
    if (!brandMap.has(b.id)) {
      missingBrandRefs.add(b.id);
      productsWithMissingBrands.push({ productId: p.id, productName: p.name, brandId: b.id, brandName: b.name });
    }
  });
});

if (missingBrandRefs.size > 0) {
  console.log(`  ❌ 发现 ${missingBrandRefs.size} 个不存在的品牌ID被引用:`);
  productsWithMissingBrands.slice(0, 10).forEach(p => {
    console.log(`     - 商品 ${p.productId}: 品牌ID ${p.brandId} (${p.brandName})`);
  });
} else {
  console.log(`  ✅ 所有商品引用的品牌ID都存在`);
}

// 检查商品名称包含品牌名但未关联该品牌的情况
console.log('\n[问题1b] 名称含品牌名但未关联品牌的商品:');
const brandNameToId = new Map();
brands.forEach(b => brandNameToId.set(b.name.toUpperCase(), b.id));

const missingBrandByName = [];
products.forEach(p => {
  const productBrands = new Set((p.brands || []).map(b => b.id));
  const nameUpper = (p.name || '').toUpperCase();
  brands.forEach(b => {
    // 品牌名至少4个字符，避免误匹配
    if (b.name.length >= 4 && nameUpper.includes(b.name.toUpperCase()) && !productBrands.has(b.id)) {
      missingBrandByName.push({ productId: p.id, productName: p.name, shouldBeBrand: b.name, brandId: b.id, currentBrands: (p.brands || []).map(x => x.name).join(',') || 'NONE' });
    }
  });
});

if (missingBrandByName.length > 0) {
  console.log(`  ⚠️  发现 ${missingBrandByName.length} 个商品名称含品牌名但未关联:`);
  missingBrandByName.slice(0, 15).forEach(p => {
    console.log(`     - 商品 ${p.productId}: "${p.productName.substring(0, 50)}" → 应关联品牌: ${p.shouldBeBrand} (当前: ${p.currentBrands})`);
  });
} else {
  console.log(`  ✅ 未发现名称含品牌名但未关联的商品`);
}

// ========== 问题2: 分类关联缺失 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题2] 分类关联缺失检查');

const categoryMap = new Map();
categories.forEach(c => categoryMap.set(c.id, c));

const missingCatRefs = new Set();
const productsWithMissingCats = [];
products.forEach(p => {
  (p.categories || []).forEach(c => {
    if (!categoryMap.has(c.id)) {
      missingCatRefs.add(c.id);
      productsWithMissingCats.push({ productId: p.id, catId: c.id, catName: c.name });
    }
  });
});

if (missingCatRefs.size > 0) {
  console.log(`  ❌ 发现 ${missingCatRefs.size} 个不存在的分类ID被引用:`);
  productsWithMissingCats.slice(0, 10).forEach(p => {
    console.log(`     - 商品 ${p.productId}: 分类ID ${p.catId} (${p.catName})`);
  });
} else {
  console.log(`  ✅ 所有商品引用的分类ID都存在`);
}

// ========== 问题3: 品牌商品计数不一致 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题3] 品牌商品计数验证');

const brandActualCount = new Map();
brands.forEach(b => brandActualCount.set(b.id, 0));
products.forEach(p => {
  (p.brands || []).forEach(b => {
    if (brandActualCount.has(b.id)) {
      brandActualCount.set(b.id, brandActualCount.get(b.id) + 1);
    }
  });
});

const brandCountMismatch = [];
brands.forEach(b => {
  const actual = brandActualCount.get(b.id) || 0;
  if (b.productCount !== actual) {
    brandCountMismatch.push({ id: b.id, name: b.name, recorded: b.productCount, actual });
  }
});

if (brandCountMismatch.length > 0) {
  console.log(`  ❌ 发现 ${brandCountMismatch.length} 个品牌计数不一致:`);
  brandCountMismatch.slice(0, 15).forEach(b => {
    console.log(`     - ${b.name}: 记录=${b.recorded}, 实际=${b.actual} ${b.recorded > b.actual ? '(多记)' : '(少记)'}`);
  });
} else {
  console.log(`  ✅ 所有品牌商品计数一致`);
}

// ========== 问题4: 分类商品计数不一致 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题4] 分类商品计数验证');

function getAllCategoryIds(catId) {
  const ids = new Set([catId]);
  categories.filter(c => c.parent === catId).forEach(child => {
    getAllCategoryIds(child.id).forEach(id => ids.add(id));
  });
  return ids;
}

const catCountMismatch = [];
categories.forEach(c => {
  const allChildIds = getAllCategoryIds(c.id);
  const actual = products.filter(p => (p.categories || []).some(pc => allChildIds.has(pc.id))).length;
  if (c.productCount !== actual) {
    catCountMismatch.push({ id: c.id, name: c.name, recorded: c.productCount, actual });
  }
});

if (catCountMismatch.length > 0) {
  console.log(`  ❌ 发现 ${catCountMismatch.length} 个分类计数不一致:`);
  catCountMismatch.slice(0, 15).forEach(c => {
    console.log(`     - ${c.name}: 记录=${c.recorded}, 实际=${c.actual} ${c.recorded > c.actual ? '(多记)' : '(少记)'}`);
  });
} else {
  console.log(`  ✅ 所有分类商品计数一致`);
}

// ========== 问题5: 图片文件缺失 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题5] 商品图片文件检查');

let missingImages = 0;
let totalImages = 0;
const productsWithMissingImages = [];

products.forEach(p => {
  const images = p.images || [];
  images.forEach(img => {
    totalImages++;
    const localPath = path.join(PUBLIC_DIR, img);
    if (!fs.existsSync(localPath)) {
      missingImages++;
      if (productsWithMissingImages.length < 10) {
        productsWithMissingImages.push({ productId: p.id, imagePath: img });
      }
    }
  });
});

if (missingImages > 0) {
  console.log(`  ❌ 发现 ${missingImages}/${totalImages} 个图片文件缺失`);
  productsWithMissingImages.forEach(p => {
    console.log(`     - 商品 ${p.productId}: ${p.imagePath}`);
  });
} else {
  console.log(`  ✅ 所有 ${totalImages} 个图片文件都存在`);
}

// ========== 问题6: 主图缺失 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题6] 商品主图检查');

const noMainImage = products.filter(p => !p.mainImage);
if (noMainImage.length > 0) {
  console.log(`  ❌ 发现 ${noMainImage.length} 个商品没有主图:`);
  noMainImage.slice(0, 10).forEach(p => {
    console.log(`     - ${p.id}: ${p.name.substring(0, 60)}`);
  });
} else {
  console.log(`  ✅ 所有商品都有主图`);
}

// ========== 问题7: 价格为0或null ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题7] 价格异常检查');

const noPrice = products.filter(p => p.price === null || p.price === 0 || p.price === undefined);
if (noPrice.length > 0) {
  console.log(`  ⚠️  发现 ${noPrice.length} 个商品价格为0或null (B2B询价商品，正常)`);
} else {
  console.log(`  ✅ 所有商品都有价格`);
}

// ========== 问题8: 重复商品检查 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题8] 重复商品检查 (按SKU)');

const skuMap = new Map();
products.forEach(p => {
  if (!p.sku) return;
  if (!skuMap.has(p.sku)) skuMap.set(p.sku, []);
  skuMap.get(p.sku).push(p);
});

const duplicateSkus = [...skuMap.entries()].filter(([sku, prods]) => prods.length > 1);
if (duplicateSkus.length > 0) {
  console.log(`  ❌ 发现 ${duplicateSkus.length} 个重复SKU:`);
  duplicateSkus.slice(0, 10).forEach(([sku, prods]) => {
    console.log(`     - SKU ${sku}: ${prods.map(p => p.id).join(', ')}`);
    prods.forEach(p => console.log(`       * ${p.id}: ${p.name.substring(0, 60)}`));
  });
} else {
  console.log(`  ✅ 无重复SKU`);
}

// ========== 问题9: 空品牌商品 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题9] 无品牌商品检查');

const noBrand = products.filter(p => !p.brands || p.brands.length === 0);
if (noBrand.length > 0) {
  console.log(`  ⚠️  发现 ${noBrand.length} 个商品没有关联品牌`);
  noBrand.slice(0, 10).forEach(p => {
    console.log(`     - ${p.id}: ${p.name.substring(0, 60)}`);
  });
} else {
  console.log(`  ✅ 所有商品都有品牌`);
}

// ========== 问题10: 空分类商品 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题10] 无分类商品检查');

const noCategory = products.filter(p => !p.categories || p.categories.length === 0);
if (noCategory.length > 0) {
  console.log(`  ⚠️  发现 ${noCategory.length} 个商品没有关联分类`);
  noCategory.slice(0, 10).forEach(p => {
    console.log(`     - ${p.id}: ${p.name.substring(0, 60)}`);
  });
} else {
  console.log(`  ✅ 所有商品都有分类`);
}

// ========== 问题11: 视频文件检查 ==========
console.log('\n' + '-'.repeat(70));
console.log('[问题11] 视频文件检查');

let missingVideos = 0;
let totalVideos = 0;
products.forEach(p => {
  const videos = p.videos || [];
  videos.forEach(v => {
    totalVideos++;
    if (v.local && v.url) {
      const localPath = path.join(PUBLIC_DIR, v.url);
      if (!fs.existsSync(localPath)) {
        missingVideos++;
      }
    }
  });
});

if (missingVideos > 0) {
  console.log(`  ❌ 发现 ${missingVideos}/${totalVideos} 个本地视频文件缺失`);
} else {
  console.log(`  ✅ 所有 ${totalVideos} 个视频文件都存在`);
}

// ========== 总结 ==========
console.log('\n' + '='.repeat(70));
console.log('审计总结');
console.log('='.repeat(70));
console.log(`  商品总数: ${products.length}`);
console.log(`  需修复问题数: ${(missingBrandRefs.size > 0 ? 1 : 0) + (missingBrandByName.length > 0 ? 1 : 0) + (missingCatRefs.size > 0 ? 1 : 0) + (brandCountMismatch.length > 0 ? 1 : 0) + (catCountMismatch.length > 0 ? 1 : 0) + (missingImages > 0 ? 1 : 0) + (noMainImage.length > 0 ? 1 : 0) + (duplicateSkus.length > 0 ? 1 : 0) + (noBrand.length > 0 ? 1 : 0) + (noCategory.length > 0 ? 1 : 0) + (missingVideos > 0 ? 1 : 0)}`);
