import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Query from aegisky_orders (support both id and order_number)
    const orderRes = await db.query(
      `SELECT * FROM aegisky_orders WHERE id = $1 OR order_number = $1 LIMIT 1`,
      [params.id]
    );

    if (orderRes.rows.length === 0) {
      return NextResponse.json({ order: null, error: 'Order not found' }, { status: 404 });
    }

    const order = orderRes.rows[0];

    // Get order items
    const itemsRes = await db.query(
      `SELECT * FROM aegisky_order_items WHERE order_id = $1 ORDER BY created_at`,
      [order.id]
    );

    // Parse JSONB fields
    const shipping_address = order.shipping_address ? (typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address) : null;
    const billing_address = order.billing_address ? (typeof order.billing_address === 'string' ? JSON.parse(order.billing_address) : order.billing_address) : null;

    return NextResponse.json({
      order: {
        ...order,
        total: parseFloat(order.total),
        subtotal: parseFloat(order.subtotal || order.total),
        shipping_total: parseFloat(order.shipping_amount || 0),
        tax_total: parseFloat(order.tax_amount || 0),
        discount_total: parseFloat(order.discount_amount || 0),
        shipping_address,
        billing_address,
        items: itemsRes.rows.map(item => ({
          ...item,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
        })),
      },
    });
  } catch (error: any) {
    console.error('Order detail GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const sets: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.status !== undefined) { sets.push(`status = $${paramIndex++}`); values.push(body.status); }
    if (body.payment_status !== undefined) { sets.push(`payment_status = $${paramIndex++}`); values.push(body.payment_status); }
    if (body.fulfillment_status !== undefined) { sets.push(`fulfillment_status = $${paramIndex++}`); values.push(body.fulfillment_status); }
    if (body.tracking_no !== undefined) { sets.push(`tracking_number = $${paramIndex++}`); values.push(body.tracking_no); }
    if (body.logistics_company !== undefined) { sets.push(`shipping_method = $${paramIndex++}`); values.push(body.logistics_company); }
    if (body.admin_notes !== undefined) { sets.push(`admin_notes = $${paramIndex++}`); values.push(body.admin_notes); }

    // Status timestamps
    if (body.status === 'paid') { sets.push(`paid_at = NOW()`); }
    if (body.status === 'shipped') { sets.push(`shipped_at = NOW()`); }
    if (body.status === 'completed') { sets.push(`completed_at = NOW()`); }
    if (body.status === 'cancelled') { sets.push(`cancelled_at = NOW()`); }

    if (sets.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    sets.push(`updated_at = NOW()`);
    values.push(params.id);

    await db.query(
      `UPDATE aegisky_orders SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Order detail PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
