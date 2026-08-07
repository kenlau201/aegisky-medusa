const products = require('D:/项目备份/Aegisky-Medusa/aegisky-medusa/data/mirror/products.json');

// 检查所有SKU中的非ASCII字符
console.log('=== 检查所有SKU编码问题 ===');
let skuIssues = 0;
products.forEach(p => {
  if (p.sku && /[^\x00-\x7F]/.test(p.sku)) {
    console.log('ID:' + p.id + ' SKU:' + p.sku + ' 名称:' + p.name.substring(0, 50));
    skuIssues++;
  }
});
console.log('共发现', skuIssues, '个SKU编码问题');

// 检查分类在'其他制造商'但有品牌的商品
console.log('\n=== 分类在"其他制造商"但有品牌的商品 ===');
const otherMfg = products.filter(p => 
  p.categories?.some(c => c.name === 'Другие производители') && 
  p.brands && p.brands.length > 0
);
console.log('共', otherMfg.length, '个商品');
otherMfg.slice(0, 20).forEach(p => {
  console.log('ID:' + p.id + ' 品牌:' + p.brands.map(b=>b.name).join(',') + ' 名称:' + p.name.substring(0, 50));
});

// 检查有货商品总数
const inStock = products.filter(p => p.inStock).length;
console.log('\n=== 有货商品总数 ===');
console.log('总商品:', products.length, '| 有货:', inStock, '| 缺货:', products.length - inStock);
