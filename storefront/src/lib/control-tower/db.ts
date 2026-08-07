/**
 * Aegisky Control Tower - 数据库层 v2.0
 * 符合 EU Dual-Use 2021/821, US EAR, Wassenaar Arrangement 国际标准
 */
import { Pool } from 'pg'
export {
  DRONE_ECCN_CODES, SANCTIONED_COUNTRIES, HIGH_RISK_COUNTRIES,
  RED_FLAG_INDICATORS, WAREHOUSES, INCOTERMS, CURRENCIES, COMPLIANCE_STATUS,
  LICENSE_TYPES, LICENSE_EXCEPTIONS, COUNTRY_GROUPS,
  DENIED_PARTIES_SAMPLE, REPORT_TYPES, AUDIT_EVENTS,
} from './constants'
import { DRONE_ECCN_CODES, SANCTIONED_COUNTRIES, HIGH_RISK_COUNTRIES, WAREHOUSES, DENIED_PARTIES_SAMPLE } from './constants'

const pool = new Pool({
  host: 'localhost', port: 5434, user: 'medusa', password: 'medusa_password',
  database: 'medusa-aegisky', max: 20, idleTimeoutMillis: 30000,
})

// ==================== 类型定义 ====================

export interface BaseTenantModel {
  id: string
  tenant_id: string
  created_at: Date
  updated_at: Date
}

// KYC 实体尽调
export interface KYCExtity extends BaseTenantModel {
  legal_name: string
  trading_name?: string
  registration_number: string
  tax_id?: string
  country: string
  address: string
  city: string
  postal_code: string
  industry: string
  website?: string
  beneficial_owners: string // JSON
  directors: string // JSON
  sanctions_screened: boolean
  sanctions_match: boolean
  sanctions_details?: string
  risk_rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'PROHIBITED'
  kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ENHANCED_DUE_DILIGENCE'
  kyc_documents: string // JSON array
  last_reviewed_at?: Date
  reviewer_id?: string
  notes?: string
}

// 出口许可证
export interface ExportLicense extends BaseTenantModel {
  license_number: string
  issuing_authority: string
  issuing_country: string
  license_type: 'INDIVIDUAL' | 'GLOBAL' | 'GENERAL' | 'NATIONAL'
  eccn_codes: string // JSON array
  consignee_name: string
  consignee_country: string
  end_user_name?: string
  items_description: string
  quantity_approved: number
  quantity_used: number
  issue_date: Date
  expiry_date: Date
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED' | 'PENDING'
  conditions?: string
  attachments: string // JSON array
}

// ECCN 出口管制分类
export interface ECCNClassification {
  eccn_code: string
  category: string
  description: string
  reason_for_control: string
  controlled_countries: string
  license_exceptions: string
  is_dual_use: boolean
  is_military: boolean
}

// 交易主表 - 完整生命周期
export interface TradeTransaction extends BaseTenantModel {
  transaction_ref: string
  buyer_entity_id?: string
  buyer_name: string
  buyer_country: string
  end_user_name?: string
  end_user_country?: string
  product_id: string
  product_name: string
  eccn_code?: string
  quantity: number
  unit_value: number
  total_value: number
  currency: string
  incoterm: string
  destination_country: string
  license_id?: string
  license_number?: string
  compliance_status: 'DRAFT' | 'KYC_PENDING' | 'SCREENING' | 'LICENSE_REQUIRED' | 'LICENSE_PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'
  risk_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  screening_results: string // JSON
  approval_chain: string // JSON array of approvals
  approved_by?: string
  approved_at?: Date
  rejection_reason?: string
  documents: string // JSON array
  notes?: string
}

// 合规审计（扩展）
export interface ComplianceAudit extends BaseTenantModel {
  transaction_id?: string
  buyer_company_name: string
  target_country: string
  end_user_statement: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REJECTED_BY_REGULATORY_SYSTEM' | 'ESCALATED'
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  risk_score: number
  screening_hits: string // JSON array
  audit_log: string
  reviewer_id?: string
  reviewer_notes?: string
  reviewed_at?: Date
  escalation_reason?: string
}

// 不可变审计日志
export interface AuditTrail {
  id: string
  tenant_id: string
  entity_type: string
  entity_id: string
  action: string
  actor_id: string
  actor_type: 'USER' | 'SYSTEM' | 'API'
  old_values?: string
  new_values?: string
  ip_address?: string
  user_agent?: string
  timestamp: Date
  hash: string // 链式哈希防篡改
  previous_hash?: string
}

// 合规文档
export interface ComplianceDocument extends BaseTenantModel {
  transaction_id?: string
  document_type: 'EUS' | 'IIC' | 'IMPORT_CERTIFICATE' | 'DELIVERY_VERIFICATION' | 'LICENSE_COPY' | 'KYC_DOCUMENT' | 'OTHER'
  file_name: string
  file_path: string
  file_hash: string
  mime_type: string
  file_size: number
  uploaded_by: string
  verified: boolean
  verified_by?: string
  verified_at?: Date
  expiry_date?: Date
  notes?: string
}

// 警报
export interface ComplianceAlert extends BaseTenantModel {
  alert_type: 'SANCTIONS_MATCH' | 'HIGH_RISK_COUNTRY' | 'LICENSE_EXPIRING' | 'QUANTITY_ANOMALY' | 'END_USER_CONCERN' | 'DOCUMENT_EXPIRING' | 'MULTIPLE_DECLINED' | 'PEP_MATCH'
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'
  entity_type: 'TRANSACTION' | 'ENTITY' | 'LICENSE' | 'DOCUMENT'
  entity_id: string
  title: string
  description: string
  status: 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE'
  assigned_to?: string
  resolution?: string
  resolved_at?: Date
}

// 库存
export interface InventoryStock {
  id: number
  product_id: string
  warehouse: string
  quantity: number
  reserved: number
  updated_at: Date
}

// 调度记录
export interface DispatchRecord extends BaseTenantModel {
  transaction_id?: string
  product_id: string
  quantity: number
  zone: string
  warehouse: string
  status: 'ROUTING_AUTHORIZED' | 'PICKING' | 'PACKED' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'INVENTORY_DEFICIT' | 'CANCELLED'
  tracking_number?: string
  carrier?: string
  destination_country?: string
  estimated_delivery?: Date
  actual_delivery?: Date
  serial_numbers?: string // JSON array
  notes?: string
}

// 仓库
export interface Warehouse {
  code: string; name: string; country: string; zone: string; priority: number; active: boolean
}

// ==================== 初始化 ====================

export async function initControlTowerTables(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. KYC实体表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_kyc_entities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        legal_name VARCHAR(255) NOT NULL,
        trading_name VARCHAR(255),
        registration_number VARCHAR(128),
        tax_id VARCHAR(128),
        country VARCHAR(10) NOT NULL,
        address TEXT,
        city VARCHAR(128),
        postal_code VARCHAR(32),
        industry VARCHAR(128),
        website VARCHAR(255),
        beneficial_owners JSONB DEFAULT '[]',
        directors JSONB DEFAULT '[]',
        sanctions_screened BOOLEAN DEFAULT false,
        sanctions_match BOOLEAN DEFAULT false,
        sanctions_details TEXT,
        risk_rating VARCHAR(32) DEFAULT 'MEDIUM',
        kyc_status VARCHAR(64) DEFAULT 'PENDING',
        kyc_documents JSONB DEFAULT '[]',
        last_reviewed_at TIMESTAMPTZ,
        reviewer_id VARCHAR(128),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_kyc_tenant ON ct_kyc_entities(tenant_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_kyc_country ON ct_kyc_entities(country)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_kyc_status ON ct_kyc_entities(kyc_status)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_kyc_risk ON ct_kyc_entities(risk_rating)')

    // 2. 出口许可证表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_export_licenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        license_number VARCHAR(128) UNIQUE NOT NULL,
        issuing_authority VARCHAR(255) NOT NULL,
        issuing_country VARCHAR(10) NOT NULL,
        license_type VARCHAR(64) NOT NULL,
        eccn_codes JSONB DEFAULT '[]',
        consignee_name VARCHAR(255) NOT NULL,
        consignee_country VARCHAR(10) NOT NULL,
        end_user_name VARCHAR(255),
        items_description TEXT,
        quantity_approved INTEGER DEFAULT 0,
        quantity_used INTEGER DEFAULT 0,
        issue_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status VARCHAR(64) DEFAULT 'PENDING',
        conditions TEXT,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_license_tenant ON ct_export_licenses(tenant_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_license_status ON ct_export_licenses(status)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_license_expiry ON ct_export_licenses(expiry_date)')

    // 3. 交易主表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_trade_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        transaction_ref VARCHAR(64) UNIQUE NOT NULL,
        buyer_entity_id UUID,
        buyer_name VARCHAR(255) NOT NULL,
        buyer_country VARCHAR(10) NOT NULL,
        end_user_name VARCHAR(255),
        end_user_country VARCHAR(10),
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        eccn_code VARCHAR(32),
        quantity INTEGER NOT NULL,
        unit_value DECIMAL(15,2) DEFAULT 0,
        total_value DECIMAL(15,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        incoterm VARCHAR(10) DEFAULT 'FOB',
        destination_country VARCHAR(10) NOT NULL,
        license_id UUID,
        license_number VARCHAR(128),
        compliance_status VARCHAR(64) DEFAULT 'DRAFT',
        risk_score INTEGER DEFAULT 0,
        risk_level VARCHAR(32) DEFAULT 'LOW',
        screening_results JSONB DEFAULT '{}',
        approval_chain JSONB DEFAULT '[]',
        approved_by VARCHAR(128),
        approved_at TIMESTAMPTZ,
        rejection_reason TEXT,
        documents JSONB DEFAULT '[]',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_txn_tenant ON ct_trade_transactions(tenant_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_txn_ref ON ct_trade_transactions(transaction_ref)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_txn_status ON ct_trade_transactions(compliance_status)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_txn_country ON ct_trade_transactions(destination_country)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_txn_risk ON ct_trade_transactions(risk_level)')

    // 4. 合规审计表（扩展）
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_compliance_audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        transaction_id UUID,
        buyer_company_name VARCHAR(255) NOT NULL,
        target_country VARCHAR(10) NOT NULL,
        end_user_statement TEXT NOT NULL,
        status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
        risk_level VARCHAR(32) DEFAULT 'LOW',
        risk_score INTEGER DEFAULT 0,
        screening_hits JSONB DEFAULT '[]',
        audit_log TEXT,
        reviewer_id VARCHAR(128),
        reviewer_notes TEXT,
        reviewed_at TIMESTAMPTZ,
        escalation_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_compliance_tenant ON ct_compliance_audits(tenant_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_compliance_status ON ct_compliance_audits(status)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_compliance_country ON ct_compliance_audits(target_country)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_compliance_txn ON ct_compliance_audits(transaction_id)')

    // 5. 不可变审计日志
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_audit_trail (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        entity_type VARCHAR(64) NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(128) NOT NULL,
        actor_id VARCHAR(128) NOT NULL,
        actor_type VARCHAR(32) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        ip_address VARCHAR(64),
        user_agent TEXT,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        hash VARCHAR(128) NOT NULL,
        previous_hash VARCHAR(128)
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_audit_entity ON ct_audit_trail(entity_type, entity_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_audit_actor ON ct_audit_trail(actor_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_audit_timestamp ON ct_audit_trail(timestamp)')

    // 6. 合规文档表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_compliance_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        transaction_id UUID,
        document_type VARCHAR(64) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_hash VARCHAR(128) NOT NULL,
        mime_type VARCHAR(128),
        file_size INTEGER,
        uploaded_by VARCHAR(128) NOT NULL,
        verified BOOLEAN DEFAULT false,
        verified_by VARCHAR(128),
        verified_at TIMESTAMPTZ,
        expiry_date DATE,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_docs_txn ON ct_compliance_documents(transaction_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_docs_type ON ct_compliance_documents(document_type)')

    // 7. 警报表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_compliance_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        alert_type VARCHAR(64) NOT NULL,
        severity VARCHAR(32) NOT NULL,
        entity_type VARCHAR(64) NOT NULL,
        entity_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(64) DEFAULT 'OPEN',
        assigned_to VARCHAR(128),
        resolution TEXT,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_alerts_status ON ct_compliance_alerts(status)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_alerts_severity ON ct_compliance_alerts(severity)')

    // 8. 库存表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_inventory_stocks (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        warehouse VARCHAR(64) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        reserved INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(product_id, warehouse)
      )
    `)

    // 9. 调度记录表（扩展）
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_dispatch_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        transaction_id UUID,
        product_id VARCHAR(64) NOT NULL,
        quantity INTEGER NOT NULL,
        zone VARCHAR(64) NOT NULL,
        warehouse VARCHAR(64) NOT NULL,
        status VARCHAR(64) NOT NULL DEFAULT 'ROUTING_AUTHORIZED',
        tracking_number VARCHAR(128),
        carrier VARCHAR(128),
        destination_country VARCHAR(10),
        estimated_delivery TIMESTAMPTZ,
        actual_delivery TIMESTAMPTZ,
        serial_numbers JSONB DEFAULT '[]',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_dispatch_tenant ON ct_dispatch_records(tenant_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_dispatch_status ON ct_dispatch_records(status)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_dispatch_txn ON ct_dispatch_records(transaction_id)')

    // 插入示例库存数据
    const existingCount = await client.query('SELECT COUNT(*) as cnt FROM ct_inventory_stocks')
    if (parseInt(existingCount.rows[0].cnt) === 0) {
      const sampleProducts = [
        { sku: 'DJI-M300-001', name: 'DJI Matrice 300 RTK', eccn: '9A012' },
        { sku: 'DJI-H20T-001', name: 'Zenmuse H20T 云台相机', eccn: '7A001' },
        { sku: 'GEPRC-MARK5-001', name: 'GEPRC Mark5 FPV Drone', eccn: '9A012' },
        { sku: 'IFLIGHT-NAZGUL-001', name: 'iFlight Nazgul Evoque F5', eccn: '9A012' },
        { sku: 'T-MOTOR-F60-001', name: 'T-Motor F60 Pro V 电机', eccn: 'EAR99' },
        { sku: 'RUNCAM-5-001', name: 'RunCam 5 Orange', eccn: 'EAR99' },
        { sku: 'RADMASTER-001', name: 'RadioMaster TX16S 遥控器', eccn: 'EAR99' },
        { sku: 'HQPROP-51466-001', name: 'HQProp 5.1寸三叶桨', eccn: 'EAR99' },
      ]
      for (const product of sampleProducts) {
        for (const wh of WAREHOUSES) {
          const qty = Math.floor(Math.random() * 500) + 50
          await client.query(
            'INSERT INTO ct_inventory_stocks (product_id, warehouse, quantity, reserved) VALUES ($1, $2, $3, $4)',
            [product.sku, wh.code, qty, Math.floor(qty * 0.1)]
          )
        }
      }
    }

    // 10. 最终用户声明 (End User Statement)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_end_user_statements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        eus_number VARCHAR(32) UNIQUE NOT NULL,
        transaction_id UUID,
        consignee_name VARCHAR(255) NOT NULL,
        consignee_country VARCHAR(10) NOT NULL,
        end_user_name VARCHAR(255) NOT NULL,
        end_user_address TEXT,
        end_user_country VARCHAR(10) NOT NULL,
        end_use_description TEXT NOT NULL,
        end_use_category VARCHAR(64),
        military_use_denial BOOLEAN DEFAULT false,
        no_reexport_agreement BOOLEAN DEFAULT false,
        no_weapons_use BOOLEAN DEFAULT false,
        authorized_signatory VARCHAR(128),
        signatory_title VARCHAR(128),
        signature_date TIMESTAMPTZ,
        document_url TEXT,
        verification_status VARCHAR(32) DEFAULT 'PENDING',
        verified_by VARCHAR(128),
        verified_at TIMESTAMPTZ,
        verification_notes TEXT,
        status VARCHAR(32) DEFAULT 'PENDING',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_eus_tenant ON ct_end_user_statements(tenant_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_eus_transaction ON ct_end_user_statements(transaction_id)')

    // 11. 被拒绝方筛查结果
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_screening_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        screening_id VARCHAR(32) UNIQUE NOT NULL,
        entity_type VARCHAR(32) NOT NULL,
        entity_name VARCHAR(255) NOT NULL,
        entity_country VARCHAR(10),
        transaction_id UUID,
        lists_checked TEXT[] DEFAULT '{}',
        match_found BOOLEAN DEFAULT false,
        match_score INTEGER DEFAULT 0,
        matched_name VARCHAR(255),
        matched_list VARCHAR(64),
        matched_entry JSONB,
        false_positive BOOLEAN DEFAULT false,
        resolved_by VARCHAR(128),
        resolved_at TIMESTAMPTZ,
        resolution_notes TEXT,
        status VARCHAR(32) DEFAULT 'PENDING',
        screened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_screening_tenant ON ct_screening_results(tenant_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_ct_screening_match ON ct_screening_results(match_found, status)')

    // 12. 商品ECCN分类记录
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_classifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        classification_number VARCHAR(32) UNIQUE NOT NULL,
        product_id VARCHAR(128),
        product_name VARCHAR(512) NOT NULL,
        product_description TEXT,
        technical_specs JSONB DEFAULT '{}',
        eccn_code VARCHAR(16) NOT NULL,
        classification_basis TEXT,
        similar_items TEXT,
        ccats_number VARCHAR(64),
        classified_by VARCHAR(128),
        classification_date TIMESTAMPTZ,
        review_date TIMESTAMPTZ,
        reviewer VARCHAR(128),
        status VARCHAR(32) DEFAULT 'DRAFT',
        supporting_documents JSONB DEFAULT '[]',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 13. 合规报告记录
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_compliance_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        report_number VARCHAR(32) UNIQUE NOT NULL,
        report_type VARCHAR(64) NOT NULL,
        period_start TIMESTAMPTZ,
        period_end TIMESTAMPTZ,
        report_data JSONB,
        generated_by VARCHAR(128),
        submitted_to VARCHAR(255),
        submitted_at TIMESTAMPTZ,
        submission_reference VARCHAR(128),
        status VARCHAR(32) DEFAULT 'DRAFT',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 14. 许可证使用记录
    await client.query(`
      CREATE TABLE IF NOT EXISTS ct_license_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        license_id UUID REFERENCES ct_export_licenses(id),
        transaction_id UUID,
        quantity_used INTEGER NOT NULL,
        value_used DECIMAL(15,2),
        shipment_date TIMESTAMPTZ,
        shipping_ref VARCHAR(128),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 插入示例KYC实体
    const kycCount = await client.query('SELECT COUNT(*) as cnt FROM ct_kyc_entities')
    if (parseInt(kycCount.rows[0].cnt) === 0) {
      await client.query(`
        INSERT INTO ct_kyc_entities (legal_name, registration_number, country, address, city, industry, risk_rating, kyc_status, sanctions_screened)
        VALUES
        ('Aegisky Europe Distribution Sp. z o.o.', 'PL000123456', 'PL', 'ul. Przemysłowa 12', 'Warsaw', 'UAV Distribution', 'LOW', 'VERIFIED', true),
        ('NATO Support and Procurement Agency', 'NATO-2024-001', 'LU', 'Boulevard Leopold III', 'Capellen', 'Defense Procurement', 'LOW', 'VERIFIED', true),
        ('Frontier Tech Trading FZE', 'AE-FZE-88992', 'AE', 'JAFZA View 18', 'Dubai', 'Electronics Trading', 'HIGH', 'ENHANCED_DUE_DILIGENCE', true)
      `)
    }

    // 插入示例出口许可证
    const licCount = await client.query('SELECT COUNT(*) as cnt FROM ct_export_licenses')
    if (parseInt(licCount.rows[0].cnt) === 0) {
      await client.query(`
        INSERT INTO ct_export_licenses
        (license_number, issuing_authority, issuing_country, license_type, eccn_codes, consignee_name, consignee_country,
         items_description, quantity_approved, quantity_used, issue_date, expiry_date, status)
        VALUES
        ('D123456', 'US BIS', 'US', 'INDIVIDUAL', '["9A012"]', 'European Drone Solutions GmbH', 'DE',
         'DJI Matrice 300 RTK drones for civilian infrastructure inspection', 50, 12,
         '2026-01-15', '2028-01-14', 'ACTIVE'),
        ('EU-GEA-2026-001', 'EU Commission', 'BE', 'GENERAL_EU', '["9A012","7A003","8A002"]', 'Various EU distributors', 'EU',
         'Civilian UAV systems to EU member states', 500, 89,
         '2026-03-01', '2029-02-28', 'ACTIVE')
      `)
    }

    await client.query('COMMIT')
    console.log('[Control Tower v2.0] Database schema initialized')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('[Control Tower] DB init error:', e)
    throw e
  } finally {
    client.release()
  }
}

// 写入审计日志（带哈希链）
export async function writeAuditLog(params: {
  tenantId?: string
  entityType: string
  entityId: string
  action: string
  actorId: string
  actorType: 'USER' | 'SYSTEM' | 'API'
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  const crypto = require('crypto')
  const tenantId = params.tenantId || '00000000-0000-0000-0000-000000000001'

  // 获取上一条哈希
  const lastResult = await pool.query(
    'SELECT hash FROM ct_audit_trail WHERE tenant_id = $1 ORDER BY timestamp DESC LIMIT 1',
    [tenantId]
  )
  const previousHash = lastResult.rows[0]?.hash || 'GENESIS'

  const hashInput = JSON.stringify({
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    actorId: params.actorId,
    timestamp: new Date().toISOString(),
    previousHash,
  })
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex')

  await pool.query(
    `INSERT INTO ct_audit_trail
     (tenant_id, entity_type, entity_id, action, actor_id, actor_type, old_values, new_values, ip_address, user_agent, hash, previous_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      tenantId, params.entityType, params.entityId, params.action,
      params.actorId, params.actorType,
      params.oldValues ? JSON.stringify(params.oldValues) : null,
      params.newValues ? JSON.stringify(params.newValues) : null,
      params.ipAddress, params.userAgent, hash, previousHash,
    ]
  )
}

export { pool }

// 通用查询函数
export async function query(text: string, params?: any[]) {
  return pool.query(text, params)
}
