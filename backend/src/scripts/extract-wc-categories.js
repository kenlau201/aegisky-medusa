const fs = require('fs');
const path = require('path');

const DATA_DIR = 'D:\\scraper\\data';

// 收集所有分类
const categories = new Map();

// 读取所有page文件
const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('page_') && f.endsWith('.json'));
console.log(`找到 ${files.length} 个数据文件`);

let totalProducts = 0;

for (const file of files) {
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
  totalProducts += products.length;
  
  for (const p of products) {
    if (p.categories && Array.isArray(p.categories)) {
      for (const cat of p.categories) {
        if (!categories.has(cat.id)) {
          categories.set(cat.id, {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: 0
          });
        }
        categories.get(cat.id).count++;
      }
    }
  }
}

console.log(`总商品数: ${totalProducts}`);
console.log(`总分类数: ${categories.size}`);
console.log('');

// 按数量排序
const sorted = Array.from(categories.values()).sort((a, b) => b.count - a.count);

// 输出TOP 100分类
console.log('TOP 100分类（按商品数）:');
console.log('ID\t数量\tSlug\t名称');
sorted.slice(0, 100).forEach(c => {
  console.log(`${c.id}\t${c.count}\t${c.slug}\t${c.name}`);
});

// 保存完整分类列表
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'all-wc-categories.json'),
  JSON.stringify(sorted, null, 2)
);
console.log('');
console.log('完整分类已保存到 src/data/all-wc-categories.json');
