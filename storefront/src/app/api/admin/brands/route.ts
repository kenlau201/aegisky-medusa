import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';
import { syncBrands } from '@/lib/data-sync';
import { invalidateDataCache } from '@/lib/data';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const result = await db.query(`
      SELECT id, name, slug, logo_url as logo, product_count, description,
             LEFT(name, 1) as name_initial
      FROM aegisky_brands
      ORDER BY name ASC
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.query(
      `INSERT INTO aegisky_brands (id, name, slug, logo_url, description)
       VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM aegisky_brands), $1, $2, $3, $4)
       RETURNING *`,
      [body.name, body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), body.logo_url || null, body.description || null]
    );

    syncBrands().then(() => invalidateDataCache()).catch(err => console.error('Sync error:', err));

    return NextResponse.json({ success: true, brand: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
