/**
 * Aegisky Medusa - Stripe Payment Service
 * 
 * Handles:
 * - Payment Intent creation
 * - Webhook signature verification
 * - Payment confirmation
 * - Refund processing
 * - Compensation logic (avoid auto-refund fees)
 */
const Stripe = require('stripe')

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
const IS_TEST_MODE = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test')

let stripe = null

function getStripe() {
  if (!stripe) {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })
  }
  return stripe
}

/**
 * Create a PaymentIntent for an order
 */
async function createPaymentIntent({
  amount,
  currency = 'usd',
  orderId,
  customerEmail,
  customerName,
  metadata = {},
}) {
  const stripeClient = getStripe()

  // Amount in cents
  const amountInCents = Math.round(amount * 100)

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: amountInCents,
    currency: currency.toLowerCase(),
    receipt_email: customerEmail,
    metadata: {
      orderId,
      customerName,
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
    payment_method_options: {
      card: {
        request_three_d_secure: 'automatic',
      },
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: amountInCents / 100,
    currency,
  }
}

/**
 * Verify and process Stripe webhook
 */
async function handleWebhook(rawBody, signature) {
  const stripeClient = getStripe()

  let event
  try {
    event = stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('[Stripe] Webhook signature verification failed:', err.message)
    throw new Error(`Webhook signature verification failed: ${err.message}`)
  }

  const { getDbClient } = require('./db')
  const { markOrderPaid, transitionOrder, ORDER_STATES } = require('./order-state-machine')
  const db = getDbClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      const orderId = paymentIntent.metadata.orderId

      if (!orderId) {
        console.error('[Stripe] PaymentIntent succeeded but no orderId in metadata')
        break
      }

      console.log(`[Stripe] Payment succeeded for order ${orderId}: ${paymentIntent.id}`)

      // Mark order as paid - this handles stock capture and compensation logic
      await markOrderPaid(db, orderId, {
        paymentIntentId: paymentIntent.id,
        chargeId: paymentIntent.latest_charge,
        receiptUrl: paymentIntent.charges?.data?.[0]?.receipt_url,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      })
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object
      const orderId = paymentIntent.metadata.orderId

      if (orderId) {
        console.log(`[Stripe] Payment failed for order ${orderId}`)

        // Log payment failure
        await db.query(
          `INSERT INTO aegisky_payments
           (order_id, provider, amount, currency, status, failure_code, failure_message,
            stripe_payment_intent_id, raw_response)
           VALUES ($1, 'stripe', $2, $3, 'failed', $4, $5, $6, $7)`,
          [
            orderId,
            paymentIntent.amount / 100,
            paymentIntent.currency,
            paymentIntent.last_payment_error?.code,
            paymentIntent.last_payment_error?.message,
            paymentIntent.id,
            paymentIntent
          ]
        )

        // Order stays in pending_payment, customer can retry
      }
      break
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object
      const paymentIntentId = dispute.payment_intent

      // Find order by payment intent
      const orderResult = await db.query(
        'SELECT id FROM aegisky_orders WHERE stripe_payment_intent_id = $1',
        [paymentIntentId]
      )

      if (orderResult.rows.length > 0) {
        const orderId = orderResult.rows[0].id
        console.log(`[Stripe] Dispute created for order ${orderId}`)

        // Enter compensation pending state - DO NOT auto-refund
        await transitionOrder(
          db, orderId, ORDER_STATES.COMPENSATION_PENDING,
          `Payment dispute opened: ${dispute.reason}`,
          { disputeId: dispute.id, disputeReason: dispute.reason }
        )
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object
      const paymentIntentId = charge.payment_intent

      const orderResult = await db.query(
        'SELECT id FROM aegisky_orders WHERE stripe_payment_intent_id = $1',
        [paymentIntentId]
      )

      if (orderResult.rows.length > 0) {
        const orderId = orderResult.rows[0].id
        console.log(`[Stripe] Refund processed for order ${orderId}`)

        await db.query(
          `UPDATE aegisky_orders SET status = 'refunded', payment_status = 'refunded', updated_at = NOW()
           WHERE id = $1`,
          [orderId]
        )

        await db.query(
          `UPDATE aegisky_payments
           SET status = 'refunded', refund_amount = $2, refunded_at = NOW()
           WHERE stripe_payment_intent_id = $1`,
          [paymentIntentId, charge.amount_refunded / 100]
        )
      }
      break
    }

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`)
  }

  return { received: true, type: event.type }
}

/**
 * Process a refund (called from admin panel, not automatic)
 * This is intentionally manual to avoid losing Stripe fees on failed orders
 */
async function createRefund(orderId, amount, reason = 'requested_by_customer') {
  const stripeClient = getStripe()
  const { getDbClient } = require('./db')
  const db = getDbClient()

  // Get order
  const orderResult = await db.query(
    'SELECT * FROM aegisky_orders WHERE id = $1',
    [orderId]
  )

  if (orderResult.rows.length === 0) {
    throw new Error('Order not found')
  }

  const order = orderResult.rows[0]

  if (!order.stripe_payment_intent_id) {
    throw new Error('No Stripe payment found for this order')
  }

  // Create refund in Stripe
  const refund = await stripeClient.refunds.create({
    payment_intent: order.stripe_payment_intent_id,
    amount: Math.round(amount * 100),
    reason,
  })

  // Log refund
  await db.query(
    `INSERT INTO aegisky_payments
     (order_id, provider, amount, currency, status, stripe_refund_id, refund_amount, refund_reason)
     VALUES ($1, 'stripe', $2, $3, 'refunded', $4, $5, $6)`,
    [orderId, amount, order.currency, refund.id, amount, reason]
  )

  return {
    success: true,
    refundId: refund.id,
    amount,
  }
}

/**
 * Get publishable key for frontend
 */
function getPublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
}

module.exports = {
  createPaymentIntent,
  handleWebhook,
  createRefund,
  getPublishableKey,
  IS_TEST_MODE,
}
