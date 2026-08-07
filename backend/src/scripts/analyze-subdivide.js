const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Get all new categories with product counts
  const cats = await c.query(`
    SELECT id, name, slug, parent, product_count
    FROM aegisky_categories WHERE id >= 10000
    ORDER BY parent, id
  `);

  // For each leaf category, sample product names to find subdivision patterns
  const leafCats = cats.rows.filter(cat => {
    return !cats.rows.some(c => c.parent === cat.id);
  });

  console.log('=== LEAF CATEGORIES WITH PRODUCT SAMPLES ===\n');

  for (const cat of leafCats) {
    if (cat.product_count < 30) continue; // Only analyze categories with enough products

    const products = await c.query(`
      SELECT id, name FROM aegisky_products
      WHERE categories @> '[{"id": ${cat.id}}]'::jsonb
      ORDER BY id
    `);

    // Analyze name patterns for subdivision
    const names = products.rows.map(p => p.name || '');

    // Look for common keywords
    const keywords = {};
    const patterns = [
      // Motor specs
      { pattern: /\b\d{4}\b/, label: 'size_XXXX' },  // 2207, 2814 etc
      { pattern: /\b\d{2,3}\d{2}\b.*kv/i, label: 'with_KV' },
      // ESC specs
      { pattern: /\b\d{1,2}s\b/i, label: 'S_battery' },  // 4S, 6S
      { pattern: /\b\d{2,3}a\b/i, label: 'amp_rating' },  // 40A, 80A
      // Propeller specs
      { pattern: /\b\d{2,3}[x×*]\d{1,2}\b/, label: 'prop_size' },  // 5x4, 10x5
      { pattern: /\b(cw|ccw)\b/i, label: 'rotation' },
      // FPV
      { pattern: /\b\d{1,2}\.?\d{0,2}g\b/i, label: 'freq_GHz' },  // 5.8G, 1.2G
      { pattern: /\b\d{3,4}mw\b/i, label: 'power_mW' },  // 200mW, 800mW
      // Battery
      { pattern: /\b\d{3,5}mah\b/i, label: 'capacity_mAh' },
      { pattern: /\b\d{1,2}s\b.*\d{3,4}mah/i, label: 'LiPo_spec' },
      // Camera
      { pattern: /\b4k\b/i, label: '4K' },
      { pattern: /\b1080p\b/i, label: '1080p' },
      { pattern: /\bhd\b/i, label: 'HD' },
      // Generic
      { pattern: /комплект|kit|set|набор/i, label: 'Kit_Set' },
      { pattern: /запчасти|часть|spare|part/i, label: 'Spare_Parts' },
      { pattern: /аксессуар|accessor/i, label: 'Accessory' },
    ];

    for (const p of patterns) {
      const matches = names.filter(n => p.pattern.test(n));
      if (matches.length >= 10 && matches.length < names.length * 0.9) {
        if (!keywords[p.label]) keywords[p.label] = matches.length;
      }
    }

    if (Object.keys(keywords).length > 0) {
      console.log(`[${cat.id}] ${cat.name} (${cat.product_count} products)`);
      for (const [kw, count] of Object.entries(keywords).sort((a,b) => b[1]-a[1])) {
        console.log(`  ${kw}: ${count}`);
      }
      // Show a few sample names
      console.log('  Samples:', names.slice(0, 3).map(n => n.substring(0, 50)).join(' | '));
      console.log();
    }
  }

  // Also check: what products are in Russian-Made Drones?
  console.log('\n=== RUSSIAN-MADE DRONES (military candidates) ===');
  const milProducts = await c.query(`
    SELECT id, name, price FROM aegisky_products
    WHERE categories @> '[{"id": 10004}]'::jsonb
    ORDER BY price DESC NULLS LAST
    LIMIT 30
  `);
  for (const p of milProducts.rows) {
    console.log(`  [${p.id}] ${(p.name||'').substring(0, 70)} - ${p.price ? (p.price/100).toFixed(0) : 'N/A'}₽`);
  }

  await c.end();
})();
