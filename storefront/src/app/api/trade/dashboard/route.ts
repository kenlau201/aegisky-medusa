import { NextRequest, NextResponse } from 'next/server'
import { initTradeEngineTables, getDashboardStats, pool } from '@/lib/trade-engine/db'

export async function GET(request: NextRequest) {
  try {
    await initTradeEngineTables()
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

    const stats = await getDashboardStats(tenantId)

    // 最近订单
    const recentOrders = await pool.query(
      `SELECT po_number, buyer_name, supplier_name, status, total_amount, currency, created_at
       FROM te_purchase_orders WHERE tenant_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [tenantId]
    )

    // 按状态统计
    const byStatus = await pool.query(
      `SELECT status, COUNT(*) as count, SUM(total_amount) as value
       FROM te_purchase_orders WHERE tenant_id = $1 GROUP BY status`,
      [tenantId]
    )

    // 待办事项
    const todos = []
    const qcPending = await pool.query(
      `SELECT COUNT(*) FROM te_purchase_orders WHERE tenant_id = $1 AND status = 'QC_PENDING'`,
      [tenantId]
    )
    if (parseInt(qcPending.rows[0].count) > 0) {
      todos.push({ type: 'QC', count: parseInt(qcPending.rows[0].count), label: 'Awaiting QC inspection' })
    }

    const readyToShip = await pool.query(
      `SELECT COUNT(*) FROM te_purchase_orders WHERE tenant_id = $1 AND status = 'READY_TO_SHIP'`,
      [tenantId]
    )
    if (parseInt(readyToShip.rows[0].count) > 0) {
      todos.push({ type: 'SHIP', count: parseInt(readyToShip.rows[0].count), label: 'Ready to ship' })
    }

    const inTransit = await pool.query(
      `SELECT COUNT(*) FROM te_purchase_orders WHERE tenant_id = $1 AND status IN ('SHIPPED', 'IN_TRANSIT')`,
      [tenantId]
    )
    if (parseInt(inTransit.rows[0].count) > 0) {
      todos.push({ type: 'TRACK', count: parseInt(inTransit.rows[0].count), label: 'In transit - track updates' })
    }

    return NextResponse.json({
      stats,
      recent_orders: recentOrders.rows,
      by_status: byStatus.rows,
      action_items: todos,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
