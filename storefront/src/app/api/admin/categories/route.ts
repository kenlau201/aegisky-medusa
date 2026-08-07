import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';
import { syncCategories } from '@/lib/data-sync';
import { invalidateDataCache } from '@/lib/data';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.query(
      `INSERT INTO aegisky_categories (id, name, slug, parent, image_url, depth)
       VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM aegisky_categories), $1, $2, $3, $4, $5)
       RETURNING *`,
      [body.name, body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), body.parent_id || 0, body.image_url || null, body.depth || 0]
    );

    // Sync data in background
    syncCategories().then(() => invalidateDataCache()).catch(err => console.error('Sync error:', err));

    return NextResponse.json({ success: true, category: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
