const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  const imgRoot = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\storefront\\public\\images\\products';
  const vidRoot = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\storefront\\public\\videos';

  // 1. Check image completeness
  const products = await c.query(`SELECT id, main_image, images FROM aegisky_products ORDER BY id`);
  
  let missingImgDirs = [];
  let missingMainImgs = [];
  let totalImgs = 0;
  let existingImgs = 0;

  for (const p of products.rows) {
    const prodDir = path.join(imgRoot, String(p.id));
    if (!fs.existsSync(prodDir)) {
      missingImgDirs.push(p.id);
    } else {
      // Check main_image
      if (p.main_image) {
        const mainFile = path.join(imgRoot, String(p.id), path.basename(p.main_image));
        totalImgs++;
        if (fs.existsSync(mainFile)) existingImgs++;
        else missingMainImgs.push({ id: p.id, file: p.main_image });
      }
      // Check all images
      let imgs;
      try { imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; } catch(e) { imgs = []; }
      if (Array.isArray(imgs)) {
        for (const img of imgs) {
          const imgPath = typeof img === 'string' ? img : (img.src || img.url || '');
          if (imgPath && imgPath.startsWith('/images/')) {
            totalImgs++;
            const localFile = path.join(imgRoot, String(p.id), path.basename(imgPath));
            if (fs.existsSync(localFile)) existingImgs++;
          }
        }
      }
    }
  }

  console.log('=== Image Completeness ===');
  console.log(`Total products: ${products.rows.length}`);
  console.log(`Products with missing image dirs: ${missingImgDirs.length}`);
  if (missingImgDirs.length > 0 && missingImgDirs.length <= 20) {
    console.log(`  Missing dirs: ${missingImgDirs.join(', ')}`);
  } else if (missingImgDirs.length > 20) {
    console.log(`  First 20: ${missingImgDirs.slice(0, 20).join(', ')}...`);
  }
  console.log(`Total image references: ${totalImgs}`);
  console.log(`Existing files: ${existingImgs}`);
  console.log(`Missing files: ${totalImgs - existingImgs}`);

  // 2. Check videos
  console.log('\n=== Video Completeness ===');
  const vidResult = await c.query(`SELECT id, videos FROM aegisky_products WHERE videos IS NOT NULL AND videos != '' AND videos != '[]'`);
  console.log(`Products with video references: ${vidResult.rows.length}`);
  
  let missingVidDirs = [];
  let totalVids = 0;
  let existingVids = 0;

  for (const p of vidResult.rows) {
    let vids;
    try { 
      if (typeof p.videos === 'string') vids = JSON.parse(p.videos);
      else vids = p.videos;
    } catch(e) { 
      // Try treating as string path
      if (typeof p.videos === 'string' && p.videos.startsWith('/videos/')) {
        vids = [p.videos];
      } else {
        vids = [];
      }
    }
    if (!Array.isArray(vids)) vids = [];
    
    const prodVidDir = path.join(vidRoot, String(p.id));
    if (vids.length > 0 && !fs.existsSync(prodVidDir)) {
      missingVidDirs.push(p.id);
    }
    
    for (const v of vids) {
      const vidPath = typeof v === 'string' ? v : (v.src || v.url || '');
      if (vidPath && vidPath.startsWith('/videos/')) {
        totalVids++;
        const localFile = path.join('D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\storefront\\public', vidPath);
        if (fs.existsSync(localFile)) existingVids++;
      }
    }
  }
  console.log(`Products with missing video dirs: ${missingVidDirs.length}`);
  console.log(`Total video references: ${totalVids}`);
  console.log(`Existing video files: ${existingVids}`);
  console.log(`Missing video files: ${totalVids - existingVids}`);

  // 3. Check brand logos
  console.log('\n=== Brand Logos ===');
  const brands = await c.query(`SELECT id, name, logo_url FROM aegisky_brands WHERE logo_url IS NOT NULL AND logo_url != ''`);
  console.log(`Brands with logo_url: ${brands.rows.length}`);
  let remoteBrandLogos = 0;
  let localBrandLogos = 0;
  for (const b of brands.rows) {
    if (b.logo_url.startsWith('http')) remoteBrandLogos++;
    else localBrandLogos++;
  }
  console.log(`  Remote URLs: ${remoteBrandLogos}`);
  console.log(`  Local paths: ${localBrandLogos}`);
  if (remoteBrandLogos > 0) {
    const samples = brands.rows.filter(b => b.logo_url.startsWith('http')).slice(0, 5);
    samples.forEach(s => console.log(`    [${s.id}] ${s.name}: ${s.logo_url.substring(0, 100)}`));
  }

  // 4. Check category images
  console.log('\n=== Category Images ===');
  const cats = await c.query(`SELECT id, name, image_url FROM aegisky_categories WHERE image_url IS NOT NULL AND image_url != ''`);
  console.log(`Categories with image_url: ${cats.rows.length}`);
  let remoteCatImgs = 0;
  let localCatImgs = 0;
  for (const cat of cats.rows) {
    if (cat.image_url.startsWith('http')) remoteCatImgs++;
    else localCatImgs++;
  }
  console.log(`  Remote URLs: ${remoteCatImgs}`);
  console.log(`  Local paths: ${localCatImgs}`);
  if (remoteCatImgs > 0) {
    const samples = cats.rows.filter(c => c.image_url.startsWith('http')).slice(0, 5);
    samples.forEach(s => console.log(`    [${s.id}] ${s.name}: ${s.image_url.substring(0, 100)}`));
  }

  // 5. Check description for remote URLs
  console.log('\n=== Remote URLs in product descriptions ===');
  const descRemote = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE description LIKE '%http://%' OR description LIKE '%https://%'`);
  console.log(`Products with remote URLs in description: ${descRemote.rows[0].cnt}`);

  await c.end();
})();
