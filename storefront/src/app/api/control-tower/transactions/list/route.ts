import { NextResponse } from 'next/server'
import { getKernels } from '@/lib/control-tower'
import { pool } from '@/lib/control-tower/db'
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

    const { trade } = getKernels()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const kernelState = searchParams.get('kernel_state')
    const riskLevel = searchParams.get('risk_level')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')

    // 如果请求的是新状态机的状态，直接从内核表查
    if (kernelState) {
      const kernelTransactions = await trade.listTransactionsByState(kernelState as any, limit, offset)

      // join旧表获取业务字段
      const enriched = await Promise.all(kernelTransactions.map(async (kt: any) => {
        const legacyResult = await pool.query(
          `SELECT id, transaction_ref, buyer_name, buyer_country, product_name,
                  quantity, total_value, currency, destination_country,
                  risk_score, risk_level, created_at
           FROM ct_trade_transactions
           WHERE notes = $1 OR notes LIKE $2`,
          [`kernel_id:${kt.id}`, `%kernel_id:${kt.id}%`]
        )
        const legacy = legacyResult.rows[0] || {}
        return {
          ...legacy,
          kernel_id: kt.id,
          kernel_state: kt.state,
          kernel_type: kt.type,
          kernel_total_amount: kt.total_amount,
          kernel_currency: kt.currency,
          kernel_version: kt.version,
          kernel_created_at: kt.created_at,
          // 用内核状态覆盖
          compliance_status: mapKernelStateToLegacy(kt.state),
        }
      }))

      return NextResponse.json({
        transactions: enriched,
        total: enriched.length,
        limit, offset,
        source: 'kernel',
      })
    }

    // 旧表查询（兼容）
    let whereClause = 'WHERE tenant_id = $1'
    const params: any[] = [tenantCheck.tenantId]

    if (status) {
      params.push(status)
      whereClause += ` AND compliance_status = $${params.length}`
    }
    if (riskLevel) {
      params.push(riskLevel)
      whereClause += ` AND risk_level = $${params.length}`
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as cnt FROM ct_trade_transactions ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].cnt)

    params.push(limit, offset)
    const result = await pool.query(
      `SELECT id, transaction_ref, buyer_name, buyer_country, product_name,
              quantity, total_value, currency, destination_country,
              compliance_status, risk_score, risk_level, created_at, notes,
              approval_chain
       FROM ct_trade_transactions
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )

    // 给每条加上kernel_id
    const transactions = result.rows.map(row => {
      let kid = null
      if (row.notes && row.notes.startsWith('kernel_id:')) {
        kid = row.notes.replace('kernel_id:', '')
      }
      const { notes, ...rest } = row
      return { ...rest, kernel_id: kid }
    })

    return NextResponse.json({ transactions, total, limit, offset, source: 'legacy' })

  } catch (error: any) {
    console.error('[Control Tower v5] List transactions error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function mapKernelStateToLegacy(state: string): string {
  const map: Record<string, string> = {
    'INIT': 'DRAFT',
    'COMPLIANCE_PENDING': 'SCREENING',
    'COMPLIANCE_APPROVED': 'APPROVED',
    'COMPLIANCE_REJECTED': 'REJECTED',
    'PAYMENT_PENDING': 'APPROVED',
    'PAYMENT_CONFIRMED': 'APPROVED',
    'FULFILLMENT': 'SHIPPED',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED',
    'DISPUTED': 'BLOCKED',
  }
  return map[state] || state
}
