/**
 * GET /store/auth/verify-email?token=xxx
 * Verify email address
 */

const { getDbClient } = require('../../../../lib/db')
const { safeHandler, AppError } = require('../../../../lib/security')

module.exports = {
  GET: safeHandler(async (req, res) => {
    const db = getDbClient()
    const token = req.query.token

    if (!token) throw new AppError('VALIDATION_ERROR', 'Verification token is required', 400)

    const result = await db.query(`
      UPDATE aegisky_customers
      SET email_verified = true,
          email_verify_token = NULL,
          email_verify_expires = NULL,
          updated_at = NOW()
      WHERE email_verify_token = $1
        AND email_verify_expires > NOW()
      RETURNING id, email
    `, [token])

    if (result.rows.length === 0) {
      throw new AppError('BAD_REQUEST', 'Invalid or expired verification token', 400)
    }

    res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    })
  })
}
