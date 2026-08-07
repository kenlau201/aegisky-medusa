/**
 * POST /store/auth/register
 * Register new customer with bcrypt password hashing
 */

const { getDbClient } = require('../../../../lib/db')
const { hashPassword, generateSecureToken } = require('../../../../lib/auth')
const { safeHandler, AppError } = require('../../../../lib/security')

module.exports = {
  POST: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { email, password, firstName, lastName, company, phone, country } = req.body

    if (!email || !password) throw new AppError('VALIDATION_ERROR', 'Email and password are required', 400)
    if (password.length < 8) throw new AppError('VALIDATION_ERROR', 'Password must be at least 8 characters', 400)

    // Check if user exists
    const existing = await db.query('SELECT id FROM aegisky_customers WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) throw new AppError('CONFLICT', 'Email already registered', 409)

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await hashPassword(password)
    const verifyToken = generateSecureToken()
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const result = await db.query(`
      INSERT INTO aegisky_customers (
        email, password_hash, first_name, last_name, company, phone, country,
        email_verify_token, email_verify_expires, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'buyer')
      RETURNING id, email, first_name, last_name, role, created_at
    `, [email.toLowerCase(), passwordHash, firstName, lastName, company, phone, country, verifyToken, verifyExpires])

    const customer = result.rows[0]

    // TODO: Send verification email
    // const { sendEmail } = require('../../../../lib/email')
    // await sendEmail({ to: email, template: 'verify-email', token: verifyToken })

    res.status(201).json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        role: customer.role,
      },
      message: 'Registration successful. Please check your email to verify your account.',
      // In dev mode, return token for testing
      verifyToken: process.env.NODE_ENV === 'development' ? verifyToken : undefined,
    })
  })
}
