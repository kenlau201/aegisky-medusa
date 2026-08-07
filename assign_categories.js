const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), 'utf8'));

const catMap = new Map(categories.map(c => [c.id, c]));

// Manual category assignment based on product name
const categoryAssignments = {
    // Servos
    79325: 1362, // Сервопривод PZ-15320
    79318: 1362, // Сервопривод DS04-NFC
    // Frames
    79259: 824,  // Рама GP100
    // Radio/Transmitters
    79245: 804,  // Пульт управления 8CH TX 5A RX
    // Propellers
    79238: 743,  // Пропеллер Axisflying BlackBird BB39
    79235: 743,  // Пропеллеры Gemfan Fury 5131
    79230: 743,  // Пропеллеры DALPROP T8042
    79225: 743,  // Пропеллеры DALPROP T3028
    79220: 743,  // Пропеллеры DALPROP SplitFire T5148.5
    79216: 743,  // Пропеллеры Gemfan 2023S
    79213: 743,  // Пропеллеры Foxeer Donut 5145
};

let assigned = 0;
const fixedProducts = products.map(p => {
    if ((!p.categories || p.categories.length === 0) && categoryAssignments[p.id]) {
        const catId = categoryAssignments[p.id];
        const cat = catMap.get(catId);
        if (cat) {
            assigned++;
            return {
                ...p,
                categories: [{ id: cat.id, name: cat.name, slug: cat.slug }]
            };
        }
    }
    return p;
});

// Verify
const stillUncategorized = fixedProducts.filter(p => !p.categories || p.categories.length === 0);
console.log('Assigned categories to', assigned, 'products');
console.log('Still uncategorized:', stillUncategorized.length);

// Save
fs.writeFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), JSON.stringify(fixedProducts, null, 2));
console.log('Saved fixed products.json');

// Show fixed products
console.log('');
console.log('=== Fixed Products ===');
Object.keys(categoryAssignments).forEach(id => {
    const p = fixedProducts.find(x => x.id === Number(id));
    if (p && p.categories.length > 0) {
        console.log(`  ${p.name} → ${p.categories[0].name}`);
    }
});
