const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'storefront', 'src', 'app', '[lang]', 'admin');

const files = [
  path.join(baseDir, 'page.tsx'),
  path.join(baseDir, 'orders', 'page.tsx'),
  path.join(baseDir, 'orders', '[id]', 'page.tsx')
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log('Not found:', f);
    continue;
  }
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\$\{API_BASE\}\/admin\//g, '${API_BASE}/store/admin/');
  content = content.replace(/Authorization:\s*`Bearer \$\{t\}`/g, "'x-admin-token': t");
  content = content.replace(/Authorization:\s*`Bearer \$\{token\}`/g, "'x-admin-token': token");
  fs.writeFileSync(f, content);
  console.log('Updated:', f);
}
