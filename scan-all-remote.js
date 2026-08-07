const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'mirror');
const categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));
const brands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));

console.log('=== 扫描分类描述中的远程媒体URL ===');
const catRemoteImgs = [];
for (const c of categories) {
  const desc = c.description || '';
  const imgs = desc.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const img of imgs) {
    const srcMatch = img.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      const src = srcMatch[1];
      if (src.startsWith('http') && !src.includes('localhost')) {
        catRemoteImgs.push({ catId: c.id, catName: c.name, url: src, tag: img });
      }
    }
  }
  // 也检查<a href链接到远程图片
  const links = desc.match(/<a[^>]*href=["']([^"']+\.(?:jpe?g|png|gif|webp|svg))["'][^>]*>/gi) || [];
  for (const link of links) {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (href.startsWith('http') && !href.includes('localhost')) {
        catRemoteImgs.push({ catId: c.id, catName: c.name, url: href, type: 'link', tag: link });
      }
    }
  }
}

console.log(`分类描述中远程图片URL数: ${catRemoteImgs.length}`);
catRemoteImgs.forEach(item => {
  console.log(`  分类ID ${item.catId} (${item.catName}): ${item.url}`);
});

console.log('\n=== 扫描品牌描述中的远程媒体URL ===');
const brandRemoteImgs = [];
for (const b of brands) {
  const desc = b.description || '';
  const imgs = desc.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const img of imgs) {
    const srcMatch = img.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      const src = srcMatch[1];
      if (src.startsWith('http') && !src.includes('localhost')) {
        brandRemoteImgs.push({ brandId: b.id, brandName: b.name, url: src, tag: img });
      }
    }
  }
}
console.log(`品牌描述中远程图片URL数: ${brandRemoteImgs.length}`);
brandRemoteImgs.forEach(item => {
  console.log(`  品牌ID ${item.brandId} (${item.brandName}): ${item.url}`);
});

console.log('\n=== 扫描商品描述中的远程媒体URL ===');
const productRemoteImgs = [];
const productRemoteVideos = [];
const productIframes = [];
for (const p of products) {
  const desc = p.description || '';
  // img
  const imgs = desc.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const img of imgs) {
    const srcMatch = img.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      const src = srcMatch[1];
      if (src.startsWith('http') && !src.includes('localhost') && !src.includes('aegisky.com')) {
        productRemoteImgs.push({ productId: p.id, name: p.name, url: src });
      }
    }
  }
  // video
  const videos = desc.match(/<video[\s\S]*?<\/video>/gi) || [];
  for (const v of videos) {
    const srcs = [...v.matchAll(/src=["']([^"']+)["']/gi)].map(m => m[1]);
    for (const src of srcs) {
      if (src.startsWith('http') && !src.includes('localhost')) {
        productRemoteVideos.push({ productId: p.id, name: p.name, url: src });
      }
    }
  }
  // iframe
  const iframes = desc.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const f of iframes) {
    const srcMatch = f.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      productIframes.push({ productId: p.id, name: p.name, url: srcMatch[1] });
    }
  }
}

console.log(`商品描述中远程img数: ${productRemoteImgs.length}`);
productRemoteImgs.slice(0, 20).forEach(item => {
  console.log(`  商品ID ${item.productId} (${item.name}): ${item.url}`);
});
if (productRemoteImgs.length > 20) console.log(`  ...还有${productRemoteImgs.length - 20}个`);

console.log(`\n商品描述中远程video数: ${productRemoteVideos.length}`);
productRemoteVideos.forEach(item => {
  console.log(`  商品ID ${item.productId} (${item.name}): ${item.url}`);
});

console.log(`\n商品描述中iframe数: ${productIframes.length}`);
productIframes.slice(0, 20).forEach(item => {
  console.log(`  商品ID ${item.productId} (${item.name}): ${item.url}`);
});
if (productIframes.length > 20) console.log(`  ...还有${productIframes.length - 20}个`);

// 汇总
console.log('\n=== 汇总 ===');
console.log(`需要修复的远程URL总数: ${catRemoteImgs.length + brandRemoteImgs.length + productRemoteImgs.length + productRemoteVideos.length}`);
