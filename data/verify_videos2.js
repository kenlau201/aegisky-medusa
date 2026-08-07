const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, 'mirror');
const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));

const allVideos = new Set();
products.forEach(p => (p.videos || []).forEach(v => allVideos.add(v)));

console.log(`Total unique video URLs: ${allVideos.size}`);

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 20000 }, (res) => {
      if (res.statusCode === 200) {
        resolve({ ok: true, size: res.headers['content-length'] });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location;
        if (loc && loc.startsWith('http')) {
          checkUrl(loc).then(resolve);
        } else {
          resolve({ ok: false, status: res.statusCode });
        }
      } else {
        resolve({ ok: false, status: res.statusCode });
      }
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    req.end();
  });
}

async function main() {
  const urls = [...allVideos];
  let ok = 0, fail = 0;
  const failed = [];
  
  for (let i = 0; i < urls.length; i += 5) {
    const batch = urls.slice(i, i + 5);
    const results = await Promise.all(batch.map(url => checkUrl(url)));
    results.forEach((r, idx) => {
      if (r.ok) ok++;
      else { fail++; failed.push({ url: batch[idx], ...r }); }
    });
    process.stdout.write(`\rProgress: ${i + batch.length}/${urls.length} (OK: ${ok}, Fail: ${fail})`);
  }
  
  console.log('\n');
  if (failed.length > 0) {
    console.log(`Failed (${failed.length}):`);
    failed.forEach(f => console.log(`  [${f.error || f.status}] ${f.url.substring(0, 90)}`));
  } else {
    console.log('✅ All videos accessible!');
  }
}

main();
