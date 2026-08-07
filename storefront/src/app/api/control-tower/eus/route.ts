import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'

function generateEUSNumber() {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `EUS-${yymm}-${rand}`
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = 'SELECT * FROM ct_end_user_statements WHERE tenant_id = $1'
    const params: any[] = [tenantId]
    if (status) {
      params.push(status)
      query += ` AND status = $${params.length}`
    }
    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ statements: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()

    const eusNumber = generateEUSNumber()

    const result = await pool.query(
      `INSERT INTO ct_end_user_statements
       (tenant_id, eus_number, transaction_id, consignee_name, consignee_country,
        end_user_name, end_user_address, end_user_country, end_use_description,
        end_use_category, military_use_denial, no_reexport_agreement, no_weapons_use,
        authorized_signatory, signatory_title, signature_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), 'RECEIVED')
       RETURNING *`,
      [
        tenantId, eusNumber, body.transaction_id,
        body.consignee_name, body.consignee_country,
        body.end_user_name, body.end_user_address, body.end_user_country,
        body.end_use_description, body.end_use_category,
        body.military_use_denial ?? true,
        body.no_reexport_agreement ?? true,
        body.no_weapons_use ?? true,
        body.authorized_signatory, body.signatory_title,
      ]
    )

    return NextResponse.json({ statement: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
