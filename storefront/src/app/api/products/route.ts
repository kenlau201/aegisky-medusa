import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR short_description ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND categories @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify([{ slug: category }]));
      paramIndex++;
    }

    if (brand) {
      whereClause += ` AND brands @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify([{ slug: brand }]));
      paramIndex++;
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM aegisky_products ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT id, name, slug, sku, price, regular_price, sale_price, main_image, short_description,
             image_count, video_count, in_stock, currency
      FROM aegisky_products
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, pageSize, offset]);

    return NextResponse.json({
      products: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json({ products: [], total: 0, error: error.message });
  }
}
