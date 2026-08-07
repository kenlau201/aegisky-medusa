const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Update product_count for all new categories to include children
  // First, get the tree structure
  const cats = await c.query('SELECT id, parent FROM aegisky_categories WHERE id >= 10000');
  const byParent = {};
  const byId = {};
  for (const row of cats.rows) {
    byId[row.id] = row;
    const p = row.parent || 0;
    if (!byParent[p]) byParent[p] = [];
    byParent[p].push(row.id);
  }

  // Calculate total (with children) for each category
  function getTotal(id) {
    let total = 0;
    // Direct products
    const direct = c.query(`
      SELECT COUNT(DISTINCT p.id) as cnt FROM aegisky_products p
      WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS cat WHERE (cat->>'id')::int = $1)
    `, [id]);
    return direct.then(r => {
      total = parseInt(r.rows[0].cnt);
      const children = byParent[id] || [];
      return Promise.all(children.map(ch => getTotal(ch))).then(childTotals => {
        childTotals.forEach(ct => total += ct);
        return total;
      });
    });
  }

  // Update all categories
  let updated = 0;
  for (const id of Object.keys(byId).map(Number)) {
    const total = await getTotal(id);
    await c.query('UPDATE aegisky_categories SET product_count = $1 WHERE id = $2', [total, id]);
    updated++;
    if (updated % 20 === 0) console.log(`Updated ${updated}/${cats.rows.length}...`);
  }

  console.log(`Updated ${updated} categories`);

  // Also set old categories product_count to 0
  const oldResult = await c.query('UPDATE aegisky_categories SET product_count = 0 WHERE id < 10000');
  console.log(`Reset ${oldResult.rowCount} old categories to 0`);

  await c.end();
  console.log('Done!');
})();
