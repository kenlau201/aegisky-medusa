/**
 * Admin Dashboard API
 * GET /store/admin
 */
const { getDbClient } = require("../../../lib/db")
const { requireAdmin } = require("../../../lib/admin-auth")

module.exports = {
  GET: async (req, res) => {
    requireAdmin(req, res, async () => {
      const db = getDbClient()

      try {
        const orderStats = await db.query(`
          SELECT COUNT(*) as total_orders,
                 COUNT(CASE WHEN status = 'pending_payment' THEN 1 END) as pending_payment,
                 COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
                 COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
                 COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
                 COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                 COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                 COALESCE(SUM(CASE WHEN status IN ('paid','processing','shipped','completed') THEN total ELSE 0 END), 0) as revenue
          FROM aegisky_orders
        `)

        const productStats = await db.query(`SELECT COUNT(*) as total_products FROM aegisky_products`)
        const rfqStats = await db.query(`SELECT COUNT(*) as total_rfqs FROM aegisky_rfqs`)
        const categoryStats = await db.query(`SELECT COUNT(*) as total_categories FROM aegisky_categories`)
        const brandStats = await db.query(`SELECT COUNT(*) as total_brands FROM aegisky_brands`)

        const recentOrders = await db.query(`
          SELECT id, order_number, customer_name, customer_email, total, currency, status, created_at
          FROM aegisky_orders ORDER BY created_at DESC LIMIT 10
        `)

        return res.json({
          orders: orderStats.rows[0],
          products: productStats.rows[0],
          rfqs: rfqStats.rows[0],
          categories: categoryStats.rows[0],
          brands: brandStats.rows[0],
          recentOrders: recentOrders.rows,
        })
      } catch (error) {
        console.error('Dashboard error:', error)
        return res.status(500).json({ error: 'Internal server error' })
      }
    })
  }
}
