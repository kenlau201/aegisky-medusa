import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';
import { syncProducts } from '@/lib/data-sync';
import { invalidateDataCache } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.query(`
      INSERT INTO aegisky_products (
        id, name, slug, sku, price, regular_price, sale_price,
        short_description, description, main_image, in_stock,
        stock_status, on_sale, currency, stock_quantity, shop_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *
    `, [
      body.id, body.name, body.slug, body.sku,
      body.price, body.regularPrice, body.salePrice,
      body.shortDescription, body.description, body.mainImage,
      body.in_stock !== undefined ? body.in_stock : true,
      body.in_stock ? 'instock' : 'outofstock',
      body.on_sale || false, body.currency || 'USD',
      body.stock_quantity || 100,
      body.shop_id || '79a4022b-f75e-43f3-9721-0b93deb35872'
    ]);

    // Sync data in background (don't block response)
    syncProducts().then(() => invalidateDataCache()).catch(err => console.error('Sync error:', err));

    return NextResponse.json({ success: true, product: result.rows[0] });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
        p.stock_quantity,
        p.image_count,
        p.video_count,
        p.created_at,
        s.name as shop_name
      FROM aegisky_products p
      LEFT JOIN shop s ON p.shop_id = s.id
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
