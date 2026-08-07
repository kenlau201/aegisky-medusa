import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const result = await db.query(`
      SELECT id, name, slug, parent as parent_id, image_url as image, depth, product_count, path, children_count
      FROM aegisky_categories
      ORDER BY parent ASC, id ASC
    `);

    return NextResponse.json({
      categories: result.rows,
      total: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: [], total: 0 });
  }
}
