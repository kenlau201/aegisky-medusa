import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const keyword = searchParams.get('keyword') || '';
    const offset = (page - 1) * pageSize;

    let where = '';
    let params: any[] = [];
    if (keyword) {
      where = 'WHERE title ILIKE $1';
      params.push(`%${keyword}%`);
    }

    const countResult = await db.query(`SELECT COUNT(*) FROM article ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(`
      SELECT a.*, c.name as category_name
      FROM article a LEFT JOIN article_category c ON a.category_id = c.id
      ${where}
      ORDER BY a.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, pageSize, offset]);

    return NextResponse.json({ articles: result.rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error: any) {
    return NextResponse.json({ articles: [], total: 0, error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.query(`
      INSERT INTO article (title, category_id, summary, content, cover_image, author, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [body.title, body.category_id, body.summary, body.content, body.cover_image, body.author || 'admin', body.status || 'published']);
    return NextResponse.json({ success: true, article: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
