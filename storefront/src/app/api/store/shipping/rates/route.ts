import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Shipping rate calculation based on destination and order weight/value
// Returns rates in USD (EasyPost-compatible format)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { address, items } = body

    const country = address?.country || 'US'

    // Calculate total weight in grams
    let totalWeightGrams = 0
    let totalItems = 0
    if (items && Array.isArray(items)) {
      for (const item of items) {
        totalWeightGrams += (item.weight || 500) * (item.quantity || 1)
        totalItems += item.quantity || 1
      }
    }

    // Base rates by region (USD)
    const isDomestic = country === 'US' || country === 'CN'
    const isEurope = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'SE', 'NO', 'DK', 'FI', 'AT', 'CH', 'IE', 'PT'].includes(country)
    const isAsiaPacific = ['JP', 'KR', 'AU', 'NZ', 'SG', 'HK', 'TW', 'TH', 'MY', 'ID', 'PH', 'VN', 'IN'].includes(country)
    const isMiddleEast = ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'IL', 'TR'].includes(country)
    const isLatinAmerica = ['BR', 'MX', 'AR', 'CL', 'CO', 'PE'].includes(country)
    const isAfrica = ['ZA', 'EG', 'NG', 'KE'].includes(country)

    // Weight multiplier (heavier = more expensive)
    const weightKg = totalWeightGrams / 1000
    const weightMultiplier = Math.max(1, weightKg / 2) // 2kg base

    let standardRate: number, expressRate: number, premiumRate: number

    if (isDomestic) {
      standardRate = 9.99
      expressRate = 24.99
      premiumRate = 49.99
    } else if (isEurope) {
      standardRate = 19.99 * weightMultiplier
      expressRate = 44.99 * weightMultiplier
      premiumRate = 79.99 * weightMultiplier
    } else if (isAsiaPacific) {
      standardRate = 17.99 * weightMultiplier
      expressRate = 39.99 * weightMultiplier
      premiumRate = 69.99 * weightMultiplier
    } else if (isMiddleEast) {
      standardRate = 24.99 * weightMultiplier
      expressRate = 54.99 * weightMultiplier
      premiumRate = 99.99 * weightMultiplier
    } else if (isLatinAmerica) {
      standardRate = 29.99 * weightMultiplier
      expressRate = 64.99 * weightMultiplier
      premiumRate = 119.99 * weightMultiplier
    } else if (isAfrica) {
      standardRate = 34.99 * weightMultiplier
      expressRate = 74.99 * weightMultiplier
      premiumRate = 139.99 * weightMultiplier
    } else {
      // Rest of world
      standardRate = 27.99 * weightMultiplier
      expressRate = 59.99 * weightMultiplier
      premiumRate = 109.99 * weightMultiplier
    }

    // Free shipping over $200 for standard
    const rates = [
      {
        id: 'standard',
        carrier: 'Aegisky Logistics',
        service: 'Standard International',
        serviceName: 'Standard International',
        rate: standardRate,
        currency: 'USD',
        transitDays: isDomestic ? 3 : (isEurope || isAsiaPacific ? 7 : 14),
        estimatedDays: isDomestic ? '2-4' : (isEurope || isAsiaPacific ? '5-10' : '10-21'),
      },
      {
        id: 'express',
        carrier: 'DHL Express',
        service: 'Express Worldwide',
        serviceName: 'DHL Express Worldwide',
        rate: expressRate,
        currency: 'USD',
        transitDays: isDomestic ? 1 : 3,
        estimatedDays: isDomestic ? '1-2' : '2-5',
      },
      {
        id: 'premium',
        carrier: 'FedEx Priority',
        service: 'International Priority',
        serviceName: 'FedEx International Priority',
        rate: premiumRate,
        currency: 'USD',
        transitDays: isDomestic ? 1 : 2,
        estimatedDays: isDomestic ? '1' : '1-3',
      },
    ]

    return NextResponse.json({
      success: true,
      rates,
      address: { country },
      shipment: {
        totalWeightGrams,
        totalItems,
      },
    })
  } catch (error: any) {
    console.error('Shipping rates error:', error)
    return NextResponse.json({ error: error.message || 'Failed to calculate shipping rates' }, { status: 500 })
  }
}
