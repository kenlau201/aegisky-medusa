const fs = require('fs');
const path = require('path');

const brandsDir = 'D:/项目备份/Aegisky-Medusa/aegisky-medusa/storefront/public/images/brands';
const localBrands = JSON.parse(fs.readFileSync('D:/项目备份/Aegisky-Medusa/aegisky-medusa/data/mirror/brands.json', 'utf8'));
const sourceRaw = fs.readFileSync(process.env.TEMP + '/brand_logos.json', 'utf8').replace(/^\uFEFF/, '');
const sourceLogos = JSON.parse(sourceRaw);

const files = fs.readdirSync(brandsDir);
const fileMap = {};
for (const f of files) {
  const ext = path.extname(f);
  const base = path.basename(f, ext).toLowerCase();
  fileMap[base] = f;
}

const mapping = {};
let matched = 0;
for (const lb of localBrands) {
  const slug = lb.slug.toLowerCase();
  if (fileMap[slug]) {
    mapping[slug] = fileMap[slug];
    matched++;
    continue;
  }
  // Try name match
  let found = null;
  for (const sl of sourceLogos) {
    const slKey = sl.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (fileMap[slKey] && (sl.name.toLowerCase() === lb.name.toLowerCase() || slKey === slug)) {
      found = fileMap[slKey];
      break;
    }
  }
  if (found) {
    mapping[slug] = found;
    matched++;
  }
}

// Manual overrides
mapping['bc'] = 'b-c.png';
mapping['aegisky'] = 'aegisky.svg';

fs.writeFileSync(
  'D:/项目备份/Aegisky-Medusa/aegisky-medusa/storefront/src/lib/brand-logos.json',
  JSON.stringify(mapping, null, 2)
);
console.log('Matched:', matched, '/', localBrands.length);
console.log('Mapping entries:', Object.keys(mapping).length);
