const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'enriched');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products_enriched.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'standard_categories.json'), 'utf8'));

// Find racing-related products currently in fpv-drones
const racingKeywords = ['racing', 'race', 'racer', 'freestyle', '5inch', '5 inch', '220mm', '250mm', '210mm'];
let racingCount = 0;
let gpsCount = 0;
let spareCount = 0;

products.forEach(p => {
  const name = (p.name?.en || '').toLowerCase();
  
  // Racing drones
  if (p.primaryCategory === 'fpv-drones') {
    if (racingKeywords.some(kw => name.includes(kw))) {
      p.primaryCategory = 'racing-drones';
      racingCount++;
    }
  }
  
  // GPS modules
  if (name.includes('gps') && !name.includes('gps mount')) {
    if (['sensors', 'flight-controllers', 'accessories', 'electronic-modules'].includes(p.primaryCategory)) {
      p.primaryCategory = 'gps';
      gpsCount++;
    }
  }
  
  // Spare parts - generic parts/accessories
  if (p.primaryCategory === 'accessories') {
    if (name.includes('spare') || name.includes('repair') || name.includes('replacement')) {
      p.primaryCategory = 'spare-parts';
      spareCount++;
    }
  }
});

console.log(`Reclassified ${racingCount} racing drones`);
console.log(`Reclassified ${gpsCount} GPS modules`);
console.log(`Reclassified ${spareCount} spare parts`);

// Recalculate category counts
const countMap = {};
products.forEach(p => {
  countMap[p.primaryCategory] = (countMap[p.primaryCategory] || 0) + 1;
});

categories.forEach(c => {
  c.totalProducts = countMap[c.slug] || 0;
});

console.log();
console.log('=== Updated category counts ===');
categories.filter(c => ['racing-drones', 'gps', 'spare-parts', 'fpv-drones'].includes(c.slug)).forEach(c => {
  console.log(`  ${c.slug}: ${c.totalProducts}`);
});

// Save
fs.writeFileSync(path.join(DATA_DIR, 'products_enriched.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'standard_categories.json'), JSON.stringify(categories, null, 2));
console.log();
console.log('Saved!');
