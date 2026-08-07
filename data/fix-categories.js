/**
 * 修复分类分配 - 为无分类商品分配正确的分类
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = 'D:/项目备份/Aegisky-Medusa/aegisky-medusa/data/mirror';

let products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
let categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));

// 正确的分类映射
const correctCategories = {
  propellers: categories.find(c => c.slug === 'лопасти-и-пропеллеры'),
  frames: categories.find(c => c.slug === 'купить-раму-для-квадрокоптера'),
  servos: categories.find(c => c.slug === 'сервоприводы-для-квадрокоптера'),
  transmitters: categories.find(c => c.slug === 'пульты-управления'),
  antennas: categories.find(c => c.slug === 'антенны'),
};

console.log('正确分类映射:');
Object.entries(correctCategories).forEach(([k, v]) => {
  console.log(`  ${k}: ${v ? v.id + ' ' + v.name : 'NOT FOUND'}`);
});

// 需要重新分类的商品ID（之前错误分配到Автопилоты的）
const misclassifiedIds = [79325, 79318, 79259, 79245, 79238, 79235, 79230, 79225, 79220, 79216, 79213];

console.log('\n重新分类商品:');
let fixed = 0;
products = products.map(p => {
  if (misclassifiedIds.includes(p.id)) {
    const nameLower = (p.name || '').toLowerCase();
    let cat = null;
    
    if (nameLower.includes('сервопривод') || nameLower.includes('servo')) {
      cat = correctCategories.servos;
    } else if (nameLower.includes('пропеллер') || nameLower.includes('propeller') || nameLower.includes('prop')) {
      cat = correctCategories.propellers;
    } else if (nameLower.includes('рама') || nameLower.includes('frame')) {
      cat = correctCategories.frames;
    } else if (nameLower.includes('пульт') || nameLower.includes('transmitter') || nameLower.includes('radio')) {
      cat = correctCategories.transmitters;
    } else if (nameLower.includes('антенна') || nameLower.includes('antenna')) {
      cat = correctCategories.antennas;
    }
    
    if (cat) {
      console.log(`  - ${p.id}: "${p.name.substring(0, 50)}" → ${cat.name}`);
      fixed++;
      return { ...p, categories: [{ id: cat.id, name: cat.name, slug: cat.slug }] };
    } else {
      console.log(`  - ${p.id}: "${p.name.substring(0, 50)}" → 未找到匹配分类，保留当前`);
    }
  }
  return p;
});

// 更新分类计数
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

// 保存
fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));

console.log(`\n修复了 ${fixed} 个商品分类`);
console.log('保存完成');
