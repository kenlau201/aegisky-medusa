/**
 * Industrial Trade OS - Trade Kernel
 * 统一交易内核 - 状态机定义
 * 符合 Oracle/SA 级企业标准
 */

// ==================== 交易状态枚举 ====================
export type TradeState =
  | 'INIT'                    // 初始化
  | 'RFQ_DRAFT'               // RFQ草稿
  | 'RFQ_PUBLISHED'           // RFQ已发布
  | 'COMPLIANCE_PENDING'      // 合规审核中
  | 'COMPLIANCE_APPROVED'     // 合规通过
  | 'COMPLIANCE_REJECTED'     // 合规拒绝
  | 'BIDDING_OPEN'            // 竞价开放
  | 'BIDDING_CLOSED'          // 竞价关闭
  | 'BID_SELECTED'            // 中标已选
  | 'ORDER_CONFIRMED'         // 订单确认
  | 'PAYMENT_PENDING'         // 待支付
  | 'PAYMENT_RECEIVED'        // 已收款
  | 'PAYMENT_ESCROWED'        // 资金托管
  | 'LICENSE_PENDING'         // 待出口许可证
  | 'LICENSE_ISSUED'          // 许可证已签发
  | 'MANUFACTURING'           // 生产中
  | 'READY_TO_SHIP'           // 待发货
  | 'IN_TRANSIT'              // 运输中
  | 'CUSTOMS_CLEARANCE'       // 清关中
  | 'DELIVERED'               // 已交付
  | 'QUALITY_INSPECTION'      // 质检中
  | 'COMPLETED'               // 交易完成
  | 'DISPUTED'                // 争议中
  | 'CANCELLED'               // 已取消
  | 'REFUNDED'                // 已退款
  | 'FAILED'                  // 失败

// ==================== 交易事件 ====================
export type TradeEvent =
  | 'CREATE_RFQ'
  | 'SUBMIT_COMPLIANCE'
  | 'APPROVE_COMPLIANCE'
  | 'REJECT_COMPLIANCE'
  | 'OPEN_BIDDING'
  | 'CLOSE_BIDDING'
  | 'SELECT_BID'
  | 'CONFIRM_ORDER'
  | 'INITIATE_PAYMENT'
  | 'RECEIVE_PAYMENT'
  | 'ESCROW_PAYMENT'
  | 'REQUEST_LICENSE'
  | 'ISSUE_LICENSE'
  | 'START_MANUFACTURING'
  | 'GOODS_READY'
  | 'START_SHIPMENT'
  | 'CLEAR_CUSTOMS'
  | 'CONFIRM_DELIVERY'
  | 'PASS_INSPECTION'
  | 'COMPLETE_TRADE'
  | 'OPEN_DISPUTE'
  | 'CANCEL_TRADE'
  | 'REFUND_TRADE'
  | 'FAIL_TRADE'

// ==================== 状态转换表 ====================
export const STATE_TRANSITIONS: Record<TradeEvent, { from: TradeState[]; to: TradeState }> = {
  CREATE_RFQ:          { from: ['INIT'], to: 'RFQ_DRAFT' },
  SUBMIT_COMPLIANCE:   { from: ['RFQ_DRAFT', 'RFQ_PUBLISHED'], to: 'COMPLIANCE_PENDING' },
  APPROVE_COMPLIANCE:  { from: ['COMPLIANCE_PENDING'], to: 'COMPLIANCE_APPROVED' },
  REJECT_COMPLIANCE:   { from: ['COMPLIANCE_PENDING'], to: 'COMPLIANCE_REJECTED' },
  OPEN_BIDDING:        { from: ['COMPLIANCE_APPROVED'], to: 'BIDDING_OPEN' },
  CLOSE_BIDDING:       { from: ['BIDDING_OPEN'], to: 'BIDDING_CLOSED' },
  SELECT_BID:          { from: ['BIDDING_CLOSED', 'BIDDING_OPEN'], to: 'BID_SELECTED' },
  CONFIRM_ORDER:       { from: ['BID_SELECTED'], to: 'ORDER_CONFIRMED' },
  INITIATE_PAYMENT:    { from: ['ORDER_CONFIRMED'], to: 'PAYMENT_PENDING' },
  RECEIVE_PAYMENT:     { from: ['PAYMENT_PENDING'], to: 'PAYMENT_RECEIVED' },
  ESCROW_PAYMENT:      { from: ['PAYMENT_RECEIVED'], to: 'PAYMENT_ESCROWED' },
  REQUEST_LICENSE:     { from: ['PAYMENT_ESCROWED', 'PAYMENT_RECEIVED'], to: 'LICENSE_PENDING' },
  ISSUE_LICENSE:       { from: ['LICENSE_PENDING'], to: 'LICENSE_ISSUED' },
  START_MANUFACTURING: { from: ['LICENSE_ISSUED', 'PAYMENT_ESCROWED'], to: 'MANUFACTURING' },
  GOODS_READY:         { from: ['MANUFACTURING'], to: 'READY_TO_SHIP' },
  START_SHIPMENT:      { from: ['READY_TO_SHIP'], to: 'IN_TRANSIT' },
  CLEAR_CUSTOMS:       { from: ['IN_TRANSIT'], to: 'CUSTOMS_CLEARANCE' },
  CONFIRM_DELIVERY:    { from: ['CUSTOMS_CLEARANCE', 'IN_TRANSIT'], to: 'DELIVERED' },
  PASS_INSPECTION:     { from: ['DELIVERED'], to: 'QUALITY_INSPECTION' },
  COMPLETE_TRADE:      { from: ['QUALITY_INSPECTION', 'DELIVERED'], to: 'COMPLETED' },
  OPEN_DISPUTE:        { from: ['ORDER_CONFIRMED', 'PAYMENT_PENDING', 'PAYMENT_ESCROWED', 'MANUFACTURING', 'IN_TRANSIT', 'DELIVERED'], to: 'DISPUTED' },
  CANCEL_TRADE:        { from: ['RFQ_DRAFT', 'COMPLIANCE_PENDING', 'BIDDING_OPEN', 'ORDER_CONFIRMED', 'PAYMENT_PENDING'], to: 'CANCELLED' },
  REFUND_TRADE:        { from: ['DISPUTED', 'CANCELLED'], to: 'REFUNDED' },
  FAIL_TRADE:          { from: ['INIT', 'RFQ_DRAFT', 'COMPLIANCE_PENDING', 'BIDDING_OPEN', 'ORDER_CONFIRMED', 'PAYMENT_PENDING', 'MANUFACTURING', 'IN_TRANSIT'], to: 'FAILED' },
}

// ==================== 状态显示名称 ====================
export const STATE_LABELS: Record<TradeState, { label: string; color: string; severity: 'info' | 'warning' | 'success' | 'danger' | 'neutral' }> = {
  INIT:                { label: '初始化', color: '#6B7280', severity: 'neutral' },
  RFQ_DRAFT:           { label: 'RFQ草稿', color: '#6B7280', severity: 'neutral' },
  RFQ_PUBLISHED:       { label: 'RFQ已发布', color: '#3B82F6', severity: 'info' },
  COMPLIANCE_PENDING:  { label: '合规审核中', color: '#F59E0B', severity: 'warning' },
  COMPLIANCE_APPROVED: { label: '合规通过', color: '#10B981', severity: 'success' },
  COMPLIANCE_REJECTED: { label: '合规拒绝', color: '#EF4444', severity: 'danger' },
  BIDDING_OPEN:        { label: '竞价中', color: '#8B5CF6', severity: 'info' },
  BIDDING_CLOSED:      { label: '竞价结束', color: '#6B7280', severity: 'neutral' },
  BID_SELECTED:        { label: '已选中供应商', color: '#3B82F6', severity: 'info' },
  ORDER_CONFIRMED:     { label: '订单确认', color: '#3B82F6', severity: 'info' },
  PAYMENT_PENDING:     { label: '待支付', color: '#F59E0B', severity: 'warning' },
  PAYMENT_RECEIVED:    { label: '已收款', color: '#10B981', severity: 'success' },
  PAYMENT_ESCROWED:    { label: '资金托管中', color: '#06B6D4', severity: 'info' },
  LICENSE_PENDING:     { label: '待许可证', color: '#F59E0B', severity: 'warning' },
  LICENSE_ISSUED:      { label: '许可证已签发', color: '#10B981', severity: 'success' },
  MANUFACTURING:       { label: '生产中', color: '#3B82F6', severity: 'info' },
  READY_TO_SHIP:       { label: '待发货', color: '#3B82F6', severity: 'info' },
  IN_TRANSIT:          { label: '运输中', color: '#8B5CF6', severity: 'info' },
  CUSTOMS_CLEARANCE:   { label: '清关中', color: '#F59E0B', severity: 'warning' },
  DELIVERED:           { label: '已交付', color: '#10B981', severity: 'success' },
  QUALITY_INSPECTION:  { label: '质检中', color: '#F59E0B', severity: 'warning' },
  COMPLETED:           { label: '交易完成', color: '#10B981', severity: 'success' },
  DISPUTED:            { label: '争议中', color: '#EF4444', severity: 'danger' },
  CANCELLED:           { label: '已取消', color: '#6B7280', severity: 'neutral' },
  REFUNDED:            { label: '已退款', color: '#6B7280', severity: 'neutral' },
  FAILED:              { label: '失败', color: '#EF4444', severity: 'danger' },
}

// ==================== 交易类型 ====================
export interface TradeOrder {
  id: string
  tenant_id: string
  trade_ref: string
  state: TradeState
  created_at: Date
  updated_at: Date

  // 买方信息
  buyer_id?: string
  buyer_name: string
  buyer_country: string
  buyer_kyc_verified?: boolean

  // 最终用户
  end_user_name?: string
  end_user_country?: string
  end_user_statement?: string
  end_use?: string

  // 产品信息
  product_id?: string
  product_name: string
  product_description?: string
  product_passport_id?: string
  hs_code?: string
  eccn_code?: string
  quantity: number
  unit: string
  target_unit_price?: number
  currency: string

  // 供应商
  supplier_id?: string
  supplier_name?: string
  supplier_country?: string
  supplier_trust_score?: number

  // 中标信息
  winning_bid_id?: string
  final_unit_price?: number
  total_value?: number

  // 合规
  risk_score?: number
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  compliance_decision_id?: string
  license_id?: string
  license_number?: string

  // 物流
  incoterm?: string
  origin_country?: string
  destination_country?: string
  shipping_method?: string
  tracking_number?: string
  estimated_delivery?: Date
  actual_delivery?: Date

  // 支付
  payment_method?: string
  payment_status?: 'PENDING' | 'ESCROWED' | 'RELEASED' | 'REFUNDED'
  payment_reference?: string
  payment_date?: Date

  // 元数据
  tags?: string[]
  notes?: string
  documents?: string[]
}

// ==================== 状态机验证 ====================
export function canTransition(currentState: TradeState, event: TradeEvent): boolean {
  const transition = STATE_TRANSITIONS[event]
  return transition?.from.includes(currentState) ?? false
}

export function getNextState(currentState: TradeState, event: TradeEvent): TradeState | null {
  if (!canTransition(currentState, event)) return null
  return STATE_TRANSITIONS[event].to
}

export function getAvailableEvents(currentState: TradeState): TradeEvent[] {
  return (Object.keys(STATE_TRANSITIONS) as TradeEvent[]).filter(event =>
    STATE_TRANSITIONS[event].from.includes(currentState)
  )
}

// ==================== 交易参考号生成 ====================
export function generateTradeRef(): string {
  const date = new Date()
  const ym = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TRD-${ym}-${rand}`
}

// ==================== RFQ 报价 ====================
export interface Bid {
  id: string
  trade_id: string
  supplier_id: string
  supplier_name: string
  supplier_country: string
  supplier_trust_score: number
  unit_price: number
  total_price: number
  currency: string
  lead_time_days: number
  incoterm: string
  payment_terms: string
  warranty?: string
  certifications?: string[]
  notes?: string
  submitted_at: Date
  status: 'PENDING' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
}

// ==================== 合规路径建议 ====================
export interface TradePath {
  id: string
  name: string
  description: string
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  estimated_days: number
  additional_cost_percent: number
  required_documents: string[]
  steps: string[]
  recommended: boolean
}
