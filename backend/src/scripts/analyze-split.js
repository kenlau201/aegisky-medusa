const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // 1. Find military category
  const mil = await c.query(`SELECT id, name, slug, parent FROM aegisky_categories WHERE name ILIKE '%военн%' OR slug ILIKE '%военн%'`);
  console.log('=== Military categories ===');
  for (const r of mil.rows) console.log(`  [${r.id}] ${r.name} (${r.slug}) parent=${r.parent}`);

  // 2. Find products in military category from backup
  if (mil.rows.length > 0) {
    const milIds = mil.rows.map(r => r.id);
    const prods = await c.query(`
      SELECT p.id, p.name, p.price, p.categories
      FROM aegisky_products p
      WHERE p.id IN (SELECT product_id FROM aegisky_product_categories_backup WHERE category_id = ANY($1))
      ORDER BY p.price DESC NULLS LAST
    `, [milIds]);
    console.log(`\n=== Military products: ${prods.rows.length} ===`);
    for (const p of prods.rows.slice(0, 20)) {
      console.log(`  [${p.id}] ${p.name?.substring(0, 70)} - ${p.price}₽`);
    }
  }

  // 3. Check distribution of products in top new categories for sub-categorization
  console.log('\n=== Product count by new category (for further splitting) ===');
  const dist = await c.query(`
    SELECT c.id, c.name, c.parent, c.product_count
    FROM aegisky_categories c
    WHERE c.id >= 10000
    ORDER BY c.product_count DESC
  `);
  for (const r of dist.rows) {
    if (r.product_count >= 100) {
      console.log(`  [${r.id}] ${r.name}: ${r.product_count} (parent=${r.parent})`);
    }
  }

  // 4. Sample product names in big categories to identify sub-categories
  const bigCats = [
    { id: 10015, name: 'Brushless Motors' },
    { id: 10016, name: 'ESC' },
    { id: 10049, name: 'Batteries' },
    { id: 10023, name: 'Flight Controllers' },
    { id: 10030, name: 'VTX' },
    { id: 10028, name: 'Receivers' },
    { id: 10029, name: 'Antennas' },
    { id: 10050, name: 'Chargers' },
  ];

  for (const cat of bigCats) {
    const samples = await c.query(`
      SELECT name FROM aegisky_products
      WHERE categories @> $1::jsonb
      ORDER BY RANDOM()
      LIMIT 15
    `, [JSON.stringify([{ id: cat.id }])]);
    console.log(`\n--- ${cat.name} samples ---`);
    for (const s of samples.rows) {
      console.log(`  ${s.name?.substring(0, 80)}`);
    }
  }

  await c.end();
})();
