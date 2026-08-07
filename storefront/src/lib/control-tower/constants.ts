/**
 * Control Tower v2.0 - 全球两用物项出口管制专业常量
 * 符合 EU Dual-Use 2021/821, US EAR, Wassenaar Arrangement
 */

// ==================== ECCN 分类（无人机及相关物项完整清单）====================
export const DRONE_ECCN_CODES = [
  // 类别7 - 导航和航空电子
  { eccn: '7A001', title: '陀螺仪、加速度计、惯性系统', control_reasons: ['NS', 'MT', 'RS'], military: false, dual_use: true, at_notes: 'All inertial navigation systems' },
  { eccn: '7A003', title: '导航系统、GNSS接收机', control_reasons: ['NS', 'MT'], military: false, dual_use: true, at_notes: 'Including GPS/GLONASS/Galileo receivers' },
  { eccn: '7A102', title: '精密陀螺仪（导弹级）', control_reasons: ['MT'], military: true, dual_use: true, at_notes: 'For missile guidance systems' },
  { eccn: '7D001', title: '导航软件', control_reasons: ['NS', 'MT'], military: false, dual_use: true },
  { eccn: '7E001', title: '导航技术', control_reasons: ['NS', 'MT'], military: false, dual_use: true },

  // 类别8 - 成像和传感器
  { eccn: '8A002', title: '成像相机、传感器', control_reasons: ['NS', 'RS', 'AT'], military: false, dual_use: true, at_notes: 'Including thermal/IR cameras' },
  { eccn: '8A002.a', title: '高分辨率成像相机', control_reasons: ['NS', 'RS'], military: false, dual_use: true },
  { eccn: '8A002.d', title: '红外成像传感器', control_reasons: ['NS', 'RS', 'AT'], military: false, dual_use: true },

  // 类别9 - 推进和飞行器
  { eccn: '9A012', title: '无人驾驶飞行器、无人机系统', control_reasons: ['NS', 'MT', 'RS'], military: false, dual_use: true, at_notes: 'UAVs with >30 min endurance OR >1kg payload' },
  { eccn: '9A115', title: '无人机发射/回收设备', control_reasons: ['MT'], military: true, dual_use: true },
  { eccn: '9A018', title: '航空发动机、推进系统', control_reasons: ['NS', 'MT'], military: false, dual_use: true },
  { eccn: '9B010', title: '无人机生产设备', control_reasons: ['NS', 'MT'], military: false, dual_use: true },
  { eccn: '9D001', title: '无人机飞控软件', control_reasons: ['NS', 'MT'], military: false, dual_use: true },
  { eccn: '9D003', title: '自主飞行控制软件', control_reasons: ['NS', 'MT'], military: false, dual_use: true },
  { eccn: '9E001', title: '无人机技术', control_reasons: ['NS', 'MT'], military: false, dual_use: true },

  // 类别5 - 加密和通信
  { eccn: '5A002', title: '加密设备、信息安全', control_reasons: ['NS', 'EI'], military: false, dual_use: true, at_notes: 'Cryptographic items' },
  { eccn: '5D002', title: '加密软件', control_reasons: ['NS', 'EI'], military: false, dual_use: true },
  { eccn: '5A001', title: '通信系统、遥测', control_reasons: ['NS', 'AT'], military: false, dual_use: true },

  // 类别4 - 计算机
  { eccn: '4A003', title: '高性能计算机、DSP', control_reasons: ['NS'], military: false, dual_use: true },
  { eccn: '4D001', title: '高性能计算软件', control_reasons: ['NS'], military: false, dual_use: true },

  // 类别6 - 激光和传感器
  { eccn: '6A003', title: '光学传感器、激光测距仪', control_reasons: ['NS', 'RS'], military: false, dual_use: true },
  { eccn: '6A005', title: '激光器、激光指示器', control_reasons: ['NS', 'AT'], military: false, dual_use: true },

  // 类别1 - 特种材料
  { eccn: '1C001', title: '隐身材料、吸波材料', control_reasons: ['NS', 'MT'], military: false, dual_use: true },
  { eccn: '1C101', title: '降低可探测性材料', control_reasons: ['MT'], military: true, dual_use: true },

  // EAR99 - 低敏感
  { eccn: 'EAR99', title: '不在CCL清单上，低敏感度', control_reasons: [], military: false, dual_use: false, at_notes: 'Most commercial items' },
]

// ==================== 出口许可证类型 ====================
export const LICENSE_TYPES = [
  { code: 'INDIVIDUAL', label: 'Individual Validated License (IVL)', description: '单次出口许可证，特定物项/最终用户/目的地', validity_months: 24, max_shipments: 1 },
  { code: 'DISTRIBUTION', label: 'Distribution License', description: '经销商许可证，向已批准经销商多次出口', validity_months: 24, max_shipments: null },
  { code: 'COMPREHENSIVE', label: 'Comprehensive License', description: '综合许可证，多个物项/用户/目的地', validity_months: 36, max_shipments: null },
  { code: 'GENERAL_EU', label: 'EU General Export Authorization (GEA)', description: '欧盟通用出口授权', validity_months: null, max_shipments: null },
  { code: 'NLR', label: 'No License Required (NLR)', description: '无需许可证（EAR99或许可证例外）', validity_months: null, max_shipments: null },
  { code: 'GOVT', label: 'Government End Use', description: '政府最终用户许可证', validity_months: 12, max_shipments: null },
  { code: 'TEMPORARY', label: 'Temporary Export', description: '临时出口（展览、维修、测试）', validity_months: 12, max_shipments: 1 },
]

// ==================== 美国EAR许可证例外 ====================
export const LICENSE_EXCEPTIONS = [
  { code: 'LVS', label: 'LVS - Low Value Shipment', description: '低价值装运（按ECCN不同阈值）', eligible_eccns: ['9A012', '7A003', '8A002'] },
  { code: 'GBS', label: 'GBS - Country Group B', description: 'B组国家（大多数西方盟国）', eligible_countries: ['DE', 'FR', 'UK', 'IT', 'ES', 'NL', 'BE', 'JP', 'AU', 'CA'] },
  { code: 'CIV', label: 'CIV - Civilian End Users', description: '民用最终用户', eligible_eccns: ['7A003', '8A002'] },
  { code: 'TSR', label: 'TSR - Technology and Software', description: '技术和软件再出口限制', eligible_eccns: ['7D001', '9D001'] },
  { code: 'STA', label: 'STA - Strategic Trade Authorization', description: '战略贸易授权（盟国）', eligible_countries: ['US', 'CA', 'UK', 'AU', 'JP'] },
  { code: 'APR', label: 'APR - Repair and Replacement', description: '维修和替换零件', eligible_eccns: ['9A012', '7A003'] },
  { code: 'TMP', label: 'TMP - Temporary Exports', description: '临时出口（展览、测试）', eligible_eccns: ['9A012'] },
  { code: 'BAG', label: 'BAG - Baggage', description: '个人行李', eligible_eccns: ['EAR99'] },
]

// ==================== 国家分组（EAR Country Groups）====================
export const COUNTRY_GROUPS = {
  A: ['CA', 'MX'], // 北美自由贸易
  A1: ['AU', 'JP', 'NZ', 'KR'], // 导弹技术伙伴
  A2: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'], // EU
  B: ['AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'NO', 'OM', 'PK', 'PW', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RU', 'RW', 'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'SS', 'ES', 'LK', 'SD', 'SR', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU', 'VE', 'VN', 'YE', 'ZM', 'ZW'],
  D: ['CU', 'IR', 'KP', 'SY'], // 禁运国家
  D1: ['BY', 'MM', 'CN', 'IQ', 'RU', 'VE'], // 国家安全
  D2: ['BY', 'MM', 'CN', 'IQ', 'RU', 'VE'], // 导弹技术
  D3: ['BY', 'MM', 'CN', 'IQ', 'RU', 'VE'], // 生化武器
  D4: ['BY', 'MM', 'CN', 'IQ', 'RU', 'VE'], // 核不扩散
  E: ['CU', 'IR', 'KP', 'SY', 'BY', 'MM', 'RU', 'VE'], // 恐怖主义支持
}

// ==================== 全面制裁国家 ====================
export const SANCTIONED_COUNTRIES = ['RU', 'IR', 'KP', 'SY', 'CU', 'VE', 'BY', 'MM', 'SD', 'LY', 'YE', 'SO', 'AF', 'ZW', 'ER']
export const HIGH_RISK_COUNTRIES = ['HK', 'AE', 'TR', 'CY', 'MT', 'LU', 'PA', 'KY', 'VG', 'BM', 'GI', 'MU', 'KZ', 'UZ', 'KG']

// ==================== 红旗关键词（实体名称扫描）====================
export const RED_FLAG_KEYWORDS = [
  'military', 'defense', 'defence', 'army', 'navy', 'air force',
  'weapons', 'missile', 'rocket', 'bomb', 'explosive', 'munitions',
  'armed forces', 'ministry of defense', 'mod ', 'pentagon',
  'rosoboronexport', 'almaz', 'sukhoi', 'mikoyan', 'kalashnikov', 'wagner',
  'irgc', 'revolutionary guard', 'people\u2019s liberation army', 'pla ',
  'defense ministry', 'military research', 'arms dealer', 'arms trade',
]

// ==================== 红旗指标（KYC/最终用户红旗）====================
export const RED_FLAG_INDICATORS = [
  // 客户/实体红旗
  { category: 'CUSTOMER', indicator: '客户拒绝提供最终用途信息', severity: 'HIGH', action: 'BLOCK' },
  { category: 'CUSTOMER', indicator: '客户对产品技术规格不熟悉', severity: 'MEDIUM', action: 'REVIEW' },
  { category: 'CUSTOMER', indicator: '客户提供模糊或不完整的地址', severity: 'MEDIUM', action: 'REVIEW' },
  { category: 'CUSTOMER', indicator: '客户使用个人邮箱而非公司邮箱', severity: 'LOW', action: 'VERIFY' },
  { category: 'CUSTOMER', indicator: '客户与军方/国防部门有已知关联', severity: 'CRITICAL', action: 'ESCALATE' },
  { category: 'CUSTOMER', indicator: '客户被列入被拒绝方名单或关联方', severity: 'CRITICAL', action: 'BLOCK' },
  { category: 'CUSTOMER', indicator: '中介/贸易商拒绝披露最终用户', severity: 'HIGH', action: 'BLOCK' },

  // 交易红旗
  { category: 'TRANSACTION', indicator: '货物运往与最终用户地址不符的国家', severity: 'HIGH', action: 'ESCALATE' },
  { category: 'TRANSACTION', indicator: '货运路线异常（经第三国转运）', severity: 'HIGH', action: 'REVIEW' },
  { category: 'TRANSACTION', indicator: '包装与装运方式与货物不符', severity: 'MEDIUM', action: 'REVIEW' },
  { category: 'TRANSACTION', indicator: '客户要求异常宽松的付款条件', severity: 'MEDIUM', action: 'REVIEW' },
  { category: 'TRANSACTION', indicator: '数量与客户正常业务规模不符', severity: 'HIGH', action: 'REVIEW' },
  { category: 'TRANSACTION', indicator: '要求发往货运代理/自由贸易区', severity: 'MEDIUM', action: 'VERIFY' },

  // 最终用途红旗
  { category: 'END_USE', indicator: '声明民用但物项通常用于军事', severity: 'CRITICAL', action: 'ESCALATE' },
  { category: 'END_USE', indicator: '最终用户为军事/国防/情报机构', severity: 'CRITICAL', action: 'BLOCK' },
  { category: 'END_USE', indicator: '最终用途涉及核武器/生化/导弹项目', severity: 'CRITICAL', action: 'BLOCK' },
  { category: 'END_USE', indicator: '拒绝提供最终用户声明(EUS)', severity: 'HIGH', action: 'BLOCK' },
  { category: 'END_USE', indicator: '产品能力明显超出声明民用需求', severity: 'HIGH', action: 'ESCALATE' },

  // 多语言关键词
  { category: 'KEYWORD', indicator: 'military/defense/army/weapon/missile', severity: 'HIGH', action: 'REVIEW' },
  { category: 'KEYWORD', indicator: 'военный/оборона/армия/оружие/ракета', severity: 'HIGH', action: 'REVIEW' },
  { category: 'KEYWORD', indicator: '军工/国防/军队/武器/导弹/情报', severity: 'HIGH', action: 'REVIEW' },
]

// ==================== 被拒绝方名单（示例 - SDN/Entity List）====================
export const DENIED_PARTIES_SAMPLE = [
  // 美国BIS Entity List示例
  { name: 'DJI Technology Co., Ltd.', country: 'CN', list: 'ENTITY_LIST', date: '2020-12-18', reason: 'Uyghur Forced Labor', federal_register: '85 FR 83369' },
  { name: 'Russian Ministry of Defense', country: 'RU', list: 'SDN', date: '2022-02-24', reason: 'Ukraine invasion' },
  { name: 'Wagner Group', country: 'RU', list: 'SDN', date: '2022-06-27', reason: 'Paramilitary group' },
  { name: 'Iranian Revolutionary Guard', country: 'IR', list: 'SDN', date: '2019-04-15', reason: 'Terrorism' },
  // 更多会通过API/数据库加载
]

// ==================== 仓库 ====================
export const WAREHOUSES = [
  { code: 'Poland_Central', name: '波兰中心仓', country: 'PL', country_name: 'Poland', zone: 'EU_EAST', priority: 1, active: true, address: 'Warsaw, Poland' },
  { code: 'Germany_North', name: '德国北部仓', country: 'DE', country_name: 'Germany', zone: 'EU_WEST', priority: 2, active: true, address: 'Hamburg, Germany' },
  { code: 'UAE_Freezone', name: '阿联酋自由港', country: 'AE', country_name: 'UAE', zone: 'MIDDLE_EAST', priority: 3, active: true, address: 'Jebel Ali Free Zone, Dubai' },
  { code: 'Singapore_Hub', name: '新加坡枢纽', country: 'SG', country_name: 'Singapore', zone: 'APAC', priority: 4, active: true, address: 'Changi, Singapore' },
  { code: 'US_West', name: '美西仓', country: 'US', country_name: 'United States', zone: 'AMERICAS', priority: 5, active: true, address: 'Los Angeles, CA' },
]

// ==================== 贸易术语和货币 ====================
export const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CHF', 'AED', 'SGD', 'PLN', 'HKD']

// ==================== 合规状态 ====================
export const COMPLIANCE_STATUS = [
  'DRAFT', 'KYC_PENDING', 'SCREENING', 'LICENSE_REQUIRED',
  'LICENSE_PENDING', 'LICENSE_APPROVED', 'APPROVED', 'REJECTED', 'BLOCKED',
  'AWAITING_EUS', 'EUS_RECEIVED', 'UNDER_REVIEW', 'ESCALATED',
  'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED',
]

// ==================== 报告类型 ====================
export const REPORT_TYPES = [
  { code: 'BIS_711', label: 'BIS Form 711 - 年度报告', description: '美国出口许可证年度使用报告', frequency: 'ANNUAL', due_date: '每年3月31日' },
  { code: 'EU_ANNUAL', label: 'EU Dual-Use Annual Report', description: '欧盟两用物项出口年度报告', frequency: 'ANNUAL', due_date: '每年3月31日' },
  { code: 'LICENSE_USAGE', label: '许可证使用报告', description: '许可证使用明细报告', frequency: 'QUARTERLY' },
  { code: 'AUDIT_TRAIL', label: '审计追踪报告', description: '合规决策审计追踪', frequency: 'ON_DEMAND' },
  { code: 'RED_FLAG', label: '红旗指标报告', description: '红旗交易和异常报告', frequency: 'MONTHLY' },
  { code: 'SANCTIONS_SCREENING', label: '制裁筛查报告', description: '被拒绝方筛查结果报告', frequency: 'MONTHLY' },
]

// ==================== 审计事件类型 ====================
export const AUDIT_EVENTS = [
  'TRANSACTION_CREATED', 'SCREENING_PERFORMED', 'RED_FLAG_DETECTED',
  'LICENSE_CHECKED', 'LICENSE_APPLIED', 'LICENSE_APPROVED',
  'EUS_REQUESTED', 'EUS_RECEIVED', 'EUS_VERIFIED',
  'APPROVAL_GRANTED', 'APPROVAL_DENIED', 'ESCALATION',
  'SHIPMENT_AUTHORIZED', 'SHIPMENT_BLOCKED', 'DOCUMENT_GENERATED',
  'KYC_PERFORMED', 'KYC_APPROVED', 'KYC_REJECTED',
  'RECORD_RETENTION', 'INTERNAL_AUDIT',
]
