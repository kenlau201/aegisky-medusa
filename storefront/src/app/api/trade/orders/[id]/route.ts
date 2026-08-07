import { NextRequest, NextResponse } from 'next/server'
import { getPO, updatePOStatus, canTransitionTo, getNextActions, pool } from '@/lib/trade-engine/db'
import type { OrderStatus } from '@/lib/trade-engine/constants'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const po = await getPO(params.id)
    if (!po) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const nextActions = getNextActions(po.status as OrderStatus)
    return NextResponse.json({ order: po, next_actions: nextActions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const po = await getPO(params.id)
    if (!po) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // 状态转换
    if (body.action) {
      const currentStatus = po.status as OrderStatus
      if (!canTransitionTo(currentStatus, body.action)) {
        return NextResponse.json({
          error: `Cannot transition from ${currentStatus} to ${body.action}`,
          allowed: getNextActions(currentStatus),
        }, { status: 400 })
      }

      const updated = await updatePOStatus(params.id, body.action, body.notes)

      // 特殊状态处理
      if (body.action === 'SHIPPED') {
        await pool.query(
          'UPDATE te_purchase_orders SET actual_ship_date = NOW() WHERE id = $1',
          [params.id]
        )
      }
      if (body.action === 'DELIVERED') {
        await pool.query(
          'UPDATE te_purchase_orders SET actual_delivery_date = NOW() WHERE id = $1',
          [params.id]
        )
      }

      return NextResponse.json({ order: updated, message: `Order ${body.action}` })
    }

    // 一般更新
    const sets: string[] = []
    const values: any[] = []
    const updateFields = ['priority', 'payment_terms', 'shipping_method', 'incoterm',
      'origin_port', 'destination_port', 'expected_ship_date', 'expected_delivery_date',
      'supplier_notes', 'internal_notes', 'buyer_notes']

    for (const field of updateFields) {
      if (body[field] !== undefined) {
        values.push(body[field])
        sets.push(`${field} = $${values.length}`)
      }
    }

    if (sets.length > 0) {
      values.push(params.id)
      await pool.query(
        `UPDATE te_purchase_orders SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`,
        values
      )
    }

    const updated = await getPO(params.id)
    return NextResponse.json({ order: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
