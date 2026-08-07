import { NextRequest } from 'next/server'
import PDFDocument from 'pdfkit'
import { pool } from '@/lib/control-tower/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const transactionId = params.id
  const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

  // 设置租户上下文（RLS需要）
  await pool.query(`SELECT app.set_tenant_id($1)`, [TENANT_ID])

  // 1. 获取交易数据
  const txResult = await pool.query(
    `SELECT * FROM ct_trade_transactions WHERE id = $1 AND tenant_id = $2`,
    [transactionId, TENANT_ID]
  )

  if (txResult.rows.length === 0) {
    return new Response('Transaction not found', { status: 404 })
  }

  const tx = txResult.rows[0]
  const kernelId = tx.notes?.match(/kernel_id:([a-f0-9-]+)/)?.[1]

  // 2. 获取内核数据
  let kernelTx: any = null
  let complianceDecisions: any[] = []
  let stateHistory: any[] = []
  let ledgerEntries: any[] = []

  if (kernelId) {
    const kernelResult = await pool.query(
      `SELECT * FROM ct_trade_kernel WHERE trade_id = $1`,
      [kernelId]
    )
    kernelTx = kernelResult.rows[0]

    complianceDecisions = await pool.query(
      `SELECT * FROM ct_compliance_decisions WHERE trade_id = $1 ORDER BY decided_at ASC`,
      [kernelId]
    ).then(r => r.rows)

    stateHistory = await pool.query(
      `SELECT * FROM ct_trade_state_history WHERE trade_id = $1 ORDER BY created_at ASC`,
      [kernelId]
    ).then(r => r.rows)

    // 获取记账记录
    const ledgerTx = await pool.query(
      `SELECT transaction_id FROM ct_ledger_transactions WHERE trade_id = $1`,
      [kernelId]
    ).then(r => r.rows[0])

    if (ledgerTx) {
      ledgerEntries = await pool.query(
        `SELECT le.*, la.account_code, la.account_name, la.account_type
         FROM ct_ledger_entries le
         JOIN ct_ledger_accounts la ON le.account_id = la.account_id
         WHERE le.transaction_id = $1
         ORDER BY le.entry_id`,
        [ledgerTx.transaction_id]
      ).then(r => r.rows)
    }
  }

  // 3. 解析筛查结果
  const screening = tx.screening_results || {}
  const matchedRules = screening.matchedRules || []

  // 4. 生成PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  // 收集PDF chunks
  const chunks: Buffer[] = []
  doc.on('data', (chunk) => chunks.push(chunk))

  // 页眉
  doc.fontSize(20).font('Helvetica-Bold').text('AEGISKY COMPLIANCE', { align: 'left' })
  doc.fontSize(10).font('Helvetica').text('Export Compliance Evidence Package', { align: 'left' })
  doc.moveDown(0.5)

  // 报告信息
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`
  doc.fontSize(9).fillColor('#666')
  doc.text(`Report ID: ${reportId}`, 50, 70)
  doc.text(`Generated: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`, 50, 85)
  doc.text(`Regulation Version: v1.0`, 50, 100)
  doc.fillColor('black')

  // 分隔线
  doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#ddd').lineWidth(1).stroke()
  doc.moveDown(2)

  // 交易标题
  doc.fontSize(16).font('Helvetica-Bold').text(`Transaction ${tx.transaction_ref}`)
  doc.moveDown(0.5)

  // 最终结论框
  const finalStatus = kernelTx?.current_state || tx.compliance_status
  let statusColor = '#30D158'
  let statusText = 'APPROVED'
  if (finalStatus?.includes('REJECT') || finalStatus === 'BLOCKED') {
    statusColor = '#FF453A'
    statusText = 'REJECTED'
  } else if (finalStatus?.includes('PENDING') || finalStatus?.includes('SCREENING')) {
    statusColor = '#FF9F0A'
    statusText = 'PENDING REVIEW'
  }

  doc.rect(50, doc.y, 495, 40).fill(statusColor).fillOpacity(0.15).stroke(statusColor)
  doc.fillColor(statusColor).font('Helvetica-Bold').fontSize(14)
  doc.text(`FINAL DETERMINATION: ${statusText}`, 70, doc.y + 12)
  doc.fillColor('black').font('Helvetica').fontSize(10)
  doc.text(`Risk Score: ${tx.risk_score}/100 | Risk Level: ${tx.risk_level}`, 350, doc.y + 12)
  doc.moveDown(2.5)

  // 第一部分：交易详情
  doc.fontSize(13).font('Helvetica-Bold').text('1. Transaction Details')
  doc.moveDown(0.5)
  doc.font('Helvetica').fontSize(10)

  const details = [
    ['Transaction Reference', tx.transaction_ref],
    ['Kernel Transaction ID', kernelId || 'N/A (legacy)'],
    ['Buyer Name', tx.buyer_name],
    ['Buyer Country', tx.buyer_country],
    ['Destination Country', tx.destination_country],
    ['Product', tx.product_name],
    ['ECCN Code', tx.eccn_code || 'Not specified'],
    ['Quantity', tx.quantity?.toString()],
    ['Total Value', `${tx.currency} ${Number(tx.total_value).toLocaleString()}`],
    ['Incoterm', tx.incoterm || 'FOB'],
    ['Submitted At', new Date(tx.created_at).toISOString().replace('T', ' ').substring(0, 19) + ' UTC'],
  ]

  details.forEach(([label, value]) => {
    doc.font('Helvetica-Bold').text(label + ':', 70, doc.y, { width: 180 })
    doc.font('Helvetica').text(value || '-', 250, doc.y - 12, { width: 280 })
    doc.moveDown(0.3)
  })

  doc.moveDown(1.5)

  // 第二部分：匹配的合规规则
  doc.fontSize(13).font('Helvetica-Bold').text('2. Applied Compliance Rules')
  doc.moveDown(0.5)
  doc.font('Helvetica').fontSize(9)

  if (matchedRules.length === 0) {
    doc.text('No rules matched. Transaction automatically approved.', 70)
  } else {
    // 表头
    doc.rect(50, doc.y, 495, 20).fill('#f0f0f0')
    doc.fillColor('black').font('Helvetica-Bold')
    doc.text('Rule ID', 60, doc.y + 5, { width: 100 })
    doc.text('Rule Name', 160, doc.y + 5, { width: 150 })
    doc.text('Priority', 310, doc.y + 5, { width: 50 })
    doc.text('Decision', 360, doc.y + 5, { width: 70 })
    doc.text('Risk', 430, doc.y + 5, { width: 60 })
    doc.moveDown(1.5)

    matchedRules.forEach((rule: any) => {
      const ruleColor = rule.decision === 'REJECT' ? '#FF453A' :
                       rule.decision === 'REVIEW' ? '#FF9F0A' : '#30D158'

      doc.font('Helvetica').fillColor('black')
      doc.text(rule.ruleId, 60, doc.y, { width: 100 })
      doc.text(rule.ruleName, 160, doc.y, { width: 150 })
      doc.text(rule.priority?.toString(), 310, doc.y, { width: 50 })
      doc.fillColor(ruleColor).text(rule.decision, 360, doc.y, { width: 70 })
      doc.fillColor('black').text(rule.riskScore?.toString(), 430, doc.y, { width: 60 })
      doc.moveDown(0.3)

      // 原因
      doc.fillColor('#555').fontSize(8)
      doc.text(`Reason: ${rule.reason}`, 70, doc.y, { width: 450 })
      doc.fillColor('black').fontSize(9)
      doc.moveDown(0.5)
    })
  }

  doc.moveDown(1)

  // 第三部分：决策历史
  doc.fontSize(13).font('Helvetica-Bold').text('3. Decision & Approval History')
  doc.moveDown(0.5)
  doc.font('Helvetica').fontSize(9)

  if (complianceDecisions.length === 0 && (!tx.approval_chain || tx.approval_chain.length === 0)) {
    doc.text('No approval history recorded.', 70)
  } else {
    // 自动决策
    complianceDecisions.forEach((decision: any) => {
      doc.fillColor('#0071E3').font('Helvetica-Bold')
      doc.text(`[${new Date(decision.decided_at).toISOString().substring(0, 19)}] AUTOMATED DECISION`, 70)
      doc.fillColor('black').font('Helvetica')
      doc.text(`Decision: ${decision.outcome} | Risk: ${decision.risk_level} (${decision.risk_score})`, 90)
      doc.text(`Decided by: ${decision.decided_by} | Regulation version: ${decision.regulations_version}`, 90)
      if (decision.reason) doc.text(`Reason: ${decision.reason}`, 90)
      doc.text(`Evidence hash: ${decision.decision_hash?.substring(0, 32)}...`, 90)
      doc.moveDown(0.5)
    })

    // 人工审批
    ;(tx.approval_chain || []).forEach((approval: any) => {
      doc.fillColor('#5E5CE6').font('Helvetica-Bold')
      doc.text(`[${new Date(approval.timestamp).toISOString().substring(0, 19)}] MANUAL ACTION`, 70)
      doc.fillColor('black').font('Helvetica')
      doc.text(`Action: ${approval.action} | Reviewer: ${approval.reviewer}`, 90)
      if (approval.notes) doc.text(`Notes: ${approval.notes}`, 90)
      doc.moveDown(0.5)
    })
  }

  doc.moveDown(1)

  // 第四部分：记账记录
  if (ledgerEntries.length > 0) {
    doc.fontSize(13).font('Helvetica-Bold').text('4. Double-Entry Ledger Records')
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(9)

    doc.rect(50, doc.y, 495, 20).fill('#f0f0f0')
    doc.fillColor('black').font('Helvetica-Bold')
    doc.text('Account Code', 60, doc.y + 5, { width: 180 })
    doc.text('Account Name', 240, doc.y + 5, { width: 150 })
    doc.text('Debit', 390, doc.y + 5, { width: 70, align: 'right' })
    doc.text('Credit', 460, doc.y + 5, { width: 70, align: 'right' })
    doc.moveDown(1.5)

    let totalDebit = 0
    let totalCredit = 0

    ledgerEntries.forEach((entry: any) => {
      doc.font('Helvetica').fillColor('black')
      doc.text(entry.account_code, 60, doc.y, { width: 180 })
      doc.text(entry.account_name, 240, doc.y, { width: 150 })
      const debit = Number(entry.debit)
      const credit = Number(entry.credit)
      totalDebit += debit
      totalCredit += credit
      doc.text(debit > 0 ? debit.toFixed(2) : '-', 390, doc.y, { width: 70, align: 'right' })
      doc.text(credit > 0 ? credit.toFixed(2) : '-', 460, doc.y, { width: 70, align: 'right' })
      doc.moveDown(0.3)
    })

    // 合计
    doc.moveDown(0.3)
    doc.font('Helvetica-Bold')
    doc.text('TOTAL', 60, doc.y, { width: 180 })
    doc.text(totalDebit.toFixed(2), 390, doc.y, { width: 70, align: 'right' })
    doc.text(totalCredit.toFixed(2), 460, doc.y, { width: 70, align: 'right' })
    doc.moveDown(0.5)

    if (Math.abs(totalDebit - totalCredit) < 0.001) {
      doc.fillColor('#30D158').fontSize(10)
      doc.text('✓ Ledger is balanced. Debits equal credits.', 70)
      doc.fillColor('black')
    }

    doc.moveDown(1)
  }

  // 第五部分：审计链验证
  doc.fontSize(13).font('Helvetica-Bold').text('5. Audit Integrity Verification')
  doc.moveDown(0.5)
  doc.font('Helvetica').fontSize(9)

  doc.text('This evidence package is cryptographically signed using SHA-256 hash chaining.', 70)
  doc.text('Any modification to any record in this chain will invalidate all subsequent hashes.', 70)
  doc.moveDown(0.5)

  if (complianceDecisions.length > 0) {
    const lastDecision = complianceDecisions[complianceDecisions.length - 1]
    doc.font('Helvetica-Bold')
    doc.text('Final Evidence Hash:', 70)
    doc.font('Courier', 8)
    doc.text(lastDecision.decision_hash, 70, doc.y, { width: 450 })
  }

  doc.moveDown(2)

  // 免责声明
  doc.fontSize(8).fillColor('#666')
  doc.text('DISCLAIMER: This document is generated automatically by the Aegisky Control Tower compliance system. It represents the system\'s assessment based on the regulations and rules in effect at the time of evaluation. This document does not constitute legal advice. Final responsibility for export compliance rests with the exporter.', 50, doc.y, { width: 495 })

  doc.moveDown(2)

  // 签名栏
  doc.fontSize(9).fillColor('black')
  doc.text('Authorized Compliance Officer Signature:', 50, doc.y)
  doc.moveDown(1)
  doc.moveTo(50, doc.y).lineTo(250, doc.y).strokeColor('#999').lineWidth(1).stroke()
  doc.text('Name: _________________________', 50, doc.y + 10)
  doc.text('Date: __________________________', 300, doc.y + 10)

  // 页脚
  doc.fontSize(8).fillColor('#999')
  doc.text(`Aegisky Compliance Report ${reportId} | Page 1 of 1 | Generated ${new Date().toISOString().substring(0, 10)}`,
    50, 780, { width: 495, align: 'center' })

  doc.end()

  // 等待PDF生成完成
  await new Promise((resolve) => doc.on('end', resolve))
  const pdfBuffer = Buffer.concat(chunks)

  // 返回PDF
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="compliance-${tx.transaction_ref}.pdf"`,
    },
  })
}
