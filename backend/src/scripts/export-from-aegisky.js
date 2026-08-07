const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 源数据库配置（现有Aegisky数据库）
const sourceConfig = {
  host: 'localhost',
  port: 5433,
  user: 'aegisky',
  password: 'aegisky_password',
  database: 'aegisky'
};

async function exportData() {
  console.log('🚀 开始从Aegisky数据库导出数据...');
  
  const client = new Client(sourceConfig);
  await client.connect();
  console.log('✅ 连接源数据库成功');

  const outputDir = path.join(__dirname, '../../data/export');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. 导出品牌
  console.log('\n📦 导出品牌数据...');
  const brandsResult = await client.query(`
    SELECT id, name, slug, description, logo, website, 
           country, "isVerified" as verified, "createdAt", "updatedAt"
    FROM "Brand"
    ORDER BY name
  `);
  fs.writeFileSync(
    path.join(outputDir, 'brands.json'),
    JSON.stringify(brandsResult.rows, null, 2)
  );
  console.log(`✅ 导出 ${brandsResult.rows.length} 个品牌`);

  // 2. 导出分类
  console.log('\n📂 导出分类数据...');
  const categoriesResult = await client.query(`
    SELECT id, name, slug, description, "parentId", icon, 
           "sortOrder", "createdAt", "updatedAt"
    FROM "Category"
    ORDER BY name
  `);
  fs.writeFileSync(
    path.join(outputDir, 'categories.json'),
    JSON.stringify(categoriesResult.rows, null, 2)
  );
  console.log(`✅ 导出 ${categoriesResult.rows.length} 个分类`);

  // 3. 导出商品（基础信息）
  console.log('\n🛒 导出商品数据...');
  const productsResult = await client.query(`
    SELECT p.id, p.name, p.slug, p.description, p."shortDesc", p.sku,
           p."priceMin", p."priceMax", p.stock, p.moq,
           p."brandId", p."categoryId", p.status, p."viewCount",
           p."createdAt", p."updatedAt",
           b.name as "brandName", c.name as "categoryName"
    FROM "Product" p
    LEFT JOIN "Brand" b ON p."brandId" = b.id
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    ORDER BY p.name
  `);
  fs.writeFileSync(
    path.join(outputDir, 'products.json'),
    JSON.stringify(productsResult.rows, null, 2)
  );
  console.log(`✅ 导出 ${productsResult.rows.length} 个商品`);

  // 4. 从商品表提取图片
  console.log('\n🖼️  提取商品图片...');
  const imagesResult = await client.query(`
    SELECT id, images
    FROM "Product"
    WHERE images IS NOT NULL
  `);
  
  const allImages = [];
  for (const product of imagesResult.rows) {
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((url, index) => {
        allImages.push({
          productId: product.id,
          url: url,
          position: index,
          isPrimary: index === 0
        });
      });
    }
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'product_images.json'),
    JSON.stringify(allImages, null, 2)
  );
  console.log(`✅ 提取 ${allImages.length} 张商品图片`);

  await client.end();

  console.log('\n🎉 数据导出完成！文件保存在 data/export 目录');
  console.log(`📊 总统计: ${brandsResult.rows.length} 品牌, ${categoriesResult.rows.length} 分类, ${productsResult.rows.length} 商品, ${imagesResult.rows.length} 图片`);
}

exportData().catch(console.error);
