import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand_id');
    const brandSlug = searchParams.get('brand_slug');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'published_date';

    let where = '';
    const params: any[] = [];
    if (brandId) {
      params.push(parseInt(brandId));
      where = `WHERE a.brand_id = $${params.length}`;
    } else if (brandSlug) {
      params.push(brandSlug);
      where = `WHERE a.brand_slug = $${params.length}`;
    }

    const orderClause = sortBy === 'geo_score'
      ? 'a.geo_score DESC'
      : 'a.published_date DESC NULLS LAST';

    const result = await db.query(
      `SELECT a.id, a.brand_id, a.brand_slug, b.name as brand_name,
              a.title, a.summary, a.url, a.source, a.author, a.published_date,
              a.category, a.read_time, a.geo_score, a.content_quality_score,
              a.search_intent, a.word_count, a.slug, a.created_at,
              LEFT(a.content, 200) as content_preview
       FROM brand_articles a
       JOIN aegisky_brands b ON a.brand_id = b.id
       ${where}
       ORDER BY ${orderClause}
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM brand_articles a ${where}`,
      params
    );

    // Stats
    const statsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT brand_id) as brands_with_articles,
        ROUND(AVG(geo_score)) as avg_geo_score,
        ROUND(AVG(word_count)) as avg_word_count,
        COUNT(*) FILTER (WHERE geo_score >= 70) as high_value,
        COUNT(*) FILTER (WHERE geo_score < 40) as low_value,
        (SELECT COUNT(*) FROM aegisky_brands WHERE product_count > 0) as total_brands_with_products
      FROM brand_articles
    `);

    return NextResponse.json({
      articles: result.rows,
      total: parseInt(countResult.rows[0].count),
      stats: statsResult.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brand_id, title, summary, content, url, source, author,
      published_date, category, image_url
    } = body;

    if (!brand_id || !title) {
      return NextResponse.json({ error: 'brand_id and title are required' }, { status: 400 });
    }

    // Get brand info
    const brandResult = await db.query(
      'SELECT id, name, slug FROM aegisky_brands WHERE id = $1',
      [brand_id]
    );
    if (brandResult.rows.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    const brand = brandResult.rows[0];

    // Check article count for this brand
    const countResult = await db.query(
      'SELECT COUNT(*) FROM brand_articles WHERE brand_id = $1',
      [brand_id]
    );
    const articleCount = parseInt(countResult.rows[0].count);

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 200);
    const wordCount = content ? content.split(/\s+/).length : 0;
    const readTime = wordCount > 0 ? `${Math.max(1, Math.ceil(wordCount / 200))} min read` : '4 min read';

    // Insert
    const result = await db.query(
      `INSERT INTO brand_articles
       (brand_id, brand_slug, title, url, source, author, published_date, summary,
        content, slug, read_time, category, image_url, geo_score, word_count, search_intent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, $14, $15, NOW())
       RETURNING id, geo_score`,
      [
        brand_id, brand.slug, title,
        url || '', source || 'Manual', author || 'Aegisky Editorial Team',
        published_date || new Date().toISOString().split('T')[0],
        summary || '', content || '', slug, readTime,
        category || 'news', image_url, wordCount, category || 'news'
      ]
    );

    // If brand now has more than 6, trigger lifecycle
    let removedArticle = null;
    if (articleCount >= 6) {
      const lowestResult = await db.query(
        `SELECT id, title, geo_score FROM brand_articles
         WHERE brand_id = $1 AND id != $2
         ORDER BY geo_score ASC LIMIT 1`,
        [brand_id, result.rows[0].id]
      );
      if (lowestResult.rows.length > 0) {
        const lowest = lowestResult.rows[0];
        // Score the new article (simplified)
        // If new article has content, it will be re-scored by lifecycle
        await db.query('DELETE FROM brand_articles WHERE id = $1', [lowest.id]);
        removedArticle = lowest;
      }
    }

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      brand: brand.name,
      article_count: articleCount + 1,
      removed_lowest: removedArticle,
      message: removedArticle
        ? `Article added. Removed lowest-scoring article: "${removedArticle.title}" (score: ${removedArticle.geo_score})`
        : `Article added. Brand now has ${articleCount + 1}/6 articles.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
    }

    const result = await db.query(
      'DELETE FROM brand_articles WHERE id = $1 RETURNING id, title, brand_id',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deleted: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
