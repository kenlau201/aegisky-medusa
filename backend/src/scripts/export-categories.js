/**
 * Export new categories from database to data/mirror/categories.json
 * This ensures the frontend always has the correct category structure
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5434,
    user: 'medusa',
    password: 'medusa_password',
    database: 'medusa-aegisky',
  });

  await client.connect();
  
  // Export only new categories (id >= 10000)
  const result = await client.query(`
    SELECT id, name, slug, parent, depth, path, product_count, 
           children_count, description, image_url
    FROM aegisky_categories 
    WHERE id >= 10000
    ORDER BY depth ASC, product_count DESC, name ASC
  `);
  
  const categories = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    parent: row.parent,
    depth: row.depth,
    path: row.path || [],
    productCount: Number(row.product_count) || 0,
    childrenCount: Number(row.children_count) || 0,
    description: row.description || '',
    image: row.image_url || '',
  }));
  
  const outPath = path.join(__dirname, '..', '..', '..', 'data', 'mirror', 'categories.json');
  fs.writeFileSync(outPath, JSON.stringify(categories, null, 2), 'utf-8');
  
  console.log(`Exported ${categories.length} categories to ${outPath}`);
  
  // Also update brands.json just in case (keep existing)
  // And verify counts
  const topLevel = categories.filter(c => c.depth === 0);
  console.log(`Top-level categories: ${topLevel.length}`);
  topLevel.forEach(c => console.log(`  [${c.id}] ${c.name} (${c.productCount} products)`));
  
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
