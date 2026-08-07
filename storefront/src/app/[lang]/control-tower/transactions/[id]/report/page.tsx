import { pool } from '@/lib/control-tower/db'
import { notFound } from 'next/navigation'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

export default async function ComplianceReportPage({
  params,
}: {
  params: { id: string }
}) {
  const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

  // 设置租户上下文
  await pool.query(`SELECT app.set_tenant_id($1)`, [TENANT_ID])

  // 获取交易
  const txResult = await pool.query(
    `SELECT * FROM ct_trade_transactions WHERE id = $1 AND tenant_id = $2`,
    [params.id, TENANT_ID]
  )

  if (txResult.rows.length === 0) {
    notFound()
  }

  const tx = txResult.rows[0]
  const kernelId = tx.notes?.match(/kernel_id:([a-f0-9-]+)/)?.[1]

  let kernelTx: any = null
  let complianceDecisions: any[] = []
  let stateHistory: any[] = []
  let ledgerEntries: any[] = []
  let totalDebit = 0
  let totalCredit = 0

  if (kernelId) {
    const kernelResult = await pool.query(
      `SELECT * FROM ct_trade_kernel WHERE trade_id = $1`,
      [kernelId]
    )
    kernelTx = kernelResult.rows[0]

    complianceDecisions = (await pool.query(
      `SELECT * FROM ct_compliance_decisions WHERE trade_id = $1 ORDER BY decided_at ASC`,
      [kernelId]
    )).rows

    stateHistory = (await pool.query(
      `SELECT * FROM ct_trade_state_history WHERE trade_id = $1 ORDER BY created_at ASC`,
      [kernelId]
    )).rows

    const ledgerTxResult = await pool.query(
      `SELECT transaction_id FROM ct_ledger_transactions WHERE trade_id = $1`,
      [kernelId]
    )

    if (ledgerTxResult.rows[0]) {
      ledgerEntries = (await pool.query(
        `SELECT le.*, la.account_code, la.account_name, la.account_type
         FROM ct_ledger_entries le
         JOIN ct_ledger_accounts la ON le.account_id = la.account_id
         WHERE le.transaction_id = $1
         ORDER BY le.entry_id`,
        [ledgerTxResult.rows[0].transaction_id]
      )).rows

      totalDebit = ledgerEntries.reduce((sum, e: any) => sum + Number(e.debit), 0)
      totalCredit = ledgerEntries.reduce((sum, e: any) => sum + Number(e.credit), 0)
    }
  }

  const screening = tx.screening_results || {}
  const matchedRules = screening.matchedRules || []
  const finalState = kernelTx?.current_state || tx.compliance_status

  let statusLabel = 'APPROVED'
  let statusColor = '#16a34a'
  if (finalState?.includes('REJECT') || finalState === 'BLOCKED') {
    statusLabel = 'REJECTED'
    statusColor = '#dc2626'
  } else if (finalState?.includes('PENDING') || finalState?.includes('SCREENING')) {
    statusLabel = 'PENDING REVIEW'
    statusColor = '#d97706'
  }

  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`
  const generatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'

  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto font-sans text-sm">
      {/* 打印脚本 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { setTimeout(() => window.print(), 500); }`,
        }}
      />

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { margin: 2cm; }
        }
        .no-print { position: fixed; top: 20px; right: 20px; z-index: 100; }
      `}</style>

      {/* 打印按钮 */}
      <PrintButton />

      {/* 页眉 */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AEGISKY COMPLIANCE</h1>
            <p className="text-gray-600 mt-1">Export Compliance Evidence Package</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div><strong>Report ID:</strong> {reportId}</div>
            <div><strong>Generated:</strong> {generatedAt}</div>
            <div><strong>Regulation Version:</strong> v1.0</div>
          </div>
        </div>
      </div>

      {/* 最终结论 */}
      <div
        className="rounded-lg p-6 mb-8 border-2"
        style={{
          backgroundColor: statusColor + '15',
          borderColor: statusColor,
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: statusColor }}>
              FINAL DETERMINATION: {statusLabel}
            </h2>
            <p className="text-gray-700 mt-1">
              Transaction Reference: <strong>{tx.transaction_ref}</strong>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: statusColor }}>
              {tx.risk_score}/100
            </div>
            <div className="text-gray-600 text-sm">Risk Score</div>
          </div>
        </div>
      </div>

      {/* 1. 交易详情 */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
          1. Transaction Details
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <DetailRow label="Transaction Reference" value={tx.transaction_ref} />
          <DetailRow label="Kernel Transaction ID" value={kernelId || 'Legacy (pre-v5)'} mono />
          <DetailRow label="Buyer Name" value={tx.buyer_name} />
          <DetailRow label="Buyer Country" value={tx.buyer_country} />
          <DetailRow label="Destination Country" value={tx.destination_country} />
          <DetailRow label="Incoterm" value={tx.incoterm || 'FOB'} />
          <DetailRow label="Product" value={tx.product_name} />
          <DetailRow label="ECCN Code" value={tx.eccn_code || 'Not specified'} />
          <DetailRow label="Quantity" value={tx.quantity?.toString()} />
          <DetailRow label="Total Value" value={`${tx.currency} ${Number(tx.total_value).toLocaleString()}`} />
          <DetailRow label="Submitted At" value={new Date(tx.created_at).toISOString().substring(0, 19) + ' UTC'} />
        </div>
      </section>

      {/* 2. 适用规则 */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
          2. Applied Compliance Rules
        </h3>
        {matchedRules.length === 0 ? (
          <p className="text-gray-600 italic">No rules matched. Transaction automatically approved.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border border-gray-300 font-semibold">Rule ID</th>
                <th className="text-left p-2 border border-gray-300 font-semibold">Rule Name</th>
                <th className="text-center p-2 border border-gray-300 font-semibold">Priority</th>
                <th className="text-center p-2 border border-gray-300 font-semibold">Decision</th>
                <th className="text-center p-2 border border-gray-300 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody>
              {matchedRules.map((rule: any, i: number) => {
                const ruleColor = rule.decision === 'REJECT' ? '#dc2626' :
                                 rule.decision === 'REVIEW' ? '#d97706' : '#16a34a'
                return (
                  <tr key={i} className="align-top">
                    <td className="p-2 border border-gray-300 font-mono text-xs">{rule.ruleId}</td>
                    <td className="p-2 border border-gray-300">
                      <div>{rule.ruleName}</div>
                      <div className="text-xs text-gray-600 mt-1">{rule.reason}</div>
                    </td>
                    <td className="p-2 border border-gray-300 text-center">{rule.priority}</td>
                    <td className="p-2 border border-gray-300 text-center font-bold" style={{ color: ruleColor }}>
                      {rule.decision}
                    </td>
                    <td className="p-2 border border-gray-300 text-center">{rule.riskScore}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* 3. 决策历史 */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
          3. Decision & Approval History
        </h3>

        {complianceDecisions.length === 0 && (!tx.approval_chain || tx.approval_chain.length === 0) ? (
          <p className="text-gray-600 italic">No approval history recorded.</p>
        ) : (
          <div className="space-y-4">
            {complianceDecisions.map((decision: any, i: number) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4 py-1">
                <div className="text-xs text-gray-500 font-mono">
                  {new Date(decision.decided_at).toISOString().substring(0, 19)} UTC
                </div>
                <div className="font-bold text-blue-700">🤖 AUTOMATED DECISION</div>
                <div className="text-sm">
                  <span className="font-semibold">Outcome:</span> {decision.outcome}
                  {' | '}
                  <span className="font-semibold">Risk:</span> {decision.risk_level} ({decision.risk_score})
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Decided by:</span> {decision.decided_by}
                  {' | '}
                  <span className="font-semibold">Regulation version:</span> {decision.regulations_version}
                </div>
                {decision.reason && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Reason:</span> {decision.reason}
                  </div>
                )}
                <div className="text-xs text-gray-400 font-mono mt-1 break-all">
                  Evidence hash: {decision.decision_hash}
                </div>
              </div>
            ))}

            {(tx.approval_chain || []).map((approval: any, i: number) => (
              <div key={i} className="border-l-4 border-purple-500 pl-4 py-1">
                <div className="text-xs text-gray-500 font-mono">
                  {new Date(approval.timestamp).toISOString().substring(0, 19)} UTC
                </div>
                <div className="font-bold text-purple-700">👤 MANUAL ACTION</div>
                <div className="text-sm">
                  <span className="font-semibold">Action:</span> {approval.action}
                  {' | '}
                  <span className="font-semibold">Reviewer:</span> {approval.reviewer}
                </div>
                {approval.notes && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Notes:</span> {approval.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. 记账记录 */}
      {ledgerEntries.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
            4. Double-Entry Ledger Records
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border border-gray-300 font-semibold">Account Code</th>
                <th className="text-left p-2 border border-gray-300 font-semibold">Account Name</th>
                <th className="text-right p-2 border border-gray-300 font-semibold">Debit</th>
                <th className="text-right p-2 border border-gray-300 font-semibold">Credit</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry: any, i: number) => (
                <tr key={i}>
                  <td className="p-2 border border-gray-300 font-mono text-xs">{entry.account_code}</td>
                  <td className="p-2 border border-gray-300">{entry.account_name}</td>
                  <td className="p-2 border border-gray-300 text-right font-mono">
                    {Number(entry.debit) > 0 ? Number(entry.debit).toFixed(2) : '-'}
                  </td>
                  <td className="p-2 border border-gray-300 text-right font-mono">
                    {Number(entry.credit) > 0 ? Number(entry.credit).toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="p-2 border border-gray-300" colSpan={2}>TOTAL</td>
                <td className="p-2 border border-gray-300 text-right font-mono">{totalDebit.toFixed(2)}</td>
                <td className="p-2 border border-gray-300 text-right font-mono">{totalCredit.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {Math.abs(totalDebit - totalCredit) < 0.001 && (
            <div className="mt-2 text-green-700 font-semibold text-sm">
              ✓ Ledger is balanced. Debits equal credits.
            </div>
          )}
        </section>
      )}

      {/* 5. 完整性验证 */}
      <section className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4">
          5. Audit Integrity Verification
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          This evidence package is cryptographically signed using SHA-256 hash chaining.
          Any modification to any record in this chain will invalidate all subsequent hashes.
        </p>

        {complianceDecisions.length > 0 && (
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="text-sm font-semibold mb-1">Final Evidence Hash:</div>
            <div className="text-xs font-mono text-gray-600 break-all">
              {complianceDecisions[complianceDecisions.length - 1].decision_hash}
            </div>
          </div>
        )}
      </section>

      {/* 免责声明 */}
      <section className="mb-8 text-xs text-gray-500 border-t pt-4">
        <p className="font-semibold mb-1">DISCLAIMER:</p>
        <p>
          This document is generated automatically by the Aegisky Control Tower compliance system.
          It represents the system&apos;s assessment based on the regulations and rules in effect at the time of evaluation.
          This document does not constitute legal advice. Final responsibility for export compliance rests with the exporter.
        </p>
      </section>

      {/* 签名栏 */}
      <section className="mt-12 pt-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="border-b border-gray-400 h-12 mb-2"></div>
            <div className="text-sm font-semibold">Authorized Compliance Officer</div>
            <div className="text-xs text-gray-600">Name: _________________________</div>
            <div className="text-xs text-gray-600">Date: __________________________</div>
          </div>
          <div>
            <div className="border-b border-gray-400 h-12 mb-2"></div>
            <div className="text-sm font-semibold">Aegisky Systems Ltd.</div>
            <div className="text-xs text-gray-600">Signature: ______________________</div>
            <div className="text-xs text-gray-600">Date: __________________________</div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-400">
        Aegisky Compliance Report {reportId} | Page 1 of 1 | Generated {generatedAt}
      </div>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex">
      <div className="w-48 text-gray-500 font-semibold flex-shrink-0">{label}:</div>
      <div className={mono ? 'font-mono text-xs' : ''}>{value || '-'}</div>
    </div>
  )
}
