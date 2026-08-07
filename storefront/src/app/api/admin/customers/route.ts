import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const keyword = searchParams.get('keyword') || '';
    const level = searchParams.get('level') || '';
    const offset = (page - 1) * pageSize;

    let where = [];
    let params: any[] = [];
    if (keyword) {
      where.push(`(email ILIKE $${params.length + 1} OR first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1} OR company ILIKE $${params.length + 1})`);
      params.push(`%${keyword}%`);
    }
    if (level) {
      where.push(`role = $${params.length + 1}`);
      params.push(level);
    }
    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM aegisky_customers ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT id, email, first_name, last_name, company, phone, country,
             role, email_verified, status, login_count, last_login, created_at
      FROM aegisky_customers ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, pageSize, offset]);

    return NextResponse.json({ customers: result.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error: any) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ customers: [], total: 0, error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.query(`
      INSERT INTO aegisky_customers (email, password_hash, first_name, last_name, company, phone, country, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'buyer', 'active') RETURNING id, email, first_name, last_name, created_at
    `, [
      body.email,
      body.password_hash || '$2a$10$placeholder',
      body.first_name || null,
      body.last_name || null,
      body.company || null,
      body.phone || null,
      body.country || null
    ]);
    return NextResponse.json({ success: true, customer: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
