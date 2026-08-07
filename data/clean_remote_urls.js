/**
 * 清理所有远程URL - 确保没有任何请求发到copterparts.ru
 * - 视频：只保留local=true的本地视频
 * - 图片：只保留本地路径（以/开头的）
 * - description：移除所有copterparts.ru的视频和图片引用
 * - 对于没有图片的商品，使用占位图
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');
const PUBLIC_DIR = path.join(__dirname, '..', 'storefront', 'public');

console.log('加载产品数据...');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

let removedRemoteVideos = 0;
let removedRemoteImages = 0;
let cleanedDescriptionVideos = 0;
let cleanedDescriptionImages = 0;
let productsWithPlaceholderImage = 0;

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

products.forEach(p => {
  // 1. 清理videos数组 - 只保留本地视频
  if (p.videos && p.videos.length > 0) {
    const originalCount = p.videos.length;
    p.videos = p.videos.filter(v => v.local === true && v.url.startsWith('/'));
    removedRemoteVideos += (originalCount - p.videos.length);
    p.videoCount = p.videos.length;
    if (p.galleryVideos) {
      p.galleryVideos = p.galleryVideos.filter(v => v.local === true && v.url.startsWith('/'));
    }
  }
  
  // 2. 清理images数组 - 只保留本地路径
  if (p.images && p.images.length > 0) {
    const originalCount = p.images.length;
    p.images = p.images.filter(img => img.startsWith('/') && !img.includes('copterparts.ru'));
    removedRemoteImages += (originalCount - p.images.length);
    
    // 如果没有图片了，使用占位图
    if (p.images.length === 0) {
      p.images = [PLACEHOLDER_IMAGE];
      productsWithPlaceholderImage++;
    }
    
    p.imageCount = p.images.length;
    
    // 更新mainImage
    if (!p.mainImage || p.mainImage.includes('copterparts.ru') || !p.mainImage.startsWith('/')) {
      p.mainImage = p.images[0];
    }
  } else {
    // 没有图片字段，设置占位图
    p.images = [PLACEHOLDER_IMAGE];
    p.mainImage = PLACEHOLDER_IMAGE;
    p.imageCount = 1;
    productsWithPlaceholderImage++;
  }
  
  // 3. 清理description中的远程媒体
  if (p.description) {
    let desc = p.description;
    
    // 移除所有包含copterparts.ru的video标签
    const videoTagRegex = /<video[^>]*>[\s\S]*?<\/video>/gi;
    desc = desc.replace(videoTagRegex, (match) => {
      if (match.includes('copterparts.ru')) {
        cleanedDescriptionVideos++;
        return ''; // 移除整个视频标签
      }
      return match;
    });
    
    // 移除source标签中的远程URL
    const sourceRegex = /<source[^>]+src=["']https?:\/\/copterparts\.ru[^"']*["'][^>]*>/gi;
    desc = desc.replace(sourceRegex, () => {
      cleanedDescriptionVideos++;
      return '';
    });
    
    // 移除所有copterparts.ru的图片引用
    const imgRegex = /<img[^>]+src=["']https?:\/\/copterparts\.ru[^"']*["'][^>]*>/gi;
    desc = desc.replace(imgRegex, () => {
      cleanedDescriptionImages++;
      return '';
    });
    
    // 移除任何剩余的copterparts.ru URL引用
    const anyUrlRegex = /https?:\/\/copterparts\.ru[^\s"'<>]+/gi;
    desc = desc.replace(anyUrlRegex, (match) => {
      if (match.match(/\.(mp4|webm|mov|avi)$/i)) {
        cleanedDescriptionVideos++;
      } else if (match.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        cleanedDescriptionImages++;
      }
      return '';
    });
    
    p.description = desc;
  }
  
  // 4. 清理shortDescription中的远程图片
  if (p.shortDescription && p.shortDescription.includes('copterparts.ru')) {
    p.shortDescription = p.shortDescription.replace(/https?:\/\/copterparts\.ru[^\s"'<>]+/gi, '');
  }
});

// 创建占位图SVG
const placeholderDir = path.join(PUBLIC_DIR, 'images');
if (!fs.existsSync(placeholderDir)) fs.mkdirSync(placeholderDir, { recursive: true });

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f3f4f6"/>
  <g transform="translate(200,200)">
    <circle cx="0" cy="-30" r="40" fill="#d1d5db"/>
    <path d="M-60,40 L-30,0 L0,30 L30,-10 L60,40 Z" fill="#9ca3af"/>
    <rect x="-80" y="60" width="160" height="8" rx="4" fill="#d1d5db"/>
    <text x="0" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">Product Image</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(placeholderDir, 'placeholder-product.svg'), placeholderSvg);

console.log('保存清理后的products.json...');
fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));

console.log('='.repeat(60));
console.log('【清理完成统计】');
console.log(`  移除远程视频: ${removedRemoteVideos}`);
console.log(`  移除远程图片: ${removedRemoteImages}`);
console.log(`  清理描述中视频标签: ${cleanedDescriptionVideos}`);
console.log(`  清理描述中图片标签: ${cleanedDescriptionImages}`);
console.log(`  使用占位图的商品: ${productsWithPlaceholderImage}`);
console.log('');

// 最终验证
let remainingRemoteVideos = 0;
let remainingRemoteImages = 0;
let remainingInDescription = 0;

products.forEach(p => {
  if (p.videos) {
    remainingRemoteVideos += p.videos.filter(v => !v.url.startsWith('/') || v.local !== true).length;
  }
  if (p.images) {
    remainingRemoteImages += p.images.filter(img => !img.startsWith('/') || img.includes('copterparts.ru')).length;
  }
  if (p.description && p.description.includes('copterparts.ru')) {
    remainingInDescription++;
  }
});

console.log('【最终验证】');
console.log(`  剩余远程视频引用: ${remainingRemoteVideos}`);
console.log(`  剩余远程图片引用: ${remainingRemoteImages}`);
console.log(`  描述中仍有copterparts.ru的商品: ${remainingInDescription}`);
console.log('');

if (remainingRemoteVideos === 0 && remainingRemoteImages === 0 && remainingInDescription === 0) {
  console.log('✅ 所有copterparts.ru远程URL已完全清除！');
} else {
  console.log('⚠️ 仍有残留，需要进一步检查');
}
