const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });
const fs = require('fs');
const path = require('path');

(async () => {
  await c.connect();

  // Check aegisky_tags table structure
  const cols = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'aegisky_tags'`);
  console.log('aegisky_tags columns:', cols.rows.map(r => `${r.column_name}(${r.data_type})`).join(', '));

  // Get all tags from the dedicated table
  const allTags = await c.query(`SELECT * FROM aegisky_tags ORDER BY id`);
  console.log(`\nTotal tags in aegisky_tags: ${allTags.rows.length}`);
  allTags.rows.forEach(t => {
    console.log(`  [${t.id}] ${t.name} (${t.slug}) - ${t.description ? t.description.substring(0, 80) : 'no desc'}`);
  });

  // Count products per tag from product_tags junction
  const counts = await c.query(`
    SELECT t.id, t.name, t.slug, COUNT(pt.product_id) as product_count
    FROM aegisky_tags t
    LEFT JOIN product_tags pt ON t.id = pt.tag_id
    GROUP BY t.id, t.name, t.slug
    ORDER BY product_count DESC
  `);
  console.log('\nProduct counts per tag:');
  counts.rows.forEach(r => console.log(`  [${r.id}] ${r.name} (${r.slug}): ${r.product_count} products`));

  // Export full tags with counts
  const exportData = counts.rows.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    count: parseInt(r.product_count)
  }));
  fs.writeFileSync(
    path.join('D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa', 'data', 'mirror', 'tags.json'),
    JSON.stringify(exportData, null, 2),
    'utf8'
  );
  console.log(`\nExported ${exportData.length} tags`);

  await c.end();
})();
