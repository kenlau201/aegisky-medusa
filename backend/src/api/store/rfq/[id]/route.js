/**
 * GET /store/rfq/:id
 * Get RFQ details with quote history and negotiation log
 */
const { getDbClient } = require('../../../../lib/db')

export async function GET(req, { params }) {
  const db = getDbClient()

  try {
    const { id } = params

    // Get RFQ
    const rfqResult = await db.query(
      'SELECT * FROM aegisky_rfqs WHERE id = $1',
      [id]
    )

    if (rfqResult.rows.length === 0) {
      return Response.json({ error: 'RFQ not found' }, { status: 404 })
    }

    // Get all quotes (version history)
    const quotesResult = await db.query(
      `SELECT * FROM aegisky_rfq_quotes
       WHERE rfq_id = $1
       ORDER BY version DESC`,
      [id]
    )

    // Get negotiation log
    const logResult = await db.query(
      `SELECT * FROM aegisky_negotiation_log
       WHERE rfq_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    )

    return Response.json({
      rfq: rfqResult.rows[0],
      quotes: quotesResult.rows,
      negotiationLog: logResult.rows,
      latestQuote: quotesResult.rows[0] || null,
    })

  } catch (error) {
    console.error('Get RFQ error:', error)
    return Response.json({ error: 'Failed to fetch RFQ' }, { status: 500 })
  }
}

/**
 * POST /store/rfq/:id/respond
 * Buyer responds to a quote (accept/reject/counter)
 */
export async function POST(req, { params }) {
  const db = getDbClient()

  try {
    const { id } = params
    const body = await req.json()
    const { action, quoteId, buyerMessage, counterPrice, counterLeadTime } = body

    if (!['accept', 'reject', 'counter'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get RFQ
    const rfqResult = await db.query(
      'SELECT * FROM aegisky_rfqs WHERE id = $1',
      [id]
    )

    if (rfqResult.rows.length === 0) {
      return Response.json({ error: 'RFQ not found' }, { status: 404 })
    }

    if (action === 'accept') {
      // Mark quote as accepted
      await db.query(
        `UPDATE aegisky_rfq_quotes SET status = 'accepted', updated_at = NOW()
         WHERE id = $1`,
        [quoteId]
      )

      // Mark other quotes as rejected
      await db.query(
        `UPDATE aegisky_rfq_quotes SET status = 'rejected', updated_at = NOW()
         WHERE rfq_id = $1 AND id != $2 AND status NOT IN ('accepted', 'converted')`,
        [id, quoteId]
      )

      // Log
      await db.query(
        `INSERT INTO aegisky_negotiation_log
         (rfq_id, quote_id, actor_type, actor_name, action, message)
         VALUES ($1,$2,'buyer',$3,'quote_accepted',$4)`,
        [id, quoteId, rfqResult.rows[0].customer_name, buyerMessage || 'Quote accepted']
      )

      return Response.json({
        success: true,
        status: 'accepted',
        message: 'Quote accepted. Proceed to checkout.',
        checkoutQuoteId: quoteId,
      })
    }

    if (action === 'reject') {
      await db.query(
        `UPDATE aegisky_rfq_quotes SET status = 'rejected', buyer_message = $2, updated_at = NOW()
         WHERE id = $1`,
        [quoteId, buyerMessage]
      )

      await db.query(
        `INSERT INTO aegisky_negotiation_log
         (rfq_id, quote_id, actor_type, actor_name, action, message)
         VALUES ($1,$2,'buyer',$3,'quote_rejected',$4)`,
        [id, quoteId, rfqResult.rows[0].customer_name, buyerMessage || 'Quote rejected']
      )

      return Response.json({ success: true, status: 'rejected' })
    }

    if (action === 'counter') {
      // Mark current quote as countered
      await db.query(
        `UPDATE aegisky_rfq_quotes SET status = 'countered', buyer_message = $2, updated_at = NOW()
         WHERE id = $1`,
        [quoteId, buyerMessage]
      )

      // Log counter offer
      await db.query(
        `INSERT INTO aegisky_negotiation_log
         (rfq_id, quote_id, actor_type, actor_name, action, message, new_value)
         VALUES ($1,$2,'buyer',$3,'counter_offer',$4,$5)`,
        [
          id, quoteId, rfqResult.rows[0].customer_name,
          buyerMessage || 'Counter offer submitted',
          JSON.stringify({ counterPrice, counterLeadTime })
        ]
      )

      return Response.json({
        success: true,
        status: 'countered',
        message: 'Counter offer sent to supplier',
      })
    }

  } catch (error) {
    console.error('RFQ respond error:', error)
    return Response.json({ error: 'Failed to process response' }, { status: 500 })
  }
}
