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

    const { trade, ledger } = getKernels()

    // 1. 新内核状态统计
    const workboxCounts = await trade.getWorkboxCounts()

    // 2. 旧系统统计
    const legacyResult = await pool.query(`
      SELECT
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE compliance_status = 'SCREENING') as pending_review,
        COUNT(*) FILTER (WHERE compliance_status = 'APPROVED') as approved,
        COUNT(*) FILTER (WHERE compliance_status = 'REJECTED') as rejected,
        COUNT(*) FILTER (WHERE risk_level = 'CRITICAL') as critical_risk,
        COUNT(*) FILTER (WHERE risk_level = 'HIGH') as high_risk,
        COALESCE(SUM(total_value) FILTER (WHERE compliance_status = 'APPROVED'), 0) as approved_value
      FROM ct_trade_transactions
      WHERE tenant_id = $1
    `, [tenantCheck.tenantId])

    // 3. 试算平衡表
    const trialBalance = await ledger.getTrialBalance()

    // 4. KYC待审核
    const kycResult = await pool.query(`
      SELECT COUNT(*) as pending_kyc
      FROM ct_kyc_entities
      WHERE tenant_id = $1 AND kyc_status = 'SUBMITTED'
    `, [tenantCheck.tenantId])

    // 5. 未解决警报
    const alertResult = await pool.query(`
      SELECT
        COUNT(*) as open_alerts,
        COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical_alerts
      FROM ct_compliance_alerts
      WHERE tenant_id = $1 AND status = 'OPEN'
    `, [tenantCheck.tenantId])

    return NextResponse.json({
      kernel: {
        version: 'v5.0',
        workbox: workboxCounts,
        compliancePending: workboxCounts.COMPLIANCE_PENDING || 0,
        paymentPending: workboxCounts.PAYMENT_PENDING || 0,
        inFulfillment: workboxCounts.FULFILLMENT || 0,
        completed: workboxCounts.COMPLETED || 0,
        rejected: workboxCounts.COMPLIANCE_REJECTED || 0,
      },
      legacy: legacyResult.rows[0],
      kyc: {
        pendingReview: kycResult.rows[0].pending_kyc,
      },
      alerts: {
        open: parseInt(alertResult.rows[0].open_alerts),
        critical: parseInt(alertResult.rows[0].critical_alerts),
      },
      ledger: {
        balanced: trialBalance.balanced,
        totalDebit: trialBalance.totalDebitBalances,
        totalCredit: trialBalance.totalCreditBalances,
        accountCount: trialBalance.accounts.length,
      },
      uptime: {
        kernelActive: true,
        ruleEngineActive: true,
        ledgerActive: trialBalance.balanced,
      }
    })

  } catch (error: any) {
    console.error('[Dashboard v5] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
