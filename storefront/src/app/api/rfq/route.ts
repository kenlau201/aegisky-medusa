import { NextResponse } from 'next/server';
import { pool } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

// GET /api/rfq - public RFQ list for suppliers
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             (SELECT COUNT(*) FROM aegisky_rfq_quotes q WHERE q.rfq_id = r.id) as quote_count
      FROM aegisky_rfqs r
      WHERE r.status IN ('pending', 'quoted')
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json({ rfqs: result.rows });
  } catch (error: any) {
    console.error('Error fetching public RFQs:', error);
    return NextResponse.json({ rfqs: [], error: error.message }, { status: 500 });
  }
}
