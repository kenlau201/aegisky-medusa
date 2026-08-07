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
    const status = searchParams.get('status')

    let whereClause = 'WHERE tenant_id = $1'
    const params: any[] = [tenantCheck.tenantId]

    if (status) {
      params.push(status)
      whereClause += ` AND status = $${params.length}`
    }

    const result = await pool.query(
      `SELECT id, license_number, issuing_authority, issuing_country, license_type,
              consignee_name, consignee_country, quantity_approved, quantity_used,
              issue_date, expiry_date, status, created_at
       FROM ct_export_licenses
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    )

    // 检查即将过期的许可证
    const expiringResult = await pool.query(
      `SELECT COUNT(*) as cnt FROM ct_export_licenses
       WHERE status = 'ACTIVE' AND expiry_date < NOW() + INTERVAL '30 days'`
    )

    return NextResponse.json({
      licenses: result.rows,
      expiring_soon: parseInt(expiringResult.rows[0].cnt),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
