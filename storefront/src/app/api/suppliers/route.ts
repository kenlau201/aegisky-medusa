import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';
import { SOLUTION_CATEGORIES } from '@/lib/suppliers/solutions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const verifiedOnly = searchParams.get('verified') === 'true';
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR tagline ILIKE $${paramIndex} OR city ILIKE $${paramIndex} OR country ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND $${paramIndex} = ANY(solution_categories)`;
      params.push(category);
      paramIndex++;
    }

    if (verifiedOnly) {
      whereClause += ` AND verified = true`;
    }

    // 总数
    const countResult = await db.query(`SELECT COUNT(*) FROM aegisky_brands ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // 品牌列表 - 包含所有扩展字段
    const result = await db.query(`
      SELECT id, name, slug, logo_url, description, tagline, country, country_code,
             city, product_count, solution_categories, verified, founded_year,
             employees, certifications, website_url
      FROM aegisky_brands
      ${whereClause}
      ORDER BY verified DESC, product_count DESC, name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, pageSize, offset]);

    // 统计每个分类的品牌数
    const categoryStats = await db.query(`
      SELECT unnest(solution_categories) as cat_id, COUNT(*) as count
      FROM aegisky_brands
      WHERE solution_categories IS NOT NULL AND array_length(solution_categories, 1) > 0
      GROUP BY cat_id
    `);

    const categoryCounts: Record<string, number> = {};
    categoryStats.rows.forEach((r: any) => {
      categoryCounts[r.cat_id] = parseInt(r.count);
    });

    // 全局统计
    const statsResult = await db.query(`
      SELECT
        COUNT(*) as total_brands,
        COUNT(*) FILTER (WHERE verified = true) as verified_brands,
        COUNT(DISTINCT country) as total_countries,
        COALESCE(SUM(product_count), 0) as total_products
      FROM aegisky_brands
    `);
    const stats = statsResult.rows[0];

    return NextResponse.json({
      suppliers: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      categories: SOLUTION_CATEGORIES.map(c => ({ ...c, count: categoryCounts[c.id] || 0 })),
      stats: {
        brands: parseInt(stats.total_brands),
        verifiedBrands: parseInt(stats.verified_brands),
        products: parseInt(stats.total_products),
        countries: parseInt(stats.total_countries),
      },
    });
  } catch (error: any) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({
      suppliers: [],
      total: 0,
      categories: SOLUTION_CATEGORIES,
      stats: { brands: 0, verifiedBrands: 0, products: 0, countries: 0 },
      error: error.message
    });
  }
}
