import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = `SELECT * FROM shop WHERE 1=1`;
    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT 200`;

    const result = await db.query(query, params);
    return NextResponse.json({ shops: result.rows });
  } catch (error: any) {
    console.error('List shops error:', error);
    return NextResponse.json({ shops: [], error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.query(`
      INSERT INTO shop (name, logo_url, description, contact_name, contact_phone, contact_email, address, is_self_operated, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING *
    `, [body.name, body.logo_url, body.description, body.contact_name, body.contact_phone, body.contact_email, body.address, body.is_self_operated || false]);

    return NextResponse.json({ success: true, shop: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
