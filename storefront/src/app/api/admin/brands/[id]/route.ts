import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';
import { syncBrands } from '@/lib/data-sync';
import { invalidateDataCache } from '@/lib/data';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    await db.query(
      `UPDATE aegisky_brands SET name=$1, slug=$2, logo_url=$3, description=$4 WHERE id=$5`,
      [body.name, body.slug, body.logo_url, body.description, params.id]
    );

    syncBrands().then(() => invalidateDataCache()).catch(err => console.error('Sync error:', err));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.query('DELETE FROM aegisky_brands WHERE id=$1', [params.id]);

    syncBrands().then(() => invalidateDataCache()).catch(err => console.error('Sync error:', err));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
