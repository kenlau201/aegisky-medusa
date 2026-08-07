// 删除5个无图商品并更新相关数据
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'mirror');
const productsPath = path.join(DATA_DIR, 'products.json');
const categoriesPath = path.join(DATA_DIR, 'categories.json');
const brandsPath = path.join(DATA_DIR, 'brands.json');

const deleteIds = new Set([75763, 63439, 26064, 25583, 8522]);

console.log('=== 删除5个无图商品 ===\n');

// 1. 读取数据
let products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
let categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
let brands = JSON.parse(fs.readFileSync(brandsPath, 'utf-8'));

console.log(`删除前商品数: ${products.length}`);

// 2. 备份
fs.writeFileSync(productsPath + '.bak_before_delete', JSON.stringify(products, null, 2));
fs.writeFileSync(categoriesPath + '.bak_before_delete', JSON.stringify(categories, null, 2));
fs.writeFileSync(brandsPath + '.bak_before_delete', JSON.stringify(brands, null, 2));
console.log('已备份原始数据');

// 3. 找出受影响的分类和品牌
const affectedCatIds = new Set();
const affectedBrandIds = new Set();

products.forEach(p => {
    if (deleteIds.has(p.id)) {
        (p.categories || []).forEach(c => affectedCatIds.add(c.id));
        (p.brands || []).forEach(b => affectedBrandIds.add(b.id));
    }
});

console.log('\n受影响的分类:', [...affectedCatIds].map(id => {
    const c = categories.find(x => x.id === id);
    return `${c.name}(${id})`;
}).join(', '));

console.log('受影响的品牌:', [...affectedBrandIds].map(id => {
    const b = brands.find(x => x.id === id);
    return `${b.name}(${id})`;
}).join(', '));

// 4. 删除商品
const beforeCount = products.length;
products = products.filter(p => !deleteIds.has(p.id));
console.log(`\n删除后商品数: ${products.length} (删除了${beforeCount - products.length}个)`);

// 5. 重新计算分类递归计数
function getAllChildIds(catId, allCats) {
    const ids = new Set([catId]);
    allCats.filter(c => c.parent === catId).forEach(child => {
        getAllChildIds(child.id, allCats).forEach(id => ids.add(id));
    });
    return ids;
}

console.log('\n更新分类计数...');
categories.forEach(c => {
    const allIds = getAllChildIds(c.id, categories);
    const newCount = products.filter(p =>
        (p.categories || []).some(cat => allIds.has(cat.id))
    ).length;
    if (c.productCount !== newCount) {
        console.log(`  ${c.name}: ${c.productCount} -> ${newCount}`);
        c.productCount = newCount;
    }
});

// 6. 更新品牌计数
console.log('\n更新品牌计数...');
brands.forEach(b => {
    const newCount = products.filter(p =>
        (p.brands || []).some(brand => brand.id === b.id)
    ).length;
    if (b.productCount !== newCount) {
        console.log(`  ${b.name}: ${b.productCount} -> ${newCount}`);
        b.productCount = newCount;
    }
});

// 7. 保存
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
fs.writeFileSync(brandsPath, JSON.stringify(brands, null, 2));

console.log('\n✅ 数据已保存');

// 8. 删除空目录
const productsDir = path.join(__dirname, 'storefront', 'public', 'images', 'products');
let deletedDirs = 0;

deleteIds.forEach(id => {
    const dir = path.join(productsDir, String(id));
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        if (files.length === 0) {
            fs.rmdirSync(dir);
            deletedDirs++;
            console.log(`已删除空目录: ${dir}`);
        } else {
            // 删除目录中的所有文件
            files.forEach(f => fs.unlinkSync(path.join(dir, f)));
            fs.rmdirSync(dir);
            deletedDirs++;
            console.log(`已删除目录及${files.length}个文件: ${dir}`);
        }
    }
});

console.log(`\n共删除${deletedDirs}个媒体目录`);

// 9. 验证
console.log('\n=== 验证结果 ===');
console.log(`商品总数: ${products.length}`);

const remaining = products.filter(p => deleteIds.has(p.id));
console.log(`残留的被删除商品: ${remaining.length}`);

// 验证无图商品
const stillNoImg = products.filter(p =>
    !p.mainImage || p.mainImage.includes('placeholder')
);
console.log(`使用占位图的商品: ${stillNoImg.length}`);
if (stillNoImg.length > 0) {
    stillNoImg.forEach(p => console.log(`  ID:${p.id} - ${p.name}`));
} else {
    console.log('✅ 所有商品都有真实图片！');
}
