/**
 * GET /store/invoices/:id/pdf
 * Download invoice as PDF
 */

const { getDbClient } = require('../../../../../lib/db')
const { createInvoiceForOrder, generateInvoicePDF } = require('../../../../../lib/invoice')
const { AppError } = require('../../../../../lib/security')

module.exports = {
  GET: async (req, res) => {
    try {
      const db = getDbClient()
      const invoiceId = req.params.id

      // Get invoice
      let invoiceResult = await db.query('SELECT * FROM aegisky_invoices WHERE id = $1', [invoiceId])

      // If invoice not found by UUID, try as order ID
      if (invoiceResult.rows.length === 0) {
        await createInvoiceForOrder(db, invoiceId)
        invoiceResult = await db.query('SELECT * FROM aegisky_invoices WHERE order_id = $1', [invoiceId])
      }

      if (invoiceResult.rows.length === 0) {
        throw new AppError('NOT_FOUND', 'Invoice not found', 404)
      }

      const invoice = invoiceResult.rows[0]

      // Get order
      const orderResult = await db.query('SELECT * FROM aegisky_orders WHERE id = $1', [invoice.order_id])
      const order = orderResult.rows[0]

      // Get line items
      const itemsResult = await db.query('SELECT * FROM aegisky_order_items WHERE order_id = $1', [invoice.order_id])
      const items = itemsResult.rows

      // Generate PDF
      const pdfBuffer = await generateInvoicePDF(invoice, order, items)

      // Mark as generated
      await db.query('UPDATE aegisky_invoices SET pdf_generated = true WHERE id = $1', [invoice.id])

      // Send PDF
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`)
      res.setHeader('Content-Length', pdfBuffer.length)
      res.send(pdfBuffer)

    } catch (error) {
      console.error('Invoice PDF error:', error)
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.code, message: error.message })
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to generate invoice' })
    }
  }
}
