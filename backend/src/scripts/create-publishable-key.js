const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
  host: 'localhost',
  port: 5434,
  user: 'medusa',
  password: 'medusa_password',
  database: 'medusa-aegisky'
});

async function main() {
  await client.connect();
  
  // 先验证商品数
  const productCount = await client.query('SELECT COUNT(*) as count FROM product WHERE external_id IS NOT NULL');
  console.log('✅ 数据库商品数:', productCount.rows[0].count);
  
  const categoryCount = await client.query('SELECT COUNT(*) as count FROM product_category');
  console.log('✅ 数据库分类数:', categoryCount.rows[0].count);
  
  const imageCount = await client.query('SELECT COUNT(*) as count FROM image');
  console.log('✅ 数据库图片数:', imageCount.rows[0].count);
  
  // 创建publishable API key
  const keyId = crypto.randomUUID();
  const token = 'pk_' + crypto.randomBytes(32).toString('hex');
  
  await client.query(`
    INSERT INTO api_key (id, token, created_by, type, title, created_at, updated_at, revoked_at)
    VALUES ($1, $2, NULL, 'publishable', 'Storefront Key', NOW(), NOW(), NULL)
  `, [keyId, token]);
  
  console.log('');
  console.log('✅ Publishable API Key 创建成功!');
  console.log('   Key ID:', keyId);
  console.log('   Token:', token);
  console.log('');
  console.log('前端使用时在header中添加:');
  console.log('   x-publishable-api-key: ' + token);
  
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
