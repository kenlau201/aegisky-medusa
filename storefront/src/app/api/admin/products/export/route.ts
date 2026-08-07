import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const result = await db.query(
      `SELECT id, name, sku, price, regular_price, sale_price, in_stock, stock_status, created_at 
       FROM aegisky_products 
       WHERE name ILIKE $1 OR sku ILIKE $1
       ORDER BY id DESC LIMIT 10000`,
      [`%${search}%`]
    );
    const headers = ['ID', '商品名称', 'SKU', '售价', '原价', '促销价', '是否上架', '库存状态', '创建时间'];
    const rows = result.rows.map((p: any) => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.sku || '',
      p.price || 0,
      p.regular_price || '',
      p.sale_price || '',
      p.in_stock ? '上架' : '下架',
      p.stock_status || '',
      p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : ''
    ].join(','));
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=products_${Date.now()}.csv`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
