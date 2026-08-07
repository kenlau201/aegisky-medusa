import { NextResponse } from 'next/server';
import { pool } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

// GET /api/admin/rfq/[id] - get single RFQ with quotes and negotiation log
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const rfqResult = await pool.query(
      'SELECT * FROM aegisky_rfqs WHERE id = $1',
      [params.id]
    );
    if (rfqResult.rows.length === 0) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    const quotesResult = await pool.query(
      'SELECT * FROM aegisky_rfq_quotes WHERE rfq_id = $1 ORDER BY version DESC',
      [params.id]
    );

    // Check if negotiation log table exists
    let negotiationLog: any[] = [];
    try {
      const logResult = await pool.query(
        'SELECT * FROM aegisky_negotiation_log WHERE rfq_id = $1 ORDER BY created_at DESC',
        [params.id]
      );
      negotiationLog = logResult.rows;
    } catch {
      // Table might not exist
    }

    return NextResponse.json({
      rfq: rfqResult.rows[0],
      quotes: quotesResult.rows,
      negotiationLog,
    });
  } catch (error: any) {
    console.error('Error fetching RFQ:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/rfq/[id] - update RFQ status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status } = body;

    const result = await pool.query(
      'UPDATE aegisky_rfqs SET status = $1 WHERE id = $2 RETURNING *',
      [status, params.id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }
    return NextResponse.json({ rfq: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
