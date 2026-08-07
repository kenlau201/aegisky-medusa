import { NextResponse } from 'next/server'
import { getAllInventory, getWarehouseSummary, getDispatchHistory } from '@/lib/control-tower/inventory'
import { validateTenant } from '@/lib/control-tower/compliance'
import { initControlTowerTables } from '@/lib/control-tower/db'

export async function GET(request: Request) {
  try {
    await initControlTowerTables()

    const tenantHeader = request.headers.get('X-AEGISKY-TENANT-ID')
    const tenantCheck = validateTenant(tenantHeader)
    if (!tenantCheck.valid) {
      return NextResponse.json({ error: tenantCheck.error }, { status: 401 })
    }

    const [inventory, warehouses, dispatches] = await Promise.all([
      getAllInventory(),
      getWarehouseSummary(),
      getDispatchHistory({ tenantId: tenantCheck.tenantId, limit: 20 }),
    ])

    return NextResponse.json({ inventory, warehouses, dispatches })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
