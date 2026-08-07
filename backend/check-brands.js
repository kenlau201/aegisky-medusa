const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'D:/scraper/data';

const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
const allProducts = [];
for (const file of files) {
  try {
    const content = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8'));
    const products = Array.isArray(content) ? content : (content.products || []);
    allProducts.push(...products);
  } catch(e) {}
}

// 去重
const unique = new Map();
allProducts.forEach(p => unique.set(p.id, p));
const products = Array.from(unique.values());
console.log(`总商品数: ${products.length}`);

// 统计品牌
const brands = new Map();
let noBrand = 0;
let brandAttrVariants = new Set();

products.forEach(p => {
  // 查找品牌属性 - 尝试不同的属性名
  let brand = null;
  for (const attr of (p.attributes || [])) {
    brandAttrVariants.add(attr.name);
    if (attr.name === 'Бренд' || attr.name?.toLowerCase().includes('brand') || attr.name === 'Производитель') {
      // 尝试terms[0].name
      if (attr.terms && attr.terms[0] && attr.terms[0].name) {
        brand = attr.terms[0].name.trim();
      }
      // 尝试options
      else if (attr.options && attr.options[0]) {
        brand = attr.options[0].trim();
      }
    }
  }
  
  if (brand) {
    if (!brands.has(brand)) {
      brands.set(brand, 0);
    }
    brands.set(brand, brands.get(brand) + 1);
  } else {
    noBrand++;
  }
});

console.log(`\n有品牌商品: ${products.length - noBrand}`);
console.log(`无品牌商品: ${noBrand}`);
console.log(`不同品牌数: ${brands.size}`);
console.log(`\n所有属性名变体: ${Array.from(brandAttrVariants).join(', ')}`);

console.log(`\nTOP 50品牌:`);
Array.from(brands.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50)
  .forEach(([name, count], i) => {
    console.log(`  ${i+1}. ${name}: ${count}个`);
  });
