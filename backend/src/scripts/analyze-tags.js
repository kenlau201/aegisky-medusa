const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });
const fs = require('fs');
const path = require('path');

(async () => {
  await c.connect();

  // Get all unique tags from products
  const res = await c.query(`
    SELECT tags FROM aegisky_products WHERE tags IS NOT NULL
  `);

  const tagMap = new Map();
  for (const row of res.rows) {
    const tagsArr = row.tags;
    if (!Array.isArray(tagsArr)) continue;
    for (const t of tagsArr) {
      const name = t.name;
      const slug = t.slug;
      if (!tagMap.has(slug)) {
        tagMap.set(slug, { id: t.id, name, slug, count: 0 });
      }
      tagMap.get(slug).count++;
    }
  }

  const tags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
  console.log(`Total unique tags: ${tags.length}`);
  console.log('\nTop 50 tags by product count:');
  tags.slice(0, 50).forEach(t => console.log(`  [${t.id}] ${t.name} (${t.slug}) - ${t.count} products`));

  // Export all tags
  const exportPath = path.join('D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa', 'data', 'mirror', 'tags.json');
  fs.writeFileSync(exportPath, JSON.stringify(tags, null, 2), 'utf8');
  console.log(`\nExported ${tags.length} tags to ${exportPath}`);

  // Also check if there's a dedicated tags table
  const tables = await c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%tag%'`);
  console.log('\nTag-related tables:', tables.rows.map(r => r.table_name));

  await c.end();
})();
