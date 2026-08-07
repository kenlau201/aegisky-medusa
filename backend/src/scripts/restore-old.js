const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  console.log('=== RESTORING OLD CATEGORY STRUCTURE ===\n');

  // 1. Get all old categories (id < 10000) with their info
  const oldCats = await c.query(`
    SELECT id, name, slug, parent FROM aegisky_categories WHERE id < 10000
  `);
  const catMap = {};
  for (const cat of oldCats.rows) {
    catMap[cat.id] = { id: cat.id, name: cat.name, slug: cat.slug, parent: cat.parent };
  }
  console.log(`Loaded ${oldCats.rows.length} old categories`);

  // 2. Get all backup category assignments
  const backup = await c.query(`SELECT product_id, category_id FROM aegisky_product_categories_backup`);
  console.log(`Loaded ${backup.rows.length} backup assignments`);

  // Group by product
  const productCats = {};
  for (const row of backup.rows) {
    if (!productCats[row.product_id]) productCats[row.product_id] = new Set();
    // Add the category and all parent categories
    let cid = row.category_id;
    while (cid && catMap[cid]) {
      productCats[row.product_id].add(cid);
      cid = catMap[cid].parent;
    }
  }

  // 3. Update each product's categories field
  console.log('\nRestoring products...');
  let updated = 0;
  for (const [pid, catIds] of Object.entries(productCats)) {
    const cats = [];
    for (const cid of [...catIds].sort((a,b) => a-b)) {
      if (catMap[cid]) {
        cats.push({ id: cid, name: catMap[cid].name, slug: catMap[cid].slug });
      }
    }
    await c.query('UPDATE aegisky_products SET categories = $1::jsonb WHERE id = $2',
      [JSON.stringify(cats), parseInt(pid)]);
    updated++;
  }
  console.log(`Updated ${updated} products`);

  // 4. For products not in backup, clear their categories (or keep empty)
  const allProducts = await c.query('SELECT id FROM aegisky_products');
  let cleared = 0;
  for (const p of allProducts.rows) {
    if (!productCats[p.id]) {
      await c.query('UPDATE aegisky_products SET categories = $1::jsonb WHERE id = $2',
        ['[]', p.id]);
      cleared++;
    }
  }
  console.log(`Cleared categories for ${cleared} products not in backup`);

  // 5. Delete all new categories (id >= 10000)
  console.log('\nDeleting new categories (id >= 10000)...');
  const deleted = await c.query('DELETE FROM aegisky_categories WHERE id >= 10000');
  console.log(`Deleted ${deleted.rowCount} new categories`);

  // 6. Update product counts for old categories
  console.log('\nUpdating product counts...');
  for (const cat of oldCats.rows) {
    const count = await c.query(`
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(p.categories) AS c
        WHERE (c->>'id')::int = $1
      )
    `, [cat.id]);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2',
      [parseInt(count.rows[0].cnt), cat.id]);
  }

  // 7. Verify
  console.log('\n=== VERIFICATION ===');
  const totalCats = await c.query('SELECT COUNT(*) as cnt FROM aegisky_categories');
  const totalProducts = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE jsonb_array_length(categories) > 0`);
  console.log(`Total categories: ${totalCats.rows[0].cnt}`);
  console.log(`Products with categories: ${totalProducts.rows[0].cnt}`);

  // Show root categories
  console.log('\nRoot categories (parent=0) with products:');
  const roots = await c.query(`
    SELECT id, name, slug, product_count FROM aegisky_categories 
    WHERE parent = 0 AND product_count > 0
    ORDER BY product_count DESC LIMIT 20
  `);
  for (const r of roots.rows) {
    console.log(`  [${r.id}] ${r.name}: ${r.product_count} (${r.slug})`);
  }

  await c.end();
  console.log('\n=== RESTORATION COMPLETE ===');
})();
