/**
 * International Tariff & Duty Calculation
 * Based on HS codes and destination country
 */

// HS Code categories for drone/UAV products
// Format: HS code prefix -> description, base duty rates by country group
export interface TariffInfo {
  hsCode: string
  description: string
  category: string
}

export const HS_CODES: Record<string, TariffInfo> = {
  // Drones and UAVs
  drone: { hsCode: '8806.10', description: 'Unmanned aircraft (drones/UAVs)', category: 'aircraft' },
  uav: { hsCode: '8806.10', description: 'Unmanned aircraft (drones/UAVs)', category: 'aircraft' },
  quadcopter: { hsCode: '8806.10', description: 'Unmanned aircraft (drones/UAVs)', category: 'aircraft' },

  // Motors
  motor: { hsCode: '8501.31', description: 'Brushless DC motors, under 750W', category: 'motor' },
  'brushless motor': { hsCode: '8501.31', description: 'Brushless DC motors, under 750W', category: 'motor' },

  // ESCs / Speed controllers
  esc: { hsCode: '8504.40', description: 'Electronic speed controllers / inverters', category: 'electronics' },
  'speed controller': { hsCode: '8504.40', description: 'Electronic speed controllers', category: 'electronics' },

  // Propellers
  propeller: { hsCode: '8803.30', description: 'Aircraft propellers and parts', category: 'aircraft_parts' },
  prop: { hsCode: '8803.30', description: 'Aircraft propellers and parts', category: 'aircraft_parts' },

  // Flight controllers
  'flight controller': { hsCode: '8537.10', description: 'Electronic control boards / PCB assemblies', category: 'electronics' },
  fc: { hsCode: '8537.10', description: 'Electronic control boards', category: 'electronics' },

  // Batteries
  battery: { hsCode: '8507.60', description: 'Lithium-ion batteries', category: 'battery' },
  lipo: { hsCode: '8507.60', description: 'Lithium-ion batteries', category: 'battery' },
  lihv: { hsCode: '8507.60', description: 'Lithium-ion batteries', category: 'battery' },

  // FPV Cameras
  camera: { hsCode: '8525.80', description: 'Video cameras / digital cameras', category: 'electronics' },
  'fpv camera': { hsCode: '8525.80', description: 'Video cameras', category: 'electronics' },

  // VTX / Video transmitters
  vtx: { hsCode: '8525.60', description: 'Radio/TV transmission apparatus', category: 'electronics' },
  'video transmitter': { hsCode: '8525.60', description: 'Video transmission apparatus', category: 'electronics' },

  // Receivers / Radio
  receiver: { hsCode: '8527.90', description: 'Radio receivers', category: 'electronics' },
  rx: { hsCode: '8527.90', description: 'Radio receivers', category: 'electronics' },
  transmitter: { hsCode: '8526.92', description: 'Radio remote control apparatus', category: 'electronics' },
  tx: { hsCode: '8526.92', description: 'Radio remote control apparatus', category: 'electronics' },
  elrs: { hsCode: '8526.92', description: 'Radio remote control apparatus', category: 'electronics' },

  // Antenna
  antenna: { hsCode: '8529.10', description: 'Antennas and antenna reflectors', category: 'electronics' },

  // GPS
  gps: { hsCode: '8526.91', description: 'GPS navigation receivers', category: 'electronics' },
  gnss: { hsCode: '8526.91', description: 'Satellite navigation receivers', category: 'electronics' },

  // Frames / Chassis
  frame: { hsCode: '8803.90', description: 'Aircraft parts, other', category: 'aircraft_parts' },
  chassis: { hsCode: '8803.90', description: 'Aircraft parts', category: 'aircraft_parts' },
  'carbon fiber': { hsCode: '6815.99', description: 'Carbon fiber articles', category: 'materials' },

  // Gimbals
  gimbal: { hsCode: '8525.80', description: 'Camera stabilization apparatus', category: 'electronics' },

  // Thermal cameras
  thermal: { hsCode: '8525.89', description: 'Infrared/thermal imaging cameras', category: 'electronics' },
  infrared: { hsCode: '8525.89', description: 'Infrared imaging cameras', category: 'electronics' },

  // LiDAR
  lidar: { hsCode: '9015.10', description: 'Laser distance measuring instruments', category: 'instrument' },

  // General electronics
  electronics: { hsCode: '8543.70', description: 'Other electronic equipment', category: 'electronics' },
}

// Duty rates by country/region (percentage)
// These are approximate general rates; actual rates depend on specific HS codes and trade agreements
const DUTY_RATES: Record<string, Record<string, number>> = {
  // North America
  US: { aircraft: 0, aircraft_parts: 0, motor: 3.5, electronics: 0, battery: 3.4, materials: 4.2, instrument: 3.5, default: 3.5 },
  CA: { aircraft: 0, aircraft_parts: 0, motor: 3.5, electronics: 0, battery: 6.5, materials: 4.5, instrument: 3.5, default: 4.0 },
  MX: { aircraft: 0, aircraft_parts: 5, motor: 10, electronics: 5, battery: 15, materials: 10, instrument: 10, default: 10 },

  // Europe
  GB: { aircraft: 0, aircraft_parts: 0, motor: 2.7, electronics: 0, battery: 3.7, materials: 3.7, instrument: 2.5, default: 3.0 },
  DE: { aircraft: 0, aircraft_parts: 0, motor: 2.7, electronics: 0, battery: 3.7, materials: 3.7, instrument: 2.5, default: 3.0 },
  FR: { aircraft: 0, aircraft_parts: 0, motor: 2.7, electronics: 0, battery: 3.7, materials: 3.7, instrument: 2.5, default: 3.0 },
  IT: { aircraft: 0, aircraft_parts: 0, motor: 2.7, electronics: 0, battery: 3.7, materials: 3.7, instrument: 2.5, default: 3.0 },
  ES: { aircraft: 0, aircraft_parts: 0, motor: 2.7, electronics: 0, battery: 3.7, materials: 3.7, instrument: 2.5, default: 3.0 },
  NL: { aircraft: 0, aircraft_parts: 0, motor: 2.7, electronics: 0, battery: 3.7, materials: 3.7, instrument: 2.5, default: 3.0 },
  PL: { aircraft: 0, aircraft_parts: 0, motor: 2.7, electronics: 0, battery: 3.7, materials: 3.7, instrument: 2.5, default: 3.0 },

  // Asia-Pacific
  JP: { aircraft: 0, aircraft_parts: 0, motor: 0, electronics: 0, battery: 0, materials: 3.5, instrument: 0, default: 2.0 },
  KR: { aircraft: 0, aircraft_parts: 0, motor: 3, electronics: 0, battery: 3, materials: 5, instrument: 3, default: 3.0 },
  AU: { aircraft: 0, aircraft_parts: 0, motor: 5, electronics: 0, battery: 5, materials: 5, instrument: 5, default: 5.0 },
  NZ: { aircraft: 0, aircraft_parts: 0, motor: 5, electronics: 0, battery: 5, materials: 5, instrument: 5, default: 5.0 },
  SG: { aircraft: 0, aircraft_parts: 0, motor: 0, electronics: 0, battery: 0, materials: 0, instrument: 0, default: 0 },
  HK: { aircraft: 0, aircraft_parts: 0, motor: 0, electronics: 0, battery: 0, materials: 0, instrument: 0, default: 0 },
  IN: { aircraft: 7.5, aircraft_parts: 10, motor: 7.5, electronics: 10, battery: 15, materials: 10, instrument: 10, default: 10 },

  // Middle East
  AE: { aircraft: 0, aircraft_parts: 5, motor: 5, electronics: 0, battery: 5, materials: 5, instrument: 5, default: 5.0 },
  SA: { aircraft: 0, aircraft_parts: 5, motor: 5, electronics: 5, battery: 5, materials: 5, instrument: 5, default: 5.0 },
  IL: { aircraft: 0, aircraft_parts: 0, motor: 0, electronics: 0, battery: 0, materials: 0, instrument: 0, default: 0 },
  TR: { aircraft: 0, aircraft_parts: 4.5, motor: 4.5, electronics: 0, battery: 4.5, materials: 6, instrument: 4.5, default: 4.5 },

  // Russia/CIS
  RU: { aircraft: 0, aircraft_parts: 5, motor: 10, electronics: 5, battery: 10, materials: 10, instrument: 10, default: 10 },

  // South America
  BR: { aircraft: 0, aircraft_parts: 10, motor: 14, electronics: 10, battery: 18, materials: 14, instrument: 14, default: 14 },
  AR: { aircraft: 0, aircraft_parts: 10, motor: 14, electronics: 10, battery: 18, materials: 14, instrument: 14, default: 14 },
  CL: { aircraft: 0, aircraft_parts: 0, motor: 6, electronics: 0, battery: 6, materials: 6, instrument: 6, default: 6 },

  // Africa
  ZA: { aircraft: 0, aircraft_parts: 0, motor: 10, electronics: 0, battery: 15, materials: 10, instrument: 10, default: 10 },
  EG: { aircraft: 0, aircraft_parts: 5, motor: 5, electronics: 0, battery: 5, materials: 5, instrument: 5, default: 5 },
}

// VAT/GST rates by country
const VAT_RATES: Record<string, number> = {
  US: 0, // Sales tax varies by state, handled separately
  CA: 5,
  MX: 16,
  GB: 20,
  DE: 19,
  FR: 20,
  IT: 22,
  ES: 21,
  NL: 21,
  PL: 23,
  JP: 10,
  KR: 10,
  AU: 10,
  NZ: 15,
  SG: 9,
  HK: 0,
  IN: 18,
  AE: 5,
  SA: 15,
  IL: 17,
  TR: 20,
  RU: 20,
  BR: 17,
  AR: 21,
  CL: 19,
  ZA: 15,
  EG: 14,
  CN: 13,
}

// De minimis values (below this value, no duty/tax)
const DE_MINIMIS: Record<string, number> = {
  US: 800,
  CA: 20,
  GB: 135,
  AU: 1000,
  NZ: 1000,
  SG: 400,
  JP: 10000, // ~$67
  KR: 150,
  EU: 150, // For all EU countries
}

export interface TariffCalculation {
  hsCode: string
  hsDescription: string
  customsValue: number
  dutyRate: number
  dutyAmount: number
  vatRate: number
  vatAmount: number
  totalLandCost: number
  deMinimisApplied: boolean
  country: string
}

/**
 * Estimate HS code from product category/name
 */
export function estimateHSCode(productName: string, categoryName?: string): TariffInfo {
  const searchText = `${productName} ${categoryName || ''}`.toLowerCase()

  // Try exact matches first
  for (const [key, info] of Object.entries(HS_CODES)) {
    if (searchText.includes(key)) {
      return info
    }
  }

  // Default to general electronics
  return HS_CODES.electronics
}

/**
 * Calculate import duty and taxes for a shipment
 */
export function calculateTariff(
  countryCode: string,
  declaredValue: number,
  hsCode?: string,
  productCategory?: string
): TariffCalculation {
  const rates = DUTY_RATES[countryCode] || DUTY_RATES.US
  const vatRate = VAT_RATES[countryCode] ?? 0

  // Determine category for duty rate
  let category = 'default'
  if (hsCode) {
    const found = Object.values(HS_CODES).find(h => h.hsCode === hsCode)
    if (found) category = found.category
  } else if (productCategory) {
    const found = Object.values(HS_CODES).find(h =>
      productCategory.toLowerCase().includes(h.category) ||
      h.description.toLowerCase().includes(productCategory.toLowerCase())
    )
    if (found) category = found.category
  }

  const dutyRate = rates[category] ?? rates.default ?? 0

  // Check de minimis
  const deMinimis = DE_MINIMIS[countryCode] ?? DE_MINIMIS.EU ?? 0
  const deMinimisApplied = declaredValue < deMinimis

  const dutyAmount = deMinimisApplied ? 0 : Math.round(declaredValue * dutyRate / 100 * 100) / 100
  const dutiableValue = declaredValue + dutyAmount
  const vatAmount = deMinimisApplied ? 0 : Math.round(dutiableValue * vatRate / 100 * 100) / 100

  return {
    hsCode: hsCode || HS_CODES.electronics.hsCode,
    hsDescription: hsCode ? (Object.values(HS_CODES).find(h => h.hsCode === hsCode)?.description || '') : HS_CODES.electronics.description,
    customsValue: declaredValue,
    dutyRate: deMinimisApplied ? 0 : dutyRate,
    dutyAmount,
    vatRate: deMinimisApplied ? 0 : vatRate,
    vatAmount,
    totalLandCost: declaredValue + dutyAmount + vatAmount,
    deMinimisApplied,
    country: countryCode,
  }
}

/**
 * Calculate tariff for a cart/order
 */
export function calculateOrderTariff(
  countryCode: string,
  items: Array<{ name: string; category?: string; price: number; quantity: number }>
): { items: TariffCalculation[]; totalDuty: number; totalVat: number; grandTotal: number; subtotal: number; deMinimisApplied: boolean } {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const itemCalcs = items.map(item => {
    const hsInfo = estimateHSCode(item.name, item.category)
    return calculateTariff(countryCode, item.price * item.quantity, hsInfo.hsCode, hsInfo.category)
  })

  const totalDuty = itemCalcs.reduce((sum, c) => sum + c.dutyAmount, 0)
  const totalVat = itemCalcs.reduce((sum, c) => sum + c.vatAmount, 0)
  const deMinimisApplied = itemCalcs.length > 0 && itemCalcs.every(c => c.deMinimisApplied)

  return {
    items: itemCalcs,
    totalDuty,
    totalVat,
    grandTotal: subtotal + totalDuty + totalVat,
    subtotal,
    deMinimisApplied,
  }
}
