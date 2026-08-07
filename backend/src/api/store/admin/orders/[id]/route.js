/**
 * Admin Order Detail API
 * GET /store/admin/orders/:id
 * PATCH /store/admin/orders/:id
 */
const { getDbClient } = require("../../../../../lib/db")
const { transitionOrder, canTransition } = require("../../../../../lib/order-state-machine")
const { requireAdmin } = require("../../../../../lib/admin-auth")

module.exports = {
  GET: async (req, res) => {
    requireAdmin(req, res, async () => {
    const db = getDbClient()
    const { id } = req.params

    try {
      const orderResult = await db.query('SELECT * FROM aegisky_orders WHERE id = $1', [id])
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' })
      }

      const itemsResult = await db.query('SELECT * FROM aegisky_order_items WHERE order_id = $1', [id])
      const paymentsResult = await db.query('SELECT * FROM aegisky_payments WHERE order_id = $1 ORDER BY created_at DESC', [id])
      const compResult = await db.query('SELECT * FROM aegisky_compensation_log WHERE order_id = $1 ORDER BY created_at DESC', [id])

      return res.json({
        order: orderResult.rows[0],
        items: itemsResult.rows,
        payments: paymentsResult.rows,
        compensationLogs: compResult.rows,
      })
    } catch (error) {
      console.error('Admin order detail error:', error)
      return res.status(500).json({ error: 'Failed to fetch order' })
    }
    })
  },

  PATCH: async (req, res) => {
    requireAdmin(req, res, async () => {
    const db = getDbClient()
    const { id } = req.params
    const { status, total, adminNotes, trackingNumber, compensationResolution } = req.body

    try {
      const orderResult = await db.query('SELECT * FROM aegisky_orders WHERE id = $1', [id])
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' })
      }

      if (status) {
        if (!canTransition(orderResult.rows[0].status, status)) {
          return res.status(400).json({ error: `Invalid transition from ${orderResult.rows[0].status} to ${status}` })
        }
        await transitionOrder(db, id, status, adminNotes || 'Admin action', { adminUpdated: true })
      }

      const updates = []
      const values = []
      let paramIdx = 1

      if (total !== undefined) {
        updates.push(`total = $${paramIdx++}`)
        values.push(total)
      }
      if (adminNotes !== undefined) {
        updates.push(`admin_notes = $${paramIdx++}`)
        values.push(adminNotes)
      }
      if (trackingNumber !== undefined) {
        updates.push(`tracking_number = $${paramIdx++}`)
        values.push(trackingNumber)
      }

      if (compensationResolution) {
        await db.query(
          `UPDATE aegisky_compensation_log SET status = 'resolved', resolution = $2, resolved_at = NOW(), resolved_by = 'admin'
           WHERE order_id = $1 AND status = 'pending'`,
          [id, compensationResolution]
        )
      }

      if (updates.length > 0) {
        values.push(id)
        await db.query(
          `UPDATE aegisky_orders SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIdx}`,
          values
        )
      }

      return res.json({ success: true, message: 'Order updated' })
    } catch (error) {
      console.error('Admin order update error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
    })
  }
}
