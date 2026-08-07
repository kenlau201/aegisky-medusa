/**
 * POST /store/supplier-applications
 * Submit supplier onboarding application
 */

const { getDbClient } = require('../../../lib/db')
const { safeHandler, AppError } = require('../../../lib/security')

module.exports = {
  POST: safeHandler(async (req, res) => {
    const db = getDbClient()
    const {
      email, companyName, contactName, phone, country, website,
      businessType, productCategories, yearEstablished, annualRevenue,
      certifications, message,
    } = req.body

    if (!email || !companyName || !contactName) {
      throw new AppError('VALIDATION_ERROR', 'Email, company name, and contact name are required', 400)
    }

    // Check for duplicate pending application
    const existing = await db.query(
      'SELECT id FROM aegisky_supplier_applications WHERE email = $1 AND status = $2',
      [email.toLowerCase(), 'pending']
    )
    if (existing.rows.length > 0) {
      throw new AppError('CONFLICT', 'You already have a pending application. We will contact you within 2-3 business days.', 409)
    }

    const result = await db.query(`
      INSERT INTO aegisky_supplier_applications (
        email, company_name, contact_name, phone, country, website,
        business_type, product_categories, year_established, annual_revenue,
        certifications, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING id, created_at
    `, [
      email.toLowerCase(), companyName, contactName, phone, country, website,
      businessType, productCategories || [], yearEstablished, annualRevenue,
      certifications || [], message,
    ])

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to supplier

    res.status(21).json({
      success: true,
      applicationId: result.rows[0].id,
      message: 'Application submitted successfully. Our team will review and contact you within 2-3 business days.',
    })
  })
}
