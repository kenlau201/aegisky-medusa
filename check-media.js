const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));

// 搜索包含目标文本的商品
const searchText = 'Принцип operation FPV-drone';
let found = null;

for (const p of products) {
  const desc = p.description || '';
  if (desc.includes(searchText) || desc.includes('Принцип работы FPV') || desc.includes('FPV-drone')) {
    if (desc.includes('Принцип')) {
      found = p;
      break;
    }
  }
}

if (!found) {
  // 模糊搜索
  for (const p of products) {
    const desc = p.description || '';
    if (/Принцип.*FPV/i.test(desc)) {
      found = p;
      break;
    }
  }
}

if (!found) {
  console.log('未找到包含该文本的商品，搜索所有FPV分类下的商品描述...');
  process.exit(0);
}

console.log('找到商品 ID:', found.id);
console.log('商品名:', found.name);
console.log('');

const desc = found.description;
const idx = desc.indexOf('Принцип');
if (idx === -1) {
  console.log('文本位置未找到');
  process.exit(0);
}

// 提取该位置后面1500字符的内容
const snippet = desc.substring(idx, Math.min(idx + 3000, desc.length));
console.log('=== "Принцип" 附近内容 ===');
console.log(snippet);
console.log('');

// 提取所有URL
console.log('=== 该片段中的所有URL ===');
const urlRegex = /(https?:\/\/[^\s"'<>]+)|(src=["'][^"']+["'])|(href=["'][^"']+["'])/gi;
let match;
const urls = [];
while ((match = urlRegex.exec(snippet)) !== null) {
  let url = match[0];
  if (url.startsWith('src="') || url.startsWith('href="')) {
    url = url.substring(5, url.length - 1);
  }
  if (url.startsWith("src='") || url.startsWith("href='")) {
    url = url.substring(5, url.length - 1);
  }
  urls.push(url);
}

// 也检查整个商品描述的所有URL
const allUrls = [];
const allUrlRegex = /(https?:\/\/[^\s"'<>]+)|src=["']([^"']+)["']/gi;
while ((match = allUrlRegex.exec(desc)) !== null) {
  let url = match[1] || match[2];
  if (url) allUrls.push(url);
}

console.log('片段中的URL:');
urls.forEach(u => console.log('  ', u));
console.log('');

console.log('=== 整个商品描述中的所有媒体URL ===');
const remoteUrls = [];
const localUrls = [];
allUrls.forEach(u => {
  if (u.startsWith('http') && !u.includes('localhost') && !u.includes('aegisky')) {
    remoteUrls.push(u);
  } else if (u.startsWith('/images/') || u.startsWith('/videos/') || u.startsWith('../')) {
    localUrls.push(u);
  } else if (u.startsWith('http')) {
    localUrls.push(u);
  } else {
    localUrls.push(u);
  }
});

console.log('远程URL (非localhost):');
if (remoteUrls.length === 0) {
  console.log('  ✅ 无远程URL');
} else {
  remoteUrls.forEach(u => console.log('  ❌', u));
}
console.log('');
console.log('本地URL数量:', localUrls.length);
localUrls.slice(0, 10).forEach(u => console.log('  ', u));

// 检查是否有video标签或iframe
console.log('');
console.log('=== 检查video/iframe/隐藏元素 ===');
const videoTags = desc.match(/<video[\s\S]*?<\/video>/gi) || [];
const iframeTags = desc.match(/<iframe[\s\S]*?>/gi) || [];
const imgTags = desc.match(/<img[\s\S]*?>/gi) || [];
const hiddenElements = desc.match(/display:\s*none|visibility:\s*hidden|hidden\s*=/gi) || [];

console.log('video标签数量:', videoTags.length);
videoTags.forEach((v, i) => {
  console.log(`  Video ${i+1}:`, v.substring(0, 200));
});
console.log('iframe标签数量:', iframeTags.length);
iframeTags.forEach((v, i) => console.log(`  iframe ${i+1}:`, v));
console.log('img标签数量:', imgTags.length);
console.log('隐藏元素(display:none等):', hiddenElements.length);
