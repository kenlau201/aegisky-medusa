/**
 * Aegisky Control Tower - 合规引擎
 * 多租户验证 + EUS/KYC合规审查 + 制裁名单熔断
 */
import { pool, SANCTIONED_COUNTRIES, type ComplianceAudit } from './db'
import { randomUUID } from 'crypto'

// 默认租户ID（单租户模式下使用）
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

// 验证租户ID
export function validateTenant(tenantHeader: string | null): { valid: boolean; tenantId?: string; error?: string } {
  if (!tenantHeader) {
    return { valid: false, error: 'Security Breach: Missing Security Access Fingerprint' }
  }
  // UUID格式验证
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(tenantHeader)) {
    return { valid: false, error: 'Security Breach: Tampered or Corrupted Tenant Token' }
  }
  return { valid: true, tenantId: tenantHeader }
}

// 合规审查结果
export interface ComplianceResult {
  approved: boolean
  status: ComplianceAudit['status']
  reason?: string
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

// 制裁名单+风险等级检查
export function checkCompliance(targetCountry: string, companyName: string): ComplianceResult {
  const country = targetCountry.toUpperCase().trim()

  // 1. 制裁国家硬熔断
  if (SANCTIONED_COUNTRIES.includes(country)) {
    return {
      approved: false,
      status: 'REJECTED_BY_REGULATORY_SYSTEM',
      reason: `Critical Compliance Infringement: Targeted destination country (${country}) is under absolute dual-use embargo.`,
      riskLevel: 'CRITICAL',
    }
  }

  // 2. 高风险国家/地区（需要人工审核）
  const highRiskCountries = ['BY', 'MM', 'ZW', 'SD', 'LY', 'YE', 'SO', 'AF']
  if (highRiskCountries.includes(country)) {
    return {
      approved: false,
      status: 'PENDING',
      reason: 'Destination requires enhanced due diligence and manual compliance review.',
      riskLevel: 'HIGH',
    }
  }

  // 3. 敏感实体名称检查（简单关键词匹配）
  const sensitiveKeywords = ['military', 'army', 'defense', 'ministry of defence', 'armed forces', 'военный', 'армия']
  const nameLower = companyName.toLowerCase()
  if (sensitiveKeywords.some(kw => nameLower.includes(kw))) {
    return {
      approved: false,
      status: 'PENDING',
      reason: 'Entity name matches military/defense keywords, requires manual review.',
      riskLevel: 'MEDIUM',
    }
  }

  return {
    approved: true,
    status: 'PENDING', // 即使自动通过也需要人工最终确认
    reason: 'Initial programmatic policy screening: PASSED. Pending secure ledger human clearance.',
    riskLevel: 'LOW',
  }
}

// 提交合规审查
export async function submitComplianceAudit(params: {
  tenantId?: string
  buyerCompanyName: string
  targetCountry: string
  endUserStatement: string
}): Promise<{ success: boolean; status?: number; data?: any; error?: string }> {
  const tenantId = params.tenantId || DEFAULT_TENANT_ID
  const country = params.targetCountry.toUpperCase().trim()

  // 执行合规检查
  const compliance = checkCompliance(country, params.buyerCompanyName)

  // 如果是制裁国家，直接拒绝，不入库
  if (compliance.status === 'REJECTED_BY_REGULATORY_SYSTEM') {
    return {
      success: false,
      status: 403,
      data: {
        status: compliance.status,
        message: compliance.reason,
        risk_level: compliance.riskLevel,
      },
    }
  }

  // 写入审计记录
  const auditId = randomUUID()
  const auditLog = [
    `[${new Date().toISOString()}] SYSTEM: Compliance check initiated`,
    `[${new Date().toISOString()}] TENANT: ${tenantId}`,
    `[${new Date().toISOString()}] DESTINATION: ${country}`,
    `[${new Date().toISOString()}] ENTITY: ${params.buyerCompanyName}`,
    `[${new Date().toISOString()}] RISK_LEVEL: ${compliance.riskLevel}`,
    `[${new Date().toISOString()}] RESULT: ${compliance.reason}`,
  ].join('\n')

  try {
    await pool.query(
      `INSERT INTO ct_compliance_audits (id, tenant_id, buyer_company_name, target_country, end_user_statement, status, audit_log)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [auditId, tenantId, params.buyerCompanyName, country, params.endUserStatement, compliance.status, auditLog]
    )

    return {
      success: true,
      status: 202,
      data: {
        status: 'RECORDED_AND_PENDING',
        audit_id: auditId,
        risk_level: compliance.riskLevel,
        message: compliance.reason,
      },
    }
  } catch (e: any) {
    return {
      success: false,
      status: 500,
      error: 'Secure ledger failure: ' + e.message,
    }
  }
}

// 获取合规审计列表
export async function getComplianceAudits(params: {
  tenantId?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<{ audits: ComplianceAudit[]; total: number }> {
  const tenantId = params.tenantId || DEFAULT_TENANT_ID
  const limit = params.limit || 50
  const offset = params.offset || 0

  let whereClause = 'WHERE tenant_id = $1'
  const queryParams: any[] = [tenantId]

  if (params.status) {
    queryParams.push(params.status)
    whereClause += ` AND status = $${queryParams.length}`
  }

  const countResult = await pool.query(`SELECT COUNT(*) as cnt FROM ct_compliance_audits ${whereClause}`, queryParams)
  const total = parseInt(countResult.rows[0].cnt)

  queryParams.push(limit, offset)
  const result = await pool.query(
    `SELECT * FROM ct_compliance_audits ${whereClause} ORDER BY created_at DESC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
    queryParams
  )

  return { audits: result.rows, total }
}

// 更新审计状态（人工审核）
export async function updateAuditStatus(params: {
  auditId: string
  status: 'APPROVED' | 'REJECTED'
  reviewerNotes?: string
}): Promise<boolean> {
  const result = await pool.query(
    `UPDATE ct_compliance_audits SET status = $1, reviewer_notes = $2, reviewed_at = NOW(), updated_at = NOW() WHERE id = $3`,
    [params.status, params.reviewerNotes || '', params.auditId]
  )
  return result.rowCount > 0
}
