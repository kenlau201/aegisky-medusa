'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function SupplierRFQPage() {
  const params = useParams()
  const lang = params.lang as string
  const [rfqs, setRfqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRfq, setSelectedRfq] = useState<any>(null)
  const [supplierName, setSupplierName] = useState('')
  const [supplierEmail, setSupplierEmail] = useState('')
  const [quoteForm, setQuoteForm] = useState({
    unitPrice: '', totalPrice: '', quantity: '', moq: '',
    leadTimeDays: '', shippingCost: '', paymentTerms: 'Net-30',
    incoterms: 'FOB', validUntil: '', message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('aegisky_supplier')
    if (saved) {
      try {
        const s = JSON.parse(saved)
        setSupplierName(s.name || '')
        setSupplierEmail(s.email || '')
      } catch {}
    }
    fetchRFQs()
  }, [])

  const fetchRFQs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rfq')
      if (res.ok) {
        const data = await res.json()
        setRfqs(data.rfqs || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const viewRfq = async (id: string) => {
    try {
      const res = await fetch(`/api/rfq/${id}`)
      if (res.ok) {
        setSelectedRfq(await res.json())
        setMessage('')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const submitQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRfq) return

    if (!supplierName || !supplierEmail) {
      setMessage('Please enter your supplier name and email')
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const res = await fetch('/api/rfq/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: selectedRfq.rfq.id,
          supplierName,
          supplierEmail,
          unitPrice: Number(quoteForm.unitPrice),
          totalPrice: Number(quoteForm.totalPrice) || Number(quoteForm.unitPrice) * Number(quoteForm.quantity || 1),
          quantity: Number(quoteForm.quantity) || selectedRfq.rfq.items?.[0]?.quantity,
          moq: Number(quoteForm.moq) || 1,
          leadTimeDays: Number(quoteForm.leadTimeDays),
          shippingCost: Number(quoteForm.shippingCost) || 0,
          paymentTerms: quoteForm.paymentTerms,
          incoterms: quoteForm.incoterms,
          validUntil: quoteForm.validUntil,
          supplierMessage: quoteForm.message
        })
      })

      if (res.ok) {
        setMessage('Quote submitted successfully!')
        setQuoteForm({
          unitPrice: '', totalPrice: '', quantity: '', moq: '',
          leadTimeDays: '', shippingCost: '', paymentTerms: 'Net-30',
          incoterms: 'FOB', validUntil: '', message: ''
        })
        viewRfq(selectedRfq.rfq.id)
        fetchRFQs()
      } else {
        setMessage('Failed to submit quote')
      }
    } catch (e) {
      setMessage('Network error')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-6">
          <Link href={`/${lang}/supplier`} className="text-blue-600 hover:underline text-sm">← Portal</Link>
          <h1 className="text-xl font-bold">Open RFQs</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* RFQ List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b font-semibold flex justify-between">
                <span>Available RFQs ({rfqs.length})</span>
                <button onClick={fetchRFQs} className="text-xs text-blue-600">Refresh</button>
              </div>
              {loading ? (
                <div className="p-4 text-gray-500">Loading...</div>
              ) : rfqs.length === 0 ? (
                <div className="p-4 text-gray-500">No open RFQs</div>
              ) : (
                <div className="divide-y max-h-[700px] overflow-y-auto">
                  {rfqs.map((rfq) => (
                    <button
                      key={rfq.id}
                      onClick={() => viewRfq(rfq.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 ${selectedRfq?.rfq?.id === rfq.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="font-medium text-sm">{rfq.customer_name || rfq.customer_email}</div>
                      <div className="text-xs text-gray-500">{rfq.company || 'Unknown company'}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {rfq.country || 'N/A'} • {new Date(rfq.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {rfq.items?.length || 0} item(s)
                        {rfq.quote_count > 0 && <span className="text-blue-600 ml-2">• {rfq.quote_count} quote(s)</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RFQ Detail & Quote Form */}
          <div className="md:col-span-2">
            {selectedRfq ? (
              <div className="space-y-4">
                {message && (
                  <div className={`p-3 rounded text-sm ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message}
                  </div>
                )}

                {/* Supplier Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-3">Your Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text" placeholder="Your Company Name"
                      value={supplierName} onChange={(e) => setSupplierName(e.target.value)}
                      className="px-3 py-2 border rounded text-sm"
                    />
                    <input
                      type="email" placeholder="Your Email"
                      value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)}
                      className="px-3 py-2 border rounded text-sm"
                    />
                  </div>
                </div>

                {/* RFQ Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="font-semibold text-lg mb-4">RFQ Details</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><span className="text-gray-500">Buyer:</span> {selectedRfq.rfq.customer_name}</div>
                    <div><span className="text-gray-500">Company:</span> {selectedRfq.rfq.company || '-'}</div>
                    <div><span className="text-gray-500">Email:</span> {selectedRfq.rfq.customer_email}</div>
                    <div><span className="text-gray-500">Country:</span> {selectedRfq.rfq.country || '-'}</div>
                  </div>
                  {selectedRfq.rfq.message && (
                    <div className="bg-gray-50 p-3 rounded text-sm mb-4">{selectedRfq.rfq.message}</div>
                  )}
                  {selectedRfq.rfq.items?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Requested Items:</h3>
                      {selectedRfq.rfq.items.map((item: any, i: number) => (
                        <div key={i} className="text-sm py-1 border-b">
                          {item.name || item.productName || `Item ${i + 1}`} - Qty: {item.quantity || item.qty || 1}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Existing Quotes */}
                {selectedRfq.quotes?.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-3">Quote History ({selectedRfq.quotes.length})</h3>
                    <div className="space-y-2">
                      {selectedRfq.quotes.map((q: any) => (
                        <div key={q.id} className="border rounded p-3 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">v{q.version} - {q.supplier_name}</span>
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{q.status}</span>
                          </div>
                          <div className="text-gray-600 mt-1">
                            ${q.unit_price}/unit • Total: ${q.total_price} • Lead: {q.lead_time_days}d
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Quote Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-4">Submit Your Quote</h3>
                  <form onSubmit={submitQuote} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Unit Price (USD) *</label>
                        <input type="number" step="0.01" required value={quoteForm.unitPrice}
                          onChange={(e) => setQuoteForm({...quoteForm, unitPrice: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Total Price (USD)</label>
                        <input type="number" step="0.01" value={quoteForm.totalPrice}
                          onChange={(e) => setQuoteForm({...quoteForm, totalPrice: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Quantity Available</label>
                        <input type="number" value={quoteForm.quantity}
                          onChange={(e) => setQuoteForm({...quoteForm, quantity: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">MOQ</label>
                        <input type="number" value={quoteForm.moq}
                          onChange={(e) => setQuoteForm({...quoteForm, moq: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Lead Time (days) *</label>
                        <input type="number" required value={quoteForm.leadTimeDays}
                          onChange={(e) => setQuoteForm({...quoteForm, leadTimeDays: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Shipping Cost</label>
                        <input type="number" step="0.01" value={quoteForm.shippingCost}
                          onChange={(e) => setQuoteForm({...quoteForm, shippingCost: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Payment Terms</label>
                        <select value={quoteForm.paymentTerms}
                          onChange={(e) => setQuoteForm({...quoteForm, paymentTerms: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm">
                          <option>Prepayment</option><option>Net-15</option><option>Net-30</option>
                          <option>Net-60</option><option>LC at sight</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Incoterms</label>
                        <select value={quoteForm.incoterms}
                          onChange={(e) => setQuoteForm({...quoteForm, incoterms: e.target.value})}
                          className="w-full px-3 py-2 border rounded text-sm">
                          <option>EXW</option><option>FOB</option><option>CIF</option>
                          <option>DAP</option><option>DDP</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Quote Valid Until</label>
                      <input type="date" value={quoteForm.validUntil}
                        onChange={(e) => setQuoteForm({...quoteForm, validUntil: e.target.value})}
                        className="w-full px-3 py-2 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Message to Buyer</label>
                      <textarea value={quoteForm.message}
                        onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                        rows={3} className="w-full px-3 py-2 border rounded text-sm"
                        placeholder="Additional notes, specifications, etc." />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                      {submitting ? 'Submitting...' : 'Submit Quote'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Select an RFQ to view details and submit a quote
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
