import { NextRequest, NextResponse } from 'next/server'
import { initTradeEngineTables, createPO, listPOs, getDashboardStats } from '@/lib/trade-engine/db'

export async function GET(request: NextRequest) {
  try {
    await initTradeEngineTables()
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const { searchParams } = new URL(request.url)

    const orders = await listPOs(tenantId, {
      status: searchParams.get('status') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    })

    return NextResponse.json({ orders, total: orders.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await initTradeEngineTables()
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()

    const po = await createPO(
      { ...body, tenant_id: tenantId },
      body.line_items || []
    )

    return NextResponse.json({ order: po }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
