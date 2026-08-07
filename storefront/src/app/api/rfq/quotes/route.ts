import { NextResponse } from 'next/server';
import { pool } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

// POST /api/rfq/quotes - submit a quote for an RFQ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      rfqId, supplierName, supplierEmail, supplierPhone,
      unitPrice, totalPrice, quantity, moq, leadTimeDays,
      shippingCost, paymentTerms, incoterms, validUntil, supplierMessage
    } = body;

    if (!rfqId || !supplierName) {
      return NextResponse.json({ error: 'RFQ ID and supplier name are required' }, { status: 400 });
    }

    // Get next version number
    const versionResult = await pool.query(
      'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM aegisky_rfq_quotes WHERE rfq_id = $1',
      [rfqId]
    );
    const nextVersion = versionResult.rows[0].next_version;

    const result = await pool.query(`
      INSERT INTO aegisky_rfq_quotes (
        rfq_id, version, supplier_name, supplier_email, supplier_phone,
        unit_price, total_price, quantity, moq, lead_time_days,
        shipping_cost, payment_terms, incoterms, valid_until, status, supplier_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'submitted', $15)
      RETURNING *
    `, [
      rfqId, nextVersion, supplierName, supplierEmail || null, supplierPhone || null,
      unitPrice, totalPrice || unitPrice * (quantity || 1), quantity || null, moq || 1, leadTimeDays,
      shippingCost || 0, paymentTerms || 'Net-30', incoterms || 'FOB', validUntil || null, supplierMessage || null
    ]);

    // Update RFQ status to 'quoted'
    await pool.query(
      "UPDATE aegisky_rfqs SET status = 'quoted' WHERE id = $1 AND status = 'pending'",
      [rfqId]
    );

    return NextResponse.json({ success: true, quote: result.rows[0] });
  } catch (error: any) {
    console.error('Quote submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
