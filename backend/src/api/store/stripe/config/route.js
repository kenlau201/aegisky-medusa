/**
 * GET /store/stripe/config
 * Return Stripe publishable key for frontend
 */
const { getPublishableKey, IS_TEST_MODE } = require('../../../../lib/stripe')

module.exports = {
  GET: async (req, res) => {
    try {
      const publishableKey = getPublishableKey()
      return res.status(200).json({
        publishableKey,
        isTestMode: IS_TEST_MODE,
      })
    } catch (error) {
      console.error('Stripe config error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
