const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), 'utf8'));

// Find all categories named "DJI"
const djiCats = categories.filter(c => c.name === 'DJI');
console.log('Categories named "DJI":', djiCats.length);
djiCats.forEach(c => {
    const parent = categories.find(pc => pc.id === c.parent);
    console.log(`  ID=${c.id}, slug=${c.slug}, parent=${c.parent} (${parent ? parent.name : 'root'}), count=${c.count}`);
});

// Count products per DJI category
console.log('');
djiCats.forEach(c => {
    const prods = products.filter(p => p.categories.some(pc => pc.id === c.id));
    console.log(`DJI category ${c.id} (${c.slug}): ${prods.length} products in our data`);
});

// The DJI category from URL /квадрокоптеры/dji/ is ID=766
// Check how many products have category ID 766
const dji766 = products.filter(p => p.categories.some(c => c.id === 766));
console.log('');
console.log('Products with category ID 766:', dji766.length);

// Check what DJI-related categories products actually have
const djiCatIds = new Set();
products.forEach(p => {
    p.categories.forEach(c => {
        if (c.name === 'DJI') djiCatIds.add(c.id);
    });
});
console.log('Category IDs named "DJI" that appear in products:', [...djiCatIds]);

// Show products with category 766
if (dji766.length > 0) {
    console.log('');
    console.log('Products in category 766:');
    dji766.forEach(p => console.log('  -', p.name.substring(0, 60)));
}
