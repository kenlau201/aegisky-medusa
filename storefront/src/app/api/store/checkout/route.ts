import { NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'
import crypto from 'crypto'

export const runtime = 'nodejs'

function generateOrderNumber(): string {
  const date = new Date()
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `ORD-${ymd}-${rand}`
}

function generateOrderId(): string {
  return crypto.randomUUID()
}

export async function POST(request: Request) {
  const client = await pool.connect()
  try {
    const body = await request.json()
    const {
      email, name, company, phone, country,
      items, currency = 'USD',
      shippingAddress, billingAddress,
      shippingMethod, notes,
    } = body

    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Email and items are required' }, { status: 400 })
    }

    // Calculate totals
    let subtotal = 0
    for (const item of items) {
      subtotal += (item.unitPrice || 0) * (item.quantity || 1)
    }

    // Simple shipping calculation based on subtotal
    let shippingAmount = 0
    if (shippingMethod?.includes('express') || shippingMethod?.includes('Express')) {
      shippingAmount = subtotal > 500 ? 29.99 : 49.99
    } else if (shippingMethod?.includes('premium') || shippingMethod?.includes('Premium')) {
      shippingAmount = subtotal > 1000 ? 49.99 : 99.99
    } else {
      // Standard
      shippingAmount = subtotal > 200 ? 0 : 19.99
    }

    const taxAmount = 0 // Tax handled by compliance/customs separately
    const discountAmount = 0
    const total = subtotal + shippingAmount + taxAmount - discountAmount

    const orderId = generateOrderId()
    const orderNumber = generateOrderNumber()

    await client.query('BEGIN')

    // Insert order
    await client.query(
      `INSERT INTO aegisky_orders (
        id, order_number, customer_email, customer_name, customer_company,
        customer_phone, customer_country, subtotal, tax_amount, shipping_amount,
        discount_amount, total, currency, status, payment_status, fulfillment_status,
        shipping_address, billing_address, shipping_method, notes, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending','unpaid','unfulfilled',$14,$15,$16,$17,NOW(),NOW())`,
      [
        orderId, orderNumber, email.toLowerCase().trim(),
        name || null, company || null, phone || null, country || null,
        subtotal, taxAmount, shippingAmount, discountAmount, total, currency,
        JSON.stringify(shippingAddress || {}),
        JSON.stringify(billingAddress || shippingAddress || {}),
        shippingMethod || 'standard',
        notes || null,
      ]
    )

    // Insert order items
    for (const item of items) {
      const unitPrice = item.unitPrice || 0
      const quantity = item.quantity || 1
      await client.query(
        `INSERT INTO aegisky_order_items (
          id, order_id, product_id, product_slug, product_name, sku,
          quantity, unit_price, total_price, created_at
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          orderId,
          item.productId ? parseInt(item.productId) : null,
          item.productSlug || null,
          item.productName || 'Unknown Product',
          item.sku || null,
          quantity,
          unitPrice,
          unitPrice * quantity,
        ]
      )
    }

    // Try to find or create customer record
    const existingCustomer = await client.query(
      'SELECT id FROM aegisky_customers WHERE email = $1',
      [email.toLowerCase().trim()]
    )
    let customerId = existingCustomer.rows[0]?.id
    if (!customerId) {
      const nameParts = (name || '').trim().split(/\s+/)
      const newCust = await client.query(
        `INSERT INTO aegisky_customers (email, password_hash, first_name, last_name, company, phone, country, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'buyer', 'active')
         RETURNING id`,
        [
          email.toLowerCase().trim(),
          '__guest_no_password__', // Guest checkout - no password
          nameParts[0] || null,
          nameParts.slice(1).join(' ') || null,
          company || null,
          phone || null,
          country || null,
        ]
      )
      customerId = newCust.rows[0].id
    }

    // Update order with customer_id
    await client.query(
      'UPDATE aegisky_orders SET customer_id = $1 WHERE id = $2',
      [customerId, orderId]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      total,
      currency,
      metadata: {
        rateSnapshot: {
          lockedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      },
    })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 })
  } finally {
    client.release()
  }
}
