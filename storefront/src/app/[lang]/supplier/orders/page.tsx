'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a'

export default function SupplierOrdersPage() {
  const [supplier, setSupplier] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = localStorage.getItem('aegisky_supplier')
    if (s) {
      setSupplier(JSON.parse(s))
      fetchOrders()
    } else {
      window.location.href = '/en/supplier'
    }
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // In production, this would filter by supplier ID
      // For now, show all orders as a demo
      const res = await fetch(`${API_BASE}/store/orders?email=demo@supplier.com`, {
        headers: { 'x-publishable-api-key': PUBLISHABLE_KEY }
      })
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
          <Link href="/en/supplier" className="text-blue-600 hover:underline text-sm">← Portal</Link>
          <h1 className="text-xl font-bold">My Orders</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-600">No orders yet. Submit quotes on RFQs to get started.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm">{order.customer_email}</td>
                    <td className="px-4 py-3 text-sm">{order.items?.length || 0} items</td>
                    <td className="px-4 py-3 text-sm font-medium">${order.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
