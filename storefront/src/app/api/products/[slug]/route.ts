import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Query product by slug or id
    const result = await db.query(`
      SELECT * FROM aegisky_products
      WHERE slug = $1 OR id::text = $1
      LIMIT 1
    `, [params.slug]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = result.rows[0];

    // Parse JSONB fields
    if (product.images && typeof product.images === 'string') {
      try { product.images = JSON.parse(product.images); } catch {}
    }
    if (product.videos && typeof product.videos === 'string') {
      try { product.videos = JSON.parse(product.videos); } catch {}
    }
    if (product.categories && typeof product.categories === 'string') {
      try { product.categories = JSON.parse(product.categories); } catch {}
    }
    if (product.brands && typeof product.brands === 'string') {
      try { product.brands = JSON.parse(product.brands); } catch {}
    }

    // Get related products from same categories or brands
    let relatedProducts: any[] = [];
    if (product.categories && product.categories.length > 0) {
      const catIds = product.categories.map((c: any) => c.id).filter(Boolean);
      if (catIds.length > 0) {
        const relatedResult = await db.query(`
          SELECT id, name, slug, price, regular_price, sale_price, main_image, image_count, short_description
          FROM aegisky_products
          WHERE id != $1 AND categories @> ANY($2::jsonb[])
          ORDER BY id DESC
          LIMIT 8
        `, [product.id, catIds.map((id: number) => JSON.stringify([{ id }]))]);
        relatedProducts = relatedResult.rows;
      }
    }

    // If no related by category, get random
    if (relatedProducts.length === 0) {
      const relatedResult = await db.query(`
        SELECT id, name, slug, price, regular_price, sale_price, main_image, image_count, short_description
        FROM aegisky_products
        WHERE id != $1
        ORDER BY RANDOM()
        LIMIT 8
      `, [product.id]);
      relatedProducts = relatedResult.rows;
    }

    return NextResponse.json({
      product,
      relatedProducts,
    });
  } catch (error: any) {
    console.error('Get product detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
