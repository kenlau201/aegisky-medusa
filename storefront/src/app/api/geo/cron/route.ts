import { NextRequest, NextResponse } from 'next/server';
import { runAllMonitoringChecks } from '@/lib/geo/monitor';
import { processOptimizationQueue } from '@/lib/geo/content-optimizer';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * GEO 定时任务
 * 每天自动运行：
 * 1. AI引用监测（检查20个问题）
 * 2. 内容优化队列处理（优化5条）
 *
 * 可以通过 Vercel Cron 或者外部cron调用：
 * curl -H "Authorization: Bearer aegisky-geo-cron-2026" https://yoursite.com/api/geo/cron
 */
export async function GET(request: NextRequest) {
  // 简单的密钥验证
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'aegisky-geo-cron-2026';

  if (!authHeader || !authHeader.includes(cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    monitoring: null,
    optimization: null,
  };

  try {
    // 1. 运行AI引用监测
    console.log('[GEO Cron] Running AI mention monitoring...');
    results.monitoring = await runAllMonitoringChecks(20);
    console.log(`[GEO Cron] Monitoring complete: ${results.monitoring.mentioned}/${results.monitoring.total} mentions`);
  } catch (e: any) {
    console.error('[GEO Cron] Monitoring failed:', e);
    results.monitoring = { error: e.message };
  }

  try {
    // 2. 处理优化队列
    console.log('[GEO Cron] Processing optimization queue...');
    results.optimization = await processOptimizationQueue(5);
    console.log(`[GEO Cron] Optimization complete: ${results.optimization.success} succeeded`);
  } catch (e: any) {
    console.error('[GEO Cron] Optimization failed:', e);
    results.optimization = { error: e.message };
  }

  return NextResponse.json({
    success: true,
    ...results,
  });
}
