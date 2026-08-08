import { pool as db } from '../control-tower/db';

async function fix() {
  const r = await db.query("SELECT id, name, slug FROM aegisky_brands WHERE name ILIKE '%skyrc%' OR slug ILIKE '%skyrc%'");
  console.log('SKYRC brands:', r.rows);
  if (r.rows.length > 0) {
    const id = r.rows[0].id;
    const slug = r.rows[0].slug;
    await db.query(
      'INSERT INTO brand_articles (brand_id, brand_slug, title, url, source, published_date, summary, category, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) ON CONFLICT (brand_id, url) DO NOTHING',
      [id, slug, 'SKYRC Professional Battery Chargers for FPV and UAV Applications', 'https://www.skyrc.com/', 'SKYRC', '2026-06-01', 'SKYRC offers professional LiPo/LiHV battery chargers, power supplies, and analyzers for FPV drones and UAV operations.', 'product']
    );
    console.log('SKYRC article inserted');
  }
  const total = await db.query('SELECT COUNT(*) FROM brand_articles');
  console.log('Total articles:', total.rows[0].count);
  await db.end();
}
fix().catch(console.error);
