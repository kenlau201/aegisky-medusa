import { NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [activeRes, totalRes, couponsRes] = await Promise.all([
      db.query(`SELECT COUNT(*) as count FROM coupon WHERE status = 'active'`),
      db.query(`SELECT COUNT(*) as count FROM coupon`),
      db.query(`SELECT id, name, type, discount_amount, discount_percentage, status, start_at, end_at FROM coupon ORDER BY created_at DESC LIMIT 20`),
    ]);

    return NextResponse.json({
      activeCoupons: parseInt(activeRes.rows[0]?.count || 0),
      totalCoupons: parseInt(totalRes.rows[0]?.count || 0),
      coupons: couponsRes.rows.map(c => ({
        id: c.id,
        name: c.name,
        code: c.name?.toUpperCase().replace(/\s+/g, ''),
        discount_type: c.type,
        discount_value: c.type === 'percentage' ? Number(c.discount_percentage) : Number(c.discount_amount),
        status: c.status,
        valid_from: c.start_at,
        valid_to: c.end_at,
      })),
    });
  } catch (error: any) {
    console.error('Promotions overview error:', error);
    return NextResponse.json(
      { activeCoupons: 0, totalCoupons: 0, coupons: [] },
      { status: 200 }
    );
  }
}
