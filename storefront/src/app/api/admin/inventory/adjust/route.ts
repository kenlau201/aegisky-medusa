import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';
import { syncProducts } from '@/lib/data-sync';
import { invalidateDataCache } from '@/lib/data';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, type, reason } = body;

    if (!productId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS aegisky_inventory_logs (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        product_name TEXT,
        type VARCHAR(20),
        quantity INTEGER,
        before_qty INTEGER,
        after_qty INTEGER,
        reason TEXT,
        operator VARCHAR(100) DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const current = await db.query(
      'SELECT id, name, stock_quantity FROM aegisky_products WHERE id = $1',
      [productId]
    );
    if (current.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const beforeQty = current.rows[0].stock_quantity || 0;
    let afterQty = beforeQty;
    let changeQty = 0;

    switch (type) {
      case 'inbound':
        changeQty = Math.abs(quantity);
        afterQty = beforeQty + changeQty;
        break;
      case 'outbound':
        changeQty = -Math.abs(quantity);
        afterQty = Math.max(0, beforeQty - Math.abs(quantity));
        break;
      case 'adjust':
        changeQty = quantity - beforeQty;
        afterQty = Math.max(0, quantity);
        break;
    }

    await db.query(
      'UPDATE aegisky_products SET stock_quantity = $1, in_stock = ($1 > 0), updated_at = NOW() WHERE id = $2',
      [afterQty, productId]
    );

    await db.query(`
      INSERT INTO aegisky_inventory_logs (product_id, product_name, type, quantity, before_qty, after_qty, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [productId, current.rows[0].name, type, changeQty, beforeQty, afterQty, reason || '']);

    syncProducts().then(() => invalidateDataCache()).catch(() => {});

    return NextResponse.json({ success: true, beforeQty, afterQty });
  } catch (error: any) {
    console.error('Inventory adjust error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
