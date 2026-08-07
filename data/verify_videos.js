// 详细验证所有视频URL
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

console.log('='.repeat(60));
console.log('视频本地化详细验证');
console.log('='.repeat(60));

let issues = [];
let totalVideosInDesc = 0;
let localVideoRefs = 0;
let remoteVideoRefs = 0;
let missingLocalFiles = [];

products.forEach(p => {
  // 检查videos字段
  (p.videos || []).forEach((v, idx) => {
    if (!v.local) {
      issues.push(`商品${p.id} videos[${idx}]: 远程URL - ${v.url}`);
      remoteVideoRefs++;
    } else {
      localVideoRefs++;
      // 检查文件是否存在
      const localPath = path.join(__dirname, '..', 'storefront', 'public', v.url);
      if (!fs.existsSync(localPath)) {
        missingLocalFiles.push({ productId: p.id, url: v.url, path: localPath });
      }
    }
  });

  // 检查description中的所有URL
  if (p.description) {
    // 查找所有video/source标签
    const videoTags = p.description.match(/<video[^>]*>[\s\S]*?<\/video>/gi) || [];
    totalVideosInDesc += videoTags.length;
    
    videoTags.forEach((tag, i) => {
      // 查找src属性
      const srcMatch = tag.match(/src=["']([^"']+)["']/i);
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      const videoUrl = srcMatch ? srcMatch[1] : (hrefMatch ? hrefMatch[1] : null);
      
      if (videoUrl) {
        if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
          if (videoUrl.includes('copterparts.ru')) {
            issues.push(`商品${p.id} description视频${i}: copterparts.ru远程URL - ${videoUrl}`);
            remoteVideoRefs++;
          }
        } else if (videoUrl.startsWith('/videos/')) {
          localVideoRefs++;
          // 检查文件是否存在
          const localPath = path.join(__dirname, '..', 'storefront', 'public', videoUrl);
          if (!fs.existsSync(localPath)) {
            missingLocalFiles.push({ productId: p.id, url: videoUrl, path: localPath });
          }
        }
      }
    });
    
    // 检查description中是否有任何copterparts.ru的视频引用
    if (p.description.includes('copterparts.ru') && p.description.includes('.mp4')) {
      issues.push(`商品${p.id}: description中包含copterparts.ru的mp4引用`);
    }
  }
});

console.log(`description中<video>标签总数: ${totalVideosInDesc}`);
console.log(`本地视频引用数: ${localVideoRefs}`);
console.log(`远程视频引用数: ${remoteVideoRefs}`);
console.log(`本地文件缺失数: ${missingLocalFiles.length}`);

if (missingLocalFiles.length > 0) {
  console.log('\n缺失的本地视频文件:');
  missingLocalFiles.slice(0, 10).forEach(f => {
    console.log(`  商品${f.productId}: ${f.url}`);
  });
}

if (issues.length > 0) {
  console.log(`\n发现${issues.length}个问题:`);
  issues.forEach(i => console.log(`  - ${i}`));
} else {
  console.log('\n✅ 所有视频已100%本地化，无远程URL！');
}

// 验证public/videos目录
console.log('\n' + '='.repeat(60));
console.log('public/videos目录验证');
console.log('='.repeat(60));
const videosPublicDir = path.join(__dirname, '..', 'storefront', 'public', 'videos');
const productDirs = fs.readdirSync(videosPublicDir).filter(d => {
  return fs.statSync(path.join(videosPublicDir, d)).isDirectory();
});
console.log(`商品视频目录数: ${productDirs.length}`);
let totalVideoFiles = 0;
productDirs.forEach(dir => {
  const files = fs.readdirSync(path.join(videosPublicDir, dir)).filter(f => 
    /\.(mp4|webm|ogg)$/i.test(f)
  );
  totalVideoFiles += files.length;
});
console.log(`视频文件总数: ${totalVideoFiles}`);
