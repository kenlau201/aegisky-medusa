// 统计description中的远程图片
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));

console.log('='.repeat(60));
console.log('description中远程图片统计');
console.log('='.repeat(60));

let productsWithDescImages = 0;
let totalDescImages = 0;
let uniqueUrls = new Set();
let urlPatterns = {};

products.forEach(p => {
    if (!p.description) return;
    
    // 匹配所有img标签的src
    const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi;
    let match;
    let count = 0;
    
    while ((match = imgRegex.exec(p.description)) !== null) {
        const url = match[1];
        if (url.includes('copterparts.ru')) {
            count++;
            totalDescImages++;
            uniqueUrls.add(url);
            
            // 提取URL模式
            const pathMatch = url.match(/\/wp-content\/uploads\/(\d{4}\/\d{2})\/([^\/?#]+)$/i);
            if (pathMatch) {
                const pattern = `/wp-content/uploads/${pathMatch[1]}/`;
                urlPatterns[pattern] = (urlPatterns[pattern] || 0) + 1;
            }
        }
    }
    
    if (count > 0) {
        productsWithDescImages++;
    }
});

console.log(`description中有远程图片的商品: ${productsWithDescImages}`);
console.log(`远程图片总数: ${totalDescImages}`);
console.log(`唯一图片URL数: ${uniqueUrls.size}`);
console.log('\nURL模式分布:');
Object.entries(urlPatterns).sort((a,b) => b[1] - a[1]).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count}张`);
});

// 显示一些示例URL
console.log('\n示例URL（前10个）:');
Array.from(uniqueUrls).slice(0, 10).forEach(url => {
    console.log(`  ${url}`);
});

// 检查本地是否已有这些图片
console.log('\n' + '='.repeat(60));
console.log('检查本地文件');
console.log('='.repeat(60));

// 这些图片可能在scraper的images_original中？
// 或者需要单独下载
const scraperUploadsDir = path.join(__dirname, '..', '..', 'scraper', 'wp_content_uploads');
if (fs.existsSync(scraperUploadsDir)) {
    console.log('scraper/wp_content_uploads目录存在');
} else {
    console.log('需要下载这些图片到本地');
    console.log(`目标目录: storefront/public/images/content/`);
}
