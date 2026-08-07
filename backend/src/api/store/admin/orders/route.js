/**
 * Admin Orders API
 * GET /store/admin/orders
 */
const { getDbClient } = require("../../../../lib/db")
const { requireAdmin } = require("../../../../lib/admin-auth")

module.exports = {
  GET: async (req, res) => {
    requireAdmin(req, res, async () => {
      const db = getDbClient()

    try {
      const status = req.query.status
      const search = req.query.search
      const page = Math.max(1, parseInt(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
      const offset = (page - 1) * limit

      let whereConditions = []
      let params = []
      let paramIdx = 1

      if (status) {
        whereConditions.push(`status = $${paramIdx++}`)
        params.push(status)
      }

      if (search) {
        whereConditions.push(`(order_number ILIKE $${paramIdx} OR customer_email ILIKE $${paramIdx} OR customer_name ILIKE $${paramIdx})`)
        params.push(`%${search}%`)
        paramIdx++
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

      const ordersResult = await db.query(
        `SELECT id, order_number, customer_email, customer_name, customer_company,
                total, currency, status, payment_status, fulfillment_status, created_at
         FROM aegisky_orders
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, limit, offset]
      )

      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM aegisky_orders ${whereClause}`,
        params
      )

      return res.json({
        orders: ordersResult.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit),
        }
      })
    } catch (error) {
      console.error('Admin orders error:', error)
      return res.status(500).json({ error: 'Failed to fetch orders' })
    }
    })
  }
}
