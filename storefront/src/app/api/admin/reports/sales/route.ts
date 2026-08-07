import { NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalRes, countRes, monthlyRes] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(total), 0) as total FROM aegisky_orders WHERE status NOT IN ('cancelled')`),
      db.query(`SELECT COUNT(*) as count FROM aegisky_orders`),
      db.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM') as month,
               COUNT(*) as count,
               COALESCE(SUM(total), 0) as revenue
        FROM aegisky_orders
        WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month
      `),
    ]);

    const totalRevenue = parseFloat(totalRes.rows[0]?.total || 0);
    const orderCount = parseInt(countRes.rows[0]?.count || 0);

    // Build 12 months data
    const monthlyMap = new Map<string, { revenue: number; count: number }>();
    monthlyRes.rows.forEach(r => {
      monthlyMap.set(r.month, { revenue: parseFloat(r.revenue), count: parseInt(r.count) });
    });

    const now = new Date();
    const year = now.getFullYear();
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, '0')}`;
      const data = monthlyMap.get(key) || { revenue: 0, count: 0 };
      monthlyData.push({ month: `${String(m).padStart(2, '0')}月`, revenue: data.revenue, count: data.count });
    }

    return NextResponse.json({
      totalRevenue,
      orderCount,
      avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
      monthlyData,
    });
  } catch (error: any) {
    console.error('Sales report error:', error);
    return NextResponse.json(
      { totalRevenue: 0, orderCount: 0, avgOrderValue: 0, monthlyData: [] },
      { status: 200 }
    );
  }
}
