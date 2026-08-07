/**
 * PATCH /store/admin/payment-proofs/:id
 * Approve or reject wire transfer proof
 */

const { getDbClient } = require('../../../../../lib/db')
const { markOrderPaid } = require('../../../../../lib/order-state-machine')
const { safeHandler, AppError } = require('../../../../../lib/security')
const { requireAdmin } = require('../../../../../lib/admin-auth')

module.exports = {
  PATCH: (req, res) => {
    requireAdmin(req, res, () => safeHandler(async (req, res) => {
      const db = getDbClient()
      const { id } = req.params
      const { action, reviewNotes } = req.body

      if (!['approve', 'reject'].includes(action)) {
        throw new AppError('VALIDATION_ERROR', 'Action must be approve or reject', 400)
      }

      const proofResult = await db.query(
        'SELECT * FROM aegisky_payment_proofs WHERE id = $1',
        [id]
      )
      if (proofResult.rows.length === 0) {
        throw new AppError('NOT_FOUND', 'Payment proof not found', 404)
      }
      const proof = proofResult.rows[0]

      const now = new Date()

      if (action === 'approve') {
        await db.query(`
          UPDATE aegisky_payment_proofs
          SET status = 'approved', reviewed_at = $1, review_notes = $2, updated_at = NOW()
          WHERE id = $3
        `, [now, reviewNotes, id])

        await markOrderPaid(db, proof.order_id, {
          method: 'wire_transfer',
          proofId: id,
          amount: proof.amount,
          currency: proof.currency,
        })
      } else {
        await db.query(`
          UPDATE aegisky_payment_proofs
          SET status = 'rejected', reviewed_at = $1, review_notes = $2, updated_at = NOW()
          WHERE id = $3
        `, [now, reviewNotes, id])

        await db.query(`
          UPDATE aegisky_orders
          SET payment_status = 'failed',
              status = 'pending_payment',
              admin_notes = COALESCE(admin_notes, '') || $2,
              updated_at = NOW()
          WHERE id = $1
        `, [proof.order_id, `\n[${now.toISOString()}] Wire transfer proof rejected: ${reviewNotes || 'No notes'}`])
      }

      res.json({
        success: true,
        status: action === 'approve' ? 'approved' : 'rejected',
        message: `Payment proof ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      })
    })(req, res))
  }
}
