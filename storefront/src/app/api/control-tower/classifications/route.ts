import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'

function generateClassificationNumber() {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CLS-${yymm}-${rand}`
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const result = await pool.query(
      'SELECT * FROM ct_classifications WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    )
    return NextResponse.json({ classifications: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()

    const clsNumber = generateClassificationNumber()

    const result = await pool.query(
      `INSERT INTO ct_classifications
       (tenant_id, classification_number, product_id, product_name, product_description,
        technical_specs, eccn_code, classification_basis, classified_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'SELF_CLASSIFIED')
       RETURNING *`,
      [
        tenantId, clsNumber, body.product_id, body.product_name, body.product_description,
        body.technical_specs || {}, body.eccn_code, body.classification_basis,
        body.classified_by || 'Compliance Team',
      ]
    )

    return NextResponse.json({ classification: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
