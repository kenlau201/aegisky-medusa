// 详细验证所有图片URL
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

console.log('='.repeat(60));
console.log('图片本地化详细验证');
console.log('='.repeat(60));

let issues = [];
let totalImages = 0;
let localImageRefs = 0;
let remoteImageRefs = 0;
let missingLocalFiles = [];
let remoteDomains = new Set();

products.forEach(p => {
  // 检查images字段
  (p.images || []).forEach((img, idx) => {
    totalImages++;
    if (img.startsWith('http://') || img.startsWith('https://')) {
      remoteImageRefs++;
      try {
        const url = new URL(img);
        remoteDomains.add(url.hostname);
      } catch(e) {}
      issues.push(`商品${p.id} images[${idx}]: 远程URL - ${img.substring(0, 80)}`);
    } else if (img.startsWith('/images/')) {
      localImageRefs++;
      // 检查文件是否存在
      const localPath = path.join(__dirname, '..', 'storefront', 'public', img);
      if (!fs.existsSync(localPath)) {
        missingLocalFiles.push({ productId: p.id, url: img, path: localPath });
      }
    }
  });

  // 检查mainImage
  if (p.mainImage) {
    if (p.mainImage.startsWith('http://') || p.mainImage.startsWith('https://')) {
      remoteImageRefs++;
      issues.push(`商品${p.id} mainImage: 远程URL - ${p.mainImage.substring(0, 80)}`);
    } else if (p.mainImage.startsWith('/images/')) {
      const localPath = path.join(__dirname, '..', 'storefront', 'public', p.mainImage);
      if (!fs.existsSync(localPath)) {
        missingLocalFiles.push({ productId: p.id, url: p.mainImage, path: localPath, isMain: true });
      }
    }
  }

  // 检查description中的图片
  if (p.description) {
    const imgTags = p.description.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
    imgTags.forEach(tag => {
      const srcMatch = tag.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        const src = srcMatch[1];
        if (src.startsWith('http://') || src.startsWith('https://')) {
          if (src.includes('copterparts.ru')) {
            remoteImageRefs++;
            issues.push(`商品${p.id} description中<img>: 远程URL - ${src.substring(0, 80)}`);
          }
        }
      }
    });
  }
});

console.log(`总图片引用数(images字段): ${totalImages}`);
console.log(`本地图片引用数: ${localImageRefs}`);
console.log(`远程图片引用数: ${remoteImageRefs}`);
console.log(`本地文件缺失数: ${missingLocalFiles.length}`);

if (remoteDomains.size > 0) {
  console.log('\n远程图片域名:');
  remoteDomains.forEach(d => console.log(`  - ${d}`));
}

if (missingLocalFiles.length > 0) {
  console.log(`\n缺失的本地图片文件(前10个):`);
  missingLocalFiles.slice(0, 10).forEach(f => {
    console.log(`  商品${f.productId}${f.isMain ? '(主图)' : ''}: ${f.url}`);
  });
}

if (issues.length > 0) {
  console.log(`\n发现${issues.length}个问题(前10个):`);
  issues.slice(0, 10).forEach(i => console.log(`  - ${i}`));
} else {
  console.log('\n✅ 所有图片已100%本地化，无远程URL！');
}

// 验证public/images目录
console.log('\n' + '='.repeat(60));
console.log('public/images/products目录验证');
console.log('='.repeat(60));
const imagesPublicDir = path.join(__dirname, '..', 'storefront', 'public', 'images', 'products');
const productDirs = fs.readdirSync(imagesPublicDir).filter(d => {
  return fs.statSync(path.join(imagesPublicDir, d)).isDirectory();
});
console.log(`商品图片目录数: ${productDirs.length}`);
let totalImageFiles = 0;
let missingProducts = [];
products.forEach(p => {
  const productDir = path.join(imagesPublicDir, String(p.id));
  if (!fs.existsSync(productDir)) {
    missingProducts.push(p.id);
  } else {
    const files = fs.readdirSync(productDir).filter(f => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
    );
    totalImageFiles += files.length;
  }
});
console.log(`图片文件总数: ${totalImageFiles}`);
if (missingProducts.length > 0) {
  console.log(`缺少图片目录的商品: ${missingProducts.length}个`);
  console.log(`  前5个: ${missingProducts.slice(0, 5).join(', ')}`);
} else {
  console.log('✅ 所有商品都有图片目录');
}
