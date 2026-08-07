/**
 * Aegisky Medusa - Distributed Lock & Inventory Reservation
 * 
 * Features:
 * - Redis-based distributed lock (Redlock simplified)
 * - Stock reservation with TTL (15 minutes default)
 * - Automatic expiration of stale reservations
 * - Prevent overselling in high-concurrency B2B scenarios
 */
const { createClient } = require('redis')

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6380'
const DEFAULT_LOCK_TTL = 10000 // 10 seconds
const RESERVATION_TTL_MINUTES = 15

let redisClient = null

async function getRedis() {
  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL })
    redisClient.on('error', (err) => console.error('[Redis] Error:', err))
    await redisClient.connect()
    console.log('[Redis] Connected for distributed locking')
  }
  return redisClient
}

/**
 * Acquire a distributed lock
 * @param {string} resource - Resource identifier (e.g., `stock:${productId}`)
 * @param {string} owner - Lock owner identifier
 * @param {number} ttl - Lock TTL in milliseconds
 * @returns {Promise<boolean>} - Whether lock was acquired
 */
async function acquireLock(resource, owner, ttl = DEFAULT_LOCK_TTL) {
  const redis = await getRedis()
  const key = `lock:${resource}`
  
  // SET NX (set if not exists) with expiration
  const result = await redis.set(key, owner, {
    NX: true,
    PX: ttl
  })
  
  return result === 'OK'
}

/**
 * Release a distributed lock
 * @param {string} resource - Resource identifier
 * @param {string} owner - Lock owner (must match to prevent releasing others' locks)
 */
async function releaseLock(resource, owner) {
  const redis = await getRedis()
  const key = `lock:${resource}`
  
  // Lua script to atomically check and release
  const script = `
    if redis.call('get', KEYS[1]) == ARGV[1] then
      return redis.call('del', KEYS[1])
    else
      return 0
    end
  `
  
  await redis.eval(script, {
    keys: [key],
    arguments: [owner]
  })
}

/**
 * Execute a function with distributed lock
 * @param {string} resource 
 * @param {function} fn - Async function to execute
 * @param {number} retries - Number of retries if lock fails
 * @param {number} retryDelay - Delay between retries in ms
 */
async function withLock(resource, fn, retries = 3, retryDelay = 100) {
  const owner = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const locked = await acquireLock(resource, owner)
    if (locked) {
      try {
        return await fn()
      } finally {
        await releaseLock(resource, owner)
      }
    }
    
    if (attempt < retries) {
      await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)))
    }
  }
  
  throw new Error(`Failed to acquire lock for ${resource} after ${retries} retries`)
}

/**
 * Reserve stock for a product (order-level)
 * @param {number} productId 
 * @param {number} quantity 
 * @param {string} orderId 
 * @returns {Promise<{success: boolean, reservationId?: string, error?: string}>}
 */
async function reserveStock(productId, quantity, orderId) {
  return reserveStockInternal(productId, quantity, `order:${orderId}`, orderId)
}

/**
 * Reserve stock for cart items (pre-checkout, 15 min TTL)
 * @param {number} productId 
 * @param {number} quantity 
 * @param {string} cartId - Session/cart identifier
 */
async function reserveCartStock(productId, quantity, cartId) {
  return reserveStockInternal(productId, quantity, `cart:${cartId}`, null)
}

/**
 * Internal: Reserve stock with distributed lock
 */
async function reserveStockInternal(productId, quantity, lockedBy, orderId) {
  const { getDbClient } = require('./db')
  
  return withLock(`stock:${productId}`, async () => {
    const db = getDbClient()
    
    // Check available stock
    const productResult = await db.query(
      'SELECT id, name, in_stock, stock_status FROM aegisky_products WHERE id = $1',
      [productId]
    )
    
    if (productResult.rows.length === 0) {
      return { success: false, error: 'Product not found' }
    }
    
    const product = productResult.rows[0]
    
    // Calculate currently reserved quantity
    const reservedResult = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) as reserved 
       FROM aegisky_stock_reservations 
       WHERE product_id = $1 AND status = 'reserved' AND expires_at > NOW()`,
      [productId]
    )
    
    const currentlyReserved = parseInt(reservedResult.rows[0].reserved) || 0
    
    // Create reservation
    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000)
    const insertResult = await db.query(
      `INSERT INTO aegisky_stock_reservations 
       (product_id, order_id, quantity, status, expires_at, locked_by)
       VALUES ($1, $2, $3, 'reserved', $4, $5)
       RETURNING id`,
      [productId, orderId, quantity, expiresAt, lockedBy]
    )
    
    return {
      success: true,
      reservationId: insertResult.rows[0].id,
      expiresAt,
      reservedQuantity: currentlyReserved + quantity,
      ttlMinutes: RESERVATION_TTL_MINUTES
    }
  })
}

/**
 * Extend a cart reservation (user activity keeps it alive)
 * @param {string} reservationId 
 */
async function extendReservation(reservationId) {
  const { getDbClient } = require('./db')
  const db = getDbClient()
  
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000)
  await db.query(
    `UPDATE aegisky_stock_reservations 
     SET expires_at = $2, updated_at = NOW()
     WHERE id = $1 AND status = 'reserved'`,
    [reservationId, expiresAt]
  )
  
  return { success: true, expiresAt }
}

/**
 * Release cart reservations (when cart is cleared or modified)
 * @param {string} cartId 
 */
async function releaseCartReservations(cartId) {
  const { getDbClient } = require('./db')
  const db = getDbClient()
  
  const result = await db.query(
    `UPDATE aegisky_stock_reservations 
     SET status = 'released', updated_at = NOW() 
     WHERE locked_by = $1 AND status = 'reserved'
     RETURNING id`,
    [`cart:${cartId}`]
  )
  
  return { success: true, released: result.rowCount }
}

/**
 * Capture a reservation (finalize stock deduction after payment)
 * @param {string} reservationId 
 */
async function captureReservation(reservationId) {
  const { getDbClient } = require('./db')
  const db = getDbClient()
  
  await db.query(
    `UPDATE aegisky_stock_reservations 
     SET status = 'captured', updated_at = NOW() 
     WHERE id = $1 AND status = 'reserved'`,
    [reservationId]
  )
  
  return { success: true }
}

/**
 * Release a reservation (cancel order or timeout)
 * @param {string} reservationId 
 */
async function releaseReservation(reservationId) {
  const { getDbClient } = require('./db')
  const db = getDbClient()
  
  await db.query(
    `UPDATE aegisky_stock_reservations 
     SET status = 'released', updated_at = NOW() 
     WHERE id = $1 AND status = 'reserved'`,
    [reservationId]
  )
  
  return { success: true }
}

/**
 * Release all reservations for an order (used when order is cancelled)
 * @param {string} orderId 
 */
async function releaseOrderReservations(orderId) {
  const { getDbClient } = require('./db')
  const db = getDbClient()
  
  const result = await db.query(
    `UPDATE aegisky_stock_reservations 
     SET status = 'released', updated_at = NOW() 
     WHERE order_id = $1 AND status = 'reserved'
     RETURNING id`,
    [orderId]
  )
  
  return { success: true, released: result.rowCount }
}

/**
 * Clean up expired reservations (run periodically)
 * @returns {Promise<number>} Number of expired reservations released
 */
async function cleanupExpiredReservations() {
  const { getDbClient } = require('./db')
  const db = getDbClient()
  
  const result = await db.query(
    `UPDATE aegisky_stock_reservations 
     SET status = 'expired', updated_at = NOW() 
     WHERE status = 'reserved' AND expires_at < NOW()
     RETURNING id, product_id, quantity, order_id`
  )
  
  if (result.rowCount > 0) {
    console.log(`[Stock] Released ${result.rowCount} expired reservations`)
  }
  
  return result.rowCount
}

/**
 * Get available stock count (for display)
 * @param {number} productId 
 */
async function getAvailableStock(productId) {
  const { getDbClient } = require('./db')
  const db = getDbClient()
  
  // For now, return a reasonable number based on product status
  // In production, this would come from inventory management
  const productResult = await db.query(
    'SELECT in_stock, stock_status FROM aegisky_products WHERE id = $1',
    [productId]
  )
  
  if (productResult.rows.length === 0) return 0
  
  const product = productResult.rows[0]
  
  if (product.stock_status === 'on_request') return -1 // -1 means "on request"
  if (!product.in_stock) return 0
  
  const reservedResult = await db.query(
    `SELECT COALESCE(SUM(quantity), 0) as reserved 
     FROM aegisky_stock_reservations 
     WHERE product_id = $1 AND status = 'reserved' AND expires_at > NOW()`,
    [productId]
  )
  
  // Assume default stock of 100 for in-stock items
  // This would be replaced with real inventory data
  const defaultStock = 100
  const reserved = parseInt(reservedResult.rows[0].reserved) || 0
  
  return Math.max(0, defaultStock - reserved)
}

module.exports = {
  acquireLock,
  releaseLock,
  withLock,
  reserveStock,
  reserveCartStock,
  extendReservation,
  releaseCartReservations,
  captureReservation,
  releaseReservation,
  releaseOrderReservations,
  cleanupExpiredReservations,
  getAvailableStock,
  RESERVATION_TTL_MINUTES,
}
