// 检查description中剩余的copterparts.ru引用
const fs = require('fs');
const path = require('path');

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'mirror', 'products.json'), 'utf-8'));

const types = {
  video: 0,
  image: 0,
  link: 0,
  other: 0
};

const samples = { video: [], image: [], link: [], other: [] };

products.forEach(p => {
  if (p.description && p.description.includes('copterparts.ru')) {
    // 找出所有copterparts.ru URL
    const urlRegex = /https?:\/\/copterparts\.ru[^\s"'<>]+/gi;
    const matches = p.description.match(urlRegex) || [];
    matches.forEach(url => {
      if (url.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
        types.video++;
        if (samples.video.length < 3) samples.video.push(url);
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
        types.image++;
        if (samples.image.length < 3) samples.image.push(url);
      } else if (url.includes('/product/') || url.includes('/category/') || url.includes('/brand/')) {
        types.link++;
        if (samples.link.length < 5) samples.link.push(url);
      } else {
        types.other++;
        if (samples.other.length < 5) samples.other.push(url);
      }
    });
  }
});

console.log('剩余URL类型统计:');
console.log('  视频:', types.video);
console.log('  图片:', types.image);
console.log('  链接:', types.link);
console.log('  其他:', types.other);
console.log('');

console.log('视频样本:', samples.video);
console.log('图片样本:', samples.image);
console.log('链接样本:', samples.link);
console.log('其他样本:', samples.other);
