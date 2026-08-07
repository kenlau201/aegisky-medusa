'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SupplierPortal() {
  const [supplier, setSupplier] = useState<any>(null)
  const [loginForm, setLoginForm] = useState({ email: '', name: '', company: '' })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginForm.email && loginForm.company) {
      setSupplier(loginForm)
      localStorage.setItem('aegisky_supplier', JSON.stringify(loginForm))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('aegisky_supplier')
    setSupplier(null)
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2">Supplier Portal</h1>
          <p className="text-gray-600 text-sm mb-6">View RFQs and submit quotes</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={loginForm.company}
                onChange={(e) => setLoginForm({ ...loginForm, company: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Your company"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Contact Name</label>
              <input
                type="text"
                required
                value={loginForm.name}
                onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="you@company.com"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Enter Portal
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Supplier Portal</h1>
            <p className="text-sm text-gray-600">{supplier.company} - {supplier.name}</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/en/supplier/rfq" className="text-blue-600 hover:underline">RFQs</Link>
            <Link href="/en/supplier/orders" className="text-blue-600 hover:underline">Orders</Link>
            <button onClick={handleLogout} className="text-red-600 text-sm hover:underline">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/en/supplier/rfq" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-3xl mb-2">📋</div>
            <h2 className="text-lg font-semibold">Open RFQs</h2>
            <p className="text-gray-600 text-sm mt-1">Browse and quote on requests</p>
          </Link>
          <Link href="/en/supplier/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-3xl mb-2">📦</div>
            <h2 className="text-lg font-semibold">My Orders</h2>
            <p className="text-gray-600 text-sm mt-1">View accepted quotes and orders</p>
          </Link>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">📊</div>
            <h2 className="text-lg font-semibold">Performance</h2>
            <p className="text-gray-600 text-sm mt-1">Quote acceptance rate and stats</p>
          </div>
        </div>
      </main>
    </div>
  )
}
