// 分析远程视频和图片URL情况
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

console.log(`总商品数: ${products.length}`);
console.log('='.repeat(60));

// 分析视频
let productsWithRemoteVideos = 0;
let productsWithLocalVideos = 0;
let totalRemoteVideos = 0;
let totalLocalVideos = 0;
let remoteVideoUrls = new Set();

// 分析图片
let productsWithRemoteImages = 0;
let totalRemoteImages = 0;
let totalLocalImages = 0;
let remoteImageDomains = new Set();

// 分析description中的视频
let descWithVideoTag = 0;
let descWithRemoteVideo = 0;
let descWithLocalVideo = 0;

products.forEach(p => {
  // videos字段
  const videos = p.videos || [];
  const remoteVids = videos.filter(v => !v.local);
  const localVids = videos.filter(v => v.local);
  
  if (remoteVids.length > 0) {
    productsWithRemoteVideos++;
    totalRemoteVideos += remoteVids.length;
    remoteVids.forEach(v => remoteVideoUrls.add(v.url));
  }
  if (localVids.length > 0) {
    productsWithLocalVideos++;
    totalLocalVideos += localVids.length;
  }
  
  // description中的视频
  if (p.description && p.description.includes('<video')) {
    descWithVideoTag++;
    // 检查是否有远程源
    if (p.description.includes('copterparts.ru') || p.description.includes('http')) {
      const srcMatches = p.description.match(/src=["'](https?:\/\/[^"']+)["']/g) || [];
      const hrefMatches = p.description.match(/href=["'](https?:\/\/[^"']+)["']/g) || [];
      const allUrls = [...srcMatches, ...hrefMatches];
      const remoteUrls = allUrls.filter(u => u.includes('copterparts.ru') || (!u.includes('/videos/')));
      if (remoteUrls.length > 0) {
        descWithRemoteVideo++;
      }
    }
    if (p.description.includes('/videos/')) {
      descWithLocalVideo++;
    }
  }
  
  // images字段
  const images = p.images || [];
  const remoteImgs = images.filter(img => img.startsWith('http'));
  const localImgs = images.filter(img => !img.startsWith('http'));
  
  if (remoteImgs.length > 0) {
    productsWithRemoteImages++;
    totalRemoteImages += remoteImgs.length;
    remoteImgs.forEach(img => {
      try {
        const url = new URL(img);
        remoteImageDomains.add(url.hostname);
      } catch(e) {}
    });
  }
  totalLocalImages += localImgs.length;
});

console.log('【视频分析】');
console.log(`  有本地视频的商品: ${productsWithLocalVideos}`);
console.log(`  有远程视频的商品: ${productsWithRemoteVideos}`);
console.log(`  本地视频总数: ${totalLocalVideos}`);
console.log(`  远程视频总数: ${totalRemoteVideos}`);
console.log(`  description含<video>标签: ${descWithVideoTag}`);
console.log(`  description含远程视频URL: ${descWithRemoteVideo}`);
console.log(`  description含本地视频路径: ${descWithLocalVideo}`);
console.log(`  唯一远程视频URL数: ${remoteVideoUrls.size}`);
console.log('  远程视频URL示例:');
Array.from(remoteVideoUrls).slice(0, 5).forEach(url => console.log(`    - ${url}`));

console.log('');
console.log('【图片分析】');
console.log(`  有远程图片的商品: ${productsWithRemoteImages}`);
console.log(`  远程图片总数: ${totalRemoteImages}`);
console.log(`  本地图片总数: ${totalLocalImages}`);
console.log(`  远程图片域名: ${Array.from(remoteImageDomains).join(', ')}`);

// 检查本地图片目录
const imagesDir = path.join(__dirname, '..', '..', 'scraper', 'images_original');
console.log('');
console.log('【本地图片文件】');
try {
  const productDirs = fs.readdirSync(imagesDir);
  console.log(`  商品图片目录数: ${productDirs.length}`);
  let totalImageFiles = 0;
  productDirs.forEach(dir => {
    const dirPath = path.join(imagesDir, dir);
    if (fs.statSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
      totalImageFiles += files.length;
    }
  });
  console.log(`  本地图片文件总数: ${totalImageFiles}`);
} catch(e) {
  console.log(`  读取失败: ${e.message}`);
}

// 检查本地视频目录
const videosDir = path.join(__dirname, '..', 'storefront', 'public', 'videos');
console.log('');
console.log('【本地视频文件（public）】');
try {
  const productDirs = fs.readdirSync(videosDir);
  console.log(`  商品视频目录数: ${productDirs.length}`);
  let totalVideoFiles = 0;
  productDirs.forEach(dir => {
    const dirPath = path.join(videosDir, dir);
    if (fs.statSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath).filter(f => /\.(mp4|webm)$/i.test(f));
      totalVideoFiles += files.length;
    }
  });
  console.log(`  本地视频文件总数: ${totalVideoFiles}`);
} catch(e) {
  console.log(`  读取失败: ${e.message}`);
}
