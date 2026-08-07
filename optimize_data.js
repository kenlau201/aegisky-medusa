const fs = require('fs');
const path = require('path');

// Load all data
let products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));
let categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), 'utf8'));
let brands = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'brands.json'), 'utf8'));
let tags = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'tags.json'), 'utf8'));

console.log('=== Full Data Optimization ===');
console.log('Before: Products:', products.length, 'Categories:', categories.length, 'Brands:', brands.length, 'Tags:', tags.length);

// Build lookup maps
const catMap = new Map(categories.map(c => [c.id, c]));
const brandMap = new Map(brands.map(b => [b.id, b]));
const tagMap = new Map(tags.map(t => [t.id, t]));

let fixes = 0;

// 1. Ensure all category slugs are decoded
categories = categories.map(c => {
    let fixed = false;
    let slug = c.slug;
    try {
        if (slug && slug.includes('%')) {
            slug = decodeURIComponent(slug);
            fixed = true;
        }
    } catch (e) {}
    if (fixed) fixes++;
    return { ...c, slug };
});

// 2. Ensure all product slugs are decoded
products = products.map(p => {
    let fixed = false;
    let slug = p.slug;
    try {
        if (slug && slug.includes('%')) {
            slug = decodeURIComponent(slug);
            fixed = true;
        }
    } catch (e) {}
    
    // Also decode category/brand/tag slugs in product
    const prodCats = (p.categories || []).map(c => {
        let cSlug = c.slug;
        try { if (cSlug && cSlug.includes('%')) cSlug = decodeURIComponent(cSlug); } catch {}
        return { ...c, slug: cSlug };
    });
    const prodBrands = (p.brands || []).map(b => {
        let bSlug = b.slug;
        try { if (bSlug && bSlug.includes('%')) bSlug = decodeURIComponent(bSlug); } catch {}
        return { ...b, slug: bSlug };
    });
    const prodTags = (p.tags || []).map(t => {
        let tSlug = t.slug;
        try { if (tSlug && tSlug.includes('%')) tSlug = decodeURIComponent(tSlug); } catch {}
        return { ...t, slug: tSlug };
    });
    
    if (fixed || prodCats.some(c => c.slug !== c.slug) || prodBrands.some(b => b.slug !== b.slug)) {
        fixes++;
    }
    
    return { ...p, slug, categories: prodCats, brands: prodBrands, tags: prodTags };
});

console.log('Fixed URL-encoded slugs:', fixes);

// 3. Ensure all brand references exist, add missing brands
fixes = 0;
const newBrands = [];
products.forEach(p => {
    (p.brands || []).forEach(b => {
        if (!brandMap.has(b.id)) {
            if (!newBrands.find(nb => nb.id === b.id)) {
                newBrands.push({
                    id: b.id,
                    name: b.name,
                    slug: b.slug,
                    productCount: 1
                });
                fixes++;
            }
        }
    });
});
if (newBrands.length > 0) {
    brands = [...brands, ...newBrands];
    console.log('Added missing brands:', newBrands.length);
}

// 4. Update brand product counts
brands = brands.map(b => {
    const count = products.filter(p => p.brands.some(pb => pb.id === b.id)).length;
    return { ...b, productCount: count };
});

// 5. Update category product counts
categories = categories.map(c => {
    const count = products.filter(p => p.categories.some(pc => pc.id === c.id)).length;
    return { ...c, count };
});

// 6. Ensure all products have valid prices (mark null prices)
let nullPrices = 0;
products = products.map(p => {
    if (p.price === null || p.price === undefined || p.price <= 0) {
        nullPrices++;
        return { ...p, price: null, regularPrice: null, salePrice: null, onSale: false };
    }
    return p;
});
console.log('Products with null/zero price:', nullPrices);

// 7. Ensure all products have mainImage
let noMainImage = 0;
products = products.map(p => {
    if (!p.mainImage && p.images && p.images.length > 0) {
        noMainImage++;
        return { ...p, mainImage: p.images[0] };
    }
    if (!p.images || p.images.length === 0) {
        noMainImage++;
        return { ...p, images: [], mainImage: '' };
    }
    return p;
});
console.log('Fixed missing mainImage:', noMainImage);

// 8. Ensure imageCount is correct
products = products.map(p => ({
    ...p,
    imageCount: (p.images || []).length
}));

// 9. Final validation
const catIdSet = new Set(categories.map(c => c.id));
const brandIdSet = new Set(brands.map(b => b.id));
const tagIdSet = new Set(tags.map(t => t.id));

let invalidCatRefs = 0;
let invalidBrandRefs = 0;
let invalidTagRefs = 0;
let noCats = 0;

products.forEach(p => {
    if (!p.categories || p.categories.length === 0) noCats++;
    (p.categories || []).forEach(c => { if (!catIdSet.has(c.id)) invalidCatRefs++; });
    (p.brands || []).forEach(b => { if (!brandIdSet.has(b.id)) invalidBrandRefs++; });
    (p.tags || []).forEach(t => { if (!tagIdSet.has(t.id)) invalidTagRefs++; });
});

console.log('');
console.log('=== Validation Results ===');
console.log('Products with no categories:', noCats);
console.log('Invalid category references:', invalidCatRefs);
console.log('Invalid brand references:', invalidBrandRefs);
console.log('Invalid tag references:', invalidTagRefs);
console.log('');
console.log('After: Products:', products.length, 'Categories:', categories.length, 'Brands:', brands.length, 'Tags:', tags.length);

// Save optimized data
fs.writeFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), JSON.stringify(categories, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'mirror', 'brands.json'), JSON.stringify(brands, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'mirror', 'tags.json'), JSON.stringify(tags, null, 2));

console.log('');
console.log('Saved optimized data files');

// Show top brands
console.log('');
console.log('=== Top 15 Brands ===');
[...brands].sort((a, b) => b.productCount - a.productCount).slice(0, 15).forEach(b => {
    console.log(`  ${b.name}: ${b.productCount} products`);
});

// Show root categories
console.log('');
console.log('=== Root Categories (52) ===');
categories.filter(c => !c.parent || c.parent === 0).sort((a, b) => b.count - a.count).forEach(c => {
    console.log(`  ${c.name}: ${c.count} products`);
});
