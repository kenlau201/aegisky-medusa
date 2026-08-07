/**
 * GET /store/admin/export/orders
 * Export orders as CSV
 */

const { getDbClient } = require('../../../../../lib/db')

function escapeCsv(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

module.exports = {
  GET: async (req, res) => {
    try {
      const db = getDbClient()
      const { status, from, to } = req.query

      let query = `
        SELECT order_number, customer_name, customer_email, customer_company,
               customer_country, subtotal, shipping_amount, tax_amount, total,
               currency, status, payment_status, fulfillment_status,
               shipping_method, created_at, paid_at
        FROM aegisky_orders
        WHERE 1=1
      `
      const params = []
      if (status) {
        params.push(status)
        query += ` AND status = $${params.length}`
      }
      if (from) {
        params.push(from)
        query += ` AND created_at >= $${params.length}`
      }
      if (to) {
        params.push(to)
        query += ` AND created_at <= $${params.length}`
      }
      query += ' ORDER BY created_at DESC LIMIT 10000'

      const result = await db.query(query, params)

      const headers = [
        'Order Number', 'Customer Name', 'Email', 'Company', 'Country',
        'Subtotal', 'Shipping', 'Tax', 'Total', 'Currency',
        'Status', 'Payment Status', 'Fulfillment Status',
        'Shipping Method', 'Created At', 'Paid At',
      ]

      const rows = result.rows.map(row => [
        row.order_number, row.customer_name, row.customer_email,
        row.customer_company, row.customer_country,
        row.subtotal, row.shipping_amount, row.tax_amount, row.total,
        row.currency, row.status, row.payment_status, row.fulfillment_status,
        row.shipping_method,
        row.created_at ? new Date(row.created_at).toISOString() : '',
        row.paid_at ? new Date(row.paid_at).toISOString() : '',
      ].map(escapeCsv).join(','))

      const csv = [headers.join(','), ...rows].join('\n')

      const filename = `orders-export-${new Date().toISOString().split('T')[0]}.csv`
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.send('\uFEFF' + csv)
    } catch (error) {
      console.error('Export error:', error)
      res.status(500).json({ error: 'Export failed' })
    }
  }
}
