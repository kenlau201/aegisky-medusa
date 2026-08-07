const fs = require('fs');
const path = require('path');

const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));

console.log('Total categories:', categories.length);
console.log('');

// Find Квадрокоптеры and DJI
const quad = categories.find(c => c.name === 'Квадрокоптеры' || c.slug === 'квадрокоптеры');
const dji = categories.find(c => c.name === 'DJI' || c.slug === 'dji');

console.log('=== Квадрокоптеры ===');
if (quad) {
    console.log('ID:', quad.id);
    console.log('Name:', quad.name);
    console.log('Slug:', quad.slug);
    console.log('Parent:', quad.parent);
    console.log('Count:', quad.count);
} else {
    console.log('NOT FOUND!');
}

console.log('');
console.log('=== DJI ===');
if (dji) {
    console.log('ID:', dji.id);
    console.log('Name:', dji.name);
    console.log('Slug:', dji.slug);
    console.log('Parent:', dji.parent);
    console.log('Count:', dji.count);
} else {
    console.log('NOT FOUND!');
}

// Check parent-child relationships
console.log('');
console.log('=== Category hierarchy analysis ===');
const rootCategories = categories.filter(c => !c.parent || c.parent === 0);
const childCategories = categories.filter(c => c.parent && c.parent !== 0);
console.log('Root categories (parent=0):', rootCategories.length);
console.log('Child categories (parent>0):', childCategories.length);

// Find children of Квадрокоптеры
if (quad) {
    const quadChildren = categories.filter(c => c.parent === quad.id);
    console.log('');
    console.log('Children of Квадрокоптеры (ID=' + quad.id + '):', quadChildren.length);
    quadChildren.slice(0, 10).forEach(c => {
        console.log('  -', c.name, '(ID:', c.id, ', count:', c.count + ')');
    });
}

// Find parent of DJI
if (dji && dji.parent) {
    const djiParent = categories.find(c => c.id === dji.parent);
    console.log('');
    console.log('Parent of DJI:', djiParent ? djiParent.name : 'NOT FOUND (ID: ' + dji.parent + ')');
}

// Count products in DJI category
if (dji) {
    const djiProducts = products.filter(p => p.categories.some(c => c.id === dji.id));
    console.log('');
    console.log('Products in DJI category:', djiProducts.length);
}

// Show sample categories with parents
console.log('');
console.log('=== Sample parent-child chains ===');
childCategories.slice(0, 10).forEach(c => {
    const parent = categories.find(pc => pc.id === c.parent);
    console.log(`  ${parent ? parent.name : '?'} -> ${c.name} (count: ${c.count})`);
});
