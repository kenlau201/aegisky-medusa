import { NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [revenueRes, ordersRes, statusRes, recentRes, pendingRes, paidRes] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(total), 0) as total FROM aegisky_orders WHERE status NOT IN ('cancelled')`),
      db.query(`SELECT COUNT(*) as count FROM aegisky_orders`),
      db.query(`SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM aegisky_orders GROUP BY status ORDER BY total DESC`),
      db.query(`SELECT order_number, total, status, created_at, customer_name FROM aegisky_orders ORDER BY created_at DESC LIMIT 10`),
      db.query(`SELECT COALESCE(SUM(total), 0) as total FROM aegisky_orders WHERE status IN ('pending', 'pending_payment')`),
      db.query(`SELECT COALESCE(SUM(total), 0) as total FROM aegisky_orders WHERE status IN ('paid', 'shipped', 'completed')`),
    ]);

    const totalRevenue = parseFloat(revenueRes.rows[0]?.total || 0);
    const orderCount = parseInt(ordersRes.rows[0]?.count || 0);

    return NextResponse.json({
      totalRevenue,
      orderCount,
      avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
      pendingRevenue: parseFloat(pendingRes.rows[0]?.total || 0),
      paidRevenue: parseFloat(paidRes.rows[0]?.total || 0),
      currency: 'USD',
      statusBreakdown: statusRes.rows.map(r => ({
        status: r.status,
        count: parseInt(r.count),
        total: parseFloat(r.total),
      })),
      recentOrders: recentRes.rows.map(r => ({
        order_number: r.order_number,
        total: parseFloat(r.total),
        status: r.status,
        created_at: r.created_at,
        customer_name: r.customer_name,
      })),
    });
  } catch (error: any) {
    console.error('Finance overview error:', error);
    return NextResponse.json(
      { totalRevenue: 0, orderCount: 0, avgOrderValue: 0, pendingRevenue: 0, paidRevenue: 0, currency: 'USD', statusBreakdown: [], recentOrders: [] },
      { status: 200 }
    );
  }
}
