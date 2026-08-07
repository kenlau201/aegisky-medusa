const fs = require('fs');
const path = require('path');

const dataDir = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\data\\mirror';

const files = [
  'products.json',
  'products.json.bak_before_delete',
  'products.json.bak_before_full_fix',
  'products_backup_before_cleanup.json',
  'products_backup_before_image_fix.json',
];

function countProducts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch(e) {
    return { error: e.message };
  }
  
  const arr = Array.isArray(data) ? data : (data.products || data.items || data.data || []);
  if (!Array.isArray(arr)) return { error: 'not an array', keys: Object.keys(data) };
  
  const ids = new Set();
  const slugs = new Set();
  const skus = new Set();
  const dupIds = [];
  const dupSlugs = [];
  const dupSkus = [];
  
  for (const item of arr) {
    const id = item.id || item.ID || item.product_id;
    const slug = item.slug || item.permalink;
    const sku = item.sku;
    
    if (id !== undefined && id !== null) {
      if (ids.has(id)) dupIds.push(id);
      ids.add(id);
    }
    if (slug) {
      if (slugs.has(slug)) dupSlugs.push(slug);
      slugs.add(slug);
    }
    if (sku) {
      if (skus.has(sku)) dupSkus.push(sku);
      skus.add(sku);
    }
  }
  
  return {
    total: arr.length,
    uniqueIds: ids.size,
    uniqueSlugs: slugs.size,
    uniqueSkus: skus.size,
    dupIdCount: dupIds.length,
    dupSlugCount: dupSlugs.length,
    dupSkuCount: dupSkus.length,
    sampleDupIds: dupIds.slice(0, 10),
    sampleDupSlugs: dupSlugs.slice(0, 5),
  };
}

for (const f of files) {
  const fp = path.join(dataDir, f);
  if (!fs.existsSync(fp)) {
    console.log(`${f}: FILE NOT FOUND`);
    continue;
  }
  const stat = fs.statSync(fp);
  console.log(`\n=== ${f} (${(stat.size/1024/1024).toFixed(2)} MB) ===`);
  const result = countProducts(fp);
  if (result.error) {
    console.log(`  Error: ${result.error}`);
    if (result.keys) console.log(`  Keys: ${result.keys.join(', ')}`);
  } else {
    console.log(`  Total items: ${result.total}`);
    console.log(`  Unique IDs: ${result.uniqueIds}`);
    console.log(`  Unique slugs: ${result.uniqueSlugs}`);
    console.log(`  Unique SKUs: ${result.uniqueSkus}`);
    console.log(`  Duplicate IDs: ${result.dupIdCount}`, result.sampleDupIds.length ? `(samples: ${result.sampleDupIds.join(', ')})` : '');
    console.log(`  Duplicate slugs: ${result.dupSlugCount}`, result.sampleDupSlugs.length ? `(samples: ${result.sampleDupSlugs.join(', ')})` : '');
    console.log(`  Duplicate SKUs: ${result.dupSkuCount}`);
  }
}
