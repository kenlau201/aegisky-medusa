/**
 * Aegisky Medusa - Pricing Engine
 * 
 * Handles:
 * - Customer tier discounts (Bronze/Silver/Gold/Platinum)
 * - Volume/quantity pricing
 * - Currency conversion
 * - Price formatting
 */
const { getDbClient } = require('./db')

/**
 * Get customer's tier and discount
 */
async function getCustomerTier(email) {
  const db = getDbClient()

  // Recalculate tier based on order history
  await db.query('SELECT recalculate_customer_tier($1)', [email])

  const result = await db.query(
    `SELECT a.*, t.name as tier_name, t.discount_percent, t.benefits
     FROM aegisky_customer_tier_assignments a
     JOIN aegisky_customer_tiers t ON a.tier_id = t.id
     WHERE a.customer_email = $1`,
    [email]
  )

  if (result.rows.length === 0) {
    // Default to Bronze
    return {
      tierId: 'bronze',
      tierName: 'Bronze',
      discountPercent: 0,
      totalSpent: 0,
      totalOrders: 0,
      benefits: []
    }
  }

  const row = result.rows[0]
  return {
    tierId: row.tier_id,
    tierName: row.tier_name,
    discountPercent: Number(row.discount_percent),
    totalSpent: Number(row.total_spent),
    totalOrders: row.total_orders,
    benefits: row.benefits || []
  }
}

/**
 * Get volume pricing for a product
 */
async function getVolumePricing(productId) {
  const db = getDbClient()

  const result = await db.query(
    `SELECT min_quantity, discount_percent, price_override
     FROM aegisky_volume_pricing
     WHERE product_id = $1
     ORDER BY min_quantity ASC`,
    [productId]
  )

  return result.rows
}

/**
 * Calculate final price for a product considering:
 * 1. Base price
 * 2. Volume/quantity discount
 * 3. Customer tier discount
 */
async function calculatePrice(basePrice, productId, quantity, customerEmail) {
  let price = Number(basePrice)
  let appliedDiscounts = []

  // 1. Volume pricing (quantity breaks)
  if (productId && quantity > 1) {
    const volumeBreaks = await getVolumePricing(productId)
    for (const b of volumeBreaks) {
      if (quantity >= b.min_quantity) {
        if (b.price_override) {
          price = Number(b.price_override)
          appliedDiscounts.push({
            type: 'volume',
            description: `Volume pricing (${b.min_quantity}+ units)`,
            percent: 0,
            priceOverride: Number(b.price_override)
          })
        } else if (b.discount_percent > 0) {
          price = price * (1 - Number(b.discount_percent) / 100)
          appliedDiscounts.push({
            type: 'volume',
            description: `Volume discount (${b.min_quantity}+ units)`,
            percent: Number(b.discount_percent)
          })
        }
      }
    }
  }

  // 2. Customer tier discount
  if (customerEmail) {
    const tier = await getCustomerTier(customerEmail)
    if (tier.discountPercent > 0) {
      price = price * (1 - tier.discountPercent / 100)
      appliedDiscounts.push({
        type: 'tier',
        description: `${tier.tierName} member discount`,
        percent: tier.discountPercent,
        tier: tier.tierId
      })
    }
  }

  return {
    originalPrice: Number(basePrice),
    finalPrice: Math.round(price * 100) / 100,
    savings: Math.round((Number(basePrice) - price) * 100) / 100,
    savingsPercent: Math.round((1 - price / Number(basePrice)) * 1000) / 10,
    appliedDiscounts,
    quantity
  }
}

/**
 * Calculate prices for multiple items in a cart
 */
async function calculateCartPricing(items, customerEmail) {
  const results = []
  let subtotal = 0
  let totalSavings = 0

  for (const item of items) {
    const priced = await calculatePrice(
      item.unitPrice,
      item.productId,
      item.quantity,
      customerEmail
    )
    results.push({
      ...item,
      ...priced,
      lineTotal: Math.round(priced.finalPrice * item.quantity * 100) / 100
    })
    subtotal += priced.finalPrice * item.quantity
    totalSavings += priced.savings * item.quantity
  }

  return {
    items: results,
    subtotal: Math.round(subtotal * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0)
  }
}

/**
 * Admin: manually set customer tier
 */
async function setCustomerTier(email, tierId) {
  const db = getDbClient()

  const validTiers = ['bronze', 'silver', 'gold', 'platinum']
  if (!validTiers.includes(tierId)) {
    throw new Error(`Invalid tier: ${tierId}`)
  }

  await db.query(
    `INSERT INTO aegisky_customer_tier_assignments
     (customer_email, tier_id, manually_assigned, assigned_at, updated_at)
     VALUES ($1, $2, true, NOW(), NOW())
     ON CONFLICT (customer_email) DO UPDATE
       SET tier_id = $2, manually_assigned = true, updated_at = NOW()`,
    [email, tierId]
  )

  return { success: true, email, tier: tierId }
}

/**
 * Admin: set volume pricing for a product
 */
async function setVolumePricing(productId, breaks) {
  const db = getDbClient()

  // Delete existing
  await db.query('DELETE FROM aegisky_volume_pricing WHERE product_id = $1', [productId])

  // Insert new breaks
  for (const b of breaks) {
    await db.query(
      `INSERT INTO aegisky_volume_pricing (product_id, min_quantity, discount_percent, price_override)
       VALUES ($1, $2, $3, $4)`,
      [productId, b.minQuantity, b.discountPercent || 0, b.priceOverride || null]
    )
  }

  return { success: true, productId, breaks: breaks.length }
}

module.exports = {
  getCustomerTier,
  getVolumePricing,
  calculatePrice,
  calculateCartPricing,
  setCustomerTier,
  setVolumePricing,
}
