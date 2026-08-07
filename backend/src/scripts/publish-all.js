const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5434, user: 'medusa', password: 'medusa_password', database: 'medusa-aegisky' });

(async () => {
  await client.connect();
  
  // 将所有商品改为已发布
  const result = await client.query("UPDATE product SET status = 'published' WHERE status = 'draft'");
  console.log('已发布商品数:', result.rowCount);
  
  const published = await client.query("SELECT COUNT(*) FROM product WHERE status = 'published'");
  console.log('当前已发布商品:', published.rows[0].count);
  
  // 同时更新变体状态
  await client.query("UPDATE product_variant SET status = 'published' WHERE status = 'draft'");
  console.log('已更新商品变体状态');
  
  await client.end();
  console.log('✅ 所有商品已发布，后台可见');
})();
