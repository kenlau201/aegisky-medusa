import { NextResponse } from 'next/server'
import { getKernels } from '@/lib/control-tower'
import { pool, writeAuditLog } from '@/lib/control-tower/db'
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

    const { trade } = getKernels()
    const body = await request.json()
    const { transaction_id, action, reviewer_id, reviewer_notes, license_number } = body

    if (!transaction_id || !action) {
      return NextResponse.json({ error: 'Missing transaction_id or action' }, { status: 400 })
    }

    // 获取旧表交易
    const txnResult = await pool.query(
      'SELECT * FROM ct_trade_transactions WHERE id = $1 AND tenant_id = $2',
      [transaction_id, tenantCheck.tenantId]
    )
    if (txnResult.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }
    const transaction = txnResult.rows[0]

    // 提取kernel_id（从notes字段）
    let kernelId: string | null = null
    if (transaction.notes && transaction.notes.startsWith('kernel_id:')) {
      kernelId = transaction.notes.replace('kernel_id:', '')
    }

    // 旧系统状态映射
    let newLegacyStatus: string
    let approvalEntry: any
    let kernelEvent: any = null
    const actor = { id: reviewer_id || 'compliance_officer', type: 'COMPLIANCE_OFFICER' as const }

    switch (action) {
      case 'APPROVE':
        newLegacyStatus = 'APPROVED'
        approvalEntry = {
          action: 'APPROVED',
          reviewer: reviewer_id || 'compliance_officer',
          timestamp: new Date().toISOString(),
          notes: reviewer_notes || 'Approved after compliance review',
        }
        kernelEvent = 'COMPLIANCE_APPROVE'
        break

      case 'REJECT':
        newLegacyStatus = 'REJECTED'
        approvalEntry = {
          action: 'REJECTED',
          reviewer: reviewer_id || 'compliance_officer',
          timestamp: new Date().toISOString(),
          notes: reviewer_notes || 'Rejected due to compliance concerns',
        }
        kernelEvent = 'COMPLIANCE_REJECT'
        break

      case 'ESCALATE':
        newLegacyStatus = 'SCREENING'
        approvalEntry = {
          action: 'ESCALATED',
          reviewer: reviewer_id || 'compliance_officer',
          timestamp: new Date().toISOString(),
          notes: reviewer_notes || 'Escalated to senior compliance',
        }
        // 状态机里ESCALATE还是在COMPLIANCE_PENDING，只是加个备注
        break

      case 'REQUEST_LICENSE':
        newLegacyStatus = 'LICENSE_PENDING'
        approvalEntry = {
          action: 'LICENSE_REQUESTED',
          reviewer: reviewer_id || 'compliance_officer',
          timestamp: new Date().toISOString(),
          notes: reviewer_notes || 'Export license application initiated',
        }
        break

      case 'ATTACH_LICENSE':
        newLegacyStatus = 'APPROVED'
        approvalEntry = {
          action: 'LICENSE_ATTACHED',
          reviewer: reviewer_id || 'compliance_officer',
          timestamp: new Date().toISOString(),
          license_number: license_number,
          notes: 'Valid export license attached',
        }
        kernelEvent = 'COMPLIANCE_APPROVE'
        break

      case 'CONFIRM_PAYMENT':
        newLegacyStatus = 'APPROVED'
        approvalEntry = {
          action: 'PAYMENT_CONFIRMED',
          reviewer: reviewer_id || 'finance',
          timestamp: new Date().toISOString(),
          notes: reviewer_notes || 'Payment confirmed and held in escrow',
        }
        kernelEvent = 'PAYMENT_CONFIRMED'
        break

      case 'START_FULFILLMENT':
        newLegacyStatus = 'SHIPPED'
        approvalEntry = {
          action: 'FULFILLMENT_STARTED',
          reviewer: reviewer_id || 'warehouse',
          timestamp: new Date().toISOString(),
          notes: reviewer_notes || 'Order picking and shipping started',
        }
        kernelEvent = 'START_FULFILLMENT'
        break

      case 'COMPLETE':
        newLegacyStatus = 'COMPLETED'
        approvalEntry = {
          action: 'COMPLETED',
          reviewer: reviewer_id || 'system',
          timestamp: new Date().toISOString(),
          notes: 'Delivery confirmed, transaction complete',
        }
        kernelEvent = 'COMPLETE_TRADE'
        break

      case 'CANCEL':
        newLegacyStatus = 'CANCELLED'
        approvalEntry = {
          action: 'CANCELLED',
          reviewer: reviewer_id || 'system',
          timestamp: new Date().toISOString(),
          notes: reviewer_notes || 'Transaction cancelled',
        }
        kernelEvent = 'CANCEL_TRADE'
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // ========== 调用新状态机 ==========
    let kernelState = null
    if (kernelId && kernelEvent) {
      try {
        kernelState = await trade.transition(kernelId, kernelEvent, {
          ...actor,
          reason: reviewer_notes,
        })
      } catch (e: any) {
        console.warn(`Kernel transition failed for ${kernelId}: ${e.message}, falling back to legacy`)
      }
    }

    // 更新旧表
    const approvalChain = Array.isArray(transaction.approval_chain) ? transaction.approval_chain : []
    approvalChain.push(approvalEntry)

    await pool.query(
      `UPDATE ct_trade_transactions
       SET compliance_status = $1::text,
           approved_by = $2::text,
           approved_at = CASE WHEN $1::text = 'APPROVED' THEN NOW() ELSE approved_at END,
           license_number = COALESCE($3::text, license_number),
           approval_chain = $4::jsonb,
           rejection_reason = CASE WHEN $1::text = 'REJECTED' THEN $5::text ELSE rejection_reason END,
           updated_at = NOW()
       WHERE id = $6::uuid`,
      [
        newLegacyStatus,
        reviewer_id || 'compliance_officer',
        license_number || null,
        JSON.stringify(approvalChain),
        reviewer_notes || null,
        transaction_id,
      ]
    )

    // 审计日志
    await writeAuditLog({
      tenantId: tenantCheck.tenantId,
      entityType: 'TRANSACTION',
      entityId: kernelId || transaction_id,
      action: `COMPLIANCE_${action}_V5`,
      actorId: reviewer_id || 'compliance_officer',
      actorType: 'USER',
      oldValues: { status: transaction.compliance_status },
      newValues: {
        legacyStatus: newLegacyStatus,
        kernelState,
        notes: reviewer_notes,
      },
    })

    // 关联警报标记为已解决
    if (newLegacyStatus === 'APPROVED' || newLegacyStatus === 'REJECTED' || newLegacyStatus === 'CANCELLED') {
      await pool.query(
        `UPDATE ct_compliance_alerts SET status = 'RESOLVED', resolved_at = NOW(), resolution = $1
         WHERE entity_id = $2 AND status = 'OPEN'`,
        [`Transaction ${action} by compliance officer`, kernelId || transaction_id]
      )
    }

    return NextResponse.json({
      success: true,
      transaction_id,
      kernel_id: kernelId,
      new_status: newLegacyStatus,
      kernel_state: kernelState,
      approval_chain: approvalChain,
    })

  } catch (error: any) {
    console.error('[Control Tower v5] Approve transaction error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
