import { NextResponse } from 'next/server'
import { syncAll } from '@/lib/data-sync'
import { invalidateDataCache } from '@/lib/data'

export const runtime = 'nodejs'

export async function POST() {
  try {
    console.log('[admin/sync] Starting full data sync...')
    const result = await syncAll()
    invalidateDataCache()
    return NextResponse.json({
      success: true,
      message: 'Data sync completed',
      ...result,
    })
  } catch (error: any) {
    console.error('[admin/sync] Sync failed:', error)
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 })
  }
}
