/**
 * Admin Authentication Middleware
 * JWT-based admin authentication, replaces hardcoded token
 */

const jwt = require('jsonwebtoken')

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'aegisky-admin-jwt-secret-change-in-production-2026'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456'
const TOKEN_EXPIRY = '24h'

/**
 * Generate JWT token for admin
 */
function generateAdminToken() {
  return jwt.sign(
    { role: 'admin', username: ADMIN_USERNAME },
    ADMIN_JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

/**
 * Verify admin credentials
 */
function verifyCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

/**
 * Middleware to require admin authentication
 * Checks Authorization header for Bearer token
 */
function requireAdmin(req, res, next) {
  // Support both JWT Bearer token and legacy x-admin-token header for transition
  const authHeader = req.headers.authorization
  const legacyToken = req.headers['x-admin-token']

  let token = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else if (legacyToken && legacyToken === process.env.ADMIN_API_TOKEN) {
    // Legacy token support - will be deprecated
    return next()
  }

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    req.admin = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = {
  generateAdminToken,
  verifyCredentials,
  requireAdmin,
  ADMIN_JWT_SECRET,
}
