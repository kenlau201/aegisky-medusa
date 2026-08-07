const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  const cats = await c.query(`
    SELECT id, name, slug, parent, description, image_url, product_count, depth
    FROM aegisky_categories ORDER BY parent, product_count DESC
  `);

  const categories = cats.rows.map(r => ({
    id: r.id, name: r.name, slug: r.slug, parent: r.parent,
    description: r.description || '', image: r.image_url || '',
    productCount: r.product_count, depth: r.depth || 0
  }));

  // Write to ALL possible locations
  const paths = [
    path.join(__dirname, '..', '..', 'data', 'mirror', 'categories.json'),
    path.join(__dirname, '..', '..', 'storefront', 'data', 'categories.json'),
    path.join(__dirname, 'data', 'mirror', 'categories.json'),
  ];

  for (const p of paths) {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(categories, null, 2));
    console.log(`Wrote ${categories.length} categories to: ${p}`);
  }

  console.log(`\nTotal: ${categories.length} categories exported`);
  console.log(`Root categories (parent=0): ${categories.filter(c => c.parent === 0).length}`);

  await c.end();
})();
