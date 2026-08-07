const fs = require('fs');
const path = require('path');
const https = require('https');

// Load current data
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));
let categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), 'utf8'));

// Find missing category IDs
const catIdSet = new Set(categories.map(c => c.id));
const missingIds = new Set();

products.forEach(p => {
    (p.categories || []).forEach(c => {
        if (!catIdSet.has(c.id)) {
            missingIds.add(c.id);
        }
    });
});

console.log('Missing category IDs:', [...missingIds]);

// Fetch a single category from WC API
function fetchCategory(id) {
    return new Promise((resolve, reject) => {
        const url = `https://copterparts.ru/wp-json/wc/store/products/categories/${id}`;
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    // Fetch missing categories
    const newCats = [];
    for (const id of missingIds) {
        try {
            process.stdout.write(`Fetching category ${id}... `);
            const cat = await fetchCategory(id);
            if (cat && cat.id && cat.name) {
                newCats.push({
                    id: cat.id,
                    name: cat.name,
                    slug: decodeURIComponent(cat.slug),
                    parent: cat.parent || 0,
                    description: cat.description || '',
                    count: cat.count || 0,
                    image: cat.image ? cat.image.src : '',
                    permalink: cat.permalink || '',
                });
                console.log(`Found: ${cat.name} (parent: ${cat.parent})`);
            } else {
                console.log('Not found');
            }
            await new Promise(r => setTimeout(r, 300));
        } catch (e) {
            console.log('Error:', e.message);
        }
    }

    // Add new categories
    if (newCats.length > 0) {
        categories = [...categories, ...newCats];
        console.log('');
        console.log('Added', newCats.length, 'new categories');
    }

    // Rebuild category map
    const newCatMap = new Map(categories.map(c => [c.id, c]));

    // Fix products: update category references
    let fixed = 0;
    let removed = 0;
    const fixedProducts = products.map(p => {
        if (!p.categories || p.categories.length === 0) {
            return p;
        }

        const validCats = [];
        p.categories.forEach(c => {
            if (newCatMap.has(c.id)) {
                const fullCat = newCatMap.get(c.id);
                validCats.push({
                    id: c.id,
                    name: c.name || fullCat.name,
                    slug: c.slug || fullCat.slug,
                });
            } else {
                removed++;
            }
        });

        if (validCats.length !== p.categories.length) {
            fixed++;
        }

        return { ...p, categories: validCats };
    });

    console.log('Fixed products with category references:', fixed);
    console.log('Removed invalid category references:', removed);

    // Check for products without categories
    const stillUncategorized = fixedProducts.filter(p => !p.categories || p.categories.length === 0);
    console.log('Products still without categories:', stillUncategorized.length);
    if (stillUncategorized.length > 0) {
        console.log('Uncategorized product IDs:', stillUncategorized.map(p => p.id));
    }

    // Save fixed data
    fs.writeFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), JSON.stringify(categories, null, 2));
    fs.writeFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), JSON.stringify(fixedProducts, null, 2));

    console.log('');
    console.log('Saved fixed categories.json and products.json');
    console.log('Total categories now:', categories.length);
    console.log('Total products:', fixedProducts.length);
}

main().catch(console.error);
