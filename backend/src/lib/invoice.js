/**
 * PDF Invoice Generator
 * Sprint 4+: B2B invoice generation with PDFKit
 */

const PDFDocument = require('pdfkit')
const { getDbClient } = require('./db')

const COMPANY_INFO = {
  name: 'Aegisky Inc.',
  address: 'Cyberport 3, 100 Cyberport Road',
  city: 'Hong Kong',
  country: 'Hong Kong SAR',
  email: 'orders@aegisky.com',
  website: 'www.aegisky.com',
  bankName: 'HSBC Hong Kong',
  bankAccount: '808-XXXXXX-XXX',
  swiftCode: 'HSBCHKHHHKH',
}

/**
 * Generate invoice number
 */
async function generateInvoiceNumber(db) {
  const result = await db.query("SELECT nextval('invoice_number_seq') as num")
  const num = result.rows[0].num
  const year = new Date().getFullYear()
  return `INV-${year}-${String(num).padStart(6, '0')}`
}

/**
 * Create an invoice for an order
 */
async function createInvoiceForOrder(db, orderId) {
  // Get order
  const orderResult = await db.query(
    'SELECT * FROM aegisky_orders WHERE id = $1',
    [orderId]
  )
  if (orderResult.rows.length === 0) {
    throw new Error('Order not found')
  }
  const order = orderResult.rows[0]

  // Get order items
  const itemsResult = await db.query(
    'SELECT * FROM aegisky_order_items WHERE order_id = $1',
    [orderId]
  )
  const items = itemsResult.rows

  // Check if invoice already exists
  const existing = await db.query(
    'SELECT id FROM aegisky_invoices WHERE order_id = $1',
    [orderId]
  )
  if (existing.rows.length > 0) {
    return existing.rows[0].id
  }

  const invoiceNumber = await generateInvoiceNumber(db)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30) // Net 30

  const invoice = await db.query(`
    INSERT INTO aegisky_invoices (
      invoice_number, order_id, customer_id, due_date,
      subtotal, tax_amount, shipping_amount, discount_amount, total,
      currency, billing_address, company_info, line_items, payment_terms,
      status, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING id
  `, [
    invoiceNumber,
    orderId,
    order.customer_id || null,
    dueDate,
    order.subtotal,
    order.tax_amount || 0,
    order.shipping_amount || 0,
    order.discount_amount || 0,
    order.total,
    order.currency,
    order.billing_address || order.shipping_address,
    COMPANY_INFO,
    JSON.stringify(items),
    'Net 30 days',
    order.payment_status === 'paid' ? 'paid' : 'issued',
    'Thank you for your business!',
  ])

  return invoice.rows[0].id
}

/**
 * Generate PDF buffer for an invoice
 */
function generateInvoicePDF(invoice, order, items) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'right' })
    doc.fontSize(12).font('Helvetica').text(invoice.invoice_number, { align: 'right' })
    doc.moveDown()

    // Company info
    doc.fontSize(14).font('Helvetica-Bold').text(COMPANY_INFO.name)
    doc.fontSize(10).font('Helvetica')
    doc.text(COMPANY_INFO.address)
    doc.text(`${COMPANY_INFO.city}, ${COMPANY_INFO.country}`)
    doc.text(`Email: ${COMPANY_INFO.email}`)
    doc.text(`Web: ${COMPANY_INFO.website}`)
    doc.moveDown()

    // Bill to
    const billTo = invoice.billing_address || {}
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To:')
    doc.fontSize(10).font('Helvetica')
    if (billTo.name) doc.text(billTo.name)
    if (billTo.company) doc.text(billTo.company)
    if (billTo.address1) doc.text(billTo.address1)
    if (billTo.address2) doc.text(billTo.address2)
    if (billTo.city) doc.text(`${billTo.city || ''} ${billTo.state || ''} ${billTo.zip || ''}`.trim())
    if (billTo.country) doc.text(billTo.country)
    if (order.customer_email) doc.text(order.customer_email)
    doc.moveDown()

    // Invoice details
    const invoiceDate = new Date(invoice.invoice_date).toLocaleDateString('en-US')
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-US')
    doc.fontSize(10).font('Helvetica')
    doc.text(`Invoice Date: ${invoiceDate}`, { align: 'right' })
    doc.text(`Due Date: ${dueDate}`, { align: 'right' })
    doc.text(`Order Number: ${order.order_number}`, { align: 'right' })
    doc.text(`Currency: ${invoice.currency}`, { align: 'right' })
    doc.moveDown()

    // Items table
    const tableTop = doc.y
    doc.font('Helvetica-Bold').fontSize(10)
    doc.text('Item', 50, tableTop)
    doc.text('Qty', 300, tableTop, { width: 50, align: 'right' })
    doc.text('Unit Price', 360, tableTop, { width: 80, align: 'right' })
    doc.text('Total', 450, tableTop, { width: 100, align: 'right' })
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke()
    doc.moveDown()

    doc.font('Helvetica').fontSize(9)
    let y = tableTop + 25
    const lineItems = items || (invoice.line_items ? JSON.parse(invoice.line_items) : [])

    lineItems.forEach(item => {
      if (y > 700) {
        doc.addPage()
        y = 50
      }
      const name = item.product_name || item.name || 'Product'
      const sku = item.sku ? ` (SKU: ${item.sku})` : ''
      doc.text(name + sku, 50, y, { width: 240 })
      doc.text(String(item.quantity || 1), 300, y, { width: 50, align: 'right' })
      doc.text(formatCurrency(item.unit_price, invoice.currency), 360, y, { width: 80, align: 'right' })
      doc.text(formatCurrency(item.total_price || item.unit_price * (item.quantity || 1), invoice.currency), 450, y, { width: 100, align: 'right' })
      y += 20
    })

    // Totals
    y += 10
    doc.moveTo(350, y).lineTo(550, y).stroke()
    y += 10

    const addTotalLine = (label, amount, isBold = false) => {
      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10)
      doc.text(label, 360, y, { width: 80, align: 'right' })
      doc.text(formatCurrency(amount, invoice.currency), 450, y, { width: 100, align: 'right' })
      y += 20
    }

    addTotalLine('Subtotal:', invoice.subtotal)
    if (invoice.shipping_amount > 0) addTotalLine('Shipping:', invoice.shipping_amount)
    if (invoice.tax_amount > 0) addTotalLine('Tax:', invoice.tax_amount)
    if (invoice.discount_amount > 0) addTotalLine('Discount:', -invoice.discount_amount)
    addTotalLine('Total:', invoice.total, true)

    // Payment terms
    y += 20
    doc.font('Helvetica-Bold').fontSize(10).text('Payment Terms', 50, y)
    y += 15
    doc.font('Helvetica').fontSize(9)
    doc.text(`Terms: ${invoice.payment_terms || 'Net 30 days'}`)
    doc.text(`Bank: ${COMPANY_INFO.bankName}`)
    doc.text(`Account: ${COMPANY_INFO.bankAccount}`)
    doc.text(`SWIFT: ${COMPANY_INFO.swiftCode}`)
    doc.moveDown()

    // Notes
    if (invoice.notes) {
      doc.moveDown()
      doc.font('Helvetica-Oblique').fontSize(9).text(invoice.notes)
    }

    // Footer
    doc.fontSize(8).font('Helvetica')
    doc.text(
      'Aegisky Inc. acts as an agent and collects payment on behalf of the supplier. ' +
      'The actual seller of record is the supplier.',
      50, doc.page.height - 50, { width: 500, align: 'center', color: 'gray' }
    )

    doc.end()
  })
}

function formatCurrency(amount, currency = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£', RUB: '₽', CNY: '¥', JPY: '¥', AED: 'AED ', SAR: 'SAR ' }
  const sym = symbols[currency] || currency + ' '
  return `${sym}${Number(amount).toFixed(2)}`
}

module.exports = {
  createInvoiceForOrder,
  generateInvoicePDF,
  generateInvoiceNumber,
  COMPANY_INFO,
}
