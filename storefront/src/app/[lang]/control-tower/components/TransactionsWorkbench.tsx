'use client'

import React, { useState, useEffect } from 'react'

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

interface Transaction {
  id: string
  transaction_ref: string
  buyer_name: string
  buyer_country: string
  product_name: string
  quantity: number
  total_value: number
  currency: string
  destination_country: string
  compliance_status: string
  risk_score: number
  risk_level: string
  created_at: string
  kernel_id?: string
  kernel_state?: string
  approval_chain?: any[]
}

// v5.0 9状态颜色映射
const STATUS_COLORS: Record<string, string> = {
  // 旧状态兼容
  DRAFT: 'bg-[#86868B]',
  KYC_PENDING: 'bg-[#FF9F0A]',
  SCREENING: 'bg-[#0071E3]',
  LICENSE_REQUIRED: 'bg-[#FF9F0A]',
  LICENSE_PENDING: 'bg-[#FF9F0A]',
  APPROVED: 'bg-[#30D158]',
  REJECTED: 'bg-[#FF453A]',
  BLOCKED: 'bg-[#FF453A]',
  SHIPPED: 'bg-[#5E5CE6]',
  DELIVERED: 'bg-[#30D158]',
  COMPLETED: 'bg-[#30D158]',
  CANCELLED: 'bg-[#86868B]',
  // v5.0新9状态
  INIT: 'bg-[#86868B]',
  COMPLIANCE_PENDING: 'bg-[#0071E3]',
  COMPLIANCE_APPROVED: 'bg-[#30D158]',
  COMPLIANCE_REJECTED: 'bg-[#FF453A]',
  PAYMENT_PENDING: 'bg-[#FF9F0A]',
  PAYMENT_CONFIRMED: 'bg-[#64D2FF]',
  FULFILLMENT: 'bg-[#5E5CE6]',
  DISPUTED: 'bg-[#FF453A]',
}

const RISK_COLORS: Record<string, string> = {
  LOW: 'text-[#30D158]',
  MEDIUM: 'text-[#FF9F0A]',
  HIGH: 'text-[#FF453A]',
  CRITICAL: 'text-[#FF453A] bg-[#3A1C1C] px-2 py-0.5 rounded',
}

// v5.0 状态过滤标签
const FILTERS = [
  { key: 'ALL', label: 'ALL' },
  { key: 'COMPLIANCE_PENDING', label: 'COMPLIANCE', kernel: true },
  { key: 'PAYMENT_PENDING', label: 'PAYMENT', kernel: true },
  { key: 'FULFILLMENT', label: 'FULFILLMENT', kernel: true },
  { key: 'APPROVED', label: 'APPROVED' },
  { key: 'REJECTED', label: 'REJECTED' },
]

export default function TransactionsWorkbench() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetchTransactions()
    const interval = setInterval(fetchTransactions, 10000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchTransactions = async () => {
    try {
      const filterConfig = FILTERS.find(f => f.key === filter)
      let url = '/api/control-tower/transactions/list?limit=50'
      if (filter !== 'ALL') {
        if (filterConfig?.kernel) {
          url = `/api/control-tower/transactions/list?kernel_state=${filter}&limit=50`
        } else {
          url = `/api/control-tower/transactions/list?status=${filter}&limit=50`
        }
      }
      const res = await fetch(url, {
        headers: { 'X-AEGISKY-TENANT-ID': TENANT_ID },
      })
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions || [])
      }
    } catch (e) {
      console.error('Failed to fetch transactions:', e)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const getDisplayStatus = (tx: Transaction) => tx.kernel_state || tx.compliance_status

  return (
    <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Compliance Workbench v5</h3>
          <p className="text-xs text-[#86868B] mt-1">9-state kernel · evidence chain · double-entry ledger</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${
                filter === f.key
                  ? 'bg-[#0071E3] text-white'
                  : 'bg-[#2C2C2E] text-[#86868B] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#86868B] text-sm">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-[#86868B]">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm">No transactions in this queue</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[#86868B] border-b border-[#2D2D2E]">
                <th className="pb-3 font-medium">Reference</th>
                <th className="pb-3 font-medium">Counterparty</th>
                <th className="pb-3 font-medium">Item</th>
                <th className="pb-3 font-medium">Destination</th>
                <th className="pb-3 font-medium">Value</th>
                <th className="pb-3 font-medium">Risk</th>
                <th className="pb-3 font-medium">Kernel State</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => { setSelectedTx(tx); setShowDetail(true) }}
                  className="border-b border-[#2D2D2E] hover:bg-[#2C2C2E] cursor-pointer transition-colors"
                >
                  <td className="py-3 font-mono text-[#0071E3] font-medium">
                    {tx.transaction_ref}
                    {tx.kernel_id && <div className="text-[9px] text-[#5E5CE6] font-mono mt-0.5">v5 kernel</div>}
                  </td>
                  <td className="py-3">
                    <div className="text-white">{tx.buyer_name}</div>
                    <div className="text-[#86868B] text-[10px]">{tx.buyer_country}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-white truncate max-w-[180px]">{tx.product_name}</div>
                    <div className="text-[#86868B] text-[10px]">Qty: {tx.quantity}</div>
                  </td>
                  <td className="py-3 text-white">{tx.destination_country}</td>
                  <td className="py-3 font-mono text-white">
                    {tx.currency} {Number(tx.total_value).toLocaleString()}
                  </td>
                  <td className={`py-3 font-semibold ${RISK_COLORS[tx.risk_level] || ''}`}>
                    {tx.risk_level} ({tx.risk_score})
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium text-white ${STATUS_COLORS[getDisplayStatus(tx)] || 'bg-[#86868B]'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      {getDisplayStatus(tx)?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-[#86868B] font-mono text-[10px]">{formatDate(tx.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetail && selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setShowDetail(false)}
          onUpdate={fetchTransactions}
        />
      )}
    </div>
  )
}

function TransactionDetailModal({
  transaction,
  onClose,
  onUpdate,
}: {
  transaction: Transaction
  onClose: () => void
  onUpdate: () => void
}) {
  const [details, setDetails] = useState<any>(null)
  const [reviewerNotes, setReviewerNotes] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchDetails()
  }, [transaction.id])

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/control-tower/transactions/${transaction.id}`, {
        headers: { 'X-AEGISKY-TENANT-ID': TENANT_ID },
      })
      if (res.ok) setDetails(await res.json())
    } catch (e) {
      console.error(e)
    }
  }

  const handleAction = async (action: string) => {
    setActionLoading(true)
    try {
      await fetch('/api/control-tower/transactions/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': TENANT_ID,
        },
        body: JSON.stringify({
          transaction_id: transaction.id,
          action,
          reviewer_id: 'compliance_officer',
          reviewer_notes: reviewerNotes,
          license_number: licenseNumber,
        }),
      })
      onUpdate()
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const currentState = transaction.kernel_state || transaction.compliance_status
  const isComplianceReview = ['SCREENING', 'LICENSE_REQUIRED', 'LICENSE_PENDING', 'KYC_PENDING', 'COMPLIANCE_PENDING'].includes(currentState)
  const isPaymentPending = ['PAYMENT_PENDING', 'APPROVED'].includes(currentState)
  const isFulfillment = ['PAYMENT_CONFIRMED', 'FULFILLMENT'].includes(currentState)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1C1C1E] border border-[#2D2D2E] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#1C1C1E] border-b border-[#2D2D2E] p-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#86868B] font-mono mb-1">
              {transaction.kernel_id ? '🔗 V5 KERNEL TRANSACTION' : 'LEGACY TRANSACTION'}
            </div>
            <h3 className="text-xl font-medium text-white font-mono">{transaction.transaction_ref}</h3>
            {transaction.kernel_id && (
              <div className="text-[10px] text-[#5E5CE6] font-mono mt-1">kernel: {transaction.kernel_id}</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/en/control-tower/transactions/${transaction.id}/report`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white text-[10px] font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              📄 Export Evidence PDF
            </a>
            <button onClick={onClose} className="text-[#86868B] hover:text-white text-2xl">×</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 状态时间线 - v5 9状态 */}
          <div className="bg-[#2C2C2E] rounded-xl p-4">
            <div className="text-[10px] text-[#86868B] mb-3">TRANSACTION LIFECYCLE</div>
            <div className="flex items-center justify-between">
              {['INIT', 'COMPLIANCE', 'PAYMENT', 'FULFILLMENT', 'COMPLETE'].map((stage, i) => {
                const stageStates = [
                  ['INIT'],
                  ['COMPLIANCE_PENDING', 'COMPLIANCE_APPROVED', 'COMPLIANCE_REJECTED', 'SCREENING', 'APPROVED', 'REJECTED'],
                  ['PAYMENT_PENDING', 'PAYMENT_CONFIRMED'],
                  ['FULFILLMENT', 'SHIPPED'],
                  ['COMPLETED'],
                ]
                const isActive = stageStates[i].includes(currentState)
                const isPast = i < ['INIT','COMPLIANCE_PENDING','PAYMENT_PENDING','FULFILLMENT','COMPLETED'].indexOf(currentState) ||
                  (currentState === 'COMPLIANCE_APPROVED' && i < 2) ||
                  (currentState === 'PAYMENT_CONFIRMED' && i < 3) ||
                  (currentState === 'COMPLETED' && i < 4)
                return (
                  <div key={stage} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-[#0071E3] text-white' :
                      isPast ? 'bg-[#30D158] text-white' :
                      'bg-[#3A3A3C] text-[#86868B]'
                    }`}>
                      {isPast ? '✓' : i + 1}
                    </div>
                    <div className="ml-2 text-[10px] font-medium text-white">{stage}</div>
                    {i < 4 && <div className={`flex-1 h-0.5 mx-2 ${isPast ? 'bg-[#30D158]' : 'bg-[#3A3A3C]'}`} />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2C2C2E] rounded-xl p-4">
              <div className="text-[10px] text-[#86868B] mb-2">BUYER</div>
              <div className="text-white font-medium">{transaction.buyer_name}</div>
              <div className="text-[#86868B] text-sm">{transaction.buyer_country}</div>
            </div>
            <div className="bg-[#2C2C2E] rounded-xl p-4">
              <div className="text-[10px] text-[#86868B] mb-2">DESTINATION</div>
              <div className="text-white font-medium">{transaction.destination_country}</div>
              <div className="text-[#86868B] text-sm">{transaction.currency} {Number(transaction.total_value).toLocaleString()}</div>
            </div>
            <div className="bg-[#2C2C2E] rounded-xl p-4">
              <div className="text-[10px] text-[#86868B] mb-2">PRODUCT</div>
              <div className="text-white font-medium">{transaction.product_name}</div>
              <div className="text-[#86868B] text-sm">Quantity: {transaction.quantity} units</div>
            </div>
            <div className="bg-[#2C2C2E] rounded-xl p-4">
              <div className="text-[10px] text-[#86868B] mb-2">RISK ASSESSMENT</div>
              <div className={`text-2xl font-light ${RISK_COLORS[transaction.risk_level]}`}>
                {transaction.risk_level}
              </div>
              <div className="text-[#86868B] text-sm">Score: {transaction.risk_score} / 100</div>
            </div>
          </div>

          {/* 匹配的规则 - v5 证据链 */}
          {details?.compliance_evaluation?.matchedRules?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3">🔍 Matched Compliance Rules (Evidence Chain)</h4>
              <div className="space-y-2">
                {details.compliance_evaluation.matchedRules.map((r: any, i: number) => (
                  <div key={i} className="bg-[#2C2C2E] rounded-lg p-3 border-l-4 border-[#FF9F0A]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-white font-mono font-bold">{r.ruleId}</div>
                        <div className="text-xs text-white mt-0.5">{r.ruleName}</div>
                        <div className="text-[11px] text-[#86868B] mt-1">{r.reason}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.decision === 'REJECT' ? 'bg-[#FF453A] text-white' :
                          r.decision === 'REVIEW' ? 'bg-[#FF9F0A] text-white' :
                          'bg-[#30D158] text-white'
                        }`}>
                          {r.decision}
                        </span>
                        <div className="text-[10px] text-[#86868B] mt-1">priority: {r.priority}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 审批操作 - 根据状态显示不同按钮 */}
          {isComplianceReview && (
            <div className="border-t border-[#2D2D2E] pt-6">
              <h4 className="text-sm font-medium text-white mb-3">Compliance Decision</h4>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Reviewer notes / decision rationale (stored in audit hash chain)..."
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0071E3] mb-3 h-20 resize-none"
              />

              {currentState === 'LICENSE_REQUIRED' && (
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Export license number (e.g. BIS-2024-12345)"
                  className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0071E3] mb-3 font-mono"
                />
              )}

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => handleAction('APPROVE')}
                  disabled={actionLoading}
                  className="flex-1 min-w-[140px] bg-[#30D158] hover:bg-[#28BD4F] disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition-all"
                >
                  ✓ APPROVE COMPLIANCE
                </button>
                {currentState === 'LICENSE_REQUIRED' && (
                  <button
                    onClick={() => handleAction('ATTACH_LICENSE')}
                    disabled={actionLoading || !licenseNumber}
                    className="flex-1 min-w-[140px] bg-[#5E5CE6] hover:bg-[#6B6BF0] disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition-all"
                  >
                    📄 ATTACH LICENSE
                  </button>
                )}
                <button
                  onClick={() => handleAction('REJECT')}
                  disabled={actionLoading}
                  className="px-6 bg-[#FF453A] hover:bg-[#E03E34] disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition-all"
                >
                  ✕ REJECT
                </button>
              </div>
            </div>
          )}

          {isPaymentPending && (
            <div className="border-t border-[#2D2D2E] pt-6">
              <h4 className="text-sm font-medium text-white mb-3">Finance / Payment</h4>
              <div className="bg-[#2C2C2E] rounded-xl p-4 mb-4">
                <div className="text-xs text-[#86868B]">Compliance approved. Awaiting payment confirmation.</div>
                <div className="text-lg font-mono text-white mt-2">{transaction.currency} {Number(transaction.total_value).toLocaleString()}</div>
                <div className="text-[10px] text-[#86868B] mt-1">Payment will be held in escrow and automatically recorded in double-entry ledger</div>
              </div>
              <button
                onClick={() => handleAction('CONFIRM_PAYMENT')}
                disabled={actionLoading}
                className="w-full bg-[#64D2FF] hover:bg-[#5AC2E8] disabled:opacity-50 text-black font-bold text-xs py-3 rounded-xl transition-all"
              >
                💰 CONFIRM PAYMENT IN ESCROW (AUTO-LEDGER)
              </button>
            </div>
          )}

          {isFulfillment && (
            <div className="border-t border-[#2D2D2E] pt-6">
              <h4 className="text-sm font-medium text-white mb-3">Warehouse / Fulfillment</h4>
              <div className="flex gap-3">
                {currentState === 'PAYMENT_CONFIRMED' && (
                  <button
                    onClick={() => handleAction('START_FULFILLMENT')}
                    disabled={actionLoading}
                    className="flex-1 bg-[#5E5CE6] hover:bg-[#6B6BF0] disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition-all"
                  >
                    📦 START PICKING & SHIPPING
                  </button>
                )}
                {currentState === 'FULFILLMENT' && (
                  <button
                    onClick={() => handleAction('COMPLETE')}
                    disabled={actionLoading}
                    className="flex-1 bg-[#30D158] hover:bg-[#28BD4F] disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition-all"
                  >
                    ✓ MARK DELIVERED & COMPLETE
                  </button>
                )}
                <button
                  onClick={() => handleAction('CANCEL')}
                  disabled={actionLoading}
                  className="px-6 bg-[#3A3A3C] hover:bg-[#4A4A4C] disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* 审计追踪 */}
          {transaction.approval_chain?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Approval History</h4>
              <div className="space-y-2">
                {transaction.approval_chain.map((log: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-xs bg-[#2C2C2E] rounded-lg p-2">
                    <div className="w-16 text-[#86868B] font-mono text-[10px] flex-shrink-0">
                      {new Date(log.timestamp).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#30D158] mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-white font-medium">{log.action}</span>
                      <span className="text-[#86868B]"> by {log.reviewer}</span>
                      {log.notes && <div className="text-[#86868B] text-[10px] mt-0.5">{log.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
