/**
 * Industrial Trade OS - Compliance Router
 * 合规路由引擎 - 核心突破：不是阻断交易，而是设计合规交易路径
 * 类似Google Maps：不告诉你"不能走"，而是给出多条可选路线
 */
import { TradePath } from './trade-kernel'
import { SANCTIONED_COUNTRIES, HIGH_RISK_COUNTRIES, DRONE_ECCN_CODES } from '../control-tower/constants'

export interface ComplianceRouterInput {
  productCategory: string
  eccnCode?: string
  hsCode?: string
  buyerCountry: string
  destinationCountry: string
  endUse: string
  quantity: number
  hasEndUserCertificate: boolean
  hasExportLicense: boolean
  isMilitary: boolean
}

export interface ComplianceRouterOutput {
  canTrade: boolean
  blockReason?: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendedPaths: TradePath[]
  requiredDocuments: string[]
  estimatedTimelineDays: number
  estimatedAdditionalCostPercent: number
  warnings: string[]
  suggestions: string[]
}

/**
 * 合规路由引擎 - 核心算法
 * 输入：产品、买方、目的地、最终用途
 * 输出：多条合规交易路径，每条路径有风险、时间、成本评估
 */
export function computeComplianceRoutes(input: ComplianceRouterInput): ComplianceRouterOutput {
  const warnings: string[] = []
  const suggestions: string[] = []
  const paths: TradePath[] = []

  // 1. 硬熔断检查 - 全面制裁国家
  if (SANCTIONED_COUNTRIES.includes(input.destinationCountry)) {
    return {
      canTrade: false,
      blockReason: `DESTINATION_EMBARGO: ${input.destinationCountry} is under comprehensive UN/OFAC/EU sanctions. Trade is prohibited under international law.`,
      riskScore: 100,
      riskLevel: 'CRITICAL',
      recommendedPaths: [],
      requiredDocuments: [],
      estimatedTimelineDays: 0,
      estimatedAdditionalCostPercent: 0,
      warnings: [`Comprehensive sanctions apply to ${input.destinationCountry}`],
      suggestions: [
        'Consider alternative legal jurisdictions',
        'Consult with export control legal counsel',
        'Apply for specific OFAC license if humanitarian use',
      ],
    }
  }

  // 2. 军事最终用途硬阻断
  if (input.isMilitary) {
    return {
      canTrade: false,
      blockReason: 'MILITARY_END_USE: Military end-use is strictly prohibited on this platform. We do not facilitate defense trade.',
      riskScore: 100,
      riskLevel: 'CRITICAL',
      recommendedPaths: [],
      requiredDocuments: [],
      estimatedTimelineDays: 0,
      estimatedAdditionalCostPercent: 0,
      warnings: ['Military end-use detected'],
      suggestions: [
        'This platform supports civilian commercial UAV trade only',
        'For defense trade, please contact licensed defense brokers',
      ],
    }
  }

  // 计算基础风险分
  let baseRisk = 10
  const eccn = DRONE_ECCN_CODES.find(e => e.eccn_code === input.eccnCode)
  if (eccn) {
    if (eccn.reason_for_control.includes('MT')) baseRisk += 25
    else if (eccn.reason_for_control.includes('NS')) baseRisk += 15
    else if (eccn.is_dual_use) baseRisk += 10
  }

  if (HIGH_RISK_COUNTRIES.includes(input.destinationCountry)) {
    baseRisk += 20
    warnings.push(`${input.destinationCountry} is a high-risk transshipment jurisdiction. Enhanced due diligence required.`)
  }

  if (input.quantity > 100) {
    baseRisk += 10
    warnings.push(`Large quantity (${input.quantity} units) may trigger license requirements.`)
  }

  if (!input.hasEndUserCertificate) {
    baseRisk += 5
    suggestions.push('Obtain End User Statement (EUS) to reduce risk and accelerate review.')
  }

  // 3. 生成多条合规路径

  // 路径A：直接出口（低风险国家+民用）
  if (baseRisk < 30) {
    paths.push({
      id: 'direct_export',
      name: '直接出口路径',
      description: '标准商业出口，无需特殊许可证，通过授权分销商直接交付',
      risk_level: 'LOW',
      estimated_days: 14,
      additional_cost_percent: 0,
      required_documents: [
        'Commercial Invoice',
        'Packing List',
        'Bill of Lading / Air Waybill',
        'End User Statement',
        'Certificate of Origin',
      ],
      steps: [
        'Order confirmation',
        'Standard compliance screening (automated)',
        'Payment processing',
        'Export declaration',
        'Direct shipment',
        'Customs clearance at destination',
      ],
      recommended: true,
    })
  }

  // 路径B：授权分销商路径（中风险）
  if (baseRisk >= 20 && baseRisk < 60) {
    paths.push({
      id: 'authorized_distributor',
      name: '授权分销商路径',
      description: '通过目的地国授权分销商进行，增加一层KYC和最终用户验证',
      risk_level: 'MEDIUM',
      estimated_days: 28,
      additional_cost_percent: 8,
      required_documents: [
        'Commercial Invoice',
        'Packing List',
        'Bill of Lading',
        'End User Certificate (notarized)',
        'Distributor KYC documentation',
        'Import License (if required)',
        'Certificate of Origin',
      ],
      steps: [
        'Distributor due diligence and KYC',
        'Enhanced compliance review',
        'End user verification',
        'Payment via Letter of Credit',
        'Ship to authorized distributor',
        'Distributor performs final delivery',
        'Post-delivery verification',
      ],
      recommended: baseRisk >= 30 && baseRisk < 50,
    })
  }

  // 路径C：许可证路径（受控物项）
  if (eccn?.is_dual_use && input.hasExportLicense === false) {
    paths.push({
      id: 'individual_license',
      name: '个人出口许可证路径',
      description: '向出口国主管部门申请个体出口许可证，适用于受控物项',
      risk_level: 'HIGH',
      estimated_days: 60,
      additional_cost_percent: 15,
      required_documents: [
        'Export License Application',
        'End User Certificate (government stamped)',
        'Technical specifications',
        'Purchase order',
        'Importer statement',
        'Delivery verification undertaking',
      ],
      steps: [
        'Prepare license application package',
        'Submit to export control authority',
        'Government review period (30-45 days)',
        'License issuance',
        'License present to customs',
        'Shipment under license',
        'Post-shipment reporting',
      ],
      recommended: false,
    })
  }

  // 路径D：自由贸易区/再出口路径（高风险转口）
  if (HIGH_RISK_COUNTRIES.includes(input.destinationCountry)) {
    paths.push({
      id: 'ftz_transshipment',
      name: '自由贸易区合规路径',
      description: '通过新加坡/阿联酋自由港进行合规清关和最终用户验证',
      risk_level: 'MEDIUM',
      estimated_days: 35,
      additional_cost_percent: 12,
      required_documents: [
        'FTZ Entry documents',
        'Re-export declaration',
        'Enhanced end user verification',
        'Third-party inspection report',
        'Certificate of non-reexport',
      ],
      steps: [
        'Ship to Free Trade Zone warehouse',
        'Physical inspection at FTZ',
        'End user on-site verification',
        'Re-export compliance check',
        'Final leg shipment',
        'Delivery confirmation',
      ],
      recommended: false,
    })
  }

  // 路径E：民用版本降级路径（产品重新分类）
  if (eccn?.eccn_code === '9A012' && input.endUse.toLowerCase().includes('agri') ||
      input.endUse.toLowerCase().includes('survey') ||
      input.endUse.toLowerCase().includes('mapping')) {
    paths.push({
      id: 'civilian_version',
      name: '民用专用版本路径',
      description: '使用民用专用版本（移除加密/长航时/热成像等受控功能），适用EAR99分类',
      risk_level: 'LOW',
      estimated_days: 21,
      additional_cost_percent: -5,
      required_documents: [
        'Product configuration statement',
        'Civilian use declaration',
        'Feature limitation certificate',
        'Standard export documents',
      ],
      steps: [
        'Configure civilian-only variant',
        'Reclassify as EAR99',
        'Standard automated screening',
        'Direct shipment',
        'Delivery',
      ],
      recommended: true,
    })
    suggestions.push('Consider using civilian-specific configuration without controlled features (encryption, thermal, long-range) to qualify for EAR99 and expedite shipment.')
  }

  // 如果没有路径生成，提供通用建议
  if (paths.length === 0) {
    paths.push({
      id: 'enhanced_due_diligence',
      name: '增强尽职调查路径',
      description: '完整的增强尽职调查流程，多层审批',
      risk_level: 'HIGH',
      estimated_days: 45,
      additional_cost_percent: 20,
      required_documents: [
        'Full KYC package',
        'Notarized End User Certificate',
        'Third-party audit report',
        'Senior compliance officer approval',
        'Board level approval (if >$100k)',
      ],
      steps: [
        'Enhanced due diligence',
        'On-site audit (if required)',
        'Senior compliance review',
        'License determination',
        'Secured payment',
        'Tracked shipment',
        'Post-delivery audit',
      ],
      recommended: false,
    })
  }

  // 确定风险等级
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
  if (baseRisk >= 70) riskLevel = 'CRITICAL'
  else if (baseRisk >= 45) riskLevel = 'HIGH'
  else if (baseRisk >= 25) riskLevel = 'MEDIUM'

  // 推荐路径 = 风险最低 + 时间最快 + 成本最低
  const recommendedPath = paths.reduce((best, p) => {
    const score = (p.risk_level === 'LOW' ? 0 : p.risk_level === 'MEDIUM' ? 1 : 2) * 100 +
                  p.estimated_days + p.additional_cost_percent
    const bestScore = (best.risk_level === 'LOW' ? 0 : best.risk_level === 'MEDIUM' ? 1 : 2) * 100 +
                      best.estimated_days + best.additional_cost_percent
    return score < bestScore ? p : best
  }, paths[0])

  paths.forEach(p => p.recommended = p.id === recommendedPath.id)

  return {
    canTrade: true,
    riskScore: baseRisk,
    riskLevel,
    recommendedPaths: paths.sort((a, b) => {
      const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }
      return order[a.risk_level] - order[b.risk_level]
    }),
    requiredDocuments: recommendedPath.required_documents,
    estimatedTimelineDays: recommendedPath.estimated_days,
    estimatedAdditionalCostPercent: recommendedPath.additional_cost_percent,
    warnings,
    suggestions,
  }
}

/**
 * 产品数字护照 - Product Digital Passport
 * 每个产品的完整合规身份
 */
export interface ProductDigitalPassport {
  productId: string
  productName: string
  manufacturer: string
  countryOfOrigin: string

  // 分类体系
  hsCode: string
  hsDescription: string
  eccnCode: string
  eccnDescription: string
  euDualUseCategory: string
  militaryList: boolean

  // 技术参数（用于分类判断）
  technicalSpecs: {
    mtow?: number // 最大起飞重量 kg
    range?: number // 航程 km
    endurance?: number // 续航 min
    payload?: number // 载荷 kg
    maxSpeed?: number // km/h
    hasEncryption?: boolean
    hasThermal?: boolean
    hasNightVision?: boolean
    hasRtk?: boolean
    frequencyBand?: string
    communicationRange?: number
  }

  // 管制原因
  controlReasons: string[]
  licenseExceptions: string[]

  // 风险评级
  inherentRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'

  // 允许出口国家（白名单）
  allowedCountries: string[]
  // 需要许可证国家
  licenseRequiredCountries: string[]
  // 禁止国家
  prohibitedCountries: string[]
}

/**
 * 根据技术参数自动分类产品
 */
export function classifyProduct(specs: {
  mtow?: number
  range?: number
  endurance?: number
  payload?: number
  hasEncryption?: boolean
  hasThermal?: boolean
  hasNightVision?: boolean
  frequencyBand?: string
}): { eccn: string; hsCode: string; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; reasons: string[] } {
  const reasons: string[] = []
  let eccn = 'EAR99'
  let hsCode = '8806.24' // 无人机<25kg
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'

  // 9A012 判断：无人机系统
  const isUAV = specs.mtow !== undefined
  if (isUAV) {
    const longRange = (specs.range ?? 0) >= 50 || (specs.endurance ?? 0) >= 60
    const hasPayload = (specs.payload ?? 0) >= 1
    const hasSensitiveFeatures = specs.hasThermal || specs.hasNightVision || specs.hasEncryption

    if (longRange || hasPayload || hasSensitiveFeatures) {
      eccn = '9A012'
      reasons.push('Unmanned aerial vehicle system with controlled capabilities')
      riskLevel = 'MEDIUM'

      if ((specs.range ?? 0) >= 300 || (specs.payload ?? 0) >= 7) {
        reasons.push('Range/payload exceeds MTCR Category I threshold')
        riskLevel = 'HIGH'
      }
    }

    // HS Code 根据重量
    if ((specs.mtow ?? 0) < 0.25) hsCode = '8806.22'
    else if ((specs.mtow ?? 0) < 7) hsCode = '8806.23'
    else if ((specs.mtow ?? 0) < 25) hsCode = '8806.24'
    else hsCode = '8806.29'
  }

  // 零部件
  if (specs.hasThermal) {
    eccn = eccn === 'EAR99' ? '6A003' : eccn
    reasons.push('Thermal imaging camera')
    riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel
  }

  if (specs.hasEncryption) {
    reasons.push('Encryption capabilities (5A002/5D002)')
    riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel
  }

  return { eccn, hsCode, riskLevel, reasons }
}
