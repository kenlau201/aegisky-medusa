/**
 * POST /store/auth/forgot-password
 * Request password reset email
 */

const { getDbClient } = require('../../../../lib/db')
const { generateSecureToken } = require('../../../../lib/auth')
const { safeHandler } = require('../../../../lib/security')

module.exports = {
  POST: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { email } = req.body

    if (!email) {
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' })
    }

    // Always return success to prevent email enumeration
    const user = await db.query('SELECT id FROM aegisky_customers WHERE email = $1', [email.toLowerCase()])

    if (user.rows.length > 0) {
      const resetToken = generateSecureToken()
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.query(`
        UPDATE aegisky_customers
        SET password_reset_token = $1,
            password_reset_expires = $2,
            updated_at = NOW()
        WHERE email = $3
      `, [resetToken, resetExpires, email.toLowerCase()])

      // TODO: Send reset email
      // const { sendEmail } = require('../../../../lib/email')
      // await sendEmail({ to: email, template: 'password-reset', token: resetToken })

      // In dev mode, return token for testing
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          success: true,
          message: 'Password reset link generated.',
          resetToken,
        })
      }
    }

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.',
    })
  })
}
