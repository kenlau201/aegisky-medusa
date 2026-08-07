import { NextRequest, NextResponse } from 'next/server';
import { runAllMonitoringChecks } from '@/lib/geo/monitor';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const limit = body.limit || 20;

    const result = await runAllMonitoringChecks(limit);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('GEO monitor error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
