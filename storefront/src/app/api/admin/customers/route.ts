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
      where.push(`(username ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1})`);
      params.push(`%${keyword}%`);
    }
    if (level) {
      where.push(`level_name = $${params.length + 1}`);
      params.push(level);
    }
    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM customer ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT * FROM customer ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, pageSize, offset]);

    return NextResponse.json({ customers: result.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error: any) {
    return NextResponse.json({ customers: [], total: 0, error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.query(`
      INSERT INTO customer (username, email, phone, level_name, points)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [body.username, body.email, body.phone, body.level_name || '普通会员', body.points || 0]);
    return NextResponse.json({ success: true, customer: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
