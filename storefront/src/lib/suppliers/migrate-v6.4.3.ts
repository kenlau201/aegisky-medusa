import { pool as db } from '../control-tower/db';

async function migrate() {
  try {
    await db.query(`
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS content TEXT;
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS read_time VARCHAR(20) DEFAULT '5 min read';
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS author VARCHAR(255) DEFAULT 'Aegisky Editorial Team';
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
    `);
    console.log('Columns added');

    await db.query(`CREATE INDEX IF NOT EXISTS idx_brand_articles_slug ON brand_articles(slug)`);
    console.log('Index created');

    // Generate slugs from titles
    const result = await db.query(`SELECT id, title FROM brand_articles WHERE slug IS NULL`);
    for (const row of result.rows) {
      const slug = row.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 200);
      await db.query(`UPDATE brand_articles SET slug = $1 WHERE id = $2`, [slug, row.id]);
    }
    console.log(`Updated ${result.rows.length} slugs`);

    // Verify
    const count = await db.query(`SELECT COUNT(*) FROM brand_articles WHERE content IS NOT NULL`);
    const slugCount = await db.query(`SELECT COUNT(*) FROM brand_articles WHERE slug IS NOT NULL`);
    console.log(`Articles with content: ${count.rows[0].count}`);
    console.log(`Articles with slug: ${slugCount.rows[0].count}`);

    await db.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
