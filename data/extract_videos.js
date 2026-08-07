const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'mirror');

// Load products
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));

console.log('Total products:', products.length);

// Extract videos from each product's description
let productsWithVideo = 0;
let totalVideos = 0;

products.forEach(product => {
  const videos = [];
  
  // Check description for video URLs
  if (product.description) {
    // Match <video> tags with src
    const videoTagRegex = /<video[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = videoTagRegex.exec(product.description)) !== null) {
      if (!videos.includes(match[1])) {
        videos.push(match[1]);
      }
    }
    
    // Match <source> tags
    const sourceRegex = /<source[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
    while ((match = sourceRegex.exec(product.description)) !== null) {
      if (!videos.includes(match[1])) {
        videos.push(match[1]);
      }
    }
    
    // Match direct .mp4/.webm URLs in any attribute
    const directUrlRegex = /["'](https?:\/\/[^"']+\.(?:mp4|webm|ogg))["']/gi;
    while ((match = directUrlRegex.exec(product.description)) !== null) {
      if (!videos.includes(match[1])) {
        videos.push(match[1]);
      }
    }
  }
  
  // Also check short description
  if (product.shortDescription) {
    const directUrlRegex = /["'](https?:\/\/[^"']+\.(?:mp4|webm|ogg))["']/gi;
    let match;
    while ((match = directUrlRegex.exec(product.shortDescription)) !== null) {
      if (!videos.includes(match[1])) {
        videos.push(match[1]);
      }
    }
  }
  
  if (videos.length > 0) {
    productsWithVideo++;
    totalVideos += videos.length;
    product.videos = videos;
  } else {
    product.videos = [];
  }
});

console.log('Products with videos:', productsWithVideo);
console.log('Total video URLs:', totalVideos);

// Save updated products
fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
console.log('Updated products.json saved');

// Show some samples
console.log('\nSample products with videos:');
products.filter(p => p.videos && p.videos.length > 0).slice(0, 5).forEach(p => {
  console.log(`  [${p.id}] ${p.name.substring(0, 50)}`);
  p.videos.forEach(v => console.log(`    - ${v.substring(0, 80)}`));
});
