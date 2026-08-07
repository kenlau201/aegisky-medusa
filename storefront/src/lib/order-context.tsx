'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Product } from './data'
import { useCart } from './cart-context'
import { useAuth } from './auth-context'

// ==================== Types ====================

export interface ShippingAddress {
  fullName: string
  company: string
  email: string
  phone: string
  country: string
  state: string
  city: string
  address: string
  address2: string
  zipCode: string
}

export interface OrderItem {
  productId: string
  productName: string
  productSlug: string
  sku: string
  image: string
  price: number
  quantity: number
  supplierId?: string
  supplierName?: string
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded'

export interface ShippingInfo {
  method: string
  carrier: string
  cost: number
  estimatedDays: string
  trackingNumber?: string
}

export interface PaymentInfo {
  method: 'stripe' | 'wire' | 'lc'
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  transactionId?: string
  paidAt?: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency: string
  status: OrderStatus
  shippingAddress: ShippingAddress
  shipping: ShippingInfo
  payment: PaymentInfo
  notes?: string
  createdAt: string
  updatedAt: string
  timeline: Array<{ status: OrderStatus; timestamp: string; note?: string }>
}

interface OrderContextType {
  orders: Order[]
  createOrder: (params: {
    items: OrderItem[]
    shippingAddress: ShippingAddress
    shippingMethod: string
    shippingCost: number
    paymentMethod: 'stripe' | 'wire' | 'lc'
    notes?: string
    currency: string
  }) => Order
  getOrder: (id: string) => Order | undefined
  getUserOrders: () => Order[]
  getAllOrders: () => Order[]
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => void
  updateTrackingNumber: (id: string, trackingNumber: string, carrier: string) => void
  cancelOrder: (id: string) => void
  getOrdersByStatus: (status: OrderStatus) => Order[]
}

const OrderContext = createContext<OrderContextType | null>(null)

// ==================== Status labels ====================

export const orderStatusLabels: Record<OrderStatus, { label: string; color: string; zh: string; ru: string }> = {
  pending: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', zh: '待付款', ru: 'Ожидает оплаты' },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-700', zh: '已付款', ru: 'Оплачен' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', zh: '处理中', ru: 'В обработке' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', zh: '已发货', ru: 'Отправлен' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', zh: '已送达', ru: 'Доставлен' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', zh: '已完成', ru: 'Завершён' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', zh: '已取消', ru: 'Отменён' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', zh: '已退款', ru: 'Возвращён' },
}

// ==================== Storage ====================

const STORAGE_KEY = 'aegisky-orders'

function loadOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

function generateOrderNumber(): string {
  const date = new Date()
  const prefix = 'AGS'
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${dateStr}-${random}`
}

// ==================== Provider ====================

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const { user } = useAuth()
  const { clearCart } = useCart()

  useEffect(() => {
    setOrders(loadOrders())
  }, [])

  const persistOrders = (newOrders: Order[]) => {
    setOrders(newOrders)
    saveOrders(newOrders)
  }

  const createOrder: OrderContextType['createOrder'] = (params) => {
    const subtotal = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = 0 // B2B export typically no tax
    const total = subtotal + params.shippingCost + tax

    const now = new Date().toISOString()
    const order: Order = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      orderNumber: generateOrderNumber(),
      userId: user?.id || 'guest',
      items: params.items,
      subtotal,
      shippingCost: params.shippingCost,
      tax,
      total,
      currency: params.currency,
      status: 'pending',
      shippingAddress: params.shippingAddress,
      shipping: {
        method: params.shippingMethod,
        carrier: params.shippingMethod.split(' ')[0] || 'Standard',
        cost: params.shippingCost,
        estimatedDays: '5-12',
      },
      payment: {
        method: params.paymentMethod,
        status: 'pending',
      },
      notes: params.notes,
      createdAt: now,
      updatedAt: now,
      timeline: [{ status: 'pending', timestamp: now, note: 'Order created' }],
    }

    const newOrders = [order, ...orders]
    persistOrders(newOrders)
    clearCart()
    return order
  }

  const getOrder: OrderContextType['getOrder'] = (id) => {
    return orders.find(o => o.id === id)
  }

  const getUserOrders: OrderContextType['getUserOrders'] = () => {
    if (!user) return []
    return orders.filter(o => o.userId === user.id).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const getAllOrders: OrderContextType['getAllOrders'] = () => {
    return [...orders].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const updateOrderStatus: OrderContextType['updateOrderStatus'] = (id, status, note) => {
    const newOrders = orders.map(o => {
      if (o.id !== id) return o
      const now = new Date().toISOString()
      return {
        ...o,
        status,
        updatedAt: now,
        timeline: [...o.timeline, { status, timestamp: now, note }],
        payment: status === 'paid' ? { ...o.payment, status: 'paid' as const, paidAt: now, transactionId: 'txn_' + Date.now() } : o.payment,
      }
    })
    persistOrders(newOrders)
  }

  const updateTrackingNumber: OrderContextType['updateTrackingNumber'] = (id, trackingNumber, carrier) => {
    const newOrders = orders.map(o => {
      if (o.id !== id) return o
      const now = new Date().toISOString()
      return {
        ...o,
        status: 'shipped' as OrderStatus,
        updatedAt: now,
        shipping: { ...o.shipping, trackingNumber, carrier },
        timeline: [...o.timeline, { status: 'shipped' as OrderStatus, timestamp: now, note: `Shipped via ${carrier}, tracking: ${trackingNumber}` }],
      }
    })
    persistOrders(newOrders)
  }

  const cancelOrder: OrderContextType['cancelOrder'] = (id) => {
    updateOrderStatus(id, 'cancelled', 'Order cancelled by user')
  }

  const getOrdersByStatus: OrderContextType['getOrdersByStatus'] = (status) => {
    return orders.filter(o => o.status === status)
  }

  return (
    <OrderContext.Provider value={{
      orders,
      createOrder,
      getOrder,
      getUserOrders,
      getAllOrders,
      updateOrderStatus,
      updateTrackingNumber,
      cancelOrder,
      getOrdersByStatus,
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrders must be used within OrderProvider')
  return context
}
