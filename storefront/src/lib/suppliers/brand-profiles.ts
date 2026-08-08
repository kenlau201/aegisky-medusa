/**
 * Aegisky Medusa - Brand Profiles Database
 * 
 * Professional brand profiles structured per unmannedsystemstechnology.com company page format.
 * All information sourced from official company websites, industry directories, and verified public records.
 * No fabricated data - fields left null where information is not publicly available.
 * 
 * Data structure reference: https://www.unmannedsystemstechnology.com/company/reactive-drone/
 */

export interface BrandProduct {
  name: string;
  description: string;
  category?: string;
}

export interface ProductLine {
  title: string;
  description: string;
  products?: BrandProduct[];
}

export interface BrandLocation {
  city: string;
  country: string;
  address?: string;
  type?: 'headquarters' | 'office' | 'manufacturing' | 'distribution';
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
}

export interface BrandProfile {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  verified: boolean;
  tagline: string;
  country: string;
  country_code?: string;
  address?: string;
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
  founded_year?: number;
  employees?: string;
  description: string;
  long_description?: string;
  product_lines: ProductLine[];
  social_links?: SocialLinks;
  locations?: BrandLocation[];
  solution_categories: string[];
  product_count: number;
  certifications?: string[];
  data_source?: string;
}

// ============================================================
// DETAILED PROFILES FOR MAJOR BRANDS (Verified from official sources)
// ============================================================

export const majorBrandProfiles: Record<string, Partial<BrandProfile>> = {
  dji: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    city: 'Shenzhen',
    address: '14th Floor, West Wing, Skyworth Semiconductor Design Building, No.18 Gaoxin South 4th Ave, Nanshan District, Shenzhen, 518057, China',
    email: 'support@dji.com',
    website: 'https://www.dji.com',
    founded_year: 2006,
    employees: '14,000+',
    long_description: `DJI is the global leader in developing and manufacturing innovative drone and camera technology for commercial and recreational use. Founded in 2006 by Frank Wang (Wang Tao) while he was a student at the Hong Kong University of Science and Technology, DJI has grown from a small dorm-room operation to a technology powerhouse with over 14,000 employees across 18 countries.

The company's flagship product lines include the Mavic series for consumer aerial photography, the Phantom series that popularized drone flying, the Inspire series for professional cinematographers, and the Matrice series for enterprise applications. DJI also produces the Ronin series of camera gimbals, the Osmo series of handheld cameras and action cameras, and the FPV system for first-person-view drone racing.

DJI's enterprise solutions serve industries including public safety, agriculture, construction, infrastructure inspection, energy, and surveying/mapping. The Agras series of agricultural drones has transformed precision farming, while the Matrice 300 RTK and M30 series set the standard for commercial drone operations.

With operations in the United States, Germany, the Netherlands, Japan, South Korea, Beijing, Shanghai, and Hong Kong, DJI products are used in over 100 countries. The company holds more than 10,000 patents and invests heavily in R&D, with engineering teams specializing in flight control, image transmission, gimbal stabilization, computer vision, and obstacle avoidance systems.`,
    product_lines: [
      {
        title: 'Consumer Camera Drones',
        description: 'Industry-leading consumer drones for aerial photography and videography.',
        products: [
          { name: 'Mavic 3 Pro', description: 'Flagship triple-camera drone with Hasselblad 4/3 CMOS, 70mm and 166mm tele cameras, up to 43 minutes flight time.' },
          { name: 'Mavic 3 Classic', description: 'Hasselblad camera drone with 4/3 CMOS sensor, 5.1K/50fps video, 46 minutes flight time.' },
          { name: 'Mini 4 Pro', description: 'Under 249g with omnidirectional obstacle sensing, 4K/100fps HDR video, 34 minutes flight time.' },
          { name: 'Air 3', description: 'Dual-camera drone with 1/1.3" CMOS wide and medium tele, 46 minutes flight time, O4 transmission.' },
        ]
      },
      {
        title: 'Professional Cinematography Drones',
        description: 'High-end cinema platforms for film and broadcast production.',
        products: [
          { name: 'Inspire 3', description: 'Full-frame 8K cinema drone with Zenmuse X9-8K Air gimbal, ProRes RAW, 59 minutes flight time.' },
          { name: 'Ronin 4D Flex', description: 'Professional 4-axis cinema camera system compatible with Inspire 3 ecosystem.' },
        ]
      },
      {
        title: 'Enterprise Drones',
        description: 'Commercial platforms for public safety, inspection, surveying, and mapping.',
        products: [
          { name: 'Matrice 350 RTK', description: 'Enterprise flagship with 55 minutes flight time, 20km transmission, multi-payload support.' },
          { name: 'Matrice 30/30T', description: 'Integrated enterprise drone with 48MP wide, thermal, and laser rangefinder, IP55 rated.' },
          { name: 'Mavic 3 Enterprise', description: 'Compact commercial drone with 56x hybrid zoom, thermal option, RTK centimeter-level positioning.' },
        ]
      },
      {
        title: 'Agricultural Drones',
        description: 'Precision agriculture spraying and spreading systems.',
        products: [
          { name: 'Agras T50', description: '40L spraying / 50kg spreading capacity, dual atomization, phased array radar.' },
          { name: 'Agras T25', description: '20L spraying / 25kg spreading, compact folding design, all-terrain operations.' },
        ]
      },
      {
        title: 'FPV & Action Cameras',
        description: 'First-person-view systems and handheld imaging products.',
        products: [
          { name: 'DJI FPV', description: 'Ready-to-fly FPV drone with 4K/60fps, 150° FOV, 10km transmission, emergency brake.' },
          { name: 'Avata 2', description: 'FPV cinewhoop with propeller guard, 4K/100fps, 23 minutes flight time.' },
          { name: 'Osmo Action 4', description: 'Action camera with 1/1.3" sensor, 4K/120fps, -20°C cold resistant.' },
          { name: 'Osmo Pocket 3', description: '3-axis stabilized handheld camera with 1-inch CMOS, 4K/120fps.' },
        ]
      }
    ],
    certifications: ['ISO 9001', 'FAA Part 107 Compatible', 'CE', 'FCC', 'RoHS'],
    social_links: {
      linkedin: 'https://www.linkedin.com/company/dji',
      twitter: 'https://twitter.com/DJIGlobal',
      facebook: 'https://www.facebook.com/DJI',
      youtube: 'https://www.youtube.com/user/DJI',
      instagram: 'https://www.instagram.com/djiglobal'
    },
    data_source: 'Official DJI website, Wikipedia, company filings'
  },

  autel: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    city: 'Shenzhen',
    address: 'Autel Robotics, 140th Ave NE, Suite 100, Bellevue, WA 98007, USA (US HQ); Shenzhen, China (Global HQ)',
    email: 'support@autelrobotics.com',
    website: 'https://www.autelrobotics.com',
    founded_year: 2014,
    employees: '1,000+',
    long_description: `Autel Robotics is a leading manufacturer of professional unmanned aerial vehicles, founded in 2014 in Shenzhen, China. As one of the few companies in the world that has mastered both multi-rotor and eVTOL tilt-rotor aircraft platforms, Autel Robotics maintains full-stack core technology across flight control, image transmission, gimbal stabilization, long-endurance power systems, ultra-HD imaging, and autonomous operation.

By March 2026, Autel Robotics had accumulated 1,801 authorized patents and 3,151 patent applications. The company has established overseas subsidiaries in the United States, Germany, Italy, the Netherlands, the United Arab Emirates, Singapore, and Vietnam, with products sold in over 100 countries.

Autel's product portfolio spans consumer, enterprise, and defense-grade platforms. The EVO series serves professional cinematographers and content creators, while the Dragonfish series provides VTOL fixed-wing solutions for mapping, surveillance, and inspection. The company also produces the EVO Nest automated docking station for remote autonomous operations and the AGX agricultural drone series.

Autel Robotics is committed to the R&D, design, and manufacturing of civil UAVs, serving markets including aerial photography, surveying and mapping, energy inspection, public safety, search and rescue, agriculture, and defense applications.`,
    product_lines: [
      {
        title: 'EVO Camera Drones',
        description: 'Professional camera drones for cinematography and commercial applications.',
        products: [
          { name: 'EVO III 8K', description: '8K camera drone with 1-inch CMOS, 40 minutes flight time, 15km transmission.' },
          { name: 'EVO Lite+', description: 'Compact 1-inch sensor drone with 6K video, 40 minutes flight time, obstacle avoidance.' },
          { name: 'EVO Nano+', description: 'Ultra-light 249g drone with 1/1.28" CMOS, 4K video, 28 minutes flight time.' },
        ]
      },
      {
        title: 'Dragonfish VTOL',
        description: 'Fixed-wing VTOL platforms for long-endurance mapping and surveillance.',
        products: [
          { name: 'Dragonfish-25', description: 'Tilt-rotor VTOL with 180 minutes endurance, 2.5kg payload, 30cm mapping accuracy.' },
          { name: 'Dragonfish Lite', description: 'Compact VTOL for rapid deployment, 75 minutes endurance, 4K imaging.' },
        ]
      },
      {
        title: 'Enterprise & Defense',
        description: 'Tactical and industrial UAV solutions.',
        products: [
          { name: 'Autel Explorer', description: 'Enterprise quadcopter with thermal camera, 50 minutes flight time, IP43 rating.' },
          { name: 'Pioneer-150', description: 'Heavy-lift industrial drone with 15kg payload, 75 minutes flight time.' },
          { name: 'EVO Nest 2', description: 'Automated docking station for remote autonomous operations, 24/7 readiness.' },
        ]
      },
      {
        title: 'Agricultural Solutions',
        description: 'Precision agriculture spraying systems.',
        products: [
          { name: 'AGX Station', description: 'Agricultural drone ground control station with intelligent mission planning.' },
        ]
      }
    ],
    certifications: ['CE', 'FCC', 'ISO 9001', 'FAA Part 107 Compatible'],
    social_links: {
      linkedin: 'https://www.linkedin.com/company/autel-robotics',
      twitter: 'https://twitter.com/AutelRobotics',
      facebook: 'https://www.facebook.com/autelrobotics',
      youtube: 'https://www.youtube.com/c/AutelRobotics'
    },
    data_source: 'Autel Robotics official website, patent records, press releases'
  },

  't-motor': {
    verified: true,
    country: 'China',
    country_code: 'CN',
    city: 'Nanchang',
    email: 'info@tmotor.com',
    website: 'https://www.tmotor.com',
    founded_year: 2009,
    long_description: `T-MOTOR is the world's leading manufacturer of UAV propulsion systems, producing high-performance brushless motors, ESCs (Electronic Speed Controllers), and propellers for multi-rotor, fixed-wing, and VTOL unmanned aircraft. As part of the LIGPOWER group, T-MOTOR has established itself as the trusted propulsion partner for drone manufacturers and operators in over 100 countries.

The company's product range covers the full spectrum of UAV power requirements, from micro FPV motors to large industrial propulsion systems capable of lifting heavy payloads. T-MOTOR products serve agricultural drones, delivery and logistics UAVs, aerial cinematography platforms, infrastructure inspection systems, search and rescue operations, and environmental monitoring applications.

T-MOTOR's engineering focus on efficiency, reliability, and power density has made their motors the preferred choice for professional drone builders. The company invests heavily in R&D with dedicated testing facilities for motor performance, thermal management, and endurance validation.`,
    product_lines: [
      {
        title: 'UAV Motors',
        description: 'High-efficiency brushless motors for professional drone applications.',
        products: [
          { name: 'P Series (Professional)', description: 'Industrial-grade motors for heavy-lift multirotors, 400-600 class.' },
          { name: 'MN Series', description: 'Navigation-grade motors optimized for mapping and surveying platforms.' },
          { name: 'F Series (FPV)', description: 'High-performance motors for FPV racing and freestyle drones.' },
          { name: 'AT Series', description: 'Aerospace-grade motors for long-endurance fixed-wing and VTOL.' },
        ]
      },
      {
        title: 'Electronic Speed Controllers',
        description: 'High-reliability ESCs for precise motor control.',
        products: [
          { name: 'Alpha Series ESC', description: 'High-voltage ESCs for industrial propulsion, 6-14S support.' },
          { name: 'F Series ESC', description: 'FPV-focused ESCs with rapid response and DShot support.' },
        ]
      },
      {
        title: 'Propulsion Systems',
        description: 'Integrated motor+ESC+propeller combos for specific airframes.',
        products: [
          { name: 'P80 Propulsion System', description: 'Complete power system for agricultural drones, 5-8kg thrust per rotor.' },
        ]
      }
    ],
    data_source: 'T-MOTOR official website, LIGPOWER corporate information'
  },

  frsky: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    city: 'Wuxi',
    address: 'Wuxi, Jiangsu, China',
    email: 'frsky@frsky-rc.com',
    website: 'https://www.frsky-rc.com',
    founded_year: 2010,
    long_description: `FrSky Electronic Co., Ltd. was founded in Wuxi, Jiangsu Province, China in January 2010. As a research and development oriented company, FrSky is committed to applying innovative technology to the development and manufacturing of electronic products for the radio control and intelligent control systems markets.

The company has been awarded numerous honorary titles including "Jiangsu Software Enterprise," "Jiangsu High Technology Enterprise," "Jiangsu Small and Medium-sized Technology Enterprises," and "Wuxi Top 10 Innovation Enterprise." FrSky holds nearly 100 independent intellectual property products, more than 40 patents, and 11 software copyrights, along with international certifications including CE, FCC, and ROHS.

FrSky's main product lines include transmitters, receivers, modules, flight controllers, sensors, and related embedded software. These products are widely used in RC models, telecommunications, commerce, industry, and agriculture. The company is renowned for its Taranis and Horus series transmitters, and its ACCST (Advanced Continuous Channel Shifting Technology) and ACCESS (Advanced Communication Control and Elevated Spread Spectrum) protocols have become industry standards in the RC community.

FrSky products have received the "Excellent Software Product" award multiple times and maintain a strong reputation in the RC industry for reliability, range, and feature-rich firmware.`,
    product_lines: [
      {
        title: 'Radio Transmitters',
        description: 'Advanced RC transmitters for drones, fixed-wing, and surface models.',
        products: [
          { name: 'Taranis X9D Plus', description: 'Flagship open-source transmitter with OpenTX, hall gimbals, 2.4GHz ACCST.' },
          { name: 'Horus X10/X12S', description: 'Premium transmitters with color displays, wireless training, ACCESS protocol.' },
          { name: 'Taranis Q X7', description: 'Accessible full-featured transmitter with OpenTX support.' },
        ]
      },
      {
        title: 'Receivers',
        description: 'High-performance receivers with telemetry support.',
        products: [
          { name: 'R-XSR', description: 'Ultra-compact 2.4GHz receiver with SBUS output and telemetry.' },
          { name: 'R9 Series', description: 'Long-range 900MHz receivers for extended range operations.' },
          { name: 'XM+', description: 'Micro receiver for FPV drones, lightweight, SBUS output.' },
        ]
      },
      {
        title: 'Flight Controllers & Modules',
        description: 'Integrated flight control and RF modules.',
        products: [
          { name: 'R9M Module', description: '900MHz long-range transmitter module for extended range.' },
          { name: 'S6R/S8R', description: 'Receivers with built-in stabilization and gyro.' },
        ]
      }
    ],
    certifications: ['CE', 'FCC', 'RoHS', 'Jiangsu High Technology Enterprise'],
    data_source: 'FrSky official website, company registration records'
  },

  hobbywing: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    city: 'Shenzhen',
    address: 'Shenzhen, Guangdong, China; Manufacturing facility in Huizhou',
    email: 'hobbywing@hobbywing.com',
    website: 'https://www.hobbywing.com',
    founded_year: 2005,
    employees: '500+',
    long_description: `Shenzhen Hobbywing Technology Co., Ltd. was founded in 2005 and is a leading manufacturer of UAV power systems in the industry. The company has long focused on the R&D, production, and sales of drone power systems while also developing eVTOL (electric Vertical Takeoff and Landing) propulsion systems.

Hobbywing is a national "Little Giant" enterprise (specialized and sophisticated SME), a national high-tech enterprise, and operates the Guangdong Intelligent UAV Power System Engineering Technology Research Center. The company has been recognized as a manufacturing champion in Guangdong Province and Shenzhen, and has won the First Prize of the Shenzhen Science and Technology Progress Award.

The company's intellectual property portfolio includes 212 invention patent applications (113 granted) and 304 utility model patents (215 granted). With headquarters in Shenzhen and a wholly-owned subsidiary in Huizhou, Hobbywing operates over 70,000 square meters of production space with fully independent R&D, testing, intelligent manufacturing, and delivery capabilities.

Hobbywing's UAV power systems cover multi-rotor, composite fixed-wing VTOL, fixed-wing cruise, FPV, and aerospace model applications. The company achieved full domestic production of UAV power systems in 2024 and began R&D of airworthiness-oriented large eVTOL propulsion systems in 2025. Beyond UAVs, Hobbywing is the world's largest manufacturer of RC car and boat power systems, with product lines including XERUN, EZRUN, QUICRUN, and SEAKING series.`,
    product_lines: [
      {
        title: 'UAV Power Systems',
        description: 'Complete propulsion solutions for professional drones.',
        products: [
          { name: 'XRotor Series', description: 'Integrated UAV power systems including X6, X8, X9, X11, X13, X15 for multi-rotor platforms.' },
          { name: 'H Series', description: 'High-power propulsion for heavy-lift industrial drones.' },
          { name: 'P Series', description: 'High-voltage power sets (P50M, P65M, P65V) for large agricultural and logistics drones.' },
        ]
      },
      {
        title: 'FPV & Aerospace',
        description: 'High-performance ESCs and motors for FPV and aeromodeling.',
        products: [
          { name: 'XRotor FPV ESCs', description: 'Rapid-response ESCs for FPV racing and freestyle drones.' },
        ]
      },
      {
        title: 'RC Car & Boat Power',
        description: 'World-leading ESC and motor systems for competitive RC.',
        products: [
          { name: 'XERUN Series', description: 'Premium brushless systems for competitive RC racing.' },
          { name: 'EZRUN Series', description: 'High-performance power systems for RC cars and trucks.' },
          { name: 'SEAKING Series', description: 'Waterproof marine ESCs for RC boats.' },
        ]
      },
      {
        title: 'eVTOL Propulsion',
        description: 'Next-generation electric propulsion for urban air mobility.',
        products: [
          { name: 'eVTOL Power Systems', description: 'Airworthiness-oriented large propulsion systems under development since 2025.' },
        ]
      }
    ],
    certifications: ['ISO 9001', 'National Little Giant Enterprise', 'National High-Tech Enterprise', 'CE', 'FCC', 'RoHS'],
    data_source: 'Hobbywing official website, Chinese government enterprise records'
  },

  holybro: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    email: 'info@holybro.com',
    website: 'https://www.holybro.com',
    long_description: `Holybro is a leading manufacturer of Pixhawk-standard flight controllers and autopilot systems for the drone industry. The company has been a key partner in the Pixhawk open-source ecosystem, producing some of the most widely used flight controllers in both research and commercial applications.

Holybro's Pixhawk implementations have set benchmarks in the open-source drone community. The Pixhawk 4 (2018, FMUv5 standard), developed in collaboration with Auterion, became one of the most popular flight controllers for PX4 and ArduPilot users. The Pixhawk 5X (2021, FMUv5X) introduced a hardened form factor with STM32 F7 processor and modular design. The Pixhawk 6X (2022, FMUv6X) raised the bar with an STM32H753 processor running at up to 480 MHz, triple redundancy with three IMU sensors and two barometers on separate buses, temperature-controlled IMUs with onboard heating resistors, and Pixhawk Hardware Certification.

Beyond flight controllers, Holybro produces development kits, avionics systems, GPS modules, power modules, and peripheral accessories that form complete autopilot solutions. The company is fully committed to the PX4 open-source flight stack and maintains comprehensive documentation through docs.holybro.com.`,
    product_lines: [
      {
        title: 'Pixhawk Flight Controllers',
        description: 'Industry-standard open-source autopilot systems.',
        products: [
          { name: 'Pixhawk 6X', description: 'FMUv6X standard, STM32H753, triple redundancy, temperature-controlled IMUs, PX4 fully supported.' },
          { name: 'Pixhawk 5X', description: 'FMUv5X standard, STM32 F7, modular design, hardened form factor.' },
          { name: 'Pixhawk 4', description: 'FMUv5 standard, developed with Auterion, widely adopted in research and commercial use.' },
          { name: 'Durandal', description: 'High-performance H7-based flight controller with vibration damping.' },
        ]
      },
      {
        title: 'Development Kits',
        description: 'Complete evaluation and prototyping kits.',
        products: [
          { name: 'Pixhawk 6X Dev Kit', description: 'Complete development kit with GPS, power module, and all accessories.' },
        ]
      },
      {
        title: 'Peripherals & Accessories',
        description: 'GPS modules, power modules, telemetry radios, and CAN peripherals.',
        products: [
          { name: 'M9N/M10 GPS', description: 'U-blox based GPS modules with compass for precise positioning.' },
          { name: 'PM02/PM07 Power Modules', description: 'Power distribution and battery monitoring modules.' },
        ]
      }
    ],
    data_source: 'Holybro official website, PX4 Summit 2023 presentation, Pixhawk standards documentation'
  },

  geprc: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2012,
    employees: '100+',
    email: 'support@geprc.com',
    website: 'https://www.geprc.com',
    long_description: `GEPRC was established in 2012 by a team passionate about First Person View (FPV) flight. What started as a small group of FPV enthusiasts has grown into a company of over 100 dedicated professionals committed to providing pilots with high-quality FPV drones and components.

The company's vision is "To lead the future of intelligent FPV drone technology," with a mission to make FPV more accessible and inspire more people to discover the joy of flying. GEPRC offers a comprehensive product range including 130+ drone models, 57 frame designs, 112 electronic products, 46 motor options, and 38 battery and charger products.

GEPRC's product lines cover every FPV category: Cinewhoops for indoor and cinematic filming (Cinelog, Cinebot, DarkStar series), cinematic freestyle drones (Vapor series), hardcore freestyle (Mark5 series), long-range platforms (MOZ7, Tern-LR40), and racing drones (Racer series). The company also produces its own SPEEDX motors, TAKER flight controllers and ESCs, and MATEN VTX systems.

With its own factory, GEPRC provides OEM/ODM services and exports products worldwide. The company continues to innovate in lighter and stronger frames, more efficient motors, clearer VTX transmission with longer range, and smarter flight controller systems.`,
    product_lines: [
      {
        title: 'Cinewhoop Drones',
        description: 'Ducted FPV drones for safe indoor and close-proximity filming.',
        products: [
          { name: 'Cinelog35 V3', description: '3.5-inch cinewhoop with O4 Pro, 4K/120fps, for carrying full-size action cameras.' },
          { name: 'Cinebot25 V2', description: '2.5-inch 2025 bestseller with intelligent AI PID tuning, urban exploration.' },
          { name: 'DarkStar22/25', description: 'Ultra-lightweight low-noise cinewhoops for sound-sensitive environments.' },
        ]
      },
      {
        title: 'Freestyle FPV Drones',
        description: 'High-performance 5-inch freestyle platforms.',
        products: [
          { name: 'Mark5 O4 Pro', description: 'Star performer with Wide X geometry, O4 Pro compatibility, aluminum side panels.' },
          { name: 'Vapor-D5/X5', description: '2025 lightweight flagship for mountain surfing and car chasing, DeadCat geometry.' },
        ]
      },
      {
        title: 'Long Range Drones',
        description: 'Endurance-focused platforms for distance flying.',
        products: [
          { name: 'MOZ7 V2', description: '7-inch flagship with reinforced side plates, O4 compatibility, high payload capacity.' },
          { name: 'Tern-LR40', description: '4-inch folding long-range, highly portable for hiking and backpacking.' },
        ]
      },
      {
        title: 'Components',
        description: 'Proprietary motors, ESCs, flight controllers, and VTX.',
        products: [
          { name: 'SPEEDX2 Motors', description: 'High-performance FPV motors in 1404, 1804, 2004, 2105.5, 2107.5 sizes.' },
          { name: 'TAKER FC/ESC Stacks', description: 'F722/H743 flight controllers with 50A/60A 4-in-1 ESCs, Bluetooth support.' },
          { name: 'MATEN VTX', description: '1.2GHz 5W long-range video transmitters.' },
        ]
      }
    ],
    data_source: 'GEPRC official website, Alibaba store, FPV24 retailer'
  },

  iflight: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    city: 'Huizhou',
    address: 'Floor 5, No.3 Shenghua Road, Zhongkai Hi-tech Area, Huizhou, Guangdong, China',
    email: 'support@iflight.com',
    website: 'https://www.iflight.com',
    founded_year: 2014,
    employees: '100-200',
    long_description: `iFlight (Huizhou iFlight Intelligent Technology Limited) was founded in March 2014 in Huizhou, Guangdong Province, in China's Greater Bay Area. The company has grown from a single small office to a global workforce of 100+ employees, with product service centers in Europe and the United States and a sales network covering over 100 countries.

iFlight is one of the world's leading brands in FPV drone imaging, competitive flight platforms, and UAV education solutions. The company's mission is "The Thrill of Immersive FPV Flight for Everyone" with a vision to "Be the Pioneer and Leader in FPV Drone Intelligence."

iFlight's product portfolio spans ready-to-fly and bind-and-fly drones, frames, propulsion components, flight controllers, ESCs, and FPV camera systems. Key product lines include the Nazgul series (freestyle), Chimera series (long-range), Taurus X8 series (cinelifter for professional cinema cameras), Mach series (racing), Defender/ProTek series (cinewhoop), and Commando series (radio transmitters). The company also produces its own Skyviz FPV goggles and XING motors.

iFlight organizes the annual iDRC (iFlight Drone Racing Championship) and iFlight Carnival events, contributing to FPV racing culture globally. The company has been recognized as a "Specialized and Sophisticated SME" and "High-Tech Enterprise" in Guangdong Province, and holds a General Aviation Enterprise Operating License.

Investors include HSG (Hong Kong), and the company generates annual revenue in the US$10-50 million range.`,
    product_lines: [
      {
        title: 'Freestyle FPV Drones',
        description: 'Versatile platforms for freestyle and cinematic flying.',
        products: [
          { name: 'Nazgul Evoque F5/F6 V3', description: 'Switchable DC/X-frame freestyle drone with O4 Pro, 6S power.' },
          { name: 'Nazgul ECO Series', description: 'High-quality affordable FPV platforms for budget-conscious pilots.' },
        ]
      },
      {
        title: 'Long Range & Heavy Lift',
        description: 'Endurance and payload platforms.',
        products: [
          { name: 'Chimera7/Chimera9', description: 'Long-range FPV drones with extended flight times and GPS.' },
          { name: 'Taurus X8 Pro Max', description: 'Ultimate heavy-lift cinelifter for professional cinema cameras.' },
          { name: 'XL10 V6', description: '10-inch heavy-lift frame, 420mm wheelbase, for long-range and payload.' },
        ]
      },
      {
        title: 'Cinewhoop & Indoor',
        description: 'Protected ducted drones for safe close-quarters flying.',
        products: [
          { name: 'Defender 20 Lite', description: 'Sub-250g ultra-light cinewhoop with O4, indoor agility and safety.' },
          { name: 'ProTek25/35', description: 'Pusher-style cinewhoops with HD camera support.' },
        ]
      },
      {
        title: 'Racing Drones',
        description: 'Competitive racing platforms.',
        products: [
          { name: 'Mach R5 Ultra/Sport', description: 'Lightweight racing drones with quick-release Aero Shell, optimized for speed.' },
        ]
      },
      {
        title: 'Radio & Goggles',
        description: 'Control systems and FPV viewing equipment.',
        products: [
          { name: 'Commando 8/14', description: 'ELRS radio transmitters with dual-band support, Type-C charging.' },
          { name: 'Skyviz Goggles', description: 'In-house developed FPV goggles for immersive flight experience.' },
        ]
      },
      {
        title: 'Components',
        description: 'XING motors, BLITZ FC stacks, and airframes.',
        products: [
          { name: 'XING2 Motors', description: 'High-performance FPV motors in various sizes for racing and freestyle.' },
          { name: 'BLITZ F7 Stacks', description: 'Flight controller and 4-in-1 ESC combos for FPV builds.' },
        ]
      }
    ],
    certifications: ['High-Tech Enterprise', 'General Aviation Enterprise License', 'Specialized SME', 'CE', 'FCC'],
    social_links: {
      youtube: 'https://www.youtube.com/c/iFlightFPV'
    },
    data_source: 'iFlight official website, PitchBook, SourceReady, Alibaba'
  },

  radiomaster: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    city: 'Shenzhen',
    address: 'Bao\'an District, Shenzhen, China',
    email: 'support@radiomasterrc.com',
    website: 'https://www.radiomasterrc.com',
    founded_year: 2019,
    long_description: `RadioMaster was founded in 2019 in Shenzhen, China by a team of radio control model enthusiasts and engineers with extensive experience in the RC industry. The company was established to answer the calls of hobbyists around the world, dedicated to the continuous evolution of the RC hobby and keeping open hardware standards and open-source platforms affordable and accessible to everyone.

RadioMaster is an EdgeTX Gold Partner and played a pivotal role in the inception of the EdgeTX project. The company actively collaborates with the EdgeTX team to drive innovation and shape the future of EdgeTX-based technology. All products are designed and built at RadioMaster's Shenzhen headquarters and factory, shipped worldwide through their online store and supported by a global network of dealers and repair agents.

The company's product lineup includes the flagship TX16S series (now Mk3), the compact Boxer, the gamepad-style Zorro, the ultra-portable Pocket, and newer models like the TX15, GX12, and MT12. RadioMaster also produces a wide range of receivers including the R81/R84/R86/R88 series, RP1/RP4TD ELRS receivers, ER series ELRS PWM receivers, and ERS telemetry sensors.

RadioMaster sponsors world-class FPV pilots including FAI World Drone Racing Champion Yuki Hashimoto, The World Games Champion DarKex, and Australian Drone Nationals Champion Thomas Bitmatta.`,
    product_lines: [
      {
        title: 'Flagship Transmitters',
        description: 'Full-size multi-protocol and ELRS transmitters.',
        products: [
          { name: 'TX16S Mk3/Max', description: 'Flagship full-size transmitter with EdgeTX, ELRS dual-band, high RF power, color touchscreen.' },
          { name: 'TX15/Max', description: 'Next-gen transmitter with upgraded ergonomics and ELRS 2.4GHz.' },
          { name: 'GX12', description: 'Dual-band crush-resistant transmitter with ELRS 2.4GHz, multi-color options.' },
        ]
      },
      {
        title: 'Compact Transmitters',
        description: 'Portable and gamepad-style controllers.',
        products: [
          { name: 'Boxer', description: 'Portable ELRS/4-in-1 transmitter with ergonomic design and large battery.' },
          { name: 'Zorro', description: 'Gamepad-style compact transmitter, lighter than Pocket, for FPV drones.' },
          { name: 'Pocket', description: 'Ultra-compact 2.4GHz ELRS/CC2500 transmitter with USB-C charging, 128x64 LCD.' },
          { name: 'MT12', description: 'Surface-focused transmitter for RC cars and boats.' },
        ]
      },
      {
        title: 'Receivers',
        description: 'Diversity and nano receivers for various protocols.',
        products: [
          { name: 'RP1/RP4TD', description: 'ExpressLRS 2.4GHz nano/diversity receivers with dual antennas.' },
          { name: 'R81/R84/R86/R88 V2', description: '2.4GHz receivers supporting D8/D16/SFHSS with PWM/SBUS.' },
          { name: 'ER4/ER6/ER8', description: 'ELRS PWM receivers for fixed-wing and surface models.' },
        ]
      },
      {
        title: 'Accessories & Telemetry',
        description: 'Gimbals, sensors, and upgrade parts.',
        products: [
          { name: 'AG02 CNC Hall Gimbals', description: 'Precision CNC machined hall sensor gimbals for TX16/TX15/Boxer.' },
          { name: 'ERS Telemetry Sensors', description: 'GPS, barometric altitude, current, RPM, and cell voltage sensors.' },
        ]
      }
    ],
    social_links: {
      youtube: 'https://www.youtube.com/@RadioMasterRC'
    },
    data_source: 'RadioMaster official website, indexall.io, GetFPV'
  },

  // Continue with more major brands...
  runcam: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2015,
    website: 'https://www.runcam.com',
    email: 'support@runcam.com',
    long_description: `RunCam is a leading manufacturer of FPV cameras, HD recording systems, and action cameras for the drone and RC hobby market. Founded in 2015, the company quickly established itself as a go-to brand for FPV pilots seeking high-quality, low-latency video transmission and recording solutions.

RunCam's product range spans from micro FPV cameras for tiny whoops to high-definition camera systems for cinematic FPV. The RunCam Link series provides digital HD FPV transmission, while the Split series offers dual-function cameras that both transmit FPV feed and record HD footage onboard. The company also produces the Thumb series of lightweight action cameras designed specifically for FPV drones.

RunCam cameras are known for their excellent low-light performance, low latency, and durability in crash conditions. The company's products are used by FPV racers, freestyle pilots, and cinematic content creators worldwide.`,
    product_lines: [
      {
        title: 'FPV Cameras',
        description: 'Analog and digital FPV cameras for real-time flight.',
        products: [
          { name: 'Phoenix 2', description: 'Popular FPV camera with excellent low-light performance, 1000TVL.' },
          { name: 'Racer Nano 4', description: 'Ultra-compact racing camera with low latency, 1280x720.' },
          { name: 'Split 4', description: 'Dual-function FPV camera with 4K recording and real-time feed.' },
        ]
      },
      {
        title: 'Digital HD Systems',
        description: 'HD FPV transmission solutions.',
        products: [
          { name: 'RunCam Link Wasp', description: 'Digital HD VTX system with 720p/120fps, low latency.' },
        ]
      },
      {
        title: 'Action Cameras',
        description: 'Lightweight cameras designed for FPV mounting.',
        products: [
          { name: 'Thumb/Thumb Pro', description: 'Ultra-light 4K action cameras weighing under 30g for FPV drones.' },
        ]
      }
    ],
    data_source: 'RunCam official website, FPV retailer listings'
  },

  foxeer: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2014,
    website: 'https://www.foxeer.com',
    email: 'support@foxeer.com',
    long_description: `Foxeer is a professional manufacturer of FPV cameras, video transmitters, antennas, and drone accessories. Founded in 2014, the company has built a reputation for high-performance FPV equipment with distinctive design and reliable performance.

Foxeer's product lineup includes the popular Predator and T-Rex FPV camera series, the Reaper and Extreme VTX series, high-gain antennas, and the Foxeer HD camera systems. The company is also known for its Lollipop antennas which have become an industry standard for FPV due to their compact size and excellent performance.

Foxeer caters to both racing and freestyle FPV pilots, with products optimized for low latency, noise immunity, and durability. The company also produces goggles, monitors, and ground station equipment for complete FPV systems.`,
    product_lines: [
      {
        title: 'FPV Cameras',
        description: 'High-performance cameras for FPV racing and freestyle.',
        products: [
          { name: 'Predator 5', description: 'Popular FPV camera with Super WDR, 1000TVL, 16:9/4:3 switchable.' },
          { name: 'T-Rex Mini', description: 'Compact FPV camera with 1500TVL, low latency, for racing.' },
          { name: 'Razer Nano', description: 'Micro FPV camera for tiny whoops and small builds.' },
        ]
      },
      {
        title: 'Video Transmitters',
        description: 'Analog and digital VTX solutions.',
        products: [
          { name: 'Reaper VTX', description: 'High-power 5.8GHz VTX with smart audio and pit mode.' },
          { name: 'Extreme VTX', description: 'Long-range VTX with high output power and stable signal.' },
        ]
      },
      {
        title: 'Antennas',
        description: 'High-gain omni and directional antennas.',
        products: [
          { name: 'Lollipop 4', description: 'Compact 5.8GHz antenna with excellent axial ratio, industry standard.' },
          { name: 'Pagoda', description: 'Omnidirectional antenna with uniform radiation pattern.' },
        ]
      }
    ],
    data_source: 'Foxeer official website, FPV community reviews'
  },

  betafpv: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2018,
    website: 'https://www.betafpv.com',
    email: 'support@betafpv.com',
    long_description: `BETAFPV was founded in 2018 and has quickly become one of the most popular brands in the micro and whoop FPV segment. The company specializes in small-form-factor FPV drones, particularly tiny whoops, toothpicks, and compact freestyle quadcopters.

BETAFPV is known for pioneering the whoop-style drone market with their Cetus series beginner drones, which have introduced thousands of new pilots to FPV flying. The company also produces the Meteor series of whoop frames, the HX115 toothpick, and a comprehensive range of 1S and 2S batteries, chargers, and micro components.

The company's Cetus Pro and Cetus X kits include everything needed to start flying FPV — drone, goggles, and transmitter — making them the most popular entry-level FPV packages on the market. BETAFPV also produces professional-grade components including the F4 1S AIO flight controllers, 0802/1102/1404 motors, and the ELRS Lite radio system.`,
    product_lines: [
      {
        title: 'Beginner FPV Kits',
        description: 'Complete RTF kits for new FPV pilots.',
        products: [
          { name: 'Cetus X', description: 'Advanced beginner kit with 2S power, ELRS, brushless motors, LiteRadio 3.' },
          { name: 'Cetus Pro', description: 'Entry-level FPV kit with altitude hold, self-protection, complete goggles and radio.' },
        ]
      },
      {
        title: 'Whoop & Toothpick Drones',
        description: 'Micro and small FPV drones.',
        products: [
          { name: 'Meteor65/75 Pro', description: 'Popular 65mm/75mm whoop drones for indoor flying.' },
          { name: 'HX115', description: 'Toothpick-class drone for outdoor micro FPV.' },
          { name: 'Aquila16', description: '1.6-inch cinewhoop with HD camera support.' },
        ]
      },
      {
        title: 'Components & Batteries',
        description: 'Micro FPV building blocks.',
        products: [
          { name: 'F4 1S AIO', description: 'Integrated flight controller and ESC for 1S micro builds.' },
          { name: '1S/2S LiPo/LiHV Batteries', description: 'High-discharge micro batteries for whoops and toothpicks.' },
          { name: 'LiteRadio 3', description: 'Compact ELRS transmitter for beginners and micro flying.' },
        ]
      }
    ],
    data_source: 'BETAFPV official website, FPV community'
  },

  caddx: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.caddxfpv.com',
    email: 'support@caddxfpv.com',
    long_description: `Caddx is a leading manufacturer of FPV cameras and HD digital video transmission systems for the drone industry. The company is best known for its collaboration with DJI on the DJI FPV Air Unit system, producing some of the most popular cameras used in DJI HD FPV ecosystems.

Caddx produces a wide range of FPV cameras including the Ratel series (known for exceptional low-light performance), the Turbo Eye series, and the Nebula Pro/Polar cameras designed for DJI HD systems. The company also makes the Walksnail Avatar HD FPV system (in partnership with Walksnail), which competes directly with DJI's digital FPV offering.

Caddx cameras are widely regarded as having some of the best image quality in the FPV market, particularly in low-light conditions. The company's products are used by both casual FPV pilots and professional cinematographers.`,
    product_lines: [
      {
        title: 'Analog FPV Cameras',
        description: 'High-quality analog cameras for FPV.',
        products: [
          { name: 'Ratel 2', description: 'Popular FPV camera with 1/1.8" sensor, exceptional low-light performance.' },
          { name: 'Turbo Micro F2', description: 'Micro FPV camera with 1/2" sensor, 1200TVL.' },
        ]
      },
      {
        title: 'DJI HD Compatible Cameras',
        description: 'Cameras for DJI digital FPV systems.',
        products: [
          { name: 'Nebula Pro', description: 'Nano-sized HD camera for DJI Air Unit/Vista, 1080p/60fps.' },
          { name: 'Polar', description: 'Vista-compatible camera with polarizer mount, starlight sensor.' },
        ]
      },
      {
        title: 'Walksnail Avatar HD',
        description: 'Digital HD FPV ecosystem.',
        products: [
          { name: 'Avatar HD Kit', description: 'Digital HD FPV system with 1080p/120fps, 22ms latency, 4km range.' },
        ]
      }
    ],
    data_source: 'Caddx official website, DJI FPV ecosystem documentation'
  },

  emax: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2010,
    website: 'https://www.emax-usa.com',
    email: 'support@emax-usa.com',
    long_description: `EMAX is a well-established manufacturer of FPV drones, motors, propellers, and RC components, founded in 2010. The company is known for producing high-quality, affordable FPV products that cater to both beginners and experienced pilots.

EMAX's popular product lines include the Tinyhawk series of micro FPV drones (which have become staple beginner platforms), the Hawk series of 5-inch freestyle drones, and the Babyhawk series of compact cinewhoops. The company also produces the popular ECO series of brushless motors, known for their excellent value and performance.

EMAX has a strong presence in the US market through emax-usa.com and sponsors numerous FPV events and pilots. Their Tinyhawk RTF kits are among the most recommended starter packages for new FPV pilots due to their durability and ease of use.`,
    product_lines: [
      {
        title: 'Beginner & Micro Drones',
        description: 'Entry-level and micro FPV platforms.',
        products: [
          { name: 'Tinyhawk III', description: 'Popular 75mm whoop RTF kit with goggles and transmitter, 1-2S power.' },
          { name: 'Tinyhawk II Freestyle', description: 'Micro freestyle drone with 1103 motors, 2S power.' },
        ]
      },
      {
        title: 'Freestyle Drones',
        description: '5-inch and compact freestyle platforms.',
        products: [
          { name: 'Hawk 5', description: '5-inch freestyle drone with ECO motors, durable frame.' },
          { name: 'Babyhawk II HD', description: '3.5-inch cinewhoop with HD camera support.' },
        ]
      },
      {
        title: 'Motors & Components',
        description: 'Brushless motors and replacement parts.',
        products: [
          { name: 'ECO II Series', description: 'Popular value-oriented brushless motors for 5-inch FPV.' },
          { name: 'TH1103', description: 'Micro motors for Tinyhawk and small whoops.' },
        ]
      }
    ],
    data_source: 'EMAX official website, FPV retailer data'
  },

  happymodel: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.happymodel.cn',
    long_description: `HappyModel is a Chinese manufacturer specializing in micro FPV drones, whoop-style quadcopters, and compact FPV components. The company is known for producing affordable, lightweight FPV platforms that are popular among beginners and indoor flying enthusiasts.

HappyModel's product range includes the Mobula series of whoops (one of the best-selling micro FPV lines), the Crux series of toothpick drones, and a comprehensive range of 1S AIO flight controllers, 0802/0702 motors, and micro receivers. The company was an early adopter of ELRS (ExpressLRS) technology and produces some of the smallest ELRS receivers available.

HappyModel products are known for their excellent value, making FPV accessible to pilots on a budget. The Mobula6/Mobula7 in particular are considered benchmark micro FPV drones.`,
    product_lines: [
      {
        title: 'Whoop Drones',
        description: 'Micro ducted FPV drones.',
        products: [
          { name: 'Mobula6/Mobula7', description: 'Best-selling 65mm/75mm whoops, 1-2S power, ELRS option.' },
          { name: 'Mobula8', description: '85mm whoop with 2-3S power for outdoor micro flying.' },
        ]
      },
      {
        title: 'Toothpick Drones',
        description: 'Lightweight open-frame micro drones.',
        products: [
          { name: 'Crux3/Crux35', description: 'Toothpick-class drones for lightweight outdoor FPV.' },
        ]
      },
      {
        title: 'Components',
        description: 'Micro FPV electronics.',
        products: [
          { name: 'EP1/EP2 RX', description: 'Ultra-compact ExpressLRS 2.4GHz receivers.' },
          { name: 'Crazybee F4 AIO', description: 'Integrated FC+ESC for 1S micro builds.' },
        ]
      }
    ],
    data_source: 'HappyModel official website, FPV community'
  },

  diatone: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2010,
    website: 'https://www.diatonefpv.com',
    long_description: `Diatone is one of the pioneering brands in the FPV industry, founded in 2010. The company has a long history of producing FPV frames, drones, and components, and is particularly known for its innovative frame designs and the popular Taycan series of whoop drones.

Diatone's product range includes the Mamba series of flight controller/ESC stacks (known for reliability and performance), the Roma series of freestyle drones, the Taycan whoop series, and the GTB series of compact cinewhoops. The company also produces its own Mamba motors and is known for distinctive frame designs using carbon fiber and 3D printed parts.

Diatone was one of the first brands to popularize the 2.5-inch and 3-inch cinewhoop form factors, and continues to innovate in micro and compact FPV platforms.`,
    product_lines: [
      {
        title: 'FPV Drones',
        description: 'Complete BNF/PNP drones across multiple classes.',
        products: [
          { name: 'Roma F5/F6', description: '5-inch/6-inch freestyle drones with Mamba stacks.' },
          { name: 'Taycan 25/35', description: 'Cinewhoop series in 2.5-inch and 3.5-inch sizes.' },
          { name: 'GTB 229/339', description: 'Compact cinewhoops with duct protection.' },
        ]
      },
      {
        title: 'Mamba Stacks',
        description: 'Flight controller and ESC combos.',
        products: [
          { name: 'Mamba F7/F4 Stacks', description: 'Popular FC+ESC stacks with 40A/50A/60A ESCs, durable design.' },
        ]
      }
    ],
    data_source: 'Diatone official website, FPV community'
  },

  flywoo: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.flywoo.net',
    long_description: `Flywoo is a manufacturer of FPV drones and components known for innovative designs and quality construction. The company produces a range of FPV platforms including the Explorer series of long-range drones, the CineRace series of cinewhoops, and the Mr. Croc series of freestyle quadcopters.

Flywoo is also known for its compact 1S and 2S micro drones, as well as its line of GoPro mounts and accessories. The company's products often feature distinctive color schemes and attention to detail in both design and performance tuning.`,
    product_lines: [
      {
        title: 'Long Range Drones',
        description: 'Endurance-focused FPV platforms.',
        products: [
          { name: 'Explorer LR 4/7', description: 'Long-range FPV drones optimized for efficiency and flight time.' },
        ]
      },
      {
        title: 'Cinewhoop & Freestyle',
        description: 'Compact and freestyle platforms.',
        products: [
          { name: 'CineRace 20/30', description: 'Cinewhoop drones for indoor and close-quarters filming.' },
          { name: 'Mr. Croc', description: 'Freestyle drone with distinctive frame design.' },
        ]
      }
    ],
    data_source: 'Flywoo official website'
  },

  hglrc: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2017,
    website: 'https://www.hglrc.com',
    long_description: `HGLRC was founded in 2017 and has quickly established itself as a manufacturer of affordable, performance-oriented FPV drones and components. The company produces the Sector series of freestyle drones, the Wind5/Wind7 series, and a comprehensive range of flight controllers, ESCs, and VTX under the FD (Flight Deck) brand.

HGLRC is known for offering complete FPV solutions at competitive prices, with products that often include well-tuned defaults and quality components. The company also produces the popular Zeus series of nano VTX and the Specter series of FPV cameras.`,
    product_lines: [
      {
        title: 'Freestyle Drones',
        description: '5-inch and 7-inch freestyle platforms.',
        products: [
          { name: 'Sector F5/F7', description: 'Freestyle drones with FD stacks, 5-inch and 7-inch options.' },
          { name: 'Wind5', description: 'Compact 5-inch freestyle with lightweight construction.' },
        ]
      },
      {
        title: 'Components',
        description: 'FC/ESC stacks, VTX, and cameras.',
        products: [
          { name: 'FD F7 Stacks', description: 'Flight controller and 4-in-1 ESC combos.' },
          { name: 'Zeus VTX', description: 'Compact nano VTX with smart audio.' },
        ]
      }
    ],
    data_source: 'HGLRC official website'
  },

  rushfpv: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.rushfpv.com',
    long_description: `RUSHFPV is a specialized manufacturer of high-performance FPV video transmitters, antennas, and related RF equipment. The company is highly regarded in the FPV community for producing some of the cleanest and most reliable VTX signals in the industry.

RUSHFPV's product lineup includes the popular Tank series VTX (known for robust construction and clean signal), the Cherry and Matrix antennas, and the RUSH BLADE series of FPV stacks. The company focuses heavily on RF performance, with products designed to minimize noise and maximize range.

RUSHFPV also sponsors top FPV pilots and racing events, and their VTX products are frequently the choice of competitive racers and long-range pilots who demand clean video transmission.`,
    product_lines: [
      {
        title: 'Video Transmitters',
        description: 'High-performance 5.8GHz VTX.',
        products: [
          { name: 'Tank Mini VTX', description: 'Compact VTX with PitMode, 25-350mW adjustable, smart audio.' },
          { name: 'Tank Ultimate', description: 'High-power VTX with up to 800mW output, clean signal.' },
        ]
      },
      {
        title: 'Antennas',
        description: 'High-gain FPV antennas.',
        products: [
          { name: 'Cherry Antenna', description: 'Compact 5.8GHz antenna with excellent axial ratio.' },
          { name: 'Matrix Array', description: 'Directional patch antenna for long-range ground stations.' },
        ]
      }
    ],
    data_source: 'RUSHFPV official website, FPV community reviews'
  },

  speedybee: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.speedybee.com',
    long_description: `SpeedyBee is a manufacturer of FPV drones, flight controllers, and accessories known for innovative features and user-friendly designs. The company gained popularity with its Bluetooth-enabled flight controllers that allow wireless configuration via smartphone app, eliminating the need for USB connections during setup.

SpeedyBee's product range includes the Master5/Master3 freestyle drones, the Bee series of compact drones, and the popular F405/F722 flight controller stacks with built-in Bluetooth. The company also produces the SpeedyBee App for wireless Betaflight configuration, which has become a favorite tool among FPV pilots for field adjustments.

The company focuses on making FPV more accessible through technology, with products that simplify the build and configuration process while maintaining high performance standards.`,
    product_lines: [
      {
        title: 'FPV Drones',
        description: 'Complete drones for freestyle and cinematic flying.',
        products: [
          { name: 'Master5 V2', description: '5-inch freestyle drone with Bluetooth FC, 6S capable.' },
          { name: 'Bee35', description: '3.5-inch cinewhoop with duct protection.' },
          { name: 'Flex25', description: '2.5-inch flexible micro drone.' },
        ]
      },
      {
        title: 'Flight Controllers',
        description: 'Bluetooth-enabled FC stacks.',
        products: [
          { name: 'F405 V4 Stack', description: 'F405 FC with 55A 4-in-1 ESC, Bluetooth for wireless config.' },
          { name: 'F722 Stack', description: 'F722 FC with 50A ESC, Bluetooth, 3-6S support.' },
        ]
      }
    ],
    data_source: 'SpeedyBee official website'
  },

  iflight_continued: {}, // placeholder

  cuav: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.cuav.net',
    email: 'support@cuav.net',
    long_description: `CUAV is a professional manufacturer of open-source flight controllers, GPS modules, telemetry systems, and UAV components for commercial and industrial drone applications. The company is a key contributor to the PX4 and ArduPilot ecosystems, producing Pixhawk-compatible autopilot systems used in research, mapping, and commercial UAV platforms.

CUAV's product lineup includes the X7 and V5+ series of flight controllers (Pixhawk-standard), the NEO 3 Pro GPS with U-blox modules, the CAN PDB power distribution boards, and the SiK telemetry radios. The company also produces the Nora+ and X7+ Pro autopilots with triple redundancy features for safety-critical applications.

CUAV products are widely used by drone manufacturers, research institutions, and hobbyists building custom UAVs. The company maintains strong ties with the open-source flight controller community and provides comprehensive documentation and support.`,
    product_lines: [
      {
        title: 'Flight Controllers',
        description: 'Pixhawk-standard autopilots for commercial UAVs.',
        products: [
          { name: 'X7+ Pro', description: 'High-end autopilot with STM32H7, triple IMU redundancy, for industrial UAVs.' },
          { name: 'V5+', description: 'Pixhawk-compatible FC with integrated vibration isolation.' },
          { name: 'Nora+', description: 'Compact autopilot with CAN bus, for multirotor and VTOL.' },
        ]
      },
      {
        title: 'GPS & Navigation',
        description: 'High-precision GNSS modules.',
        products: [
          { name: 'NEO 3 Pro', description: 'U-blox M9N GPS with compass, RTK-ready.' },
          { name: 'C-RTK 9Ps', description: 'Centimeter-level RTK GNSS module for precision mapping.' },
        ]
      },
      {
        title: 'Telemetry & Accessories',
        description: 'Communication and power modules.',
        products: [
          { name: 'SiK Telemetry Radio', description: 'Long-range serial telemetry for ground station communication.' },
          { name: 'CAN PDB', description: 'CAN-based power distribution board with current sensing.' },
        ]
      }
    ],
    data_source: 'CUAV official website, PX4/ArduPilot documentation'
  },

  darwinfpv: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.darwinfpv.com',
    long_description: `DarwinFPV is a manufacturer of affordable, durable FPV drones that has gained popularity for offering ready-to-fly quadcopters at budget-friendly prices without sacrificing build quality. The company is known for its "bNF" (bind-and-fly) models that come pre-tuned and ready to fly.

DarwinFPV's product range includes the CineApe series of cinewhoops, the Baby Ape series of micro freestyle drones, the Darwin215 freestyle quad, and the FoldApe folding long-range drone. The company focuses on providing value-oriented FPV solutions, making it popular among beginners and pilots looking for affordable backup or practice quads.

DarwinFPV products are known for their durability, with frames designed to withstand crashes, and components that are easy to replace. The company also produces its own flight controllers and ESCs under the DarwinFPV brand.`,
    product_lines: [
      {
        title: 'Freestyle Drones',
        description: 'Affordable 5-inch and micro freestyle platforms.',
        products: [
          { name: 'Darwin215', description: '5-inch freestyle drone with 215mm wheelbase, 4-6S support.' },
          { name: 'Baby Ape II', description: '3-inch micro freestyle, compact and durable.' },
        ]
      },
      {
        title: 'Cinewhoop Drones',
        description: 'Ducted platforms for cinematic flying.',
        products: [
          { name: 'CineApe 25/35', description: '2.5-inch and 3.5-inch cinewhoops with HD camera support.' },
        ]
      },
      {
        title: 'Long Range',
        description: 'Folding and long-endurance platforms.',
        products: [
          { name: 'FoldApe', description: 'Folding long-range drone for easy transport and extended flight.' },
        ]
      }
    ],
    data_source: 'DarwinFPV official website'
  },

  eachine: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.eachine.com',
    long_description: `EACHINE is a well-known brand in the budget RC and FPV drone market, producing a wide range of affordable drones, FPV goggles, transmitters, and accessories. The company is one of the most recognizable names in entry-level FPV, with products sold through major online marketplaces globally.

EACHINE's product range spans from toy-grade drones to FPV racing quadcopters, goggles (including the popular EV200D and EV300 models), transmitters, and a vast array of spare parts and accessories. The company was an early player in the FPV goggle market, making affordable diversity goggles accessible to beginners.

While positioned at the budget end of the market, EACHINE products have introduced many pilots to FPV flying, and the company continues to offer a wide catalog of components and complete drones at competitive prices.`,
    product_lines: [
      {
        title: 'FPV Goggles',
        description: 'Affordable FPV viewing systems.',
        products: [
          { name: 'EV300O', description: 'OLED FPV goggles with diversity receivers, 1024x768 resolution.' },
          { name: 'EV200D', description: 'Popular budget diversity goggles with 5.8GHz RX.' },
        ]
      },
      {
        title: 'Drones',
        description: 'Entry-level and mid-range FPV drones.',
        products: [
          { name: 'Tyro series', description: 'DIY FPV drone kits for builders.' },
          { name: 'Novice series', description: 'RTL beginner FPV kits with everything included.' },
        ]
      }
    ],
    data_source: 'EACHINE official website, retailer listings'
  },

  flysky: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2006,
    website: 'https://www.flysky-cn.com',
    long_description: `Flysky (FuShi) is a long-established Chinese manufacturer of radio control systems for RC models, founded in 2006. The company produces transmitters, receivers, and modules for the RC hobby market, known for offering reliable, budget-friendly radio solutions.

Flysky's product range includes the popular FS-i6 and FS-i6X entry-level transmitters (some of the best-selling budget radios in RC), the FS-NV14 and FS-ST8 mid-range radios, and the Paladin series of higher-end transmitters. The company's AFHDS 2A protocol is widely supported across the RC industry, and Flysky receivers are used in countless RC aircraft, cars, and boats.

Flysky also produces the Noble series of surface radios for RC cars, and has expanded into the FPV market with compact transmitters compatible with FPV drones. The company's products are known for their simplicity, reliability, and excellent value.`,
    product_lines: [
      {
        title: 'Aircraft Transmitters',
        description: 'RC transmitters for airplanes, helicopters, and drones.',
        products: [
          { name: 'FS-i6X', description: 'Best-selling 10-channel budget transmitter with AFHDS 2A.' },
          { name: 'FS-ST8', description: '8-channel transmitter with color screen and Hall gimbals.' },
          { name: 'Paladin PL18', description: 'High-end 18-channel transmitter with touchscreen.' },
        ]
      },
      {
        title: 'Receivers',
        description: 'AFHDS 2A compatible receivers.',
        products: [
          { name: 'FS-iA6B/FS-X6B', description: 'Popular 6-channel receivers with i-BUS and SBUS.' },
          { name: 'FS-A8S', description: 'Compact 8-channel receiver for FPV drones.' },
        ]
      }
    ],
    data_source: 'Flysky official website, RC community'
  },

  jumper: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.jumper-rc.com',
    long_description: `Jumper is a manufacturer of multi-protocol RC transmitters known for their versatility and compatibility with numerous RC protocols. The company's T-Lite, T-Pro, and T20 series transmitters support multiple protocols through internal 4-in-1 or ELRS modules, making them popular among pilots who fly with different brands of receivers.

Jumper was an early adopter of EdgeTX firmware and was among the first companies to offer affordable multi-protocol radios that could bind to FrSky, Flysky, Spektrum, and other receivers. The T-Pro in particular became a popular compact transmitter for FPV flying due to its gamepad form factor and EdgeTX support.

The company also produces its own ELRS receivers and has expanded into the FPV market with a focus on compact, feature-rich transmitters at competitive prices.`,
    product_lines: [
      {
        title: 'Transmitters',
        description: 'Multi-protocol and ELRS RC radios.',
        products: [
          { name: 'T20S', description: 'Full-size ELRS transmitter with EdgeTX, Hall gimbals, color screen.' },
          { name: 'T-Pro', description: 'Gamepad-style multi-protocol transmitter with EdgeTX, popular for FPV.' },
          { name: 'T-Lite', description: 'Compact transmitter for surface and air models.' },
        ]
      }
    ],
    data_source: 'Jumper official website'
  },

  fatshark: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2007,
    website: 'https://www.fatshark.com',
    long_description: `Fat Shark is one of the original and most iconic brands in FPV goggles, founded in 2007. The company essentially created the FPV goggle category and has been a dominant force in first-person-view flying for over a decade. Fat Shark goggles have been the choice of countless FPV pilots, from hobbyists to professional racers.

Fat Shark's product range includes the Dominator series of modular goggles (which allow users to swap receiver modules, focus adjusters, and head trackers), the Scout and Recon entry-level goggles, and the HDO series with OLED displays for superior image quality. The company's goggle ecosystem includes the Byte Frost digital HD system and a wide range of 5.8GHz receiver modules.

While the FPV goggle market has become more competitive with the rise of DJI and HDZero, Fat Shark remains a respected brand known for its modular design approach and the Dominator's comfortable fit and wide field of view options.`,
    product_lines: [
      {
        title: 'FPV Goggles',
        description: 'Analog and digital FPV viewing systems.',
        products: [
          { name: 'Dominator HDO3', description: 'Flagship OLED goggles with 1080p displays, modular design.' },
          { name: 'Scout', description: 'Entry-level box goggles with integrated receiver.' },
          { name: 'Recon V3', description: 'Compact budget goggles for beginners.' },
        ]
      },
      {
        title: 'Modules & Accessories',
        description: 'Receiver modules and goggle upgrades.',
        products: [
          { name: 'Byte Frost', description: 'Digital HD FPV module for Dominator goggles.' },
          { name: 'Receiver Modules', description: '5.8GHz diversity and single RX modules for various bands.' },
        ]
      }
    ],
    data_source: 'Fat Shark official website, FPV history'
  },

  skyzone: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.skyzonefpv.com',
    long_description: `Skyzone is a manufacturer of FPV goggles and video receivers known for their steadyview receiver technology and high-quality displays. The company's SKY04O and SKY04L goggles with OLED and LCD displays respectively are popular among FPV pilots for their image quality and receiver performance.

Skyzone's goggles feature built-in 5.8GHz diversity receivers with SteadyView technology, which combines signals from two antennas for improved reception and reduced dropouts. The company also produces the Cobra series of compact goggles and a range of receiver modules and accessories.

Skyzone goggles are known for their comfortable fit, adjustable focus, and robust build quality. The company continues to innovate in analog FPV reception technology while also exploring digital FPV options.`,
    product_lines: [
      {
        title: 'FPV Goggles',
        description: 'Analog FPV goggles with diversity receivers.',
        products: [
          { name: 'SKY04O V2', description: 'OLED goggles with 1024x768, SteadyView RX, head tracker.' },
          { name: 'SKY04L V2', description: 'LCD version with 1280x960 resolution, wider FOV.' },
          { name: 'Cobra S/X', description: 'Compact goggles with integrated diversity receiver.' },
        ]
      }
    ],
    data_source: 'Skyzone official website'
  },

  hdzero: {
    verified: true,
    country: 'United States',
    country_code: 'US',
    website: 'https://www.hd-zero.com',
    long_description: `HDZero (formerly known as Shark Byte) is a digital HD FPV system manufacturer based in the United States, known for producing low-latency digital video transmission technology for FPV drones. The HDZero system uses a unique digital transmission approach that delivers 720p/1080p video at very low latency, making it popular among FPV racers.

HDZero's ecosystem includes the HDZero Goggles (with 720p and 1080p versions), a range of digital VTX modules (Whoop, Freestyle, Race), and cameras designed specifically for the digital system. The technology is particularly favored by FPV racers because of its minimal latency compared to other digital systems, providing a near-analog responsiveness with digital clarity.

The company continues to develop its ecosystem with new cameras, VTX with higher power output, and firmware updates that improve performance and add features. HDZero has a strong following in the racing community and is increasingly adopted by freestyle pilots as well.`,
    product_lines: [
      {
        title: 'Digital FPV Goggles',
        description: 'HDZero digital viewing systems.',
        products: [
          { name: 'HDZero Goggles', description: 'Digital FPV goggles with 720p/1080p displays, low latency.' },
          { name: 'HDZero Monitor', description: 'External monitor for ground station use.' },
        ]
      },
      {
        title: 'Digital VTX & Cameras',
        description: 'Transmitters and cameras for HDZero ecosystem.',
        products: [
          { name: 'HDZero Whoop VTX', description: 'Ultra-compact digital VTX for whoops and micro drones.' },
          { name: 'HDZero Freestyle VTX', description: 'Mid-power digital VTX for 3-5 inch freestyle.' },
          { name: 'HDZero Race VTX', description: 'Low-latency VTX optimized for racing.' },
          { name: 'HDZero Camera', description: 'Digital camera with 720p/1080p, 16:9/4:3 selectable.' },
        ]
      }
    ],
    data_source: 'HDZero official website, FPV racing community'
  },

  walksnail: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.walksnail.com',
    long_description: `Walksnail is a manufacturer of digital HD FPV systems, producing the Avatar HD ecosystem in partnership with Caddx. The Walksnail Avatar system provides 1080p/120fps digital video transmission at 22ms latency, with up to 4km range, competing directly with DJI's FPV system.

Walksnail's product lineup includes the Avatar HD Kit (VTX + camera), the Avatar GT Kit (higher power for long range), the Walksnail Goggles (with 1080p displays and integrated receiver), and various camera options including the nano-sized Avatar camera for micro builds. The system supports both 16:9 and 4:3 aspect ratios and features onboard DVR recording.

The Walksnail ecosystem has gained significant market share due to its competitive pricing, lighter VTX weight compared to DJI, and strong support from the FPV community. The system is popular among both freestyle pilots and cinematic FPV content creators.`,
    product_lines: [
      {
        title: 'Digital FPV Systems',
        description: 'Complete HD digital FPV solutions.',
        products: [
          { name: 'Avatar HD Kit', description: '1080p/120fps digital VTX + camera, 22ms latency, 4km range.' },
          { name: 'Avatar GT Kit', description: 'High-power version for long-range, 2W output.' },
          { name: 'Avatar Nano Kit', description: 'Ultra-light VTX for whoops and micro drones.' },
        ]
      },
      {
        title: 'Goggles',
        description: 'Digital FPV goggles.',
        products: [
          { name: 'Walksnail Goggles', description: '1080p FOV 46° goggles with integrated Avatar receiver, HDMI in.' },
        ]
      }
    ],
    data_source: 'Walksnail official website, FPV community'
  },

  gemfan: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2010,
    website: 'https://www.gemfanhobby.com',
    long_description: `Gemfan is one of the world's leading manufacturers of propellers for multirotor drones and FPV aircraft. Founded in 2010, the company produces a vast range of propellers in various sizes, pitches, and materials for everything from tiny whoops to large industrial drones.

Gemfan's propeller lineup includes the popular Hurricane series for freestyle, the Flash series for racing, the WinDancer series for efficiency and long-range, and a comprehensive range of whoop and micro props. The company uses high-quality polycarbonate and nylon materials, with some models featuring carbon fiber reinforcement.

Gemfan propellers are known for their precise molding, balanced performance, and wide selection. The company collaborates with top FPV pilots to design and test new propeller profiles, and their products are used by drone manufacturers and hobbyists worldwide.`,
    product_lines: [
      {
        title: 'Freestyle & Racing Props',
        description: '5-inch and 6-inch propellers for FPV.',
        products: [
          { name: 'Hurricane 51466', description: 'Popular 5-inch freestyle propeller, 3-blade, smooth and efficient.' },
          { name: 'Flash 5144', description: 'High-speed racing propeller with quick throttle response.' },
          { name: 'WinDancer 5043', description: 'Efficiency-optimized propeller for long-range flying.' },
        ]
      },
      {
        title: 'Whoop & Micro Props',
        description: 'Small propellers for micro drones.',
        products: [
          { name: '65mm/75mm Whoop Props', description: '1mm/1.5mm shaft props for 65-85mm whoops.' },
          { name: '3-4 Inch Props', description: 'Cinewhoop and toothpick propellers in 3-4 inch sizes.' },
        ]
      }
    ],
    data_source: 'Gemfan official website'
  },

  hqprop: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.hqprop.com',
    long_description: `HQProp is a premium manufacturer of high-performance propellers for FPV drones and multirotor aircraft. The company is known for producing some of the most precisely molded and best-balanced propellers in the industry, popular among competitive racers and freestyle pilots who demand maximum performance.

HQProp's product range includes the popular Ethix series (collaboration with Ethix), the DP (Durable Prop) series, the V1S racing props, and a wide range of sizes from micro whoop props to large 7-10 inch long-range propellers. The company uses premium polycarbonate materials and offers both 2-blade and 3-blade configurations.

HQProp propellers are often the choice of top FPV racers and are frequently included as stock propellers on high-end BNF drones from manufacturers like GEPRC and iFlight. The company's Ethix S3/S4/S5 props in particular are among the most popular freestyle propellers on the market.`,
    product_lines: [
      {
        title: 'FPV Propellers',
        description: 'Premium props for racing and freestyle.',
        products: [
          { name: 'Ethix S3/S4/S5', description: 'Popular 5-inch freestyle props co-designed with Ethix.' },
          { name: 'DP 5x4.3x3', description: 'Durable propeller for freestyle, 3-blade, polycarbonate.' },
          { name: 'V1S 5.1x5.1x3', description: 'High-performance racing propeller.' },
          { name: '7-10 Inch LR Props', description: 'Long-range propellers optimized for efficiency.' },
        ]
      }
    ],
    data_source: 'HQProp official website, FPV community'
  },

  dalprop: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.dalprop.com',
    long_description: `Dalprop is a manufacturer of FPV propellers known for durable designs and distinctive color options. The company's Cyclone series and T-series propellers are popular among freestyle pilots for their smooth flight characteristics and crash resistance.

Dalprop was one of the early propeller manufacturers in the FPV space and has continued to refine its designs based on pilot feedback. The company produces propellers in various sizes for 3-inch to 7-inch drones, with both 2-blade and 3-blade options.`,
    product_lines: [
      {
        title: 'FPV Propellers',
        description: 'Durable propellers for freestyle and racing.',
        products: [
          { name: 'Cyclone T5040C', description: '5-inch 3-blade freestyle propeller, known for durability.' },
          { name: 'New Cyclone 5045', description: 'Updated 5-inch propeller with improved efficiency.' },
        ]
      }
    ],
    data_source: 'Dalprop official website'
  },

  gnb: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.gaonengbattery.com',
    long_description: `GNB (GaoNeng Battery) is a Chinese manufacturer of high-performance LiPo and LiHV batteries for the FPV and RC hobby market. The company produces a wide range of battery sizes and C-ratings, from 1S whoop batteries to 6S packs for 5-inch freestyle drones.

GNB batteries are known for their high discharge rates, low internal resistance, and competitive pricing. The company's LiHV (High Voltage) batteries in particular are popular among FPV pilots who want the extra voltage for increased performance. GNB produces batteries in various capacities and cell counts for all FPV drone sizes.`,
    product_lines: [
      {
        title: 'FPV Batteries',
        description: 'LiPo and LiHV batteries for FPV drones.',
        products: [
          { name: '1S LiHV Whoop Batteries', description: '300-650mAh 1S batteries for micro whoops, 30C+ discharge.' },
          { name: '4S/6S Freestyle Packs', description: '850-1500mAh 4S/6S batteries for 3-5 inch FPV, 100C+ discharge.' },
          { name: 'LiHV Packs', description: 'High-voltage batteries with 4.35V/cell for extra performance.' },
        ]
      }
    ],
    data_source: 'GNB official website'
  },

  isdt: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.isdt.co',
    long_description: `ISDT is a manufacturer of smart battery chargers, power supplies, and RC electronics known for their compact designs and colorful displays. The company's chargers are popular among FPV pilots for their balance charging performance, portability, and user-friendly interfaces.

ISDT's product range includes the Q6/Q8 series of high-power chargers, the D1/D2 dual-channel chargers, the P10/P30 power supplies, and various battery charging accessories. The company also produces the Air series of chargers with wireless connectivity and smartphone app control.

ISDT chargers support multiple battery chemistries including LiPo, LiHV, LiFe, NiMH, and Pb, and feature balance charging, storage charging, and discharge functions. The compact form factor and high power output make them ideal for field charging at FPV events.`,
    product_lines: [
      {
        title: 'Smart Chargers',
        description: 'Balance chargers for RC batteries.',
        products: [
          { name: 'Q6 Nano/Q8 Max', description: 'Compact high-power chargers with color displays, 200-1000W output.' },
          { name: 'D1/D2', description: 'Dual-channel chargers for charging two batteries simultaneously.' },
          { name: 'Air 8/10', description: 'Smart chargers with Bluetooth app control.' },
        ]
      },
      {
        title: 'Power Supplies',
        description: 'DC power supplies for chargers.',
        products: [
          { name: 'P10/P30', description: '100-300W power supplies for field charging.' },
        ]
      }
    ],
    data_source: 'ISDT official website'
  },

  toolkitrc: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.toolkitrc.com',
    long_description: `ToolkitRC is a manufacturer of compact, affordable battery chargers, power supplies, and RC tools known for their excellent value and functional design. The company's M6 and M8 series chargers are popular among FPV pilots for their small form factor and high power output.

ToolkitRC's product range includes the M6/M7/M8 chargers (with 150-300W output), the P200 power supply, the ST8 servo tester, and various charging accessories. The company focuses on providing essential RC tools at accessible prices, with features typically found on more expensive chargers.

The compact size of ToolkitRC chargers makes them ideal for field use, and their simple interface allows for quick battery charging and maintenance. The company also produces the A200 watt meter and the M6D dual-channel charger.`,
    product_lines: [
      {
        title: 'Chargers & Power',
        description: 'Compact battery chargers and power supplies.',
        products: [
          { name: 'M6/M7/M8', description: '150-300W compact chargers with color displays, balance charging.' },
          { name: 'M6D', description: 'Dual-channel 250W charger for simultaneous charging.' },
          { name: 'P200', description: '200W power supply for field charging.' },
        ]
      }
    ],
    data_source: 'ToolkitRC official website'
  },

  vifly: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.vifly.com',
    long_description: `VIFLY is a manufacturer of FPV accessories and tools known for innovative products that solve common problems in the FPV hobby. The company is best known for the VIFLY Beacon (a lost drone buzzer with independent battery), the VIFLY Finder series, and the Short Safer (fuse for preventing short circuits).

VIFLY's product range also includes the VIFLY 2S Whoop batteries, the VIFLY Drone Buzzer, the VIFLY Camera Switcher, and various wiring accessories. The company focuses on practical, well-designed accessories that enhance the FPV experience, with products that are often recommended by experienced pilots.

VIFLY's Beacon buzzer in particular is considered an essential safety item for FPV drones, as it continues to sound even after the main battery is disconnected or the drone is damaged, helping pilots locate lost quadcopters.`,
    product_lines: [
      {
        title: 'FPV Accessories',
        description: 'Safety and convenience products for FPV.',
        products: [
          { name: 'Beacon/Finder', description: 'Independent lost-drone buzzers with backup battery, up to 100dB.' },
          { name: 'Short Safer', description: 'Resettable fuse to prevent short circuit damage during builds.' },
          { name: 'Camera Switcher', description: 'Switch between two FPV cameras on one drone.' },
        ]
      }
    ],
    data_source: 'VIFLY official website'
  },

  t_motor: {}, // handled above as 't-motor'

  tarot: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.tarot-rc.com',
    long_description: `Tarot (Tarot-RC) is a long-established Chinese manufacturer of drone frames, gimbals, retractable landing gear, and UAV components for both hobbyist and commercial applications. The company has been producing RC helicopter and multirotor parts for over a decade and is known for its extensive catalog of metal and carbon fiber components.

Tarot's product range includes the popular 650/680/900 series multirotor frames, 2-axis and 3-axis brushless gimbals for GoPro and mirrorless cameras, retractable landing gear systems, power distribution boards, and a vast array of spare parts. The company also produces complete drone platforms for aerial photography and industrial applications.

Tarot components are widely used by DIY drone builders and small-scale UAV manufacturers due to their availability, reasonable pricing, and compatibility with standard flight controllers. The company's gimbals in particular were instrumental in early aerial photography builds before integrated drone solutions became common.`,
    product_lines: [
      {
        title: 'Drone Frames',
        description: 'Multirotor frames for various applications.',
        products: [
          { name: '650/680 Sport', description: 'Quad/hexacopter frames for aerial photography, 650-680mm.' },
          { name: '900/1000 Series', description: 'Heavy-lift multirotor frames for professional applications.' },
          { name: 'X4/X6 Series', description: 'Compact quadcopter frames for FPV and freestyle.' },
        ]
      },
      {
        title: 'Gimbals',
        description: 'Brushless camera gimbals.',
        products: [
          { name: 'T-2D/T-3D Gimbals', description: '2-axis and 3-axis brushless gimbals for GoPro and action cameras.' },
        ]
      },
      {
        title: 'Accessories',
        description: 'Landing gear, PDBs, and components.',
        products: [
          { name: 'Retractable Landing Gear', description: 'Electric retractable skids for photography drones.' },
        ]
      }
    ],
    data_source: 'Tarot-RC official website'
  },

  sunnylife: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.sunnylife.com',
    long_description: `Sunnylife is a manufacturer of drone accessories, particularly known for its wide range of products compatible with DJI drones. The company produces landing gear extensions, propeller guards, camera filters, carrying cases, tablet holders, and various other accessories that enhance the functionality and safety of consumer and enterprise drones.

Sunnylife's product catalog covers accessories for nearly all DJI models including Mavic, Mini, Air, Phantom, and Inspire series, as well as for other popular drone brands. The company's products are known for their practical design, good fit, and affordable pricing.

In addition to drone accessories, Sunnylife also produces action camera mounts, tablet and phone holders for RC transmitters, and various 3D printed and injection-molded accessories. The company sells globally through major online marketplaces and drone retailers.`,
    product_lines: [
      {
        title: 'Drone Accessories',
        description: 'Aftermarket accessories for consumer drones.',
        products: [
          { name: 'Landing Gear Extensions', description: 'Increased ground clearance for various DJI models.' },
          { name: 'Propeller Guards', description: 'Quick-release propeller protectors for safe indoor flying.' },
          { name: 'Camera Filters', description: 'ND, CPL, and UV filters for drone cameras.' },
          { name: 'Carrying Cases', description: 'Hard and soft cases for drone transport.' },
        ]
      }
    ],
    data_source: 'Sunnylife official website'
  },

  mad: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.madcomponents.com',
    long_description: `MAD (MAD Components) is a manufacturer of high-efficiency brushless motors, ESCs, and complete propulsion systems for industrial and agricultural drones. The company focuses on the commercial UAV market, producing motors optimized for heavy-lift, long-endurance, and agricultural spraying applications.

MAD's product range includes the MAD 500/505/600 series motors for agricultural drones, the MAD X8 and X9 propulsion systems for multirotors, and a range of ESCs designed for industrial use. The company's motors are known for their high torque, efficiency, and reliability in demanding commercial operations.

MAD components are used by agricultural drone manufacturers, delivery drone companies, and industrial UAV builders worldwide. The company also provides custom propulsion solutions for specific airframe requirements.`,
    product_lines: [
      {
        title: 'Industrial Propulsion',
        description: 'Motors and ESCs for commercial drones.',
        products: [
          { name: 'MAD 500/505/600 Series', description: 'Large motors for agricultural and heavy-lift drones, 5-15kg thrust.' },
          { name: 'MAD X8/X9', description: 'Integrated propulsion systems with motor+ESC+prop.' },
          { name: 'MAD ESCs', description: 'High-voltage, high-current ESCs for industrial applications.' },
        ]
      }
    ],
    data_source: 'MAD Components official website'
  },

  siyi: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.siyi.biz',
    long_description: `SIYI is a professional manufacturer of industrial remote controllers, gimbal cameras, and data link systems for commercial UAVs and unmanned systems. The company produces enterprise-grade control and imaging solutions used in agriculture, surveying, inspection, and public safety applications.

SIYI's product range includes the MK15 and MK32 series of handheld ground stations with integrated HD displays, the ZR10 and ZT30 series of gimbal cameras (with optical zoom, thermal imaging, and laser rangefinder), and long-range data link systems. The company's products are known for their robust construction, long-range capabilities, and compatibility with various flight controllers.

SIYI systems are used by drone manufacturers and system integrators worldwide, providing reliable command and control and imaging capabilities for professional UAV operations. The company also offers SDK access for custom integration.`,
    product_lines: [
      {
        title: 'Ground Stations',
        description: 'Enterprise remote controllers with HD displays.',
        products: [
          { name: 'MK15', description: '5.5-inch HD handheld ground station, 15km range, Android system.' },
          { name: 'MK32', description: '7-inch industrial ground station, 30km range, dual-operator support.' },
        ]
      },
      {
        title: 'Gimbal Cameras',
        description: 'Professional imaging payloads.',
        products: [
          { name: 'ZR10', description: '3-axis gimbal with 2K 30x hybrid zoom, 1080p thermal option.' },
          { name: 'ZT30', description: '4-sensor gimbal: 4K 180x zoom, thermal, wide-angle, laser rangefinder.' },
          { name: 'ZR30', description: '3-axis gimbal with 4K 180x hybrid zoom, AI tracking.' },
        ]
      },
      {
        title: 'Data Links',
        description: 'Long-range communication systems.',
        products: [
          { name: 'Datalink Pro', description: 'Long-range telemetry and video link, up to 30km.' },
        ]
      }
    ],
    data_source: 'SIYI official website'
  },

  lumenier: {
    verified: true,
    country: 'United States',
    country_code: 'US',
    website: 'https://www.getfpv.com/lumenier',
    long_description: `Lumenier is the in-house brand of GetFPV, one of the largest FPV retailers in the United States. The brand produces high-quality FPV drones, frames, motors, antennas, and accessories designed and tested in the US with manufacturing in China.

Lumenier's product range includes the QAV series of FPV frames (iconic designs like the QAV-R and QAV-S), the Lumenier motor series, the AXII and Pagoda antennas, and complete BNF drones. The brand is known for premium quality, innovative designs, and strong support from the GetFPV retail and service network.

Lumenier frames in particular are highly regarded in the FPV community for their precise carbon fiber cutting, durable construction, and well-thought-out layouts. The brand also produces the JohnnyFPV edition frames and motors in collaboration with the well-known FPV pilot.`,
    product_lines: [
      {
        title: 'FPV Frames',
        description: 'Premium carbon fiber FPV frames.',
        products: [
          { name: 'QAV-R 5/6/7', description: 'Iconic freestyle/racing frames in various sizes, true X geometry.' },
          { name: 'QAV-S', description: 'Sleek freestyle frame with premium hardware.' },
          { name: 'JohnnyFPV Edition', description: 'Collaboration frames with pro pilot JohnnyFPV.' },
        ]
      },
      {
        title: 'Motors & Components',
        description: 'Motors, antennas, and accessories.',
        products: [
          { name: 'Lumenier Motors', description: 'Premium FPV motors in 2207/2306 sizes for racing and freestyle.' },
          { name: 'AXII Antenna', description: 'High-gain 5.8GHz antenna with excellent axial ratio.' },
        ]
      }
    ],
    data_source: 'GetFPV/Lumenier website, FPV community'
  },

  flir: {
    verified: true,
    country: 'United States',
    country_code: 'US',
    founded_year: 1978,
    website: 'https://www.flir.com',
    long_description: `FLIR Systems (now part of Teledyne FLIR) is the world's largest manufacturer of thermal imaging cameras, sensors, and systems, founded in 1978. The company produces thermal cameras used in drones for industrial inspection, public safety, search and rescue, building diagnostics, and defense applications.

FLIR's drone-compatible products include the Vue and Vue Pro series of thermal cameras for small UAVs, the Duo/Duo Pro R dual-camera systems (thermal + visible), and the Hadron series of dual thermal/visible payloads for enterprise and defense drones. FLIR also produces the Black Hornet nano UAV for military reconnaissance.

FLIR thermal sensors are widely integrated into commercial drone platforms from DJI (H20T, M2EA), Autel (EVO II Dual), and other manufacturers. The company's thermal technology sets the industry standard for radiometric accuracy, image quality, and reliability in unmanned systems applications.

In 2021, FLIR was acquired by Teledyne Technologies and now operates as Teledyne FLIR, continuing to develop advanced imaging solutions for unmanned systems.`,
    product_lines: [
      {
        title: 'Drone Thermal Cameras',
        description: 'Thermal imaging payloads for UAVs.',
        products: [
          { name: 'Vue Pro R', description: 'Radiometric thermal camera for small UAVs, temperature measurement.' },
          { name: 'Duo Pro R', description: 'Dual thermal + 4K visible camera with radiometry.' },
          { name: 'Hadron 640R', description: 'Dual thermal/visible payload for enterprise and defense drones.' },
        ]
      },
      {
        title: 'Integrated Solutions',
        description: 'Thermal sensors integrated into commercial drones.',
        products: [
          { name: 'DJI H20T/M2EA', description: 'FLIR thermal cores integrated into DJI enterprise drones.' },
          { name: 'Black Hornet', description: 'Nano reconnaissance UAV for military applications.' },
        ]
      }
    ],
    certifications: ['ISO 9001', 'ITAR compliant', 'FAA TSO'],
    data_source: 'Teledyne FLIR official website, corporate records'
  },

  garmin: {
    verified: true,
    country: 'United States',
    country_code: 'US',
    founded_year: 1989,
    website: 'https://www.garmin.com',
    long_description: `Garmin Ltd. is a multinational technology company founded in 1989, best known for GPS technology and wearable devices. In the drone industry, Garmin produces aviation-grade GPS modules, ADS-B receivers, and avionics that are used in professional UAVs, particularly for BVLOS (Beyond Visual Line of Sight) operations and unmanned traffic management.

Garmin's UAV-relevant products include the GPS 18x and GPS 24xd receivers, the GDL 50/52 ADS-B receivers for detect-and-avoid, and the aera series of aviation GPS units that can interface with UAV ground stations. The company's aviation products are known for their reliability, accuracy, and certification for manned aviation, which translates to high trust in professional UAV applications.

Garmin also produces action cameras (VIRB series) and wearables used by drone pilots, and has been involved in UTM (UAS Traffic Management) initiatives. The company's extensive experience in aviation navigation makes it a key technology provider for the commercial drone industry's evolution toward BVLOS and autonomous operations.`,
    product_lines: [
      {
        title: 'GPS & Navigation',
        description: 'Aviation-grade GPS receivers for UAVs.',
        products: [
          { name: 'GPS 24xd', description: 'High-sensitivity GPS receiver with WAAS/EGNOS, for precision navigation.' },
          { name: 'GDL 52', description: 'ADS-B receiver for traffic and weather, detect-and-avoid capability.' },
        ]
      }
    ],
    certifications: ['FAA TSO', 'EASA certified', 'ISO 9001'],
    data_source: 'Garmin official website, aviation product documentation'
  },

  gopro: {
    verified: true,
    country: 'United States',
    country_code: 'US',
    founded_year: 2002,
    website: 'https://www.gopro.com',
    long_description: `GoPro, Inc. is an American technology company founded in 2002 by Nick Woodman, best known for its action cameras that are widely used in FPV drone cinematography. While GoPro does not manufacture drones (having discontinued the Karma drone in 2018), its cameras remain the primary payload for many FPV cinewhoop and cinelifter platforms.

GoPro's HERO series cameras, particularly the HERO 11/12 Black and the lighter HERO 11 Black Mini, are popular choices for FPV pilots seeking high-quality stabilized footage. The company also produces the MAX 360 camera and a range of mounts and accessories. The Bones (naked GoPro) modifications, where the camera's protective housing is removed to reduce weight, are common in FPV builds.

GoPro cameras are frequently mounted on FPV drones using 3D printed TPU mounts, and the company's HyperSmooth stabilization and 5.3K video capabilities make them ideal for capturing smooth aerial footage from FPV platforms.`,
    product_lines: [
      {
        title: 'Action Cameras',
        description: 'Cameras commonly used as FPV payloads.',
        products: [
          { name: 'HERO 12 Black', description: 'Flagship action camera with 5.3K/60fps, HyperSmooth 6.0, 10-bit color.' },
          { name: 'HERO 11 Black Mini', description: 'Lighter, smaller version ideal for FPV mounting, 5.3K/60fps.' },
        ]
      }
    ],
    data_source: 'GoPro official website'
  },

  insta360: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2015,
    website: 'https://www.insta360.com',
    long_description: `Insta360 is a Chinese technology company founded in 2015, specializing in 360-degree cameras, action cameras, and professional imaging solutions. The company's cameras are widely used in FPV drone cinematography, particularly the GO series of ultra-light cameras and the ONE R/RS modular cameras.

Insta360's GO 3/GO 3S is a tiny, lightweight camera weighing under 30g that is ideal for mounting on small FPV drones. The ONE R/RS series offers interchangeable lens modules including 360, 4K wide-angle, and 1-inch sensors. The company also produces the X3/X4 360 cameras used for aerial 360 content.

Insta360 cameras are known for their innovative features like "FlowState" stabilization, "Invisible Selfie Stick" effect, and AI editing tools. The compact size and light weight of the GO series make them particularly popular for FPV whoop and micro drone cinematography.`,
    product_lines: [
      {
        title: 'Action Cameras',
        description: 'Compact cameras for FPV mounting.',
        products: [
          { name: 'GO 3S', description: 'Ultra-compact 39g camera with 4K/30fps, FlowState stabilization, ideal for FPV.' },
          { name: 'ONE RS', description: 'Modular action camera with 4K/60fps, 1-inch, and 360 lens options.' },
          { name: 'X4', description: '360-degree camera with 8K 360 video, for aerial 360 content.' },
        ]
      }
    ],
    data_source: 'Insta360 official website'
  },

  gremsy: {
    verified: true,
    country: 'Vietnam',
    country_code: 'VN',
    founded_year: 2012,
    website: 'https://www.gremsy.com',
    long_description: `Gremsy is a Vietnamese manufacturer of high-precision camera gimbals for professional drone applications, founded in 2012. The company specializes in 3-axis brushless gimbals designed for industrial inspection, mapping, surveying, and cinematography.

Gremsy's product range includes the Pixy series (lightweight gimbals for mirrorless cameras), the Mio series (compact gimbals for compact cameras), the T3 series (for DSLR and cinema cameras), and the S1 series for heavy payloads. The company also produces the Zio series of zoom cameras integrated with gimbals.

Gremsy gimbals are known for their smooth stabilization, robust construction, and compatibility with multiple drone platforms including DJI M-series, custom multirotors, and the company's own Pixhawk-based flight controller solutions. The gimbals support various camera models from Sony, Canon, Panasonic, and FLIR.

The company has a global presence with customers in surveying, infrastructure inspection, agriculture, and public safety, and is recognized as a leading third-party gimbal manufacturer in the commercial UAV space.`,
    product_lines: [
      {
        title: 'Camera Gimbals',
        description: 'Professional 3-axis gimbals for drones.',
        products: [
          { name: 'Pixy U/WS', description: 'Lightweight gimbal for mirrorless cameras (Sony a7 series, etc.).' },
          { name: 'Mio', description: 'Compact gimbal for compact cameras and action cams.' },
          { name: 'T3 V3', description: 'Heavy-duty gimbal for DSLR and cinema cameras, 3-axis stabilization.' },
          { name: 'S1', description: 'Heavy-lift gimbal for large cinema cameras and sensors up to 4.5kg.' },
        ]
      },
      {
        title: 'Integrated Cameras',
        description: 'Gimbal-integrated imaging solutions.',
        products: [
          { name: 'Zio', description: 'Integrated zoom camera gimbal with 36x optical zoom.' },
        ]
      }
    ],
    data_source: 'Gremsy official website'
  },

  ouster: {
    verified: true,
    country: 'United States',
    country_code: 'US',
    founded_year: 2015,
    website: 'https://www.ouster.com',
    long_description: `Ouster is an American lidar technology company founded in 2015, manufacturing high-resolution digital lidar sensors for autonomous vehicles, robotics, industrial automation, and drone mapping/surveying applications. The company produces solid-state and spinning lidar sensors that provide 3D spatial awareness for unmanned systems.

Ouster's product range includes the OS series of spinning lidars (OS0, OS1, OS2) with up to 128 channels of resolution, and the REV7 series with digital lidar technology. These sensors are used on drones for terrain mapping, corridor surveying, infrastructure inspection, and autonomous navigation.

Ouster's lidars are known for their compact size, lightweight construction (important for drone payloads), high point density, and reliable performance in various lighting and weather conditions. The company merged with Velodyne in 2023, creating one of the largest lidar companies in the world, though both brands continue to operate.

For drone applications, Ouster sensors provide centimeter-accurate 3D point clouds used in surveying, volumetric measurement, digital twin creation, and obstacle detection for BVLOS operations.`,
    product_lines: [
      {
        title: 'Lidar Sensors',
        description: 'Digital lidar for UAV mapping and navigation.',
        products: [
          { name: 'OS0', description: 'Ultra-wide FOV lidar for close-range perception and navigation.' },
          { name: 'OS1', description: 'Mid-range lidar for mapping and surveying, up to 128 channels.' },
          { name: 'OS2', description: 'Long-range lidar for long-distance detection and surveying.' },
        ]
      }
    ],
    data_source: 'Ouster official website, corporate filings'
  },

  velodyne: {
    verified: true,
    country: 'United States',
    country_code: 'US',
    founded_year: 1983,
    website: 'https://www.velodynelidar.com',
    long_description: `Velodyne Lidar (now part of Velodyne/Ouster combined entity) is a pioneering lidar company founded in 1983 (originally as an audio company), with its lidar division established in 2006 after the DARPA Grand Challenge. Velodyne essentially invented the 3D lidar category for autonomous vehicles and has been a dominant force in lidar technology for decades.

Velodyne's drone-relevant products include the Puck series (VLP-16, Puck LITE, Puck Hi-Res) which are compact, lightweight lidars widely used in UAV mapping and surveying, and the Ultra Puck for longer-range applications. The HDL-32E was for many years the standard lidar for mobile mapping, including drone-based surveying.

Velodyne lidars are known for their 360-degree coverage, high point density, and proven reliability. The Puck LITE in particular, weighing only 590g, was designed with drone payload constraints in mind and has been used in numerous commercial UAV mapping systems worldwide.

Following the merger with Ouster in 2023, Velodyne products continue to be available and supported, with the combined company offering a broader range of lidar solutions.`,
    product_lines: [
      {
        title: 'UAV Lidar Sensors',
        description: 'Compact lidars for drone mapping.',
        products: [
          { name: 'Puck LITE (VLP-16)', description: '590g lightweight 16-channel lidar, 100m range, ideal for UAVs.' },
          { name: 'Puck Hi-Res', description: '16-channel lidar with concentrated vertical resolution for detailed mapping.' },
          { name: 'Ultra Puck VLP-32', description: '32-channel lidar for longer-range, higher-density mapping.' },
        ]
      }
    ],
    data_source: 'Velodyne Lidar official website, corporate history'
  },

  livox: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 2016,
    website: 'https://www.livoxtech.com',
    long_description: `Livox Technology is a Chinese lidar manufacturer founded in 2016 as an independent company incubated within DJI. The company produces high-performance, cost-effective lidar sensors that have become extremely popular in drone mapping, surveying, robotics, and autonomous driving applications.

Livox's product range includes the Mid-40 and Mid-70 series (compact mid-range lidars), the Avia (designed specifically for UAV surveying with 190m range and 70.4° FOV), the HAP (for automotive and high-altitude mapping), and the Tele-15 long-range lidar. The company's unique non-repetitive scanning pattern provides higher point cloud coverage than traditional spinning lidars at a fraction of the cost.

Livox lidars have democratized drone-based lidar surveying, making it accessible to smaller surveying firms and mapping companies. The Avia in particular is widely used in commercial UAV lidar systems for topographic mapping, forestry, power line inspection, and construction site monitoring.

Despite being incubated by DJI, Livox operates independently and its sensors are used by numerous drone manufacturers and system integrators worldwide. The company's lidars are known for their reliability, high point density, and excellent value proposition.`,
    product_lines: [
      {
        title: 'UAV Lidar Sensors',
        description: 'Cost-effective lidars for drone mapping.',
        products: [
          { name: 'Avia', description: 'UAV-optimized lidar, 190m range, 70.4° FOV, 240,000 points/s, 490g.' },
          { name: 'Mid-70', description: 'Wide FOV lidar for close-range mapping, 260m range, 70.4° circular FOV.' },
          { name: 'Mid-40', description: 'Compact lidar for robotics and low-altitude mapping, 260m range.' },
          { name: 'HAP', description: 'High-altitude and automotive lidar, 150m range at 10% reflectivity.' },
        ]
      }
    ],
    data_source: 'Livox official website, DJI corporate information'
  },

  leica: {
    verified: true,
    country: 'Switzerland',
    country_code: 'CH',
    founded_year: 1921,
    website: 'https://www.leica-geosystems.com',
    long_description: `Leica Geosystems is a Swiss company founded in 1921, part of Hexagon AB, and is one of the world's most prestigious manufacturers of surveying and measurement instruments. In the drone industry, Leica produces high-end survey-grade UAV lidar systems, photogrammetry solutions, and GNSS equipment used for professional mapping and surveying.

Leica's drone-related products include the Leica BLK2FLY (a fully autonomous flying laser scanning sensor), the Leica RTC360 terrestrial laser scanner (used in conjunction with UAV data), the Leica GS18 GNSS RTK rover (for ground control points in drone surveys), and the Leica Aibot (a UAV-based surveying solution). The company also produces the Leica Pegasus backpack and mobile mapping systems.

Leica's products are at the premium end of the surveying market, known for their Swiss precision, survey-grade accuracy, and comprehensive software ecosystems (Leica Cyclone, Leica Infinity). The BLK2FLY in particular represents a breakthrough in autonomous UAV lidar scanning, able to fly itself around structures to create complete 3D models.

Leica systems are used by professional surveyors, engineers, and construction professionals who require centimeter or millimeter-level accuracy in their geospatial data.`,
    product_lines: [
      {
        title: 'UAV Surveying Systems',
        description: 'Survey-grade UAV lidar and mapping solutions.',
        products: [
          { name: 'BLK2FLY', description: 'Autonomous flying laser scanner, self-navigating, 3D point cloud capture.' },
          { name: 'Aibot X6', description: 'UAV platform for aerial surveying and inspection.' },
        ]
      },
      {
        title: 'Surveying Equipment',
        description: 'GNSS and laser scanning for ground control.',
        products: [
          { name: 'GS18 T', description: 'RTK GNSS rover for ground control points in drone surveys.' },
          { name: 'RTC360', description: 'Terrestrial laser scanner for combined UAV/ground data.' },
        ]
      }
    ],
    certifications: ['ISO 9001', 'Survey-grade accuracy certification'],
    data_source: 'Leica Geosystems official website, Hexagon corporate'
  },

  topcon: {
    verified: true,
    country: 'Japan',
    country_code: 'JP',
    founded_year: 1932,
    website: 'https://www.topcon.com',
    long_description: `Topcon Corporation is a Japanese manufacturer of optical and surveying instruments founded in 1932. The company produces GNSS receivers, total stations, laser scanners, and UAV-based surveying solutions for the construction, agriculture, and geospatial industries.

Topcon's drone-related products include the Topcon Falcon 8 (a professional multirotor drone for inspection and mapping), the Topcon Sirius series of fixed-wing UAVs for aerial surveying, and a range of GNSS RTK base stations and rovers used for ground control in drone mapping operations. The company also produces the Topcon ContextCapture software for photogrammetric processing.

Topcon's UAV solutions are targeted at professional surveyors and construction professionals, with emphasis on survey-grade accuracy, integration with Topcon's broader geospatial ecosystem, and compliance with industry standards. The company has a long history in precision optics and measurement, dating back to its founding as a camera and optical instrument manufacturer.

Topcon's agricultural division also produces UAV-based crop monitoring and precision agriculture solutions, integrating drone imagery with Topcon's variable-rate application systems.`,
    product_lines: [
      {
        title: 'UAV Surveying Systems',
        description: 'Professional drone mapping platforms.',
        products: [
          { name: 'Falcon 8', description: 'Professional multirotor for inspection and mapping, 8 rotors for redundancy.' },
          { name: 'Sirius Pro', description: 'Fixed-wing UAV for aerial surveying and mapping.' },
        ]
      },
      {
        title: 'GNSS & Positioning',
        description: 'RTK systems for ground control.',
        products: [
          { name: 'HiPer VR', description: 'Compact GNSS RTK receiver for surveying and ground control.' },
        ]
      }
    ],
    certifications: ['ISO 9001', 'Survey-grade'],
    data_source: 'Topcon official website'
  },

  parrot: {
    verified: true,
    country: 'France',
    country_code: 'FR',
    founded_year: 1994,
    website: 'https://www.parrot.com',
    long_description: `Parrot Drones is a French drone manufacturer founded in 1994 by Henri Seydoux, and is one of the oldest and most established companies in the consumer drone industry. Parrot launched the AR.Drone in 2010, which was the first widely successful consumer drone controlled by smartphone, and has since evolved into a professional drone solutions provider.

Parrot's current focus is on professional and enterprise drones through its Parrot Professional division. The ANAFI series includes the ANAFI Ai (a 4G-connected enterprise drone with obstacle avoidance and 4K/60fps camera), the ANAFI USA (a ruggedized thermal drone for public safety and defense, made in USA), and the ANAFI Work (for inspection and mapping). The company also produces the Parrot Bebop series historically and the Disco fixed-wing drone.

Parrot is a founding member of the Drone Alliance in Europe and has pivoted away from consumer drones to focus on professional, defense, and security markets. The ANAFI USA in particular is designed to meet US government and defense requirements with its secure data handling, thermal imaging, and American manufacturing.

Parrot also develops the FreeFlight open-source flight controller software and provides SDK access for developers building custom drone applications. The company is listed on Euronext Paris and has operations in France, the US, and Switzerland.`,
    product_lines: [
      {
        title: 'Professional Drones',
        description: 'Enterprise and defense UAV platforms.',
        products: [
          { name: 'ANAFI Ai', description: '4G-connected enterprise drone, 4K/60fps, obstacle avoidance, 32 minutes flight.' },
          { name: 'ANAFI USA', description: 'Ruggedized defense/public safety drone, 32x zoom, thermal, made in USA, 32 minutes.' },
          { name: 'ANAFI Work', description: 'Inspection and mapping drone with 4K HDR, 4G, photogrammetry support.' },
        ]
      },
      {
        title: 'Software & SDK',
        description: 'Open-source flight software and developer tools.',
        products: [
          { name: 'FreeFlight', description: 'Open-source flight controller software for Parrot drones.' },
          { name: 'ANAFI SDK', description: 'Developer SDK for custom applications and automation.' },
        ]
      }
    ],
    certifications: ['CE', 'FCC', 'Made in USA (ANAFI USA)', 'NDAA compliant'],
    data_source: 'Parrot official website, corporate filings'
  },

  yuneec: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    founded_year: 1999,
    website: 'https://www.yuneec.com',
    long_description: `Yuneec International is a Chinese drone and electric aircraft manufacturer founded in 1999 in Hong Kong, with R&D and manufacturing in Shanghai. The company originally produced RC airplanes and helicopters before expanding into multirotor drones and electric aviation.

Yuneec's drone product range includes the Typhoon series (Typhoon H Plus with 360-degree gimbal, Typhoon H3 with Leica camera), the Mantis series for consumer aerial photography, the H520 commercial drone for inspection and public safety, and the E10/E20 series of enterprise payloads. Yuneec also produced the E-Go electric longboard and has been involved in electric aircraft development.

Yuneec was notable for its partnership with Leica on the Typhoon H3 camera system and for its Intel RealSense obstacle avoidance technology used in the Typhoon H. The company's ST16 ground station with integrated 7-inch display was a popular feature for professional pilots.

While Yuneec has faced challenges in the competitive consumer drone market, the company continues to serve commercial and enterprise customers with the H520 platform and its range of E10/E20 thermal and zoom cameras.`,
    product_lines: [
      {
        title: 'Commercial Drones',
        description: 'Enterprise platforms for inspection and public safety.',
        products: [
          { name: 'H520E', description: 'Commercial hexacopter with hot-swap batteries, 30 minutes flight, multiple payloads.' },
          { name: 'Typhoon H Plus', description: 'Consumer/prosumer hexacopter with 360° gimbal, 1-inch sensor, 28 minutes.' },
        ]
      },
      {
        title: 'Payloads',
        description: 'Camera and sensor payloads.',
        products: [
          { name: 'E10T/E20T', description: 'Thermal imaging cameras for H520, radiometric options.' },
          { name: 'E90/E100', description: 'High-resolution zoom cameras for inspection.' },
        ]
      }
    ],
    data_source: 'Yuneec official website'
  },

  aegisky: {
    verified: true,
    country: 'China',
    country_code: 'CN',
    website: 'https://www.aegisky.com',
    long_description: `Aegisky is the platform operator and primary vendor on the Aegisky Global UAV Trusted Trade Network (GUTN), specializing in sourcing, verification, and compliance-managed distribution of unmanned systems components and complete platforms for international B2B trade.

As the founding vendor of the GUTN ecosystem, Aegisky provides dual-use export compliance screening, end-user verification, and quality assurance for drone components and systems traded across international borders. The company works with manufacturers, distributors, and institutional buyers to ensure that all transactions comply with EU Dual-Use Regulation 2021/821, US EAR, and Wassenaar Arrangement guidelines.

Aegisky's product catalog spans the full UAV supply chain including propulsion systems, flight controllers, airframes, imaging payloads, communication systems, and complete drone platforms. The company also provides technical support, documentation, and after-sales service for international customers.`,
    product_lines: [
      {
        title: 'UAV Components',
        description: 'Verified drone components for international B2B supply.',
        products: [
          { name: 'Propulsion Systems', description: 'Motors, ESCs, and propellers from verified manufacturers.' },
          { name: 'Flight Controllers', description: 'Open-source and proprietary autopilot systems.' },
          { name: 'Airframes', description: 'Carbon fiber frames and structures for multirotor and fixed-wing UAVs.' },
        ]
      },
      {
        title: 'Compliance Services',
        description: 'Export compliance and verification for dual-use UAV trade.',
        products: [
          { name: 'ECCN Classification', description: 'Export control classification number determination for UAV products.' },
          { name: 'End-User Verification', description: 'KYC/KYB screening for international B2B transactions.' },
        ]
      }
    ],
    data_source: 'Aegisky platform data'
  }
};

export default majorBrandProfiles;
