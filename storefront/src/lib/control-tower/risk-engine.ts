/**
 * Aegisky Control Tower - 风险评分引擎 v2.0
 * 多维度风险评估，符合 EU Dual-Use / OFAC / FATF 标准
 */
import { SANCTIONED_COUNTRIES, HIGH_RISK_COUNTRIES, RED_FLAG_KEYWORDS, DRONE_ECCN_CODES } from './constants'

export interface RiskFactor {
  category: string
  name: string
  score: number
  maxScore: number
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  mitigation?: string
}

export interface RiskAssessment {
  totalScore: number
  maxPossibleScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: RiskFactor[]
  redFlags: string[]
  screeningHits: ScreeningHit[]
  recommendation: 'APPROVE' | 'REVIEW' | 'ESCALATE' | 'REJECT'
  recommendationReason: string
}

export interface ScreeningHit {
  list: string
  matchedName: string
  confidence: number
  details: string
}

// 国家风险评分 (0-40分)
function scoreCountryRisk(destinationCountry: string, endUserCountry?: string): RiskFactor {
  const country = destinationCountry.toUpperCase()
  const endCountry = endUserCountry?.toUpperCase()

  if (SANCTIONED_COUNTRIES.includes(country) || (endCountry && SANCTIONED_COUNTRIES.includes(endCountry))) {
    return {
      category: 'Jurisdiction',
      name: 'Sanctioned Destination',
      score: 40,
      maxScore: 40,
      severity: 'CRITICAL',
      description: `Destination country ${country} is subject to comprehensive OFAC/EU/UN sanctions.`,
      mitigation: 'Transaction must be blocked immediately. No license available for this jurisdiction.',
    }
  }

  if (HIGH_RISK_COUNTRIES.includes(country) || (endCountry && HIGH_RISK_COUNTRIES.includes(endCountry))) {
    return {
      category: 'Jurisdiction',
      name: 'High-Risk Jurisdiction',
      score: 25,
      maxScore: 40,
      severity: 'HIGH',
      description: `${country} is listed as high-risk for diversion or transshipment.`,
      mitigation: 'Enhanced due diligence required. Verify end-use and end-user thoroughly.',
    }
  }

  // 转口贸易风险：如果买方国家和最终用户国家不同
  if (endCountry && endCountry !== country) {
    if (HIGH_RISK_COUNTRIES.includes(endCountry) || SANCTIONED_COUNTRIES.includes(endCountry)) {
      return {
        category: 'Jurisdiction',
        name: 'Diversion Risk Detected',
        score: 30,
        maxScore: 40,
        severity: 'HIGH',
        description: `Goods ordered from ${country} but destined for ${endCountry}. Possible transshipment.`,
        mitigation: 'Require delivery verification and end-user statement for final destination.',
      }
    }
    return {
      category: 'Jurisdiction',
      name: 'Cross-Border Routing',
      score: 10,
      maxScore: 40,
      severity: 'MEDIUM',
      description: `Ship-to country differs from end-user country.`,
      mitigation: 'Document rationale for routing.',
    }
  }

  return {
    category: 'Jurisdiction',
    name: 'Standard Jurisdiction',
    score: 0,
    maxScore: 40,
    severity: 'NONE',
    description: `${country} is not subject to sanctions or high-risk designation.`,
  }
}

// 物项风险评分 (0-25分)
function scoreItemRisk(eccnCode?: string, quantity?: number): RiskFactor {
  if (!eccnCode || eccnCode === 'EAR99') {
    return {
      category: 'Item',
      name: 'Low-Control Item',
      score: 5,
      maxScore: 25,
      severity: 'LOW',
      description: 'Item classified as EAR99 or not on dual-use list.',
    }
  }

  const eccn = DRONE_ECCN_CODES.find(e => e.eccn_code === eccnCode)
  if (!eccn) {
    return {
      category: 'Item',
      name: 'Unclassified Item',
      score: 15,
      maxScore: 25,
      severity: 'MEDIUM',
      description: `ECCN ${eccnCode} requires classification review.`,
      mitigation: 'Obtain commodity classification determination.',
    }
  }

  let score = 15
  let severity: RiskFactor['severity'] = 'MEDIUM'
  let description = `${eccn.eccn_code}: ${eccn.description}`

  if (eccn.is_military) {
    score = 25
    severity = 'CRITICAL'
    description += ' - Military article, ITAR controlled'
  } else if (eccn.reason_for_control.includes('MT')) {
    score = 22
    severity = 'HIGH'
    description += ' - Missile Technology controls apply'
  } else if (eccn.reason_for_control.includes('NS')) {
    score = 18
    severity = 'MEDIUM'
    description += ' - National Security controls'
  }

  // 数量异常检测
  if (quantity && quantity > 100) {
    score += 5
    description += `. Large quantity (${quantity} units) - unusual for civilian end-use.`
  }

  return {
    category: 'Item',
    name: 'Dual-Use Controlled Item',
    score: Math.min(score, 25),
    maxScore: 25,
    severity,
    description,
    mitigation: eccn.is_dual_use ? 'Valid export license required before shipment.' : undefined,
  }
}

// 实体风险评分 (0-20分)
function scoreEntityRisk(
  buyerName: string,
  endUserName?: string,
  kycVerified?: boolean,
  kycRiskRating?: string
): { factor: RiskFactor; hits: ScreeningHit[] } {
  const hits: ScreeningHit[] = []
  let score = 0
  let severity: RiskFactor['severity'] = 'NONE'
  let description = 'Entity screening complete.'
  let mitigation: string | undefined

  // KYC状态
  if (kycVerified === false) {
    score += 10
    severity = 'MEDIUM'
    description = 'Buyer entity has not completed KYC verification.'
    mitigation = 'Complete KYC and identity verification before approval.'
  } else if (kycRiskRating === 'HIGH') {
    score += 12
    severity = 'HIGH'
    description = 'Buyer entity rated HIGH risk in KYC.'
  } else if (kycRiskRating === 'PROHIBITED') {
    score = 20
    severity = 'CRITICAL'
    description = 'Buyer entity is PROHIBITED.'
    mitigation = 'Transaction must be blocked.'
  }

  // 红旗关键词扫描（带否定上下文检测）
  const allNames = [buyerName, endUserName].filter(Boolean).join(' ').toLowerCase()
  const negationPatterns = ['no military', 'not military', 'non-military', 'civilian', 'no defence', 'not for military']
  const hasNegation = negationPatterns.some(neg => allNames.includes(neg))

  const matchedKeywords = RED_FLAG_KEYWORDS.filter(kw => {
    if (!allNames.includes(kw)) return false
    // 如果关键词是military/defence等，但上下文有否定词，跳过
    if (['military', 'defense', 'defence', 'army'].includes(kw) && hasNegation) return false
    return true
  })

  if (matchedKeywords.length > 0) {
    score += 8
    severity = score >= 15 ? 'HIGH' : 'MEDIUM'
    description = `Red flag keywords detected: ${matchedKeywords.join(', ')}`
    mitigation = 'Verify entity is not military, defense, or prohibited end-user.'
    hits.push({
      list: 'INTERNAL_RED_FLAGS',
      matchedName: matchedKeywords.join(', '),
      confidence: 0.7,
      details: 'Entity name contains military/defense keywords',
    })
  }

  // 模糊匹配制裁名单（简化版，实际应接入完整SDN名单）
  const sdnPatterns = ['rosoboronexport', 'almaz', 'sukhoi', 'mikoyan', 'kalashnikov', 'wagner']
  let hasSDNMatch = false
  for (const pattern of sdnPatterns) {
    if (allNames.includes(pattern)) {
      hasSDNMatch = true
      hits.push({
        list: 'OFAC_SDN',
        matchedName: pattern,
        confidence: 0.85,
        details: 'Name matches SDN list pattern',
      })
    }
  }

  if (hasSDNMatch) {
    score = 20
    severity = 'CRITICAL'
    description = 'Likely match on OFAC SDN list'
    mitigation = 'Immediate block. Report to compliance officer.'
  }

  return {
    factor: {
      category: 'Entity',
      name: 'Counterparty Screening',
      score: Math.min(score, 20),
      maxScore: 20,
      severity,
      description,
      mitigation,
    },
    hits,
  }
}

// 最终用户风险 (0-15分)
function scoreEndUserRisk(
  endUserStatement: string,
  endUserName?: string,
  endUserCountry?: string
): RiskFactor {
  if (!endUserStatement || endUserStatement.length < 50) {
    return {
      category: 'End-User',
      name: 'Insufficient End-User Statement',
      score: 12,
      maxScore: 15,
      severity: 'HIGH',
      description: 'End-user statement is missing or too brief.',
      mitigation: 'Require detailed, signed end-user statement on company letterhead.',
    }
  }

  const statement = endUserStatement.toLowerCase()
  const suspiciousPhrases = [
    'will not disclose', 'confidential destination', 'third party', 'resell to',
    'military use', 'defense purposes', 'weapons integration', 'surveillance',
  ]

  const matched = suspiciousPhrases.filter(p => statement.includes(p))
  if (matched.length > 0) {
    return {
      category: 'End-User',
      name: 'Suspicious End-Use Language',
      score: 15,
      maxScore: 15,
      severity: 'CRITICAL',
      description: `Statement contains concerning language: ${matched.join(', ')}`,
      mitigation: 'Escalate to senior compliance. Require additional documentation.',
    }
  }

  // 检查是否声明为民用
  const civilianIndicators = ['civilian', 'commercial', 'research', 'agriculture', 'infrastructure', 'surveying', 'mapping']
  const hasCivilian = civilianIndicators.some(ind => statement.includes(ind))

  if (hasCivilian) {
    return {
      category: 'End-User',
      name: 'Civilian End-Use Declared',
      score: 2,
      maxScore: 15,
      severity: 'LOW',
      description: 'Statement indicates civilian/commercial end-use.',
    }
  }

  return {
    category: 'End-User',
      name: 'Standard End-User Review',
      score: 5,
      maxScore: 15,
      severity: 'LOW',
      description: 'End-user statement provided and reviewed.',
  }
}

// 主风险评估函数
export function assessTransactionRisk(params: {
  buyerName: string
  destinationCountry: string
  endUserName?: string
  endUserCountry?: string
  endUserStatement: string
  eccnCode?: string
  quantity?: number
  kycVerified?: boolean
  kycRiskRating?: string
}): RiskAssessment {
  const factors: RiskFactor[] = []
  const redFlags: string[] = []
  let screeningHits: ScreeningHit[] = []

  // 1. 国家风险
  factors.push(scoreCountryRisk(params.destinationCountry, params.endUserCountry))

  // 2. 物项风险
  factors.push(scoreItemRisk(params.eccnCode, params.quantity))

  // 3. 实体风险
  const entityResult = scoreEntityRisk(
    params.buyerName, params.endUserName,
    params.kycVerified, params.kycRiskRating
  )
  factors.push(entityResult.factor)
  screeningHits = screeningHits.concat(entityResult.hits)

  // 4. 最终用户风险
  factors.push(scoreEndUserRisk(params.endUserStatement, params.endUserName, params.endUserCountry))

  // 汇总
  const totalScore = factors.reduce((sum, f) => sum + f.score, 0)
  const maxPossibleScore = factors.reduce((sum, f) => sum + f.maxScore, 0)

  // 收集红旗
  factors.forEach(f => {
    if (f.severity === 'HIGH' || f.severity === 'CRITICAL') {
      redFlags.push(`[${f.category}] ${f.name}: ${f.description}`)
    }
  })

  // 判定风险等级 - 基于总分和硬熔断条件
  let riskLevel: RiskAssessment['riskLevel']
  let recommendation: RiskAssessment['recommendation']
  let recommendationReason: string

  // 硬熔断：制裁国家或SDN命中
  const hasHardBlock = factors.some(f =>
    (f.category === 'Jurisdiction' && f.severity === 'CRITICAL') ||
    (f.category === 'Entity' && f.severity === 'CRITICAL')
  )

  if (hasHardBlock) {
    riskLevel = 'CRITICAL'
    recommendation = 'REJECT'
    recommendationReason = 'Sanctions jurisdiction or SDN match. Transaction must be blocked per export control regulations.'
  } else if (totalScore >= 70) {
    riskLevel = 'CRITICAL'
    recommendation = 'REJECT'
    recommendationReason = 'Critical risk score. Multiple high-risk factors present.'
  } else if (totalScore >= 45) {
    riskLevel = 'HIGH'
    recommendation = 'ESCALATE'
    recommendationReason = 'High risk transaction. Requires senior compliance officer review and possible license application.'
  } else if (totalScore >= 25) {
    riskLevel = 'MEDIUM'
    recommendation = 'REVIEW'
    recommendationReason = 'Medium risk. Standard compliance review required. Verify documentation and end-use.'
  } else {
    riskLevel = 'LOW'
    recommendation = 'APPROVE'
    recommendationReason = 'Low risk transaction. Standard controls sufficient.'
  }

  return {
    totalScore,
    maxPossibleScore,
    riskLevel,
    factors,
    redFlags,
    screeningHits,
    recommendation,
    recommendationReason,
  }
}

// 生成交易参考号
export function generateTransactionRef(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `EXP-${year}${month}-${random}`
}
