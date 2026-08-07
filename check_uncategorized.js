const fs = require('fs');
const path = require('path');

// Load raw data to check uncategorized products
const rawProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scraper', 'export', 'copterparts_products_full.json'), 'utf8'));
const mirrorProducts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), 'utf8'));

const uncategorizedIds = [79325, 79318, 79259, 79245, 79238, 79235, 79230, 79225, 79220, 79216, 79213];

console.log('=== Uncategorized Products Analysis ===');
uncategorizedIds.forEach(id => {
    const raw = rawProducts.find(p => p.id === id);
    const mirror = mirrorProducts.find(p => p.id === id);
    
    console.log('');
    console.log('Product ID:', id);
    console.log('Name:', mirror?.name || raw?.name || 'UNKNOWN');
    console.log('Raw categories:', JSON.stringify(raw?.categories || []));
    console.log('Mirror categories:', JSON.stringify(mirror?.categories || []));
    console.log('Brands:', JSON.stringify(mirror?.brands || []));
    console.log('Slug:', mirror?.slug);
});

// Also check if these products exist in raw data at all
console.log('');
console.log('=== Check if products exist in raw export ===');
uncategorizedIds.forEach(id => {
    const exists = rawProducts.some(p => p.id === id);
    console.log(`Product ${id}: ${exists ? 'EXISTS' : 'NOT FOUND'} in raw data`);
});
