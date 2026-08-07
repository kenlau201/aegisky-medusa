/**
 * POST /store/admin/auth/login
 * Admin login with username/password, returns JWT token
 */

const { generateAdminToken, verifyCredentials } = require('../../../../../lib/admin-auth')
const { safeHandler } = require('../../../../../lib/security')

// Simple in-memory rate limiting for login attempts
const loginAttempts = new Map()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

module.exports = {
  POST: safeHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    const key = `login:${ip}`
    const attempts = loginAttempts.get(key) || { count: 0, lockedUntil: 0 }

    if (attempts.lockedUntil > Date.now()) {
      const remaining = Math.ceil((attempts.lockedUntil - Date.now()) / 60000)
      return res.status(429).json({
        error: `Too many attempts. Try again in ${remaining} minutes.`
      })
    }

    if (!verifyCredentials(username, password)) {
      attempts.count += 1
      if (attempts.count >= MAX_ATTEMPTS) {
        attempts.lockedUntil = Date.now() + LOCKOUT_MS
        attempts.count = 0
      }
      loginAttempts.set(key, attempts)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    loginAttempts.delete(key)
    const token = generateAdminToken()

    res.json({
      success: true,
      token,
      expiresIn: '24h',
      message: 'Login successful'
    })
  })
}
