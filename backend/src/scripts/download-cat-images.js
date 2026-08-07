const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

const OUT_DIR = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\storefront\\public\\images\\categories';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 30000
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(new Error('timeout'));
    });
  });
}

(async () => {
  await c.connect();

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const cats = await c.query(`
    SELECT id, name, image_url FROM aegisky_categories 
    WHERE image_url IS NOT NULL AND image_url LIKE 'http%'
    ORDER BY id
  `);

  console.log(`Downloading ${cats.rows.length} category images...`);
  let ok = 0, fail = 0, skipped = 0;
  const updates = [];

  for (let i = 0; i < cats.rows.length; i++) {
    const cat = cats.rows[i];
    const url = cat.image_url;
    
    // Determine extension from URL
    let ext = '.jpg';
    const urlPath = url.split('?')[0];
    if (urlPath.endsWith('.png')) ext = '.png';
    else if (urlPath.endsWith('.webp')) ext = '.webp';
    else if (urlPath.endsWith('.gif')) ext = '.gif';
    else if (urlPath.endsWith('.svg')) ext = '.svg';
    else if (urlPath.endsWith('.jpeg')) ext = '.jpeg';
    
    const filename = `cat_${cat.id}${ext}`;
    const localPath = path.join(OUT_DIR, filename);
    const webPath = `/images/categories/${filename}`;

    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 100) {
      skipped++;
      updates.push({ id: cat.id, webPath });
      continue;
    }

    try {
      await downloadFile(url, localPath);
      const stats = fs.statSync(localPath);
      if (stats.size < 100) throw new Error('file too small');
      ok++;
      updates.push({ id: cat.id, webPath });
      if ((i+1) % 50 === 0) console.log(`  Progress: ${i+1}/${cats.rows.length} (ok: ${ok}, fail: ${fail}, skip: ${skipped})`);
    } catch (err) {
      fail++;
      console.log(`  FAIL [${cat.id}] ${cat.name.substring(0, 40)}: ${err.message}`);
    }
  }

  console.log(`\nDownload complete: ok=${ok}, fail=${fail}, skipped=${skipped}`);

  // Update database
  console.log(`\nUpdating ${updates.length} category image URLs in database...`);
  for (const u of updates) {
    await c.query('UPDATE aegisky_categories SET image_url = $1 WHERE id = $2', [u.webPath, u.id]);
  }
  console.log('Database updated.');

  // Verify
  const remaining = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_categories WHERE image_url LIKE 'http%'`);
  console.log(`Remaining remote URLs: ${remaining.rows[0].cnt}`);

  await c.end();
})();
