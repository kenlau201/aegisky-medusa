const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check local media directories
  const mediaRoot = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa';
  const possibleDirs = [
    path.join(mediaRoot, 'backend', 'public', 'images', 'products'),
    path.join(mediaRoot, 'public', 'images', 'products'),
    path.join(mediaRoot, 'storefront', 'public', 'images', 'products'),
    path.join(mediaRoot, 'data', 'images', 'products'),
    path.join(mediaRoot, 'media', 'products'),
  ];

  console.log('=== Checking local media directories ===');
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir);
      const dirs = entries.filter(e => fs.statSync(path.join(dir, e)).isDirectory());
      const files = entries.filter(e => fs.statSync(path.join(dir, e)).isFile());
      console.log(`  EXISTS: ${dir}`);
      console.log(`    Subdirs: ${dirs.length}, Files: ${files.length}`);
      if (dirs.length > 0 && dirs.length < 10) {
        console.log(`    Dirs: ${dirs.join(', ')}`);
      }
    } else {
      console.log(`  MISSING: ${dir}`);
    }
  }

  // Check backend public dir structure
  const pubDir = path.join(mediaRoot, 'backend', 'public');
  if (fs.existsSync(pubDir)) {
    console.log(`\n=== backend/public contents ===`);
    walkDir(pubDir, 0, 3);
  }

  // Check storefront public dir
  const sfPub = path.join(mediaRoot, 'storefront', 'public');
  if (fs.existsSync(sfPub)) {
    console.log(`\n=== storefront/public contents ===`);
    walkDir(sfPub, 0, 3);
  }

  // Check how many unique product image paths exist in DB
  const imgStats = await c.query(`
    SELECT 
      COUNT(*) as total_products,
      COUNT(*) FILTER (WHERE main_image LIKE '/images/%') as local_path,
      COUNT(*) FILTER (WHERE main_image LIKE 'http%') as remote_url,
      COUNT(*) FILTER (WHERE main_image IS NULL OR main_image = '') as no_image
    FROM aegisky_products
  `);
  console.log(`\n=== Image path stats ===`);
  console.log(`  Total products: ${imgStats.rows[0].total_products}`);
  console.log(`  Local paths: ${imgStats.rows[0].local_path}`);
  console.log(`  Remote URLs: ${imgStats.rows[0].remote_url}`);
  console.log(`  No image: ${imgStats.rows[0].no_image}`);

  // Check videos field format
  const vidSamples = await c.query(`
    SELECT id, videos FROM aegisky_products 
    WHERE videos IS NOT NULL AND videos != '' AND videos != '[]'
    LIMIT 5
  `);
  console.log(`\n=== Video samples (${vidSamples.rows.length} shown) ===`);
  for (const row of vidSamples.rows) {
    console.log(`  [${row.id}] videos: ${JSON.stringify(row.videos).substring(0, 200)}`);
  }

  // Check if any images array contains remote URLs
  const remoteInArr = await c.query(`
    SELECT COUNT(*) as cnt FROM aegisky_products 
    WHERE images::text LIKE '%http://%' OR images::text LIKE '%https://%'
  `);
  console.log(`\nProducts with remote URLs in images array: ${remoteInArr.rows[0].cnt}`);

  await c.end();
})();

function walkDir(dir, depth, maxDepth) {
  if (depth > maxDepth) return;
  const entries = fs.readdirSync(dir);
  for (const e of entries.slice(0, 20)) {
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    const indent = '  '.repeat(depth);
    if (stat.isDirectory()) {
      console.log(`${indent}[DIR] ${e}/`);
      walkDir(full, depth + 1, maxDepth);
    } else {
      console.log(`${indent}${e} (${(stat.size / 1024).toFixed(1)}KB)`);
    }
  }
}
