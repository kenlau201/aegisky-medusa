import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await db.query(`
      SELECT * FROM aegisky_products WHERE id = $1
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const sets: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['name', 'slug', 'price', 'regular_price', 'sale_price', 'sku',
      'short_description', 'description', 'main_image', 'in_stock', 'stock_status',
      'on_sale', 'currency', 'meta_title', 'meta_description'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sets.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    sets.push(`updated_at = NOW()`);
    values.push(params.id);

    const result = await db.query(`
      UPDATE aegisky_products SET ${sets.join(', ')} WHERE id = $${paramIndex} RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.query(`DELETE FROM aegisky_products WHERE id = $1`, [params.id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
