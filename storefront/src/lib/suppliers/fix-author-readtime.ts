import { pool as db } from '../control-tower/db';

async function fixAuthor() {
  // Set default author for articles with null author
  const result = await db.query(`
    UPDATE brand_articles 
    SET author = 'Aegisky Editorial Team'
    WHERE author IS NULL OR author = ''
  `);
  console.log(`Updated ${result.rowCount} articles with default author`);

  // Update read_time based on content length more accurately
  const articles = await db.query(`SELECT id, content FROM brand_articles`);
  for (const a of articles.rows) {
    if (a.content) {
      const words = a.content.split(/\s+/).length;
      const minutes = Math.max(4, Math.min(12, Math.round(words / 180)));
      await db.query(`UPDATE brand_articles SET read_time = $1 WHERE id = $2`, [`${minutes} min read`, a.id]);
    }
  }
  console.log(`Updated read_time for ${articles.rows.length} articles`);

  // Verify
  const sample = await db.query(`SELECT id, title, author, read_time FROM brand_articles ORDER BY id LIMIT 5`);
  for (const s of sample.rows) {
    console.log(`  [${s.id}] ${s.title.substring(0, 50)}... | ${s.author} | ${s.read_time}`);
  }

  await db.end();
}

fixAuthor().catch(console.error);
