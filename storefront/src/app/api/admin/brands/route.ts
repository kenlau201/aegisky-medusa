import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const result = await db.query(`
      SELECT id, name, slug, logo, name_initial, sort_order, is_hot, is_visible
      FROM aegisky_brands
      ORDER BY name_initial ASC, name ASC
    `);

    return NextResponse.json({
      brands: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ brands: [], total: 0 });
  }
}
