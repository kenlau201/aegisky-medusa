import { NextResponse } from 'next/server';
import { pool } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

// GET /api/admin/rfq - list all RFQs
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             (SELECT COUNT(*) FROM aegisky_rfq_quotes q WHERE q.rfq_id = r.id) as quote_count
      FROM aegisky_rfqs r
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json({ rfqs: result.rows });
  } catch (error: any) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json({ rfqs: [], error: error.message }, { status: 500 });
  }
}

// POST /api/admin/rfq - create a new RFQ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_email, customer_name, company, country, phone, message, items } = body;

    const result = await pool.query(`
      INSERT INTO aegisky_rfqs (customer_email, customer_name, company, country, phone, message, items, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, 'pending')
      RETURNING *
    `, [customer_email, customer_name, company, country, phone, message, JSON.stringify(items || [])]);

    return NextResponse.json({ rfq: result.rows[0] });
  } catch (error: any) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
