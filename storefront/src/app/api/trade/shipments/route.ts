import { NextRequest, NextResponse } from 'next/server'
import { pool, generateShipmentNumber, getPO, updatePOStatus } from '@/lib/trade-engine/db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const { searchParams } = new URL(request.url)
    const poId = searchParams.get('po_id')

    let query = 'SELECT s.*, po.po_number, po.buyer_name FROM te_shipments s JOIN te_purchase_orders po ON s.po_id = po.id WHERE s.tenant_id = $1'
    const params: any[] = [tenantId]

    if (poId) {
      params.push(poId)
      query += ` AND s.po_id = $${params.length}`
    }
    query += ' ORDER BY s.created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ shipments: result.rows })
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

    const shipmentNumber = generateShipmentNumber()

    // 计算预计到达时间
    const etd = body.estimated_departure ? new Date(body.estimated_departure) : new Date()
    const etaDays = body.shipping_method === 'AIR_EXPRESS' ? 5 :
                    body.shipping_method === 'AIR_FREIGHT' ? 8 :
                    body.shipping_method === 'SEA_FCL' ? 30 :
                    body.shipping_method === 'RAIL' ? 20 : 15
    const eta = new Date(etd.getTime() + etaDays * 24 * 60 * 60 * 1000)

    const result = await pool.query(
      `INSERT INTO te_shipments
       (tenant_id, po_id, shipment_number, forwarder_code, tracking_number, shipping_method,
        origin_port, destination_port, estimated_departure, estimated_arrival,
        weight_kg, volume_cbm, packages, status, tracking_events)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'BOOKED', $14)
       RETURNING *`,
      [
        tenantId, body.po_id, shipmentNumber,
        body.forwarder_code, body.tracking_number, body.shipping_method,
        body.origin_port, body.destination_port,
        etd, eta,
        body.weight_kg, body.volume_cbm, body.packages || 1,
        JSON.stringify([
          { date: new Date().toISOString(), location: body.origin_port, status: 'Shipment booked', code: 'BOOKED' },
        ]),
      ]
    )

    // 更新PO状态为SHIPPED（如果当前状态允许）
    const currentPO = await getPO(body.po_id)
    if (currentPO && ['READY_TO_SHIP', 'QC_PASSED'].includes(currentPO.status)) {
      await updatePOStatus(body.po_id, 'SHIPPED')
    }

    return NextResponse.json({ shipment: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
