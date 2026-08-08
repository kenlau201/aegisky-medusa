import { pool as db } from '../control-tower/db';

// Batch 2: More real articles from web search
const brandArticles: Record<string, Array<{
  title: string;
  url: string;
  source: string;
  published_date: string;
  summary: string;
  category: string;
}>> = {
  betafpv: [
    {
      title: 'BETAFPV Meteor75 Pro P1 and O4 Releases: Accessible HD FPV Flying',
      url: 'https://loyaltydrones.com/betafpv-meteor75-pro-p1-o4-accessible-hd-fpv/',
      source: 'Loyalty Drones',
      published_date: '2026-05-25',
      summary: 'BETAFPV released the Meteor75 Pro with P1 and O4 air unit options, making HD FPV more accessible for whoop pilots.',
      category: 'product'
    },
    {
      title: 'BetaFPV Meteor75 Pro Review: Lightweight Analog Tiny Whoop',
      url: 'https://www.zelpio.com/blog/betafpv-meteor75-pro-review/',
      source: 'Zelpio',
      published_date: '2026-06-28',
      summary: 'In-depth review of the BetaFPV Meteor75 Pro, a lightweight 1S analog tiny whoop for indoor and outdoor FPV.',
      category: 'review'
    },
    {
      title: 'BetaFPV Meteor65 Pro II O4 Wide HD TinyWhoop',
      url: 'https://sg.fpvfaster.com/collections/coming-soon/products/betafpv-meteor65-pro-ii-o4-wide-hd-tinywhoop-fpv-drone-elrs',
      source: 'FPVFaster',
      published_date: '2026-07-12',
      summary: 'BETAFPV launched Meteor65 Pro II with O4 Wide HD camera, bringing high-definition FPV to the 65mm whoop platform.',
      category: 'product'
    },
    {
      title: 'Best RTF Kits for Beginners - BETAFPV',
      url: 'https://betafpv.com/collections/best-fpv-kits',
      source: 'BETAFPV',
      published_date: '2026-07-21',
      summary: 'BETAFPV curated their best ready-to-fly FPV kits for beginners, including Cetus X and Aquila16 packages.',
      category: 'guide'
    },
    {
      title: 'Cetus X Brushless Quadcopter',
      url: 'https://betafpv.com/products/cetus-x-brushless-quadcopter',
      source: 'BETAFPV',
      published_date: '2026-07-07',
      summary: 'The Cetus X brushless quadcopter features upgraded motors and flight controller for improved whoop performance.',
      category: 'product'
    }
  ],
  runcam: [
    {
      title: 'RunCam Thumb Pro W Mini 4K FPV Camera Review',
      url: 'https://tr.aliexpress.com/s/wiki-ssr/article/runcam-thumb-pro',
      source: 'AliExpress',
      published_date: '2026-06-26',
      summary: 'Review of the RunCam Thumb Pro W, a mini 4K action camera designed for FPV drones with built-in WiFi.',
      category: 'review'
    },
    {
      title: 'RunCam Thumb 2 4K 60fps Camera Review',
      url: 'https://ko.aliexpress.com/s/wiki-ssr/article/RunCam-Thumb-2-4K-60fps-카메라',
      source: 'AliExpress',
      published_date: '2026-06-26',
      summary: 'The RunCam Thumb 2 offers 4K 60fps recording in an ultra-light form factor ideal for lightweight FPV builds.',
      category: 'review'
    },
    {
      title: 'Is 2.7K Camera Quality Worth It? RunCam Thumb 2 Test',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/2.7k-camera-quality',
      source: 'AliExpress',
      published_date: '2026-05-08',
      summary: 'Practical test comparing 2.7K vs 4K on the RunCam Thumb 2, evaluating whether the higher resolution matters for FPV footage.',
      category: 'guide'
    },
    {
      title: 'RunCam Link Phoenix HD Kit',
      url: 'https://shop.makerfire.com/collections/vendors?q=runcam',
      source: 'Makerfire',
      published_date: '2026-07-16',
      summary: 'RunCam Link Phoenix HD kit provides a digital HD FPV solution with low latency for racing and freestyle.',
      category: 'product'
    }
  ],
  foxeer: [
    {
      title: 'Foxeer Reaper VTX Review and Guide',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/foxeer-reaper-vtx',
      source: 'AliExpress',
      published_date: '2026-07-18',
      summary: 'Comprehensive review of the Foxeer Reaper VTX series covering power output, frequency range, and real-world performance.',
      category: 'review'
    },
    {
      title: 'Foxeer Reaper Extreme V2 5.8GHz 2.5W VTX Review',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/foxeer-reaper-extreme-v2-5.8ghz-72ch-2.5w-fpv-vtx-transmitter-products-info-and-review',
      source: 'AliExpress',
      published_date: '2026-06-08',
      summary: 'The Reaper Extreme V2 delivers up to 2.5W output on 5.8GHz with 72 channels for long-range FPV.',
      category: 'review'
    },
    {
      title: 'Foxeer Reaper 3W VTX Review',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/foxeer-reaper-3w',
      source: 'AliExpress',
      published_date: '2026-05-29',
      summary: 'Foxeer Reaper 3W pushes the limits of analog VTX power for extreme long-range and penetration flying.',
      category: 'review'
    },
    {
      title: 'Foxeer NEW ARRIVAL Products',
      url: 'https://www.foxeer.com/new-arrival-t-57',
      source: 'Foxeer',
      published_date: '2026-07-07',
      summary: 'Foxeer latest product lineup including new cameras, VTXs, and accessories for FPV drones.',
      category: 'product'
    },
    {
      title: 'Foxeer Reaper 3.3G 4W 16CH VTX Tramp',
      url: 'https://www.nanovolttech.com/product/foxeer-reaper-3-3g-4w-16ch-vtx-tramp/',
      source: 'Nanovolt Tech',
      published_date: '2026-06-30',
      summary: 'Foxeer expanded into 3.3GHz frequency with the Reaper 4W VTX for interference-free long-range flying.',
      category: 'product'
    }
  ],
  emax: [
    {
      title: 'EMAX TinyHawk III Plus RTF Bundle - HDZero',
      url: 'https://www.bestproductsreviews.com/tinyhawk-emax',
      source: 'BestProductsReviews',
      published_date: '2026-08-03',
      summary: 'EMAX released TinyHawk III Plus RTF bundle with HDZero digital video system for beginner FPV pilots.',
      category: 'product'
    },
    {
      title: 'EMAX Tinyhawk III Plus Freestyle FPV Racing Drone',
      url: 'https://www.fpvfaster.com.au/products/emax-tinyhawk-iii-plus-freestyle-analog-fpv-racing-drone-elrs-rtf-kit',
      source: 'FPVFaster',
      published_date: '2026-04-26',
      summary: 'The Tinyhawk III Plus Freestyle adds ELRS receiver and improved motors for ready-to-fly racing.',
      category: 'product'
    },
    {
      title: 'EMAX Official - Tinyhawk Nanoscout Pro',
      url: 'https://emaxmodel.com',
      source: 'EMAX',
      published_date: '2026-07-23',
      summary: 'EMAX launched the Tinyhawk Nanoscout Pro, a new micro FPV drone for beginners with improved durability.',
      category: 'product'
    },
    {
      title: 'Emax Tinyhawk III Plus BNF/RTF Racing Drone',
      url: 'https://rcdrone.top/products/emax-tinyhawk-iii-plus',
      source: 'RCDrone',
      published_date: '2026-07-10',
      summary: 'EMAX Tinyhawk III Plus available in BNF and RTF configurations with both analog and HDZero options.',
      category: 'product'
    }
  ],
  caddx: [
    {
      title: 'CADDX 2026 Milestones: Walksnail Ascent, GT2 Kit, Awards',
      url: 'https://www.caddxfpv.com.cn/about-caddx/',
      source: 'CADDX',
      published_date: '2026-08-07',
      summary: 'CADDXFPV celebrated 2026 milestones including Walksnail Ascent, GT2 Kit launch, and industry awards.',
      category: 'news'
    },
    {
      title: 'Walksnail Avatar GT2 Review: Dynamic 2W Power & 20KM Range',
      url: 'https://www.firstquadcopter.com/reviews/walksnail-avatar-gt2-review-dynamic-2w-max-output-20km-range/',
      source: 'First Quadcopter',
      published_date: '2026-06-13',
      summary: 'Walksnail Avatar GT2 delivers dynamic 2W power output and up to 20km range for HD digital FPV.',
      category: 'review'
    },
    {
      title: 'Walksnail Avatar HD Camera V2',
      url: 'https://www.caddxfpv.com/collections/walksnail-avatar-system/products/walksnail-avatar-camera-v2',
      source: 'CADDXFPV',
      published_date: '2026-07-20',
      summary: 'Avatar HD Camera V2 features improved sensor and low-light performance for Walksnail digital HD system.',
      category: 'product'
    },
    {
      title: 'CADDXFPV Official - Walksnail Avatar HD System',
      url: 'https://www.caddxfpv.com/',
      source: 'CADDXFPV',
      published_date: '2026-07-15',
      summary: 'CADDXFPV official product page for the Walksnail Avatar HD FPV system lineup.',
      category: 'product'
    }
  ],
  walksnail: [
    {
      title: 'Walksnail Avatar GT2 Review: Dynamic 2W Power & 20KM Range',
      url: 'https://www.firstquadcopter.com/reviews/walksnail-avatar-gt2-review-dynamic-2w-max-output-20km-range/',
      source: 'First Quadcopter',
      published_date: '2026-06-13',
      summary: 'Walksnail Avatar GT2 delivers dynamic 2W power output and up to 20km range for HD digital FPV.',
      category: 'review'
    },
    {
      title: 'CADDX 2026 Milestones: Walksnail Ascent, GT2 Kit, Awards',
      url: 'https://www.caddxfpv.com.cn/about-caddx/',
      source: 'CADDX',
      published_date: '2026-08-07',
      summary: 'CADDXFPV celebrated 2026 milestones including Walksnail Ascent, GT2 Kit launch, and industry awards.',
      category: 'news'
    },
    {
      title: 'Walksnail Avatar HD Camera V2',
      url: 'https://www.caddxfpv.com/collections/walksnail-avatar-system/products/walksnail-avatar-camera-v2',
      source: 'CADDXFPV',
      published_date: '2026-07-20',
      summary: 'Avatar HD Camera V2 features improved sensor and low-light performance for Walksnail digital HD system.',
      category: 'product'
    }
  ],
  speedybee: [
    {
      title: 'SpeedyBee F405 V4 BLS 55A Stack Review',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/speedy-f405-v4',
      source: 'AliExpress',
      published_date: '2026-06-08',
      summary: 'Review of the SpeedyBee F405 V4 stack with BLHeliS 55A ESC, a popular budget-friendly FC/ESC combo.',
      category: 'review'
    },
    {
      title: 'SpeedyBee F405 V5 OX32 55A Stack',
      url: 'https://www.speedybee.com/flight-controller/',
      source: 'SpeedyBee',
      published_date: '2026-05-19',
      summary: 'SpeedyBee launched F405 V5 with OX32 firmware support and 55A ESC for improved performance.',
      category: 'product'
    },
    {
      title: 'SpeedyBee F405 Mini BLS 35A Stack',
      url: 'https://insidefpv.com/products/speedybee-f405-mini-bls-35a-20x20-stack',
      source: 'InsideFPV',
      published_date: '2026-01-13',
      summary: 'The F405 Mini 20x20 stack with 35A ESC offers compact power for micro and toothpick builds.',
      category: 'product'
    }
  ],
  diatone: [
    {
      title: 'DIATONE Roma F7 6S Drone',
      url: 'https://www.diatone.us/',
      source: 'Diatone',
      published_date: '2025-10-01',
      summary: 'Diatone Roma F7 6S freestyle drone with upgraded frame and electronics for 7-inch long-range flying.',
      category: 'product'
    },
    {
      title: 'Diatone Taycan C3.1 6S Racing Drone',
      url: 'https://balticdrones.eu/products/fpv-drone-diatone-taycan-c3-1-6s-analog-pnp',
      source: 'Baltic Drones',
      published_date: '2026-04-25',
      summary: 'The Taycan C3.1 is Diatone\'s 3-inch 6S cinewhoop for cinematic FPV with duct protection.',
      category: 'product'
    },
    {
      title: 'Diatone Taycan 25 Cinewhoop',
      url: 'https://cheapdrone.co.uk/drones-drones/fpv-racing-drone/diatone-taycan-25-duct-c25-2-5-inch-4s-cinewhoop-fpv-racing-drone-pnp',
      source: 'Cheap Drones UK',
      published_date: '2026-05-27',
      summary: 'Diatone Taycan 25 is a 2.5-inch 4S cinewhoop for indoor and close-proximity cinematic filming.',
      category: 'product'
    },
    {
      title: 'Diatone FPV Drones Collection',
      url: 'https://rcdrone.top/collections/diatone-fpv-drones',
      source: 'RCDrone',
      published_date: '2026-07-14',
      summary: 'Full lineup of Diatone FPV drones including Roma, Taycan, and GTB series for various flying styles.',
      category: 'product'
    }
  ],
  flywoo: [
    {
      title: 'Flywoo FPV Drone Comparison 2026',
      url: 'https://www.flywoo.net/blogs/blog/flywoo-fpv-drone-comparison-2026',
      source: 'Flywoo',
      published_date: '2026-06-24',
      summary: 'Flywoo published a comprehensive comparison of their 2026 FPV drone lineup helping pilots choose the right model.',
      category: 'guide'
    },
    {
      title: 'Best DJI O4 FPV Drone for Beginners',
      url: 'https://www.flywoo.net/blogs/blog/best-dji-o4-fpv-drone-for-beginners',
      source: 'Flywoo',
      published_date: '2026-06-22',
      summary: 'Flywoo Explorer LR series with DJI O4 recommended as best beginner HD FPV drones for long-range.',
      category: 'guide'
    },
    {
      title: 'Explorer LR 4 V2 O4 PRO Sub250',
      url: 'https://flywoo.net/',
      source: 'Flywoo',
      published_date: '2026-07-10',
      summary: 'Flywoo Explorer LR 4 V2 with O4 Pro is a sub-250g long-range FPV drone for cinematic HD footage.',
      category: 'product'
    },
    {
      title: 'CineRace20 V2 HD DJI O3',
      url: 'https://rcdrone.top/products/cinerace20-v2-1',
      source: 'RCDrone',
      published_date: '2026-03-01',
      summary: 'Flywoo CineRace20 V2 with DJI O3 HD system is a 2-inch cinewhoop for indoor and outdoor cinematic FPV.',
      category: 'product'
    }
  ],
  hglrc: [
    {
      title: 'HGLRC Rekon35 V2 Review - Long-Range FPV on 18650',
      url: 'https://www.hglrc.com/blogs/news/review-hglrc-rekon35-v2-this-long-range-fpv-drone-runs-on-18650-li-ion-batteries',
      source: 'HGLRC',
      published_date: '2026-03-07',
      summary: 'The Rekon35 V2 runs on 18650 Li-ion batteries for extended flight times in a 3.5-inch long-range platform.',
      category: 'review'
    },
    {
      title: 'HGLRC Draco HD FPV System',
      url: 'https://www.fpv-community.de/threads/hglrc-draco-hd-fpv-system.91342/',
      source: 'FPV-Community',
      published_date: '2026-01-30',
      summary: 'HGLRC Draco HD is an integrated FPV system combining flight controller, ESC, and VTX for simplified builds.',
      category: 'product'
    }
  ],
  skyzone: [
    {
      title: 'SkyZone SKY04O Pro vs 04X Pro: FPV Goggle Comparison',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/skyzone-04o-pro-vs-04x-pro',
      source: 'AliExpress',
      published_date: '2026-05-06',
      summary: 'Detailed comparison of SkyZone SKY04O Pro OLED vs 04X Pro LCD goggles for racing and freestyle pilots.',
      category: 'guide'
    },
    {
      title: 'SkyZone Cobra X V4 Review: 8 Months Daily Use',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/cobrax',
      source: 'AliExpress',
      published_date: '2026-07-14',
      summary: 'Long-term review of the SkyZone Cobra X V4 goggles after 8 months of daily FPV flying with SteadyView receiver.',
      category: 'review'
    },
    {
      title: 'SkyZone Sky04O Pro Review: Clarity and Comfort',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/skyzone-04o',
      source: 'AliExpress',
      published_date: '2026-05-22',
      summary: 'SkyZone Sky04O Pro review covering OLED display quality, comfort for long sessions, and IPD adjustment.',
      category: 'review'
    },
    {
      title: 'SKYZONE Cobra S FPV Goggles with SteadyView',
      url: 'https://www.skyzonefpv.com/products/cobras',
      source: 'SkyZone',
      published_date: '2026-04-20',
      summary: 'SkyZone Cobra S features LCD screen with vivid colors and SteadyView receiver merging two signals for stable video.',
      category: 'product'
    }
  ],
  hdzero: [
    {
      title: 'HDZero Goggle 2: 8 Months Daily Use Review',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/goggle-2',
      source: 'AliExpress',
      published_date: '2026-06-13',
      summary: 'Long-term review of HDZero Goggle 2 after 8 months of daily use, covering digital FPV racing performance.',
      category: 'review'
    },
    {
      title: 'HDZero BoxPro Review: Ultimate Digital FPV Goggle?',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/hd-zero-box-pro',
      source: 'AliExpress',
      published_date: '2026-06-30',
      summary: 'HDZero BoxPro offers 1ms HDMI latency, 100Hz display, and 1800 nits brightness for serious digital FPV.',
      category: 'review'
    },
    {
      title: 'HDZero Goggle 2 - Enhanced Optics and Receiver',
      url: 'https://www.hd-zero.com/product-page/hdzero-goggle-2',
      source: 'HDZero',
      published_date: '2026-07-20',
      summary: 'HDZero Goggle 2 features fully enclosed optical module, <1.5% distortion, and improved analog reception.',
      category: 'product'
    },
    {
      title: 'HDZero Raceband/Lowband Switching via ELRS Backpack',
      url: 'https://github.com/hd-zero/hdzero-goggle/pull/614',
      source: 'GitHub',
      published_date: '2026-07-14',
      summary: 'New firmware feature allows race timers to retune HDZero goggles between Raceband and Lowband over ELRS backpack.',
      category: 'news'
    }
  ],
  gemfan: [
    {
      title: 'Gemfan 51466 V2 Propeller Guide: How to Choose',
      url: 'https://electronics.alibaba.com/buyingguides/gemfan-51466-v2-guide-which-prop-set-fits-your-fpv-build',
      source: 'Alibaba Electronics',
      published_date: '2026-08-05',
      summary: 'Comprehensive guide to Gemfan 51466 V2 MCK Edition, the de facto baseline prop for 5-inch FPV builds.',
      category: 'guide'
    },
    {
      title: 'GEMFAN 5127.9 Training Propeller Released',
      url: 'https://www.gemfanhobby.net/article-item-158.html',
      source: 'Gemfan',
      published_date: '2026-05-31',
      summary: 'Gemfan released 5127.9 training propeller co-developed with champion pilot Thomas Bitmatta for FPV racing practice.',
      category: 'product'
    },
    {
      title: 'Gemfan Hobby: Dominating FPV Propeller Market with 60% Share',
      url: 'https://envisionbbs.com/forums/topic/gemfan-hobby-dominating-fpv-propeller-market-with-60-share',
      source: 'Envision BBS',
      published_date: '2026-04-15',
      summary: 'Gemfan commands approximately 60% global FPV propeller market share with products from 1.2-inch to 13-inch.',
      category: 'news'
    },
    {
      title: 'Gemfan Propellers Achieve EU Compliance Verification',
      url: 'https://www.enlightenbbs.com/forums/topic/gemfan-hobby-propellers-achieve-eu-compliance-verification-advancing-uav-propulsion-expertise',
      source: 'Enlighten BBS',
      published_date: '2026-06-30',
      summary: 'Gemfan obtained EU Machinery Directive (2006/42/EC) verification for multiple propeller series including 1610, 7037, 8046.',
      category: 'news'
    },
    {
      title: 'Why Pro Pilots Choose Gemfan: Real Performance Data',
      url: 'https://www.derivedblog.com/mechanical-equipment-tool-parts/why-pro-pilots-choose-gemfan-real-performance-data.html',
      source: 'Derived Blog',
      published_date: '2026-04-15',
      summary: 'Analysis of why FPV world champions choose Gemfan propellers with aerodynamic optimization data.',
      category: 'feature'
    }
  ],
  gnb: [
    {
      title: 'GAONENG GNB 850mAh 4S LiPo Battery Performance Test',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/gnb-850mah-4s',
      source: 'AliExpress',
      published_date: '2026-06-10',
      summary: 'Lab-tested review of GNB 850mAh 4S LiPo battery with capacity verification and discharge performance data.',
      category: 'review'
    },
    {
      title: 'GAONENG Battery Official Store - FPV & RC LiPo',
      url: 'https://www.gaoneng.shop/',
      source: 'GAONENG',
      published_date: '2026-07-22',
      summary: 'GAONENG official store featuring full range of FPV, RC car, airsoft, and semi-solid LiPo batteries.',
      category: 'product'
    }
  ],
  vifly: [
    {
      title: 'FPV Drone Buzzer Guide: VIFLY Finder V2 vs Alternatives',
      url: 'https://blog.uavmodel.com/fpv-drone-buzzer-and-lost-model-alarm-guide-vifly-dshot-beacon-and-gps-find-mode/',
      source: 'UAV Model Blog',
      published_date: '2026-05-08',
      summary: 'Complete guide to FPV lost model alarms comparing VIFLY Finder V2, DShot Beacon, and GPS find modes.',
      category: 'guide'
    },
    {
      title: 'VIFLY Finder V2 - FPV Racing Drone Buzzer',
      url: 'https://viflydrone.com/products/vifly-finder-v2-fpv-racing-drone-buzzer',
      source: 'VIFLY',
      published_date: '2026-04-30',
      summary: 'VIFLY Finder V2 with ViSense technology can power itself to beep even after the quad battery is ejected.',
      category: 'product'
    },
    {
      title: 'VIFLY Finder Mini - Micro FPV Drone Buzzer at 2.7g',
      url: 'https://viflydrone.com/products/vifly-finder-mini-fpv-racing-drone-buzzer',
      source: 'VIFLY',
      published_date: '2026-04-29',
      summary: 'VIFLY Finder Mini weighs only 2.7g with up to 100dB volume, perfect for compact whoop and toothpick builds.',
      category: 'product'
    }
  ],
  mad: [
    {
      title: 'MAD COMPONENTS Confirms Third Appearance at Commercial UAV Expo 2026',
      url: 'https://stargazersarchive.com/news/mad-components-confirms-third-consecutive-appearance-at-commercial-uav-expo-2026/558691',
      source: 'Star Gazers Archive',
      published_date: '2026-08-05',
      summary: 'MAD Components returns to Commercial UAV Expo 2026 in Las Vegas with expanded industrial UAV propulsion showcase.',
      category: 'news'
    }
  ],
  siyi: [
    {
      title: 'SIYI Technology at 2026 World UAS Expo: Traceable Innovation',
      url: 'https://www.siyi.biz/en/brand/',
      source: 'SIYI',
      published_date: '2026-05-01',
      summary: 'SIYI named Top 10 Low-Altitude Economy Chain Enterprise 2026, launched E8/E3 propulsion systems at World UAS Expo.',
      category: 'news'
    },
    {
      title: 'SIYI Launches UniRC 10 and AI Training Platform at Shenzhen Drone Expo',
      url: 'http://caijing.chinadaily.com.cn/a/202605/22/WS6a0fbf79a310942cc49ada72.html',
      source: 'China Daily',
      published_date: '2026-05-22',
      summary: 'SIYI announced mixed-source open ecosystem strategy and launched UniRC 10 triple-frequency ground station at Shenzhen Drone Expo.',
      category: 'news'
    },
    {
      title: 'UniRC 10 Pro Triple-Frequency Professional Ground Control Station',
      url: 'https://soarapex.com/unirc-10-pro-triple-frequency-professional-gcs/',
      source: 'SoarApex',
      published_date: '2026-04-16',
      summary: 'UniRC 10 Pro features Android 13, 10.1-inch 2000nits display, triple-frequency bands, and AES encryption for professional UAV operations.',
      category: 'product'
    },
    {
      title: 'UniGCS v3.0 One-Stop Ground Control Station',
      url: 'https://soarapex.com/majoy-upgrade-unigcs-v3/',
      source: 'SoarApex',
      published_date: '2026-04-18',
      summary: 'SIYI UniGCS v3.0 major upgrade with one-stop parameter tuning, telemetry log playback, and intelligent route planning.',
      category: 'product'
    }
  ],
  lumenier: [
    {
      title: 'Lumenier QAV-PRO Whoop 5" Cinequads Edition Frame Kit',
      url: 'https://www.getfpv.com/lumenier-qav-pro-whoop-5-cinequads-edition-frame-kit.html',
      source: 'GetFPV',
      published_date: '2026-07-12',
      summary: 'Lumenier QAV-PRO Whoop 5 Cinequads Edition is a 5-inch cinewhoop frame for professional cinematic FPV.',
      category: 'product'
    },
    {
      title: 'Lumenier QAV-PRO Lifter 9" Cinequads Edition',
      url: 'https://www.getfpv.com/lumenier-qav-pro-lifter-cinequads-edition-drone-frame-kit.html',
      source: 'GetFPV',
      published_date: '2026-07-01',
      summary: 'QAV-PRO Lifter carries cinema cameras like RED KOMODO 6K at 86mph+ for heavy-lift cinematic FPV.',
      category: 'product'
    },
    {
      title: 'Beginner DIY FPV Drone Kit - QAV-S 2 Bardwell SE',
      url: 'https://www.lumenier.com/products/beginner-diy-fpv-drone-kit-qav-s-2-sub-250-joshua-bardwell-se-3-analog',
      source: 'Lumenier',
      published_date: '2026-07-07',
      summary: 'Lumenier QAV-S 2 Sub-250 Joshua Bardwell SE 3-inch analog DIY kit designed for freestyle FPV beginners.',
      category: 'product'
    }
  ],
  cuav: [
    {
      title: 'CUAV X7+ Core Flight Controller for PX4 Pixhawk',
      url: 'https://rcdrone.top/products/src-cuav-2328-cuav-x7-core-controller-open-source-for-px4-pixhawk',
      source: 'RCDrone',
      published_date: '2026-05-13',
      summary: 'CUAV X7+ Core features STM32H743, triple IMU redundancy, and 14 PWM outputs for professional PX4/ArduPilot systems.',
      category: 'product'
    },
    {
      title: 'CUAV V5+/X7+ Carrier Base Board Flight Controller',
      url: 'https://rcdrone.top/products/src-cuav-3068-cuav-v5-x7-carrier-base-board-flight-controller-pixhawk-for-fpv-rc-quadcopter-helicopter',
      source: 'RCDrone',
      published_date: '2026-05-21',
      summary: 'CUAV V5+ carrier board based on Pixhawk FMUv5 standard with modular design and customizable baseboard.',
      category: 'product'
    }
  ],
  gremsy: [
    {
      title: 'Gremsy to Debut at Eurosatory 2026 in Paris',
      url: 'https://gremsy.com/explore/news/gremsy-to-make-its-first-ever-exhibitor-debut-at-eurosatory-2026-in-paris',
      source: 'Gremsy',
      published_date: '2026-06-09',
      summary: 'Gremsy showcases compact gimbals including G-Hadron and MIO at Eurosatory 2026, trusted by UAV manufacturers worldwide.',
      category: 'news'
    },
    {
      title: 'Gremsy & Hexadrone Partner for Modular Drone Technology',
      url: 'https://www.unmannedsystemstechnology.com/company/gremsy/',
      source: 'Unmanned Systems Technology',
      published_date: '2026-07-22',
      summary: 'Gremsy and Hexadrone announced strategic partnership to develop integrated sovereign drone solutions.',
      category: 'news'
    },
    {
      title: 'Gremsy Mio - Compact 3-Axis Industrial Gimbal',
      url: 'https://gremsy.com/mio-store',
      source: 'Gremsy',
      published_date: '2026-07-01',
      summary: 'Gremsy Mio is a next-generation compact 3-axis camera stabilizer at $1,399 for industrial aerial systems.',
      category: 'product'
    }
  ],
  flir: [
    {
      title: 'Teledyne FLIR OEM NDAA-Compliant Thermal Imaging Solutions',
      url: 'https://oem.flir.com/ko-kr/about/news/teledyne-flir-oem-enhances-defense-readiness-with-ndaa-compliant-thermal-imaging-solutions/',
      source: 'Teledyne FLIR',
      published_date: '2025-06-18',
      summary: 'Teledyne FLIR announced NDAA compliance of Neutrino, Boson, Hadron, and Lepton thermal camera modules for US government contractors.',
      category: 'news'
    },
    {
      title: 'Teledyne FLIR Radiometric Boson+ and Hadron 640R+ Available',
      url: 'https://prep.flir.fr/news/camera-cores--components-news/teledyne-flir-oem-radiometric-thermal-boson-and-hadron-640r-dual-thermal-visible-camera-modules-now-available/',
      source: 'Teledyne FLIR',
      published_date: '2025-03-11',
      summary: 'Radiometric Boson+ and Hadron 640R+ dual thermal-visible modules now available for defense and industrial applications.',
      category: 'product'
    }
  ],
  parrot: [
    {
      title: 'Parrot ANAFI UKR Listed on GSA Advantage',
      url: 'https://www.parrot.com/en/newsroom/parrot-anafi-ukr-liste-au-catalogue-gsa-advantage',
      source: 'Parrot',
      published_date: '2025-10-09',
      summary: 'Parrot ANAFI UKR sovereign ISR micro-UAV listed on GSA Advantage for US federal agency procurement.',
      category: 'news'
    },
    {
      title: 'Parrot Anafi Defense Drones Analysis',
      url: 'https://qu3ry.net/articles/operator-intent/parrot-anafi-defense',
      source: 'qu3ry.net',
      published_date: '2026-07-01',
      summary: 'Analysis of Parrot defense pivot with ANAFI USA, USA Mil, and ANAFI Ai platforms, all Blue UAS and NDAA compliant.',
      category: 'feature'
    },
    {
      title: 'Why Parrot ANAFI USA is Best NDAA-Compliant Thermal Drone',
      url: 'https://tryquads.com/thermal-drone/why-the-parrot-anafi-usa-is-the-best-ndaa-compliant-thermal-drone-for-public-safety-and-industry/',
      source: 'TryQuads',
      published_date: '2026-02-21',
      summary: 'ANAFI USA features 4K HDR wide-angle and FLIR Boson thermal with 32x zoom for public safety and inspection.',
      category: 'guide'
    },
    {
      title: 'American Made Drones 2026: Best NDAA-Compliant U.S. Drones',
      url: 'https://www.thedroneu.com/blog/american-made-drones/',
      source: 'The Drone U',
      published_date: '2026-05-18',
      summary: 'Parrot ANAFI USA listed among most affordable NDAA/Blue UAS-compliant drones for public safety teams.',
      category: 'guide'
    }
  ],
  yuneec: [
    {
      title: 'Yuneec H520 Guide: Commercial Hexacopter Configuration',
      url: 'https://electronics.alibaba.com/buyingguides/yuneec-h520-guide-what-to-look-for-in-a-commercial-hexacopter',
      source: 'Alibaba Electronics',
      published_date: '2026-07-21',
      summary: 'Yuneec H520 hexacopter guide covering six-rotor redundancy, modular payloads, and open SDK for commercial inspection.',
      category: 'guide'
    }
  ],
  ouster: [
    {
      title: 'Ouster Acquires StereoLabs for Physical AI Sensing',
      url: 'https://www.nasdaq.com/press-release/ouster-acquires-stereolabs-creating-world-leading-physical-ai-sensing-and-perception',
      source: 'Nasdaq',
      published_date: '2026-02-09',
      summary: 'Ouster acquired StereoLabs creating unified sensing platform combining lidar, cameras, AI compute, and perception software.',
      category: 'news'
    },
    {
      title: 'ARGUS Interception and Ouster Partner for Counter-UAS',
      url: 'https://investors.ouster.com/news-releases/news-release-details/argus-interception-and-ouster-announce-strategic-agreement',
      source: 'Ouster',
      published_date: '2026-05-26',
      summary: 'ARGUS Interception equips A1-Falcon net-based counter-UAS with Ouster digital lidar for precision interception.',
      category: 'news'
    },
    {
      title: 'Ouster REV8 BABA Compliance for Federal Infrastructure',
      url: 'https://investors.ouster.com/news-releases/news-release-details/ouster-announces-build-america-buy-america-compliance-rev8-os',
      source: 'Ouster',
      published_date: '2026-06-30',
      summary: 'REV8 OS digital lidar achieved Build America Buy America compliance, unlocking federal funding for smart infrastructure.',
      category: 'news'
    },
    {
      title: 'Ouster Q2 2026: Record 17,000+ Sensors Shipped',
      url: 'https://www.marketbeat.com/instant-alerts/ouster-q2-earnings-call-highlights-2026-08-07/',
      source: 'MarketBeat',
      published_date: '2026-08-07',
      summary: 'Ouster Q2 revenue $55M up 56% YoY, shipping over 17,000 sensors including 9,000+ lidar and 8,000+ camera sensors.',
      category: 'news'
    }
  ],
  insta360: [
    {
      title: 'Insta360 X4: 8K 360 Action Camera Launch',
      url: 'https://www.insta360.com/blog/news/insta360-x4-8K-360-action-camera-endless-creative-possibility.html',
      source: 'Insta360',
      published_date: '2026-05-11',
      summary: 'Insta360 X4 delivers 8K 360 video, 5.7K60fps, and 4K100fps modes with removable lens guards and improved battery.',
      category: 'product'
    },
    {
      title: 'Insta360 X4 BMW Motorrad Limited Edition',
      url: 'https://www.insta360.com/blog/news/new-insta360-x4-bmw-motorrad-edition.html',
      source: 'Insta360',
      published_date: '2025-12-30',
      summary: 'Limited edition Insta360 X4 BMW Motorrad edition launched at EICMA for motorcycle adventure recording.',
      category: 'product'
    },
    {
      title: 'Insta360 X4 Air 8K: Lightest 360 Action Camera',
      url: 'https://www.notebookcheck.net/New-Insta360-X4-Air-8K-action-camera-launches-with-sleek-design-and-100-minutes-of-runtime.1147693.0.html',
      source: 'NotebookCheck',
      published_date: '2025-10-28',
      summary: 'Insta360 X4 Air is the lightest 8K 360 action camera with 100 minutes runtime and compatibility with X5 accessories.',
      category: 'product'
    }
  ],
  gopro: [
    {
      title: 'GoPro MISSION 1 Series: World\'s Smallest 8K Cinema Cameras',
      url: 'https://gopro.com/pt/br/news/gopro-announces-three-cameras-mission-1-2026',
      source: 'GoPro',
      published_date: '2026-04-14',
      summary: 'GoPro announced MISSION 1 series with 50MP 1" sensor and GP3 processor - the smallest 8K Open Gate cinema cameras.',
      category: 'product'
    },
    {
      title: 'GoPro MISSION 1 Now Available Globally',
      url: 'https://investor.gopro.com/press-releases/press-release-details/2026/GoPros-New-MISSION-1-Series-Cameras-Mounts-and-Accessories-Now-Available-on-Retail-Shelves-Globally-and-at-GoPro-com/default.aspx',
      source: 'GoPro Inc.',
      published_date: '2026-05-28',
      summary: 'MISSION 1, MISSION 1 PRO, and PRO Grip Edition now shipping globally with full ecosystem of mounts and accessories.',
      category: 'news'
    },
    {
      title: 'GoPro Expands MISSION 1 with Creator and Filmmaker Kits',
      url: 'https://investor.gopro.com/press-releases/press-release-details/2026/GoPro-Expands-MISSION-1-Series-Lineup-With-Creator-Edition-Vlog-Kit-Ultimate-Creator-Edition-Filmmaker-Kit-New-Media-Mod-Volta-2-Battery-Grip-and-More-All-Available-Globally/default.aspx',
      source: 'GoPro Inc.',
      published_date: '2026-07-29',
      summary: 'GoPro expanded MISSION 1 lineup with Creator Edition Vlog Kit, Filmmaker Kit, new Media Mod, and Volta 2 Battery Grip.',
      category: 'product'
    }
  ],
  garmin: [
    {
      title: 'Garmin AXIS Flight Displays Earn FAA and EASA Approval',
      url: 'https://live.ainonline.com/aviation-news/general-aviation/2026-07-23/garmin-axis-combines-gps-radio-audio-one-display',
      source: 'Aviation International News',
      published_date: '2026-07-23',
      summary: 'Garmin AXIS integrated flight display family received FAA STC and EASA certification for 11.6-inch displays.',
      category: 'news'
    },
    {
      title: 'Garmin Unveils AXIS Next-Gen Flight Displays',
      url: 'https://www.gurufocus.com/news/8949824/garmin-unveils-axis-a-new-generation-of-highly-integrated-flight-displays',
      source: 'GuruFocus',
      published_date: '2026-07-08',
      summary: 'Garmin announced AXIS family of highly integrated cockpit displays for certified piston aircraft and experimental/LSA.',
      category: 'product'
    }
  ],
  leica: [
    {
      title: 'Inside Leica Autonomous Scanning at Geo Week 2026',
      url: 'https://www.geoweeknews.com/news/inside-leica-s-autonomous-scanning-demos-at-geo-week',
      source: 'Geo Week News',
      published_date: '2026-04-01',
      summary: 'Leica demonstrated BLK2FLY autonomous drone scanning with real-time coverage feedback and GrandSLAM fusion.',
      category: 'news'
    }
  ],
  happymodel: [
    {
      title: 'Happymodel Mobula Series 2026: Industry Standard Whoops',
      url: 'https://electronics.alibaba.com/product/mobula',
      source: 'Alibaba Electronics',
      published_date: '2026-07-12',
      summary: 'Happymodel Mobula 6/7/8 remain industry standard for indoor and small-space FPV racing in 2026.',
      category: 'feature'
    },
    {
      title: 'Happymodel Crux35 ELRS V2 3.5" FPV Racing Drone',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/3.5-drone',
      source: 'AliExpress',
      published_date: '2026-04-29',
      summary: 'Crux35 ELRS V2 is one of the most capable 3.5-inch FPV racing drones for high-speed technical courses.',
      category: 'review'
    },
    {
      title: 'Mobula6 2024 V3 (2025 Edition)',
      url: 'https://www.tinywhoop.com/collections/bnf/products/mobula6-2024-v3-2025-edition',
      source: 'Tiny Whoop',
      published_date: '2026-05-26',
      summary: 'The V3 of Mobula6 2024 is Happymodel\'s 65mm analog BNF for 2025-2026 with significant upgrades.',
      category: 'product'
    },
    {
      title: 'Happymodel New Arrivals: Crux3NLR 18650 Long Range',
      url: 'https://www.happymodel.cn/index.php/news-2/',
      source: 'Happymodel',
      published_date: '2026-07-05',
      summary: 'Happymodel released Crux3NLR nano long-range FPV drone running on single 18650 battery for extended flights.',
      category: 'product'
    }
  ],
  darwinfpv: [
    {
      title: 'DarwinFPV BabyApe II 3.5" Freestyle FPV Drone',
      url: 'https://darwinfpv.com/zh/products/darwinfpv-babyape-%E2%85%B1-freestyle-fpv-drone',
      source: 'DarwinFPV',
      published_date: '2026-06-01',
      summary: 'BabyApe II available in 4S and 6S versions with 1504-3600Kv motors and ELRS 2.4GHz receiver.',
      category: 'product'
    },
    {
      title: 'DarwinFPV BabyApe III Series: 2", 3", 3.5" Sub250',
      url: 'https://www.dronecorporate.com/product/darwinfpv-babyape-pro-3-5-inch-freestyle-fpv-drone/',
      source: 'Drone Corporate',
      published_date: '2026-04-29',
      summary: 'BabyApe III launches with three sizes all under 250g, inheriting high cost-performance with full upgrades.',
      category: 'product'
    },
    {
      title: 'DarwinFPV Baby Ape Pro V3 Review: Best Under $200?',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/darwin-babyape',
      source: 'AliExpress',
      published_date: '2026-07-01',
      summary: 'Review of BabyApe Pro V3 as a reliable 3-inch FPV drone under $200 with VTX upgraded to 1200mW.',
      category: 'review'
    }
  ],
  eachine: [
    {
      title: 'Best Budget FPV Goggles in India 2025: Skyzone vs BetaFPV vs Eachine',
      url: 'https://zbotic.in/best-budget-fpv-goggles-in-india-skyzone-vs-betafpv-vs-eachine-2025-buying-guide/',
      source: 'Zbotic',
      published_date: '2026-03-11',
      summary: 'Eachine EV300O recommended as best committed-beginner FPV goggles in the 10,000-18,000 rupee range.',
      category: 'guide'
    }
  ],
  flysky: [
    {
      title: 'FS-i6 vs FS-i6X: Which FlySky Transmitter for RC Drones?',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/fs-i6-vs-fs-i6x',
      source: 'AliExpress',
      published_date: '2026-05-01',
      summary: 'Comparison of FlySky FS-i6 and FS-i6X covering backward compatibility with iA6B, X6B, and A8S receivers.',
      category: 'guide'
    },
    {
      title: 'FlySky FS-i6X: 10CH 2.4GHz AFHDS 2A Transmitter',
      url: 'https://www.flysky-cn.com/fsi6x',
      source: 'Flysky',
      published_date: '2026-06-05',
      summary: 'FS-i6X supports up to 10 channels with AFHDS 2A protocol, 4096 stick resolution, and multi-model support.',
      category: 'product'
    }
  ],
  jumper: [
    {
      title: 'Jumper T20 vs T20S: Radio Controller Comparison for FPV',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/jumper-t20-vs-t20s_1005007588607387',
      source: 'AliExpress',
      published_date: '2026-05-06',
      summary: 'T20S with RDC90 sensor gimbals vs T20 with hall gimbals, covering diversity antennas and 9km range performance.',
      category: 'guide'
    },
    {
      title: 'Jumper T22: New T20 Upgrade with 3.5" Color Screen',
      url: 'https://www.iesdouyin.com/share/video/7647394472845724954',
      source: 'Douyin',
      published_date: '2026-06-05',
      summary: 'Jumper T22 features 3.5-inch color display, H750 MCU, and new color options as T20 successor.',
      category: 'product'
    },
    {
      title: 'Jumper T-Lite V2 JP4IN1 Multi-Protocol Transmitter Review',
      url: 'https://www.aliexpress.com/s/wiki-ssr/article/jumper-t-lite-v2-jp4in1-2.4ghz-multi-protocol-open-tx-transmitter-for-rc-drone-airplane-review',
      source: 'AliExpress',
      published_date: '2026-05-28',
      summary: 'T-Lite V2 supports FrSky ACCST, DSMX, Flysky, and ExpressLRS protocols with EdgeTX firmware.',
      category: 'review'
    }
  ],
  fatshark: [
    {
      title: 'Fat Shark Dominator HDO3: 1080p OLED Digital FPV Goggles',
      url: 'https://www.fatshark.com/',
      source: 'Fat Shark',
      published_date: '2026-07-21',
      summary: 'The Dominator returns with FullHD OLED displays supporting 1080p video transmission, USB-C video out, and HD DVR.',
      category: 'product'
    },
    {
      title: 'Fat Shark Dominator HDO3 Bundle Real-World Evaluation',
      url: 'https://es.aliexpress.com/s/wiki-ssr/article/druav',
      source: 'AliExpress',
      published_date: '2026-06-04',
      summary: '75-minute flight test of Fat Shark HDO3 with no eye fatigue, internal ventilation preventing fogging.',
      category: 'review'
    }
  ],
  rushfpv: [
    {
      title: 'RUSH TANK SOLO VTX 1.6W Detailed Analysis',
      url: 'https://pt.aliexpress.com/s/wiki-ssr/article/RUSH-TANK-SOLO-VTX-1.6W',
      source: 'AliExpress',
      published_date: '2026-05-27',
      summary: 'Detailed review of RUSH TANK SOLO 1.6W VTX with Cherry antenna recommendations for circular polarization.',
      category: 'review'
    },
    {
      title: 'RUSHFPV Cherry V2 5.8GHz Antenna - 30% Smaller, 20% Lighter',
      url: 'https://wrekd.com/products/rushfpv-cherry-ii-straight-extended-5-8ghz-sma-antenna-2-pack-choose-polarization',
      source: 'WREKD',
      published_date: '2026-05-29',
      summary: 'Cherry II antenna reduced volume by 30% and weight by 20% with SMA, MMCX, and U.FL connector options.',
      category: 'product'
    },
    {
      title: 'TANK RACE II VTX - Compact 5.8GHz Racing Transmitter',
      url: 'https://rushfpv.net/products/tank-race-ii-vtx',
      source: 'RUSHFPV',
      published_date: '2026-04-16',
      summary: 'Tank Race II is even smaller and lighter at 1.7g, designed for racing and freestyle with 48 channels.',
      category: 'product'
    }
  ]
};

async function importArticles() {
  console.log('Importing batch 2 brand articles...');
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

  // Count brands with articles
  const brandCountResult = await db.query('SELECT COUNT(DISTINCT brand_id) FROM brand_articles');
  console.log(`Brands with articles: ${brandCountResult.rows[0].count}`);

  process.exit(0);
}

importArticles().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
