const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));

// 精确搜索各种变体
const patterns = [
  /Принцип\s+operation\s+FPV/i,
  /Принцип\s+работы\s+FPV\s*[-–—]?\s*drone/i,
  /Принцип.*FPV.*drone/i,
  /operation\s+FPV\s*[-–—]?\s*drone/i,
];

let found = [];
for (const p of products) {
  const desc = p.description || '';
  for (const pat of patterns) {
    if (pat.test(desc)) {
      found.push(p);
      break;
    }
  }
}

console.log('匹配商品数量:', found.length);
found.forEach(p => console.log('  ID:', p.id, '-', p.name));

if (found.length === 0) {
  // 搜索所有包含"Принцип"的商品
  console.log('\n未找到精确匹配，列出所有包含"Принцип"的商品:');
  for (const p of products) {
    const desc = p.description || '';
    if (desc.includes('Принцип')) {
      const idx = desc.indexOf('Принцип');
      const ctx = desc.substring(idx, idx + 80).replace(/\s+/g, ' ');
      console.log(`  ID ${p.id}: ${ctx}...`);
    }
  }
}

// 对每个找到的商品详细检查
for (const p of found) {
  console.log('\n========================================');
  console.log('检查商品 ID:', p.id, '-', p.name);
  console.log('========================================');

  const desc = p.description;

  // 找"Принцип"位置
  let idx = -1;
  for (const pat of patterns) {
    const m = desc.match(pat);
    if (m) {
      idx = m.index;
      break;
    }
  }
  if (idx === -1) idx = desc.indexOf('Принцип');

  if (idx !== -1) {
    // 提取前后各2000字符
    const start = Math.max(0, idx - 500);
    const end = Math.min(desc.length, idx + 4000);
    const snippet = desc.substring(start, end);

    console.log('\n=== 目标位置附近内容 ===');
    console.log(snippet);

    // 提取所有URL
    console.log('\n=== 该区域所有URL ===');
    const urlRegex = /https?:\/\/[^\s"'<>]+|src=["']([^"']+)["']|href=["']([^"']+)["']/gi;
    let match;
    const urls = [];
    while ((match = urlRegex.exec(snippet)) !== null) {
      const url = match[1] || match[2] || match[0];
      urls.push(url);
    }
    if (urls.length === 0) {
      console.log('  无URL');
    } else {
      urls.forEach(u => {
        const isRemote = u.startsWith('http') && !u.includes('localhost');
        console.log(`  ${isRemote ? '❌ 远程' : '✅ 本地'}:`, u);
      });
    }

    // 检查img/video/iframe
    const imgs = snippet.match(/<img[^>]*>/gi) || [];
    const videos = snippet.match(/<video[\s\S]*?<\/video>/gi) || [];
    const iframes = snippet.match(/<iframe[\s\S]*?<\/iframe>/gi) || [];
    console.log(`\nimg: ${imgs.length}, video: ${videos.length}, iframe: ${iframes.length}`);

    imgs.forEach((img, i) => {
      console.log(`  img ${i+1}:`, img.substring(0, 200));
    });
    videos.forEach((v, i) => {
      console.log(`  video ${i+1}:`, v.substring(0, 300));
    });
  }

  // 整个商品的远程URL统计
  console.log('\n=== 整个商品描述远程URL检查 ===');
  const allUrlRegex = /https?:\/\/[^\s"'<>]+/gi;
  let match;
  const allRemote = [];
  while ((match = allUrlRegex.exec(desc)) !== null) {
    const url = match[0];
    if (!url.includes('localhost') && !url.includes('aegisky.com')) {
      allRemote.push(url);
    }
  }
  if (allRemote.length === 0) {
    console.log('  ✅ 整个商品描述无远程URL');
  } else {
    console.log('  ❌ 发现远程URL:');
    allRemote.forEach(u => console.log('    ', u));
  }

  // 检查商品图片字段
  console.log('\n=== 商品图片字段 ===');
  console.log('images数组长度:', Array.isArray(p.images) ? p.images.length : '非数组');
  if (Array.isArray(p.images)) {
    p.images.slice(0, 5).forEach(img => {
      const isRemote = typeof img === 'string' && img.startsWith('http') && !img.includes('localhost');
      console.log(`  ${isRemote ? '❌ 远程' : '✅'}`, img);
    });
  }
  console.log('mainImage:', p.mainImage || '(无)');
}
