/**
 * Aegisky Medusa 数据修复脚本
 * 修复：无分类商品、重复SKU、品牌关联缺失、商品计数
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = 'D:/项目备份/Aegisky-Medusa/aegisky-medusa/data/mirror';

// 加载数据
let products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
let brands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json'), 'utf8'));
let categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));

console.log('修复前商品数:', products.length);

// ========== 修复1: 为ID 25075添加ARTELV品牌 ==========
console.log('\n[修复1] 为名称含ARTELV但无品牌的商品添加品牌...');
const artelvBrand = brands.find(b => b.slug === 'artelv');
let fixed1 = 0;
products = products.map(p => {
  if ((!p.brands || p.brands.length === 0) && p.name && p.name.toUpperCase().includes('ARTELV')) {
    console.log(`  - 商品 ${p.id}: "${p.name.substring(0, 60)}" → 添加品牌 ARTELV`);
    fixed1++;
    return { ...p, brands: [{ id: artelvBrand.id, name: artelvBrand.name, slug: artelvBrand.slug }] };
  }
  return p;
});
console.log(`  修复了 ${fixed1} 个商品`);

// ========== 修复2: 处理4个重复SKU ==========
console.log('\n[修复2] 处理重复SKU...');
const skuGroups = {};
products.forEach(p => {
  if (!p.sku) return;
  if (!skuGroups[p.sku]) skuGroups[p.sku] = [];
  skuGroups[p.sku].push(p);
});

const duplicateSkus = Object.entries(skuGroups).filter(([sku, prods]) => prods.length > 1);
const idsToRemove = new Set();

duplicateSkus.forEach(([sku, prods]) => {
  console.log(`  SKU ${sku} 有 ${prods.length} 个重复:`);
  // 保留ID最小的（通常是原始商品），删除其他
  prods.sort((a, b) => a.id - b.id);
  const keep = prods[0];
  const remove = prods.slice(1);
  console.log(`    保留: ${keep.id} - ${keep.name.substring(0, 50)}`);
  remove.forEach(r => {
    console.log(`    删除: ${r.id} - ${r.name.substring(0, 50)}`);
    idsToRemove.add(r.id);
  });
});

if (idsToRemove.size > 0) {
  products = products.filter(p => !idsToRemove.has(p.id));
  console.log(`  删除了 ${idsToRemove.size} 个重复商品`);
}

// ========== 修复3: 为无分类商品分配分类 ==========
console.log('\n[修复3] 为无分类商品分配分类...');

// 查找相关分类
function findCategoryBySlug(slug) {
  return categories.find(c => c.slug === slug);
}

// 基于商品名称和关键词分配分类
const categoryRules = [
  { keywords: ['сервопривод', 'servo'], catSlug: 'servoprivody' },
  { keywords: ['пропеллер', 'пропеллеры', 'propeller', 'prop'], catSlug: 'propellery' },
  { keywords: ['рама', 'frame'], catSlug: 'ramy' },
  { keywords: ['пульт управления', 'transmitter', 'radio'], catSlug: 'apparatura-upravleniya' },
];

let fixed3 = 0;
products = products.map(p => {
  if (!p.categories || p.categories.length === 0) {
    const nameLower = (p.name || '').toLowerCase();
    let assignedCat = null;
    
    for (const rule of categoryRules) {
      if (rule.keywords.some(kw => nameLower.includes(kw))) {
        assignedCat = findCategoryBySlug(rule.catSlug);
        if (assignedCat) break;
      }
    }
    
    // 如果没找到，尝试找根分类"其他"或"Запчасти"
    if (!assignedCat) {
      assignedCat = categories.find(c => c.slug === 'zapchasti' || c.name === 'Запчасти') || 
                    categories.find(c => c.parent === 0 && c.productCount > 0);
    }
    
    if (assignedCat) {
      console.log(`  - 商品 ${p.id}: "${p.name.substring(0, 50)}" → 分类 ${assignedCat.name}`);
      fixed3++;
      return { ...p, categories: [{ id: assignedCat.id, name: assignedCat.name, slug: assignedCat.slug }] };
    } else {
      console.log(`  ⚠️  商品 ${p.id}: "${p.name.substring(0, 50)}" 未找到合适分类`);
    }
  }
  return p;
});
console.log(`  修复了 ${fixed3} 个商品`);

// ========== 修复4: 更新品牌商品计数 ==========
console.log('\n[修复4] 更新品牌商品计数...');
const brandCounts = {};
brands.forEach(b => brandCounts[b.id] = 0);
products.forEach(p => {
  (p.brands || []).forEach(b => {
    if (brandCounts[b.id] !== undefined) brandCounts[b.id]++;
  });
});

brands = brands.map(b => ({ ...b, productCount: brandCounts[b.id] || 0 }));
console.log(`  更新了 ${brands.length} 个品牌的计数`);

// ========== 修复5: 更新分类商品计数 ==========
console.log('\n[修复5] 更新分类商品计数...');

function getAllCategoryIds(catId) {
  const ids = new Set([catId]);
  categories.filter(c => c.parent === catId).forEach(child => {
    getAllCategoryIds(child.id).forEach(id => ids.add(id));
  });
  return ids;
}

categories = categories.map(c => {
  const allChildIds = getAllCategoryIds(c.id);
  const count = products.filter(p => (p.categories || []).some(pc => allChildIds.has(pc.id))).length;
  return { ...c, productCount: count };
});
console.log(`  更新了 ${categories.length} 个分类的计数`);

// ========== 保存修复后的数据 ==========
console.log('\n[保存] 写入修复后的数据文件...');

// 备份原文件
if (!fs.existsSync(path.join(DATA_DIR, 'products.json.bak_before_full_fix'))) {
  fs.copyFileSync(path.join(DATA_DIR, 'products.json'), path.join(DATA_DIR, 'products.json.bak_before_full_fix'));
  fs.copyFileSync(path.join(DATA_DIR, 'brands.json'), path.join(DATA_DIR, 'brands.json.bak_before_full_fix'));
  fs.copyFileSync(path.join(DATA_DIR, 'categories.json'), path.join(DATA_DIR, 'categories.json.bak_before_full_fix'));
  console.log('  已备份原文件');
}

fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'brands.json'), JSON.stringify(brands, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));

console.log('\n修复后商品数:', products.length);
console.log('修复完成!');
