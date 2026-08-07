/**
 * GET /store/admin/payment-proofs - List payment proofs
 * PATCH /store/admin/payment-proofs/:id - Approve/reject payment proof
 */

const { getDbClient } = require('../../../../lib/db')
const { safeHandler, AppError } = require('../../../../lib/security')
const { requireAdmin } = require('../../../../lib/admin-auth')

module.exports = {
  GET: (req, res) => {
    requireAdmin(req, res, () => safeHandler(async (req, res) => {
      const db = getDbClient()
      const { status, page = 1, limit = 20 } = req.query
      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20))
      const safePage = Math.max(1, Number(page) || 1)
      const offset = (safePage - 1) * safeLimit

      let query = `
        SELECT p.*, o.order_number, o.customer_name, o.customer_email, o.total as order_total
        FROM aegisky_payment_proofs p
        JOIN aegisky_orders o ON p.order_id = o.id
      `
      const params = []
      if (status) {
        query += ' WHERE p.status = $1'
        params.push(status)
      }
      query += ' ORDER BY p.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
      params.push(safeLimit, offset)

      const result = await db.query(query, params)

      res.json({ proofs: result.rows, page: safePage, limit: safeLimit })
    })(req, res))
  }
}
