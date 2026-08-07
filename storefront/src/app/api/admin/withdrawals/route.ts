import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * pageSize;

    let where = [];
    let params: any[] = [];
    if (status && status !== 'all') {
      where.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM withdrawal_request ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT * FROM withdrawal_request ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, pageSize, offset]);

    return NextResponse.json({ withdrawals: result.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error: any) {
    return NextResponse.json({ withdrawals: [], total: 0, error: error.message });
  }
}
