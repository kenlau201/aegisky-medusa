/**
 * GET /store/orders/:id
 * Get order details
 */
const { getDbClient } = require('../../../../lib/db')

export async function GET(req, { params }) {
  const db = getDbClient()

  try {
    const { id } = params

    // Get order
    const orderResult = await db.query(
      'SELECT * FROM aegisky_orders WHERE id = $1',
      [id]
    )

    if (orderResult.rows.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderResult.rows[0]

    // Get items
    const itemsResult = await db.query(
      'SELECT * FROM aegisky_order_items WHERE order_id = $1',
      [id]
    )

    // Get payments
    const paymentsResult = await db.query(
      'SELECT id, provider, amount, currency, status, created_at, stripe_receipt_url FROM aegisky_payments WHERE order_id = $1 ORDER BY created_at DESC',
      [id]
    )

    return Response.json({
      order: {
        ...order,
        items: itemsResult.rows,
        payments: paymentsResult.rows,
      }
    })

  } catch (error) {
    console.error('Get order error:', error)
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
