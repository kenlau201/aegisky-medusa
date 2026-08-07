/**
 * POST /store/payments/wire-proof
 * Submit wire transfer / T/T payment proof for manual review
 */

const { getDbClient } = require('../../../../lib/db')
const { safeHandler, AppError } = require('../../../../lib/security')

module.exports = {
  POST: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { orderId, amount, currency, bankReference, senderName, senderBank, notes } = req.body

    if (!orderId) throw new AppError('VALIDATION_ERROR', 'Order ID is required', 400)
    if (!amount || amount <= 0) throw new AppError('VALIDATION_ERROR', 'Valid amount is required', 400)

    // Verify order exists
    const order = await db.query('SELECT id, order_number, total, currency, status FROM aegisky_orders WHERE id = $1', [orderId])
    if (order.rows.length === 0) throw new AppError('NOT_FOUND', 'Order not found', 404)

    // Create payment proof record
    const result = await db.query(`
      INSERT INTO aegisky_payment_proofs (
        order_id, proof_type, amount, currency,
        bank_reference, sender_name, sender_bank, notes, status
      ) VALUES ($1, 'wire_transfer', $2, $3, $4, $5, $6, $7, 'submitted')
      RETURNING id, created_at
    `, [orderId, amount, currency || 'USD', bankReference, senderName, senderBank, notes])

    // Update order status
    await db.query(`
      UPDATE aegisky_orders
      SET payment_status = 'pending_verification',
          status = CASE WHEN status = 'pending_payment' THEN 'processing' ELSE status END,
          admin_notes = COALESCE(admin_notes, '') || $2,
          updated_at = NOW()
      WHERE id = $1
    `, [orderId, `\n[${new Date().toISOString()}] Wire transfer proof submitted (ID: ${result.rows[0].id}). Awaiting verification.`])

    res.status(201).json({
      success: true,
      proofId: result.rows[0].id,
      status: 'submitted',
      message: 'Payment proof submitted successfully. Our team will verify and confirm within 24-48 hours.',
    })
  })
}
