/**
 * Email Service
 * Sprint 3: Transactional email framework
 *
 * In production, configure with:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * - Or Resend/SendGrid/Postmark API key
 *
 * For development, emails are logged to console.
 */

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@aegisky.com'
const PLATFORM_NAME = 'Aegisky'
const PLATFORM_ROLE = 'Payment Collection Agent'

/**
 * Send email - logs in dev, sends via SMTP in production
 */
async function sendEmail(options) {
  const { to, subject, html, text } = options

  // Log email for development
  console.log(`[EMAIL] To: ${to}, Subject: ${subject}`)

  // In production, integrate with SMTP or email API
  if (process.env.SMTP_HOST) {
    // Production SMTP implementation would go here
    // const nodemailer = require('nodemailer')
    // ...
  }

  return { success: true, messageId: `dev_${Date.now()}` }
}

/**
 * Order confirmation email - includes payment collection disclosure
 */
async function sendOrderConfirmationEmail(order) {
  const { order_number, customer_email, customer_name, items, total, currency } = order

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.product_name}</strong><br/>
        <small>SKU: ${item.sku || 'N/A'}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.unit_price}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.total_price}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 24px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 16px 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; font-size: 12px; color: #6b7280; }
        .disclosure { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; }
        .disclosure-title { font-weight: bold; color: #92400e; margin-bottom: 8px; }
        .disclosure-text { font-size: 14px; color: #78350f; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; color: #6b7280; }
        .total-row { font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Order Confirmation</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Order #${order_number}</p>
      </div>
      <div class="content">
        <p>Dear ${customer_name || 'Valued Customer'},</p>
        <p>Thank you for your order. We have received your payment and your order is being processed.</p>

        <!-- Sprint 3: Payment Collection Disclosure -->
        <div class="disclosure">
          <div class="disclosure-title">⚠️ Payment Collection Notice</div>
          <div class="disclosure-text">
            <strong>${PLATFORM_NAME} Inc.</strong> acts as an agent and collects payment on behalf of the supplier.
            The actual seller of record is the supplier as indicated on your order.
            For any product-related questions, warranty claims, or returns, please contact the supplier directly.
          </div>
        </div>

        <h3 style="margin-top: 24px;">Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" style="padding: 12px; text-align: right;">Order Total:</td>
              <td style="padding: 12px; text-align: right;">$${total} ${currency ? currency.toUpperCase() : ''}</td>
            </tr>
          </tfoot>
        </table>

        <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
          You will receive another email when your order ships with tracking information.
        </p>
      </div>
      <div class="footer">
        <p><strong>${PLATFORM_NAME}</strong> — Global Drone & UAV Supply Chain Platform</p>
        <p>This email was sent to ${customer_email}. If you did not place this order, please contact support immediately.</p>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: customer_email,
    subject: `Order Confirmation #${order_number}`,
    html,
    text: `Order #${order_number} confirmed. Total: $${total} ${currency}. ${PLATFORM_NAME} acts as payment collection agent.`,
  })
}

/**
 * RFQ submitted confirmation
 */
async function sendRFQConfirmationEmail(rfq) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>RFQ Received</h2>
      <p>Dear ${rfq.customer_name},</p>
      <p>Your Request for Quotation has been received and is being reviewed by our supplier network.</p>
      <p>RFQ ID: <strong>${rfq.id}</strong></p>
      <p>You will receive quotes from suppliers within 24-48 hours.</p>
    </div>
  `

  await sendEmail({
    to: rfq.customer_email,
    subject: `RFQ Confirmation #${rfq.id}`,
    html,
  })
}

/**
 * New quote notification to buyer
 */
async function sendNewQuoteNotification(rfq, quote) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Quote Received</h2>
      <p>You have received a new quote for your RFQ #${rfq.id}.</p>
      <p><strong>Supplier:</strong> ${quote.supplier_name}</p>
      <p><strong>Unit Price:</strong> $${quote.unit_price}</p>
      <p><strong>Lead Time:</strong> ${quote.lead_time_days} days</p>
      <p>Log in to your account to review and accept this quote.</p>
    </div>
  `

  await sendEmail({
    to: rfq.customer_email,
    subject: `New Quote for RFQ #${rfq.id}`,
    html,
  })
}

/**
 * Payment receipt
 */
async function sendPaymentReceiptEmail(order, payment) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Receipt</h2>
      <p>Payment for order <strong>#${order.order_number}</strong> has been received.</p>
      <p><strong>Amount:</strong> $${payment.amount} ${payment.currency ? payment.currency.toUpperCase() : ''}</p>
      <p><strong>Transaction ID:</strong> ${payment.stripe_payment_intent_id || 'N/A'}</p>

      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 14px;">
          <strong>Payment Collection Notice:</strong> Aegisky Inc. collected this payment as an agent on behalf of the supplier.
        </p>
      </div>
    </div>
  `

  await sendEmail({
    to: order.customer_email,
    subject: `Payment Receipt — Order #${order.order_number}`,
    html,
  })
}

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendRFQConfirmationEmail,
  sendNewQuoteNotification,
  sendPaymentReceiptEmail,
}
