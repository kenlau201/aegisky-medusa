/**
 * CSRF Protection Middleware
 * Sprint 4+: Double-submit cookie pattern
 *
 * For state-changing requests (POST, PUT, PATCH, DELETE):
 * 1. Client reads CSRF token from cookie
 * 2. Client sends it in X-CSRF-Token header
 * 3. Server compares cookie value with header value
 */

const { generateCsrfToken, verifyCsrfToken } = require('./auth')

const CSRF_COOKIE_NAME = 'aegisky_csrf'
const CSRF_HEADER_NAME = 'x-csrf-token'
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

/**
 * Middleware to set CSRF cookie and validate token for unsafe methods
 */
function csrfProtection(req, res, next) {
  // Set CSRF cookie if not present
  if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken()
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Need JS to read it for header
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
    // Also expose via header for first request
    res.setHeader('X-CSRF-Token', token)
  }

  // Skip validation for safe methods
  if (SAFE_METHODS.includes(req.method)) {
    return next()
  }

  // For state-changing requests, validate CSRF token
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME]
  const tokenFromCookie = req.cookies?.[CSRF_COOKIE_NAME]

  if (!tokenFromHeader || !tokenFromCookie) {
    return res.status(403).json({
      error: 'CSRF_ERROR',
      message: 'CSRF token missing. Please refresh the page and try again.',
    })
  }

  if (!verifyCsrfToken(tokenFromHeader, tokenFromCookie)) {
    return res.status(403).json({
      error: 'CSRF_ERROR',
      message: 'CSRF token invalid. Please refresh the page and try again.',
    })
  }

  next()
}

/**
 * Endpoint to get a fresh CSRF token (for SPAs)
 */
function csrfTokenHandler(req, res) {
  const token = generateCsrfToken()
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  })
  res.json({ csrfToken: token })
}

module.exports = {
  csrfProtection,
  csrfTokenHandler,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
}
