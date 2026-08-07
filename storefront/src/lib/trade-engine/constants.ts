/**
 * Aegisky Trade Engine - 全球工业级商品交易闭环常量
 * 覆盖 RFQ → Quotation → PO → Production → Shipping → Customs → Delivery → Payment 全流程
 */

// ==================== 订单状态机 ====================
export const ORDER_STATUS = {
  DRAFT: 'DRAFT',
  RFQ_SENT: 'RFQ_SENT',
  QUOTATION_RECEIVED: 'QUOTATION_RECEIVED',
  PO_ISSUED: 'PO_ISSUED',
  PO_CONFIRMED: 'PO_CONFIRMED',
  IN_PRODUCTION: 'IN_PRODUCTION',
  QC_PENDING: 'QC_PENDING',
  QC_PASSED: 'QC_PASSED',
  QC_FAILED: 'QC_FAILED',
  READY_TO_SHIP: 'READY_TO_SHIP',
  SHIPPED: 'SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  CUSTOMS_CLEARANCE: 'CUSTOMS_CLEARANCE',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['RFQ_SENT', 'CANCELLED'],
  RFQ_SENT: ['QUOTATION_RECEIVED', 'CANCELLED'],
  QUOTATION_RECEIVED: ['PO_ISSUED', 'CANCELLED'],
  PO_ISSUED: ['PO_CONFIRMED', 'CANCELLED'],
  PO_CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['QC_PENDING', 'DISPUTED'],
  QC_PENDING: ['QC_PASSED', 'QC_FAILED'],
  QC_FAILED: ['IN_PRODUCTION', 'CANCELLED'],
  QC_PASSED: ['READY_TO_SHIP'],
  READY_TO_SHIP: ['SHIPPED'],
  SHIPPED: ['IN_TRANSIT'],
  IN_TRANSIT: ['CUSTOMS_CLEARANCE'],
  CUSTOMS_CLEARANCE: ['DELIVERED'],
  DELIVERED: ['COMPLETED', 'DISPUTED'],
  COMPLETED: [],
  CANCELLED: [],
  DISPUTED: ['IN_PRODUCTION', 'REFUNDED', 'COMPLETED'],
  REFUNDED: [],
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  RFQ_SENT: { label: 'RFQ Sent', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  QUOTATION_RECEIVED: { label: 'Quoted', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  PO_ISSUED: { label: 'PO Issued', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  PO_CONFIRMED: { label: 'Confirmed', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  IN_PRODUCTION: { label: 'In Production', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  QC_PENDING: { label: 'QC Pending', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  QC_PASSED: { label: 'QC Passed', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  QC_FAILED: { label: 'QC Failed', color: 'text-red-400', bg: 'bg-red-500/20' },
  READY_TO_SHIP: { label: 'Ready to Ship', color: 'text-teal-400', bg: 'bg-teal-500/20' },
  SHIPPED: { label: 'Shipped', color: 'text-sky-400', bg: 'bg-sky-500/20' },
  IN_TRANSIT: { label: 'In Transit', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  CUSTOMS_CLEARANCE: { label: 'Customs', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  DELIVERED: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-500/20' },
  COMPLETED: { label: 'Completed', color: 'text-green-500', bg: 'bg-green-600/20' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-600/20' },
  DISPUTED: { label: 'Disputed', color: 'text-red-400', bg: 'bg-red-500/20' },
  REFUNDED: { label: 'Refunded', color: 'text-gray-400', bg: 'bg-gray-500/20' },
}

// ==================== 支付条款 ====================
export const PAYMENT_TERMS = [
  { code: 'T_T_ADVANCE', label: 'T/T 100% Advance', risk: 'SUPPLIER' },
  { code: 'T_T_30_70', label: 'T/T 30% Deposit, 70% Before Shipment', risk: 'BALANCED' },
  { code: 'T_T_30_70_BL', label: 'T/T 30% Deposit, 70% Against B/L Copy', risk: 'BUYER' },
  { code: 'LC_AT_SIGHT', label: 'L/C At Sight', risk: 'SECURE' },
  { code: 'LC_30', label: 'L/C 30 Days', risk: 'SECURE' },
  { code: 'LC_60', label: 'L/C 60 Days', risk: 'SECURE' },
  { code: 'LC_90', label: 'L/C 90 Days', risk: 'SECURE' },
  { code: 'DP', label: 'D/P Documents Against Payment', risk: 'MEDIUM' },
  { code: 'DA', label: 'D/A Documents Against Acceptance', risk: 'HIGH' },
  { code: 'OA_30', label: 'O/A 30 Days Net', risk: 'HIGH' },
  { code: 'OA_60', label: 'O/A 60 Days Net', risk: 'HIGH' },
  { code: 'ESCROW', label: 'Escrow Service', risk: 'SECURE' },
]

// ==================== 运输方式 ====================
export const SHIPPING_METHODS = [
  { code: 'AIR_EXPRESS', label: 'Air Express (DHL/FedEx/UPS)', eta_days: '3-7', icon: '✈️' },
  { code: 'AIR_FREIGHT', label: 'Air Freight', eta_days: '5-10', icon: '🛫' },
  { code: 'SEA_FCL', label: 'Sea Freight FCL', eta_days: '20-40', icon: '🚢' },
  { code: 'SEA_LCL', label: 'Sea Freight LCL', eta_days: '25-45', icon: '📦' },
  { code: 'RAIL', label: 'Rail Freight', eta_days: '15-25', icon: '🚂' },
  { code: 'TRUCK', label: 'Truck/Land Freight', eta_days: '5-15', icon: '🚛' },
]

// ==================== 国际物流承运商 ====================
export const FREIGHT_FORWARDERS = [
  { code: 'DHL', name: 'DHL Express', website: 'dhl.com', tracking: 'https://www.dhl.com/en/express/tracking.html?AWB=' },
  { code: 'FEDEX', name: 'FedEx', website: 'fedex.com', tracking: 'https://www.fedex.com/fedextrack/?trknbr=' },
  { code: 'UPS', name: 'UPS', website: 'ups.com', tracking: 'https://www.ups.com/track?tracknum=' },
  { code: 'KN', name: 'Kuehne + Nagel', website: 'kn-portal.com' },
  { code: 'DSV', name: 'DSV Panalpina', website: 'dsv.com' },
  { code: 'SCHENKER', name: 'DB Schenker', website: 'dbschenker.com' },
  { code: 'MAERSK', name: 'Maersk Line', website: 'maersk.com' },
  { code: 'MSC', name: 'MSC', website: 'msc.com' },
  { code: 'CMA', name: 'CMA CGM', website: 'cma-cgm.com' },
  { code: 'HAPAG', name: 'Hapag-Lloyd', website: 'hapag-lloyd.com' },
]

// ==================== 主要港口/机场 ====================
export const MAJOR_PORTS = [
  { code: 'CNSHA', name: 'Shanghai', country: 'CN', type: 'SEA' },
  { code: 'CNNGB', name: 'Ningbo-Zhoushan', country: 'CN', type: 'SEA' },
  { code: 'CNSZX', name: 'Shenzhen', country: 'CN', type: 'SEA' },
  { code: 'CNPVG', name: 'Shanghai Pudong', country: 'CN', type: 'AIR' },
  { code: 'HKHKG', name: 'Hong Kong', country: 'HK', type: 'BOTH' },
  { code: 'NLRTM', name: 'Rotterdam', country: 'NL', type: 'SEA' },
  { code: 'DEHAM', name: 'Hamburg', country: 'DE', type: 'SEA' },
  { code: 'BEANR', name: 'Antwerp', country: 'BE', type: 'SEA' },
  { code: 'DEFRA', name: 'Frankfurt', country: 'DE', type: 'AIR' },
  { code: 'AEJEA', name: 'Jebel Ali (Dubai)', country: 'AE', type: 'SEA' },
  { code: 'AEDXB', name: 'Dubai Airport', country: 'AE', type: 'AIR' },
  { code: 'SGSIN', name: 'Singapore', country: 'SG', type: 'BOTH' },
  { code: 'USLAX', name: 'Los Angeles', country: 'US', type: 'SEA' },
  { code: 'USLGB', name: 'Long Beach', country: 'US', type: 'SEA' },
  { code: 'USJFK', name: 'New York JFK', country: 'US', type: 'AIR' },
]

// ==================== 商业单据类型 ====================
export const TRADE_DOC_TYPES = {
  PI: { code: 'PI', label: 'Proforma Invoice', required: true },
  CI: { code: 'CI', label: 'Commercial Invoice', required: true },
  PL: { code: 'PL', label: 'Packing List', required: true },
  BL: { code: 'BL', label: 'Bill of Lading', required: true },
  AWB: { code: 'AWB', label: 'Air Waybill', required: false },
  CO: { code: 'CO', label: 'Certificate of Origin', required: true },
  INS: { code: 'INS', label: 'Insurance Certificate', required: false },
  IC: { code: 'IC', label: 'Inspection Certificate', required: false },
  EL: { code: 'EL', label: 'Export License', required: true },
  EUR1: { code: 'EUR1', label: 'EUR.1 Certificate', required: false },
}

// ==================== 付款状态 ====================
export const PAYMENT_STATUS = {
  UNPAID: { label: 'Unpaid', color: 'text-red-400' },
  DEPOSIT_PAID: { label: 'Deposit Paid', color: 'text-yellow-400' },
  PARTIAL_PAID: { label: 'Partially Paid', color: 'text-orange-400' },
  PAID: { label: 'Paid', color: 'text-green-400' },
  OVERDUE: { label: 'Overdue', color: 'text-red-500' },
  REFUNDED: { label: 'Refunded', color: 'text-gray-400' },
}

// ==================== 优先级 ====================
export const PRIORITY = {
  LOW: { label: 'Low', color: 'text-gray-400', days: 30 },
  NORMAL: { label: 'Normal', color: 'text-blue-400', days: 15 },
  HIGH: { label: 'High', color: 'text-orange-400', days: 7 },
  URGENT: { label: 'Urgent', color: 'text-red-500', days: 3 },
}
