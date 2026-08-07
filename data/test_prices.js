const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'export');
const productsPath = path.join(DATA_DIR, 'products_with_standard_category.json');
const rawProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('Testing price parsing...\n');

// 测试前5个商品的价格
rawProducts.slice(0, 10).forEach(p => {
  const priceStr = p.prices?.price || '0';
  const priceKopecks = parseInt(priceStr, 10);
  const priceRubles = priceKopecks / 100;
  
  console.log(`Product: ${p.name?.substring(0, 50)}`);
  console.log(`  Raw price string: "${priceStr}"`);
  console.log(`  Kopecks: ${priceKopecks}`);
  console.log(`  Rubles: ${priceRubles}`);
  console.log(`  Category: ${p.standard_category_name} (${p.standard_category_slug})`);
  console.log(`  Brands: ${JSON.stringify(p.brands?.map(b => b.name))}`);
  console.log();
});

// 统计有多少商品价格为0
let zeroPrice = 0;
let hasPrice = 0;
rawProducts.forEach(p => {
  const priceStr = p.prices?.price || '0';
  const price = parseInt(priceStr, 10) / 100;
  if (price <= 0) zeroPrice++;
  else hasPrice++;
});

console.log(`\nPrice stats:`);
console.log(`  Products with price > 0: ${hasPrice}`);
console.log(`  Products with price = 0: ${zeroPrice}`);
