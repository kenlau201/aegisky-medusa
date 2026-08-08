import { pool as db } from '../control-tower/db';

async function migrate() {
  try {
    await db.query(`
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS geo_score INTEGER DEFAULT 0;
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS geo_keywords TEXT[];
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS last_evaluated_at TIMESTAMP DEFAULT NOW();
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS content_quality_score INTEGER DEFAULT 50;
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS source_url TEXT;
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS search_intent VARCHAR(50);
      ALTER TABLE brand_articles ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
    `);

    await db.query(`CREATE INDEX IF NOT EXISTS idx_brand_articles_geo_score ON brand_articles(brand_id, geo_score DESC)`);

    console.log('GEO scoring columns added successfully');
    await db.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
