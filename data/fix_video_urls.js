const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'mirror');
const BASE_URL = 'https://copterparts.ru';

const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));

let fixed = 0;
let removed = 0;

products.forEach(product => {
  if (!product.videos) product.videos = [];
  
  product.videos = product.videos.map(v => {
    // Fix relative URLs
    if (v.startsWith('/')) {
      fixed++;
      return BASE_URL + v;
    }
    // Fix URLs without protocol
    if (v.startsWith('//')) {
      fixed++;
      return 'https:' + v;
    }
    return v;
  }).filter(v => {
    // Remove invalid URLs
    if (!v.startsWith('http')) {
      removed++;
      return false;
    }
    return true;
  });
});

console.log('Fixed relative URLs:', fixed);
console.log('Removed invalid URLs:', removed);

// Count products with videos
const withVideo = products.filter(p => p.videos && p.videos.length > 0);
console.log('Products with videos:', withVideo.length);
console.log('Total video URLs:', products.reduce((sum, p) => sum + p.videos.length, 0));

fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
console.log('Saved.');
