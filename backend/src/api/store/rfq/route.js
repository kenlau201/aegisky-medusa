const { getDbClient } = require("../../../lib/db")

module.exports = {
  POST: async (req, res) => {
    const client = getDbClient()
    const body = req.body

    try {
      const { customerEmail, customerName, company, country, phone, message, items } = body

      if (!customerEmail || !customerName) {
        return res.status(400).json({ error: 'Email and name are required' })
      }

      const result = await client.query(
        `INSERT INTO aegisky_rfqs (customer_email, customer_name, company, country, phone, message, items)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, created_at`,
        [
          customerEmail,
          customerName,
          company || null,
          country || null,
          phone || null,
          message || null,
          JSON.stringify(items || [])
        ]
      )

      res.status(201).json({
        success: true,
        rfqId: result.rows[0].id,
        message: 'RFQ submitted successfully'
      })
    } catch (error) {
      console.error('RFQ submission error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  GET: async (req, res) => {
    const client = getDbClient()

    try {
      const result = await client.query(
        'SELECT * FROM aegisky_rfqs ORDER BY created_at DESC LIMIT 100'
      )
      res.json({ rfqs: result.rows })
    } catch (error) {
      console.error('RFQ list error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
