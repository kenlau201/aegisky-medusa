const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Get all categories and build parent chain
  const allCatsResult = await c.query('SELECT id, name, slug, parent FROM aegisky_categories WHERE id >= 10000');
  const parentOf = {};
  const catInfoMap = {};
  for (const cat of allCatsResult.rows) {
    parentOf[cat.id] = cat.parent;
    catInfoMap[cat.id] = cat;
  }

  function getAllParents(catId) {
    const parents = [];
    let p = parentOf[catId];
    while (p && p > 0) {
      parents.push(p);
      p = parentOf[p];
    }
    return parents;
  }

  // Get all products
  const products = await c.query('SELECT id, categories FROM aegisky_products');
  let fixed = 0;

  for (const product of products.rows) {
    const cats = product.categories || [];
    const catIds = cats.map(c => c.id);
    const allIds = new Set(catIds);

    // Add all parent categories
    for (const cid of catIds) {
      for (const pid of getAllParents(cid)) {
        allIds.add(pid);
      }
    }

    // If we added new parent IDs, update the product
    if (allIds.size !== catIds.length) {
      // Build full category objects
      const newCats = [];
      for (const cid of [...allIds].sort((a,b) => a-b)) {
        const info = catInfoMap[cid];
        if (info) {
          newCats.push({ id: cid, name: info.name, slug: info.slug });
        }
      }

      await c.query('UPDATE aegisky_products SET categories = $1::jsonb WHERE id = $2',
        [JSON.stringify(newCats), product.id]);
      fixed++;
    }
  }

  console.log(`Fixed parent chain for ${fixed} products`);

  // Update all product counts
  console.log('Updating product counts...');
  const allCatsForCount = await c.query('SELECT id FROM aegisky_categories WHERE id >= 10000');
  for (const cat of allCatsForCount.rows) {
    const count = await c.query(`
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS c WHERE (c->>'id')::int = $1)
    `, [cat.id]);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2',
      [parseInt(count.rows[0].cnt), cat.id]);
  }

  // Print tree
  console.log('\n=== FINAL CATEGORY TREE ===\n');
  const treeResult = await c.query(`
    SELECT id, name, parent, product_count FROM aegisky_categories WHERE id >= 10000 ORDER BY parent, id
  `);
  function printTree(parentId, depth) {
    const children = treeResult.rows.filter(c => c.parent === parentId);
    for (const child of children) {
      console.log(`${'  '.repeat(depth)}[${child.id}] ${child.name}: ${child.product_count}`);
      printTree(child.id, depth + 1);
    }
  }
  printTree(0, 0);

  // Stats
  const total = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_products WHERE jsonb_array_length(categories) > 0`);
  const zeroCats = await c.query(`SELECT COUNT(*) as cnt FROM aegisky_categories WHERE id >= 10000 AND product_count = 0`);
  console.log(`\nProducts with categories: ${total.rows[0].cnt}`);
  console.log(`Categories with 0 products: ${zeroCats.rows[0].cnt}`);

  await c.end();
})();
