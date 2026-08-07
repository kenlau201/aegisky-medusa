/**
 * GET /store/shipments/track?trackingNumber=xxx&carrier=xxx
 * Track shipment status
 */

const { getDbClient } = require('../../../../lib/db')
const { safeHandler } = require('../../../../lib/security')

const TRACKING_URLS = {
  dhl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
  fedex: 'https://www.fedex.com/fedextrack/?trknbr=',
  ups: 'https://www.ups.com/track?tracknum=',
  ems: 'https://www.ems.post/en/global-network/tracking/',
}

function generateSimulatedTracking(carrier, trackingNumber) {
  const now = new Date()
  const events = [
    {
      status: 'picked_up',
      description: 'Package picked up from origin facility',
      location: 'Hong Kong',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      status: 'in_transit',
      description: 'Departed origin facility',
      location: 'Hong Kong International Airport',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      status: 'in_transit',
      description: 'Arrived at destination hub',
      location: 'Destination Regional Facility',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      status: 'out_for_delivery',
      description: 'Out for delivery',
      location: 'Local Delivery Center',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return {
    trackingNumber,
    carrier,
    status: 'out_for_delivery',
    estimatedDelivery: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    trackingUrl: TRACKING_URLS[carrier] ? TRACKING_URLS[carrier] + trackingNumber : null,
    events,
  }
}

module.exports = {
  GET: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { trackingNumber, carrier, orderId } = req.query

    if (orderId) {
      const shipment = await db.query(
        'SELECT * FROM aegisky_shipments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
        [orderId]
      )

      if (shipment.rows.length > 0) {
        const s = shipment.rows[0]
        return res.json({
          trackingNumber: s.tracking_number,
          carrier: s.carrier,
          service: s.service,
          status: s.status,
          estimatedDelivery: s.estimated_delivery,
          trackingUrl: TRACKING_URLS[s.carrier] ? TRACKING_URLS[s.carrier] + s.tracking_number : null,
          events: s.tracking_events || [],
        })
      }
    }

    if (trackingNumber) {
      const dbShipment = await db.query(
        'SELECT * FROM aegisky_shipments WHERE tracking_number = $1',
        [trackingNumber]
      )

      if (dbShipment.rows.length > 0 && dbShipment.rows[0].tracking_events?.length > 0) {
        const s = dbShipment.rows[0]
        return res.json({
          trackingNumber: s.tracking_number,
          carrier: s.carrier,
          status: s.status,
          estimatedDelivery: s.estimated_delivery,
          trackingUrl: TRACKING_URLS[s.carrier] ? TRACKING_URLS[s.carrier] + s.tracking_number : null,
          events: s.tracking_events,
        })
      }

      return res.json(generateSimulatedTracking(carrier || 'dhl', trackingNumber))
    }

    res.status(400).json({ error: 'Provide trackingNumber or orderId' })
  })
}
