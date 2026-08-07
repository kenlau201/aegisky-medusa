/**
 * GET /store/orders
 * List orders for a customer (by email)
 */
const { getDbClient } = require('../../../lib/db')

export async function GET(req) {
  const db = getDbClient()

  try {
    const url = new URL(req.url)
    const email = url.searchParams.get('email')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get orders
    const ordersResult = await db.query(
      `SELECT id, order_number, total, currency, status, payment_status,
              fulfillment_status, created_at, paid_at, shipped_at
       FROM aegisky_orders
       WHERE customer_email = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [email, limit, offset]
    )

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM aegisky_orders WHERE customer_email = $1',
      [email]
    )

    // Get items for each order
    const orders = []
    for (const order of ordersResult.rows) {
      const itemsResult = await db.query(
        `SELECT product_name, sku, quantity, unit_price, total_price
         FROM aegisky_order_items WHERE order_id = $1`,
        [order.id]
      )
      orders.push({
        ...order,
        items: itemsResult.rows,
      })
    }

    return Response.json({
      orders,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      }
    })

  } catch (error) {
    console.error('Get orders error:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
