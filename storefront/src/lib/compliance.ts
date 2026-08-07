/**
 * Export Control & Compliance Module
 * 
 * Implements:
 * - ECCN (Export Control Classification Number) categorization
 * - Sanctioned countries list (BIS EAR)
 * - Denied persons screening (simplified)
 * - End-use/end-user restrictions
 */

// ECCN categories relevant to drone/UAV products
// Reference: US Commerce Control List (CCL)
export interface ECCNCategory {
  code: string
  description: string
  reasonForControl: string
  restrictedCountries: string[]
  notes: string
}

export const ECCN_CATEGORIES: Record<string, ECCNCategory> = {
  // Category 7 - Navigation and Avionics
  '7A003': {
    code: '7A003',
    description: 'Inertial navigation systems, INS, AHRS',
    reasonForControl: 'NS, AT',
    restrictedCountries: ['IR', 'KP', 'SY', 'CU', 'RU', 'BY'],
    notes: 'High-performance inertial measurement units for UAVs',
  },
  '7A103': {
    code: '7A103',
    description: 'Telemetry and tracking systems for UAVs',
    reasonForControl: 'NS, MT',
    restrictedCountries: ['IR', 'KP', 'SY', 'CU'],
    notes: 'Tracking and telemetry equipment for unmanned systems',
  },
  // Category 9 - Propulsion and Aerospace
  '9A012': {
    code: '9A012',
    description: 'Unmanned aerial vehicles (UAVs), drones, and related systems',
    reasonForControl: 'NS, MT, AT',
    restrictedCountries: ['IR', 'KP', 'SY', 'CU', 'RU', 'BY', 'VE'],
    notes: 'Complete UAV systems capable of autonomous flight beyond visual line of sight',
  },
  '9A115': {
    code: '9A115',
    description: 'Launch/recovery equipment for UAVs',
    reasonForControl: 'NS',
    restrictedCountries: ['IR', 'KP', 'SY'],
    notes: 'Ground control stations and launchers',
  },
  '9D001': {
    code: '9D001',
    description: 'Software for UAV flight control and mission planning',
    reasonForControl: 'NS',
    restrictedCountries: ['IR', 'KP', 'SY', 'CU', 'RU', 'BY'],
    notes: 'Flight control software, autonomous navigation algorithms',
  },
  '9E001': {
    code: '9E001',
    description: 'Technology for UAV development/production',
    reasonForControl: 'NS',
    restrictedCountries: ['IR', 'KP', 'SY', 'CU', 'RU', 'BY'],
    notes: 'Technical data and technology for UAV development',
  },
  // Category 5 - Electronics and Communications
  '5A002': {
    code: '5A002',
    description: 'Information security systems, encryption',
    reasonForControl: 'NS, AT',
    restrictedCountries: ['IR', 'KP', 'SY', 'CU'],
    notes: 'Encrypted communication modules for UAVs',
  },
  // EAR99 - Most commercial products
  'EAR99': {
    code: 'EAR99',
    description: 'Commercial items not specified in CCL',
    reasonForControl: 'General',
    restrictedCountries: ['IR', 'KP', 'SY', 'CU'],
    notes: 'Most commercial drone parts, accessories, and standard components',
  },
}

// Comprehensive sanctioned/embargoed countries (BIS + OFAC)
export const SANCTIONED_COUNTRIES: Record<string, { name: string; nameZh: string; nameRu: string; level: 'embargo' | 'restricted' }> = {
  IR: { name: 'Iran', nameZh: '伊朗', nameRu: 'Иран', level: 'embargo' },
  KP: { name: 'North Korea', nameZh: '朝鲜', nameRu: 'Северная Корея', level: 'embargo' },
  SY: { name: 'Syria', nameZh: '叙利亚', nameRu: 'Сирия', level: 'embargo' },
  CU: { name: 'Cuba', nameZh: '古巴', nameRu: 'Куба', level: 'embargo' },
  RU: { name: 'Russia', nameZh: '俄罗斯', nameRu: 'Россия', level: 'restricted' },
  BY: { name: 'Belarus', nameZh: '白俄罗斯', nameRu: 'Беларусь', level: 'restricted' },
  VE: { name: 'Venezuela', nameZh: '委内瑞拉', nameRu: 'Венесуэла', level: 'restricted' },
}

// Denied/restricted entities (sample - in production use BIS API)
export const DENIED_ENTITIES = [
  { name: 'Example Entity 1', country: 'IR', reason: 'Entity List - proliferation concern' },
  { name: 'Example Entity 2', country: 'KP', reason: 'SDN List - WMD' },
]

// Military/dual-use keywords for auto-classification
const DUAL_USE_KEYWORDS = [
  'military', 'defense', 'weapon', 'missile', 'combat', 'surveillance',
  'thermal', 'infrared', 'laser', 'targeting', 'reconnaissance',
  'jamming', 'electronic warfare', 'autonomous weapon',
  'военный', 'оборона', 'оружие', 'боеприпас', 'наведение',
  '军用', '武器', '导弹', '热成像', '激光', '目标',
]

const HIGH_PERFORMANCE_KEYWORDS = [
  'long range', 'heavy lift', 'high altitude', 'beyond visual', 'bvlos',
  'autonomous', 'swarm', 'formation flight',
  'большая дальность', 'высокая грузоподъемность', 'автономный',
  '远程', '大载重', '高空', '超视距', '自主', '集群',
]

export interface ComplianceResult {
  allowed: boolean
  eccnCode: string
  warnings: string[]
  restrictions: string[]
  requiresLicense: boolean
  licenseType?: string
}

/**
 * Classify a product based on its name, description, and attributes
 */
export function classifyProduct(product: {
  name: string
  description?: string
  attributes?: any
}): string {
  const attrTexts: string[] = []
  if (Array.isArray(product.attributes)) {
    product.attributes.forEach((a: any) => {
      if (a && a.name) attrTexts.push(a.name)
      if (a && Array.isArray(a.terms)) {
        a.terms.forEach((t: any) => { if (t && t.name) attrTexts.push(t.name) })
      }
    })
  }
  const text = [
    product.name || '',
    product.description || '',
    ...attrTexts,
  ].join(' ').toLowerCase()

  // Check for complete UAV systems
  if (/drone|uav|quadcopter|multirotor|беспилотник|коптер|无人机/.test(text)) {
    if (HIGH_PERFORMANCE_KEYWORDS.some(k => text.includes(k.toLowerCase()))) {
      return '9A012'
    }
    return 'EAR99'
  }

  // Check for inertial/navigation
  if (/imu|inertial|gyro|accelerometer|navigation|ahrs|инерциальн|навигац|惯性|导航/.test(text)) {
    return '7A003'
  }

  // Check for flight controllers
  if (/flight controller|autopilot|полетный контроллер|автопилот|飞控|自驾仪/.test(text)) {
    return '9D001'
  }

  // Check for thermal/IR cameras
  if (/thermal|infrared|flir|тепловиз|инфракрасн|热成像|红外/.test(text)) {
    return '7A003'
  }

  // Check for encryption
  if (/encrypt|aes|cipher|шифрован|加密/.test(text)) {
    return '5A002'
  }

  // Check for military/dual-use
  if (DUAL_USE_KEYWORDS.some(k => text.includes(k.toLowerCase()))) {
    return '9A012'
  }

  // Default: commercial parts
  return 'EAR99'
}

/**
 * Screen a transaction for compliance
 */
export function screenTransaction(params: {
  productECCN: string
  destinationCountry: string
  endUser?: string
  endUse?: string
}): ComplianceResult {
  const { productECCN, destinationCountry, endUser, endUse } = params
  const warnings: string[] = []
  const restrictions: string[] = []
  let requiresLicense = false
  let allowed = true

  const eccn = ECCN_CATEGORIES[productECCN] || ECCN_CATEGORIES['EAR99']
  const destination = SANCTIONED_COUNTRIES[destinationCountry.toUpperCase()]

  // Check destination country
  if (destination) {
    if (destination.level === 'embargo') {
      allowed = false
      restrictions.push(
        `DESTINATION EMBARGOED: ${destination.name} is subject to comprehensive US/EU sanctions. Export is prohibited without specific license.`
      )
    } else if (destination.level === 'restricted') {
      if (eccn.restrictedCountries.includes(destinationCountry.toUpperCase())) {
        requiresLicense = true
        warnings.push(
          `RESTRICTED DESTINATION: ${destination.name} - export license required for items controlled under ${productECCN}.`
        )
      }
    }
  }

  // Check ECCN-specific restrictions
  if (eccn.restrictedCountries.includes(destinationCountry.toUpperCase())) {
    requiresLicense = true
    if (allowed) {
      warnings.push(
        `ECCN ${productECCN} (${eccn.description}) requires an export license for ${destinationCountry}.`
      )
    }
  }

  // Check end-use red flags
  if (endUse) {
    const endUseLower = endUse.toLowerCase()
    if (DUAL_USE_KEYWORDS.some(k => endUseLower.includes(k.toLowerCase()))) {
      allowed = false
      restrictions.push(
        'RED FLAG: End-use indicates potential military application. Enhanced due diligence required.'
      )
    }
  }

  // Check denied entities
  if (endUser) {
    const matched = DENIED_ENTITIES.find(e =>
      endUser.toLowerCase().includes(e.name.toLowerCase())
    )
    if (matched) {
      allowed = false
      restrictions.push(
        `DENIED ENTITY MATCH: ${matched.name} (${matched.country}) - ${matched.reason}`
      )
    }
  }

  return {
    allowed,
    eccnCode: productECCN,
    warnings,
    restrictions,
    requiresLicense,
    licenseType: requiresLicense ? 'BIS Individual Validated License' : undefined,
  }
}

/**
 * Get compliance badge info for a product
 */
export function getComplianceBadge(eccnCode: string): {
  label: string
  color: string
  restricted: boolean
} {
  const eccn = ECCN_CATEGORIES[eccnCode]
  if (!eccn || eccnCode === 'EAR99') {
    return { label: 'EAR99', color: 'green', restricted: false }
  }
  if (eccnCode.startsWith('9A') || eccnCode.startsWith('7A')) {
    return { label: eccnCode, color: 'orange', restricted: true }
  }
  return { label: eccnCode, color: 'blue', restricted: true }
}
