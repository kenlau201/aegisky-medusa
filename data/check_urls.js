// 详细检查图片URL格式
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

// 检查前5个商品的images
console.log('【前5个商品的图片URL示例】');
products.slice(0, 5).forEach(p => {
  console.log(`\n商品: ${p.id} - ${p.name}`);
  console.log(`  mainImage: ${p.mainImage}`);
  console.log(`  images[0]: ${p.images[0]}`);
  if (p.images.length > 1) {
    console.log(`  images[1]: ${p.images[1]}`);
  }
});

// 统计图片URL格式
let httpImages = 0;
let localImages = 0;
let otherImages = 0;
let urlPatterns = {};

products.forEach(p => {
  (p.images || []).forEach(img => {
    if (img.startsWith('http://') || img.startsWith('https://')) {
      httpImages++;
      // 提取URL模式
      const match = img.match(/^https?:\/\/([^\/]+)/);
      if (match) {
        const domain = match[1];
        urlPatterns[domain] = (urlPatterns[domain] || 0) + 1;
      }
    } else if (img.startsWith('/') || img.startsWith('./')) {
      localImages++;
    } else {
      otherImages++;
    }
  });
});

console.log('\n【图片URL统计】');
console.log(`  http/https开头: ${httpImages}`);
console.log(`  /开头(本地路径): ${localImages}`);
console.log(`  其他格式: ${otherImages}`);
console.log('  域名分布:');
Object.entries(urlPatterns).forEach(([domain, count]) => {
  console.log(`    ${domain}: ${count}`);
});

// 检查description中是否有远程图片
let descWithRemoteImages = 0;
let descRemoteImageCount = 0;
products.forEach(p => {
  if (p.description) {
    const imgMatches = p.description.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/g) || [];
    const remoteImgs = imgMatches.filter(m => m.includes('copterparts.ru'));
    if (remoteImgs.length > 0) {
      descWithRemoteImages++;
      descRemoteImageCount += remoteImgs.length;
    }
  }
});

console.log('\n【description中的远程图片】');
console.log(`  含远程图片的商品: ${descWithRemoteImages}`);
console.log(`  远程图片总数: ${descRemoteImageCount}`);

// 检查description中8个有远程视频的商品
console.log('\n【description中含远程视频URL的商品】');
let count = 0;
products.forEach(p => {
  if (p.description && p.description.includes('copterparts.ru') && p.description.includes('video')) {
    count++;
    if (count <= 8) {
      console.log(`\n商品 ${p.id}: ${p.name}`);
      // 提取视频URL
      const videoUrls = p.description.match(/https?:\/\/[^\s"'<>]+\.(?:mp4|webm|ogg)/gi) || [];
      videoUrls.forEach(url => console.log(`  视频: ${url}`));
    }
  }
});
console.log(`\n总计: ${count}个商品`);
