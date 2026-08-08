import { pool as db } from '../control-tower/db';

// Batch 3: More real articles from web search
const brandArticles: Record<string, Array<{
  title: string;
  url: string;
  source: string;
  published_date: string;
  summary: string;
  category: string;
}>> = {
  tarot: [
    {
      title: 'Tarot 680PRO Folding Hexacopter Frame Kit TL68P00',
      url: 'https://rcdrone.top/products/tarot-fy680-carbon-hexacopter-drone-frame-tl68b01',
      source: 'RCDrone',
      published_date: '2026-04-15',
      summary: 'Tarot FY680 carbon hexacopter frame at 600g for remote sensing, survey, mapping, and agricultural monitoring applications.',
      category: 'product'
    },
    {
      title: 'Tarot Iron Man 650 Foldable Quadcopter Frame TL65B01',
      url: 'https://www.hobbytech.com.au/products/rc-multi-rotors/kit-frame/tarot-iron-man-650-foldable-quadcopter-frame-kit/',
      source: 'Hobby Tech',
      published_date: '2026-07-22',
      summary: 'Tarot Iron Man 650 uses Toray 3K carbon fiber with foldable design, adjustable gimbal mount, and 50% pre-assembly.',
      category: 'product'
    },
    {
      title: 'Tarot 650 FPV Freestyle Frame Review',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/frame-tarot',
      source: 'AliExpress',
      published_date: '2026-07-09',
      summary: 'In-depth review of Tarot 650 frame build quality with uniform carbon fiber weave and clean edge finishing.',
      category: 'review'
    }
  ],
  hqprop: [
    {
      title: 'HQProp Ethix S5 Tri-Blade 5x4x3 - FPV Freestyle Standard',
      url: 'https://www.getfpv.com/hqprop-ethix-p3-3-polycarbonate-5-1-propellers-set-of-4-mango-lassi.html',
      source: 'GetFPV',
      published_date: '2026-07-07',
      summary: 'HQProp Ethix P3.3 polycarbonate 5.1-inch tri-blade propellers designed for FPV freestyle with Mango Lassi colorway.',
      category: 'product'
    },
    {
      title: 'HQ Prop Ethix S3 Watermelon 5X3.1X3 Propellers',
      url: 'https://www.readymaderc.com/products/details/hq-prop-ethix-s3-watermelon-propeller',
      source: 'Ready Made RC',
      published_date: '2026-07-16',
      summary: 'Ethix S3 Watermelon propellers back in stock, popular for smooth freestyle flight characteristics.',
      category: 'product'
    },
    {
      title: 'ETHIX Props Collection - Precision FPV Propellers',
      url: 'https://www.racedayquads.com/collections/ethix-props',
      source: 'RaceDayQuads',
      published_date: '2026-06-15',
      summary: 'ETHIX propellers engineered for racing gates, high-speed maneuvers, and cinematic shots with premium materials.',
      category: 'product'
    }
  ],
  isdt: [
    {
      title: 'ISDT NeoGo Dual-Channel Charging Box',
      url: 'https://www.isdt.co/neogo.html?lang=en',
      source: 'ISDT',
      published_date: '2025-01-19',
      summary: 'ISDT NeoGo dual-channel fast charging box with built-in battery, USB-C two-way transmission, and APP control.',
      category: 'product'
    },
    {
      title: 'ISDT UC3420 200W Three-Channel Intelligent Charger',
      url: 'https://www.isdt.co/uc342.html?lang=en',
      source: 'ISDT',
      published_date: '2024-05-24',
      summary: 'ISDT UC3420 modular RC charger with 200W three-channel output, built-in power supply, and APP smart charging.',
      category: 'product'
    }
  ],
  toolkitrc: [
    {
      title: 'ToolkitRC Q6AC/M7AC Firmware Upgrade V1.06',
      url: 'https://www.toolkitrc.com/q6ac-m7ac-important-firmware-upgrade/',
      source: 'ToolkitRC',
      published_date: '2026-02-02',
      summary: 'Q6AC V1.06 firmware adds LiXX battery cycle mode and energy-saving features for improved charging experience.',
      category: 'news'
    },
    {
      title: 'ToolkitRC M8D Dual-Channel 800W Charger',
      url: 'https://www.toolkitrc.com/m8d/',
      source: 'ToolkitRC',
      published_date: '2026-07-20',
      summary: 'M8D supports up to 1600W async dual-channel charging with 2000mA balance current for LiPo/LiHV/LiFe/LiIon/LTO.',
      category: 'product'
    },
    {
      title: 'ToolkitRC M7 200W Charger Review',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/toolkitrc-m7',
      source: 'AliExpress',
      published_date: '2026-04-29',
      summary: 'Long-term review showing M7 extended battery fleet life from 120 to 185 cycles with zero failures.',
      category: 'review'
    }
  ],
  velodyne: [
    {
      title: 'Ouster-Velodyne Merger Creates Physical AI Sensing Leader',
      url: 'https://vinamiincanada.wordpress.com/2026/06/20/ouster-inc-oust-the-physical-ai-sensing-platform-built-to-see-the-world/',
      source: 'Investment Analysis',
      published_date: '2026-06-20',
      summary: 'The Velodyne merger provided Ouster with massive customer base and patent shield, now followed by Stereolabs acquisition.',
      category: 'news'
    }
  ],
  livox: [
    {
      title: 'DJI Drone LiDAR: Introducing Livox and Avia',
      url: 'https://www.uav.org/dji-drone-lidar-introducing-livox-and-avia/?amp=1',
      source: 'UAV.org',
      published_date: '2026-02-10',
      summary: 'DJI invested directly in Livox to bring affordable, lightweight LiDAR to drones with Avia and Mid-40 sensors.',
      category: 'news'
    },
    {
      title: 'Livox Mid-40 LiDAR - 260m Detection, Mass Produced',
      url: 'https://livox-wiki-en.readthedocs.io/en/latest/introduction/production.html',
      source: 'Livox Wiki',
      published_date: '2026-01-14',
      summary: 'Livox Mid-40 detects objects up to 260m with non-repetitive scanning for autonomous driving, mapping, and security.',
      category: 'product'
    },
    {
      title: 'DJI Livox Mid-360: Compact 360-Degree LiDAR for Drones',
      url: 'https://www.accio.ai/find-product/dji-livox-mid-360',
      source: 'Accio',
      published_date: '2026-07-31',
      summary: 'Livox Mid-360 offers 360-degree FOV, 100K points/sec, and 90-260m range for commercial UAV applications.',
      category: 'product'
    }
  ],
  dalprop: [
    {
      title: 'DALProp Cyclone T5045C Pro Propellers - Updated Durability',
      url: 'https://www.getfpv.com/dalprop-cyclone-t5045c-pro-propellers-set-of-20.html',
      source: 'GetFPV',
      published_date: '2026-05-29',
      summary: 'Cyclone T5045C Pro edition with updated durability, more crash-resistant than original version.',
      category: 'product'
    },
    {
      title: 'DALPROP New Cyclone T5146.5 V2 Freestyle Racing Props',
      url: 'https://www.dronetoolset.com/product/24pcs-foxeer-dalprop-new-cyclone-t5146-5-v2-freestyle-props-racing-5inch-propellers-5mm-popo-for-rc-fpv-racing-drone-teal/',
      source: 'Drone Toolset',
      published_date: '2026-03-20',
      summary: 'T5146.5 V2 uses German Bayer PC material with enhanced hub design for smooth and powerful freestyle flight.',
      category: 'product'
    },
    {
      title: 'DALPROP Cyclone T2530 2.5-inch Props',
      url: 'https://www.foxeer.com/dalprop-new-cyclone-t2530-props-g-421',
      source: 'Foxeer',
      published_date: '2026-05-20',
      summary: 'New Cyclone T2530 2.5-inch pure PC props at 1.4g each for micro FPV builds.',
      category: 'product'
    }
  ],
  cuav: [
    {
      title: 'CUAV X7+ Pro Flight Controller - STM32H7 480MHz',
      url: 'https://www.camxcel.com/product/cuav-new-x7-pro-flight-controller-open-source-px4-ardupilot-fpv-rc-drone-quadcopter-pixhawk/',
      source: 'Camxcel',
      published_date: '2026-03-30',
      summary: 'X7+ Pro supports PX4/ArduPilot for copter/plane/helicopter with CAN PMU Lite power module and triple IMU redundancy.',
      category: 'product'
    },
    {
      title: 'CUAV X25 EVO Replaces X7+ as Flagship Autopilot',
      url: 'https://www.ercmarket.com/cuav-x7-plus-flight-controller-autopilot/',
      source: 'eRCMarket',
      published_date: '2026-06-02',
      summary: 'CUAV X7+ replaced by X25 EVO intelligent controller for next-generation industrial drone autopilot systems.',
      category: 'news'
    }
  ],
  aegisky: [
    {
      title: 'China Strengthens Dual-Use Drone Export Controls to US',
      url: 'https://app.xinhuanet.com/news/article.html?articleId=20260805c61ac3a0512a40c29c1fd9cef53276ab',
      source: 'Xinhua',
      published_date: '2026-08-05',
      summary: 'China MOFCOM announced enhanced export controls on dual-use drone items to the US under Export Control Law.',
      category: 'news'
    },
    {
      title: 'Drones-as-a-Service: $550 Billion Market Opportunity by 2034',
      url: 'https://www.nasdaq.com/press-release/550-billion-opportunity-drones-service-emerges-defense-next-growth-engine-2026-04-23',
      source: 'Nasdaq',
      published_date: '2026-04-23',
      summary: 'Global DaaS market valued at $33.5B in 2025, projected to reach $550B by 2034 across defense, infrastructure, logistics.',
      category: 'news'
    },
    {
      title: 'Chinese Large UAV Completes First Middle East Logistics Flight',
      url: 'https://news.cgtn.com/news/2026-01-11/Chinese-large-UAV-completes-first-Middle-East-logistics-flight-1JQTEI1xGzm/p.html',
      source: 'CGTN',
      published_date: '2026-01-11',
      summary: 'Sky Bridge mission: Chinese large UAV completed first commercial logistics flight in Middle East under 50 minutes.',
      category: 'news'
    },
    {
      title: 'Unusual Machines Initiates $75M Strategic Drone Component Purchases',
      url: 'https://www.nasdaq.com/press-release/unusual-machines-initiates-75m-strategic-materials-purchases-support-program-driven',
      source: 'Nasdaq',
      published_date: '2026-05-05',
      summary: 'NDAA-compliant drone component manufacturer secured $75M in strategic purchases for program-driven demand.',
      category: 'news'
    }
  ]
};

async function importArticles() {
  console.log('Importing batch 3 brand articles...');
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
