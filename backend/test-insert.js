const { Client } = require('pg');
const crypto = require('crypto');

const c = new Client({
  host: 'localhost', port: 5434, user: 'medusa',
  password: 'medusa_password', database: 'medusa-aegisky'
});

(async () => {
  await c.connect();
  try {
    const catId = crypto.randomUUID();
    await c.query(`INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, created_at, updated_at, external_id)
      VALUES ($1, '测试', 'test', 'test-cat', 'test-cat', true, false, 0, NOW(), NOW(), 'test-cat')`, [catId]);
    console.log('分类插入成功');

    const pId = crypto.randomUUID();
    await c.query(`INSERT INTO product (id, title, handle, description, status, thumbnail, is_giftcard, discountable, external_id, created_at, updated_at, metadata)
      VALUES ($1, '测试商品', 'test-product', '描述', 'draft', null, false, true, '12345', NOW(), NOW(), '{}')`, [pId]);
    console.log('商品插入成功');
  } catch (e) {
    console.error('错误:', e.message);
  }
  await c.end();
})();
