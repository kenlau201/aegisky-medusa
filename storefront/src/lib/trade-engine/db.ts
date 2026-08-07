/**
 * Aegisky Trade Engine - 数据库层
 * 全球工业级商品交易闭环数据模型
 */
import { Pool } from 'pg'
import { ORDER_STATUS, ORDER_STATUS_FLOW, type OrderStatus } from './constants'

const pool = new Pool({
  host: 'localhost', port: 5434, user: 'medusa', password: 'medusa_password',
  database: 'medusa-aegisky', max: 20, idleTimeoutMillis: 30000,
})

// ==================== 类型定义 ====================

export interface PurchaseOrder {
  id: string
  tenant_id: string
  po_number: string
  rfq_number?: string
  quotation_id?: string
  buyer_id: string
  buyer_name: string
  buyer_country: string
  supplier_id: string
  supplier_name: string
  supplier_country: string
  status: OrderStatus
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  trade_type: string
  payment_terms: string
  shipping_method: string
  incoterm: string
  origin_port?: string
  destination_port?: string
  currency: string
  subtotal: number
  shipping_cost: number
  insurance_cost: number
  tax_amount: number
  total_amount: number
  deposit_amount: number
  deposit_paid: boolean
  payment_status: 'UNPAID' | 'DEPOSIT_PAID' | 'PARTIAL_PAID' | 'PAID' | 'OVERDUE' | 'REFUNDED'
  expected_ship_date?: Date
  actual_ship_date?: Date
  expected_delivery_date?: Date
  actual_delivery_date?: Date
  tracking_number?: string
  forwarder_code?: string
  compliance_transaction_id?: string
  compliance_status?: string
  notes?: string
  buyer_notes?: string
  supplier_notes?: string
  internal_notes?: string
  created_at: Date
  updated_at: Date
}

export interface POLineItem {
  id: string
  po_id: string
  product_id: string
  product_name: string
  sku?: string
  hs_code?: string
  eccn_code?: string
  quantity: number
  unit_price: number
  unit: string
  discount_percent: number
  line_total: number
  lead_time_days?: number
  specifications?: string
  qc_status?: string
  qc_notes?: string
  created_at: Date
}

export interface Quotation {
  id: string
  tenant_id: string
  quote_number: string
  rfq_number?: string
  supplier_id: string
  supplier_name: string
  buyer_name?: string
  valid_until: Date
  currency: string
  payment_terms: string
  shipping_method: string
  incoterm: string
  lead_time_days: number
  subtotal: number
  shipping_cost: number
  total_amount: number
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  notes?: string
  terms_conditions?: string
  created_at: Date
}

export interface Shipment {
  id: string
  tenant_id: string
  po_id: string
  shipment_number: string
  forwarder_code: string
  tracking_number: string
  shipping_method: string
  origin_port: string
  destination_port: string
  estimated_departure?: Date
  actual_departure?: Date
  estimated_arrival?: Date
  actual_arrival?: Date
  status: 'BOOKED' | 'PICKED_UP' | 'DEPARTED' | 'IN_TRANSIT' | 'ARRIVED' | 'CUSTOMS' | 'DELIVERED'
  weight_kg?: number
  volume_cbm?: number
  packages: number
  documents: string // JSON
  tracking_events: string // JSON
  created_at: Date
}

export interface TradeDocument {
  id: string
  tenant_id: string
  po_id: string
  shipment_id?: string
  doc_type: string
  doc_number: string
  document_date: Date
  file_url?: string
  content_json?: string // 生成的文档内容
  status: 'DRAFT' | 'GENERATED' | 'SIGNED' | 'SENT' | 'RECEIVED'
  created_at: Date
}

export interface Payment {
  id: string
  tenant_id: string
  po_id: string
  payment_number: string
  payment_type: 'DEPOSIT' | 'BALANCE' | 'FULL' | 'REFUND'
  amount: number
  currency: string
  payment_method: string
  status: 'PENDING' | 'INITIATED' | 'RECEIVED' | 'CONFIRMED' | 'FAILED' | 'REFUNDED'
  transaction_ref?: string
  payment_date?: Date
  due_date?: Date
  notes?: string
  created_at: Date
}

export interface InspectionRecord {
  id: string
  tenant_id: string
  po_id: string
  line_item_id?: string
  inspection_type: 'PRE_PRODUCTION' | 'DURING_PRODUCTION' | 'PRE_SHIPMENT' | 'CONTAINER_LOAD'
  inspector: string
  inspector_company?: string
  inspection_date: Date
  result: 'PASS' | 'FAIL' | 'PENDING' | 'CONDITIONAL'
  defect_rate?: number
  total_samples?: number
  defects_found?: number
  critical_defects?: number
  major_defects?: number
  minor_defects?: number
  findings?: string
  corrective_actions?: string
  report_url?: string
  created_at: Date
}

// ==================== 初始化表 ====================

export async function initTradeEngineTables(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. 采购订单主表
    await client.query(`
      CREATE TABLE IF NOT EXISTS te_purchase_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        po_number VARCHAR(32) UNIQUE NOT NULL,
        rfq_number VARCHAR(32),
        quotation_id UUID,
        buyer_id VARCHAR(128),
        buyer_name VARCHAR(255) NOT NULL,
        buyer_country VARCHAR(10),
        supplier_id VARCHAR(128),
        supplier_name VARCHAR(255) NOT NULL,
        supplier_country VARCHAR(10),
        status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
        priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL',
        trade_type VARCHAR(32) DEFAULT 'STANDARD_PO',
        payment_terms VARCHAR(64),
        shipping_method VARCHAR(32),
        incoterm VARCHAR(16),
        origin_port VARCHAR(16),
        destination_port VARCHAR(16),
        currency VARCHAR(8) DEFAULT 'USD',
        subtotal DECIMAL(15,2) DEFAULT 0,
        shipping_cost DECIMAL(15,2) DEFAULT 0,
        insurance_cost DECIMAL(15,2) DEFAULT 0,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        total_amount DECIMAL(15,2) DEFAULT 0,
        deposit_amount DECIMAL(15,2) DEFAULT 0,
        deposit_paid BOOLEAN DEFAULT false,
        payment_status VARCHAR(32) DEFAULT 'UNPAID',
        expected_ship_date TIMESTAMPTZ,
        actual_ship_date TIMESTAMPTZ,
        expected_delivery_date TIMESTAMPTZ,
        actual_delivery_date TIMESTAMPTZ,
        tracking_number VARCHAR(128),
        forwarder_code VARCHAR(32),
        compliance_transaction_id UUID,
        compliance_status VARCHAR(32),
        notes TEXT,
        buyer_notes TEXT,
        supplier_notes TEXT,
        internal_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 2. 订单行项目
    await client.query(`
      CREATE TABLE IF NOT EXISTS te_po_line_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        po_id UUID NOT NULL REFERENCES te_purchase_orders(id) ON DELETE CASCADE,
        product_id VARCHAR(128),
        product_name VARCHAR(512) NOT NULL,
        sku VARCHAR(128),
        hs_code VARCHAR(32),
        eccn_code VARCHAR(32),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(15,2) NOT NULL,
        unit VARCHAR(32) DEFAULT 'PCS',
        discount_percent DECIMAL(5,2) DEFAULT 0,
        line_total DECIMAL(15,2) NOT NULL,
        lead_time_days INTEGER,
        specifications TEXT,
        qc_status VARCHAR(32),
        qc_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 3. 报价单
    await client.query(`
      CREATE TABLE IF NOT EXISTS te_quotations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        quote_number VARCHAR(32) UNIQUE NOT NULL,
        rfq_number VARCHAR(32),
        supplier_id VARCHAR(128),
        supplier_name VARCHAR(255),
        buyer_name VARCHAR(255),
        valid_until TIMESTAMPTZ NOT NULL,
        currency VARCHAR(8) DEFAULT 'USD',
        payment_terms VARCHAR(64),
        shipping_method VARCHAR(32),
        incoterm VARCHAR(16),
        lead_time_days INTEGER,
        subtotal DECIMAL(15,2) DEFAULT 0,
        shipping_cost DECIMAL(15,2) DEFAULT 0,
        total_amount DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(32) DEFAULT 'DRAFT',
        notes TEXT,
        terms_conditions TEXT,
        line_items JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 4. 运单/发货
    await client.query(`
      CREATE TABLE IF NOT EXISTS te_shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        po_id UUID NOT NULL REFERENCES te_purchase_orders(id) ON DELETE CASCADE,
        shipment_number VARCHAR(32) UNIQUE NOT NULL,
        forwarder_code VARCHAR(32),
        tracking_number VARCHAR(128),
        shipping_method VARCHAR(32),
        origin_port VARCHAR(16),
        destination_port VARCHAR(16),
        estimated_departure TIMESTAMPTZ,
        actual_departure TIMESTAMPTZ,
        estimated_arrival TIMESTAMPTZ,
        actual_arrival TIMESTAMPTZ,
        status VARCHAR(32) DEFAULT 'BOOKED',
        weight_kg DECIMAL(10,2),
        volume_cbm DECIMAL(10,3),
        packages INTEGER DEFAULT 1,
        documents JSONB DEFAULT '[]',
        tracking_events JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 5. 商业单据
    await client.query(`
      CREATE TABLE IF NOT EXISTS te_trade_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        po_id UUID REFERENCES te_purchase_orders(id) ON DELETE CASCADE,
        shipment_id UUID REFERENCES te_shipments(id) ON DELETE SET NULL,
        doc_type VARCHAR(16) NOT NULL,
        doc_number VARCHAR(64) NOT NULL,
        document_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        file_url TEXT,
        content_json JSONB,
        status VARCHAR(32) DEFAULT 'DRAFT',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 6. 付款记录
    await client.query(`
      CREATE TABLE IF NOT EXISTS te_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        po_id UUID NOT NULL REFERENCES te_purchase_orders(id) ON DELETE CASCADE,
        payment_number VARCHAR(32) UNIQUE NOT NULL,
        payment_type VARCHAR(16) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(8) DEFAULT 'USD',
        payment_method VARCHAR(64),
        status VARCHAR(32) DEFAULT 'PENDING',
        transaction_ref VARCHAR(128),
        payment_date TIMESTAMPTZ,
        due_date TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 7. 质检记录
    await client.query(`
      CREATE TABLE IF NOT EXISTS te_inspections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        po_id UUID NOT NULL REFERENCES te_purchase_orders(id) ON DELETE CASCADE,
        line_item_id UUID REFERENCES te_po_line_items(id) ON DELETE SET NULL,
        inspection_type VARCHAR(32) NOT NULL,
        inspector VARCHAR(128) NOT NULL,
        inspector_company VARCHAR(255),
        inspection_date TIMESTAMPTZ NOT NULL,
        result VARCHAR(16) NOT NULL DEFAULT 'PENDING',
        defect_rate DECIMAL(5,2),
        total_samples INTEGER,
        defects_found INTEGER,
        critical_defects INTEGER DEFAULT 0,
        major_defects INTEGER DEFAULT 0,
        minor_defects INTEGER DEFAULT 0,
        findings TEXT,
        corrective_actions TEXT,
        report_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // 索引
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_po_tenant ON te_purchase_orders(tenant_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_po_status ON te_purchase_orders(status)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_po_buyer ON te_purchase_orders(buyer_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_po_supplier ON te_purchase_orders(supplier_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_po_number ON te_purchase_orders(po_number)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_line_items_po ON te_po_line_items(po_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_shipments_po ON te_shipments(po_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_documents_po ON te_trade_documents(po_id)')
    await client.query('CREATE INDEX IF NOT EXISTS idx_te_payments_po ON te_payments(po_id)')

    await client.query('COMMIT')
    console.log('[Trade Engine] Tables initialized successfully')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

// ==================== 编号生成 ====================

export function generatePONumber(): string {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PO-${yymm}-${rand}`
}

export function generateRFQNumber(): string {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RFQ-${yymm}-${rand}`
}

export function generateQuoteNumber(): string {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `QT-${yymm}-${rand}`
}

export function generateShipmentNumber(): string {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SHP-${yymm}-${rand}`
}

export function generatePaymentNumber(): string {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PAY-${yymm}-${rand}`
}

export function generateDocNumber(docType: string): string {
  const date = new Date()
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${docType}-${yy}${mm}-${rand}`
}

// ==================== 订单状态机 ====================

export function canTransitionTo(current: OrderStatus, next: OrderStatus): boolean {
  const allowed = ORDER_STATUS_FLOW[current] || []
  return allowed.includes(next)
}

export function getNextActions(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_FLOW[current] || []
}

// ==================== 数据访问 ====================

export async function createPO(po: Partial<PurchaseOrder>, lineItems: Partial<POLineItem>[]): Promise<PurchaseOrder> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const poNumber = po.po_number || generatePONumber()
    const subtotal = lineItems.reduce((sum, item) => {
      const qty = item.quantity || 0
      const price = item.unit_price || 0
      return sum + (item.line_total || qty * price)
    }, 0)
    const total = subtotal + (po.shipping_cost || 0) + (po.insurance_cost || 0) + (po.tax_amount || 0)
    const deposit = po.deposit_amount || (po.payment_terms?.includes('30') ? total * 0.3 : 0)

    const result = await client.query(
      `INSERT INTO te_purchase_orders
       (tenant_id, po_number, rfq_number, buyer_name, buyer_country, supplier_name, supplier_country,
        status, priority, payment_terms, shipping_method, incoterm, origin_port, destination_port,
        currency, subtotal, shipping_cost, insurance_cost, tax_amount, total_amount, deposit_amount,
        expected_ship_date, expected_delivery_date, notes, buyer_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       RETURNING *`,
      [
        po.tenant_id || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d',
        poNumber, po.rfq_number,
        po.buyer_name, po.buyer_country,
        po.supplier_name, po.supplier_country,
        po.status || 'DRAFT', po.priority || 'NORMAL',
        po.payment_terms, po.shipping_method, po.incoterm,
        po.origin_port, po.destination_port,
        po.currency || 'USD',
        subtotal, po.shipping_cost || 0, po.insurance_cost || 0, po.tax_amount || 0,
        total, deposit,
        po.expected_ship_date, po.expected_delivery_date,
        po.notes, po.buyer_notes,
      ]
    )

    const createdPO = result.rows[0]

    for (const item of lineItems) {
      await client.query(
        `INSERT INTO te_po_line_items
         (po_id, product_id, product_name, sku, hs_code, eccn_code, quantity, unit_price, unit, line_total, specifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          createdPO.id, item.product_id, item.product_name, item.sku,
          item.hs_code, item.eccn_code, item.quantity, item.unit_price,
          item.unit || 'PCS', (item.quantity || 0) * (item.unit_price || 0),
          item.specifications,
        ]
      )
    }

    await client.query('COMMIT')
    return createdPO
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

export async function updatePOStatus(poId: string, newStatus: OrderStatus, notes?: string): Promise<PurchaseOrder | null> {
  const result = await pool.query(
    `UPDATE te_purchase_orders SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [newStatus, notes, poId]
  )
  return result.rows[0] || null
}

export async function getPO(poId: string): Promise<(PurchaseOrder & { line_items: POLineItem[] }) | null> {
  const poResult = await pool.query('SELECT * FROM te_purchase_orders WHERE id = $1', [poId])
  if (poResult.rows.length === 0) return null

  const itemsResult = await pool.query('SELECT * FROM te_po_line_items WHERE po_id = $1', [poId])
  return { ...poResult.rows[0], line_items: itemsResult.rows }
}

export async function listPOs(tenantId: string, filters?: { status?: string; limit?: number; offset?: number }) {
  let query = 'SELECT * FROM te_purchase_orders WHERE tenant_id = $1'
  const params: any[] = [tenantId]

  if (filters?.status) {
    params.push(filters.status)
    query += ` AND status = $${params.length}`
  }

  query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
  params.push(filters?.limit || 50, filters?.offset || 0)

  const result = await pool.query(query, params)
  return result.rows
}

export async function getDashboardStats(tenantId: string) {
  const stats = await pool.query(
    `SELECT
       COUNT(*) as total_orders,
       COUNT(*) FILTER (WHERE status = 'DRAFT') as draft,
       COUNT(*) FILTER (WHERE status = 'RFQ_SENT' OR status = 'QUOTATION_RECEIVED') as in_negotiation,
       COUNT(*) FILTER (WHERE status = 'PO_ISSUED' OR status = 'PO_CONFIRMED' OR status = 'IN_PRODUCTION') as in_production,
       COUNT(*) FILTER (WHERE status = 'QC_PENDING' OR status = 'QC_PASSED' OR status = 'READY_TO_SHIP') as ready_to_ship,
       COUNT(*) FILTER (WHERE status = 'SHIPPED' OR status = 'IN_TRANSIT' OR status = 'CUSTOMS_CLEARANCE') as in_transit,
       COUNT(*) FILTER (WHERE status = 'DELIVERED' OR status = 'COMPLETED') as completed,
       COUNT(*) FILTER (WHERE status = 'DISPUTED' OR status = 'QC_FAILED') as issues,
       COALESCE(SUM(total_amount) FILTER (WHERE payment_status != 'PAID' AND status != 'CANCELLED'), 0) as outstanding_amount,
       COALESCE(SUM(total_amount) FILTER (WHERE status IN ('DELIVERED', 'COMPLETED')), 0) as completed_value,
       COALESCE(AVG(EXTRACT(EPOCH FROM (actual_delivery_date - created_at))/86400), 0) as avg_lead_days
     FROM te_purchase_orders WHERE tenant_id = $1`,
    [tenantId]
  )
  return stats.rows[0]
}

export { pool }
