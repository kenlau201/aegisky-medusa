const fs = require('fs');
const products = JSON.parse(fs.readFileSync('data/enriched/products_enriched.json', 'utf8'));

// Analyze current misclassifications
console.log('=== Analysis of current classification issues ===\n');

// Check military-drones - how many are actually drones vs components?
const military = products.filter(p => p.primaryCategory === 'military-drones');
const militaryDrones = military.filter(p => {
  const name = (p.name?.en || '').toLowerCase();
  return name.includes('drone') || name.includes('quadcopter') || name.includes('квадрокоптер') || 
         name.includes('беспилотник') || name.includes('fpv') || name.includes('коптер') ||
         name.includes('plane') || name.includes('самолет') || name.includes('wing');
});
const militaryComponents = military.filter(p => !militaryDrones.includes(p));
console.log(`Military category: ${military.length} total`);
console.log(`  Actually drones: ${militaryDrones.length}`);
console.log(`  Components/accessories: ${militaryComponents.length}`);
console.log('  Component examples:');
militaryComponents.slice(0, 15).forEach(p => console.log('    -', p.name?.en?.substring(0, 70)));

// Check underwater-drones
const underwater = products.filter(p => p.primaryCategory === 'underwater-drones');
const underwaterDrones = underwater.filter(p => {
  const name = (p.name?.en || '').toLowerCase();
  const desc = (p.description?.ru || '').toLowerCase();
  return name.includes('underwater') || name.includes('подводн') || name.includes('rov') ||
         name.includes('fifish') || name.includes('submarine') || name.includes('глубин') ||
         desc.includes('подводный аппарат') || desc.includes('подводный дрон');
});
console.log(`\nUnderwater category: ${underwater.length} total`);
console.log(`  Actually underwater drones: ${underwaterDrones.length}`);
console.log(`  Non-underwater items: ${underwater.length - underwaterDrones.length}`);
console.log('  Non-underwater examples:');
underwater.filter(p => !underwaterDrones.includes(p)).slice(0, 10).forEach(p => 
  console.log('    -', p.name?.en?.substring(0, 70)));

// Check what categories the military components should go to
console.log('\n=== Component types in military category ===');
const types = {};
militaryComponents.forEach(p => {
  const name = (p.name?.en || '').toLowerCase();
  let type = 'other';
  if (name.includes('motor') || name.includes('мотор')) type = 'motors';
  else if (name.includes('battery') || name.includes('аккумулятор') || name.includes('liPo')) type = 'batteries';
  else if (name.includes('esc') || name.includes('регулятор')) type = 'esc';
  else if (name.includes('propeller') || name.includes('пропеллер')) type = 'propellers';
  else if (name.includes('camera') || name.includes('камера')) type = 'cameras';
  else if (name.includes('gimbal') || name.includes('подвес')) type = 'gimbals';
  else if (name.includes('frame') || name.includes('рама')) type = 'frames';
  else if (name.includes('flight controller') || name.includes('полетный контроллер')) type = 'flight-controllers';
  else if (name.includes('vtx') || name.includes('video transmitter')) type = 'vtx';
  else if (name.includes('antenna') || name.includes('антенна')) type = 'antennas';
  else if (name.includes('servo') || name.includes('сервопривод')) type = 'servos';
  else if (name.includes('charger') || name.includes('зарядное')) type = 'chargers';
  else if (name.includes('lidar') || name.includes('лидар')) type = 'lidar';
  else if (name.includes('anti-drone') || name.includes('подавитель') || name.includes('глушилка')) type = 'anti-drone';
  else if (name.includes('detector') || name.includes('обнаружитель')) type = 'drone-detectors';
  types[type] = (types[type] || 0) + 1;
});
Object.entries(types).sort((a,b) => b[1]-a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));

// Check enterprise drones that should be there
console.log('\n=== DJI Matrice/Enterprise drones in wrong categories ===');
const matriceWrong = products.filter(p => {
  const name = (p.name?.en || '').toLowerCase();
  return (name.includes('matrice') || name.includes('m30') || name.includes('m300') || 
          name.includes('m350') || name.includes('phantom 4 rtk') || name.includes('mavic 3e') ||
          name.includes('mavic 3t') || name.includes('l1') || name.includes('l2') ||
          name.includes('zenmuse') || name.includes('h20') || name.includes('h30')) &&
         p.primaryCategory !== 'enterprise-drones';
});
matriceWrong.forEach(p => console.log(`  - [${p.primaryCategory}] ${p.name?.en?.substring(0, 70)}`));
