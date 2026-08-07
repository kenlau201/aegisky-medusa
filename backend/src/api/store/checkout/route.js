/**
 * POST /store/checkout
 * Create order and Stripe PaymentIntent
 * Sprint 3: Security hardened + payment disclosure
 */
const { getDbClient } = require('../../../lib/db')
const { createOrder, transitionOrder, ORDER_STATES } = require('../../../lib/order-state-machine')
const { reserveStock } = require('../../../lib/stock-lock')
const { createPaymentIntent, IS_TEST_MODE } = require('../../../lib/stripe')
const { handleApiError, AppError, validateAmount, withPerfMonitoring } = require('../../../lib/security')
const { createRateSnapshot } = require('../../../lib/exchange-rates')

// Payment collection disclosure - Sprint 3 legal requirement
const PAYMENT_DISCLOSURE = {
  enabled: true,
  message: 'Aegisky acts as an agent and collects payment on behalf of the supplier. The actual seller of record is the supplier as indicated on your order confirmation.',
  platformEntity: 'Aegisky Inc.',
  platformRole: 'Payment Collection Agent',
}

const checkoutHandler = async (req, res) => {
  const db = getDbClient()

  try {
    const body = req.body || {}
    const {
      email,
      name,
      company,
      phone,
      country,
      items,
      currency = 'usd',
      shippingAddress,
      billingAddress,
      notes,
      rfqId,
      quoteId,
      quoteVersion,
      supplierName,
    } = body

    // Validation
    if (!email || !items || items.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Email and at least one item are required', 400)
    }

    // Calculate totals and validate items
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        throw new AppError('VALIDATION_ERROR', 'Invalid item data', 400)
      }

      // Get product price from database
      const productResult = await db.query(
        'SELECT id, name, slug, sku, price, brands FROM aegisky_products WHERE id = $1',
        [item.productId]
      )

      if (productResult.rows.length === 0) {
        throw new AppError('NOT_FOUND', `One or more products not found`, 404)
      }

      const product = productResult.rows[0]
      const displayPrice = item.unitPrice || Number(product.price)

      // Validate amount
      validateAmount(displayPrice * item.quantity)

      subtotal += displayPrice * item.quantity

      orderItems.push({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        sku: product.sku,
        brand: product.brands?.[0] || supplierName || 'Aegisky Network Supplier',
        quantity: item.quantity,
        unitPrice: displayPrice,
        specifications: item.specifications,
      })
    }

    // Sprint 3 Globalization: Lock exchange rates at checkout
    const rateSnapshot = await createRateSnapshot()

    // Create order in draft state
    const order = await createOrder(db, {
      customerEmail: email,
      customerName: name,
      customerCompany: company,
      customerPhone: phone,
      customerCountry: country,
      items: orderItems,
      currency,
      shippingAddress,
      billingAddress,
      rfqId,
      quoteId,
      quoteVersion,
      notes,
      metadata: {
        rateSnapshot,
        lockedCurrency: currency,
      },
    })

    // Reserve stock for each item
    const reservationResults = []
    for (const item of orderItems) {
      const result = await reserveStock(item.productId, item.quantity, order.orderId)
      reservationResults.push(result)

      if (result.success) {
        await db.query(
          'UPDATE aegisky_order_items SET reservation_id = $2 WHERE order_id = $1 AND product_id = $3',
          [order.orderId, result.reservationId, item.productId]
        )
      }
    }

    // Transition to pending_payment
    await transitionOrder(db, order.orderId, ORDER_STATES.PENDING_PAYMENT, 'Checkout initiated')

    // Create Stripe PaymentIntent
    let clientSecret = null
    let paymentIntentId = null

    if (!IS_TEST_MODE) {
      const payment = await createPaymentIntent({
        amount: subtotal,
        currency,
        orderId: order.orderId,
        customerEmail: email,
        customerName: name,
        metadata: {
          company: company || '',
          itemCount: items.length,
          platformRole: 'agent',
        }
      })
      clientSecret = payment.clientSecret
      paymentIntentId = payment.paymentIntentId

      await db.query(
        'UPDATE aegisky_orders SET stripe_payment_intent_id = $2 WHERE id = $1',
        [order.orderId, paymentIntentId]
      )
    } else {
      // Test mode - return a mock client secret for development
      clientSecret = `pi_test_${order.orderId}_secret_${Date.now()}`
    }

    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      subtotal,
      currency,
      clientSecret,
      isTestMode: IS_TEST_MODE,
      reservations: reservationResults.map(r => ({ success: r.success })),
      // Sprint 3: Payment collection disclosure
      paymentDisclosure: PAYMENT_DISCLOSURE,
    })

  } catch (error) {
    const safe = handleApiError(error, { endpoint: 'checkout' })
    return res.status(safe.statusCode).json({
      error: safe.error,
      message: safe.message,
      errorId: safe.errorId,
    })
  }
}

// Wrap with performance monitoring - Data Red Line: P95 < 800ms
module.exports = {
  POST: withPerfMonitoring(checkoutHandler, 'POST /store/checkout')
}
