'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function AdminRFQPage() {
  const params = useParams()
  const lang = params.lang as string
  const [rfqs, setRfqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRfq, setSelectedRfq] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchRFQs()
  }, [])

  const fetchRFQs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/rfq')
      if (res.ok) {
        const data = await res.json()
        setRfqs(data.rfqs || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const viewRfqDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/rfq/${id}`)
      if (res.ok) {
        setSelectedRfq(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
    setDetailLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/rfq/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchRFQs()
      if (selectedRfq?.rfq?.id === id) {
        viewRfqDetail(id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      converted: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
          <Link href={`/${lang}/admin/dashboard`} className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
          <h1 className="text-xl font-bold">RFQ Management</h1>
          <span className="text-sm text-gray-500">({rfqs.length} requests)</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* RFQ List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b font-semibold flex justify-between items-center">
                <span>All RFQs</span>
                <button onClick={fetchRFQs} className="text-xs text-blue-600 hover:underline">Refresh</button>
              </div>
              {loading ? (
                <div className="p-4 text-gray-500">Loading...</div>
              ) : rfqs.length === 0 ? (
                <div className="p-4 text-gray-500">No RFQs yet</div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {rfqs.map((rfq) => (
                    <button
                      key={rfq.id}
                      onClick={() => viewRfqDetail(rfq.id)}
                      className={`w-full text-left p-3 hover:bg-gray-50 ${selectedRfq?.rfq?.id === rfq.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm">{rfq.customer_name || rfq.customer_email}</div>
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColor(rfq.status)}`}>{rfq.status}</span>
                      </div>
                      <div className="text-xs text-gray-500">{rfq.company || 'No company'}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(rfq.created_at).toLocaleDateString()}
                      </div>
                      {rfq.quote_count > 0 && (
                        <div className="text-xs text-blue-600 mt-1">{rfq.quote_count} quote(s)</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RFQ Detail */}
          <div className="md:col-span-2">
            {detailLoading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Loading...</div>
            ) : selectedRfq ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="font-semibold text-lg">RFQ Details</h2>
                    <div className="flex gap-2">
                      {selectedRfq.rfq.status === 'pending' && (
                        <button onClick={() => updateStatus(selectedRfq.rfq.id, 'closed')} className="text-xs px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Close</button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Customer:</span>
                      <div className="font-medium">{selectedRfq.rfq.customer_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <div>{selectedRfq.rfq.customer_email}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Company:</span>
                      <div>{selectedRfq.rfq.company || '-'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Country:</span>
                      <div>{selectedRfq.rfq.country || '-'}</div>
                    </div>
                    {selectedRfq.rfq.phone && (
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <div>{selectedRfq.rfq.phone}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <div>{new Date(selectedRfq.rfq.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  {selectedRfq.rfq.message && (
                    <div className="mt-4">
                      <span className="text-gray-500 text-sm">Message:</span>
                      <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedRfq.rfq.message}</p>
                    </div>
                  )}
                </div>

                {/* Requested Items */}
                {selectedRfq.rfq.items && selectedRfq.rfq.items.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-3">Requested Items</h3>
                    <div className="space-y-2">
                      {selectedRfq.rfq.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm border-b pb-2">
                          <span>{item.name || item.productName || `Item ${i + 1}`}</span>
                          <span className="text-gray-600">Qty: {item.quantity || item.qty || 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quote History */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-3">Quote History ({selectedRfq.quotes?.length || 0})</h3>
                  {!selectedRfq.quotes || selectedRfq.quotes.length === 0 ? (
                    <p className="text-gray-500 text-sm">No quotes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedRfq.quotes.map((quote: any) => (
                        <div key={quote.id} className="border rounded p-3 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">v{quote.version} - {quote.supplier_name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              quote.status === 'countered' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>{quote.status}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                            <div>Unit: ${quote.unit_price}</div>
                            <div>Total: ${quote.total_price}</div>
                            <div>Lead: {quote.lead_time_days} days</div>
                          </div>
                          {quote.supplier_message && (
                            <div className="mt-2 text-gray-700">{quote.supplier_message}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Log */}
                {selectedRfq.negotiationLog?.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-3">Activity Log</h3>
                    <div className="space-y-2">
                      {selectedRfq.negotiationLog.map((log: any) => (
                        <div key={log.id} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                          <span className="font-medium">{log.actor_name || 'System'}</span>
                          <span>{(log.action || '').replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Select an RFQ to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
