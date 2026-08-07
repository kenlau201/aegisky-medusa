const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // 1. Get all IDs from current DB
  const dbResult = await c.query('SELECT id, name, sku, slug FROM aegisky_products ORDER BY id');
  const dbIds = new Set(dbResult.rows.map(r => Number(r.id)));
  const dbMap = new Map(dbResult.rows.map(r => [Number(r.id), r]));
  console.log(`DB products: ${dbIds.size}`);

  // 2. Get all IDs from original backup (6384)
  const origFile = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\data\\mirror\\products_backup_before_cleanup.json';
  const origContent = fs.readFileSync(origFile, 'utf8');
  const origData = JSON.parse(origContent);
  const origArr = Array.isArray(origData) ? origData : (origData.products || origData.items || []);
  const origIds = new Set(origArr.map(p => Number(p.id)));
  const origMap = new Map(origArr.map(p => [Number(p.id), p]));
  console.log(`Original products: ${origIds.size}`);

  // 3. Find missing in DB
  const missingInDb = [...origIds].filter(id => !dbIds.has(id));
  console.log(`\n=== Products in original but MISSING from DB (${missingInDb.length}) ===`);
  for (const id of missingInDb) {
    const p = origMap.get(id);
    console.log(`  [${id}] ${(p.name || '').substring(0, 80)} | sku: ${p.sku || 'none'} | slug: ${p.slug || 'none'}`);
  }

  // 4. Find extra in DB (shouldn't be any)
  const extraInDb = [...dbIds].filter(id => !origIds.has(id));
  console.log(`\n=== Products in DB but NOT in original (${extraInDb.length}) ===`);
  for (const id of extraInDb) {
    const p = dbMap.get(id);
    console.log(`  [${id}] ${p.name.substring(0, 80)}`);
  }

  // 5. Check duplicate SKUs in original
  const skuMap = new Map();
  for (const p of origArr) {
    if (p.sku) {
      if (!skuMap.has(p.sku)) skuMap.set(p.sku, []);
      skuMap.get(p.sku).push(p.id);
    }
  }
  const dupSkus = [...skuMap.entries()].filter(([_, ids]) => ids.length > 1);
  console.log(`\n=== Duplicate SKUs in original data (${dupSkus.length}) ===`);
  for (const [sku, ids] of dupSkus) {
    console.log(`  SKU "${sku}": IDs ${ids.join(', ')}`);
    for (const id of ids) {
      const p = origMap.get(Number(id));
      console.log(`    [${id}] ${(p.name || '').substring(0, 70)}`);
    }
  }

  // 6. Check current products.json vs DB
  const currentFile = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\data\\mirror\\products.json';
  const currentData = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
  const currentArr = Array.isArray(currentData) ? currentData : (currentData.products || []);
  const currentIds = new Set(currentArr.map(p => Number(p.id)));
  console.log(`\n=== Current products.json: ${currentIds.size} products ===`);
  
  const missingInJson = [...dbIds].filter(id => !currentIds.has(id));
  const extraInJson = [...currentIds].filter(id => !dbIds.has(id));
  console.log(`  In DB but not in JSON: ${missingInJson.length}`);
  console.log(`  In JSON but not in DB: ${extraInJson.length}`);
  if (extraInJson.length > 0) {
    for (const id of extraInJson.slice(0, 10)) {
      const p = currentArr.find(x => Number(x.id) === id);
      console.log(`    [${id}] ${(p?.name || '').substring(0, 70)}`);
    }
  }

  // 7. Check if the 9 missing products have image directories (orphan files)
  const imgRoot = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\storefront\\public\\images\\products';
  console.log(`\n=== Orphan image dirs for missing products ===`);
  for (const id of missingInDb) {
    const dir = path.join(imgRoot, String(id));
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      console.log(`  [${id}] HAS image dir with ${files.length} files: ${files.join(', ')}`);
    } else {
      console.log(`  [${id}] no image dir`);
    }
  }

  await c.end();
})();
