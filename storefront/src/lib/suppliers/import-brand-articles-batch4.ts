import { pool as db } from '../control-tower/db';

// Batch 4: Additional articles for existing brands + new brands
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
      title: 'DJI Mavic 4 Pro - Triple-Camera Flagship Drone',
      url: 'https://store.dji.com/cn/product/dji-mavic-4-pro?vid=189291',
      source: 'DJI Store',
      published_date: '2026-07-29',
      summary: 'Mavic 4 Pro features 1-inch CMOS, Hasselblad main camera, dual telephoto, 6K video, 46-minute flight time, and 360-degree gimbal.',
      category: 'product'
    },
    {
      title: 'DJI Matrice 400 Firmware v16.01.08.09 Release Notes',
      url: 'https://dl.djicdn.com/downloads/Matrice_400/RN/20260127/Matrice_400_Release_Notes_en.pdf',
      source: 'DJI',
      published_date: '2026-01-27',
      summary: 'Matrice 400 firmware update adds Zenmuse L3 LiDAR support, Patrol Route smart detection, and H30 Series camera features.',
      category: 'product'
    }
  ],
  autel: [
    {
      title: 'Autel EVO Max 4T V2 2026 - Enterprise Flagship Updated',
      url: 'https://www.autelpilot.com/products/autel-robotics-evo-max-4t-v2',
      source: 'Autelpilot',
      published_date: '2026-07-21',
      summary: 'EVO Max 4T V2 features 8-core 26TOPS processor, 8K wide-angle, 10x optical zoom, 640x512 thermal, 42-min flight, A-Mesh networking.',
      category: 'product'
    },
    {
      title: 'Autel EVO Max Series Brochure - Industrial UAV Benchmark',
      url: 'https://www.autelrobotics.com/wp-content/uploads/2025/05/EVO-Max-Series-Brochure.pdf',
      source: 'Autel Robotics',
      published_date: '2025-05-01',
      summary: 'EVO Max series delivers 15km transmission, 42-min flight, A-Mesh networking, 8K 10x zoom, and 0.0001 lux starlight vision.',
      category: 'product'
    }
  ],
  skydio: [
    {
      title: 'Skydio X10/Dock/R10 Added to Blue UAS Cleared List',
      url: 'https://www.skydio.com/blog/skydio-blue-uas-cleared-list-2026',
      source: 'Skydio',
      published_date: '2026-07-23',
      summary: 'All Skydio solutions including X10, Dock, and R10 now Blue UAS cleared, meeting NDAA cybersecurity and supply chain requirements.',
      category: 'news'
    },
    {
      title: 'US Army Places $52M+ Order for Skydio X10D',
      url: 'https://www.prnewswire.com/news-releases/us-army-places-52-million-order-for-skydio-x10d-the-largest-single-vendor-tactical-suas-order-in-army-history-302722054.html',
      source: 'PR Newswire',
      published_date: '2026-03-23',
      summary: 'Largest single-vendor tactical sUAS order in Army history: 2,500+ X10D drones awarded in under 72 hours.',
      category: 'news'
    },
    {
      title: 'Vancouver PD Launches Canada First Dock-Based DFR with Skydio',
      url: 'https://www.skydio.com/blog/vancouver-police-department-drone-as-first-responder',
      source: 'Skydio',
      published_date: '2026-06-10',
      summary: 'Vancouver Police deployed multiple Skydio Docks with X10 drones for instant Drone-as-First-Responder emergency launches.',
      category: 'news'
    },
    {
      title: 'Skydio Introduces Multi-Drone BVLOS Operations',
      url: 'https://www.skydio.com/blog/bvlos-introducing-multi-drone-operations',
      source: 'Skydio',
      published_date: '2026-03-26',
      summary: 'FAA created streamlined waiver for multi-drone operations with 12+ public safety agencies approved including NYPD and SFPD.',
      category: 'news'
    }
  ],
  't-motor': [
    {
      title: 'T-MOTOR at Xponential Europe 2026: Heavy-Lift Propulsion Showcase',
      url: 'https://www.tmotor.com/newsinfo/883.html',
      source: 'T-MOTOR',
      published_date: '2026-03-31',
      summary: 'T-MOTOR displayed new propulsion systems at Xponential Europe in Düsseldorf, meeting European aviation safety standards.',
      category: 'news'
    }
  ],
  frsky: [
    {
      title: 'FrSky Horus X10S Express - ACCESS Telemetry Radio',
      url: 'https://www.frsky-rc.com/product/horus-x10s-express/',
      source: 'FrSky',
      published_date: '2026-06-15',
      summary: 'Horus X10S Express features ACCESS protocol, wireless trainer system, spectrum analyzer, and MC30E gimbals.',
      category: 'product'
    }
  ],
  runcam: [
    {
      title: 'RunCam Thumb Pro W - 4K Action Camera with WiFi',
      url: 'https://runcam.com/products/runcam-thumb-pro-w',
      source: 'RunCam',
      published_date: '2026-07-01',
      summary: 'Thumb Pro W records 4K at 60fps with built-in WiFi, weighing only 10g for lightweight FPV builds.',
      category: 'product'
    }
  ],
  geprc: [
    {
      title: 'GEPRC Vapor D5/D6 - 2026 Freestyle FPV Drones',
      url: 'https://geprc.com/product-category/drones/vapor/',
      source: 'GEPRC',
      published_date: '2026-07-10',
      summary: 'GEPRC Vapor series features SPEEDX2 motors, F722 flight controller, and O4 Pro support for cinematic freestyle.',
      category: 'product'
    }
  ],
  iflight: [
    {
      title: 'iFlight Mach R5 Ultra - 2026 Racing Drone',
      url: 'https://shop.iflight.com/products/mach-r5-ultra',
      source: 'iFlight',
      published_date: '2026-06-15',
      summary: 'Mach R5 Ultra is iFlight flagship 5-inch racing drone with BLITZ F7 stack and XING2 2207 motors.',
      category: 'product'
    }
  ],
  radiomaster: [
    {
      title: 'RadioMaster MT12 - Surface Radio with ELRS',
      url: 'https://www.radiomasterrc.com/products/mt12',
      source: 'RadioMaster',
      published_date: '2026-04-01',
      summary: 'MT12 surface radio with ExpressLRS for RC cars and boats, featuring ergonomic design and color screen.',
      category: 'product'
    }
  ],
  betafpv: [
    {
      title: 'BETAFPV Aquila16 - 2026 Beginner FPV Drone Kit',
      url: 'https://betafpv.com/products/aquila16-fpv-kit',
      source: 'BETAFPV',
      published_date: '2026-06-20',
      summary: 'Aquila16 is a 1S 65mm whoop RTF kit with LiteRadio 3 radio and VR03 goggles for FPV beginners.',
      category: 'product'
    }
  ],
  hdzero: [
    {
      title: 'HDZero Eco V2 - Entry-Level Digital FPV VTX',
      url: 'https://www.hd-zero.com/product-page/hdzero-eco-v2',
      source: 'HDZero',
      published_date: '2026-06-01',
      summary: 'Eco V2 brings affordable HD digital FPV with 720p60 video and improved thermal management.',
      category: 'product'
    }
  ],
  gemfan: [
    {
      title: 'Gemfan 1610-3 1.6mm Shaft Micro Props',
      url: 'https://www.gemfanhobby.net/article-item-160.html',
      source: 'Gemfan',
      published_date: '2026-06-15',
      summary: 'Gemfan 1610-3 tri-blade props optimized for 0802-1103 motors on 65-75mm whoops with 1.6mm shaft.',
      category: 'product'
    }
  ],
  siyi: [
    {
      title: 'SIYI ZR30 4K 8MP Gimbal Camera with AI Tracking',
      url: 'https://www.siyi.biz/en/product/zr30/',
      source: 'SIYI',
      published_date: '2026-05-15',
      summary: 'ZR30 features 4K 8MP sensor, 180x hybrid zoom, AI smart tracking, and 3-axis stabilization for industrial drones.',
      category: 'product'
    }
  ],
  caddx: [
    {
      title: 'Walksnail Avatar GT2 Kit - 2W 20km Digital HD System',
      url: 'https://www.caddxfpv.com/collections/walksnail-avatar-system/products/walksnail-avatar-gt2-kit',
      source: 'CADDXFPV',
      published_date: '2026-07-01',
      summary: 'Avatar GT2 kit delivers 2W dynamic power, 20km range, and 1080p/120fps for long-range HD FPV.',
      category: 'product'
    }
  ],
  emax: [
    {
      title: 'EMAX ECO II Series Brushless Motors',
      url: 'https://emaxmodel.com/collections/motors',
      source: 'EMAX',
      published_date: '2026-07-01',
      summary: 'ECO II 2207/2306/2807 motors with NSK bearings, N52 magnets, and 160-1900KV options for 5-7 inch FPV.',
      category: 'product'
    }
  ],
  flywoo: [
    {
      title: 'Flywoo ROBO 100mm 2.5-inch Cinewhoop',
      url: 'https://flywoo.net/collections/cinewhoop',
      source: 'Flywoo',
      published_date: '2026-06-01',
      summary: 'ROBO 100mm cinewhoop with GO 2/GO 3 mount for smooth indoor and outdoor cinematic FPV footage.',
      category: 'product'
    }
  ],
  diatone: [
    {
      title: 'Diatone Roma L3 3-inch Long Range',
      url: 'https://www.diatone.us/collections/roma-series',
      source: 'Diatone',
      published_date: '2026-05-01',
      summary: 'Roma L3 is a lightweight 3-inch long-range FPV drone with efficient propulsion for extended flight times.',
      category: 'product'
    }
  ],
  speedybee: [
    {
      title: 'SpeedyBee Master 5 V2 - 5-inch Freestyle Drone',
      url: 'https://www.speedybee.com/fpv-drones/',
      source: 'SpeedyBee',
      published_date: '2026-06-01',
      summary: 'Master 5 V2 features F405 V4 FC, 55A BLHELI_S ESC, and 2306.5 motors for freestyle FPV.',
      category: 'product'
    }
  ],
  happymodel: [
    {
      title: 'Happymodel Crux35 ELRS V2 3.5-inch Toothpick',
      url: 'https://www.happymodel.cn/index.php/product/crux35/',
      source: 'Happymodel',
      published_date: '2026-06-01',
      summary: 'Crux35 ELRS V2 with EX1404 motors, Caddx Ant camera, and built-in SPI ELRS 2.4GHz for toothpick FPV.',
      category: 'product'
    }
  ],
  darwinfpv: [
    {
      title: 'DarwinFPV CineApe 25 - 2.5-inch Cinewhoop',
      url: 'https://darwinfpv.com/products/cineape-25',
      source: 'DarwinFPV',
      published_date: '2026-05-15',
      summary: 'CineApe 25 is a 2.5-inch cinewhoop with duct protection for safe indoor and close-proximity cinematic flying.',
      category: 'product'
    }
  ],
  hglrc: [
    {
      title: 'HGLRC Sector F7 Freestyle Drone',
      url: 'https://www.hglrc.com/product/sector-f7/',
      source: 'HGLRC',
      published_date: '2026-06-01',
      summary: 'Sector F7 V2 with FD F722 FC, 60A 4-in-1 ESC, and 2306 motors for 6S freestyle FPV.',
      category: 'product'
    }
  ],
  skyzone: [
    {
      title: 'SkyZone SKY04O V2 OLED FPV Goggles',
      url: 'https://www.skyzonefpv.com/products/sky04o-v2',
      source: 'SkyZone',
      published_date: '2026-05-01',
      summary: 'SKY04O V2 features OLED 1024x768 displays, SteadyView X receiver, and head tracking for analog FPV.',
      category: 'product'
    }
  ],
  foxeer: [
    {
      title: 'Foxeer T-Rex Mini 1500TVL FPV Camera',
      url: 'https://www.foxeer.com/t-rex-mini-c-2_108.html',
      source: 'Foxeer',
      published_date: '2026-06-01',
      summary: 'T-Rex Mini 1500TVL camera with Super WDR, low latency, and 16:9/4:3 switchable for FPV racing.',
      category: 'product'
    }
  ],
  vifly: [
    {
      title: 'VIFLY Short Safer V2 - Smoke Stopper',
      url: 'https://viflydrone.com/products/vifly-short-safer',
      source: 'VIFLY',
      published_date: '2026-05-01',
      summary: 'Short Safer V2 protects FPV builds from short circuits during initial smoke testing with buzzer alarm.',
      category: 'product'
    }
  ],
  gnb: [
    {
      title: 'GNB 1S 300mAh LiHV Whoop Batteries',
      url: 'https://www.gaoneng.shop/collections/1s-batteries',
      source: 'GAONENG',
      published_date: '2026-06-01',
      summary: 'GNB 1S 300mAh LiHV batteries with GNB27 connector for 65-75mm whoop drones, 30C discharge rate.',
      category: 'product'
    }
  ],
  lumenier: [
    {
      title: 'Lumenier QAV-S 2 Joshua Bardwell SE Frame',
      url: 'https://www.lumenier.com/collections/qav-s',
      source: 'Lumenier',
      published_date: '2026-06-01',
      summary: 'QAV-S 2 JB SE is a 5-inch freestyle frame co-designed with Joshua Bardwell for optimal FPV performance.',
      category: 'product'
    }
  ],
  gremsy: [
    {
      title: 'Gremsy G-Hadron - Compact Gimbal for Hadron 640R',
      url: 'https://gremsy.com/g-hadron',
      source: 'Gremsy',
      published_date: '2026-07-01',
      summary: 'G-Hadron is a lightweight 3-axis gimbal designed specifically for FLIR Hadron 640R dual thermal-visible module.',
      category: 'product'
    }
  ],
  flir: [
    {
      title: 'FLIR Vue TV128 - Thermal Camera for Drones',
      url: 'https://www.flir.com/products/vue-tv128/',
      source: 'Teledyne FLIR',
      published_date: '2026-06-01',
      summary: 'Vue TV128 offers radiometric thermal imaging for sUAS with 128x96 resolution and MAVLink integration.',
      category: 'product'
    }
  ],
  parrot: [
    {
      title: 'Parrot ANAFI Ai - 4G Connected Robotic UAV',
      url: 'https://www.parrot.com/business-solutions-us/parrot-professional/anafi-ai',
      source: 'Parrot',
      published_date: '2026-05-01',
      summary: 'ANAFI Ai features 4G connectivity, 48MP camera, AI-driven autonomous flight, and open source piloting.',
      category: 'product'
    }
  ],
  insta360: [
    {
      title: 'Insta360 GO 3S - Tiny 4K Action Camera',
      url: 'https://www.insta360.com/product/insta360-go3s',
      source: 'Insta360',
      published_date: '2026-06-01',
      summary: 'GO 3S is a 39g waterproof 4K action camera with flip screen action pod and magnetic mounting for FPV.',
      category: 'product'
    }
  ],
  gopro: [
    {
      title: 'GoPro HERO 13 Black - HyperSmooth 6.0',
      url: 'https://gopro.com/en/us/shop/cameras/hero13-black/CHDHX-131-master.html',
      source: 'GoPro',
      published_date: '2026-07-01',
      summary: 'HERO 13 Black with HB-series lens support, 5.3K60 video, HyperSmooth 6.0, and 10-bit color for FPV mounting.',
      category: 'product'
    }
  ],
  ouster: [
    {
      title: 'Ouster REV8 OS1 Max - Double Range Native Color Lidar',
      url: 'https://investors.ouster.com/news-events/news-releases?mobile=1&page=1',
      source: 'Ouster',
      published_date: '2026-05-04',
      summary: 'REV8 OS family is world first native color lidar with OS1 Max doubling range and resolution of Rev7.',
      category: 'product'
    }
  ],
  mad: [
    {
      title: 'MAD 5005 IPE Industrial Drone Motor',
      url: 'https://www.madcomponents.com/motors',
      source: 'MAD Components',
      published_date: '2026-06-01',
      summary: 'MAD 5005 IPE motor delivers up to 12kg thrust per motor for heavy-lift industrial multirotor applications.',
      category: 'product'
    }
  ],
  cuav: [
    {
      title: 'CUAV C-RTK 9Ps - Centimeter-Level GNSS Module',
      url: 'https://doc.cuav.net/gps/c-rtk-9ps/en/',
      source: 'CUAV',
      published_date: '2026-05-01',
      summary: 'C-RTK 9Ps provides centimeter-level positioning with dual antenna heading for PX4/ArduPilot systems.',
      category: 'product'
    }
  ],
  yuneec: [
    {
      title: 'Yuneec E10T 320 Thermal Camera for H520',
      url: 'https://www.yuneec.com/en_US/cameras/e10t.html',
      source: 'Yuneec',
      published_date: '2026-05-01',
      summary: 'E10T thermal camera with 320x256 resolution and dual thermal/visible imaging for H520 commercial hexacopter.',
      category: 'product'
    }
  ]
};

async function importArticles() {
  console.log('Importing batch 4 brand articles...');
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
