/**
 * POST /store/rfq/quotes
 * Submit a quote for an RFQ (supplier side)
 * Creates a new version of the quote
 */
const { getDbClient } = require('../../../../lib/db')

export async function POST(req) {
  const db = getDbClient()

  try {
    const body = await req.json()
    const {
      rfqId,
      supplierName,
      supplierEmail,
      supplierPhone,
      unitPrice,
      totalPrice,
      quantity,
      moq,
      leadTimeDays,
      shippingCost,
      paymentTerms,
      incoterms,
      validUntil,
      supplierMessage,
    } = body

    if (!rfqId || !supplierName || !unitPrice) {
      return Response.json(
        { error: 'rfqId, supplierName, and unitPrice are required' },
        { status: 400 }
      )
    }

    // Check RFQ exists
    const rfqResult = await db.query(
      'SELECT id, customer_email, items FROM aegisky_rfqs WHERE id = $1',
      [rfqId]
    )

    if (rfqResult.rows.length === 0) {
      return Response.json({ error: 'RFQ not found' }, { status: 404 })
    }

    // Get latest version number
    const versionResult = await db.query(
      'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM aegisky_rfq_quotes WHERE rfq_id = $1',
      [rfqId]
    )
    const version = versionResult.rows[0].next_version

    // Insert quote
    const quoteResult = await db.query(
      `INSERT INTO aegisky_rfq_quotes
       (rfq_id, version, supplier_name, supplier_email, supplier_phone,
        unit_price, total_price, quantity, moq, lead_time_days,
        shipping_cost, payment_terms, incoterms, valid_until,
        supplier_message, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'submitted')
       RETURNING id, version`,
      [
        rfqId, version, supplierName, supplierEmail, supplierPhone,
        unitPrice, totalPrice, quantity, moq, leadTimeDays,
        shippingCost, paymentTerms, incoterms, validUntil,
        supplierMessage
      ]
    )

    // Log negotiation
    await db.query(
      `INSERT INTO aegisky_negotiation_log
       (rfq_id, quote_id, actor_type, actor_name, action, message, new_value)
       VALUES ($1,$2,'supplier',$3,'quote_submitted',$4,$5)`,
      [
        rfqId, quoteResult.rows[0].id, supplierName,
        supplierMessage || `Quote v${version} submitted`,
        JSON.stringify({ version, unitPrice, totalPrice, leadTimeDays })
      ]
    )

    return Response.json({
      success: true,
      quoteId: quoteResult.rows[0].id,
      version,
      message: `Quote v${version} submitted successfully`
    })

  } catch (error) {
    console.error('Submit quote error:', error)
    return Response.json({ error: 'Failed to submit quote' }, { status: 500 })
  }
}
