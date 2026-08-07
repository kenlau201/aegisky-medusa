const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'mirror', 'categories.json'), 'utf8'));

// Find relevant categories
const findCat = (name) => categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()));

const servosCat = findCat('Сервопривод');
const framesCat = findCat('Рамы');
const propsCat = findCat('Пропеллер');
const radioCat = findCat('Пульт');

console.log('Found categories:');
console.log('Servos:', servosCat?.name, servosCat?.id);
console.log('Frames:', framesCat?.name, framesCat?.id);
console.log('Props:', propsCat?.name, propsCat?.id);
console.log('Radio:', radioCat?.name, radioCat?.id);

// Find all propeller categories
const propCats = categories.filter(c => c.name.toLowerCase().includes('пропеллер'));
console.log('');
console.log('All propeller categories:');
propCats.forEach(c => console.log(`  - ${c.name} (ID: ${c.id}, slug: ${c.slug})`));

// Find servo categories
const servoCats = categories.filter(c => c.name.toLowerCase().includes('сервопривод') || c.name.toLowerCase().includes('серво'));
console.log('');
console.log('All servo categories:');
servoCats.forEach(c => console.log(`  - ${c.name} (ID: ${c.id}, slug: ${c.slug})`));

// Find frame categories
const frameCats = categories.filter(c => c.name.toLowerCase().includes('рам'));
console.log('');
console.log('All frame categories:');
frameCats.forEach(c => console.log(`  - ${c.name} (ID: ${c.id}, slug: ${c.slug})`));

// Find radio/transmitter categories
const radioCats = categories.filter(c => c.name.toLowerCase().includes('пульт') || c.name.toLowerCase().includes('передатчик') || c.name.toLowerCase().includes('управлен'));
console.log('');
console.log('All radio categories:');
radioCats.forEach(c => console.log(`  - ${c.name} (ID: ${c.id}, slug: ${c.slug})`));
