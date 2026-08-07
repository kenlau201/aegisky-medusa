'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
const ADMIN_TOKEN_KEY = 'aegisky_admin_token'

export default function AdminRFQPage() {
  const [token, setToken] = useState<string | null>(null)
  const [rfqs, setRfqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRfq, setSelectedRfq] = useState<any>(null)

  useEffect(() => {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (t) {
      setToken(t)
      fetchRFQs(t)
    } else {
      window.location.href = '/en/admin'
    }
  }, [])

  const fetchRFQs = async (t: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/store/rfq`, {
        headers: { 'x-publishable-api-key': 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a' }
      })
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
    try {
      const res = await fetch(`${API_BASE}/store/rfq/${id}`, {
        headers: { 'x-publishable-api-key': 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a' }
      })
      if (res.ok) {
        setSelectedRfq(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
          <Link href="/en/admin" className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
          <h1 className="text-xl font-bold">RFQ Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* RFQ List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b font-semibold">All RFQs ({rfqs.length})</div>
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
                      <div className="font-medium text-sm">{rfq.customer_name || rfq.customer_email}</div>
                      <div className="text-xs text-gray-500">{rfq.company || 'No company'}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(rfq.created_at).toLocaleDateString()}
                      </div>
                      {rfq.items && (
                        <div className="text-xs text-gray-600 mt-1">
                          {rfq.items.length} item(s)
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RFQ Detail */}
          <div className="md:col-span-2">
            {selectedRfq ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="font-semibold text-lg mb-4">RFQ Details</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Customer:</span>
                      <div>{selectedRfq.rfq.customer_name}</div>
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
                  </div>
                  {selectedRfq.rfq.message && (
                    <div className="mt-4">
                      <span className="text-gray-500 text-sm">Message:</span>
                      <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedRfq.rfq.message}</p>
                    </div>
                  )}
                </div>

                {/* Requested Items */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-3">Requested Items</h3>
                  <div className="space-y-2">
                    {selectedRfq.rfq.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm border-b pb-2">
                        <span>{item.name || item.productName || `Item ${i + 1}`}</span>
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote History */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-3">Quote History ({selectedRfq.quotes.length})</h3>
                  {selectedRfq.quotes.length === 0 ? (
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
                            }`}>
                              {quote.status}
                            </span>
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

                {/* Negotiation Log */}
                {selectedRfq.negotiationLog?.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-3">Activity Log</h3>
                    <div className="space-y-2">
                      {selectedRfq.negotiationLog.map((log: any) => (
                        <div key={log.id} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                          <span className="font-medium">{log.actor_name}</span>
                          <span>{log.action.replace(/_/g, ' ')}</span>
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
