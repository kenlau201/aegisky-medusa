const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'aegisky-medusa', 'data', 'mirror', 'products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'aegisky-medusa', 'data', 'mirror', 'categories.json'), 'utf8'));
const brands = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'aegisky-medusa', 'data', 'mirror', 'brands.json'), 'utf8'));

console.log('=== Data Verification ===\n');
console.log('Products:', products.length);
console.log('Categories:', categories.length);
console.log('Brands:', brands.length);

// Build category ID set
const catIds = new Set(categories.map(c => c.id));
const catMap = {};
categories.forEach(c => catMap[c.id] = c);

// Check product categories
let productsWithCategories = 0;
let productsWithInvalidCats = 0;
let invalidCatIds = new Set();
const catProductCount = {};

products.forEach(p => {
    if (p.categories && p.categories.length > 0) {
        productsWithCategories++;
        p.categories.forEach(c => {
            if (!catIds.has(c.id)) {
                productsWithInvalidCats++;
                invalidCatIds.add(c.id);
            }
            catProductCount[c.id] = (catProductCount[c.id] || 0) + 1;
        });
    }
});

console.log('\n=== Category Verification ===');
console.log('Products with categories:', productsWithCategories);
console.log('Products with invalid category refs:', productsWithInvalidCats);
if (invalidCatIds.size > 0) {
    console.log('Invalid category IDs:', [...invalidCatIds].slice(0, 10));
}

// Compare API count vs actual product count
console.log('\n=== Category Count Comparison (API count vs our products) ===');
const mismatches = [];
categories.forEach(c => {
    const actual = catProductCount[c.id] || 0;
    if (c.count > 0 && actual === 0) {
        mismatches.push({ name: c.name, id: c.id, apiCount: c.count, actual: 0 });
    }
});

console.log('Categories with API count > 0 but 0 products in our data:', mismatches.length);
if (mismatches.length > 0 && mismatches.length <= 20) {
    mismatches.slice(0, 20).forEach(m => {
        console.log(`  - ${m.name} (ID=${m.id}): API=${m.apiCount}, our data=${m.actual}`);
    });
} else if (mismatches.length > 20) {
    console.log('  (showing first 20)');
    mismatches.slice(0, 20).forEach(m => {
        console.log(`  - ${m.name} (ID=${m.id}): API=${m.apiCount}, our data=${m.actual}`);
    });
    console.log(`  ... and ${mismatches.length - 20} more`);
}

// Root categories with products
console.log('\n=== Root Categories Coverage ===');
const roots = categories.filter(c => !c.parent);
let rootsWithProducts = 0;
roots.forEach(r => {
    const count = catProductCount[r.id] || 0;
    if (count > 0) rootsWithProducts++;
});
console.log(`Root categories: ${roots.length}, with products: ${rootsWithProducts}`);

// Top categories by actual product count
console.log('\n=== Top 20 Categories by Actual Product Count ===');
const sorted = Object.entries(catProductCount)
    .map(([id, count]) => ({ id: Number(id), name: catMap[Number(id)]?.name || 'Unknown', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
sorted.forEach((c, i) => {
    console.log(`  ${i+1}. ${c.name} (ID=${c.id}): ${c.count} products`);
});

// Check brands
console.log('\n=== Brand Verification ===');
const brandIds = new Set(brands.map(b => b.id));
let productsWithBrands = 0;
let invalidBrandRefs = 0;
products.forEach(p => {
    if (p.brands && p.brands.length > 0) {
        productsWithBrands++;
        p.brands.forEach(b => {
            if (!brandIds.has(b.id)) invalidBrandRefs++;
        });
    }
});
console.log('Products with brands:', productsWithBrands);
console.log('Invalid brand refs:', invalidBrandRefs);
