const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check how many categories each product belongs to
  const stats = await c.query(`
    SELECT 
      jsonb_array_length(categories) as cat_count,
      COUNT(*) as product_count
    FROM aegisky_products
    GROUP BY jsonb_array_length(categories)
    ORDER BY cat_count
  `);

  console.log('Products by number of categories:');
  for (const row of stats.rows) {
    console.log(`  ${row.cat_count} categories: ${row.product_count} products`);
  }

  // Check for products in too many categories (possible duplication)
  const dupes = await c.query(`
    SELECT id, name, jsonb_array_length(categories) as cnt
    FROM aegisky_products
    WHERE jsonb_array_length(categories) > 10
    ORDER BY cnt DESC LIMIT 10
  `);
  if (dupes.rows.length > 0) {
    console.log('\nProducts with >10 categories (checking for duplication):');
    for (const row of dupes.rows) {
      console.log(`  [${row.id}] ${row.name.substring(0, 50)}: ${row.cnt} categories`);
    }
  } else {
    console.log('\nNo products with >10 categories - no duplication!');
  }

  // Verify no new categories remain
  const newCats = await c.query('SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id >= 10000');
  console.log(`\nNew categories (id>=10000) remaining: ${newCats.rows[0].cnt}`);

  // Verify total
  const total = await c.query('SELECT COUNT(*) as cnt FROM aegisky_categories');
  console.log(`Total categories: ${total.rows[0].cnt}`);

  // Sample product categories
  const sample = await c.query(`SELECT id, name, categories FROM aegisky_products WHERE id = 17101`);
  if (sample.rows[0]) {
    console.log(`\nSample product [${sample.rows[0].id}] ${sample.rows[0].name}:`);
    for (const cat of sample.rows[0].categories) {
      console.log(`  - [${cat.id}] ${cat.name} (${cat.slug})`);
    }
  }

  await c.end();
})();
