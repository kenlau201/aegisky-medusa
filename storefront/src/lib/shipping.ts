/**
 * Shipping Cost Calculator
 * Simulates DHL/FedEx/UPS international shipping rates
 */

export interface ShippingOption {
  id: string
  carrier: string
  service: string
  cost: number
  currency: string
  estimatedDays: string
  tracking: boolean
  insurance: boolean
}

export interface PackageInfo {
  weight: number // kg
  length: number // cm
  width: number // cm
  height: number // cm
  value: number // declared value in USD
}

// Country zones (from warehouse in China/HK)
const COUNTRY_ZONES: Record<string, number> = {
  US: 1, CA: 1, MX: 2,
  GB: 2, DE: 2, FR: 2, IT: 2, ES: 2, NL: 2, BE: 2, CH: 2, AT: 2, PL: 2, SE: 2, NO: 2, DK: 2, FI: 2, IE: 2, PT: 2, CZ: 2, HU: 2, RO: 2, GR: 2,
  RU: 3, BY: 3, UA: 3, TR: 3,
  AE: 3, SA: 3, IL: 3, QA: 3, KW: 3, BH: 3,
  JP: 2, KR: 2, SG: 2, MY: 2, TH: 2, ID: 3, VN: 3, PH: 3, IN: 3, PK: 3, BD: 3,
  AU: 2, NZ: 2,
  BR: 3, AR: 3, CL: 3, CO: 3, PE: 3,
  ZA: 3, EG: 3, NG: 3, KE: 3, MA: 3,
  CN: 0, HK: 0, TW: 2, MO: 2,
  IR: 99, KP: 99, SY: 99, CU: 99, // Sanctioned - no shipping
}

// Base rates by zone (USD for first 0.5kg)
const BASE_RATES: Record<number, { dhl: number; fedex: number; ups: number; ems: number }> = {
  0: { dhl: 5, fedex: 5, ups: 5, ems: 3 },
  1: { dhl: 28, fedex: 26, ups: 27, ems: 18 },
  2: { dhl: 35, fedex: 33, ups: 34, ems: 22 },
  3: { dhl: 45, fedex: 42, ups: 43, ems: 28 },
  99: { dhl: 9999, fedex: 9999, ups: 9999, ems: 9999 },
}

// Additional per 0.5kg rate
const PER_HALF_KG: Record<number, { dhl: number; fedex: number; ups: number; ems: number }> = {
  0: { dhl: 1, fedex: 1, ups: 1, ems: 0.5 },
  1: { dhl: 6, fedex: 5.5, ups: 5.8, ems: 4 },
  2: { dhl: 8, fedex: 7.5, ups: 7.8, ems: 5 },
  3: { dhl: 10, fedex: 9.5, ups: 9.8, ems: 6.5 },
  99: { dhl: 0, fedex: 0, ups: 0, ems: 0 },
}

// Fuel surcharge percentage
const FUEL_SURCHARGE = 0.12

// Estimated delivery days by zone
const DELIVERY_DAYS: Record<number, { express: string; standard: string; economy: string }> = {
  0: { express: '1-2', standard: '2-3', economy: '3-5' },
  1: { express: '3-5', standard: '5-8', economy: '7-14' },
  2: { express: '4-6', standard: '7-10', economy: '10-18' },
  3: { express: '5-8', standard: '8-14', economy: '14-25' },
  99: { express: '-', standard: '-', economy: '-' },
}

/**
 * Calculate dimensional weight (volumetric weight)
 */
export function calculateDimensionalWeight(length: number, width: number, height: number): number {
  // DHL/FedEx: L x W x H / 5000 = kg
  return (length * width * height) / 5000
}

/**
 * Calculate shipping options
 */
export function calculateShipping(
  destinationCountry: string,
  packages: PackageInfo[],
  currency: string = 'USD'
): ShippingOption[] {
  const zone = COUNTRY_ZONES[destinationCountry.toUpperCase()] ?? 3

  if (zone === 99) {
    return []
  }

  // Calculate total weight (use actual or dimensional, whichever is greater)
  let totalWeight = 0
  let totalValue = 0
  for (const pkg of packages) {
    const dimWeight = calculateDimensionalWeight(pkg.length, pkg.width, pkg.height)
    totalWeight += Math.max(pkg.weight, dimWeight)
    totalValue += pkg.value
  }

  // Round up to nearest 0.5kg
  const chargeableWeight = Math.ceil(totalWeight * 2) / 2
  const halfKgUnits = Math.max(0, Math.ceil((chargeableWeight - 0.5) / 0.5))

  const base = BASE_RATES[zone]
  const perKg = PER_HALF_KG[zone]
  const days = DELIVERY_DAYS[zone]

  // Insurance cost: 0.5% of declared value, min $5
  const insuranceCost = Math.max(5, totalValue * 0.005)

  const options: ShippingOption[] = [
    {
      id: 'dhl_express',
      carrier: 'DHL',
      service: 'Express Worldwide',
      cost: Math.round((base.dhl + perKg.dhl * halfKgUnits) * (1 + FUEL_SURCHARGE) * 100) / 100,
      currency: 'USD',
      estimatedDays: days.express,
      tracking: true,
      insurance: true,
    },
    {
      id: 'fedex_priority',
      carrier: 'FedEx',
      service: 'International Priority',
      cost: Math.round((base.fedex + perKg.fedex * halfKgUnits) * (1 + FUEL_SURCHARGE) * 100) / 100,
      currency: 'USD',
      estimatedDays: days.express,
      tracking: true,
      insurance: true,
    },
    {
      id: 'ups_expedited',
      carrier: 'UPS',
      service: 'Worldwide Expedited',
      cost: Math.round((base.ups + perKg.ups * halfKgUnits) * (1 + FUEL_SURCHARGE) * 100) / 100,
      currency: 'USD',
      estimatedDays: days.standard,
      tracking: true,
      insurance: true,
    },
    {
      id: 'ems_postal',
      carrier: 'EMS',
      service: 'Express Mail Service',
      cost: Math.round((base.ems + perKg.ems * halfKgUnits) * (1 + FUEL_SURCHARGE) * 100) / 100,
      currency: 'USD',
      estimatedDays: days.economy,
      tracking: true,
      insurance: false,
    },
  ]

  return options
}

/**
 * Estimate package info from cart items
 */
export function estimatePackageFromItems(items: Array<{ weight?: string; quantity: number }>): PackageInfo {
  // Default package estimate: 0.3kg per item, 20x15x10cm per item
  let totalWeight = 0
  for (const item of items) {
    const w = parseFloat(item.weight || '0.3')
    totalWeight += w * item.quantity
  }
  if (totalWeight < 0.1) totalWeight = 0.3

  return {
    weight: totalWeight,
    length: Math.max(20, Math.min(60, 15 + items.length * 5)),
    width: Math.max(15, Math.min(40, 10 + items.length * 3)),
    height: Math.max(10, Math.min(30, 8 + items.length * 2)),
    value: 0,
  }
}

/**
 * Get list of countries for dropdown
 */
export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'PL', name: 'Poland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'GR', name: 'Greece' },
  { code: 'RU', name: 'Russia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IL', name: 'Israel' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'PH', name: 'Philippines' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'CN', name: 'China' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
]
