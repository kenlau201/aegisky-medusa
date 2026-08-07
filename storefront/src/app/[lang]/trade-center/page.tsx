'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
const API = '/api/trade'

async function callApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'X-AEGISKY-TENANT-ID': TENANT_ID,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  return res.json()
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  RFQ_SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  QUOTATION_RECEIVED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  PO_ISSUED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  PO_CONFIRMED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  IN_PRODUCTION: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  QC_PENDING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  QC_PASSED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  QC_FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  READY_TO_SHIP: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  SHIPPED: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  IN_TRANSIT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CUSTOMS_CLEARANCE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMPLETED: 'bg-green-600/20 text-green-500 border-green-600/30',
  CANCELLED: 'bg-gray-600/20 text-gray-500 border-gray-600/30',
  DISPUTED: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft', RFQ_SENT: 'RFQ Sent', QUOTATION_RECEIVED: 'Quoted',
  PO_ISSUED: 'PO Issued', PO_CONFIRMED: 'Confirmed', IN_PRODUCTION: 'Production',
  QC_PENDING: 'QC Pending', QC_PASSED: 'QC Passed', QC_FAILED: 'QC Failed',
  READY_TO_SHIP: 'Ready', SHIPPED: 'Shipped', IN_TRANSIT: 'In Transit',
  CUSTOMS_CLEARANCE: 'Customs', DELIVERED: 'Delivered', COMPLETED: 'Completed',
  CANCELLED: 'Cancelled', DISPUTED: 'Disputed',
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'orders', label: 'Orders', icon: '📋' },
  { id: 'create', label: 'New Order', icon: '➕' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'shipments', label: 'Shipments', icon: '🚚' },
  { id: 'payments', label: 'Payments', icon: '💳' },
]

export default function TradeCenterPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [shipments, setShipments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    try {
      if (activeTab === 'dashboard') {
        setDashboard(await callApi('/dashboard'))
      } else if (activeTab === 'orders') {
        const data = await callApi('/orders')
        setOrders(data.orders || [])
      } else if (activeTab === 'documents') {
        const data = await callApi('/documents')
        setDocuments(data.documents || [])
      } else if (activeTab === 'shipments') {
        const data = await callApi('/shipments')
        setShipments(data.shipments || [])
      } else if (activeTab === 'payments') {
        const data = await callApi('/payments')
        setPayments(data.payments || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function advanceOrder(orderId: string, action: string) {
    await callApi(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    })
    setSelectedOrder(null)
    loadData()
  }

  async function generateDocument(poId: string, docType: string) {
    await callApi('/documents', {
      method: 'POST',
      body: JSON.stringify({ po_id: poId, doc_type: docType }),
    })
    loadData()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🌐</span>
                <h1 className="text-3xl font-bold tracking-tight">Trade Execution Center</h1>
                <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                End-to-end trade execution: RFQ → PO → Production → QC → Shipping → Customs → Delivery → Payment
              </p>
            </div>
            <Link href="/en/control-tower" className="text-sm text-blue-400 hover:text-blue-300">
              ← Compliance Control Tower
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && <div className="text-center py-12 text-gray-500">Loading...</div>}

        {/* Dashboard */}
        {activeTab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Orders" value={dashboard.stats?.total_orders || 0} icon="📋" />
              <StatCard label="In Production" value={dashboard.stats?.in_production || 0} icon="🏭" color="yellow" />
              <StatCard label="In Transit" value={dashboard.stats?.in_transit || 0} icon="🚢" color="blue" />
              <StatCard label="Completed" value={dashboard.stats?.completed || 0} icon="✅" color="green" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="Outstanding Amount"
                value={`$${Number(dashboard.stats?.outstanding_amount || 0).toLocaleString()}`}
                icon="💰"
                color="orange"
              />
              <StatCard
                label="Completed Value"
                value={`$${Number(dashboard.stats?.completed_value || 0).toLocaleString()}`}
                icon="📈"
                color="green"
              />
              <StatCard
                label="Avg Lead Time"
                value={`${Math.round(Number(dashboard.stats?.avg_lead_days || 0))} days`}
                icon="⏱️"
                color="purple"
              />
            </div>

            {/* Action Items */}
            {dashboard.action_items?.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                <h3 className="text-orange-400 font-semibold mb-4 flex items-center gap-2">
                  ⚠️ Action Required
                </h3>
                <div className="space-y-2">
                  {dashboard.action_items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 font-semibold">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="font-semibold">Recent Orders</h3>
              </div>
              <div className="divide-y divide-white/5">
                {dashboard.recent_orders?.map((order: any) => (
                  <div key={order.po_number} className="px-6 py-4 flex items-center justify-between hover:bg-white/5">
                    <div>
                      <div className="font-mono text-sm font-semibold">{order.po_number}</div>
                      <div className="text-xs text-gray-500">{order.buyer_name} → {order.supplier_name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">${Number(order.total_amount).toLocaleString()}</span>
                      <span className={`px-2 py-1 text-xs rounded border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {(!dashboard.recent_orders || dashboard.recent_orders.length === 0) && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No orders yet. Create your first purchase order.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {activeTab === 'orders' && (
          <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-gray-400">PO Number</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-400">Buyer / Supplier</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-400">Status</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-400">Amount</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-400">Payment</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-400">Date</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 font-mono font-semibold">{order.po_number}</td>
                      <td className="px-6 py-4">
                        <div className="text-white">{order.buyer_name}</div>
                        <div className="text-xs text-gray-500">→ {order.supplier_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded border ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        ${Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs ${
                          order.payment_status === 'PAID' ? 'text-green-400' :
                          order.payment_status === 'DEPOSIT_PAID' ? 'text-yellow-400' : 'text-gray-500'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="px-6 py-16 text-center text-gray-500">
                  No orders yet. Click "New Order" to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Order Form */}
        {activeTab === 'create' && <NewOrderForm onCreated={() => { setActiveTab('orders'); loadData(); }} />}

        {/* Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-xl border border-white/10 p-6">
              <h3 className="font-semibold mb-4">Generate Trade Documents</h3>
              <p className="text-sm text-gray-400 mb-4">Select a PO to generate commercial invoice, packing list, or certificate of origin.</p>
              <div className="flex flex-wrap gap-2">
                {orders.slice(0, 5).map((o: any) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <span className="text-sm font-mono">{o.po_number}</span>
                    <button onClick={() => generateDocument(o.id, 'CI')} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">CI</button>
                    <button onClick={() => generateDocument(o.id, 'PL')} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">PL</button>
                    <button onClick={() => generateDocument(o.id, 'CO')} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30">CO</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="font-semibold">Generated Documents</h3>
              </div>
              <div className="divide-y divide-white/5">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm">{doc.doc_number}</div>
                      <div className="text-xs text-gray-500">{doc.doc_type} • {new Date(doc.document_date).toLocaleDateString()}</div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                      {doc.status}
                    </span>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">No documents generated yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Shipments */}
        {activeTab === 'shipments' && (
          <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {shipments.map((s: any) => (
                <div key={s.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-mono font-semibold">{s.shipment_number}</span>
                      <span className="ml-3 text-sm text-gray-400">{s.po_number}</span>
                    </div>
                    <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">{s.status}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                    <div>
                      <div className="text-xs text-gray-500">Tracking</div>
                      <div className="font-mono">{s.tracking_number || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Carrier</div>
                      <div>{s.forwarder_code || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Route</div>
                      <div>{s.origin_port} → {s.destination_port}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">ETA</div>
                      <div>{s.estimated_arrival ? new Date(s.estimated_arrival).toLocaleDateString() : '-'}</div>
                    </div>
                  </div>
                </div>
              ))}
              {shipments.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">No shipments yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {payments.map((p: any) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-semibold">{p.payment_number}</div>
                    <div className="text-xs text-gray-500">{p.po_number} • {p.payment_type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-green-400">
                      +{Number(p.amount).toLocaleString()} {p.currency}
                    </div>
                    <div className="text-xs text-gray-500">{p.payment_method}</div>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">No payments recorded yet.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAdvance={advanceOrder}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color = 'blue' }: { label: string; value: any; icon: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  )
}

function NewOrderForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    buyer_name: '', buyer_country: 'DE',
    supplier_name: 'Shenzhen Aegisky Technology Co., Ltd.', supplier_country: 'CN',
    product_name: '', quantity: 1, unit_price: 0,
    payment_terms: 'T/T 30% Deposit, 70% Before Shipment',
    shipping_method: 'AIR_FREIGHT',
    incoterm: 'FOB',
    origin_port: 'CNSZX', destination_port: 'DEFRA',
    priority: 'NORMAL',
  })
  const [creating, setCreating] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    await callApi('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        line_items: [{
          product_name: form.product_name,
          quantity: form.quantity,
          unit_price: form.unit_price,
        }],
      }),
    })
    setCreating(false)
    onCreated()
  }

  return (
    <form onSubmit={submit} className="max-w-3xl bg-gray-900/50 rounded-xl border border-white/10 p-8 space-y-6">
      <h2 className="text-xl font-bold mb-6">Create New Purchase Order</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Buyer Company *</label>
          <input required value={form.buyer_name} onChange={e => setForm({...form, buyer_name: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Buyer Country</label>
          <input value={form.buyer_country} onChange={e => setForm({...form, buyer_country: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Product *</label>
          <input required value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})}
            placeholder="e.g. DJI Matrice 300 RTK Drone"
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Quantity</label>
            <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Unit Price (USD)</label>
            <input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: parseFloat(e.target.value)})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Payment Terms</label>
          <select value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
            <option>T/T 100% Advance</option>
            <option>T/T 30% Deposit, 70% Before Shipment</option>
            <option>T/T 30% Deposit, 70% Against B/L Copy</option>
            <option>L/C At Sight</option>
            <option>Escrow Service</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Shipping Method</label>
          <select value={form.shipping_method} onChange={e => setForm({...form, shipping_method: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
            <option value="AIR_EXPRESS">Air Express (3-7 days)</option>
            <option value="AIR_FREIGHT">Air Freight (5-10 days)</option>
            <option value="SEA_FCL">Sea FCL (20-40 days)</option>
            <option value="SEA_LCL">Sea LCL (25-45 days)</option>
            <option value="RAIL">Rail (15-25 days)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Incoterm</label>
          <select value={form.incoterm} onChange={e => setForm({...form, incoterm: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
            <option>EXW</option><option>FCA</option><option>FOB</option><option>CFR</option><option>CIF</option><option>CPT</option><option>CIP</option><option>DAP</option><option>DDP</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Origin Port</label>
          <select value={form.origin_port} onChange={e => setForm({...form, origin_port: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
            <option value="CNSZX">Shenzhen (CNSZX)</option>
            <option value="CNSHA">Shanghai (CNSHA)</option>
            <option value="HKHKG">Hong Kong (HKHKG)</option>
            <option value="CNPVG">Shanghai Pudong (CNPVG)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Destination Port</label>
          <select value={form.destination_port} onChange={e => setForm({...form, destination_port: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 outline-none">
            <option value="DEFRA">Frankfurt (DEFRA)</option>
            <option value="NLRTM">Rotterdam (NLRTM)</option>
            <option value="DEHAM">Hamburg (DEHAM)</option>
            <option value="AEJEA">Jebel Ali (AEJEA)</option>
            <option value="USLAX">Los Angeles (USLAX)</option>
            <option value="SGSIN">Singapore (SGSIN)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-400">Order Total:</div>
          <div className="text-2xl font-bold">${(form.quantity * form.unit_price).toLocaleString()}</div>
        </div>
        <button type="submit" disabled={creating}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors">
          {creating ? 'Creating...' : 'Create Purchase Order'}
        </button>
      </div>
    </form>
  )
}

function OrderDetailModal({ order, onClose, onAdvance }: { order: any; onClose: () => void; onAdvance: (id: string, action: string) => void }) {
  const [orderDetail, setOrderDetail] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/trade/orders/${order.id}`, { headers: { 'X-AEGISKY-TENANT-ID': TENANT_ID } })
      .then(r => r.json())
      .then(data => setOrderDetail(data))
  }, [order.id])

  if (!orderDetail) return null

  const nextActions = orderDetail.next_actions || []

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-xl font-bold">{order.po_number}</div>
              <div className="text-sm text-gray-400">{order.buyer_name} → {order.supplier_name}</div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
            <span className="text-2xl font-bold">${Number(order.total_amount).toLocaleString()} {order.currency}</span>
          </div>

          {/* Progress Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">ORDER PROGRESS</h3>
            <div className="flex items-center gap-1">
              {['PO_ISSUED', 'PO_CONFIRMED', 'IN_PRODUCTION', 'QC_PASSED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map((s, i) => {
                const reached = ['DRAFT', 'RFQ_SENT', 'QUOTATION_RECEIVED', 'PO_ISSUED', 'PO_CONFIRMED', 'IN_PRODUCTION', 'QC_PENDING', 'QC_PASSED', 'READY_TO_SHIP', 'SHIPPED', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'DELIVERED', 'COMPLETED'].indexOf(order.status) >= ['PO_ISSUED', 'PO_CONFIRMED', 'IN_PRODUCTION', 'QC_PASSED', 'SHIPPED', 'DELIVERED', 'COMPLETED'].indexOf(s)
                return (
                  <div key={s} className="flex-1">
                    <div className={`h-1 rounded ${reached ? 'bg-blue-500' : 'bg-white/10'}`} />
                    <div className={`text-xs mt-1 text-center ${reached ? 'text-blue-400' : 'text-gray-600'}`}>
                      {s.replace('_', ' ')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">LINE ITEMS</h3>
            <div className="bg-black/30 rounded-lg overflow-hidden">
              {orderDetail.order?.line_items?.map((item: any) => (
                <div key={item.id} className="px-4 py-3 border-b border-white/5 last:border-0 flex justify-between">
                  <div>
                    <div className="text-sm">{item.product_name}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity} × ${item.unit_price}</div>
                  </div>
                  <div className="font-mono text-sm">${Number(item.line_total).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs">Shipping</div>
              <div>{order.shipping_method} • {order.incoterm}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Route</div>
              <div>{order.origin_port} → {order.destination_port}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Payment Terms</div>
              <div>{order.payment_terms}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Payment Status</div>
              <div className={order.payment_status === 'PAID' ? 'text-green-400' : 'text-yellow-400'}>
                {order.payment_status}
              </div>
            </div>
          </div>

          {/* Actions */}
          {nextActions.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">ADVANCE ORDER</h3>
              <div className="flex flex-wrap gap-2">
                {nextActions.map((action: string) => (
                  <button
                    key={action}
                    onClick={() => onAdvance(order.id, action)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      action === 'CANCELLED' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                      action === 'QC_FAILED' ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' :
                      'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                  >
                    → {STATUS_LABELS[action] || action}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
