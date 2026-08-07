import { NextResponse } from 'next/server';
import { pool } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

// GET /api/rfq/[id] - public RFQ detail
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
      'SELECT id, version, supplier_name, unit_price, total_price, lead_time_days, status, created_at FROM aegisky_rfq_quotes WHERE rfq_id = $1 ORDER BY version DESC',
      [params.id]
    );

    return NextResponse.json({
      rfq: rfqResult.rows[0],
      quotes: quotesResult.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
