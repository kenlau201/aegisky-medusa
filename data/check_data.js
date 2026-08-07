const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'export', 'products_with_standard_category.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Total products:', data.length);
console.log('\n=== Sample product (first item) ===');
const p = data[0];
console.log('id:', p.id);
console.log('name:', p.name?.substring(0, 80));
console.log('sku:', p.sku);
console.log('brands:', JSON.stringify(p.brands));
console.log('prices:', JSON.stringify(p.prices));
console.log('images count:', p.images?.length);
console.log('images[0]:', JSON.stringify(p.images?.[0]));
console.log('standard_category_id:', p.standard_category_id);
console.log('standard_category_name:', p.standard_category_name);
console.log('standard_category_slug:', p.standard_category_slug);
console.log('short_description:', p.short_description?.substring(0, 100));

// Check price fields
console.log('\n=== Price fields check ===');
const withPrice = data.filter(p => p.prices && (p.prices.price || p.prices.regular_price));
console.log('Products with prices:', withPrice.length);
if (withPrice[0]) {
  console.log('Sample prices:', JSON.stringify(withPrice[0].prices));
}

// Check brands
console.log('\n=== Brands check ===');
const brandSet = new Set();
data.forEach(p => {
  if (p.brands && Array.isArray(p.brands)) {
    p.brands.forEach(b => brandSet.add(b.name));
  }
});
console.log('Unique brands in products:', brandSet.size);
console.log('Sample brands:', Array.from(brandSet).slice(0, 10));
