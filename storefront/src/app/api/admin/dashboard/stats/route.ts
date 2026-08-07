import { NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET() {
  try {
    // 商品统计（从aegisky_products取）
    const products = await db.query(`SELECT COUNT(*) as total FROM aegisky_products`);

    // 店铺/供应商/售后/提现待办
    const pendingShops = await db.query(`SELECT COUNT(*) FROM shop WHERE status = 'pending'`);
    const pendingSuppliers = await db.query(`SELECT COUNT(*) FROM supplier WHERE status = 'pending'`);
    const pendingAftersales = await db.query(`SELECT COUNT(*) FROM aftersale WHERE status = 'pending'`);
    const pendingWithdrawals = await db.query(`SELECT COUNT(*) FROM withdrawal_request WHERE status = 'pending'`);

    // 优惠券和活动数量
    const activeCoupons = await db.query(`SELECT COUNT(*) FROM coupon WHERE status = 'active'`);
    const activePromotions = await db.query(`SELECT COUNT(*) FROM promotion WHERE status = 'active'`);

    return NextResponse.json({
      orders: { total: 0, pending: 0, today: 0 },
      products: {
        total: parseInt(products.rows[0]?.total || 0),
        pending_review: 0,
      },
      customers: { total: 0, today: 0 },
      revenue: { today: 0, total: 0 },
      pending: {
        shops: parseInt(pendingShops.rows[0]?.count || 0),
        suppliers: parseInt(pendingSuppliers.rows[0]?.count || 0),
        aftersales: parseInt(pendingAftersales.rows[0]?.count || 0),
        withdrawals: parseInt(pendingWithdrawals.rows[0]?.count || 0),
      },
      marketing: {
        active_coupons: parseInt(activeCoupons.rows[0]?.count || 0),
        active_promotions: parseInt(activePromotions.rows[0]?.count || 0),
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      orders: { total: 0, pending: 0, today: 0 },
      products: { total: 6384, pending_review: 0 },
      customers: { total: 0, today: 0 },
      revenue: { today: 0, total: 0 },
      pending: { shops: 0, suppliers: 0, aftersales: 0, withdrawals: 0 },
      marketing: { active_coupons: 0, active_promotions: 0 }
    });
  }
}
