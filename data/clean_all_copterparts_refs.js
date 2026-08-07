/**
 * 彻底清理所有copterparts.ru域名引用
 * 包括old.copterparts.ru等子域名
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');

console.log('加载产品数据...');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

let cleanedLinks = 0;
let cleanedAny = 0;

products.forEach(p => {
  // 清理description
  if (p.description) {
    let desc = p.description;
    
    // 替换所有copterparts.ru链接（包括子域名）
    // 处理 <a href="http://old.copterparts.ru/tel:+79042790720"> 这种
    desc = desc.replace(/<a[^>]+href=["']https?:\/\/(?:old\.)?copterparts\.ru\/tel:([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, 
      '<a href="tel:$1">$2</a>');
    
    // 移除任何其他copterparts.ru链接（保留链接文本）
    desc = desc.replace(/<a[^>]+href=["']https?:\/\/(?:www\.|old\.)?copterparts\.ru[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi,
      '$1');
    
    // 移除任何剩余的copterparts.ru URL
    desc = desc.replace(/https?:\/\/(?:www\.|old\.)?copterparts\.ru[^\s"'<>]*/gi, () => {
      cleanedAny++;
      return '#';
    });
    
    // 移除空的href
    desc = desc.replace(/href=["']#["']/g, 'href="#"');
    
    p.description = desc;
  }
  
  // 清理shortDescription
  if (p.shortDescription) {
    p.shortDescription = p.shortDescription.replace(/https?:\/\/(?:www\.|old\.)?copterparts\.ru[^\s"'<>]*/gi, '#');
  }
  
  // 清理permalink
  if (p.permalink && p.permalink.includes('copterparts.ru')) {
    p.permalink = '#';
  }
});

console.log('保存清理后的数据...');
fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));

// 最终验证
let remaining = 0;
products.forEach(p => {
  const desc = p.description || '';
  const short = p.shortDescription || '';
  const perma = p.permalink || '';
  if (desc.includes('copterparts.ru') || short.includes('copterparts.ru') || perma.includes('copterparts.ru')) {
    remaining++;
  }
});

console.log('='.repeat(60));
console.log(`清理链接: ${cleanedLinks}`);
console.log(`清理其他URL: ${cleanedAny}`);
console.log(`剩余包含copterparts.ru的商品: ${remaining}`);

if (remaining === 0) {
  console.log('✅ 所有copterparts.ru引用已完全清除！');
} else {
  console.log('⚠️ 仍有残留');
  // 显示前5个
  products.filter(p => (p.description || '').includes('copterparts.ru')).slice(0, 5).forEach(p => {
    const idx = p.description.indexOf('copterparts.ru');
    console.log(`  [${p.id}]`, p.description.substring(Math.max(0, idx - 50), idx + 50).replace(/\n/g, ' '));
  });
}
