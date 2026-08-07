// Solution categories - modeled after UST supplier directory
// Each category maps local brands/products via keyword matching

export interface SolutionCategory {
  slug: string
  name: string
  nameRu: string
  nameZh: string
  description: string
  descriptionRu: string
  descriptionZh: string
  icon: string // SVG path or emoji
  color: string // theme color
  keywords: string[] // brand slugs or product category keywords
  relatedCategories: { slug: string; name: string }[]
}

export const SOLUTION_CATEGORIES: SolutionCategory[] = [
  {
    slug: 'counter-uas',
    name: 'Counter-UAS',
    nameRu: 'Противодействие БПЛА',
    nameZh: '反无人机系统',
    description: 'Anti-drone systems, jammers, detection and neutralization equipment for airspace security.',
    descriptionRu: 'Системы противодействия БПЛА, подавители, обнаружение и нейтрализация.',
    descriptionZh: '反无人机系统、干扰器、探测与中和设备，用于空域安全防护。',
    icon: 'shield',
    color: '#DC2626',
    keywords: ['counter', 'anti-drone', 'jammer', 'detection', 'security', 'shield', 'military'],
    relatedCategories: [
      { slug: 'command-control-communications', name: 'Command & Control' },
      { slug: 'sensors-payloads', name: 'Sensors & Payloads' },
      { slug: 'unmanned-vehicles', name: 'Unmanned Vehicles' },
    ],
  },
  {
    slug: 'command-control-communications',
    name: 'Command, Control & Communications',
    nameRu: 'Управление, контроль и связь',
    nameZh: '指挥控制与通信',
    description: 'Data links, radios, telemetry, ground control stations and communication systems for UAVs.',
    descriptionRu: 'Каналы передачи данных, радиомодули, телеметрия, наземные станции управления.',
    descriptionZh: '数据链、无线电、遥测、地面控制站和无人机通信系统。',
    icon: 'radio',
    color: '#2563EB',
    keywords: ['radio', 'link', 'telemetry', 'transmitter', 'receiver', 'antenna', 'comm', 'elrs', 'frsky', 'crossfire', 'expresslrs', 'antenna', 'radiomaster', 'jumper', 'radiolink', 'flysky', 'futaba', 'frsky'],
    relatedCategories: [
      { slug: 'electronics-subsystems', name: 'Electronics & Subsystems' },
      { slug: 'positioning-navigation', name: 'Positioning & Navigation' },
      { slug: 'software-autonomy', name: 'Software & Autonomy' },
    ],
  },
  {
    slug: 'electronics-subsystems',
    name: 'Electronics & Subsystems',
    nameRu: 'Электроника и подсистемы',
    nameZh: '电子与子系统',
    description: 'Flight controllers, ESCs, motors, servos, batteries and electronic components for drones.',
    descriptionRu: 'Полётные контроллеры, регуляторы хода, моторы, сервоприводы, аккумуляторы.',
    descriptionZh: '飞控、电调、电机、舵机、电池和无人机电子元器件。',
    icon: 'chip',
    color: '#7C3AED',
    keywords: ['flight-controller', 'esc', 'motor', 'servo', 'battery', 'fc', 'f4', 'f7', 'hglrc', 'matek', 'mamba', 'speedybee', 'betafpv', 'iflight', 'geprc', 'diatone', 'emax', 't-motor', 'brotherhobby', 'hqprop', 'gemfan', 'dys'],
    relatedCategories: [
      { slug: 'propulsion-power', name: 'Propulsion & Power' },
      { slug: 'structural-mechanical', name: 'Structural & Mechanical' },
      { slug: 'sensors-payloads', name: 'Sensors & Payloads' },
    ],
  },
  {
    slug: 'structural-mechanical',
    name: 'Structural & Mechanical Systems',
    nameRu: 'Конструкции и механические системы',
    nameZh: '结构与机械系统',
    description: 'Frames, propellers, landing gear, gimbals and structural components for UAV platforms.',
    descriptionRu: 'Рамы, пропеллеры, шасси, подвесы и конструкционные компоненты.',
    descriptionZh: '机架、螺旋桨、起落架、云台和无人平台结构部件。',
    icon: 'wrench',
    color: '#6B7280',
    keywords: ['frame', 'propeller', 'landing', 'gimbal', 'carbon', 'arm', 'hqprop', 'gemfan', 'dalprop', 't-motor', 'tarot', 'iflight', 'geprc', 'armattan'],
    relatedCategories: [
      { slug: 'propulsion-power', name: 'Propulsion & Power' },
      { slug: 'materials-manufacture', name: 'Materials & Manufacture' },
      { slug: 'unmanned-vehicles', name: 'Unmanned Vehicles' },
    ],
  },
  {
    slug: 'positioning-navigation',
    name: 'Positioning, Navigation & Timing',
    nameRu: 'Позиционирование и навигация',
    nameZh: '定位导航与授时',
    description: 'GPS/GNSS modules, compasses, altimeters, INS and navigation systems for UAVs.',
    descriptionRu: 'GPS/ГНСС модули, компасы, высотомеры, ИНС и навигационные системы.',
    descriptionZh: 'GPS/GNSS模块、罗盘、高度计、惯性导航和无人机导航系统。',
    icon: 'navigation',
    color: '#0891B2',
    keywords: ['gps', 'gnss', 'compass', 'navigation', 'imu', 'gnss', 'here', 'm8n', 'm10', 'bn-180', 'bn-220', 'ublox', 'matek', 'holybro', 'cuav', 'pixhawk', 'ardupilot'],
    relatedCategories: [
      { slug: 'command-control-communications', name: 'Command & Control' },
      { slug: 'sensors-payloads', name: 'Sensors & Payloads' },
      { slug: 'software-autonomy', name: 'Software & Autonomy' },
    ],
  },
  {
    slug: 'sensors-payloads',
    name: 'Mission Sensors & Payloads',
    nameRu: 'Датчики и полезная нагрузка',
    nameZh: '任务传感器与载荷',
    description: 'Cameras, gimbals, thermal imaging, LiDAR, multispectral sensors and payload systems.',
    descriptionRu: 'Камеры, подвесы, тепловизоры, лидары, мультиспектральные сенсоры.',
    descriptionZh: '相机、云台、热成像、激光雷达、多光谱传感器和任务载荷。',
    icon: 'camera',
    color: '#DB2777',
    keywords: ['camera', 'gimbal', 'thermal', 'lidar', 'caddx', 'runcam', 'dji', 'gopro', 'insta360', 'flir', 'foxeer', 'fatshark', 'hdzero', 'skyzone', 'walksnail', 'orqa', 'lidar', 'benewake', 'hesai', 'livox', 'ouster', 'velodyne', 'robosense', 'slamtec'],
    relatedCategories: [
      { slug: 'electronics-subsystems', name: 'Electronics & Subsystems' },
      { slug: 'command-control-communications', name: 'Command & Control' },
      { slug: 'unmanned-vehicles', name: 'Unmanned Vehicles' },
    ],
  },
  {
    slug: 'propulsion-power',
    name: 'Propulsion & Power',
    nameRu: 'Движение и питание',
    nameZh: '推进与动力',
    description: 'Motors, ESCs, propellers, batteries, chargers and power distribution systems.',
    descriptionRu: 'Моторы, регуляторы, пропеллеры, аккумуляторы, зарядные устройства.',
    descriptionZh: '电机、电调、螺旋桨、电池、充电器和配电系统。',
    icon: 'zap',
    color: '#EA580C',
    keywords: ['motor', 'esc', 'battery', 'charger', 'lipo', 't-motor', 'brotherhobby', 'emax', 'dys', ' Sunnysky', 'xrotor', 'hobbywing', 'gensace', 'hrb', 'cnhl', 'gt-power', 'isdt', 'toolkitrc', 'hota', 'junsi', 'imax', 'turnigy', 'eachine', 'lumenier'],
    relatedCategories: [
      { slug: 'electronics-subsystems', name: 'Electronics & Subsystems' },
      { slug: 'structural-mechanical', name: 'Structural & Mechanical' },
      { slug: 'materials-manufacture', name: 'Materials & Manufacture' },
    ],
  },
  {
    slug: 'materials-manufacture',
    name: 'Materials & Manufacture',
    nameRu: 'Материалы и производство',
    nameZh: '材料与制造',
    description: 'Carbon fiber, 3D printing, PCB manufacturing, cables, connectors and raw materials.',
    descriptionRu: 'Углеродное волокно, 3D-печать, производство плат, кабели, разъёмы.',
    descriptionZh: '碳纤维、3D打印、PCB制造、线缆、连接器和原材料。',
    icon: 'layers',
    color: '#CA8A04',
    keywords: ['carbon', 'fiber', '3d-print', 'cable', 'connector', 'wire', 'solder', 'filament', 'pla', 'abs', 'petg', 'xt60', 'xt90', 'banana'],
    relatedCategories: [
      { slug: 'structural-mechanical', name: 'Structural & Mechanical' },
      { slug: 'electronics-subsystems', name: 'Electronics & Subsystems' },
      { slug: 'professional-services', name: 'Professional Services' },
    ],
  },
  {
    slug: 'safety-systems',
    name: 'Safety Systems',
    nameRu: 'Системы безопасности',
    nameZh: '安全系统',
    description: 'Parachutes, failsafe systems, obstacle avoidance, ADS-B and safety equipment.',
    descriptionRu: 'Парашюты, системы аварийной защиты, избегание препятствий, ADS-B.',
    descriptionZh: '降落伞、故障保护系统、避障、ADS-B和安全设备。',
    icon: 'shield-check',
    color: '#16A34A',
    keywords: ['parachute', 'safety', 'failsafe', 'obstacle', 'ads-b', 'flarm', 'recovery', 'mars', 'fruity'],
    relatedCategories: [
      { slug: 'sensors-payloads', name: 'Sensors & Payloads' },
      { slug: 'software-autonomy', name: 'Software & Autonomy' },
      { slug: 'counter-uas', name: 'Counter-UAS' },
    ],
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    nameRu: 'Профессиональные услуги',
    nameZh: '专业服务',
    description: 'Drone training, consulting, maintenance, mapping services, inspection and integration.',
    descriptionRu: 'Обучение пилотов, консалтинг, обслуживание, картографирование, инспекция.',
    descriptionZh: '无人机培训、咨询、维护、测绘服务、巡检和系统集成。',
    icon: 'briefcase',
    color: '#4F46E5',
    keywords: ['service', 'training', 'consulting', 'maintenance', 'repair', 'mapping', 'inspection', 'survey'],
    relatedCategories: [
      { slug: 'software-autonomy', name: 'Software & Autonomy' },
      { slug: 'unmanned-vehicles', name: 'Unmanned Vehicles' },
      { slug: 'sensors-payloads', name: 'Sensors & Payloads' },
    ],
  },
  {
    slug: 'software-autonomy',
    name: 'Software & Autonomy',
    nameRu: 'Программное обеспечение и автономия',
    nameZh: '软件与自主系统',
    description: 'Flight control software, mission planning, autonomous navigation, AI and computer vision.',
    descriptionRu: 'ПО для полётных контроллеров, планирование миссий, автономная навигация, ИИ.',
    descriptionZh: '飞控软件、任务规划、自主导航、人工智能和计算机视觉。',
    icon: 'code',
    color: '#0D9488',
    keywords: ['software', 'ardupilot', 'px4', 'betaflight', 'inav', 'mission-planner', 'qgroundcontrol', 'autonomous', 'ai', 'vision', 'opencv', 'cuda', 'nvidia', 'raspberry', 'arduino', 'pixhawk', 'cuav', 'holybro', 'matek'],
    relatedCategories: [
      { slug: 'electronics-subsystems', name: 'Electronics & Subsystems' },
      { slug: 'positioning-navigation', name: 'Positioning & Navigation' },
      { slug: 'command-control-communications', name: 'Command & Control' },
    ],
  },
  {
    slug: 'unmanned-vehicles',
    name: 'Unmanned Vehicles & Platforms',
    nameRu: 'Беспилотные аппараты и платформы',
    nameZh: '无人飞行器与平台',
    description: 'Complete drone systems, multirotors, fixed-wing, VTOL, FPV and RTF platforms.',
    descriptionRu: 'Готовые дроны, мультироторы, самолёты, VTOL, FPV и RTF платформы.',
    descriptionZh: '完整无人机系统、多旋翼、固定翼、垂直起降、FPV和到手飞平台。',
    icon: 'drone',
    color: '#9333EA',
    keywords: ['drone', 'quadcopter', 'multirotor', 'fixed-wing', 'vtol', 'fpv', 'rtf', 'dji', 'autel', 'yuneec', 'parrot', 'walkera', 'hubsan', 'syma', 'eachine', 'emax', 'iflight', 'geprc', 'armattan', 'darwinfpv', 'happymodel', 'betafpv', 'tinywhoop'],
    relatedCategories: [
      { slug: 'electronics-subsystems', name: 'Electronics & Subsystems' },
      { slug: 'propulsion-power', name: 'Propulsion & Power' },
      { slug: 'sensors-payloads', name: 'Sensors & Payloads' },
    ],
  },
]

export function getCategoryBySlug(slug: string): SolutionCategory | undefined {
  return SOLUTION_CATEGORIES.find(c => c.slug === slug)
}

// Match brands to solution categories based on keywords
export function matchBrandsToCategory(
  category: SolutionCategory,
  brands: Array<{ slug: string; name: string; productCount?: number }>,
  products: Array<{ brands?: Array<{ slug: string; name: string }>; categories?: Array<{ slug: string; name: string }>; tags?: Array<{ slug: string; name: string }> }>
): Array<{ slug: string; name: string; productCount: number }> {
  const kw = category.keywords.map(k => k.toLowerCase())
  const brandScores = new Map<string, { name: string; count: number; score: number }>()

  for (const p of products) {
    const productBrands = Array.isArray(p.brands) ? p.brands : []
    const catArr = Array.isArray(p.categories) ? p.categories : []
    const tagArr = Array.isArray(p.tags) ? p.tags : []
    const productCats = catArr.map(c => (c.slug || '').toLowerCase() + ' ' + (c.name || '').toLowerCase()).join(' ')
    const productTags = tagArr.map(t => (t.slug || '').toLowerCase() + ' ' + (t.name || '').toLowerCase()).join(' ')
    const productText = productCats + ' ' + productTags

    let matched = false
    for (const k of kw) {
      if (productText.includes(k)) {
        matched = true
        break
      }
    }

    if (matched) {
      for (const b of productBrands) {
        const slug = b.slug.toLowerCase()
        const existing = brandScores.get(slug)
        if (existing) {
          existing.count++
        } else {
          brandScores.set(slug, { name: b.name, count: 1, score: 0 })
        }
      }
    }
  }

  // Also match brands whose name/slug contains keywords
  for (const b of brands) {
    const bSlug = b.slug.toLowerCase()
    const bName = b.name.toLowerCase()
    for (const k of kw) {
      if (bSlug.includes(k) || bName.includes(k)) {
        const existing = brandScores.get(bSlug)
        if (existing) {
          existing.score += 10
        } else {
          brandScores.set(bSlug, { name: b.name, count: b.productCount || 0, score: 10 })
        }
        break
      }
    }
  }

  const result = Array.from(brandScores.entries())
    .map(([slug, data]) => ({ slug, name: data.name, productCount: data.count + data.score }))
    .sort((a, b) => b.productCount - a.productCount)

  return result
}
