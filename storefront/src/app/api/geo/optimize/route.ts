import { NextRequest, NextResponse } from 'next/server';
import { processOptimizationQueue } from '@/lib/geo/content-optimizer';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5分钟超时

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const batchSize = body.batchSize || 5;

    const result = await processOptimizationQueue(batchSize);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('GEO optimize error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await import('@/lib/control-tower/db');
    const stats = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'optimized') as optimized,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) as total,
        AVG(geo_score_after - geo_score_before) as avg_score_improvement
      FROM geo_content
    `);

    return NextResponse.json({
      success: true,
      stats: stats.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
