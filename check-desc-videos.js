const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data', 'mirror');
const productsPath = path.join(DATA_DIR, 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const product = products.find(p => p.id === 4712);

if (product?.description) {
  const desc = product.description;
  // 找video标签
  const videoMatches = desc.match(/<video[^>]*>[\s\S]*?<\/video>/gi) || [];
  console.log('Video tags in description:', videoMatches.length);
  videoMatches.forEach((v, i) => {
    console.log(`\nVideo ${i}:`);
    console.log(v.substring(0, 500));
  });
  
  // 找source标签
  const sourceMatches = desc.match(/<source[^>]*>/gi) || [];
  console.log('\nSource tags:', sourceMatches.length);
  sourceMatches.forEach((s, i) => console.log(`  ${i}:`, s));
}
