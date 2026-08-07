const { Client } = require('pg');
const fs = require('fs');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Get ALL categories (both old and new)
  const all = await c.query(`
    SELECT id, name, slug, parent, description, product_count
    FROM aegisky_categories
    ORDER BY parent, id
  `);

  // Build tree
  const byId = {};
  const byParent = {};
  for (const row of all.rows) {
    byId[row.id] = { ...row, children: [] };
    const p = row.parent || 0;
    if (!byParent[p]) byParent[p] = [];
    byParent[p].push(row.id);
  }

  // Count actual products per category (from products table, not product_count)
  const prodCounts = {};
  const prods = await c.query(`
    SELECT id, categories FROM aegisky_products WHERE jsonb_array_length(categories) > 0
  `);
  for (const p of prods.rows) {
    for (const cat of p.categories) {
      const cid = parseInt(cat.id);
      prodCounts[cid] = (prodCounts[cid] || 0) + 1;
    }
  }

  // Print tree recursively
  function printTree(id, depth) {
    const node = byId[id];
    if (!node) return;
    const actualCount = prodCounts[id] || 0;
    const indent = '  '.repeat(depth);
    const isNew = id >= 10000 ? '[NEW]' : '[OLD]';
    console.log(`${indent}${isNew} [${id}] ${node.name} (slug: ${node.slug}, actual: ${actualCount}, stored: ${node.product_count})`);
    const children = byParent[id] || [];
    for (const cid of children) {
      printTree(cid, depth + 1);
    }
  }

  // Print root categories (parent=0)
  console.log('=== ROOT CATEGORIES (parent=0) ===\n');
  const roots = byParent[0] || [];
  for (const rid of roots) {
    printTree(rid, 0);
  }

  // Stats
  const oldCats = all.rows.filter(r => r.id < 10000);
  const newCats = all.rows.filter(r => r.id >= 10000);
  const oldWithProducts = oldCats.filter(c => (prodCounts[c.id] || 0) > 0);

  console.log('\n=== STATS ===');
  console.log(`Total categories: ${all.rows.length}`);
  console.log(`Old categories (id<10000): ${oldCats.length}`);
  console.log(`Old categories with products: ${oldWithProducts.length}`);
  console.log(`New categories (id>=10000): ${newCats.length}`);
  console.log(`Root categories: ${roots.length}`);

  // Export old categories as JSON for analysis
  const oldTree = [];
  for (const rid of roots.filter(id => id < 10000)) {
    function buildNode(id) {
      const node = byId[id];
      if (!node) return null;
      return {
        id: node.id,
        name: node.name,
        slug: node.slug,
        productCount: prodCounts[id] || 0,
        children: (byParent[id] || []).map(buildNode).filter(Boolean)
      };
    }
    oldTree.push(buildNode(rid));
  }

  fs.writeFileSync('D:/项目备份/Aegisky-Medusa/aegisky-medusa/data/mirror/old-category-tree.json',
    JSON.stringify(oldTree, null, 2));
  console.log('\nOld category tree exported to data/mirror/old-category-tree.json');

  await c.end();
})();
