const fs = require('fs');
const products = JSON.parse(fs.readFileSync('enriched/products_enriched.json', 'utf8'));

// Check why some non-drones are classified as consumer-drones
const consumer = products.filter(p => p.primaryCategory === 'consumer-drones');
console.log('Total consumer-drones:', consumer.length);

// Sample some that look like accessories
const suspicious = consumer.filter(p => {
  const name = (p.name?.en || '').toLowerCase();
  return name.includes('receiver') || name.includes('transmitter') || 
         name.includes('battery') || name.includes('charger') ||
         name.includes('antenna') || name.includes('esc') ||
         name.includes('motor') || name.includes('propeller') ||
         name.includes('camera') || name.includes('frame') ||
         name.includes('sensor') || name.includes('module') ||
         name.includes('приемник') || name.includes('передатчик') ||
         name.includes('аккумулятор') || name.includes('зарядное') ||
         name.includes('антенна') || name.includes('мотор') ||
         name.includes('регулятор') || name.includes('камера') ||
         name.includes('рама') || name.includes('датчик') ||
         name.includes('модуль') || name.includes('плата');
});

console.log('Suspicious non-drones in consumer-drones:', suspicious.length);
suspicious.slice(0, 30).forEach(p => {
  console.log('  -', p.name?.en?.substring(0, 70));
});

// Check underwater suspicious
const underwater = products.filter(p => p.primaryCategory === 'underwater-drones');
console.log('\nUnderwater drones that look suspicious:');
underwater.forEach(p => {
  const name = (p.name?.en || '').toLowerCase();
  if (!name.includes('underwater') && !name.includes('подводн') && !name.includes('rov') &&
      !name.includes('fifish') && !name.includes('qysea') && !name.includes('camoro') &&
      !name.includes('seaflyer') && !name.includes('водяной')) {
    console.log('  -', p.name?.en?.substring(0, 70));
  }
});

// Check military suspicious
const military = products.filter(p => p.primaryCategory === 'military-drones');
console.log('\nMilitary drones that look suspicious:');
military.forEach(p => {
  const name = (p.name?.en || '').toLowerCase();
  if (name.includes('акб') || name.includes('battery') || name.includes('аккумулятор')) {
    console.log('  -', p.name?.en?.substring(0, 70));
  }
});

// Check enterprise suspicious
const enterprise = products.filter(p => p.primaryCategory === 'enterprise-drones');
console.log('\nEnterprise drones that look suspicious:');
enterprise.forEach(p => {
  const name = (p.name?.en || '').toLowerCase();
  if (name.includes('gnss') || name.includes('gps') || name.includes('rtk.*rover') ||
      name.includes('holybro') || name.includes('atway.*путь') || name.includes('fpv-дрон')) {
    console.log('  -', p.name?.en?.substring(0, 70));
  }
});
