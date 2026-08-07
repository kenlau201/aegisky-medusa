// 更仔细检查copterparts.ru出现位置
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'mirror', 'products.json'), 'utf-8'));

let count = 0;
const contexts = [];

products.forEach(p => {
  if (p.description && p.description.includes('copterparts.ru')) {
    count++;
    if (contexts.length < 5) {
      // 提取上下文
      const idx = p.description.indexOf('copterparts.ru');
      const start = Math.max(0, idx - 80);
      const end = Math.min(p.description.length, idx + 80);
      contexts.push({
        productId: p.id,
        context: p.description.substring(start, end).replace(/\n/g, ' ')
      });
    }
  }
});

console.log(`包含copterparts.ru的商品数: ${count}`);
console.log('');
contexts.forEach(c => {
  console.log(`[${c.productId}]`);
  console.log(`  ${c.context}`);
  console.log('');
});
