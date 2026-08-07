const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // 1. List all categories with 0 or very few products
  console.log('=== CATEGORIES WITH < 3 PRODUCTS ===\n');
  const lowCount = await c.query(`
    SELECT id, name, slug, parent, product_count
    FROM aegisky_categories WHERE id >= 10000 AND product_count < 3
    ORDER BY parent, id
  `);
  for (const cat of lowCount.rows) {
    console.log(`  [${cat.id}] ${cat.name}: ${cat.product_count} (parent: ${cat.parent})`);
  }

  // 2. Find military drones with thermal imaging
  console.log('\n=== MILITARY DRONES WITH THERMAL (for 10121) ===');
  const thermalMil = await c.query(`
    SELECT id, name, price FROM aegisky_products
    WHERE (
      name ILIKE '%теплов%' OR name ILIKE '%thermal%' OR
      name ILIKE '%теплови%' OR name ILIKE '%развед%' OR
      name ILIKE '%охран%' OR name ILIKE '%наблюд%'
    )
    AND (
      categories @> '[{"id": 10004}]'::jsonb OR
      categories @> '[{"id": 10074}]'::jsonb OR
      categories @> '[{"id": 10011}]'::jsonb
    )
    ORDER BY price DESC NULLS LAST
    LIMIT 20
  `);
  for (const p of thermalMil.rows) {
    console.log(`  [${p.id}] ${(p.name||'').substring(0, 80)} - ${p.price ? (p.price/100).toFixed(0) : 'N/A'}₽`);
  }

  // 3. Check what's in Russian-Made Drones that should be in Military
  console.log('\n=== RUSSIAN-MADE DRONES (98 products) - sample by price ===');
  const rusDrones = await c.query(`
    SELECT id, name, price, categories FROM aegisky_products
    WHERE categories @> '[{"id": 10004}]'::jsonb
    ORDER BY price DESC NULLS LAST
  `);
  console.log(`Total: ${rusDrones.rows.length}`);
  // Categorize by price/name
  let milCount = 0, civCount = 0;
  for (const p of rusDrones.rows) {
    const name = (p.name||'').toLowerCase();
    const isMil = name.includes('удар') || name.includes('боеприпас') || name.includes('гранат') ||
                  name.includes('воен') || name.includes('камикад') || name.includes('barrage') ||
                  name.includes('грузовик') || name.includes('лифт') || name.includes('cp') ||
                  name.includes('fh-x') || name.includes('fyxl') || name.includes('трос') ||
                  name.includes('привяз') || name.includes('робот-собак') || name.includes('робот собак') ||
                  name.includes('крылат') || name.includes('dlm') || name.includes('dhf') ||
                  (p.price && p.price/100 > 100000); // > 100000₽ = likely military/industrial
    if (isMil) milCount++;
  }
  console.log(`  Likely military/industrial: ${milCount}`);
  console.log(`  Likely civilian: ${rusDrones.rows.length - milCount}`);

  // 4. Check Thermal Imaging Drones (10011) - 24 products
  console.log('\n=== THERMAL IMAGING DRONES (10011) ===');
  const thermalDrones = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10011}]'::jsonb
    LIMIT 10
  `);
  for (const p of thermalDrones.rows) {
    console.log(`  [${p.id}] ${(p.name||'').substring(0, 70)}`);
  }

  // 5. Check what products are ONLY in Misc (10073)
  console.log('\n=== PRODUCTS IN MISCELLANEOUS (10073) ===');
  const misc = await c.query(`
    SELECT id, name FROM aegisky_products
    WHERE categories @> '[{"id": 10073}]'::jsonb
    AND NOT categories @> '[{"id": 10072}]'::jsonb
  `);
  console.log(`Count: ${misc.rows.length}`);
  for (const p of misc.rows.slice(0, 13)) {
    console.log(`  [${p.id}] ${(p.name||'').substring(0, 70)}`);
  }

  await c.end();
})();
