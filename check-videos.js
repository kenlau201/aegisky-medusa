const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
console.log('Total products:', products.length);
const p = products.find(x => String(x.id) === '27422' || x.slug && x.slug.includes('matrice-300'));
console.log('Found product:', p ? p.name : 'NOT FOUND', 'id:', p ? p.id : null);

const videoMatches = p.description.match(/<video[^>]*>[\s\S]*?<\/video>/gi);
console.log('video tags in HTML:', videoMatches ? videoMatches.length : 0);
console.log('videos array length:', p.videos ? p.videos.length : 0);

if (videoMatches && videoMatches[0]) {
  const srcMatch = videoMatches[0].match(/src=["']([^"']+)["']/);
  console.log('first video src:', srcMatch ? srcMatch[1] : 'not found');
  console.log('first video tag (first 200):', videoMatches[0].substring(0, 200));
}

// Split by video tags
const parts = p.description.split(/<video[^>]*>[\s\S]*?<\/video>/i);
console.log('parts count:', parts.length);
parts.forEach((part, i) => {
  console.log(`part ${i} length:`, part.length, 'starts with:', part.substring(0, 50).replace(/\n/g, ' '));
});

// Check videos array
if (p.videos) {
  p.videos.forEach((v, i) => {
    console.log(`video ${i}:`, v.url);
  });
}
