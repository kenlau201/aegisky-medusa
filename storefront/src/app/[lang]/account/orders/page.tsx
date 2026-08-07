'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useCurrency } from '@/lib/currency-context'
import { t, LanguageCode } from '@/i18n'

interface Order {
  id: string
  order_number: string
  total: number
  currency: string
  status: string
  payment_status: string
  fulfillment_status: string
  created_at: string
  items: Array<{ product_name: string; quantity: number; unit_price: number }>
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending_payment: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  compensation_pending: { label: 'Review Required', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
}

export default function OrdersPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const { user } = useAuth()
  const { format } = useCurrency()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        setOrders(data.orders || [])
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load orders')
        setLoading(false)
      })
  }, [user])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="mx-auto text-gray-300 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your orders</h1>
        <p className="text-gray-500 mb-6">Please log in to see your order history</p>
        <Link href={`/${lang}/auth/login`} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
          Sign In
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-600" size={48} />
        <p className="mt-4 text-gray-500">Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="mx-auto text-gray-300 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h1>
        <p className="text-gray-500 mb-6">Start browsing our catalog to place your first order</p>
        <Link href={`/${lang}`} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => {
          const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment
          const StatusIcon = statusConfig.icon
          const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0

          return (
            <Link
              key={order.id}
              href={`/${lang}/account/orders/${order.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono font-bold text-blue-600">{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <StatusIcon size={14} />
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                  {order.items?.[0] && (
                    <span className="text-gray-400"> · {order.items[0].product_name.substring(0, 50)}{order.items[0].product_name.length > 50 ? '...' : ''}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{format(order.total)}</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
