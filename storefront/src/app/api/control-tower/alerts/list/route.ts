import { NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'
import { validateTenant } from '@/lib/control-tower/compliance'
import { initControlTowerTables } from '@/lib/control-tower/db'

export async function GET(request: Request) {
  try {
    await initControlTowerTables()

    const tenantHeader = request.headers.get('X-AEGISKY-TENANT-ID')
    const tenantCheck = validateTenant(tenantHeader)
    if (!tenantCheck.valid) {
      return NextResponse.json({ error: tenantCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'OPEN'
    const severity = searchParams.get('severity')

    let whereClause = 'WHERE tenant_id = $1'
    const params: any[] = [tenantCheck.tenantId]

    if (status !== 'ALL') {
      params.push(status)
      whereClause += ` AND status = $${params.length}`
    }
    if (severity) {
      params.push(severity)
      whereClause += ` AND severity = $${params.length}`
    }

    const result = await pool.query(
      `SELECT id, alert_type, severity, entity_type, entity_id,
              title, description, status, assigned_to, created_at
       FROM ct_compliance_alerts
       ${whereClause}
       ORDER BY
         CASE severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'WARNING' THEN 3 ELSE 4 END,
         created_at DESC`,
      params
    )

    // 统计
    const statsResult = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'OPEN') as open,
        COUNT(*) FILTER (WHERE status = 'OPEN' AND severity = 'CRITICAL') as critical,
        COUNT(*) FILTER (WHERE status = 'OPEN' AND severity = 'HIGH') as high
       FROM ct_compliance_alerts
       WHERE tenant_id = $1`,
      [tenantCheck.tenantId]
    )

    return NextResponse.json({
      alerts: result.rows,
      stats: statsResult.rows[0],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
