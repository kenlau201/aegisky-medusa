import { pool as db } from '../control-tower/db';

async function verify() {
  const result = await db.query(`
    SELECT a.id, a.title, a.content, a.read_time, a.author, b.name as brand_name
    FROM brand_articles a
    JOIN aegisky_brands b ON a.brand_id = b.id
    ORDER BY a.id
    LIMIT 5
  `);

  for (const row of result.rows) {
    console.log(`\n=== Article ${row.id}: ${row.title} ===`);
    console.log(`Brand: ${row.brand_name}`);
    console.log(`Read time: ${row.read_time}`);
    console.log(`Author: ${row.author}`);
    console.log(`Content preview: ${row.content?.substring(0, 200)}...`);
    console.log(`Contains "undefined": ${row.content?.includes('undefined')}`);
  }

  // Check for any undefined in content
  const undef = await db.query(`SELECT COUNT(*) FROM brand_articles WHERE content LIKE '%undefined%'`);
  console.log(`\nArticles with "undefined" in content: ${undef.rows[0].count}`);

  await db.end();
}

verify().catch(console.error);
