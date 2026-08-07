/**
 * Simple in-memory rate limiter for API endpoints
 * Uses sliding window per IP address
 */

const rateLimits = new Map()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimits.entries()) {
    if (data.resetAt < now) {
      rateLimits.delete(key)
    }
  }
}, 5 * 60 * 1000).unref()

/**
 * Create rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 * @param {string} options.prefix - Key prefix for different endpoints
 */
function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, prefix = 'general' }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.headers['x-real-ip'] ||
               req.ip ||
               'unknown'
    const key = `${prefix}:${ip}`
    const now = Date.now()

    let data = rateLimits.get(key)
    if (!data || data.resetAt < now) {
      data = { count: 0, resetAt: now + windowMs }
      rateLimits.set(key, data)
    }

    data.count++

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - data.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(data.resetAt / 1000))

    if (data.count > max) {
      const retryAfter = Math.ceil((data.resetAt - now) / 1000)
      res.setHeader('Retry-After', retryAfter)
      return res.status(429).json({
        error: 'Too many requests',
        message: `Please try again in ${Math.ceil(retryAfter / 60)} minutes`,
        retryAfter
      })
    }

    next()
  }
}

// Predefined limiters
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, prefix: 'auth' })
const apiLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 60, prefix: 'api' })
const strictLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5, prefix: 'strict' })

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter
}
