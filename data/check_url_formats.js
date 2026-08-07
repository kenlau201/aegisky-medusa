// 检查图片URL格式样本
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

console.log('检查图片URL格式样本:');
console.log('='.repeat(60));

// 找几个有远程图片的商品
const remoteImgProducts = products.filter(p => 
  p.images && p.images.some(img => img.includes('copterparts.ru') || img.startsWith('http'))
);

console.log(`有远程图片的商品: ${remoteImgProducts.length}`);
remoteImgProducts.forEach(p => {
  console.log(`\n[${p.id}] ${p.name.substring(0, 60)}`);
  console.log(`  mainImage: ${p.mainImage}`);
  p.images.forEach((img, i) => {
    console.log(`  image[${i}]: ${img.substring(0, 120)}`);
  });
});

// 检查本地图片格式样本
console.log('\n' + '='.repeat(60));
console.log('本地图片URL格式样本（前3个商品）:');
products.slice(0, 3).forEach(p => {
  console.log(`\n[${p.id}] ${p.name.substring(0, 50)}`);
  console.log(`  mainImage: ${p.mainImage}`);
  if (p.images.length > 0) {
    console.log(`  image[0]: ${p.images[0]}`);
  }
});

// 检查description中的远程视频
console.log('\n' + '='.repeat(60));
console.log('检查description中的视频标签格式:');
const videoProducts = products.filter(p => p.videos && p.videos.length > 0).slice(0, 3);
videoProducts.forEach(p => {
  console.log(`\n[${p.id}] ${p.name.substring(0, 50)}`);
  p.videos.forEach((v, i) => {
    console.log(`  video[${i}]: local=${v.local}, url=${v.url.substring(0, 100)}`);
  });
  // 提取description中的video标签
  const videoMatches = p.description.match(/<video[^>]*>[\s\S]*?<\/video>/gi) || [];
  videoMatches.forEach((vm, i) => {
    console.log(`  desc video[${i}]: ${vm.substring(0, 200).replace(/\n/g, ' ')}`);
  });
});
