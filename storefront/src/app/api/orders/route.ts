import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ orders: [] })
    }

    // Get orders for this customer
    const ordersResult = await pool.query(
      `SELECT id, order_number, total, currency, status, payment_status,
              fulfillment_status, created_at, shipping_method, shipping_amount
       FROM aegisky_orders
       WHERE customer_email = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [email.toLowerCase().trim()]
    )

    // Get items for each order
    const orders = []
    for (const order of ordersResult.rows) {
      const itemsResult = await pool.query(
        `SELECT product_name, quantity, unit_price, product_slug
         FROM aegisky_order_items
         WHERE order_id = $1`,
        [order.id]
      )

      orders.push({
        id: order.id,
        order_number: order.order_number,
        total: Number(order.total),
        currency: order.currency,
        status: order.status,
        payment_status: order.payment_status,
        fulfillment_status: order.fulfillment_status,
        created_at: order.created_at,
        shipping_method: order.shipping_method,
        shipping_amount: Number(order.shipping_amount),
        items: itemsResult.rows.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          product_slug: item.product_slug,
        })),
      })
    }

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Get customer orders error:', error)
    return NextResponse.json({ orders: [], error: error.message })
  }
}
