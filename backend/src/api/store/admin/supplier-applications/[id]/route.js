/**
 * PATCH /store/admin/supplier-applications/:id
 * Approve or reject supplier application
 * When approved, creates a customer account with supplier role
 */

const { getDbClient } = require('../../../../../lib/db')
const { hashPassword, generateTemporaryPassword } = require('../../../../../lib/auth')
const { safeHandler, AppError } = require('../../../../../lib/security')

module.exports = {
  PATCH: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { id } = req.params
    const { action, reviewNotes } = req.body

    if (!['approve', 'reject'].includes(action)) {
      throw new AppError('VALIDATION_ERROR', 'Action must be approve or reject', 400)
    }

    const appResult = await db.query(
      'SELECT * FROM aegisky_supplier_applications WHERE id = $1',
      [id]
    )
    if (appResult.rows.length === 0) {
      throw new AppError('NOT_FOUND', 'Application not found', 404)
    }
    const application = appResult.rows[0]

    const now = new Date()

    if (action === 'approve') {
      // Generate temporary password
      const tempPassword = generateTemporaryPassword()
      const passwordHash = await hashPassword(tempPassword)

      // Check if customer already exists
      let customerId = application.customer_id
      const existingCustomer = await db.query(
        'SELECT id FROM aegisky_customers WHERE email = $1',
        [application.email]
      )

      if (existingCustomer.rows.length > 0) {
        // Update existing customer to supplier role
        customerId = existingCustomer.rows[0].id
        await db.query(`
          UPDATE aegisky_customers
          SET role = 'supplier', updated_at = NOW()
          WHERE id = $1
        `, [customerId])
      } else {
        // Create new supplier account
        const newCustomer = await db.query(`
          INSERT INTO aegisky_customers (email, password_hash, first_name, company, country, phone, role, email_verified)
          VALUES ($1, $2, $3, $4, $5, $6, 'supplier', true)
          RETURNING id
        `, [application.email, passwordHash, application.contact_name, application.company_name, application.country, application.phone])
        customerId = newCustomer.rows[0].id
      }

      // Update application
      await db.query(`
        UPDATE aegisky_supplier_applications
        SET status = 'approved', reviewed_at = $1, review_notes = $2, customer_id = $3, updated_at = NOW()
        WHERE id = $4
      `, [now, reviewNotes, customerId, id])

      // TODO: Send welcome email with temporary password

      res.json({
        success: true,
        status: 'approved',
        customerId,
        tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined,
        message: 'Supplier approved. Account created with temporary password.',
      })
    } else {
      await db.query(`
        UPDATE aegisky_supplier_applications
        SET status = 'rejected', reviewed_at = $1, review_notes = $2, updated_at = NOW()
        WHERE id = $3
      `, [now, reviewNotes, id])

      // TODO: Send rejection email
      res.json({ success: true, status: 'rejected' })
    }
  })
}
