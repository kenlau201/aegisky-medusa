'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
const ADMIN_TOKEN_KEY = 'aegisky_admin_token'

interface DashboardData {
  orders: {
    total_orders: string
    pending_payment: string
    paid: string
    processing: string
    shipped: string
    completed: string
    cancelled: string
    compensation_pending: string
    revenue: string
    avg_order_value: string
  }
  products: { total_products: string; in_stock: string; out_of_stock: string }
  rfqs: { total_rfqs: string; new_rfqs: string; quoted: string; converted: string }
  categories: { total_categories: string }
  brands: { total_brands: string }
  recentOrders: any[]
  pendingCompensations: any[]
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (saved) {
      setToken(saved)
      fetchDashboard(saved)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/store/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const result = await res.json()
      if (res.ok && result.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, result.token)
        setToken(result.token)
        fetchDashboard(result.token)
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection error')
    }
    setLoading(false)
  }

  const fetchDashboard = async (t: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/store/admin`, {
        headers: { 'Authorization': `Bearer ${t}` }
      })
      if (res.ok) {
        setData(await res.json())
      } else if (res.status === 401) {
        handleLogout()
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken(null)
    setData(null)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Aegisky Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3"
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
              autoComplete="current-password"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  const o = data?.orders
  const fmt = (n: string | number) => Number(n).toLocaleString()
  const money = (n: string | number) => `$${Number(n).toFixed(2)}`

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Aegisky Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <Link href="/en/admin/orders" className="text-blue-600 hover:underline">Orders</Link>
            <Link href="/en/admin/rfq" className="text-blue-600 hover:underline">RFQs</Link>
            <Link href="/en/admin/compensations" className="text-blue-600 hover:underline">Compensations</Link>
            <button onClick={handleLogout} className="text-red-600 hover:underline text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Compensation Alert */}
        {data?.pendingCompensations && data.pendingCompensations.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">⚠️ Pending Compensations ({data.pendingCompensations.length})</h3>
            {data.pendingCompensations.map((c, i) => (
              <div key={i} className="text-sm text-red-700 mt-2">
                Order <Link href={`/en/admin/orders/${c.order_id}`} className="underline font-mono">{c.order_number}</Link>
                {' - '}{c.description}
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Orders" value={fmt(o?.total_orders || 0)} color="blue" />
          <StatCard label="Revenue" value={money(o?.revenue || 0)} color="green" />
          <StatCard label="Pending Payment" value={fmt(o?.pending_payment || 0)} color="yellow" />
          <StatCard label="Processing" value={fmt(o?.processing || 0)} color="purple" />
          <StatCard label="Products" value={fmt(data?.products?.total_products || 0)} color="gray" />
          <StatCard label="Categories" value={fmt(data?.categories?.total_categories || 0)} color="gray" />
          <StatCard label="Brands" value={fmt(data?.brands?.total_brands || 0)} color="gray" />
          <StatCard label="RFQs" value={fmt(data?.rfqs?.total_rfqs || 0)} color="indigo" />
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusBadge label="Paid" count={o?.paid || 0} bg="bg-green-100" text="text-green-800" />
            <StatusBadge label="Shipped" count={o?.shipped || 0} bg="bg-blue-100" text="text-blue-800" />
            <StatusBadge label="Completed" count={o?.completed || 0} bg="bg-gray-100" text="text-gray-800" />
            <StatusBadge label="Cancelled" count={o?.cancelled || 0} bg="bg-red-100" text="text-red-800" />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/en/admin/orders/${order.id}`} className="text-blue-600 font-mono text-sm">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>{order.customer_name}</div>
                    <div className="text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {money(order.total)} {order.currency?.toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    gray: 'bg-gray-50 border-gray-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  }
  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}

function StatusBadge({ label, count, bg, text }: { label: string; count: string | number; bg: string; text: string }) {
  return (
    <div className={`${bg} ${text} rounded-lg p-3 text-center`}>
      <div className="text-2xl font-bold">{Number(count)}</div>
      <div className="text-sm">{label}</div>
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
    compensation_pending: 'bg-red-200 text-red-900',
  }
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
