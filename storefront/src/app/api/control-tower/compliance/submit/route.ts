import { NextResponse } from 'next/server'
import { submitComplianceAudit, validateTenant } from '@/lib/control-tower/compliance'
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
    const { buyer_company_name, target_country, end_user_statement } = body

    if (!buyer_company_name || !target_country || !end_user_statement) {
      return NextResponse.json(
        { status: 'error', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await submitComplianceAudit({
      tenantId: tenantCheck.tenantId,
      buyerCompanyName: buyer_company_name,
      targetCountry: target_country,
      endUserStatement: end_user_statement,
    })

    return NextResponse.json(result.data, { status: result.status || 500 })
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
}
