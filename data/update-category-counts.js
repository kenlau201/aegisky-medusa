const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'enriched/products_enriched.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'enriched/standard_categories.json'), 'utf8'));

// Count products per category
const counts = {};
products.forEach(p => {
  const cat = p.primaryCategory;
  counts[cat] = (counts[cat] || 0) + 1;
});

// Update categories
categories.forEach(c => {
  c.totalProducts = counts[c.slug] || 0;
});

// Save
fs.writeFileSync(path.join(__dirname, 'enriched/standard_categories.json'), JSON.stringify(categories, null, 2), 'utf8');

console.log('Category counts updated:');
categories.sort((a, b) => b.totalProducts - a.totalProducts).forEach(c => {
  if (c.totalProducts > 0) console.log(`  ${c.slug}: ${c.totalProducts}`);
});
console.log(`\nCategories with products: ${categories.filter(c => c.totalProducts > 0).length}`);
console.log(`Categories with 0 products: ${categories.filter(c => c.totalProducts === 0).length}`);
