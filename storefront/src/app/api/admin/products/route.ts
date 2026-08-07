import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND p.name ILIKE $${params.length}`;
    }

    // 查询总数
    const countResult = await db.query(`
      SELECT COUNT(*) as total FROM aegisky_products p ${whereClause}
    `, params);
    const total = parseInt(countResult.rows[0]?.total || 0);

    // 查询商品列表
    const result = await db.query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.regular_price,
        p.sale_price,
        p.main_image as thumbnail,
        p.sku,
        p.in_stock,
        p.stock_status,
        p.image_count,
        p.video_count,
        p.created_at
      FROM aegisky_products p
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, pageSize, offset]);

    return NextResponse.json({
      products: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error: any) {
    console.error('List products error:', error);
    return NextResponse.json({ products: [], total: 0, error: error.message });
  }
}
