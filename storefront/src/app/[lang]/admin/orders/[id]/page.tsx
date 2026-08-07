'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
const ADMIN_TOKEN_KEY = 'aegisky_admin_token'

const ALL_STATUSES = [
  'draft', 'pending_payment', 'paid', 'processing',
  'shipped', 'delivered', 'completed', 'cancelled',
  'refunded', 'compensation_pending'
]

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string

  const [token, setToken] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [newTotal, setNewTotal] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [compensationNote, setCompensationNote] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (t) {
      setToken(t)
      fetchOrder(t)
    } else {
      window.location.href = '/en/admin'
    }
  }, [orderId])

  const fetchOrder = async (t: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/store/admin/orders/${orderId}`, {
        headers: { 'x-admin-token': t }
      })
      if (res.ok) {
        const d = await res.json()
        setData(d)
        setNewStatus(d.order.status)
        setNewTotal(String(d.order.total))
        setAdminNotes(d.order.admin_notes || '')
        setTrackingNumber(d.order.tracking_number || '')
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveChanges = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/store/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token || ''
        },
        body: JSON.stringify({
          status: newStatus !== data.order.status ? newStatus : undefined,
          total: newTotal !== String(data.order.total) ? Number(newTotal) : undefined,
          adminNotes,
          trackingNumber,
        })
      })
      if (res.ok) {
        setMessage('✓ Order updated successfully')
        fetchOrder(token!)
      } else {
        const err = await res.json()
        setMessage(`✗ Error: ${err.error}`)
      }
    } catch (e) {
      setMessage('✗ Network error')
    }
    setSaving(false)
  }

  const resolveCompensation = async () => {
    if (!compensationNote) {
      setMessage('Please enter resolution notes')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/store/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token || ''
        },
        body: JSON.stringify({
          status: 'processing',
          compensationResolution: compensationNote,
        })
      })
      if (res.ok) {
        setMessage('✓ Compensation resolved, order moved to processing')
        setCompensationNote('')
        fetchOrder(token!)
      }
    } catch (e) {
      setMessage('✗ Error')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>
  }

  if (!data) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Order not found</div>
  }

  const { order, items, payments, compensationLogs } = data
  const money = (n: number) => `$${Number(n).toFixed(2)}`

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/en/admin/orders" className="text-blue-600 hover:underline text-sm">← Back to Orders</Link>
          <h1 className="text-xl font-bold">Order {order.order_number}</h1>
          <StatusPill status={order.status} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {message && (
          <div className={`mb-4 p-3 rounded ${message.startsWith('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Compensation Alert */}
        {order.status === 'compensation_pending' && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-bold text-lg">🚨 COMPENSATION REQUIRED</h3>
            <p className="text-red-700 text-sm mt-1">{order.compensation_reason}</p>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Resolution notes..."
                value={compensationNote}
                onChange={(e) => setCompensationNote(e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <button
                onClick={resolveCompensation}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Resolve & Continue Processing
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-4">Customer Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Name</div>
                  <div>{order.customer_name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Email</div>
                  <div>{order.customer_email}</div>
                </div>
                <div>
                  <div className="text-gray-500">Company</div>
                  <div>{order.customer_company || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Phone</div>
                  <div>{order.customer_phone || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Country</div>
                  <div>{order.customer_country || '-'}</div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold">Order Items</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">SKU</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-500">Unit</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">{item.product_name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">{item.sku}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right">{money(item.unit_price)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{money(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-medium">Subtotal</td>
                    <td className="px-4 py-3 text-right font-bold">{money(order.subtotal)} {order.currency?.toUpperCase()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold mb-4">Payment History</h2>
                {payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
                    <div>
                      <span className="font-medium">{p.provider}</span>
                      <span className="ml-2 text-gray-500">{p.status}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{money(p.amount)} {p.currency?.toUpperCase()}</div>
                      {p.stripe_receipt_url && (
                        <a href={p.stripe_receipt_url} target="_blank" className="text-blue-600 text-xs hover:underline">
                          View Receipt
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compensation Logs */}
            {compensationLogs.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold mb-4">Compensation Log</h2>
                {compensationLogs.map((log: any) => (
                  <div key={log.id} className="py-2 border-b last:border-0 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{log.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                      }`}>{log.severity}</span>
                    </div>
                    <div className="text-gray-600 mt-1">{log.description}</div>
                    {log.resolution && (
                      <div className="text-green-700 mt-1 text-xs">Resolution: {log.resolution}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Admin Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold mb-4">Admin Actions</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTotal}
                    onChange={(e) => setNewTotal(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>

                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Order Meta */}
            <div className="bg-white rounded-lg shadow p-6 text-sm">
              <h2 className="font-semibold mb-4">Order Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-xs">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                {order.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid</span>
                    <span>{new Date(order.paid_at).toLocaleString()}</span>
                  </div>
                )}
                {order.shipped_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipped</span>
                    <span>{new Date(order.shipped_at).toLocaleString()}</span>
                  </div>
                )}
                {order.rfq_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">RFQ</span>
                    <Link href={`/en/admin/rfq?id=${order.rfq_id}`} className="text-blue-600 hover:underline">
                      View RFQ
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_payment: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-200 text-gray-900',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
    compensation_pending: 'bg-red-200 text-red-900 animate-pulse',
  }
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
