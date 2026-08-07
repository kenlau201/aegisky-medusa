import { NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [totalRes, inStockRes, outOfStockRes, onSaleRes, categoriesRes, brandsRes] = await Promise.all([
      db.query(`SELECT COUNT(*) as count FROM aegisky_products`),
      db.query(`SELECT COUNT(*) as count FROM aegisky_products WHERE in_stock = true`),
      db.query(`SELECT COUNT(*) as count FROM aegisky_products WHERE in_stock = false OR stock_quantity = 0`),
      db.query(`SELECT COUNT(*) as count FROM aegisky_products WHERE on_sale = true`),
      db.query(`SELECT COUNT(*) as count FROM aegisky_categories`),
      db.query(`SELECT COUNT(*) as count FROM aegisky_brands`),
    ]);

    return NextResponse.json({
      total: parseInt(totalRes.rows[0]?.count || 0),
      inStock: parseInt(inStockRes.rows[0]?.count || 0),
      outOfStock: parseInt(outOfStockRes.rows[0]?.count || 0),
      onSale: parseInt(onSaleRes.rows[0]?.count || 0),
      categories: parseInt(categoriesRes.rows[0]?.count || 0),
      brands: parseInt(brandsRes.rows[0]?.count || 0),
    });
  } catch (error: any) {
    console.error('Products overview error:', error);
    return NextResponse.json(
      { total: 0, inStock: 0, outOfStock: 0, onSale: 0, categories: 0, brands: 0 },
      { status: 200 }
    );
  }
}
