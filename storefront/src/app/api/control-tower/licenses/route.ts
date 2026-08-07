import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const result = await pool.query(
      'SELECT * FROM ct_export_licenses WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    )
    return NextResponse.json({ licenses: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()

    const result = await pool.query(
      `INSERT INTO ct_export_licenses
       (tenant_id, license_number, issuing_authority, issuing_country, license_type,
        eccn_codes, consignee_name, consignee_country, items_description,
        quantity_approved, quantity_used, value_approved, issue_date, expiry_date,
        conditions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $11, $12, $13, $14, 'ACTIVE')
       RETURNING *`,
      [
        tenantId, body.license_number, body.issuing_authority, body.issuing_country,
        body.license_type, body.eccn_codes || [], body.consignee_name, body.consignee_country,
        body.items_description, body.quantity_approved, body.value_approved,
        body.issue_date, body.expiry_date, body.conditions,
      ]
    )

    return NextResponse.json({ license: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
