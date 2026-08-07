const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Fix product names
  const r1 = await c.query(`
    UPDATE aegisky_products SET name = REPLACE(name, 'COPTERPARTS', 'AEGISKY')
    WHERE name ILIKE '%copterparts%'
  `);
  console.log(`Product names updated: ${r1.rowCount}`);

  // Fix categories JSONB - replace all occurrences of copterparts in the JSON text
  const r2 = await c.query(`
    UPDATE aegisky_products SET categories = REGEXP_REPLACE(categories::text, 'copterparts', 'aegisky', 'gi')::jsonb
    WHERE categories::text ILIKE '%copterparts%'
  `);
  console.log(`Categories JSONB updated: ${r2.rowCount}`);

  // Also fix attributes JSONB (some may have brand attribute with Copterparts value)
  const r3 = await c.query(`
    UPDATE aegisky_products SET attributes = REGEXP_REPLACE(attributes::text, 'copterparts', 'aegisky', 'gi')::jsonb
    WHERE attributes::text ILIKE '%copterparts%'
  `);
  console.log(`Attributes JSONB updated: ${r3.rowCount}`);

  // Final verification
  const total = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products
    WHERE name ILIKE '%copterparts%' OR description ILIKE '%copterparts%'
       OR short_description ILIKE '%copterparts%' OR permalink ILIKE '%copterparts%'
       OR categories::text ILIKE '%copterparts%' OR brands::text ILIKE '%copterparts%'
       OR tags::text ILIKE '%copterparts%' OR attributes::text ILIKE '%copterparts%'`);
  console.log(`\nTotal remaining in products: ${total.rows[0].cnt}`);

  // Check categories table
  const cat = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_categories WHERE name ILIKE '%copterparts%' OR slug ILIKE '%copterparts%' OR description ILIKE '%copterparts%'`);
  console.log(`Remaining in categories: ${cat.rows[0].cnt}`);

  // Check brands table
  const br = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_brands WHERE name ILIKE '%copterparts%' OR slug ILIKE '%copterparts%'`);
  console.log(`Remaining in brands: ${br.rows[0].cnt}`);

  await c.end();
})();
