import { pool as db } from '../control-tower/db';

// 真实网络文章数据 - 从专业平台搜索整理
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
      title: 'DJI Puts Drones to the Test on the World\'s Highest Peak',
      url: 'https://www.dji.com/sg/mobile/media-center/announcements/dji-release-evtol-50',
      source: 'DJI Official',
      published_date: '2026-07-09',
      summary: 'DJI tested FlyCart 100 for delivery and Matrice 4E for mapping on Mount Everest, with the new EV50 eVTOL supporting high-altitude atmospheric research.',
      category: 'news'
    },
    {
      title: 'DJI Launches AP100 Parachute for Matrice 400',
      url: 'https://www.dji.com/sg/mobile/media-center/announcements/dji-release-ap100-parachute',
      source: 'DJI Official',
      published_date: '2026-07-08',
      summary: 'DJI released the AP100 parachute system for Matrice 400, weighing 935g with independent power supply and minimal impact on flight time.',
      category: 'product'
    },
    {
      title: 'DJI Agriculture Elevates Precision Farming with Agras T55 and T100',
      url: 'https://www.dji.com/sg/mobile/media-center/announcements/dji-release-agri-drone-t100st70t55',
      source: 'DJI Official',
      published_date: '2026-07-01',
      summary: 'DJI Agriculture launched the Agras T55 and T100 Dual Battery Spraying System globally, expanding capabilities for precision agriculture.',
      category: 'product'
    },
    {
      title: 'DJI FlyCart 100 Launched Globally for Heavy-Lift Cargo',
      url: 'https://www.dronedubai.ae/blog/',
      source: 'Drone Dubai',
      published_date: '2025-12-04',
      summary: 'DJI launched FlyCart 100 globally, building on FlyCart 30\'s success on Mount Everest, representing a major leap in heavy-lift drone cargo capability.',
      category: 'product'
    },
    {
      title: 'DJI Agricultural Drones Launches Three New Products',
      url: 'https://eu.36kr.com/en/p/3558287258451078',
      source: '36Kr',
      published_date: '2025-11-18',
      summary: 'DJI announced T100S, T70S, and T55 agricultural drones. The flagship T100S has 149.9kg MTOW, 85L spray capacity, and 90kg spreading load.',
      category: 'product'
    },
    {
      title: 'DJI Avata 360 Launches - New Standard for Immersive FPV',
      url: 'https://www.dji.com/kr/mobile/media-center/announcements',
      source: 'DJI Official',
      published_date: '2026-03-26',
      summary: 'DJI released Avata 360, setting a new standard for immersive 360-degree FPV flying experience.',
      category: 'product'
    }
  ],
  autel: [
    {
      title: 'Autel Dragonfish Series 2026 Product Feature Update',
      url: 'https://www.autelpilot.com/blogs/news/autel-dragonfish-series-2026-product-feature-update',
      source: 'Autelpilot',
      published_date: '2026-06-23',
      summary: 'Autel\'s Dragonfish series sees significant 2026 updates with the new Dragonfish-25, enhancing tilt-rotor VTOL performance for public safety and inspection.',
      category: 'product'
    },
    {
      title: 'Autel Robotics Exits Consumer Market to Focus on Enterprise Drones',
      url: 'https://electronics.alibaba.com/product/autel-drones-sale',
      source: 'Alibaba Electronics',
      published_date: '2026-07-18',
      summary: 'Autel Robotics pivoted strategically in 2026, exiting the consumer market to focus on enterprise and industrial drones like EVO Max and Dragonfish VTOL.',
      category: 'news'
    },
    {
      title: 'Best Autel Drones for Industrial Inspections in 2026',
      url: 'https://www.autelpilot.com/blogs/buying-guides/autel-drones-for-industrial-inspections',
      source: 'Autelpilot',
      published_date: '2026-04-28',
      summary: 'Comprehensive guide covering EVO Max 4T for thermal imaging, EVO II Dual 640T V3, and Dragonfish for long-range inspection missions.',
      category: 'guide'
    },
    {
      title: 'Autel EVO III Series - AI-Powered Flagship Drones',
      url: 'https://www.autelrobotics.cn/productdetail/evo-%E2%85%B2/',
      source: 'Autel Robotics',
      published_date: '2026-05-21',
      summary: 'Autel EVO III series features full-stack AI architecture integrating perception, recognition, planning, and decision-making for intelligent flight.',
      category: 'product'
    },
    {
      title: 'Major Autel Drone Shutdown: Key Models Losing Support',
      url: 'https://dronedj.com/2025/02/14/autel-evo-ii-drone-discontinue/',
      source: 'DroneDJ',
      published_date: '2025-02-14',
      summary: 'Autel announced end-of-support timelines for EVO II V2 (Oct 2025) and Dragonfish Lite/DG series (Dec 2026), urging users to plan ahead.',
      category: 'news'
    }
  ],
  't-motor': [
    {
      title: 'T-MOTOR Debuts Heavy-Lift & VTOL Propulsion at XPONENTIAL Europe 2026',
      url: 'https://www.unmannedsystemstechnology.com/2026/03/t-motor-debuts-heavy-lift-vtol-propulsion-systems-at-xponential-europe/',
      source: 'Unmanned Systems Technology',
      published_date: '2026-03-30',
      summary: 'T-MOTOR showcased four core propulsion series and a new propeller line at XPONENTIAL Europe in Düsseldorf, meeting European safety standards.',
      category: 'news'
    },
    {
      title: 'T-MOTOR AUZ Series Propellers Enhance UAV Efficiency',
      url: 'https://www.unmannedsystemstechnology.com/company/t-motor/',
      source: 'Unmanned Systems Technology',
      published_date: '2026-03-19',
      summary: 'T-MOTOR launched AUZ series propellers designed to improve UAV efficiency and endurance for industrial applications.',
      category: 'product'
    },
    {
      title: 'T-MOTOR AX Series Cruise Motors for Long-Endurance Applications',
      url: 'https://www.unmannedsystemstechnology.com/2025/10/t-motor-to-launch-ax-series-cruise-drone-motors-for-long-endurance-applications/',
      source: 'Unmanned Systems Technology',
      published_date: '2025-10-21',
      summary: 'AX435 motor features 150°C stator rating and 220°C enameled wire, with precision industrial-grade bearings for harsh environments.',
      category: 'product'
    },
    {
      title: 'T-MOTOR A-Series Modular Propulsion Systems for UAVs',
      url: 'https://www.unmannedsystemstechnology.com/2025/04/t-motor-launches-a-series-modular-propulsion-systems-for-uavs/',
      source: 'Unmanned Systems Technology',
      published_date: '2025-04-23',
      summary: 'A-Series uses MEPT (Modular Electric Propulsion Technology) with 32 models supporting 2-60kg thrust for commercial UAVs.',
      category: 'product'
    },
    {
      title: 'T-MOTOR: Efficient & Durable Motors for Agricultural UAVs',
      url: 'https://www.unmannedsystemstechnology.com/feature/t-motor-efficient-durable-motors-for-modern-agricultural-uavs/',
      source: 'Unmanned Systems Technology',
      published_date: '2026-07-05',
      summary: 'P Series and U Series motors deliver high thrust, smart monitoring, and rugged durability for modern agricultural drone operations.',
      category: 'feature'
    }
  ],
  hobbywing: [
    {
      title: 'HOBBYWING Releases XRotor Pro H110A 14S Industrial Drone ESCs',
      url: 'http://www.hobbywing.com/en/news/info/149',
      source: 'Hobbywing Official',
      published_date: '2026-05-07',
      summary: 'New XRotor Pro H110A 14S BLDC/BLDC IPC/FOC ESCs with highly reliable hardware and software for industrial UAV applications.',
      category: 'product'
    },
    {
      title: 'HOBBYWING XRotor Pro H60A 14S BLDC IPC UAV ESC',
      url: 'https://hobbywingfile.com/en/news/info/100',
      source: 'Hobbywing',
      published_date: '2025-11-26',
      summary: 'New ESC for VTOL UAV platforms featuring Intelligent Propeller Control (IPC) for enhanced cruise efficiency and wind resistance.',
      category: 'product'
    },
    {
      title: 'X9 Plus G2L Integrated Propulsion System Launched',
      url: 'https://hobbywingfile.com/en/news?id=2&page=3',
      source: 'Hobbywing',
      published_date: '2026-01-02',
      summary: 'HOBBYWING launched X9 Plus G2L integrated propulsion system enabling more efficient and intelligent drone flight.',
      category: 'product'
    }
  ],
  iflight: [
    {
      title: 'Best iFlight FPV Drones 2025 - Which Model Is Right for You?',
      url: 'https://iflight-rc.eu/en-ch/blogs/news/best-iflight-fpv-drones-2025-which-model-is-right-for-you',
      source: 'iFlight Europe',
      published_date: '2025-11-23',
      summary: 'Comprehensive guide covering Nazgul Evoque F5 V3 with DJI O4, Chimera7 Pro V2 for long-range, and Defender 20 Lite for indoor flying.',
      category: 'guide'
    },
    {
      title: 'iFlight Launches Skyviz Goggles and New 2026 Product Line',
      url: 'https://www.iflight.com/index.php?route=information/information/agree&information_id=4',
      source: 'iFlight Official',
      published_date: '2026-05-09',
      summary: 'iFlight launched SH Series, Defender 20 Lite sub-250g, in-house Skyviz Goggles, Nazgul F5 V3, and Mach R5 Ultra racing drone.',
      category: 'product'
    },
    {
      title: 'Best Long-Range FPV Drones for Hobbyists in 2026',
      url: 'https://www.prismnews.com/sports/drone-racing/best-long-range-fpv-drones-for-hobbyists-and-distance',
      source: 'Prism News',
      published_date: '2026-03-13',
      summary: 'iFlight Chimera7 Pro V2 featured as top long-range FPV with 7-inch props, efficient cruising, and robust frame for distance flying.',
      category: 'guide'
    }
  ],
  geprc: [
    {
      title: 'GEPRC Ranks Top 3 FPV Brands Globally with O4 Pro Integration',
      url: 'https://electronics.alibaba.com/product/gep-fpv',
      source: 'Alibaba Electronics',
      published_date: '2026-07-18',
      summary: 'GEPRC leads cinematic FPV market with rapid DJI O4 Pro integration across CineLog, Cinebot, and Mark series, projecting 22.5% growth.',
      category: 'news'
    },
    {
      title: 'GEPRC Releases Three New Models: CineLog35 V3, RACER, DarkStar16',
      url: 'https://events44.ru/news/93252',
      source: 'Airshop Russia',
      published_date: '2026-06-22',
      summary: 'GEPRC launched CineLog35 V3 O4 Pro, RACER ELRS 2.4, and DarkStar16 all featuring DJI O4 Air Unit Pro system.',
      category: 'product'
    },
    {
      title: 'GEPRC Mark 5 Review: Ultimate Freestyle Drone?',
      url: 'https://www.dronereviewhub.com/uncategorized/geprc-mark-5-review/',
      source: 'Drone Review Hub',
      published_date: '2026-07-04',
      summary: 'In-depth review of GEPRC Mark 5 flagship 5-inch RTF/BNF for freestyle and cinematic pilots, analyzing performance and durability.',
      category: 'review'
    },
    {
      title: 'Best 5-Inch FPV Drones 2026: Vapor D5 vs Mark 5 Comparison',
      url: 'https://www.zelpio.com/blog/best-5-inch-fpv-drones-2026/',
      source: 'Zelpio',
      published_date: '2026-06-28',
      summary: 'Head-to-head comparison of GEPRC Vapor D5 and Mark 5 covering F722 FC, SPEEDX2 motors, and flight performance differences.',
      category: 'guide'
    }
  ],
  radiomaster: [
    {
      title: 'RadioMaster TX16S Mark II Max - Flagship Radio Controller',
      url: 'https://radiomasterrc.com/products/tx16s-mark-ii-max-radio-controller',
      source: 'RadioMaster Official',
      published_date: '2026-07-18',
      summary: 'TX16S Mark II Max available in ELRS FCC version with AG01 CNC hall gimbals, featuring EdgeTX and multiple protocol support.',
      category: 'product'
    },
    {
      title: 'RadioMaster TX16S vs Boxer: Comprehensive Comparison',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/radiomaster-tx16s-vs-boxer',
      source: 'AliExpress',
      published_date: '2026-05-06',
      summary: 'TX16S offers versatility and advanced protocols for advanced users; Boxer provides compact ergonomics ideal for beginners with ELRS support.',
      category: 'guide'
    }
  ],
  holybro: [
    {
      title: 'Holybro Pixhawk 6C - Latest PX4 Autopilot Flight Controller',
      url: 'https://docs.px4.io/main/en/flight_controller/pixhawk6c',
      source: 'PX4 Documentation',
      published_date: '2026-07-13',
      summary: 'Pixhawk 6C features STM32H743, Bosch and InvenSense sensors, FMUv6C open standard, suitable for academic and commercial applications.',
      category: 'product'
    },
    {
      title: 'Pixhawk 6X REV8 Review: Go-To Flight Controller for Precision Builds',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/pixhawk-px6',
      source: 'AliExpress',
      published_date: '2026-04-26',
      summary: 'Pixhawk 6X REV8 with triple ICM-45686 IMU redundancy deployed in wildfire research fleets, meeting FAA Part 107 standards.',
      category: 'review'
    }
  ],
  sunnylife: [
    {
      title: 'SunnyLife Drone Accessories - Complete Guide for DJI Pilots',
      url: 'https://www.sunnylife.com/',
      source: 'Sunnylife Official',
      published_date: '2026-06-01',
      summary: 'Sunnylife manufactures landing gear, propeller guards, ND filters, and carrying cases for DJI Mavic, Air, and Mini series drones.',
      category: 'product'
    }
  ],
  frsky: [
    {
      title: 'FrSky Horus X12S - Flagship OpenTX Transmitter Review',
      url: 'https://www.modelaviation.com/FrSky-Horus-X12S',
      source: 'Model Aviation',
      published_date: '2026-07-09',
      summary: 'FrSky Horus X12S flagship transmitter running OpenTX with full telemetry, color screen, and hall sensor gimbals for serious RC pilots.',
      category: 'review'
    },
    {
      title: 'FrSky Taranis Q X7 2.4GHz ACCESS Transmitter Real-World Review',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/frsky-taranis-q-x7-2.4ghz-24channel-access-transmitter-products-info-and-review',
      source: 'AliExpress',
      published_date: '2026-06-08',
      summary: 'Taranis Q X7 offers ACCESS and D16 protocol support, reliable performance with 18650 batteries, and strong user approval in real-world use.',
      category: 'review'
    }
  ]
};

async function importArticles() {
  console.log('Importing brand articles...');
  let totalInserted = 0;

  for (const [brandSlug, articles] of Object.entries(brandArticles)) {
    // Get brand ID
    const brandResult = await db.query(
      'SELECT id FROM aegisky_brands WHERE slug = $1',
      [brandSlug]
    );

    if (brandResult.rows.length === 0) {
      console.log(`Brand not found: ${brandSlug}, skipping...`);
      continue;
    }

    const brandId = brandResult.rows[0].id;

    for (const article of articles) {
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
    console.log(`  ${brandSlug}: ${articles.length} articles`);
  }

  console.log(`\nTotal articles processed: ${totalInserted}`);

  // Count total in DB
  const countResult = await db.query('SELECT COUNT(*) FROM brand_articles');
  console.log(`Total articles in database: ${countResult.rows[0].count}`);

  process.exit(0);
}

importArticles().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
