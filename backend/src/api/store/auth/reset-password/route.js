/**
 * POST /store/auth/reset-password
 * Reset password with token
 */

const { getDbClient } = require('../../../../lib/db')
const { hashPassword } = require('../../../../lib/auth')
const { safeHandler, AppError } = require('../../../../lib/security')

module.exports = {
  POST: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { token, newPassword } = req.body

    if (!token || !newPassword) throw new AppError('VALIDATION_ERROR', 'Token and new password are required', 400)
    if (newPassword.length < 8) throw new AppError('VALIDATION_ERROR', 'Password must be at least 8 characters', 400)

    const user = await db.query(`
      SELECT id FROM aegisky_customers
      WHERE password_reset_token = $1
        AND password_reset_expires > NOW()
    `, [token])

    if (user.rows.length === 0) {
      throw new AppError('BAD_REQUEST', 'Invalid or expired reset token', 400)
    }

    const passwordHash = await hashPassword(newPassword)

    await db.query(`
      UPDATE aegisky_customers
      SET password_hash = $1,
          password_reset_token = NULL,
          password_reset_expires = NULL,
          updated_at = NOW()
      WHERE id = $2
    `, [passwordHash, user.rows[0].id])

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    })
  })
}
