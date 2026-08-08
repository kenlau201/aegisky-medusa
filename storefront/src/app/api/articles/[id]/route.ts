import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Support lookup by numeric ID or by slug
    const isNumeric = /^\d+$/.test(params.id);

    let article;
    if (isNumeric) {
      const result = await db.query(
        `SELECT a.*, b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo
         FROM brand_articles a
         JOIN aegisky_brands b ON a.brand_id = b.id
         WHERE a.id = $1`,
        [parseInt(params.id)]
      );
      article = result.rows[0];
    } else {
      const result = await db.query(
        `SELECT a.*, b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo
         FROM brand_articles a
         JOIN aegisky_brands b ON a.brand_id = b.id
         WHERE a.slug = $1`,
        [params.id]
      );
      article = result.rows[0];
    }

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get related articles from same brand
    const relatedResult = await db.query(
      `SELECT id, title, slug, summary, category, published_date, read_time
       FROM brand_articles
       WHERE brand_id = $1 AND id != $2
       ORDER BY published_date DESC NULLS LAST
       LIMIT 5`,
      [article.brand_id, article.id]
    );

    return NextResponse.json({
      article,
      relatedArticles: relatedResult.rows,
    });
  } catch (error: any) {
    console.error('Get article error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
