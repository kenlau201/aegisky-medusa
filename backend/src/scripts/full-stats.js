const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Build category tree
  const cats = await c.query('SELECT id, name, slug, parent FROM aegisky_categories WHERE id < 10000');
  const byParent = {};
  const byId = {};
  for (const cat of cats.rows) {
    byId[cat.id] = cat;
    const p = cat.parent || 0;
    if (!byParent[p]) byParent[p] = [];
    byParent[p].push(cat.id);
  }

  // Get all category-product links from backup
  const links = await c.query('SELECT product_id, category_id FROM aegisky_product_categories_backup');
  const prodsByCat = {};
  for (const link of links.rows) {
    if (!prodsByCat[link.category_id]) prodsByCat[link.category_id] = new Set();
    prodsByCat[link.category_id].add(link.product_id);
  }

  // For each root category, collect ALL products (including children)
  function collectProducts(catId) {
    const products = new Set();
    // Direct products
    if (prodsByCat[catId]) {
      for (const pid of prodsByCat[catId]) products.add(pid);
    }
    // Children products
    const children = byParent[catId] || [];
    for (const childId of children) {
      for (const pid of collectProducts(childId)) products.add(pid);
    }
    return products;
  }

  // Identify brand children vs spec children
  function isBrandCategory(catId) {
    const cat = byId[catId];
    if (!cat) return false;
    // Brand categories are children of product types and have names that look like brands
    // They typically have many siblings (other brands)
    const siblings = byParent[cat.parent] || [];
    if (siblings.length > 5) return true; // Many siblings = brand list
    // Known non-brand subcategories
    const nonBrandKeywords = ['аксессуары', 'пропеллеры', 'лопасти', 'камеры', 'объективы', 'штативы',
      '2-лопастные', '3-лопастные', 'аккумулятор', 'зарядное'];
    const name = (cat.name || '').toLowerCase();
    for (const kw of nonBrandKeywords) {
      if (name.includes(kw)) return false;
    }
    return siblings.length > 3;
  }

  console.log('=== PRODUCT TYPE CATEGORIES WITH FULL PRODUCT COUNTS ===\n');
  const roots = byParent[0] || [];
  const productTypes = [];

  for (const rootId of roots) {
    const root = byId[rootId];
    if (!root) continue;
    const products = collectProducts(rootId);
    if (products.size === 0) continue;

    // Categorize children
    const children = byParent[rootId] || [];
    const brandChildren = [];
    const specChildren = [];
    for (const childId of children) {
      if (isBrandCategory(childId)) {
        brandChildren.push(byId[childId]);
      } else {
        specChildren.push(byId[childId]);
      }
    }

    productTypes.push({
      id: rootId,
      name: root.name,
      slug: root.slug,
      count: products.size,
      brandCount: brandChildren.length,
      specChildren: specChildren.map(s => ({ id: s.id, name: s.name, count: collectProducts(s.id).size }))
    });
  }

  productTypes.sort((a, b) => b.count - a.count);

  for (const pt of productTypes) {
    console.log(`[${pt.id}] ${pt.name} (${pt.slug})`);
    console.log(`  Total: ${pt.count} products, ${pt.brandCount} brands`);
    if (pt.specChildren.length > 0) {
      console.log(`  Subcategories:`);
      pt.specChildren.forEach(sc => {
        console.log(`    - [${sc.id}] ${sc.name}: ${sc.count} products`);
      });
    }
    console.log('');
  }

  console.log(`\nTotal product types with products: ${productTypes.length}`);
  console.log(`Total products across all: ${productTypes.reduce((s, p) => s + p.count, 0)}`);

  await c.end();
})();
