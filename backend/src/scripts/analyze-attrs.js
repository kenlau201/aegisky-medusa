const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Sample attributes from a few products
  console.log('=== Sample attributes from products ===');
  const samples = await c.query(`
    SELECT id, name, attributes FROM aegisky_products 
    WHERE attributes IS NOT NULL AND attributes::text != '[]' AND attributes::text != 'null'
    LIMIT 5
  `);
  for (const row of samples.rows) {
    let attrs = row.attributes;
    if (typeof attrs === 'string') {
      try { attrs = JSON.parse(attrs); } catch(e) { attrs = []; }
    }
    console.log(`\n[${row.id}] ${row.name.substring(0, 60)}`);
    if (Array.isArray(attrs)) {
      attrs.forEach((a, i) => {
        console.log(`  ${i}: ${JSON.stringify(a).substring(0, 200)}`);
      });
    } else {
      console.log(`  type: ${typeof attrs}, value: ${JSON.stringify(attrs).substring(0, 200)}`);
    }
  }

  // Collect all unique attribute keys/names across all products
  console.log('\n=== All unique attribute names ===');
  const allAttrs = await c.query(`SELECT attributes FROM aegisky_products WHERE attributes IS NOT NULL`);
  const attrNames = new Map(); // name -> { values: Set, count }
  for (const row of allAttrs.rows) {
    let attrs = row.attributes;
    if (typeof attrs === 'string') {
      try { attrs = JSON.parse(attrs); } catch(e) { continue; }
    }
    if (!Array.isArray(attrs)) continue;
    for (const a of attrs) {
      const name = a.name || a.key || a.attribute_name;
      const value = a.value || a.option || a.option_value;
      if (!name) continue;
      if (!attrNames.has(name)) {
        attrNames.set(name, { values: new Set(), count: 0 });
      }
      const entry = attrNames.get(name);
      entry.count++;
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => entry.values.add(String(v)));
        } else {
          entry.values.add(String(value));
        }
      }
    }
  }

  // Sort by count
  const sorted = [...attrNames.entries()].sort((a, b) => b[1].count - a[1].count);
  console.log(`Total unique attribute names: ${sorted.length}`);
  for (const [name, info] of sorted.slice(0, 40)) {
    console.log(`  "${name}": ${info.count} products, ${info.values.size} unique values`);
    if (info.values.size <= 10) {
      console.log(`    Values: ${[...info.values].slice(0, 10).join(', ')}`);
    }
  }

  // Check brands in a specific category (military drones example)
  console.log('\n=== Attributes for military drone category ===');
  const milCat = await c.query(`
    SELECT id FROM aegisky_categories WHERE slug = 'российские-военные-дроны' OR name ILIKE '%военн%дрон%' LIMIT 5
  `);
  if (milCat.rows.length > 0) {
    const catId = milCat.rows[0].id;
    console.log(`Category: ${milCat.rows[0].id} - ${milCat.rows[0].name}`);
    const prods = await c.query(`
      SELECT id, name, attributes, price, brands FROM aegisky_products
      WHERE categories::text LIKE $1
    `, [`%"id":${catId}%`]);
    console.log(`Products in this category: ${prods.rows.length}`);
    
    const catAttrs = new Map();
    const catBrands = new Map();
    let minPrice = Infinity, maxPrice = 0;
    for (const p of prods.rows) {
      if (p.price) {
        minPrice = Math.min(minPrice, Number(p.price));
        maxPrice = Math.max(maxPrice, Number(p.price));
      }
      // Brands
      let brands = p.brands;
      if (typeof brands === 'string') try { brands = JSON.parse(brands); } catch(e) { brands = []; }
      if (Array.isArray(brands)) {
        brands.forEach(b => {
          const bname = b.name || b;
          catBrands.set(bname, (catBrands.get(bname) || 0) + 1);
        });
      }
      // Attributes
      let attrs = p.attributes;
      if (typeof attrs === 'string') try { attrs = JSON.parse(attrs); } catch(e) { attrs = []; }
      if (Array.isArray(attrs)) {
        attrs.forEach(a => {
          const name = a.name || a.key;
          const value = a.value || a.option;
          if (!name) return;
          if (!catAttrs.has(name)) catAttrs.set(name, new Map());
          const valMap = catAttrs.get(name);
          const valStr = Array.isArray(value) ? value.join(', ') : String(value);
          valMap.set(valStr, (valMap.get(valStr) || 0) + 1);
        });
      }
    }
    console.log(`Price range: ${minPrice} - ${maxPrice}`);
    console.log(`Brands: ${catBrands.size}`);
    [...catBrands.entries()].sort((a,b)=>b[1]-a[1]).forEach(([n,c]) => console.log(`  ${n}: ${c}`));
    console.log(`Attributes:`);
    for (const [name, vals] of catAttrs) {
      console.log(`  "${name}": ${vals.size} values`);
      for (const [val, cnt] of [...vals.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 8)) {
        console.log(`    "${val}": ${cnt}`);
      }
    }
  } else {
    console.log('Military drone category not found by slug, listing top categories...');
    const top = await c.query(`SELECT id, name, slug, product_count FROM aegisky_categories WHERE product_count > 10 ORDER BY product_count DESC LIMIT 10`);
    top.rows.forEach(r => console.log(`  [${r.id}] ${r.name} (${r.product_count}) slug: ${r.slug}`));
  }

  await c.end();
})();
