import { NextResponse } from 'next/server'
import { getKernels } from '@/lib/control-tower'
import { validateTenant } from '@/lib/control-tower/compliance'
import { initControlTowerTables, writeAuditLog } from '@/lib/control-tower/db'

export async function POST(request: Request) {
  try {
    await initControlTowerTables()

    const tenantHeader = request.headers.get('X-AEGISKY-TENANT-ID')
    const tenantCheck = validateTenant(tenantHeader)
    if (!tenantCheck.valid) {
      return NextResponse.json({ error: tenantCheck.error }, { status: 401 })
    }

    const { trade, rules } = getKernels()
    const body = await request.json()
    const {
      buyer_name, buyer_country, end_user_name, end_user_country,
      end_user_statement, product_id, product_name, eccn_code,
      quantity, unit_value, currency, incoterm, destination_country,
      buyer_id, seller_id, license_id,
    } = body

    // 验证必填字段
    if (!buyer_name || !buyer_country || !product_id || !product_name || !quantity || !destination_country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const totalValue = parseFloat(unit_value || 0) * parseInt(quantity)
    const qty = parseInt(quantity)

    // ========== 使用新Rule Engine做合规评估 ==========
    const evaluationContext = {
      buyer: {
        name: buyer_name,
        country: buyer_country?.toUpperCase(),
      },
      endUser: {
        name: end_user_name,
        country: end_user_country?.toUpperCase(),
      },
      shipTo: {
        country: destination_country?.toUpperCase(),
      },
      product: {
        id: product_id,
        name: product_name,
        eccn: eccn_code || 'EAR99',
        category: body.product_category || 'general',
      },
      order: {
        quantity: qty,
        totalValue,
        currency: currency || 'USD',
        incoterm: incoterm || 'FOB',
      },
      license: license_id ? { hasValidLicense: true, licenseId: license_id } : undefined,
      endUserStatement: end_user_statement ? {
        endUse: end_user_statement,
        signed: true,
      } : undefined,
      documents: {
        eusUploaded: !!end_user_statement,
      },
    }

    const evaluation = await rules.evaluate(evaluationContext)

    // ========== 使用Trade Kernel创建交易（9状态机） ==========
    const idempotencyKey = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    const kernelTradeId = await trade.createTrade({
      type: 'DIRECT_ORDER',
      idempotencyKey,
      buyerId: buyer_id || null,
      sellerId: seller_id || null,
      totalAmount: totalValue,
      currency: currency || 'USD',
      metadata: {
        legacyTransactionRef: `AEG-${Date.now().toString().slice(-8)}`,
        productId: product_id,
        productName: product_name,
        eccnCode: eccn_code || 'EAR99',
        quantity: qty,
        unitValue: parseFloat(unit_value || 0),
        buyerName: buyer_name,
        buyerCountry: buyer_country?.toUpperCase(),
        endUserName: end_user_name,
        endUserCountry: end_user_country?.toUpperCase(),
        destinationCountry: destination_country?.toUpperCase(),
        incoterm: incoterm || 'FOB',
      },
      actor: { id: 'api-user', type: 'USER' },
    })

    // 自动提交合规审查
    await trade.transition(kernelTradeId, 'SUBMIT_COMPLIANCE', { id: 'system', type: 'SYSTEM' })

    // 记录合规决策到证据链
    await trade.recordComplianceDecision(kernelTradeId, {
      outcome: evaluation.finalDecision, // APPROVE/REJECT/REVIEW，符合check约束
      riskScore: evaluation.totalRiskScore,
      riskLevel: evaluation.totalRiskScore >= 70 ? 'CRITICAL' :
                 evaluation.totalRiskScore >= 40 ? 'HIGH' :
                 evaluation.totalRiskScore >= 15 ? 'MEDIUM' : 'LOW',
      matchedRules: evaluation.matchedRules.map(r => ({
        ruleId: r.ruleId,
        ruleName: r.ruleName,
        priority: r.priority,
        reason: r.reason,
      })),
      regulationsVersion: 1,
      inputSnapshot: evaluationContext,
      decidedBy: 'RULE_ENGINE_V5',
      reason: evaluation.reasoning.join('; '),
    })

    // 如果是自动通过，直接批准；如果是REVIEW则等待人工；REJECT直接拒绝
    let finalState = 'COMPLIANCE_PENDING'
    if (evaluation.finalDecision === 'APPROVE') {
      await trade.transition(kernelTradeId, 'COMPLIANCE_APPROVE', { id: 'rule-engine', type: 'SYSTEM' })
      finalState = 'COMPLIANCE_APPROVED'
    } else if (evaluation.finalDecision === 'REJECT') {
      await trade.transition(kernelTradeId, 'COMPLIANCE_REJECT', {
        id: 'rule-engine',
        type: 'SYSTEM',
        reason: evaluation.reasoning.join('; '),
      })
      finalState = 'COMPLIANCE_REJECTED'
    }

    // ========== 同时写入旧表做前端兼容 ==========
    // 映射状态到旧系统
    const legacyStatusMap: Record<string, string> = {
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

    const { v4: uuidv4 } = await import('uuid')
    const transactionRef = `AEG-${Date.now().toString().slice(-8)}`
    const legacyResult = await (await import('@/lib/control-tower/db')).pool.query(
      `INSERT INTO ct_trade_transactions
       (id, tenant_id, transaction_ref, buyer_name, buyer_country, end_user_name, end_user_country,
        product_id, product_name, eccn_code, quantity, unit_value, total_value,
        currency, incoterm, destination_country, compliance_status, risk_score,
        risk_level, screening_results, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [
        uuidv4(),
        tenantCheck.tenantId,
        transactionRef, buyer_name, buyer_country?.toUpperCase(),
        end_user_name, end_user_country?.toUpperCase(),
        product_id, product_name, eccn_code || 'EAR99',
        qty, parseFloat(unit_value || 0), totalValue,
        currency || 'USD', incoterm || 'FOB', destination_country?.toUpperCase(),
        legacyStatusMap[finalState] || 'SCREENING',
        evaluation.totalRiskScore,
        evaluation.totalRiskScore >= 70 ? 'CRITICAL' :
        evaluation.totalRiskScore >= 40 ? 'HIGH' :
        evaluation.totalRiskScore >= 15 ? 'MEDIUM' : 'LOW',
        JSON.stringify(evaluation),
        `kernel_id:${kernelTradeId}`,
      ]
    )

    // 审计日志
    await writeAuditLog({
      tenantId: tenantCheck.tenantId,
      entityType: 'TRANSACTION',
      entityId: kernelTradeId,
      action: 'CREATED_V5',
      actorId: 'system',
      actorType: 'SYSTEM',
      newValues: {
        kernelId: kernelTradeId,
        legacyId: legacyResult.rows[0].id,
        state: finalState,
        riskScore: evaluation.totalRiskScore,
        matchedRules: evaluation.matchedRules.map(r => r.ruleId),
      },
    })

    // 高风险自动创建警报
    if (evaluation.finalDecision === 'REJECT' || evaluation.finalDecision === 'REVIEW') {
      await (await import('@/lib/control-tower/db')).pool.query(
        `INSERT INTO ct_compliance_alerts
         (tenant_id, alert_type, severity, entity_type, entity_id, title, description)
         VALUES ($1, $2, $3, 'TRANSACTION', $4, $5, $6)`,
        [
          tenantCheck.tenantId,
          evaluation.finalDecision === 'REJECT' ? 'SANCTIONS_MATCH' : 'HIGH_RISK_COUNTRY',
          evaluation.finalDecision === 'REJECT' ? 'CRITICAL' : 'HIGH',
          kernelTradeId,
          `[v5] ${evaluation.finalDecision}: ${transactionRef}`,
          evaluation.reasoning.join(' | '),
        ]
      )
    }

    return NextResponse.json({
      transaction: legacyResult.rows[0],
      kernel_trade_id: kernelTradeId,
      kernel_state: finalState,
      compliance_evaluation: {
        decision: evaluation.finalDecision,
        riskScore: evaluation.totalRiskScore,
        matchedRules: evaluation.matchedRules,
        reasoning: evaluation.reasoning,
      },
    }, { status: 201 })

  } catch (error: any) {
    console.error('[Control Tower v5] Create transaction error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
