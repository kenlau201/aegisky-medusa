import { NextResponse } from 'next/server'
import { allocateStock } from '@/lib/control-tower/inventory'
import { validateTenant } from '@/lib/control-tower/compliance'
import { initControlTowerTables } from '@/lib/control-tower/db'

export async function POST(request: Request) {
  try {
    await initControlTowerTables()

    const tenantHeader = request.headers.get('X-AEGISKY-TENANT-ID')
    const tenantCheck = validateTenant(tenantHeader)
    if (!tenantCheck.valid) {
      return NextResponse.json({ error: tenantCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity, zone, destination_country } = body

    if (!product_id || !quantity || !zone) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, quantity, zone' },
        { status: 400 }
      )
    }

    const result = await allocateStock({
      tenantId: tenantCheck.tenantId,
      productId: product_id,
      quantity: parseInt(quantity),
      zone,
      destinationCountry: destination_country,
    })

    return NextResponse.json(result.data, { status: result.status || 500 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
