import { NextRequest, NextResponse } from 'next/server'
import { pool, generatePaymentNumber, getPO } from '@/lib/trade-engine/db'

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const { searchParams } = new URL(request.url)
    const poId = searchParams.get('po_id')

    let query = 'SELECT p.*, po.po_number FROM te_payments p JOIN te_purchase_orders po ON p.po_id = po.id WHERE p.tenant_id = $1'
    const params: any[] = [tenantId]
    if (poId) {
      params.push(poId)
      query += ` AND p.po_id = $${params.length}`
    }
    query += ' ORDER BY p.created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ payments: result.rows })
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

    const paymentNumber = generatePaymentNumber()

    const result = await pool.query(
      `INSERT INTO te_payments
       (tenant_id, po_id, payment_number, payment_type, amount, currency,
        payment_method, status, transaction_ref, payment_date, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMED', $8, NOW(), $9, $10)
       RETURNING *`,
      [
        tenantId, body.po_id, paymentNumber,
        body.payment_type || 'DEPOSIT',
        body.amount, body.currency || po.currency,
        body.payment_method, body.transaction_ref,
        body.due_date, body.notes,
      ]
    )

    // 更新PO付款状态
    const totalPaid = (po.deposit_paid ? po.deposit_amount : 0) + body.amount
    let paymentStatus = po.payment_status
    if (totalPaid >= po.total_amount) {
      paymentStatus = 'PAID'
    } else if (body.payment_type === 'DEPOSIT' || totalPaid >= po.deposit_amount) {
      paymentStatus = 'DEPOSIT_PAID'
    } else {
      paymentStatus = 'PARTIAL_PAID'
    }

    await pool.query(
      `UPDATE te_purchase_orders SET
        deposit_paid = CASE WHEN $2 >= deposit_amount THEN true ELSE deposit_paid END,
        payment_status = $3, updated_at = NOW()
       WHERE id = $1`,
      [body.po_id, totalPaid, paymentStatus]
    )

    return NextResponse.json({ payment: result.rows[0], payment_status: paymentStatus }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
