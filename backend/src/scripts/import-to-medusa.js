const fs = require('fs');
const path = require('path');

// Medusa API配置
const MEDUSA_API = process.env.MEDUSA_API || 'http://localhost:9000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aegisky.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

const DATA_DIR = path.join(__dirname, '../../data/export');

async function medusaFetch(endpoint, options = {}) {
  const url = `${MEDUSA_API}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }
  
  return response.json();
}

async function login() {
  console.log('🔐 登录Medusa管理后台...');
  try {
    const result = await medusaFetch('/auth/user/emailpass', {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    console.log('✅ 登录成功');
    return result.token;
  } catch (e) {
    console.log('⚠️  登录失败，尝试先创建管理员...');
    // 首次运行需要创建管理员，等Medusa启动后会自动创建，这里重试
    await new Promise(r => setTimeout(r, 5000));
    return login();
  }
}

async function importCategories(token, categories) {
  console.log(`\n📂 开始导入 ${categories.length} 个分类...`);
  
  // Medusa需要先创建父分类，再创建子分类
  // 先创建没有parentId的顶级分类
  const rootCategories = categories.filter(c => !c.parentId);
  const childCategories = categories.filter(c => c.parentId);
  
  let success = 0;
  let failed = 0;
  
  // 创建分类ID映射，保存旧ID到新ID
  const categoryMap = new Map();
  
  // 先创建顶级分类
  for (const cat of rootCategories) {
    try {
      const result = await medusaFetch('/admin/product-categories', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: cat.name,
          description: cat.description || '',
          is_active: true,
          is_internal: false,
          handle: cat.slug,
          rank: cat.sortOrder || 0
        })
      });
      categoryMap.set(cat.id, result.product_category.id);
      success++;
      if (success % 100 === 0) console.log(`  进度: ${success}/${categories.length}`);
    } catch (e) {
      console.log(`  ❌ 分类 ${cat.name} 导入失败:`, e.message);
      failed++;
    }
  }
  
  // 再创建子分类（多轮，直到所有都创建）
  let remaining = [...childCategories];
  let rounds = 0;
  while (remaining.length > 0 && rounds < 10) {
    const nextRound = [];
    for (const cat of remaining) {
      if (categoryMap.has(cat.parentId)) {
        try {
          const result = await medusaFetch('/admin/product-categories', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name: cat.name,
              description: cat.description || '',
              is_active: true,
              is_internal: false,
              handle: cat.slug,
              rank: cat.sortOrder || 0,
              parent_category_id: categoryMap.get(cat.parentId)
            })
          });
          categoryMap.set(cat.id, result.product_category.id);
          success++;
          if (success % 100 === 0) console.log(`  进度: ${success}/${categories.length}`);
        } catch (e) {
          console.log(`  ❌ 子分类 ${cat.name} 导入失败:`, e.message);
          failed++;
        }
      } else {
        nextRound.push(cat);
      }
    }
    remaining = nextRound;
    rounds++;
  }
  
  console.log(`✅ 分类导入完成: 成功 ${success}, 失败 ${failed}`);
  return categoryMap;
}

async function importProducts(token, products, images, categoryMap) {
  console.log(`\n🛒 开始导入 ${products.length} 个商品...`);
  
  // 按productId分组图片
  const imagesByProduct = new Map();
  for (const img of images) {
    if (!imagesByProduct.has(img.productId)) {
      imagesByProduct.set(img.productId, []);
    }
    imagesByProduct.get(img.productId).push(img.url);
  }
  
  let success = 0;
  let failed = 0;
  
  for (const product of products) {
    try {
      const productImages = imagesByProduct.get(product.id) || [];
      // 主图
      const thumbnail = productImages[0] || '';
      
      const payload = {
        title: product.name,
        subtitle: product.shortDesc || '',
        description: product.description || '',
        handle: product.slug,
        is_giftcard: false,
        status: 'published',
        thumbnail: thumbnail,
        images: productImages.slice(0, 10), // Medusa默认最多10张图
        categories: categoryMap.has(product.categoryId) ? 
          [{ id: categoryMap.get(product.categoryId) }] : [],
        options: [
          {
            title: 'Default',
            values: ['Default']
          }
        ],
        variants: [
          {
            title: 'Default',
            sku: product.sku,
            prices: [
              {
                amount: Math.round(parseFloat(product.priceMin || product.priceMax || 0) * 100), // 美分
                currency_code: 'usd'
              }
            ],
            inventory_quantity: product.stock || 0,
            manage_inventory: false,
            options: {
              Default: 'Default'
            }
          }
        ],
        // 品牌放在metadata里
        metadata: {
          brand: product.brandName || '',
          brand_id: product.brandId || '',
          moq: product.moq || 1,
          original_id: product.id
        }
      };
      
      await medusaFetch('/admin/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      success++;
      if (success % 500 === 0) {
        console.log(`  进度: ${success}/${products.length} (${Math.round(success/products.length*100)}%)`);
      }
    } catch (e) {
      failed++;
      if (failed <= 10) {
        console.log(`  ❌ 商品 ${product.name?.substring(0, 50)} 导入失败:`, e.message.substring(0, 200));
      }
    }
  }
  
  console.log(`✅ 商品导入完成: 成功 ${success}, 失败 ${failed}`);
}

async function main() {
  console.log('🚀 开始Aegisky全量数据导入到Medusa...\n');
  
  // 读取数据
  console.log('📖 读取导出数据...');
  const brands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json')));
  const categories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json')));
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json')));
  const images = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'product_images.json')));
  console.log(`📊 数据统计: ${brands.length} 品牌, ${categories.length} 分类, ${products.length} 商品, ${images.length} 图片\n`);
  
  // 登录
  const token = await login();
  
  // 导入分类
  const categoryMap = await importCategories(token, categories);
  
  // 导入商品
  await importProducts(token, products, images, categoryMap);
  
  console.log('\n🎉 全量数据导入完成！');
  console.log(`📍 管理后台: ${MEDUSA_API}/app`);
  console.log(`👤 管理员: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main().catch(console.error);
