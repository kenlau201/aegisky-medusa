'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function AdminCompensationsPage() {
  const params = useParams()
  const lang = params.lang as string
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompensations()
  }, [])

  const fetchCompensations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders?status=compensation_pending')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-6">
          <Link href={`/${lang}/admin/dashboard`} className="text-blue-600 hover:underline text-sm">← Dashboard</Link>
          <h1 className="text-xl font-bold">Compensation Queue</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Important:</strong> These orders have been paid but encountered issues (stock failure, disputes, etc.).
            They are <strong>not automatically refunded</strong> to avoid Stripe fee loss.
            Please review each case manually and decide the appropriate action.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-600">No pending compensations. All orders are healthy.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/${lang}/admin/orders/${order.id}`}
                      className="text-lg font-semibold text-blue-600 hover:underline font-mono"
                    >
                      {order.order_number}
                    </Link>
                    <div className="text-sm text-gray-600 mt-1">
                      {order.customer_name} - {order.customer_email}
                    </div>
                    {order.customer_company && (
                      <div className="text-sm text-gray-500">{order.customer_company}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">${Number(order.total).toFixed(2)} {order.currency?.toUpperCase()}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {order.compensation_reason && (
                  <div className="mt-3 text-sm bg-red-50 p-3 rounded text-red-700">
                    Reason: {order.compensation_reason}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/${lang}/admin/orders/${order.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Review & Resolve
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
