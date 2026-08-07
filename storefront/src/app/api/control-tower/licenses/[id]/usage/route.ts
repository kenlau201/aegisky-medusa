import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()

    // 检查许可证剩余额度
    const licenseResult = await pool.query(
      'SELECT * FROM ct_export_licenses WHERE id = $1 AND tenant_id = $2',
      [params.id, tenantId]
    )

    if (licenseResult.rowCount === 0) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 })
    }

    const license = licenseResult.rows[0]
    const remaining = license.quantity_approved - license.quantity_used

    if (body.quantity_used > remaining) {
      return NextResponse.json({
        error: 'Quantity exceeds license allowance',
        approved: license.quantity_approved,
        used: license.quantity_used,
        remaining,
      }, { status: 400 })
    }

    // 记录使用
    const usageResult = await pool.query(
      `INSERT INTO ct_license_usage
       (tenant_id, license_id, transaction_id, quantity_used, value_used, shipping_ref, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tenantId, params.id, body.transaction_id, body.quantity_used, body.value_used, body.shipping_ref, body.notes]
    )

    // 更新许可证已用数量
    await pool.query(
      'UPDATE ct_export_licenses SET quantity_used = quantity_used + $1, updated_at = NOW() WHERE id = $2',
      [body.quantity_used, params.id]
    )

    return NextResponse.json({
      usage: usageResult.rows[0],
      license_id: params.id,
      quantity_used: body.quantity_used,
      remaining: remaining - body.quantity_used,
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const result = await pool.query(
      `SELECT lu.*, t.transaction_ref, t.consignee_name
       FROM ct_license_usage lu
       LEFT JOIN ct_trade_transactions t ON t.id = lu.transaction_id
       WHERE lu.license_id = $1 AND lu.tenant_id = $2
       ORDER BY lu.created_at DESC`,
      [params.id, tenantId]
    )
    return NextResponse.json({ usage: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
