import { NextRequest, NextResponse } from 'next/server'
import { pool, getPO, updatePOStatus } from '@/lib/trade-engine/db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const { searchParams } = new URL(request.url)
    const poId = searchParams.get('po_id')

    let query = 'SELECT i.*, po.po_number FROM te_inspections i JOIN te_purchase_orders po ON i.po_id = po.id WHERE i.tenant_id = $1'
    const params: any[] = [tenantId]
    if (poId) {
      params.push(poId)
      query += ` AND i.po_id = $${params.length}`
    }
    query += ' ORDER BY i.inspection_date DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ inspections: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()

    const po = await getPO(body.po_id)
    if (!po) return NextResponse.json({ error: 'PO not found' }, { status: 404 })

    const result = await pool.query(
      `INSERT INTO te_inspections
       (tenant_id, po_id, line_item_id, inspection_type, inspector, inspector_company,
        inspection_date, result, defect_rate, total_samples, defects_found,
        critical_defects, major_defects, minor_defects, findings, corrective_actions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        tenantId, body.po_id, body.line_item_id,
        body.inspection_type || 'PRE_SHIPMENT',
        body.inspector, body.inspector_company,
        body.inspection_date || new Date(),
        body.result, body.defect_rate, body.total_samples,
        body.defects_found, body.critical_defects || 0,
        body.major_defects || 0, body.minor_defects || 0,
        body.findings, body.corrective_actions,
      ]
    )

    // 根据质检结果更新PO状态
    if (body.result === 'PASS' || body.result === 'CONDITIONAL') {
      await updatePOStatus(body.po_id, 'QC_PASSED')
    } else if (body.result === 'FAIL') {
      await updatePOStatus(body.po_id, 'QC_FAILED')
    }

    return NextResponse.json({ inspection: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
