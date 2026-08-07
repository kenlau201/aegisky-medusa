const fs = require('fs');
const path = require('path');

const DATA_DIR = 'D:\\scraper\\data';

// 收集所有分类（完整对象）
const categories = new Map();

const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('page_') && f.endsWith('.json'));

for (const file of files) {
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
  for (const p of products) {
    if (p.categories && Array.isArray(p.categories)) {
      for (const cat of p.categories) {
        if (!categories.has(cat.id)) {
          categories.set(cat.id, { ...cat, productCount: 0 });
        }
        categories.get(cat.id).productCount++;
      }
    }
  }
}

console.log(`总分类数: ${categories.size}`);

// 找出所有顶级分类（parent === 0）
const topLevel = Array.from(categories.values()).filter(c => c.parent === 0);
console.log(`顶级分类数: ${topLevel.length}`);
console.log('');

// 按productCount排序
topLevel.sort((a, b) => b.productCount - a.productCount);

console.log('所有顶级分类（parent=0）:');
console.log('ID\t数量\t名称');
topLevel.forEach(c => {
  console.log(`${c.id}\t${c.productCount}\t${c.name}`);
});

// 保存完整分类树
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'wc-categories-full.json'),
  JSON.stringify(Array.from(categories.values()), null, 2)
);
console.log('');
console.log('完整分类已保存到 src/data/wc-categories-full.json');
