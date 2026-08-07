import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const offset = (page - 1) * pageSize;
    const status = searchParams.get('status');

    let whereClause = '';
    const params: any[] = [];
    if (status && status !== 'all') {
      whereClause = 'WHERE status = $1';
      params.push(status);
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM coupon ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT * FROM coupon ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, pageSize, offset]);

    return NextResponse.json({
      coupons: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error('Get coupons error:', error);
    return NextResponse.json({ coupons: [], total: 0, error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.query(`
      INSERT INTO coupon (
        name, type, discount_amount, discount_percentage,
        min_spend, total_issue, per_user_limit,
        start_at, end_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      body.name,
      body.type, // 'fixed' or 'percentage'
      body.discount_amount || 0,
      body.discount_percentage || 0,
      body.min_spend || 0,
      body.total_issue || 100,
      body.per_user_limit || 1,
      body.start_at ? new Date(body.start_at) : new Date(),
      body.end_at ? new Date(body.end_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      body.status || 'active',
    ]);

    return NextResponse.json({ success: true, coupon: result.rows[0] });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
