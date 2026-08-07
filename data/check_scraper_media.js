// 检查爬虫原始视频目录中是否有缺失的视频
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SCRAPER_VIDEOS = path.join(ROOT, 'scraper', 'videos_original');
const PUBLIC_VIDEOS = path.join(__dirname, '..', 'storefront', 'public', 'videos');
const SCRAPER_IMAGES = path.join(ROOT, 'scraper', 'images_original');
const PUBLIC_IMAGES = path.join(__dirname, '..', 'storefront', 'public', 'images', 'products');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'mirror', 'products.json'), 'utf-8'));

console.log('检查远程视频是否在爬虫原始目录中存在...');
console.log('='.repeat(60));

let foundInScraper = 0;
let notFound = 0;
const toCopy = [];

products.forEach(p => {
  if (p.videos && p.videos.length > 0) {
    p.videos.forEach((v, idx) => {
      if (!v.local && v.url.startsWith('http')) {
        // 检查爬虫目录中是否有这个商品的视频
        const productVideoDir = path.join(SCRAPER_VIDEOS, String(p.id));
        if (fs.existsSync(productVideoDir)) {
          const files = fs.readdirSync(productVideoDir).filter(f => 
            f.endsWith('.mp4') || f.endsWith('.webm')
          );
          if (files.length > 0) {
            foundInScraper++;
            toCopy.push({
              productId: p.id,
              videoIndex: idx,
              files: files.map(f => path.join(productVideoDir, f)),
              originalUrl: v.url
            });
          } else {
            notFound++;
            console.log(`  [${p.id}] 目录存在但无视频文件: ${p.name.substring(0, 40)}`);
          }
        } else {
          notFound++;
          // 只打印前10个
          if (notFound <= 10) {
            console.log(`  [${p.id}] 无目录: ${p.name.substring(0, 40)}`);
          }
        }
      }
    });
  }
});

console.log('');
console.log(`在爬虫目录中找到: ${foundInScraper}`);
console.log(`未找到: ${notFound}`);

// 检查图片
console.log('');
console.log('='.repeat(60));
console.log('检查远程图片是否在爬虫原始目录中存在...');

let imagesFound = 0;
let imagesNotFound = 0;
const imagesToCopy = [];

products.forEach(p => {
  if (p.images && p.images.length > 0) {
    const remoteImages = p.images.filter(img => img.startsWith('http'));
    if (remoteImages.length > 0) {
      const productImgDir = path.join(SCRAPER_IMAGES, String(p.id));
      if (fs.existsSync(productImgDir)) {
        const files = fs.readdirSync(productImgDir).filter(f => 
          /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
        );
        if (files.length > 0) {
          imagesFound += remoteImages.length;
          imagesToCopy.push({
            productId: p.id,
            files: files.map(f => path.join(productImgDir, f)),
            remoteCount: remoteImages.length
          });
          console.log(`  [${p.id}] 找到${files.length}张图片 (需要${remoteImages.length}张)`);
        } else {
          imagesNotFound += remoteImages.length;
          console.log(`  [${p.id}] 目录存在但无图片: ${p.name.substring(0, 40)}`);
        }
      } else {
        imagesNotFound += remoteImages.length;
        console.log(`  [${p.id}] 无图片目录: ${p.name.substring(0, 40)}`);
      }
    }
  }
});

console.log('');
console.log(`图片在爬虫目录中找到: ${imagesFound}`);
console.log(`图片未找到: ${imagesNotFound}`);

// 保存待复制列表
global.copyList = { videos: toCopy, images: imagesToCopy };
console.log('');
console.log('待复制视频:', toCopy.length, '个商品');
console.log('待复制图片:', imagesToCopy.length, '个商品');
