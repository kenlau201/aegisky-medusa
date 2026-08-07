const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Export ALL categories (now only old ones remain)
  const cats = await c.query(`
    SELECT id, name, slug, parent, description, image_url, product_count, depth
    FROM aegisky_categories ORDER BY parent, product_count DESC
  `);

  const categories = cats.rows.map(r => ({
    id: r.id, name: r.name, slug: r.slug, parent: r.parent,
    description: r.description || '', image: r.image_url || '',
    productCount: r.product_count, depth: r.depth || 0
  }));

  // Write to data/mirror/categories.json
  const dataDir = path.join(__dirname, '..', '..', 'data', 'mirror');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2));
  console.log(`Exported ${categories.length} categories to data/mirror/categories.json`);

  // Write to storefront data dir
  const storefrontDataDir = path.join(__dirname, '..', '..', 'storefront', 'data');
  if (!fs.existsSync(storefrontDataDir)) fs.mkdirSync(storefrontDataDir, { recursive: true });
  fs.writeFileSync(path.join(storefrontDataDir, 'categories.json'), JSON.stringify(categories, null, 2));
  console.log(`Also written to storefront/data/categories.json`);

  // Clear legacy redirects (we're back to old categories, no redirect needed)
  const backendLibDir = path.join(__dirname, '..', 'lib');
  const legacyJs = `// Legacy category redirects - cleared (using original old categories)\nmodule.exports.LEGACY_CATEGORY_MAP = {};\n`;
  fs.writeFileSync(path.join(backendLibDir, 'legacy-redirects.js'), legacyJs);
  console.log('Cleared backend legacy-redirects.js');

  const frontendLibDir = path.join(__dirname, '..', '..', 'storefront', 'src', 'lib');
  if (!fs.existsSync(frontendLibDir)) fs.mkdirSync(frontendLibDir, { recursive: true });
  const legacyTs = `// Legacy category slug redirects - cleared (using original old categories)\nexport const LEGACY_SLUG_MAP: Record<string, string> = {};\n`;
  fs.writeFileSync(path.join(frontendLibDir, 'legacy-slugs.ts'), legacyTs);
  console.log('Cleared frontend legacy-slugs.ts');

  // Show stats
  const roots = categories.filter(c => c.parent === 0);
  console.log(`\nRoot categories: ${roots.length}`);
  console.log('Top 10 root categories by product count:');
  roots.sort((a,b) => b.productCount - a.productCount).slice(0, 10).forEach(r => {
    console.log(`  [${r.id}] ${r.name}: ${r.productCount}`);
  });

  await c.end();
  console.log('\nDone!');
})();
