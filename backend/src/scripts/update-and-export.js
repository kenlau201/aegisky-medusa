const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // 1. Update product_count for all categories
  console.log('Updating category product counts...');
  
  // Get all categories
  const cats = await c.query('SELECT id FROM aegisky_categories');
  
  for (const cat of cats.rows) {
    // Count products that have this category in their categories array
    const result = await c.query(`
      SELECT COUNT(*) as cnt 
      FROM aegisky_products 
      WHERE categories::text LIKE $1
    `, [`%"id":${cat.id}%`]);
    const count = parseInt(result.rows[0].cnt);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2', [count, cat.id]);
  }
  console.log(`Updated ${cats.rows.length} categories.`);

  // 2. Export all products to JSON files
  console.log('Exporting products...');
  const products = await c.query('SELECT * FROM aegisky_products ORDER BY id');
  
  const exportDirs = [
    'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\data\\mirror',
    'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\storefront\\data',
    'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\backend\\data\\mirror',
  ];

  const productData = products.rows.map(p => ({
    ...p,
    categories: typeof p.categories === 'string' ? JSON.parse(p.categories) : p.categories,
    brands: typeof p.brands === 'string' ? JSON.parse(p.brands) : p.brands,
    attributes: typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    videos: typeof p.videos === 'string' ? JSON.parse(p.videos) : p.videos,
    dimensions: typeof p.dimensions === 'string' ? JSON.parse(p.dimensions) : p.dimensions,
    stock_status: typeof p.stock_status === 'string' ? JSON.parse(p.stock_status) : p.stock_status,
  }));

  for (const dir of exportDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'products.json');
    fs.writeFileSync(filePath, JSON.stringify(productData, null, 2), 'utf8');
    const stat = fs.statSync(filePath);
    console.log(`  Written: ${filePath} (${(stat.size/1024/1024).toFixed(2)} MB)`);
  }

  // 3. Final verification
  const total = await c.query('SELECT COUNT(*) as cnt FROM aegisky_products');
  const dupIds = await c.query('SELECT id FROM aegisky_products GROUP BY id HAVING COUNT(*) > 1');
  const remoteImgs = await c.query("SELECT COUNT(*) as cnt FROM aegisky_products WHERE images::text LIKE '%http%'");
  
  console.log(`\n=== Final verification ===`);
  console.log(`Total products: ${total.rows[0].cnt}`);
  console.log(`Duplicate IDs: ${dupIds.rows.length}`);
  console.log(`Remote image URLs: ${remoteImgs.rows[0].cnt}`);

  await c.end();
})();
