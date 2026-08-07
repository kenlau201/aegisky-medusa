const { Client } = require('pg');
const crypto = require('crypto');

const c = new Client({
  host: 'localhost', port: 5434, user: 'medusa',
  password: 'medusa_password', database: 'medusa-aegisky'
});

(async () => {
  await c.connect();
  try {
    // 找一个商品
    const prod = await c.query("SELECT id FROM product LIMIT 1");
    const productId = prod.rows[0].id;
    console.log('测试商品ID:', productId);

    // 插入option
    const optionId = crypto.randomUUID();
    await c.query(
      `INSERT INTO product_option (id, title, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`,
      [optionId, 'Test-Option']
    );
    console.log('option插入成功');

    await c.query(
      'INSERT INTO product_product_option (product_id, product_option_id) VALUES ($1, $2)',
      [productId, optionId]
    );
    console.log('product_option关联成功');

    const optionValueId = crypto.randomUUID();
    await c.query(
      `INSERT INTO product_option_value (id, value, option_id, created_at, updated_at, rank)
       VALUES ($1, 'Default', $2, NOW(), NOW(), 0)`,
      [optionValueId, optionId]
    );
    console.log('option_value插入成功');

    // 变体
    const variantId = crypto.randomUUID();
    await c.query(
      `INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, variant_rank, created_at, updated_at)
       VALUES ($1, 'Default', 'TEST-SKU', $2, false, true, 0, NOW(), NOW())`,
      [variantId, productId]
    );
    console.log('variant插入成功');

    // 图片
    const imgId = crypto.randomUUID();
    await c.query(
      `INSERT INTO image (id, url, product_id, rank, created_at, updated_at) VALUES ($1, $2, $3, 0, NOW(), NOW())`,
      [imgId, '/api/media/test.jpg', productId]
    );
    console.log('image插入成功');

  } catch (e) {
    console.error('错误:', e.message, e.stack);
  }
  await c.end();
})();
