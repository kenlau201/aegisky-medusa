const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  // Get direct product count for each new category in one query
  const result = await c.query(`
    SELECT
      cat.id, cat.name, cat.slug, cat.parent, cat.depth,
      cat.product_count as stored_count,
      (SELECT COUNT(DISTINCT p.id) FROM aegisky_products p
       WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.categories) AS c2 WHERE (c2->>'id')::int = cat.id)
      ) as direct_count
    FROM aegisky_categories cat
    WHERE cat.id >= 10000
    ORDER BY cat.parent, cat.id
  `);

  // Build tree
  const byParent = {};
  const byId = {};
  for (const row of result.rows) {
    byId[row.id] = row;
    const p = row.parent || 0;
    if (!byParent[p]) byParent[p] = [];
    byParent[p].push(row);
  }

  // Calculate total (with children) recursively
  function getTotal(id) {
    let total = parseInt(byId[id]?.direct_count || 0);
    const children = byParent[id] || [];
    for (const child of children) {
      total += getTotal(child.id);
    }
    return total;
  }

  function printTree(parentId, indent) {
    const children = byParent[parentId] || [];
    for (const child of children) {
      const total = getTotal(child.id);
      const direct = parseInt(child.direct_count);
      const marker = direct === 0 && total === 0 ? ' ⚠️ EMPTY' : (direct === 0 ? ' (inherited)' : '');
      console.log(`${indent}[${child.id}] ${child.name}: direct=${direct}, total=${total}${marker}`);
      printTree(child.id, indent + '  ');
    }
  }

  printTree(0, '');

  // Count empty categories
  let emptyCount = 0;
  for (const row of result.rows) {
    const total = getTotal(row.id);
    if (total === 0) emptyCount++;
  }
  console.log(`\nTotal empty categories: ${emptyCount} out of ${result.rows.length}`);

  await c.end();
})();
