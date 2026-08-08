import { pool as db } from '../control-tower/db';

async function verify() {
  const total = await db.query('SELECT COUNT(*) FROM brand_articles');
  console.log('Total articles:', total.rows[0].count);

  const brands = await db.query('SELECT COUNT(DISTINCT brand_id) FROM brand_articles');
  console.log('Brands with articles:', brands.rows[0].count);

  const top = await db.query('SELECT b.name, b.slug, COUNT(a.id) as cnt FROM brand_articles a JOIN aegisky_brands b ON a.brand_id = b.id GROUP BY b.name, b.slug ORDER BY cnt DESC LIMIT 15');
  console.log('\nTop brands by article count:');
  top.rows.forEach(r => console.log('  ', r.name, '-', r.cnt, 'articles'));

  const dji = await db.query("SELECT title, source, published_date FROM brand_articles WHERE brand_slug = 'dji' ORDER BY published_date DESC LIMIT 6");
  console.log('\nDJI articles (latest 6):');
  dji.rows.forEach(r => console.log('  -', r.title.substring(0, 60), '|', r.source, '|', r.published_date));

  const autel = await db.query("SELECT title, source, published_date FROM brand_articles WHERE brand_slug = 'autel' ORDER BY published_date DESC LIMIT 6");
  console.log('\nAutel articles (latest 6):');
  autel.rows.forEach(r => console.log('  -', r.title.substring(0, 60), '|', r.source, '|', r.published_date));

  const invalid = await db.query("SELECT COUNT(*) FROM brand_articles WHERE url NOT LIKE 'http%'");
  console.log('\nInvalid URLs:', invalid.rows[0].count);

  const dupes = await db.query('SELECT brand_id, url, COUNT(*) FROM brand_articles GROUP BY brand_id, url HAVING COUNT(*) > 1');
  console.log('Duplicate brand+url pairs:', dupes.rows.length);

  const recent = await db.query("SELECT b.name, a.title, a.published_date FROM brand_articles a JOIN aegisky_brands b ON a.brand_id = b.id WHERE a.published_date >= '2026-01-01' ORDER BY a.published_date DESC LIMIT 10");
  console.log('\nRecent 2026 articles:');
  recent.rows.forEach(r => console.log('  ', r.name, '-', r.title.substring(0, 50), '|', r.published_date));

  await db.end();
}

verify().catch(console.error);
