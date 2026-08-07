/**
 * POST /store/auth/login
 * Customer login with email/password
 * Rate limited: 10 attempts per 15 minutes per IP
 */

const jwt = require('jsonwebtoken')
const { getDbClient } = require('../../../../lib/db')
const { verifyPassword } = require('../../../../lib/auth')
const { safeHandler, AppError } = require('../../../../lib/security')
const { authLimiter } = require('../../../../lib/rate-limit')

const JWT_SECRET = process.env.JWT_SECRET || 'aegisky-customer-jwt-dev-secret-change-in-prod'
const TOKEN_EXPIRY = '7d'

module.exports = {
  POST: (req, res) => {
    authLimiter(req, res, () => safeHandler(async (req, res) => {
      const db = getDbClient()
      const { email, password } = req.body

      if (!email || !password) {
        throw new AppError('VALIDATION_ERROR', 'Email and password are required', 400)
      }

      // Find customer
      const result = await db.query(
        'SELECT id, email, password_hash, first_name, last_name, role, status, email_verified FROM aegisky_customers WHERE email = $1',
        [email.toLowerCase()]
      )

      if (result.rows.length === 0) {
        throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401)
      }

      const customer = result.rows[0]

      if (customer.status === 'suspended') {
        throw new AppError('FORBIDDEN', 'Account suspended. Please contact support.', 403)
      }

      // Verify password
      const valid = await verifyPassword(password, customer.password_hash)
      if (!valid) {
        throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401)
      }

      // Update last login
      await db.query(
        'UPDATE aegisky_customers SET last_login = NOW(), login_count = login_count + 1 WHERE id = $1',
        [customer.id]
      )

      // Generate JWT
      const token = jwt.sign(
        {
          id: customer.id,
          email: customer.email,
          role: customer.role,
          firstName: customer.first_name,
          lastName: customer.last_name
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      )

      res.json({
        success: true,
        token,
        expiresIn: TOKEN_EXPIRY,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          role: customer.role,
          emailVerified: customer.email_verified
        }
      })
    })(req, res))
  }
}
