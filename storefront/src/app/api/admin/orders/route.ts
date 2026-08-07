import { NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const offset = (page - 1) * pageSize;

    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (status && status !== 'all') {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (order_number ILIKE $${params.length} OR customer_name ILIKE $${params.length} OR customer_email ILIKE $${params.length})`;
    }

    const countRes = await db.query(`SELECT COUNT(*) as total FROM aegisky_orders ${where}`, params);
    const total = parseInt(countRes.rows[0]?.total || 0);

    params.push(pageSize, offset);
    const result = await db.query(
      `SELECT o.id, o.order_number, o.customer_name, o.customer_email, o.total, o.currency,
              o.status, o.payment_status, o.fulfillment_status, o.created_at,
              (SELECT COUNT(*) FROM aegisky_order_items oi WHERE oi.order_id = o.id) as item_count
       FROM aegisky_orders o ${where}
       ORDER BY o.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json({
      orders: result.rows.map(r => ({
        ...r,
        total: parseFloat(r.total),
        item_count: parseInt(r.item_count),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e: any) {
    console.error('Admin orders error:', e);
    return NextResponse.json({ orders: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
  }
}
