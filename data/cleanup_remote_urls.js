// 清理数据中的远程URL引用
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'mirror');
const INPUT_FILE = path.join(DATA_DIR, 'products.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'products_cleaned.json');

console.log('读取products.json...');
const products = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
console.log(`共 ${products.length} 个商品`);

let cleanedVideos = 0;
let removedRaw = 0;
let cleanedDescLinks = 0;

products.forEach(p => {
    // 1. 清理videos中的originalUrl
    if (p.videos && Array.isArray(p.videos)) {
        p.videos.forEach(v => {
            if (v.originalUrl) {
                delete v.originalUrl;
                cleanedVideos++;
            }
        });
    }
    
    // 2. 删除_raw字段（包含原始数据，可能有远程URL）
    if (p._raw) {
        delete p._raw;
        removedRaw++;
    }
    
    // 3. 清理description中指向copterparts.ru的链接
    if (p.description) {
        // 移除指向copterparts.ru的<a>标签，但保留内容
        const before = p.description;
        // 替换 <a href="https://copterparts.ru/...">...</a> 为仅保留内容
        p.description = p.description.replace(/<a\s+[^>]*href=["']https?:\/\/copterparts\.ru[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, '$1');
        // 移除指向copterparts.ru的<img>标签
        p.description = p.description.replace(/<img\s+[^>]*src=["']https?:\/\/copterparts\.ru[^"']*["'][^>]*\/?>/gi, '');
        if (before !== p.description) {
            cleanedDescLinks++;
        }
    }
    
    // 4. 清理galleryVideos中的originalUrl
    if (p.galleryVideos && Array.isArray(p.galleryVideos)) {
        p.galleryVideos.forEach(v => {
            if (v.originalUrl) delete v.originalUrl;
        });
    }
    
    // 5. 清理permalink（如果包含copterparts.ru，设为#或本地路径）
    if (p.permalink && p.permalink.includes('copterparts.ru')) {
        p.permalink = '';
    }
});

console.log(`清理了 ${cleanedVideos} 个video originalUrl`);
console.log(`删除了 ${removedRaw} 个_raw字段`);
console.log(`清理了 ${cleanedDescLinks} 个商品description中的远程链接`);

// 验证
console.log('\n验证清理结果...');
let remainingCopter = 0;

function checkCopter(obj, path = '') {
    if (!obj) return;
    if (typeof obj === 'string') {
        if (obj.includes('copterparts.ru')) {
            remainingCopter++;
            if (remainingCopter <= 5) {
                console.log(`  剩余引用在 ${path}: ${obj.substring(0, 80)}...`);
            }
        }
    } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => checkCopter(item, `${path}[${i}]`));
    } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
            checkCopter(value, `${path}.${key}`);
        });
    }
}

products.forEach((p, i) => checkCopter(p, `products[${i}]`));
console.log(`剩余copterparts.ru引用: ${remainingCopter}`);

// 保存
console.log('\n保存清理后的数据...');
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products), 'utf-8');
console.log(`已保存到: ${OUTPUT_FILE}`);

// 替换原文件
const backupFile = path.join(DATA_DIR, 'products_backup_before_cleanup.json');
if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(INPUT_FILE, backupFile);
    console.log(`原文件已备份到: ${backupFile}`);
}
fs.renameSync(OUTPUT_FILE, INPUT_FILE);
console.log('原文件已替换');
