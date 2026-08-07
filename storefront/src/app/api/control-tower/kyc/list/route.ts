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
    const risk = searchParams.get('risk')

    let whereClause = 'WHERE tenant_id = $1'
    const params: any[] = [tenantCheck.tenantId]

    if (status) {
      params.push(status)
      whereClause += ` AND kyc_status = $${params.length}`
    }
    if (risk) {
      params.push(risk)
      whereClause += ` AND risk_rating = $${params.length}`
    }

    const result = await pool.query(
      `SELECT id, legal_name, trading_name, registration_number, country,
              industry, risk_rating, kyc_status, sanctions_screened, sanctions_match,
              last_reviewed_at, created_at
       FROM ct_kyc_entities
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    )

    return NextResponse.json({ entities: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
