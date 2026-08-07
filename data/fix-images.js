/**
 * Fix image classification - separate gallery images from description images
 * Gallery images should be product photos, not description content images
 */
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'enriched/products_enriched.json'), 'utf8'));

console.log('Fixing image classification for', products.length, 'products...');

let fixed = 0;
let totalGalleryBefore = 0;
let totalGalleryAfter = 0;
let totalDescBefore = 0;
let totalDescAfter = 0;

products.forEach(p => {
  if (!p.images) return;

  const allImages = p.images.all || [];
  const oldGallery = p.images.gallery || [];
  const oldDesc = p.images.description || [];

  totalGalleryBefore += oldGallery.length;
  totalDescBefore += oldDesc.length;

  // Categorize each image
  const trueGallery = [];
  const descImages = [];

  // First, collect all images from old gallery
  oldGallery.forEach(img => {
    const filename = img.substring(img.lastIndexOf('/') + 1).toLowerCase();
    // desc_ images are description images
    if (filename.startsWith('desc_')) {
      descImages.push(img);
    } else {
      trueGallery.push(img);
    }
  });

  // Add old description images (external URLs) to descImages
  oldDesc.forEach(img => {
    if (!descImages.includes(img) && !trueGallery.includes(img)) {
      descImages.push(img);
    }
  });

  // If no true gallery images, use first 3 desc images as gallery
  if (trueGallery.length === 0 && descImages.length > 0) {
    const takeCount = Math.min(3, descImages.length);
    for (let i = 0; i < takeCount; i++) {
      trueGallery.push(descImages.shift());
    }
  }

  // Deduplicate
  const uniqueGallery = [...new Set(trueGallery)];
  const uniqueDesc = [...new Set(descImages)];

  p.images.gallery = uniqueGallery;
  p.images.description = uniqueDesc;
  p.images.all = [...uniqueGallery, ...uniqueDesc];
  p.imageCount = uniqueGallery.length + uniqueDesc.length;

  totalGalleryAfter += uniqueGallery.length;
  totalDescAfter += uniqueDesc.length;

  if (oldGallery.length !== uniqueGallery.length || oldDesc.length !== uniqueDesc.length) {
    fixed++;
  }
});

console.log('Fixed', fixed, 'products');
console.log('Gallery images:', totalGalleryBefore, '->', totalGalleryAfter);
console.log('Description images:', totalDescBefore, '->', totalDescAfter);

// Verify Matrice 300
const m300 = products.find(p => p.id === '4712');
console.log('\nMatrice 300 RTK verification:');
console.log('  Gallery:', m300.images.gallery.length, 'images');
m300.images.gallery.forEach((img, i) => {
  console.log('    [' + i + ']', img.substring(img.lastIndexOf('/') + 1));
});
console.log('  Description:', m300.images.description.length, 'images');
m300.images.description.slice(0, 5).forEach((img, i) => {
  console.log('    [' + i + ']', img.substring(img.lastIndexOf('/') + 1));
});

fs.writeFileSync(path.join(__dirname, 'enriched/products_enriched.json'), JSON.stringify(products), 'utf8');
console.log('\nSaved.');
