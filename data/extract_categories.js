const fs = require('fs');
const path = require('path');

const dataDir = 'D:\\scraper\\data';
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('page_') && f.endsWith('.json'));

console.log(`Found ${files.length} data files`);

const categoryMap = new Map(); // id -> {id, name, slug, count}
let totalProducts = 0;

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  for (const product of products) {
    totalProducts++;
    if (product.categories && Array.isArray(product.categories)) {
      for (const cat of product.categories) {
        if (!categoryMap.has(cat.id)) {
          categoryMap.set(cat.id, {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: 0
          });
        }
        categoryMap.get(cat.id).count++;
      }
    }
  }
}

const categories = Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);

console.log(`\nTotal products: ${totalProducts}`);
console.log(`Total unique WooCommerce categories: ${categories.length}`);
console.log('\nTop 50 categories by product count:');
categories.slice(0, 50).forEach((c, i) => {
  console.log(`${i+1}. [${c.id}] ${c.name} - ${c.count} products`);
});

// Save full list
fs.writeFileSync(
  path.join(__dirname, 'woocommerce_categories.json'),
  JSON.stringify(categories, null, 2),
  'utf8'
);

console.log(`\nSaved ${categories.length} categories to woocommerce_categories.json`);
