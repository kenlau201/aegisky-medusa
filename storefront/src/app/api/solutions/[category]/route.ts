import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

const CATEGORY_INFO: Record<string, { name: string; description: string; icon: string }> = {
  vehicles: {
    name: 'Unmanned Vehicles & Platforms',
    description: 'Multirotor, fixed-wing, VTOL, helicopter, heavy-lift, nano/micro UAV platforms, USV, AUV, and ROV marine systems.',
    icon: '✈'
  },
  propulsion: {
    name: 'Propulsion & Power',
    description: 'Motors, ESCs, propellers, engines, fuel cells, batteries, BMS, and power management systems for UAVs.',
    icon: '⚡'
  },
  sensors: {
    name: 'Sensors & Payloads',
    description: 'EO/IR gimbals, LiDAR, cameras, radar, SAR, sonar, weather sensors, and multispectral/hyperspectral payloads.',
    icon: '📡'
  },
  c2: {
    name: 'Command, Control & Communications',
    description: 'Data links, SATCOM, mesh radios, SDR, antennas, video transmission, ground control stations, and 5G/4G systems.',
    icon: '📶'
  },
  navigation: {
    name: 'Navigation & Positioning',
    description: 'INS/GPS/IMU, GNSS antennas/receivers, RTK, AHRS, FOG/MEMS inertial systems, anti-jam GPS, and transponders.',
    icon: '🧭'
  },
  software: {
    name: 'Software & Autonomy',
    description: 'Autopilots, flight controllers, edge AI, computer vision, sense-and-avoid, flight planning, fleet management, and data analytics.',
    icon: '💻'
  },
  'counter-uas': {
    name: 'Counter-UAS & Airspace Security',
    description: 'Drone detection, mitigation, RF cyber, radar, and airspace security systems for protection against unauthorized UAVs.',
    icon: '🛡'
  },
  mechanical: {
    name: 'Actuators, Servos & Mechanical',
    description: 'Servo actuators, linear actuators, motor controllers, gimbals, landing gear, connectors, carbon fiber, and manufacturing.',
    icon: '⚙'
  },
  safety: {
    name: 'Safety, Recovery & Remote ID',
    description: 'Parachutes, launch/recovery systems, remote ID, safety equipment, and fail-safe devices for UAV operations.',
    icon: '🪂'
  },
  services: {
    name: 'Services & Solutions',
    description: 'Training, consulting, engineering, drone services, mapping, inspection, delivery, and professional UAV solutions.',
    icon: '🔧'
  },
  electronics: {
    name: 'Electronics & Components',
    description: 'Flight controllers, ESCs, PDBs, BECs, VTX, receivers, antennas, and electronic components for drone systems.',
    icon: '🔌'
  },
  materials: {
    name: 'Materials & Manufacturing',
    description: 'Carbon fiber, 3D printing, CNC machining, PCB, connectors, and advanced materials for UAV construction.',
    icon: '🔩'
  }
};

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const category = params.category;
    const info = CATEGORY_INFO[category];

    if (!info) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get suppliers in this category
    const suppliersResult = await db.query(
      `SELECT id, name, slug, logo_url as logo, product_count, tagline, description,
              country, website_url, founded_year, solution_categories
       FROM aegisky_brands
       WHERE $1 = ANY(solution_categories)
       ORDER BY product_count DESC NULLS LAST, name ASC
       LIMIT 100`,
      [category]
    );

    // Get products related to this category - search by category names and tags
    const categoryKeywords: Record<string, string[]> = {
      vehicles: ['drone', 'quadcopter', 'multirotor', 'fixed-wing', 'vtol', 'uav', 'aircraft', 'frame'],
      propulsion: ['motor', 'esc', 'propeller', 'prop', 'battery', 'lipo', 'engine', 'fuel cell', 'power'],
      sensors: ['camera', 'gimbal', 'lidar', 'sensor', 'thermal', 'radar', 'multispectral', 'payload'],
      c2: ['radio', 'transmitter', 'receiver', 'vtx', 'antenna', 'data link', 'telemetry', 'controller', 'gcs'],
      navigation: ['gps', 'gnss', 'imu', 'ins', 'rtk', 'compass', 'navigation', 'ahrs', 'barometer'],
      software: ['flight controller', 'fc', 'autopilot', 'software', 'firmware', 'betaflight', 'px4', 'ardupilot'],
      'counter-uas': ['counter', 'detection', 'jammer', 'anti-drone', 'security'],
      mechanical: ['servo', 'actuator', 'gimbal', 'landing gear', 'connector', 'carbon', '3d print'],
      safety: ['parachute', 'recovery', 'remote id', 'safety', 'buzzer', 'finder'],
      services: ['service', 'training', 'consulting', 'repair', 'mapping', 'inspection'],
      electronics: ['flight controller', 'esc', 'pdb', 'bec', 'vtx', 'receiver', 'electronics', 'stack'],
      materials: ['carbon', '3d print', 'cnc', 'connector', 'material', 'tape', 'solder']
    };

    const keywords = categoryKeywords[category] || [category];
    const productConditions = keywords.map((_, i) => `LOWER(p.name) LIKE $${i + 2}`).join(' OR ');
    const productParams = [category, ...keywords.map(k => `%${k}%`)];

    const productsResult = await db.query(
      `SELECT p.id, p.name, p.slug, p.sku, p.price, p.main_image, p.short_description,
              p.brands, p.categories, p.image_count
       FROM aegisky_products p
       WHERE p.id IN (
         SELECT b.id FROM aegisky_brands b WHERE $1 = ANY(b.solution_categories)
       )
       AND (${productConditions})
       AND p.in_stock = true
       ORDER BY p.created_at DESC
       LIMIT 24`,
      productParams
    );

    // If no products found by keyword, just get products from brands in this category
    let products = productsResult.rows;
    if (products.length === 0) {
      const fallbackResult = await db.query(
        `SELECT p.id, p.name, p.slug, p.sku, p.price, p.main_image, p.short_description,
                p.brands, p.categories, p.image_count
         FROM aegisky_products p
         WHERE p.brands::text ILIKE ANY(
           SELECT '%' || b.slug || '%' FROM aegisky_brands b WHERE $1 = ANY(b.solution_categories)
         )
         AND p.in_stock = true
         ORDER BY p.created_at DESC
         LIMIT 24`,
        [category]
      );
      products = fallbackResult.rows;
    }

    // Get stats
    const statsResult = await db.query(
      `SELECT COUNT(*) as supplier_count,
              COALESCE(SUM(b.product_count), 0) as total_products
       FROM aegisky_brands b
       WHERE $1 = ANY(b.solution_categories)`,
      [category]
    );

    return NextResponse.json({
      category: {
        slug: category,
        ...info
      },
      suppliers: suppliersResult.rows,
      products,
      stats: {
        suppliers: parseInt(statsResult.rows[0].supplier_count),
        products: parseInt(statsResult.rows[0].total_products)
      },
      allCategories: Object.entries(CATEGORY_INFO).map(([slug, data]) => ({ slug, ...data }))
    });
  } catch (error: any) {
    console.error('Error fetching solutions category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
