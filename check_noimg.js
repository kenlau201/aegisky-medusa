// 检查5个无图商品的详细信息
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));
const categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf-8'));
const brands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json'), 'utf-8'));

const noImageIds = [75763, 63439, 26064, 25583, 8522];

console.log('=== 5个无图商品详细信息 ===\n');

noImageIds.forEach(id => {
    const p = products.find(x => x.id === id);
    if (!p) {
        console.log(`ID:${id} - 未找到`);
        return;
    }
    console.log(`ID: ${p.id}`);
    console.log(`名称: ${p.name}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`分类: ${(p.categories || []).map(c => c.name).join(', ') || '无'}`);
    console.log(`品牌: ${(p.brands || []).map(b => b.name).join(', ') || '无'}`);
    console.log(`标签: ${(p.tags || []).map(t => t.name).join(', ') || '无'}`);
    console.log(`价格: ${p.price}`);
    console.log(`图片数: ${p.images?.length || 0}, 主图: ${p.mainImage || '无'}`);
    console.log(`视频数: ${p.videos?.length || 0}`);
    console.log(`属性数: ${p.attributes?.length || 0}`);
    console.log('');
});

// 检查这些商品的媒体目录是否存在
const productsDir = path.join(__dirname, 'storefront', 'public', 'images', 'products');
const videosDir = path.join(__dirname, 'storefront', 'public', 'videos');

console.log('=== 媒体目录检查 ===\n');
noImageIds.forEach(id => {
    const imgDir = path.join(productsDir, String(id));
    const videoDir = path.join(videosDir, String(id));
    const imgExists = fs.existsSync(imgDir);
    const videoExists = fs.existsSync(videoDir);
    let imgFiles = 0;
    let videoFiles = 0;
    if (imgExists) {
        imgFiles = fs.readdirSync(imgDir).length;
    }
    if (videoExists) {
        videoFiles = fs.readdirSync(videoDir).length;
    }
    console.log(`ID:${id} - 图片目录: ${imgExists ? '存在(' + imgFiles + '个文件)' : '不存在'}, 视频目录: ${videoExists ? '存在(' + videoFiles + '个文件)' : '不存在'}`);
});

// 检查删除后对分类计数的影响
console.log('\n=== 对分类计数的影响 ===\n');
const affectedCats = new Map();
noImageIds.forEach(id => {
    const p = products.find(x => x.id === id);
    if (p && p.categories) {
        p.categories.forEach(c => {
            affectedCats.set(c.id, c.name);
        });
    }
});

console.log('受影响的分类:');
affectedCats.forEach((name, id) => {
    const cat = categories.find(c => c.id === id);
    console.log(`  ID:${id} ${name} - 当前计数: ${cat?.productCount || 'N/A'}`);
});

// 检查品牌
console.log('\n=== 对品牌的影响 ===\n');
const affectedBrands = new Map();
noImageIds.forEach(id => {
    const p = products.find(x => x.id === id);
    if (p && p.brands) {
        p.brands.forEach(b => {
            affectedBrands.set(b.id, b.name);
        });
    }
});

console.log('受影响的品牌:');
affectedBrands.forEach((name, id) => {
    const brand = brands.find(b => b.id === id);
    console.log(`  ID:${id} ${name} - 当前计数: ${brand?.productCount || 'N/A'}`);
});
