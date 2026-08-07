// 检查视频和图片URL状态
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

console.log(`总商品数: ${products.length}`);
console.log('='.repeat(60));

// 视频统计
let productsWithRemoteVideos = 0;
let totalRemoteVideos = 0;
let totalLocalVideos = 0;
let productsWithVideos = 0;
const remoteVideoProducts = [];

// 图片统计
let productsWithRemoteImages = 0;
let totalRemoteImages = 0;
let totalLocalImages = 0;
let productsWithImages = 0;

products.forEach(p => {
  // 视频检查
  if (p.videos && p.videos.length > 0) {
    productsWithVideos++;
    const remoteVids = p.videos.filter(v => !v.local);
    const localVids = p.videos.filter(v => v.local);
    totalRemoteVideos += remoteVids.length;
    totalLocalVideos += localVids.length;
    if (remoteVids.length > 0) {
      productsWithRemoteVideos++;
      remoteVideoProducts.push({
        id: p.id,
        name: p.name.substring(0, 50),
        remoteCount: remoteVids.length,
        localCount: localVids.length,
        remoteUrls: remoteVids.map(v => v.url)
      });
    }
  }
  
  // 检查description中的视频URL
  if (p.description && p.description.includes('copterparts.ru')) {
    const videoMatches = p.description.match(/<video[^>]*>[\s\S]*?<\/video>/gi) || [];
    videoMatches.forEach(vtag => {
      if (vtag.includes('copterparts.ru')) {
        // 这个视频标签里有远程URL
      }
    });
  }
  
  // 图片检查
  if (p.images && p.images.length > 0) {
    productsWithImages++;
    const remoteImgs = p.images.filter(img => img.includes('copterparts.ru') || img.startsWith('http'));
    const localImgs = p.images.filter(img => !img.includes('copterparts.ru') && !img.startsWith('http'));
    totalRemoteImages += remoteImgs.length;
    totalLocalImages += localImgs.length;
    if (remoteImgs.length > 0) {
      productsWithRemoteImages++;
    }
  }
});

console.log('【视频统计】');
console.log(`  有视频的商品: ${productsWithVideos}`);
console.log(`  本地视频总数: ${totalLocalVideos}`);
console.log(`  远程视频总数: ${totalRemoteVideos}`);
console.log(`  有远程视频的商品数: ${productsWithRemoteVideos}`);
console.log('');

console.log('【图片统计】');
console.log(`  有图片的商品: ${productsWithImages}`);
console.log(`  本地图片总数: ${totalLocalImages}`);
console.log(`  远程图片总数: ${totalRemoteImages}`);
console.log(`  有远程图片的商品数: ${productsWithRemoteImages}`);
console.log('');

console.log('='.repeat(60));
console.log('有远程视频的商品列表（前20个）:');
remoteVideoProducts.slice(0, 20).forEach(p => {
  console.log(`  [${p.id}] ${p.name}... - 远程:${p.remoteCount} 本地:${p.localCount}`);
  p.remoteUrls.slice(0, 2).forEach(url => console.log(`      ${url}`));
});

// 检查本地视频文件
const videoDir = path.join(__dirname, '..', 'storefront', 'public', 'videos');
if (fs.existsSync(videoDir)) {
  const productDirs = fs.readdirSync(videoDir).filter(f => {
    return fs.statSync(path.join(videoDir, f)).isDirectory();
  });
  let totalVideoFiles = 0;
  productDirs.forEach(dir => {
    const files = fs.readdirSync(path.join(videoDir, dir)).filter(f => f.endsWith('.mp4') || f.endsWith('.webm'));
    totalVideoFiles += files.length;
  });
  console.log('');
  console.log('【本地视频文件】');
  console.log(`  商品目录数: ${productDirs.length}`);
  console.log(`  视频文件总数: ${totalVideoFiles}`);
}

// 检查本地图片目录
const imageDir = path.join(__dirname, '..', '..', 'scraper', 'images_original');
if (fs.existsSync(imageDir)) {
  const productDirs = fs.readdirSync(imageDir).filter(f => {
    try { return fs.statSync(path.join(imageDir, f)).isDirectory(); } catch { return false; }
  });
  let totalImageFiles = 0;
  productDirs.forEach(dir => {
    try {
      const files = fs.readdirSync(path.join(imageDir, dir)).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
      totalImageFiles += files.length;
    } catch {}
  });
  console.log('');
  console.log('【本地原始图片】');
  console.log(`  商品目录数: ${productDirs.length}`);
  console.log(`  图片文件总数: ${totalImageFiles}`);
}
