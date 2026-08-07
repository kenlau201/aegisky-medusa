/**
 * POST /store/shipping/rates
 * Get real-time shipping rates from EasyPost
 */
const { getShippingRates } = require('../../../../lib/shipping-easypost')

module.exports = {
  POST: async (req, res) => {
    try {
      const { address, items } = req.body || {}

      if (!address || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Address and items are required' })
      }

      // Calculate total weight from items
      const parcels = items.map(item => ({
        weight: Math.max(100, (item.weight || 500) * item.quantity), // grams, min 100g
        length: item.length || 20,
        width: item.width || 15,
        height: item.height || 10,
      }))

      const rates = await getShippingRates({
        toAddress: {
          name: address.fullName || address.name,
          company: address.company,
          street1: address.address,
          city: address.city,
          state: address.state,
          zip: address.zipCode,
          country: address.country,
          phone: address.phone,
          email: address.email,
        },
        parcels,
      })

      return res.status(200).json({
        rates,
        origin: 'Hong Kong',
        currency: 'USD',
      })

    } catch (error) {
      console.error('Shipping rates error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
