import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/control-tower/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  const { category } = params;
  const { searchParams } = new URL(request.url);
  const productLimit = Math.min(parseInt(searchParams.get('products') || '12'), 24);
  const articleLimit = Math.min(parseInt(searchParams.get('articles') || '6'), 12);

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  try {
    // Get products from brands in this solution category
    // Products have brands JSONB array with objects like {"id": N, "name": "...", "slug": "..."}
    // We need to find products where at least one brand has that brand in the solution category
    const productsResult = await pool.query(`
      SELECT p.id, p.name, p.slug, p.sku, p.price, p.main_image,
             p.short_description, p.images, p.brands,
             b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo
      FROM aegisky_products p
      CROSS JOIN LATERAL (
        SELECT (br->>'id')::integer as brand_id
        FROM jsonb_array_elements(p.brands) as br
        WHERE br->>'id' IS NOT NULL
        LIMIT 1
      ) as pb
      JOIN aegisky_brands b ON b.id = pb.brand_id
      WHERE $1 = ANY(b.solution_categories)
        AND b.solution_categories IS NOT NULL
      ORDER BY p.updated_at DESC NULLS LAST, p.id DESC
      LIMIT $2
    `, [category, productLimit]);

    // Get articles from brands in this solution category
    const articlesResult = await pool.query(`
      SELECT a.id, a.title, a.slug, a.summary, a.image_url, a.published_date,
             a.read_time, a.category, a.brand_id, a.brand_slug,
             b.name as brand_name, b.logo_url as brand_logo
      FROM brand_articles a
      JOIN aegisky_brands b ON b.id = a.brand_id
      WHERE $1 = ANY(b.solution_categories)
        AND b.solution_categories IS NOT NULL
      ORDER BY a.published_date DESC NULLS LAST, a.id DESC
      LIMIT $2
    `, [category, articleLimit]);

    // Get total product count for this category
    const productCountResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM aegisky_products p
      CROSS JOIN LATERAL (
        SELECT (br->>'id')::integer as brand_id
        FROM jsonb_array_elements(p.brands) as br
        WHERE br->>'id' IS NOT NULL
        LIMIT 1
      ) as pb
      JOIN aegisky_brands b ON b.id = pb.brand_id
      WHERE $1 = ANY(b.solution_categories)
        AND b.solution_categories IS NOT NULL
    `, [category]);

    return NextResponse.json({
      products: productsResult.rows,
      articles: articlesResult.rows,
      totalProducts: parseInt(productCountResult.rows[0]?.total || '0'),
    });
  } catch (error) {
    console.error('Error fetching category data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category data', products: [], articles: [], totalProducts: 0 },
      { status: 500 }
    );
  }
}
