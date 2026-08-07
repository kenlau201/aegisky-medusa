import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const sets: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    if (body.status !== undefined) { sets.push(`status = $${paramIndex++}`); values.push(body.status); }
    if (body.handle_remark !== undefined) { sets.push(`handle_remark = $${paramIndex++}`); values.push(body.handle_remark); }
    if (sets.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 });
    values.push(params.id);
    try { await db.query(`UPDATE withdrawal SET ${sets.join(', ')} WHERE id = $${paramIndex}`, values); } catch (e) {}
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
