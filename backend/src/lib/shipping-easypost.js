/**
 * EasyPost Shipping Service
 * Sprint 3 Globalization & Logistics
 *
 * DHL/FedEx/UPS real-time shipping rates via EasyPost API
 * Free tier: 120,000 requests/year
 *
 * Set EASYPOST_API_KEY in .env for production
 */

const EASYPOST_API_KEY = process.env.EASYPOST_API_KEY || ''
const IS_TEST_MODE = !EASYPOST_API_KEY

// Warehouse origin (Hong Kong - major drone parts hub)
const ORIGIN_ADDRESS = {
  street1: 'Unit 1208, 12/F',
  street2: 'Cyberport 3',
  city: 'Hong Kong',
  state: 'HK',
  zip: '000000',
  country: 'HK',
  company: 'Aegisky Fulfillment',
  phone: '+852-1234-5678',
}

/**
 * Get shipping rates from EasyPost
 * Falls back to static rates if API key not configured
 */
async function getShippingRates(details) {
  if (IS_TEST_MODE) {
    return getStaticRates(details)
  }

  try {
    // Create shipment via EasyPost API
    const response = await fetch('https://api.easypost.com/v2/shipments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(EASYPOST_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shipment: {
          to_address: details.toAddress,
          from_address: ORIGIN_ADDRESS,
          parcels: details.parcels.map(p => ({
            weight: p.weight,
            length: p.length || 20,
            width: p.width || 15,
            height: p.height || 10,
          })),
        }
      }),
    })

    if (!response.ok) {
      console.error('EasyPost API error:', await response.text())
      return getStaticRates(details)
    }

    const data = await response.json()

    return (data.rates || []).map(rate => ({
      id: rate.id,
      carrier: rate.carrier,
      service: rate.service,
      serviceName: `${rate.carrier} ${rate.service}`,
      rate: parseFloat(rate.rate),
      currency: rate.currency,
      transitDays: rate.est_delivery_days || null,
      deliveryDate: rate.delivery_date,
    }))

  } catch (error) {
    console.error('EasyPost service error:', error)
    return getStaticRates(details)
  }
}

/**
 * Static fallback rates (development / no API key)
 */
function getStaticRates(details) {
  const totalWeight = details.parcels.reduce((sum, p) => sum + p.weight, 0)
  const country = details.toAddress.country.toUpperCase()

  // Base rates by region
  const regionalRates = {
    US: { dhl: 45, fedex: 42, ups: 40, days: 5 },
    CA: { dhl: 48, fedex: 45, ups: 43, days: 6 },
    GB: { dhl: 40, fedex: 38, ups: 36, days: 4 },
    DE: { dhl: 38, fedex: 35, ups: 34, days: 4 },
    FR: { dhl: 38, fedex: 36, ups: 35, days: 5 },
    AU: { dhl: 50, fedex: 48, ups: 46, days: 7 },
    JP: { dhl: 35, fedex: 32, ups: 30, days: 3 },
    CN: { dhl: 20, fedex: 18, ups: 15, days: 2 },
    HK: { dhl: 15, fedex: 12, ups: 10, days: 1 },
    RU: { dhl: 55, fedex: 52, ups: 50, days: 7 },
    AE: { dhl: 42, fedex: 40, ups: 38, days: 5 },
    SA: { dhl: 45, fedex: 43, ups: 41, days: 6 },
    BR: { dhl: 60, fedex: 58, ups: 55, days: 8 },
    IN: { dhl: 38, fedex: 35, ups: 33, days: 5 },
  }

  const region = regionalRates[country] || { dhl: 55, fedex: 52, ups: 50, days: 7 }

  // Weight multiplier: base for 500g, +$2 per 500g
  const weightMultiplier = Math.max(1, Math.ceil(totalWeight / 500))
  const weightSurcharge = (weightMultiplier - 1) * 2

  return [
    {
      id: 'static-dhl-express',
      carrier: 'DHL',
      service: 'ExpressWorldwide',
      serviceName: 'DHL Express Worldwide',
      rate: region.dhl + weightSurcharge,
      currency: 'USD',
      transitDays: region.days,
    },
    {
      id: 'static-fedex-ip',
      carrier: 'FedEx',
      service: 'InternationalPriority',
      serviceName: 'FedEx International Priority',
      rate: region.fedex + weightSurcharge,
      currency: 'USD',
      transitDays: region.days + 1,
    },
    {
      id: 'static-ups-saver',
      carrier: 'UPS',
      service: 'ExpressSaver',
      serviceName: 'UPS Express Saver',
      rate: region.ups + weightSurcharge,
      currency: 'USD',
      transitDays: region.days + 2,
    },
    {
      id: 'static-ems',
      carrier: 'EMS',
      service: 'International',
      serviceName: 'EMS International (Economy)',
      rate: Math.round((region.dhl - 15) * 100) / 100,
      currency: 'USD',
      transitDays: region.days + 7,
    },
  ]
}

/**
 * Buy a shipping label (for fulfillment)
 */
async function buyLabel(rateId) {
  if (IS_TEST_MODE) {
    return {
      labelUrl: `https://example.com/labels/test-${Date.now()}.pdf`,
      trackingCode: `TEST${Date.now().toString().slice(-10)}`,
    }
  }

  try {
    const response = await fetch(`https://api.easypost.com/v2/shipments/buy`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(EASYPOST_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rate: { id: rateId },
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    return {
      labelUrl: data.postage_label?.label_url || '',
      trackingCode: data.tracking_code || '',
    }
  } catch (error) {
    console.error('Buy label error:', error)
    return null
  }
}

/**
 * Track a shipment
 */
async function trackShipment(trackingCode, carrier) {
  if (IS_TEST_MODE) {
    return {
      status: 'in_transit',
      events: [
        { status: 'picked_up', location: 'Hong Kong', time: new Date(Date.now() - 86400000).toISOString() },
        { status: 'in_transit', location: 'Sort Facility', time: new Date().toISOString() },
      ],
    }
  }

  try {
    const response = await fetch(`https://api.easypost.com/v2/trackers`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(EASYPOST_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracker: { tracking_code: trackingCode, carrier },
      }),
    })
    return response.ok ? await response.json() : null
  } catch (error) {
    return null
  }
}

module.exports = {
  getShippingRates,
  buyLabel,
  trackShipment,
  ORIGIN_ADDRESS,
}
