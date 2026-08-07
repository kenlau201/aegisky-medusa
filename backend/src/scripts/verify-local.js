const {Client}=require('pg');
const c=new Client({connectionString:'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky'});
(async()=>{
  await c.connect();
  const r1=await c.query("SELECT COUNT(*) as cnt FROM aegisky_products WHERE images::text LIKE '%http%'");
  const r2=await c.query("SELECT COUNT(*) as cnt FROM aegisky_categories WHERE image_url LIKE 'http%'");
  const r3=await c.query("SELECT COUNT(*) as cnt FROM aegisky_brands WHERE logo_url LIKE 'http%'");
  console.log('Remote URLs in products.images:', r1.rows[0].cnt);
  console.log('Remote URLs in categories.image_url:', r2.rows[0].cnt);
  console.log('Remote URLs in brands.logo_url:', r3.rows[0].cnt);
  await c.end();
})();
