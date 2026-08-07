/**
 * 下载所有远程视频和图片，并更新products.json
 * - 视频下载到 public/videos/{productId}/
 * - 图片下载到 public/images/products/{productId}/
 * - 更新products.json中的所有URL为本地路径
 * - 更新description中的视频标签
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data', 'mirror');
const PUBLIC_DIR = path.join(ROOT_DIR, 'storefront', 'public');
const VIDEOS_DIR = path.join(PUBLIC_DIR, 'videos');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images', 'products');

// 确保目录存在
[VIDEOS_DIR, IMAGES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      const stat = fs.statSync(destPath);
      if (stat.size > 1024) {
        resolve({ skipped: true, size: stat.size });
        return;
      }
    }
    
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    const timeout = setTimeout(() => {
      file.close();
      fs.unlinkSync(destPath);
      reject(new Error('Timeout'));
    }, 60000);
    
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://copterparts.ru/'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        clearTimeout(timeout);
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        clearTimeout(timeout);
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        clearTimeout(timeout);
        file.close();
        resolve({ skipped: false, size: fs.statSync(destPath).size });
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

function getLocalVideoPath(productId, url, index) {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath) || '.mp4';
  const basename = `video_${String(index).padStart(3, '0')}${ext}`;
  return {
    fsPath: path.join(VIDEOS_DIR, String(productId), basename),
    webPath: `/videos/${productId}/${basename}`
  };
}

function getLocalImagePath(productId, url) {
  const urlPath = new URL(url).pathname;
  let filename = path.basename(urlPath);
  // 移除.webp扩展名如果原文件是.jpg.webp
  if (filename.endsWith('.jpg.webp')) {
    filename = filename.replace('.jpg.webp', '.webp');
  }
  return {
    fsPath: path.join(IMAGES_DIR, String(productId), filename),
    webPath: `/images/products/${productId}/${filename}`
  };
}

async function main() {
  console.log('加载产品数据...');
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));
  
  let downloadedVideos = 0;
  let skippedVideos = 0;
  let failedVideos = 0;
  let downloadedImages = 0;
  let skippedImages = 0;
  let failedImages = 0;
  
  // 收集所有需要下载的远程视频
  const videoDownloads = [];
  const imageDownloads = [];
  
  products.forEach(p => {
    // 收集远程视频
    if (p.videos && p.videos.length > 0) {
      p.videos.forEach((v, idx) => {
        if (!v.local && v.url.startsWith('http')) {
          const { fsPath, webPath } = getLocalVideoPath(p.id, v.url, idx);
          videoDownloads.push({
            productId: p.id,
            originalUrl: v.url,
            fsPath,
            webPath,
            videoIndex: idx
          });
        }
      });
    }
    
    // 收集远程图片
    if (p.images && p.images.length > 0) {
      p.images.forEach((img, idx) => {
        if (img.startsWith('http')) {
          const { fsPath, webPath } = getLocalImagePath(p.id, img);
          imageDownloads.push({
            productId: p.id,
            originalUrl: img,
            fsPath,
            webPath,
            imageIndex: idx
          });
        }
      });
    }
  });
  
  console.log(`需要下载的视频: ${videoDownloads.length}`);
  console.log(`需要下载的图片: ${imageDownloads.length}`);
  console.log('='.repeat(60));
  
  // 下载视频
  console.log('\n【下载视频】');
  for (let i = 0; i < videoDownloads.length; i++) {
    const v = videoDownloads[i];
    process.stdout.write(`  [${i+1}/${videoDownloads.length}] 商品${v.productId}: ${path.basename(v.originalUrl).substring(0, 50)}... `);
    try {
      const result = await downloadFile(v.originalUrl, v.fsPath);
      if (result.skipped) {
        skippedVideos++;
        console.log(`已存在 (${(result.size/1024/1024).toFixed(2)}MB)`);
      } else {
        downloadedVideos++;
        console.log(`完成 (${(result.size/1024/1024).toFixed(2)}MB)`);
      }
    } catch (e) {
      failedVideos++;
      console.log(`失败: ${e.message}`);
    }
  }
  
  // 下载图片
  console.log('\n【下载图片】');
  for (let i = 0; i < imageDownloads.length; i++) {
    const img = imageDownloads[i];
    process.stdout.write(`  [${i+1}/${imageDownloads.length}] 商品${img.productId}: ${path.basename(img.originalUrl).substring(0, 50)}... `);
    try {
      const result = await downloadFile(img.originalUrl, img.fsPath);
      if (result.skipped) {
        skippedImages++;
        console.log(`已存在 (${(result.size/1024).toFixed(1)}KB)`);
      } else {
        downloadedImages++;
        console.log(`完成 (${(result.size/1024).toFixed(1)}KB)`);
      }
    } catch (e) {
      failedImages++;
      console.log(`失败: ${e.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('【更新products.json】');
  
  // 更新产品数据
  let updatedVideoCount = 0;
  let updatedImageCount = 0;
  let updatedDescVideoCount = 0;
  
  products.forEach(p => {
    // 更新videos数组
    if (p.videos && p.videos.length > 0) {
      let changed = false;
      p.videos = p.videos.map((v, idx) => {
        if (!v.local && v.url.startsWith('http')) {
          const { webPath } = getLocalVideoPath(p.id, v.url, idx);
          // 检查文件是否存在
          const { fsPath } = getLocalVideoPath(p.id, v.url, idx);
          if (fs.existsSync(fsPath) && fs.statSync(fsPath).size > 1024) {
            changed = true;
            updatedVideoCount++;
            return { ...v, url: webPath, local: true };
          }
        }
        return v;
      });
      if (changed) {
        p.videoCount = p.videos.length;
      }
    }
    
    // 更新images数组和mainImage
    if (p.images && p.images.length > 0) {
      let changed = false;
      p.images = p.images.map(img => {
        if (img.startsWith('http')) {
          const { webPath, fsPath } = getLocalImagePath(p.id, img);
          if (fs.existsSync(fsPath) && fs.statSync(fsPath).size > 100) {
            changed = true;
            updatedImageCount++;
            return webPath;
          }
        }
        return img;
      });
      if (changed) {
        // 更新mainImage
        if (p.mainImage && p.mainImage.startsWith('http')) {
          const { webPath, fsPath } = getLocalImagePath(p.id, p.mainImage);
          if (fs.existsSync(fsPath)) {
            p.mainImage = webPath;
          } else if (p.images.length > 0) {
            p.mainImage = p.images[0];
          }
        }
        p.imageCount = p.images.length;
      }
    }
    
    // 更新description中的视频标签
    if (p.description && p.description.includes('copterparts.ru')) {
      let descChanged = false;
      let newDesc = p.description;
      
      // 替换所有视频URL
      const videoUrlRegex = /https?:\/\/copterparts\.ru\/[^\s"'<>]+\.(mp4|webm)/gi;
      const matches = [...newDesc.matchAll(videoUrlRegex)];
      
      matches.forEach((match, idx) => {
        const remoteUrl = match[0];
        // 找到对应的本地路径
        const videoEntry = p.videos?.find(v => v.url === remoteUrl || v.originalUrl === remoteUrl);
        if (videoEntry && videoEntry.local) {
          newDesc = newDesc.split(remoteUrl).join(videoEntry.url);
          descChanged = true;
          updatedDescVideoCount++;
        } else {
          // 尝试按索引匹配
          const vIdx = p.videos?.findIndex(v => !v.local && v.url === remoteUrl);
          if (vIdx >= 0) {
            const { webPath, fsPath } = getLocalVideoPath(p.id, remoteUrl, vIdx);
            if (fs.existsSync(fsPath)) {
              newDesc = newDesc.split(remoteUrl).join(webPath);
              descChanged = true;
              updatedDescVideoCount++;
            }
          }
        }
      });
      
      // 同时处理source标签中的src
      const sourceRegex = /<source[^>]+src=["'](https?:\/\/copterparts\.ru[^"']+)["']/gi;
      const sourceMatches = [...newDesc.matchAll(sourceRegex)];
      sourceMatches.forEach(match => {
        const remoteUrl = match[1];
        const vIdx = p.videos?.findIndex(v => v.url === remoteUrl || v.originalUrl === remoteUrl);
        if (vIdx >= 0) {
          const { webPath, fsPath } = getLocalVideoPath(p.id, remoteUrl, vIdx);
          if (fs.existsSync(fsPath)) {
            newDesc = newDesc.split(remoteUrl).join(webPath);
            descChanged = true;
          }
        }
      });
      
      if (descChanged) {
        p.description = newDesc;
      }
    }
  });
  
  console.log(`  更新了 ${updatedVideoCount} 个视频URL`);
  console.log(`  更新了 ${updatedImageCount} 个图片URL`);
  console.log(`  更新了 ${updatedDescVideoCount} 个描述中的视频URL`);
  
  // 保存更新后的数据
  console.log('\n保存products.json...');
  fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));
  console.log('保存完成!');
  
  console.log('\n' + '='.repeat(60));
  console.log('【统计】');
  console.log(`  视频: 下载${downloadedVideos}, 跳过${skippedVideos}, 失败${failedVideos}`);
  console.log(`  图片: 下载${downloadedImages}, 跳过${skippedImages}, 失败${failedImages}`);
  console.log(`  更新: ${updatedVideoCount}视频, ${updatedImageCount}图片, ${updatedDescVideoCount}描述视频`);
  
  // 验证：再次检查是否还有远程URL
  console.log('\n【验证】');
  let remainingRemoteVideos = 0;
  let remainingRemoteImages = 0;
  products.forEach(p => {
    if (p.videos) {
      remainingRemoteVideos += p.videos.filter(v => !v.local && v.url.startsWith('http')).length;
    }
    if (p.images) {
      remainingRemoteImages += p.images.filter(img => img.startsWith('http')).length;
    }
  });
  console.log(`  剩余远程视频: ${remainingRemoteVideos}`);
  console.log(`  剩余远程图片: ${remainingRemoteImages}`);
}

main().catch(console.error);
