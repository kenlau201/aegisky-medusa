const { Client } = require('pg');
const crypto = require('crypto');

const c = new Client({
  host: 'localhost', port: 5434, user: 'medusa',
  password: 'medusa_password', database: 'medusa-aegisky'
});

(async () => {
  await c.connect();
  try {
    const prod = await c.query("SELECT id FROM product LIMIT 1");
    const productId = prod.rows[0].id;
    console.log('商品ID:', productId);

    const imgId = crypto.randomUUID();
    const url = '/api/media/images_original/123/gallery_0.jpg';
    console.log('插入图片URL:', url, '长度:', url.length);

    await c.query(
      `INSERT INTO image (id, url, product_id, rank, created_at, updated_at) VALUES ($1, $2, $3, 0, NOW(), NOW())`,
      [imgId, url, productId]
    );
    console.log('图片插入成功');

    const count = await c.query('SELECT COUNT(*) as c FROM image');
    console.log('总图片数:', count.rows[0].c);

  } catch (e) {
    console.error('错误:', e.message);
  }
  await c.end();
})();
