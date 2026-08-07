const fs = require('fs');
const path = require('path');

// Regenerate categories.json in the old format (from products, simple structure)
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));

const categoryMap = new Map();
products.forEach(p => {
    (p.categories || []).forEach(cat => {
        if (!categoryMap.has(cat.id)) {
            categoryMap.set(cat.id, {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                productCount: 0
            });
        }
        categoryMap.get(cat.id).productCount++;
    });
});

const categories = Array.from(categoryMap.values());
fs.writeFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), JSON.stringify(categories, null, 2));
console.log('Restored categories.json with', categories.length, 'categories (simple format)');
