import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * 批量将内容加入GEO优化队列
 * 支持: products, suppliers(brands), categories
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const types = body.types || ['product'];
    const limit = body.limit || 100;
    const language = body.language || 'en';

    let enqueued = 0;
    const results: Record<string, number> = {};

    // 加入产品 - 使用aegisky_products镜像表
    if (types.includes('product')) {
      const products = await db.query(`
        SELECT id, name, description, short_description
        FROM aegisky_products
        ORDER BY id DESC
        LIMIT $1
      `, [limit]);

      for (const p of products.rows) {
        const exists = await db.query(`
          SELECT id FROM geo_content
          WHERE content_type = 'product' AND content_id = $1 AND language = $2
        `, [String(p.id), language]);

        if (exists.rows.length === 0) {
          const originalContent = p.description || p.short_description || p.name || '';
          await db.query(`
            INSERT INTO geo_content (
              content_type, content_id, language, title, original_content,
              status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
          `, ['product', String(p.id), language, p.name, originalContent]);
          enqueued++;
        }
      }
      results.product = products.rows.length;
    }

    // 加入供应商/品牌
    if (types.includes('supplier')) {
      const brands = await db.query(`
        SELECT id, name, description
        FROM aegisky_brands
        ORDER BY id
        LIMIT $1
      `, [limit]);

      for (const b of brands.rows) {
        const exists = await db.query(`
          SELECT id FROM geo_content
          WHERE content_type = 'supplier' AND content_id = $1 AND language = $2
        `, [String(b.id), language]);

        if (exists.rows.length === 0) {
          const originalContent = b.description || b.name || '';
          await db.query(`
            INSERT INTO geo_content (
              content_type, content_id, language, title, original_content,
              status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
          `, ['supplier', String(b.id), language, b.name, originalContent]);
          enqueued++;
        }
      }
      results.supplier = brands.rows.length;
    }

    // 加入分类
    if (types.includes('category')) {
      const categories = await db.query(`
        SELECT id, name, description
        FROM aegisky_categories
        ORDER BY id
        LIMIT $1
      `, [limit]);

      for (const c of categories.rows) {
        const exists = await db.query(`
          SELECT id FROM geo_content
          WHERE content_type = 'category' AND content_id = $1 AND language = $2
        `, [String(c.id), language]);

        if (exists.rows.length === 0) {
          const originalContent = c.description || c.name || '';
          await db.query(`
            INSERT INTO geo_content (
              content_type, content_id, language, title, original_content,
              status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
          `, ['category', String(c.id), language, c.name, originalContent]);
          enqueued++;
        }
      }
      results.category = categories.rows.length;
    }

    return NextResponse.json({
      success: true,
      enqueued,
      scanned: results,
      message: `Enqueued ${enqueued} new items for optimization`,
    });
  } catch (error: any) {
    console.error('GEO enqueue error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
