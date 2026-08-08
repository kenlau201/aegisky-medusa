import { pool as db } from '../control-tower/db';

// Batch 5: Additional articles for more brands
const brandArticles: Record<string, Array<{
  title: string;
  url: string;
  source: string;
  published_date: string;
  summary: string;
  category: string;
}>> = {
  holybro: [
    {
      title: 'Holybro Pixhawk 6X Pro - STM32H753 480MHz Triple Redundancy',
      url: 'https://holybro.com/products/pixhawk-6x-pro',
      source: 'Holybro',
      published_date: '2026-07-13',
      summary: 'Pixhawk 6X Pro features STM32H753 at 480MHz, triple redundant IMU domains, Ethernet interface, and modular baseboard design.',
      category: 'product'
    },
    {
      title: 'Pixhawk 6X REV8 Review: Precision Flight Controller for Research',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/pixhawk-px6',
      source: 'AliExpress',
      published_date: '2026-04-26',
      summary: 'Pixhawk 6X REV8 used in university wildfire research with FAA Part 107 waiver compliance and proven operational reliability.',
      category: 'review'
    }
  ],
  fatshark: [
    {
      title: 'Fat Shark Dominator HDO3 - 1080p OLED Digital FPV Goggles',
      url: 'https://www.fatshark.com/',
      source: 'Fat Shark',
      published_date: '2026-07-21',
      summary: 'Dominator returns with FullHD OLED displays, 1080p video protocol, USB-C video out, HD DVR, and Betaflight Canvas Mode support.',
      category: 'product'
    },
    {
      title: 'Fat Shark Dominator HDO+ Analog OLED Goggles',
      url: 'https://www.team-blacksheep.com/products/prod:fs_hdo_plus',
      source: 'Team BlackSheep',
      published_date: '2026-07-23',
      summary: 'HDO+ features modular receiver bay for RapidFIRE and other modules, 1920x1080 OLED, and customizable IPD/focus.',
      category: 'product'
    }
  ],
  flysky: [
    {
      title: 'Flysky FS-i6X 10CH AFHDS 2A Transmitter',
      url: 'https://www.flysky-cn.com/fsi6x',
      source: 'Flysky',
      published_date: '2026-06-05',
      summary: 'FS-i6X supports 10 channels with AFHDS 2A protocol, firmware updates via data port, and fixed-wing/glider/helicopter modes.',
      category: 'product'
    }
  ],
  jumper: [
    {
      title: 'Jumper T20S V2 ELRS 2.4GHz Hall Sensor Radio',
      url: 'https://www.jumper-rc.com/products/t20s',
      source: 'Jumper',
      published_date: '2026-06-01',
      summary: 'T20S V2 features ELRS 2.4GHz, hall sensor gimbals, 3.5-inch color screen, and EdgeTX firmware for FPV drones.',
      category: 'product'
    }
  ],
  eachine: [
    {
      title: 'Eachine EV300O OLED FPV Goggles with DVR',
      url: 'https://www.eachine.com/Eachine-EV300O-OLED-FPV-Goggles',
      source: 'Eachine',
      published_date: '2026-05-01',
      summary: 'EV300O features dual OLED displays, 46-degree FOV, built-in DVR, and diversity receiver for analog FPV racing.',
      category: 'product'
    }
  ],
  rushfpv: [
    {
      title: 'RUSH TANK SOLO 1.6W VTX - 2.5GHz FPV Transmitter',
      url: 'https://www.rushfpv.com/product/tank-solo',
      source: 'RUSHFPV',
      published_date: '2026-06-01',
      summary: 'TANK SOLO delivers up to 1.6W output power with smart audio, microphone, and CNC housing for long-range FPV.',
      category: 'product'
    }
  ],
  sunnylife: [
    {
      title: 'Sunnylife Accessories for DJI Mavic 4 Pro',
      url: 'https://www.sunnylife.com/collections/dji-mavic-4-pro',
      source: 'Sunnylife',
      published_date: '2026-07-01',
      summary: 'Sunnylife launched landing gear, propeller guards, ND filters, and carrying cases for DJI Mavic 4 Pro.',
      category: 'product'
    }
  ]
};

async function importArticles() {
  console.log('Importing batch 5 brand articles...');
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
