import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const result = await db.query(
      `SELECT id, title, url, source, author, published_date, summary, image_url, category
       FROM brand_articles
       WHERE brand_slug = $1
       ORDER BY published_date DESC NULLS LAST, created_at DESC`,
      [params.slug]
    );

    return NextResponse.json({
      articles: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Get brand articles error:', error);
    return NextResponse.json({ error: error.message, articles: [], count: 0 }, { status: 500 });
  }
}
