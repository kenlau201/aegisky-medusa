import { NextResponse } from 'next/server'
import { getComplianceAudits, validateTenant } from '@/lib/control-tower/compliance'
import { initControlTowerTables } from '@/lib/control-tower/db'

export async function GET(request: Request) {
  try {
    await initControlTowerTables()

    const tenantHeader = request.headers.get('X-AEGISKY-TENANT-ID')
    const tenantCheck = validateTenant(tenantHeader)
    if (!tenantCheck.valid) {
      return NextResponse.json({ error: tenantCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getComplianceAudits({ tenantId: tenantCheck.tenantId, status, limit, offset })
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
