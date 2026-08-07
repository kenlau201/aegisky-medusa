const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), 'utf8'));
const brands = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'brands.json'), 'utf8'));
const tags = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'tags.json'), 'utf8'));

console.log('=== Data Quality Report ===');
console.log('Products:', products.length);
console.log('Categories:', categories.length);
console.log('Brands:', brands.length);
console.log('Tags:', tags.length);
console.log('');

// Build lookup maps
const catMap = new Map(categories.map(c => [c.id, c]));
const catSlugMap = new Map(categories.map(c => [c.slug, c]));
const brandMap = new Map(brands.map(b => [b.id, b]));
const tagMap = new Map(tags.map(t => [t.id, t]));

// 1. Check category references in products
let missingCats = 0;
let uncategorizedProducts = 0;
let fixedCats = 0;
const missingCatIds = new Set();
const productsWithCats = [];

products.forEach(p => {
    if (!p.categories || p.categories.length === 0) {
        uncategorizedProducts++;
    } else {
        const validCats = [];
        p.categories.forEach(c => {
            if (catMap.has(c.id)) {
                validCats.push(c);
            } else {
                missingCats++;
                missingCatIds.add(c.id);
                // Try to find by slug
                if (c.slug && catSlugMap.has(c.slug)) {
                    const found = catSlugMap.get(c.slug);
                    validCats.push({ id: found.id, name: found.name, slug: found.slug });
                    fixedCats++;
                }
            }
        });
        if (validCats.length > 0) {
            productsWithCats.push({ ...p, categories: validCats });
        }
    }
});

console.log('=== Category Issues ===');
console.log('Products with no categories:', uncategorizedProducts);
console.log('Category references not found in categories.json:', missingCats);
console.log('Missing category IDs:', [...missingCatIds].slice(0, 20));
console.log('Categories fixed by slug match:', fixedCats);

// 2. Check brand references
let missingBrands = 0;
const missingBrandIds = new Set();
products.forEach(p => {
    (p.brands || []).forEach(b => {
        if (!brandMap.has(b.id)) {
            missingBrands++;
            missingBrandIds.add(b.id);
        }
    });
});
console.log('');
console.log('=== Brand Issues ===');
console.log('Brand references not found:', missingBrands);
console.log('Missing brand IDs:', [...missingBrandIds].slice(0, 20));

// 3. Check tag references
let missingTags = 0;
products.forEach(p => {
    (p.tags || []).forEach(t => {
        if (!tagMap.has(t.id)) missingTags++;
    });
});
console.log('');
console.log('=== Tag Issues ===');
console.log('Tag references not found:', missingTags);

// 4. Check slug encoding
let encodedSlugs = 0;
products.forEach(p => {
    if (p.slug && p.slug.includes('%')) encodedSlugs++;
});
console.log('');
console.log('=== Slug Issues ===');
console.log('Products with URL-encoded slugs:', encodedSlugs);

// 5. Check products in DJI category (ID=766)
const djiProducts = products.filter(p => p.categories.some(c => c.id === 766));
console.log('');
console.log('=== DJI Category (ID=766) ===');
console.log('Products directly in DJI category:', djiProducts.length);

// Check products that have DJI brand but not in DJI category
const djiBrandId = brands.find(b => b.name === 'DJI')?.id;
if (djiBrandId) {
    const djiBrandProducts = products.filter(p => p.brands.some(b => b.id === djiBrandId));
    console.log('Products with DJI brand:', djiBrandProducts.length);
    
    // These DJI brand products should potentially be in DJI category
    const djiBrandNotInCat = djiBrandProducts.filter(p => !p.categories.some(c => c.id === 766));
    console.log('DJI brand products NOT in DJI category:', djiBrandNotInCat.length);
}

// 6. Category distribution
console.log('');
console.log('=== Top 20 Categories by Product Count ===');
const catCounts = {};
products.forEach(p => {
    (p.categories || []).forEach(c => {
        catCounts[c.id] = (catCounts[c.id] || 0) + 1;
    });
});
const topCats = Object.entries(catCounts)
    .map(([id, count]) => ({ id: Number(id), count, name: catMap.get(Number(id))?.name || 'UNKNOWN' }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
topCats.forEach(c => console.log(`  ${c.name}: ${c.count}`));

// 7. Check for products with prices
const withPrice = products.filter(p => p.price && p.price > 0).length;
console.log('');
console.log('=== Price Stats ===');
console.log('Products with valid price:', withPrice, '/', products.length);

// 8. Check images
const withImages = products.filter(p => p.images && p.images.length > 0).length;
console.log('Products with images:', withImages, '/', products.length);

// 9. Check root categories count
const rootCats = categories.filter(c => !c.parent || c.parent === 0);
console.log('');
console.log('=== Root Categories ===');
console.log('Root categories count:', rootCats.length);
rootCats.slice(0, 15).forEach(c => console.log(`  - ${c.name} (${c.count} products, ${c.slug})`));
