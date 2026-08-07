/**
 * ARTELV品牌修复 + 全量数据修复
 * 1. 移除25075的ARTELV品牌关联（分类在"其他制造商"，非ARTELV商品）
 * 2. 19292标记为缺货（CRS系列全部缺货，与源站一致）
 * 3. 修复所有SKU中的西里尔字母С→拉丁C
 * 4. 更新品牌计数为有货商品数（与源站WooCommerce隐藏缺货商品一致）
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = 'D:/项目备份/Aegisky-Medusa/aegisky-medusa/data/mirror';

let products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
let brands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json'), 'utf8'));
let categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));

console.log('修复前商品数:', products.length);

// ========== 修复1: 从25075移除ARTELV品牌关联 ==========
console.log('\n[修复1] 移除25075的ARTELV品牌关联...');
const artelvBrand = brands.find(b => b.slug === 'artelv');
let fixed1 = 0;
products = products.map(p => {
  if (p.id === 25075 && p.brands?.some(b => b.id === artelvBrand.id)) {
    console.log(`  - 商品 ${p.id}: "${p.name.substring(0, 60)}"`);
    console.log(`    分类: ${p.categories?.map(c => c.name).join(', ')}`);
    console.log(`    → 移除ARTELV品牌关联（分类在"其他制造商"，非ARTELV正式商品）`);
    fixed1++;
    return { ...p, brands: (p.brands || []).filter(b => b.id !== artelvBrand.id) };
  }
  return p;
});
console.log(`  修复了 ${fixed1} 个商品`);

// ========== 修复2: 19292标记为缺货 ==========
console.log('\n[修复2] 修正19292库存状态...');
let fixed2 = 0;
products = products.map(p => {
  if (p.id === 19292 && p.inStock) {
    console.log(`  - 商品 ${p.id}: "${p.name.substring(0, 60)}"`);
    console.log(`    SKU: ${p.sku} → 当前标记有货，但CRS/LRS系列全部缺货`);
    console.log(`    → 标记为缺货（与源站一致）`);
    fixed2++;
    return {
      ...p,
      inStock: false,
      stockStatus: { text: 'Нет в наличии', class: 'out-of-stock' }
    };
  }
  return p;
});
console.log(`  修复了 ${fixed2} 个商品`);

// ========== 修复3: 修复所有SKU中的西里尔字母 ==========
console.log('\n[修复3] 修复SKU中的西里尔字母编码问题...');
let fixed3 = 0;
products = products.map(p => {
  if (p.sku && /[а-яА-ЯЁё]/.test(p.sku)) {
    const oldSku = p.sku;
    // 西里尔字母С(U+0421/с U+0441) → 拉丁C
    // 西里尔字母М(U+041C/м U+043C) → 拉丁M（如果有）
    // 西里尔字母Р(U+0420/р U+0440) → 拉丁P（如果有）
    const newSku = p.sku
      .replace(/[\u0421\u0441]/g, 'C')  // С/с → C
      .replace(/[\u041C\u043C]/g, 'M')  // М/м → M
      .replace(/[\u0420\u0440]/g, 'P')  // Р/р → P
      .replace(/[\u0410\u0430]/g, 'A')  // А/а → A
      .replace(/[\u0415\u0435]/g, 'E')  // Е/е → E
      .replace(/[\u041E\u043E]/g, 'O')  // О/о → O
      .replace(/[\u0422\u0442]/g, 'T')  // Т/т → T
      .replace(/[\u0425\u0445]/g, 'X')  // Х/х → X
      .replace(/[\u0423\u0443]/g, 'Y')  // У/у → Y
      .replace(/[\u041D\u043D]/g, 'H'); // Н/н → H
    if (oldSku !== newSku) {
      console.log(`  - ID ${p.id}: "${oldSku}" → "${newSku}"`);
      fixed3++;
      return { ...p, sku: newSku };
    }
  }
  return p;
});
console.log(`  修复了 ${fixed3} 个SKU`);

// ========== 修复4: 更新品牌计数（有货商品数） ==========
console.log('\n[修复4] 更新品牌商品计数（按有货商品计算，与源站一致）...');
const brandInStockCounts = {};
brands.forEach(b => brandInStockCounts[b.id] = 0);
products.forEach(p => {
  if (p.inStock) {
    (p.brands || []).forEach(b => {
      if (brandInStockCounts[b.id] !== undefined) brandInStockCounts[b.id]++;
    });
  }
});

brands = brands.map(b => ({ ...b, productCount: brandInStockCounts[b.id] || 0 }));
console.log(`  更新了 ${brands.length} 个品牌的有货商品计数`);

// ========== 修复5: 更新分类计数（有货商品数） ==========
console.log('\n[修复5] 更新分类商品计数（按有货商品计算）...');
function getAllCategoryIds(catId) {
  const ids = new Set([catId]);
  categories.filter(c => c.parent === catId).forEach(child => {
    getAllCategoryIds(child.id).forEach(id => ids.add(id));
  });
  return ids;
}

categories = categories.map(c => {
  const allChildIds = getAllCategoryIds(c.id);
  const count = products.filter(p => p.inStock && (p.categories || []).some(pc => allChildIds.has(pc.id))).length;
  return { ...c, productCount: count };
});
console.log(`  更新了 ${categories.length} 个分类的有货商品计数`);

// ========== 验证ARTELV ==========
console.log('\n[验证] ARTELV品牌商品:');
const artelvProducts = products.filter(p => p.brands?.some(b => b.id === artelvBrand.id));
const artelvInStock = artelvProducts.filter(p => p.inStock);
console.log(`  总关联商品: ${artelvProducts.length}`);
console.log(`  有货商品: ${artelvInStock.length}`);
artelvInStock.forEach((p, i) => {
  console.log(`  ${i+1}. ID:${p.id} ${p.name.substring(0, 55)} | SKU:${p.sku}`);
});

// ========== 保存 ==========
console.log('\n[保存] 写入修复后的数据...');
fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'brands.json'), JSON.stringify(brands, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));

console.log('\n修复完成!');
