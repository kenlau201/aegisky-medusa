import { NextResponse } from 'next/server';
import { pool } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

// POST /api/rfq/submit - submit a new RFQ from storefront
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_email, customer_name, company, country, phone, message, items } = body;

    if (!customer_email || !customer_name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    const result = await pool.query(`
      INSERT INTO aegisky_rfqs (customer_email, customer_name, company, country, phone, message, items, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, 'pending')
      RETURNING *
    `, [
      customer_email,
      customer_name,
      company || null,
      country || null,
      phone || null,
      message || null,
      JSON.stringify(items || []),
    ]);

    return NextResponse.json({ success: true, rfq: result.rows[0] });
  } catch (error: any) {
    console.error('RFQ submit error:', error);
    return NextResponse.json({ error: 'Failed to submit RFQ' }, { status: 500 });
  }
}
