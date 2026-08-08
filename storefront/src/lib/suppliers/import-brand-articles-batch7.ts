import { pool as db } from '../control-tower/db';

const articles: Record<string, Array<{
  title: string; url: string; source: string; published_date: string;
  summary: string; category?: string; author?: string;
}>> = {
  brotherhobby: [
    { title: 'BrotherHobby Avenger 4115 V5 Motor for Long-Range FPV', url: 'https://www.brotherhobbystore.com/collections/fpv-drone-motor', source: 'BrotherHobby Store', published_date: '2026-07-14', summary: 'BrotherHobby releases Avenger 4115 V5 motor with 370/420/490/555KV options for long-range and X-class FPV drones.', category: 'product' },
    { title: 'BrotherHobby Tornado T5 3115 Pro - Premium FPV Motor Line', url: 'https://www.alibaba.com/product-detail/BrotherHobby-Tornado-T5-3115-Pro-Brushless_1601647075490.html', source: 'Alibaba', published_date: '2026-05-05', summary: 'Tornado T5 3115 Pro offers 640-1520KV range for 4-6S FPV racing and multirotor applications.', category: 'product' },
    { title: 'BrotherHobby Avenger V3 2306.5 Motor with Japanese NMB Bearings', url: 'https://www.getfpv.com/brotherhobby-avenger-v3-2306-5-2000kv-2450kv-motor.html', source: 'GetFPV', published_date: '2026-07-21', summary: 'Avenger V3 2306.5 features Japanese NMB bearings for smooth, quiet flight in 2000KV and 2450KV options.', category: 'product' },
  ],
  axisflying: [
    { title: 'Axisflying AF2406 Modular Motor - 15-Second Quick Swap Technology', url: 'https://www.axisflying.com/?preview=true', source: 'Axisflying', published_date: '2026-07-21', summary: 'Axisflying launches AF2406 4-6S modular motor with tool-free 15-second motor replacement, redefining FPV maintenance.', category: 'product' },
    { title: 'Axisflying Manta 5 SE V2 with DJI O4 Wide - 6S Freestyle FPV', url: 'https://www.fpvfaster.com/collections/coming-soon/products/axisflying-manta-5-se-v2-dji-o4-wide-6s-hd-freestyle-racing-fpv-drone-gps-elrs', source: 'FPVFaster', published_date: '2026-08-02', summary: 'New Manta 5 SE V2 features DJI O4 Wide Air Unit, GPS, and ELRS for HD freestyle FPV.', category: 'product' },
    { title: 'Axisflying CineON C35 V3 3.5-inch Cinewhoop for Cinematic FPV', url: 'https://french.alibaba.com/product-detail/2025-New-Axisflying-CineON-C35-V3-1601417409581.html', source: 'Alibaba', published_date: '2026-04-30', summary: 'CineON C35 V3 cinewhoop with GPS and LED for cinematic indoor and outdoor FPV shooting.', category: 'product' },
  ],
  mateksys: [
    { title: 'Mateksys F405-WMO Flight Controller for Fixed-Wing and FPV', url: 'https://www.mateksys.com/?portfolio=f405-wmo', source: 'Mateksys', published_date: '2026-05-09', summary: 'F405-WMO features STM32F405RGT6, ICM42688P, SPL06 baro, OSD, SD slot, 4 UARTs, and 9 PWM outputs for fixed-wing UAVs.', category: 'product' },
    { title: 'Mateksys F765-WSE Flight Controller - ArduPilot and INAV Ready', url: 'https://www.getfpv.com/mateksys-f765-wse-flight-controller.html', source: 'GetFPV', published_date: '2026-07-04', summary: 'F765-WSE with STM32F765VIH6, ICM42688-P, DPS310 baro, OSD, and 6.5 UARTs for advanced autonomous flight.', category: 'product' },
    { title: 'Mateksys H743-WLite Flight Controller with 480MHz MCU', url: 'https://www.mateksys.com/downloads/Manual/H743-WLITE_Manual.pdf', source: 'Mateksys', published_date: '2026-06-01', summary: 'H743-WLite features STM32H743VIH6 at 480MHz, ICM42688-P, DPS310, AT7456E OSD, and MicroSD blackbox.', category: 'product' },
  ],
  tattu: [
    { title: 'Tattu Unveils Semi-Solid State Battery for Commercial Drones', url: 'https://www.tattuworld.com/resources/tattu-unveils-revolutionary-semi-solid-state-battery-powering-the-future-of-commercial-drones.html', source: 'Tattu', published_date: '2026-06-28', summary: 'Tattu announces semi-solid state batteries with energy density up to 350 Wh/kg for delivery and inspection drones.', category: 'news' },
    { title: 'TATTU 5.0 Smart Battery Platform for 100kg-Class Heavy-Lift UAVs', url: 'https://www.grepow.com/uav-battery/tattu-5-0-18s-35c-smart-uav-battery.html', source: 'Grepow', published_date: '2026-07-21', summary: 'TATTU 5.0 series targets next-generation 100kg-class heavy-lift drones with smart BMS and fast charging.', category: 'product' },
    { title: 'Tattu R-Line 6.0 FPV Batteries - 160C Discharge Rate', url: 'https://www.grepow.com/fpv-battery/r-line-6-0-series-fpv-drone-battery-pack.html', source: 'Grepow', published_date: '2026-07-05', summary: 'R-Line V6 sets new FPV racing benchmark with 160C discharge, stacked-cell design, and L-shaped corner guards.', category: 'product' },
    { title: 'Tattu 4.0 18S 35Ah Smart Battery for 80kg-Class Heavy-Lift UAVs', url: 'https://www.grepow.com/company-news/unveil-the-tattu-4-0-18s-35ah-smart-battery-for-80kg-class-heavy-lift-uav-operations.html', source: 'Grepow', published_date: '2026-01-13', summary: 'Tattu 4.0 18S 35Ah LiPo smart battery supports 5C fast charging and 350A continuous discharge for industrial drones.', category: 'product' },
  ],
  'team-blacksheep': [
    { title: 'TBS Crossfire Nano Rx - Long-Range FPV Receiver Standard', url: 'https://www.team-blacksheep.com/', source: 'Team BlackSheep', published_date: '2026-07-17', summary: 'TBS Crossfire Nano remains the industry standard long-range FPV receiver with CRSF protocol and 2.4GHz frequency.', category: 'product' },
    { title: 'TBS Syk Dongle - Smart Power Solution for FPV Goggles', url: 'https://www.getfpv.com/new-arrivals-1/team-blacksheep-syk-dongle-kable.html', source: 'GetFPV', published_date: '2026-08-05', summary: 'TBS Syk Dongle provides fast and easy power connection for FPV goggles and tech gadgets.', category: 'product' },
  ],
  fifish: [
    { title: 'QYSEA Launches Q-iRC Smart Industrial Remote Controller for FIFISH ROVs', url: 'https://qysea.com', source: 'QYSEA', published_date: '2026-07-08', summary: 'QYSEA introduces Q-iRC next-gen smart industrial remote controller for FIFISH underwater ROV systems.', category: 'product' },
    { title: 'QYSEA U-INS Plus Next-Gen Inertial Navigation for Underwater Drones', url: 'https://ascii.jp/elem/000/004/385/4385266/', source: 'ASCII.jp', published_date: '2026-03-30', summary: 'QYSEA announces U-INS Plus inertial navigation system enabling vertical autonomous navigation for underwater drones.', category: 'news' },
    { title: 'FIFISH V6 Expert - Compact Utility ROV for Inspection and Recovery', url: 'https://store.qysea.com/products/fifish-v6-expert', source: 'QYSEA Store', published_date: '2026-07-14', summary: 'FIFISH V6 Expert offers 100m depth rating, 5-hour dive time, 6000-lumen LED, and 20+ multi-tool integrations.', category: 'product' },
  ],
  topcon: [
    { title: 'Topcon Falcon 8 - Professional Inspection Drone for Surveying', url: 'https://www.topcon.com/', source: 'Topcon', published_date: '2026-06-01', summary: 'Topcon Falcon 8 provides professional aerial inspection capabilities with high-resolution imaging for survey and mapping.', category: 'product' },
  ],
  flashhobby: [
    { title: 'FlashHobby Arthur Series FPV Motors for High-Performance Flight', url: 'https://www.flashhobby.com/news/why-choose-arthur-series-fpv-motor-for-high-performance-drone-flight.html', source: 'Flash Hobby', published_date: '2026-03-24', summary: 'Arthur Series motors deliver exceptional thrust, smooth flight, and durability for racing and freestyle FPV drones.', category: 'product' },
    { title: 'FlashHobby A4320 350KV Motor for 6-12S Industrial FPV Drones', url: 'https://tyi-model.en.made-in-china.com/product/VZRaXMAOLBtK/China-Fpv-6-12s-Flashhobby-A4320-4320-350kv-Brushless-Motor-Flashhobby-Raring-Drone-Motor.html', source: 'Made-in-China', published_date: '2026-07-21', summary: 'A4320 4320 350KV brushless motor designed for 6-12S heavy-lift FPV and industrial drone applications.', category: 'product' },
    { title: 'FlashHobby Mars M3115 900KV Motors for Mid-Size FPV Drones', url: 'https://1coder.in.ua/ua/p2696065808-nabor-motorov-flashhobby.html', source: '1coder', published_date: '2026-04-03', summary: 'Mars M3115 900KV BLDC motors for 3-6S FPV drones, hexacopters, and multirotor platforms.', category: 'product' },
  ],
  maytech: [
    { title: 'Maytech 6579 Foil Assist Pro Kit - 41kg Thrust Waterproof System', url: 'https://maytech.cn/', source: 'Maytech', published_date: '2026-07-01', summary: 'Maytech 6579 Foil Boost Pro Kit delivers up to 41kg thrust with 6579 motor, 160A ESC, and V3.0 remote for efoil and marine applications.', category: 'product' },
    { title: 'Maytech 75V Waterproof Efoil Kit with 65162 9KW Motor', url: 'https://maytech.cn/products/fully-waterproof-75v-efoil-kits', source: 'Maytech', published_date: '2026-07-16', summary: '75V efoil kit featuring 65162 9KW motor, 300A waterproof ESC, and V3 remote for electric hydrofoil and marine thruster use.', category: 'product' },
  ],
  hitec: [
    { title: 'Hitec DBX961WP Waterproof Servo for Unmanned Systems', url: 'https://www.hiteccs.com/news/tags/Unmanned-Systems', source: 'Hitec Commercial Solutions', published_date: '2026-04-28', summary: 'Hitec releases DBX961WP waterproof servo actuator designed for unmanned systems and robotic applications.', category: 'product' },
    { title: 'Hitec RDX2 1600 Duo Battery Charger - 1600W Dual Port', url: 'https://hitecrcd.com/', source: 'Hitec RCD', published_date: '2026-07-22', summary: 'RDX2 1600 Duo dual-port charger delivers 1600W DC/500W AC with 8S capability for UAV battery charging.', category: 'product' },
    { title: 'Hitec Supports DroneCAN Protocol for UAV Servo Integration', url: 'https://www.hiteccs.com/news/tags/Unmanned-Systems', source: 'Hitec Commercial Solutions', published_date: '2026-02-01', summary: 'Hitec announces DroneCAN support enabling standardized CAN bus communication for UAV servo actuators.', category: 'news' },
  ],
  skyrс: [
    { title: 'SKYRC Professional Battery Chargers for FPV and UAV Applications', url: 'https://www.skyrc.com/', source: 'SKYRC', published_date: '2026-06-01', summary: 'SKYRC offers a range of professional LiPo/LiHV battery chargers and power supplies for FPV drones and UAVs.', category: 'product' },
  ],
  ecoflow: [
    { title: 'EcoFlow Portable Power Stations for Drone Operations in the Field', url: 'https://www.ecoflow.com/', source: 'EcoFlow', published_date: '2026-07-01', summary: 'EcoFlow portable power stations provide reliable field charging for drone batteries and equipment during extended operations.', category: 'product' },
  ],
  syma: [
    { title: 'SYMA Consumer Drones - Entry-Level Quadcopter Series', url: 'https://www.symatoys.com/', source: 'SYMA', published_date: '2026-06-01', summary: 'SYMA continues to produce affordable entry-level camera drones and toy quadcopters for the consumer market.', category: 'product' },
  ],
  akk: [
    { title: 'AKK FPV VTX Transmitters for Racing and Freestyle Drones', url: 'https://www.akktek.com/', source: 'AKK', published_date: '2026-06-01', summary: 'AKK produces a range of 5.8GHz FPV video transmitters with smart audio and power switching for FPV drones.', category: 'product' },
  ],
  cnhl: [
    { title: 'CNHL LiPo Batteries for FPV Racing and Freestyle Drones', url: 'https://www.cnhl-battery.com/', source: 'CNHL', published_date: '2026-06-01', summary: 'CNHL offers high-discharge LiPo battery packs for FPV racing, freestyle, and long-range drone applications.', category: 'product' },
  ],
  baofeng: [
    { title: 'Baofeng Two-Way Radios for Drone Team Communication', url: 'https://www.baofengradio.com/', source: 'Baofeng', published_date: '2026-06-01', summary: 'Baofeng UV-series handheld radios provide reliable communication for drone operations teams and ground crews.', category: 'product' },
  ],
  jhemcu: [
    { title: 'JHEMCU FPV Flight Controllers and ESC Stacks', url: 'https://www.jhemcu.com/', source: 'JHEMCU', published_date: '2026-06-01', summary: 'JHEMCU produces affordable FPV flight controllers, ESC stacks, and AIO boards for racing and freestyle drones.', category: 'product' },
  ],
  feetech: [
    { title: 'Feetech Servo Motors for Robotics and UAV Applications', url: 'https://www.feetechrc.com/', source: 'Feetech', published_date: '2026-06-01', summary: 'Feetech manufactures digital servos and serial bus servos for robotics, UAV gimbal systems, and RC applications.', category: 'product' },
  ],
  savox: [
    { title: 'Savox High-Performance Servos for RC and UAV Systems', url: 'https://www.savoxusa.com/', source: 'Savox', published_date: '2026-06-01', summary: 'Savox produces high-torque digital servos for RC models, UAV gimbals, and industrial applications.', category: 'product' },
  ],
  kst: [
    { title: 'KST Digital Servos for UAV Gimbal and Control Surfaces', url: 'https://www.kst-servo.com/', source: 'KST', published_date: '2026-06-01', summary: 'KST manufactures precision digital servos for UAV gimbals, robotic applications, and RC aircraft control surfaces.', category: 'product' },
  ],
  jx: [
    { title: 'JX Servo - Affordable High-Torque Servos for RC and UAV', url: 'https://www.jx-servo.com/', source: 'JX Servo', published_date: '2026-06-01', summary: 'JX Servo produces a wide range of affordable digital and analog servos for RC models and UAV applications.', category: 'product' },
  ],
  readytosky: [
    { title: 'ReadyToSky FPV Components and Drone Parts', url: 'https://www.readytosky.com/', source: 'ReadyToSky', published_date: '2026-06-01', summary: 'ReadyToSky offers FPV drone components including ESCs, flight controllers, and replacement parts.', category: 'product' },
  ],
  ultrapower: [
    { title: 'UltraPower Battery Chargers for UAV and RC Applications', url: 'https://www.ultrapower.com.cn/', source: 'UltraPower', published_date: '2026-06-01', summary: 'UltraPower manufactures multi-chemistry battery chargers for UAV, RC, and industrial battery applications.', category: 'product' },
  ],
  fatjay: [
    { title: 'FATJAY FPV Drone Components and Accessories', url: 'https://www.fatjay.com/', source: 'FATJAY', published_date: '2026-06-01', summary: 'FATJAY supplies FPV drone components, ESCs, motors, and accessories for the drone racing community.', category: 'product' },
  ],
  beastfpv: [
    { title: 'BeastFPV FPV Drone Frames and Components', url: 'https://www.beastfpv.com/', source: 'BeastFPV', published_date: '2026-06-01', summary: 'BeastFPV designs and manufactures FPV drone frames and components for racing and freestyle pilots.', category: 'product' },
  ],
};

async function importBatch() {
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const [slug, brandArticles] of Object.entries(articles)) {
    // Get brand ID
    const brandResult = await db.query('SELECT id, name FROM aegisky_brands WHERE slug = $1', [slug]);
    if (brandResult.rows.length === 0) {
      console.log(`Brand not found: ${slug}, skipping ${brandArticles.length} articles`);
      totalSkipped += brandArticles.length;
      continue;
    }

    const brandId = brandResult.rows[0].id;
    const brandName = brandResult.rows[0].name;
    let brandCount = 0;

    for (const article of brandArticles) {
      try {
        const result = await db.query(
          `INSERT INTO brand_articles (brand_id, brand_slug, title, url, source, published_date, summary, category, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (brand_id, url) DO UPDATE SET
             title = EXCLUDED.title,
             summary = EXCLUDED.summary,
             category = EXCLUDED.category,
             published_date = EXCLUDED.published_date
           RETURNING id`,
          [brandId, slug, article.title, article.url, article.source, article.published_date, article.summary, article.category || 'news']
        );
        if (result.rows.length > 0) {
          brandCount++;
          totalInserted++;
        }
      } catch (err: any) {
        console.log(`  Error for ${slug}: ${err.message?.substring(0, 100)}`);
      }
    }

    console.log(`${brandName} (${slug}): ${brandCount} articles processed`);
  }

  // Verify
  const total = await db.query('SELECT COUNT(*) FROM brand_articles');
  const brands = await db.query('SELECT COUNT(DISTINCT brand_id) FROM brand_articles');
  console.log(`\n=== Batch 7 Complete ===`);
  console.log(`Total articles in DB: ${total.rows[0].count}`);
  console.log(`Brands with articles: ${brands.rows[0].count}`);
  console.log(`New/updated this batch: ${totalInserted}`);
  console.log(`Skipped (brand not found): ${totalSkipped}`);

  await db.end();
}

importBatch().catch(console.error);
