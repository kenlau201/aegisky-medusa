/**
 * Aegisky Medusa - Order State Machine
 * 
 * States:
 * - draft: Order created, not yet submitted
 * - pending_payment: Awaiting payment
 * - paid: Payment received, awaiting processing
 * - processing: Order being prepared
 * - shipped: Order shipped
 * - delivered: Order delivered
 * - completed: Order finalized
 * - cancelled: Order cancelled
 * - refunded: Payment refunded
 * - compensation_pending: Anomaly detected, manual review required
 * 
 * Special: compensation_pending prevents automatic refunds
 * to avoid losing Stripe fees on failed orders.
 */

const ORDER_STATES = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  COMPENSATION_PENDING: 'compensation_pending',
}

const PAYMENT_STATES = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
}

const FULFILLMENT_STATES = {
  UNFULFILLED: 'unfulfilled',
  PARTIALLY_FULFILLED: 'partially_fulfilled',
  FULFILLED: 'fulfilled',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
}

// Valid state transitions
const STATE_TRANSITIONS = {
  [ORDER_STATES.DRAFT]: [ORDER_STATES.PENDING_PAYMENT, ORDER_STATES.CANCELLED],
  [ORDER_STATES.PENDING_PAYMENT]: [ORDER_STATES.PAID, ORDER_STATES.CANCELLED, ORDER_STATES.COMPENSATION_PENDING],
  [ORDER_STATES.PAID]: [ORDER_STATES.PROCESSING, ORDER_STATES.REFUNDED, ORDER_STATES.COMPENSATION_PENDING],
  [ORDER_STATES.PROCESSING]: [ORDER_STATES.SHIPPED, ORDER_STATES.REFUNDED, ORDER_STATES.COMPENSATION_PENDING],
  [ORDER_STATES.SHIPPED]: [ORDER_STATES.DELIVERED, ORDER_STATES.COMPENSATION_PENDING],
  [ORDER_STATES.DELIVERED]: [ORDER_STATES.COMPLETED, ORDER_STATES.COMPENSATION_PENDING],
  [ORDER_STATES.COMPLETED]: [ORDER_STATES.REFUNDED],
  [ORDER_STATES.COMPENSATION_PENDING]: [ORDER_STATES.PROCESSING, ORDER_STATES.REFUNDED, ORDER_STATES.CANCELLED, ORDER_STATES.COMPLETED],
  [ORDER_STATES.CANCELLED]: [],
  [ORDER_STATES.REFUNDED]: [],
}

/**
 * Check if a state transition is valid
 */
function canTransition(from, to) {
  const allowed = STATE_TRANSITIONS[from] || []
  return allowed.includes(to)
}

/**
 * Transition order state with validation and logging
 * @param {object} db - Database client
 * @param {string} orderId 
 * @param {string} newState 
 * @param {string} reason 
 * @param {object} metadata 
 */
async function transitionOrder(db, orderId, newState, reason = '', metadata = {}) {
  // Get current order
  const orderResult = await db.query(
    'SELECT id, status, total, customer_email FROM aegisky_orders WHERE id = $1',
    [orderId]
  )

  if (orderResult.rows.length === 0) {
    throw new Error(`Order ${orderId} not found`)
  }

  const order = orderResult.rows[0]
  const oldState = order.status

  if (!canTransition(oldState, newState)) {
    throw new Error(`Invalid transition from ${oldState} to ${newState} for order ${orderId}`)
  }

  // Build update
  const updates = ['status = $2', 'updated_at = NOW()']
  const values = [orderId, newState]
  let paramIndex = 3

  if (newState === ORDER_STATES.PAID) {
    updates.push('paid_at = NOW()')
  }
  if (newState === ORDER_STATES.SHIPPED) {
    updates.push('shipped_at = NOW()')
  }
  if (newState === ORDER_STATES.COMPLETED) {
    updates.push('completed_at = NOW()')
  }
  if (newState === ORDER_STATES.CANCELLED) {
    updates.push('cancelled_at = NOW()')
  }
  if (newState === ORDER_STATES.COMPENSATION_PENDING) {
    updates.push(`compensation_reason = $${paramIndex}`)
    values.push(reason)
    paramIndex++
  }

  values.push(JSON.stringify(metadata))
  updates.push(`metadata = metadata || $${paramIndex}::jsonb`)

  await db.query(
    `UPDATE aegisky_orders SET ${updates.join(', ')} WHERE id = $1`,
    values
  )

  console.log(`[Order ${orderId}] State: ${oldState} → ${newState} (${reason})`)

  // Side effects based on new state
  await handleStateChange(db, orderId, oldState, newState, reason)

  return { success: true, oldState, newState }
}

/**
 * Handle side effects of state changes
 */
async function handleStateChange(db, orderId, oldState, newState, reason) {
  const { releaseOrderReservations } = require('./stock-lock')

  switch (newState) {
    case ORDER_STATES.CANCELLED:
    case ORDER_STATES.REFUNDED:
      // Release stock reservations
      await releaseOrderReservations(orderId)
      break

    case ORDER_STATES.COMPENSATION_PENDING:
      // Log compensation event for admin review
      await db.query(
        `INSERT INTO aegisky_compensation_log (order_id, type, severity, description, error_details)
         VALUES ($1, $2, 'critical', $3, $4)`,
        [
          orderId,
          'order_anomaly',
          `Order transitioned to compensation_pending: ${reason}`,
          { oldState, newState, reason }
        ]
      )
      // TODO: Send notification to admin email/Slack
      console.log(`🚨 [Order ${orderId}] COMPENSATION REQUIRED: ${reason}`)
      break
  }
}

/**
 * Generate unique order number
 */
async function generateOrderNumber(db) {
  const result = await db.query("SELECT nextval('order_number_seq') as num")
  const num = result.rows[0].num
  return `AGS-${new Date().getFullYear()}-${String(num).padStart(6, '0')}`
}

/**
 * Create a new order from cart/RFQ
 */
async function createOrder(db, {
  customerEmail,
  customerId,
  customerName,
  customerCompany,
  customerPhone,
  customerCountry,
  items,
  currency = 'USD',
  shippingAddress,
  billingAddress,
  rfqId,
  quoteId,
  quoteVersion,
  notes,
  metadata,
}) {
  // Calculate totals
  let subtotal = 0
  for (const item of items) {
    subtotal += Number(item.unitPrice) * item.quantity
  }

  const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const orderNumber = await generateOrderNumber(db)

  // Start transaction
  await db.query('BEGIN')

  try {
    // Create order
    await db.query(
      `INSERT INTO aegisky_orders 
       (id, order_number, customer_email, customer_id, customer_name, customer_company,
        customer_phone, customer_country, subtotal, total, currency,
        shipping_address, billing_address, rfq_id, quote_id, quote_version, notes, metadata, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10,$11,$12,$13,$14,$15,$16,$17,'draft')`,
      [
        orderId, orderNumber, customerEmail, customerId, customerName, customerCompany,
        customerPhone, customerCountry, subtotal, currency,
        JSON.stringify(shippingAddress), JSON.stringify(billingAddress),
        rfqId, quoteId, quoteVersion, notes,
        metadata ? JSON.stringify(metadata) : null
      ]
    )

    // Create order items
    for (const item of items) {
      await db.query(
        `INSERT INTO aegisky_order_items
         (order_id, product_id, product_slug, product_name, sku, brand,
          quantity, unit_price, total_price, specifications)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          orderId, item.productId, item.productSlug, item.productName, item.sku, item.brand,
          item.quantity, item.unitPrice, item.unitPrice * item.quantity, item.specifications
        ]
      )
    }

    await db.query('COMMIT')

    return {
      success: true,
      orderId,
      orderNumber,
      total: subtotal,
      items
    }
  } catch (error) {
    await db.query('ROLLBACK')
    throw error
  }
}

/**
 * Mark order as paid (called from payment webhook)
 * Handles stock capture and compensation logic
 */
async function markOrderPaid(db, orderId, paymentDetails) {
  const { captureReservation } = require('./stock-lock')

  // Check current state
  const orderResult = await db.query(
    'SELECT * FROM aegisky_orders WHERE id = $1',
    [orderId]
  )

  if (orderResult.rows.length === 0) {
    throw new Error('Order not found')
  }

  const order = orderResult.rows[0]

  if (order.status === ORDER_STATES.PAID || order.status === ORDER_STATES.PROCESSING) {
    return { success: true, alreadyPaid: true }
  }

  await db.query('BEGIN')

  try {
    // Capture stock reservations
    const reservations = await db.query(
      'SELECT id FROM aegisky_stock_reservations WHERE order_id = $1 AND status = $2',
      [orderId, 'reserved']
    )

    let stockError = null
    for (const res of reservations.rows) {
      try {
        await captureReservation(res.id)
      } catch (e) {
        stockError = e
      }
    }

    if (stockError) {
      // ⚠️ CRITICAL: Payment succeeded but stock capture failed
      // Instead of auto-refunding (which loses Stripe fees),
      // enter compensation_pending state for manual review
      await db.query('ROLLBACK')
      await transitionOrder(
        db, orderId, ORDER_STATES.COMPENSATION_PENDING,
        `Payment received but stock capture failed: ${stockError.message}`,
        { paymentDetails, stockError: stockError.message }
      )
      return {
        success: false,
        compensationRequired: true,
        reason: 'stock_capture_failed'
      }
    }

    // Update payment status
    await db.query(
      `UPDATE aegisky_orders 
       SET status = 'paid', payment_status = 'captured', paid_at = NOW(),
           stripe_payment_intent_id = $2, updated_at = NOW()
       WHERE id = $1`,
      [orderId, paymentDetails.paymentIntentId]
    )

    // Log payment
    await db.query(
      `INSERT INTO aegisky_payments
       (order_id, provider, amount, currency, status, stripe_payment_intent_id,
        stripe_charge_id, stripe_receipt_url, raw_response)
       VALUES ($1,'stripe',$2,$3,'captured',$4,$5,$6,$7)`,
      [
        orderId, order.total, order.currency,
        paymentDetails.paymentIntentId,
        paymentDetails.chargeId,
        paymentDetails.receiptUrl,
        paymentDetails
      ]
    )

    await db.query('COMMIT')

    // TODO: Send order confirmation email
    // TODO: Notify admin/fulfillment team

    return { success: true }
  } catch (error) {
    await db.query('ROLLBACK')
    throw error
  }
}

module.exports = {
  ORDER_STATES,
  PAYMENT_STATES,
  FULFILLMENT_STATES,
  canTransition,
  transitionOrder,
  createOrder,
  markOrderPaid,
  generateOrderNumber,
}
