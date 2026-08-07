const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Count products with remote URLs in images
  const total = await c.query('SELECT COUNT(*) as cnt FROM aegisky_products');
  console.log(`Total products: ${total.rows[0].cnt}`);

  // Sample some images to see URL patterns
  const samples = await c.query(`
    SELECT id, name, images, main_image 
    FROM aegisky_products 
    WHERE images IS NOT NULL AND images != '[]'::jsonb
    LIMIT 5
  `);

  console.log('\n=== Sample image URLs ===');
  for (const row of samples.rows) {
    console.log(`\n[${row.id}] ${row.name.substring(0, 60)}`);
    console.log(`  main_image: ${row.main_image}`);
    const imgs = row.images;
    if (Array.isArray(imgs)) {
      imgs.slice(0, 3).forEach(img => {
        console.log(`  img: ${typeof img === 'string' ? img : JSON.stringify(img).substring(0, 120)}`);
      });
    }
  }

  // Count remote vs local
  const remote = await c.query(`
    SELECT COUNT(*) as cnt 
    FROM aegisky_products 
    WHERE images::text LIKE '%http://%' OR images::text LIKE '%https://%'
  `);
  console.log(`\nProducts with remote URLs: ${remote.rows[0].cnt}`);

  // Check video URLs
  const withVideos = await c.query(`
    SELECT COUNT(*) as cnt FROM aegisky_products 
    WHERE videos IS NOT NULL AND videos != '[]'::jsonb AND videos != ''
  `);
  console.log(`Products with videos: ${withVideos.rows[0].cnt}`);

  // Domain distribution
  const domains = await c.query(`
    SELECT DISTINCT substring(images::text from 'https?://([^/"]+)') as domain, COUNT(*) as cnt
    FROM aegisky_products
    WHERE images::text LIKE '%http%'
    GROUP BY domain ORDER BY cnt DESC
  `);
  console.log('\n=== Domain distribution ===');
  for (const d of domains.rows) {
    console.log(`  ${d.domain}: ${d.cnt} products`);
  }

  // Check brand/category images too
  const catImgs = await c.query(`
    SELECT COUNT(*) as cnt FROM aegisky_categories 
    WHERE image_url IS NOT NULL AND image_url != '' AND image_url LIKE 'http%'
  `);
  console.log(`\nCategories with remote images: ${catImgs.rows[0].cnt}`);

  const brandImgs = await c.query(`
    SELECT COUNT(*) as cnt FROM aegisky_brands 
    WHERE logo_url IS NOT NULL AND logo_url != '' AND logo_url LIKE 'http%'
  `);
  console.log(`Brands with remote logos: ${brandImgs.rows[0].cnt}`);

  await c.end();
})();
