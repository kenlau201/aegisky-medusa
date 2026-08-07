/**
 * Aegisky Authentication Library
 * Sprint 4+: bcrypt password hashing, JWT sessions, CSRF protection
 *
 * Security:
 * - bcrypt with 12 rounds for password hashing
 * - HttpOnly, Secure, SameSite cookies
 * - CSRF tokens for state-changing requests
 */

const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const BCRYPT_ROUNDS = 12

/**
 * Hash a password with bcrypt
 */
async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS)
  return bcrypt.hash(plainText, salt)
}

/**
 * Verify password against hash
 */
async function verifyPassword(plainText, hash) {
  return bcrypt.compare(plainText, hash)
}

/**
 * Generate a secure random token (for email verification, password reset)
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate CSRF token (double-submit cookie pattern)
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash CSRF token for cookie storage (prevent BREACH attacks)
 */
function hashCsrfToken(token) {
  return crypto.createHmac('sha256', process.env.CSRF_SECRET || 'aegisky-csrf-secret-change-in-prod')
    .update(token)
    .digest('hex')
}

/**
 * Verify CSRF token from header against cookie
 */
function verifyCsrfToken(tokenFromHeader, tokenFromCookie) {
  if (!tokenFromHeader || !tokenFromCookie) return false
  const expected = hashCsrfToken(tokenFromHeader)
  // Use timingSafeEqual to prevent timing attacks
  const expectedBuf = Buffer.from(expected)
  const cookieBuf = Buffer.from(tokenFromCookie)
  if (expectedBuf.length !== cookieBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, cookieBuf)
}

/**
 * Generate a temporary password (for supplier onboarding, password resets)
 */
function generateTemporaryPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length]
  }
  return password
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateCsrfToken,
  hashCsrfToken,
  verifyCsrfToken,
  generateTemporaryPassword,
  BCRYPT_ROUNDS,
}
