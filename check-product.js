const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));

const p = products.find(x => x.slug === 'купить-matrice-300-rtk-с-zenmuse-h20t');
if (!p) {
  console.log('Not found, searching...');
  const matches = products.filter(x => x.name && x.name.includes('Matrice 300 RTK'));
  matches.forEach(m => console.log('Found:', m.id, m.name, m.slug));
  process.exit(0);
}

console.log('=== Product Info ===');
console.log('ID:', p.id);
console.log('Name:', p.name);
console.log('image_count:', p.image_count);
console.log('video_count:', p.video_count);
console.log('\n=== Images ===');
console.log(JSON.stringify(p.images, null, 2));
console.log('\n=== Videos field ===');
console.log(JSON.stringify(p.videos, null, 2));

const desc = p.description || '';
console.log('\n=== Description video analysis ===');
const vids = desc.match(/<video[^>]*>[\s\S]*?<\/video>/gi) || [];
console.log('Video tags in desc:', vids.length);
vids.forEach((v, i) => console.log(`Vid ${i+1}:`, v.substring(0, 300)));

const mp4s = desc.match(/["'][^"']*\.mp4[^"']*["']/gi) || [];
console.log('\nMP4 references:', mp4s.length);
mp4s.forEach((m, i) => console.log(`MP4 ${i+1}:`, m));

// Check local video files
const videoDir = path.join(__dirname, 'storefront', 'public', 'videos', String(p.id));
if (fs.existsSync(videoDir)) {
  console.log('\n=== Local video files ===');
  console.log(fs.readdirSync(videoDir));
} else {
  console.log('\nNo local video dir for ID', p.id);
}

// Check local image files
const imgDir = path.join(__dirname, 'storefront', 'public', 'images', 'products', String(p.id));
if (fs.existsSync(imgDir)) {
  console.log('\n=== Local image files ===');
  console.log(fs.readdirSync(imgDir));
}
