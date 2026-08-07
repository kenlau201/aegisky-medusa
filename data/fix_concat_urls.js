const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));

// Known 404 URLs to remove (from verification)
const known404 = [
  'https://copterparts.ru/wp-content/uploads/2024/07/WhatsApp-Video-2024-07-22-at-21.30.44.mp4',
  'https://copterparts.ru/wp-content/uploads/2024/05/rosx3.mp4',
];

let fixed = 0;
let removed = 0;

products.forEach(product => {
  if (!product.videos) product.videos = [];
  
  product.videos = product.videos.map(v => {
    // Fix concatenated URLs (two URLs stuck together)
    // Pattern: ...mp4https://copterparts.ru/...
    const concatMatch = v.match(/^(.+\.(?:mp4|webm|ogg))(https?:\/\/.+)$/i);
    if (concatMatch) {
      fixed++;
      return concatMatch[1]; // Return first URL
    }
    return v;
  }).filter(v => {
    // Remove known 404s
    if (known404.includes(v)) {
      removed++;
      return false;
    }
    // Remove URLs that contain http twice (concatenation that wasn't caught)
    if ((v.match(/https?:\/\//g) || []).length > 1) {
      fixed++;
      // Extract first URL
      const match = v.match(/^(https?:\/\/[^\s]+?\.(?:mp4|webm|ogg))/i);
      if (match) {
        return match[1];
      }
      removed++;
      return false;
    }
    return true;
  });
});

console.log('Fixed concatenated URLs:', fixed);
console.log('Removed 404 URLs:', removed);

const withVideo = products.filter(p => p.videos && p.videos.length > 0);
console.log('Products with videos:', withVideo.length);
console.log('Total video URLs:', products.reduce((sum, p) => sum + p.videos.length, 0));

fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
console.log('Saved.');
