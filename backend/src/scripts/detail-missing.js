const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  const origFile = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\data\\mirror\\products_backup_before_cleanup.json';
  const origData = JSON.parse(fs.readFileSync(origFile, 'utf8'));
  const origArr = Array.isArray(origData) ? origData : [];
  const origMap = new Map(origArr.map(p => [Number(p.id), p]));

  const missingIds = [75763, 63439, 63147, 63139, 63131, 63123, 26064, 25583, 8522];
  const keptDupIds = [63146, 63138, 63127, 63122]; // the ones kept for duplicate SKUs

  console.log('=== Detailed info for 9 missing products ===\n');
  for (const id of missingIds) {
    const p = origMap.get(id);
    if (!p) { console.log(`[${id}] NOT FOUND in original`); continue; }
    console.log(`[${id}] ${p.name}`);
    console.log(`  SKU: ${p.sku || 'none'}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Price: ${p.price || 'none'} (regular: ${p.regular_price || 'none'}, sale: ${p.sale_price || 'none'})`);
    console.log(`  Type: ${p.type || 'none'}`);
    console.log(`  In stock: ${p.in_stock}, stock_status: ${p.stock_status}`);
    console.log(`  Images: ${Array.isArray(p.images) ? p.images.length : (p.images || 0)}`);
    console.log(`  Categories: ${JSON.stringify(p.categories).substring(0, 150)}`);
    console.log(`  Permalink: ${p.permalink}`);
    console.log();
  }

  console.log('\n=== Kept duplicate products (should be in DB) ===\n');
  for (const id of keptDupIds) {
    const dbResult = await c.query('SELECT id, name, sku, slug, price FROM aegisky_products WHERE id = $1', [id]);
    if (dbResult.rows.length > 0) {
      const p = dbResult.rows[0];
      console.log(`[${p.id}] ${p.name} | SKU: ${p.sku} | price: ${p.price}`);
    } else {
      console.log(`[${id}] NOT IN DB EITHER!`);
    }
    const orig = origMap.get(id);
    if (orig) {
      console.log(`  Original slug: ${orig.slug}, images: ${Array.isArray(orig.images) ? orig.images.length : '?'}`);
    }
  }

  // Check: are there other products with same names as the 5 non-dup missing ones?
  console.log('\n=== Check if 5 non-dup missing products exist under different IDs ===\n');
  const nonDupMissing = [75763, 63439, 26064, 25583, 8522];
  for (const id of nonDupMissing) {
    const p = origMap.get(id);
    if (!p) continue;
    const searchName = p.name.replace(/\(.*?\)/g, '').trim().substring(0, 40);
    const found = await c.query("SELECT id, name, sku FROM aegisky_products WHERE name ILIKE $1 LIMIT 5", [`%${searchName}%`]);
    console.log(`[${id}] "${p.name.substring(0, 60)}"`);
    if (found.rows.length > 0) {
      found.rows.forEach(r => console.log(`  -> DB has [${r.id}] ${r.name.substring(0, 60)} (SKU: ${r.sku})`));
    } else {
      console.log(`  -> NO similar product in DB`);
    }
  }

  await c.end();
})();
