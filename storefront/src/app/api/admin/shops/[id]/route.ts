import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const sets: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) { sets.push(`name = $${paramIndex++}`); values.push(body.name); }
    if (body.status !== undefined) { sets.push(`status = $${paramIndex++}`); values.push(body.status); }
    if (body.description !== undefined) { sets.push(`description = $${paramIndex++}`); values.push(body.description); }
    if (body.contact_name !== undefined) { sets.push(`contact_name = $${paramIndex++}`); values.push(body.contact_name); }
    if (body.contact_phone !== undefined) { sets.push(`contact_phone = $${paramIndex++}`); values.push(body.contact_phone); }
    if (body.is_self_operated !== undefined) { sets.push(`is_self_operated = $${paramIndex++}`); values.push(body.is_self_operated); }

    sets.push(`updated_at = NOW()`);
    values.push(params.id);

    const result = await db.query(`
      UPDATE shop SET ${sets.join(', ')} WHERE id = $${paramIndex} RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, shop: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.query(`DELETE FROM shop WHERE id = $1`, [params.id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
