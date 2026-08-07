const { Client } = require('pg');
const fs = require('fs');
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

  const base = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa';
  const paths = [
    `${base}\\data\\mirror\\categories.json`,
    `${base}\\storefront\\data\\categories.json`,
    `${base}\\backend\\data\\mirror\\categories.json`,
  ];

  for (const p of paths) {
    const dir = p.substring(0, p.lastIndexOf('\\'));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(categories, null, 2));
    console.log(`Wrote ${categories.length} categories to: ${p}`);
  }

  await c.end();
  console.log('Done!');
})();
