import { NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
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

    const result = await db.query(`
      SELECT * FROM aegisky_inventory_logs ORDER BY created_at DESC LIMIT 200
    `);
    return NextResponse.json({ logs: result.rows });
  } catch (error: any) {
    return NextResponse.json({ logs: [], error: error.message });
  }
}
