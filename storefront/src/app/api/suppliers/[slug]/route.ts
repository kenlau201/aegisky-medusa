import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // 查询品牌信息
    const brandResult = await db.query(`
      SELECT * FROM aegisky_brands WHERE slug = $1
    `, [params.slug]);

    if (brandResult.rows.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const brand = brandResult.rows[0];

    // 查询该品牌的商品（通过brands JSONB数组匹配）
    const productsResult = await db.query(`
      SELECT id, name, slug, price, regular_price, sale_price, main_image, image_count, video_count, short_description
      FROM aegisky_products
      WHERE brands @> $1::jsonb
      ORDER BY id DESC
      LIMIT 24
    `, [JSON.stringify([{ id: brand.id, name: brand.name, slug: brand.slug }])]);

    // 相关品牌（同分类，已验证优先）
    let relatedBrands: any[] = [];
    if (brand.solution_categories && brand.solution_categories.length > 0) {
      const relatedResult = await db.query(`
        SELECT id, name, slug, logo_url, tagline, product_count, verified, country
        FROM aegisky_brands
        WHERE id != $1 AND solution_categories && $2::text[]
        ORDER BY verified DESC, product_count DESC
        LIMIT 6
      `, [brand.id, brand.solution_categories]);
      relatedBrands = relatedResult.rows;
    }

    return NextResponse.json({
      brand,
      products: productsResult.rows,
      relatedBrands,
    });
  } catch (error: any) {
    console.error('Get brand detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
