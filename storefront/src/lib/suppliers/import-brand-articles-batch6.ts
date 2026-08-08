import { pool as db } from '../control-tower/db';

// Batch 6: More articles for DJI, Autel, Hobbywing
const brandArticles: Record<string, Array<{
  title: string;
  url: string;
  source: string;
  published_date: string;
  summary: string;
  category: string;
}>> = {
  dji: [
    {
      title: 'DJI Agriculture Launches Agras T55 and T100 Dual Battery System',
      url: 'https://www.dji.com/sg/mobile/media-center/announcements/dji-release-agri-drone-t100st70t55',
      source: 'DJI',
      published_date: '2026-07-01',
      summary: 'New Agras T55 and T100 with dual battery spraying system build on 13 years of R&D for precision agriculture.',
      category: 'news'
    },
    {
      title: 'DJI Drones Tested on Everest for High-Altitude Delivery and Mapping',
      url: 'https://www.dji.com/sg/mobile/media-center?site=brandsite&from=mobile_nav',
      source: 'DJI',
      published_date: '2026-07-09',
      summary: 'DJI drones tested on worlds highest peak for high-altitude delivery, mapping, and climate research applications.',
      category: 'news'
    }
  ],
  autel: [
    {
      title: 'Autel Dragonfish-25: 210-Minute Endurance eVTOL UAV',
      url: 'https://www.autelrobotics.com/productdetail/dragonfish-25/',
      source: 'Autel Robotics',
      published_date: '2026-07-07',
      summary: 'Dragonfish-25 tilt-rotor VTOL delivers 10kg payload, 220km range, and 210-minute endurance for industrial missions.',
      category: 'product'
    },
    {
      title: 'Autel Dragonfish Series 2026 Feature Update',
      url: 'https://www.autelpilot.com/blogs/news/autel-dragonfish-series-2026-product-feature-update',
      source: 'Autelpilot',
      published_date: '2026-06-23',
      summary: '2026 Dragonfish series adds Dragonfish-25 with significant performance, reliability, and intelligence improvements.',
      category: 'news'
    }
  ],
  hobbywing: [
    {
      title: 'Hobbywing X11 G2 Integrated Propulsion System Launched',
      url: 'https://a.hobbywing.com/en/news/info/115',
      source: 'Hobbywing',
      published_date: '2026-01-03',
      summary: 'X11 G2 delivers enhanced performance with high-torque motor, FOC ESC, and CAN communication for agricultural/industrial drones.',
      category: 'news'
    },
    {
      title: 'Hobbywing X9 G2L Propulsion System - 24kg Max Thrust',
      url: 'https://www.hobbywing.com/en/news/info/113',
      source: 'Hobbywing',
      published_date: '2025-12-31',
      summary: 'X9 G2L rated 7-12kg per axis with 24kg max thrust, seamless upgrade from X9/X9 Plus for 16L agricultural drones.',
      category: 'product'
    },
    {
      title: 'Hobbywing Propulsion Systems at SAHA EXPO 2026',
      url: 'https://a.hobbywing.com/en/news/info/150',
      source: 'Hobbywing',
      published_date: '2026-05-12',
      summary: 'X Series G2 with CAN communication and High-Altitude Mode showcased at SAHA EXPO for defense and industrial UAVs.',
      category: 'news'
    }
  ]
};

async function importArticles() {
  console.log('Importing batch 6 brand articles...');
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const [brandSlug, articles] of Object.entries(brandArticles)) {
    const brandResult = await db.query(
      'SELECT id FROM aegisky_brands WHERE slug = $1',
      [brandSlug]
    );

    if (brandResult.rows.length === 0) {
      console.log(`Brand not found: ${brandSlug}, skipping...`);
      totalSkipped += articles.length;
      continue;
    }

    const brandId = brandResult.rows[0].id;

    for (const article of articles.slice(0, 6)) {
      try {
        await db.query(
          `INSERT INTO brand_articles (brand_id, brand_slug, title, url, source, published_date, summary, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (brand_id, url) DO UPDATE SET
             title = EXCLUDED.title,
             source = EXCLUDED.source,
             published_date = EXCLUDED.published_date,
             summary = EXCLUDED.summary,
             category = EXCLUDED.category`,
          [brandId, brandSlug, article.title, article.url, article.source, article.published_date, article.summary, article.category]
        );
        totalInserted++;
      } catch (err: any) {
        console.error(`Error inserting article for ${brandSlug}:`, err.message);
      }
    }
    console.log(`  ${brandSlug}: ${Math.min(articles.length, 6)} articles`);
  }

  console.log(`\nTotal articles processed: ${totalInserted}`);
  console.log(`Skipped (brand not found): ${totalSkipped}`);

  const countResult = await db.query('SELECT COUNT(*) FROM brand_articles');
  console.log(`Total articles in database: ${countResult.rows[0].count}`);

  const brandCountResult = await db.query('SELECT COUNT(DISTINCT brand_id) FROM brand_articles');
  console.log(`Brands with articles: ${brandCountResult.rows[0].count}`);

  process.exit(0);
}

importArticles().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
