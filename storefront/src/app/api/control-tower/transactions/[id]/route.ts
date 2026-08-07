import { NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'
import { validateTenant } from '@/lib/control-tower/compliance'
import { initControlTowerTables } from '@/lib/control-tower/db'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await initControlTowerTables()

    const tenantHeader = request.headers.get('X-AEGISKY-TENANT-ID')
    const tenantCheck = validateTenant(tenantHeader)
    if (!tenantCheck.valid) {
      return NextResponse.json({ error: tenantCheck.error }, { status: 401 })
    }

    const result = await pool.query(
      `SELECT * FROM ct_trade_transactions WHERE id = $1 AND tenant_id = $2`,
      [params.id, tenantCheck.tenantId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // 获取关联的审计日志
    const auditResult = await pool.query(
      `SELECT action, actor_id, actor_type, timestamp, new_values
       FROM ct_audit_trail
       WHERE entity_id = $1 AND entity_type = 'TRANSACTION'
       ORDER BY timestamp ASC`,
      [params.id]
    )

    // 获取关联文档
    const docsResult = await pool.query(
      `SELECT id, document_type, file_name, verified, created_at
       FROM ct_compliance_documents WHERE transaction_id = $1`,
      [params.id]
    )

    // 获取调度记录
    const dispatchResult = await pool.query(
      `SELECT id, warehouse, status, tracking_number, carrier, created_at
       FROM ct_dispatch_records WHERE transaction_id = $1`,
      [params.id]
    )

    return NextResponse.json({
      transaction: result.rows[0],
      audit_trail: auditResult.rows,
      documents: docsResult.rows,
      dispatches: dispatchResult.rows,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
