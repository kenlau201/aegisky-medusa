const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Check permalink
  const pl = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE permalink ILIKE '%copterparts%'`);
  console.log('permalink with copterparts:', pl.rows[0].cnt);

  // Check JSONB fields
  const jb = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products
    WHERE categories::text ILIKE '%copterparts%'
       OR brands::text ILIKE '%copterparts%'
       OR tags::text ILIKE '%copterparts%'
       OR attributes::text ILIKE '%copterparts%'`);
  console.log('JSONB fields with copterparts:', jb.rows[0].cnt);

  // Samples
  const s1 = await c.query(`SELECT id, permalink FROM aegisky_products WHERE permalink ILIKE '%copterparts%' LIMIT 2`);
  s1.rows.forEach(r => console.log(`  permalink [${r.id}]: ${r.permalink?.substring(0, 100)}`));

  const s2 = await c.query(`SELECT id, brands::text as b FROM aegisky_products WHERE brands::text ILIKE '%copterparts%' LIMIT 2`);
  s2.rows.forEach(r => console.log(`  brands [${r.id}]: ${r.b?.substring(0, 200)}`));

  const s3 = await c.query(`SELECT id, categories::text as cat FROM aegisky_products WHERE categories::text ILIKE '%copterparts%' LIMIT 2`);
  s3.rows.forEach(r => console.log(`  categories [${r.id}]: ${r.cat?.substring(0, 200)}`));

  // Now fix all JSONB fields and permalink
  console.log('\n--- Fixing ---');

  // Fix permalink
  const r1 = await c.query(`
    UPDATE aegisky_products SET
      permalink = REPLACE(REPLACE(permalink, 'https://copterparts.ru', 'https://aegisky.com'), 'http://copterparts.ru', 'https://aegisky.com')
    WHERE permalink ILIKE '%copterparts%'
  `);
  console.log(`permalink updated: ${r1.rowCount}`);

  // Fix brands JSONB - replace 'Copterparts' name with 'Aegisky'
  const r2 = await c.query(`
    UPDATE aegisky_products SET brands = REPLACE(brands::text, 'Copterparts', 'Aegisky')::jsonb
    WHERE brands::text ILIKE '%copterparts%'
  `);
  console.log(`brands JSONB updated: ${r2.rowCount}`);

  // Fix categories JSONB
  const r3 = await c.query(`
    UPDATE aegisky_products SET categories = REPLACE(categories::text, 'Copterparts', 'Aegisky')::jsonb
    WHERE categories::text ILIKE '%copterparts%'
  `);
  console.log(`categories JSONB updated: ${r3.rowCount}`);

  // Fix tags JSONB
  const r4 = await c.query(`
    UPDATE aegisky_products SET tags = REPLACE(REPLACE(tags::text, 'Copterparts', 'Aegisky'), 'copterparts', 'aegisky')::jsonb
    WHERE tags::text ILIKE '%copterparts%'
  `);
  console.log(`tags JSONB updated: ${r4.rowCount}`);

  // Fix attributes JSONB - replace all case variants
  const r5 = await c.query(`
    UPDATE aegisky_products SET attributes = REGEXP_REPLACE(attributes::text, 'copterparts', 'aegisky', 'gi')::jsonb
    WHERE attributes::text ILIKE '%copterparts%'
  `);
  console.log(`attributes JSONB updated: ${r5.rowCount}`);

  // Also fix categories table name/slug if needed
  const r6 = await c.query(`
    UPDATE aegisky_categories SET
      name = REGEXP_REPLACE(name, 'copterparts', 'Aegisky', 'gi'),
      slug = REGEXP_REPLACE(slug, 'copterparts', 'aegisky', 'gi'),
      path = REGEXP_REPLACE(path::text, 'copterparts', 'aegisky', 'gi')::jsonb
    WHERE name ILIKE '%copterparts%' OR slug ILIKE '%copterparts%'
  `);
  console.log(`categories table updated: ${r6.rowCount}`);

  // Verify
  const v1 = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE permalink ILIKE '%copterparts%'`);
  const v2 = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products
    WHERE categories::text ILIKE '%copterparts%' OR brands::text ILIKE '%copterparts%'
       OR tags::text ILIKE '%copterparts%' OR attributes::text ILIKE '%copterparts%'
       OR description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%'`);
  console.log(`\nAfter fix - permalink: ${v1.rows[0].cnt}, all product fields: ${v2.rows[0].cnt}`);

  await c.end();
})();
