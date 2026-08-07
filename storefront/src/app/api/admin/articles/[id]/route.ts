import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    await db.query(
      `UPDATE articles SET title=$1, content=$2, summary=$3, cover_image=$4, status=$5, is_published=$6, category_id=$7 WHERE id=$8`,
      [body.title, body.content, body.summary, body.cover_image, body.status, body.is_published, body.category_id || null, params.id]
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.query('DELETE FROM articles WHERE id=$1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
