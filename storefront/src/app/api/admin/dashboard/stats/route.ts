import { NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Parallel queries for all dashboard stats
    const [
      productsRes,
      ordersRes,
      customersRes,
      revenueRes,
      todayOrdersRes,
      todayRevenueRes,
      pendingShopsRes,
      supplierAppsRes,
      aftersalesRes,
      withdrawalsRes,
      couponsRes,
      rfqsRes,
      reviewsRes,
      inventoryLogsRes,
      lowStockRes,
      categoriesRes,
      brandsRes,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) as total FROM aegisky_products`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_orders`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_customers`),
      db.query(`SELECT COALESCE(SUM(total), 0) as total FROM aegisky_orders WHERE status NOT IN ('cancelled')`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_orders WHERE created_at >= CURRENT_DATE`),
      db.query(`SELECT COALESCE(SUM(total), 0) as total FROM aegisky_orders WHERE created_at >= CURRENT_DATE AND status NOT IN ('cancelled')`),
      db.query(`SELECT COUNT(*) as total FROM shop WHERE status = 'pending'`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_supplier_applications WHERE status = 'pending'`),
      db.query(`SELECT COUNT(*) as total FROM aftersale WHERE status = 'pending'`),
      db.query(`SELECT COUNT(*) as total FROM withdrawal_request WHERE status = 'pending'`),
      db.query(`SELECT COUNT(*) as total FROM coupon WHERE status = 'active'`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_rfqs WHERE status = 'pending'`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_reviews WHERE status = 'pending'`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_inventory_logs`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_products WHERE stock_quantity < 10 AND in_stock = true`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_categories`),
      db.query(`SELECT COUNT(*) as total FROM aegisky_brands`),
    ]);

    // Recent orders for chart (last 7 days)
    const weeklyOrders = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
      FROM aegisky_orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at) ORDER BY date
    `);

    // Order status breakdown
    const orderStatuses = await db.query(`
      SELECT status, COUNT(*) as count FROM aegisky_orders GROUP BY status
    `);

    // Top brands by product count
    const topBrands = await db.query(`
      SELECT name, product_count FROM aegisky_brands
      WHERE product_count > 0 ORDER BY product_count DESC LIMIT 5
    `);

    return NextResponse.json({
      products: {
        total: parseInt(productsRes.rows[0]?.total || 0),
        low_stock: parseInt(lowStockRes.rows[0]?.total || 0),
        categories: parseInt(categoriesRes.rows[0]?.total || 0),
        brands: parseInt(brandsRes.rows[0]?.total || 0),
      },
      orders: {
        total: parseInt(ordersRes.rows[0]?.total || 0),
        today: parseInt(todayOrdersRes.rows[0]?.total || 0),
        statuses: orderStatuses.rows,
      },
      customers: {
        total: parseInt(customersRes.rows[0]?.total || 0),
      },
      revenue: {
        total: parseFloat(revenueRes.rows[0]?.total || 0),
        today: parseFloat(todayRevenueRes.rows[0]?.total || 0),
      },
      pending: {
        shops: parseInt(pendingShopsRes.rows[0]?.total || 0),
        suppliers: parseInt(supplierAppsRes.rows[0]?.total || 0),
        aftersales: parseInt(aftersalesRes.rows[0]?.total || 0),
        withdrawals: parseInt(withdrawalsRes.rows[0]?.total || 0),
        rfqs: parseInt(rfqsRes.rows[0]?.total || 0),
        reviews: parseInt(reviewsRes.rows[0]?.total || 0),
      },
      marketing: {
        active_coupons: parseInt(couponsRes.rows[0]?.total || 0),
      },
      inventory: {
        total_logs: parseInt(inventoryLogsRes.rows[0]?.total || 0),
      },
      weekly: weeklyOrders.rows,
      top_brands: topBrands.rows,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      {
        products: { total: 0, low_stock: 0, categories: 0, brands: 0 },
        orders: { total: 0, today: 0, statuses: [] },
        customers: { total: 0 },
        revenue: { total: 0, today: 0 },
        pending: { shops: 0, suppliers: 0, aftersales: 0, withdrawals: 0, rfqs: 0, reviews: 0 },
        marketing: { active_coupons: 0 },
        inventory: { total_logs: 0 },
        weekly: [],
        top_brands: [],
        error: error.message,
      },
      { status: 200 }
    );
  }
}
