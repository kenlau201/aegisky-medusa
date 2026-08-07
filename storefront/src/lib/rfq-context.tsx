'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type RFQStatus = 'pending' | 'quoted' | 'negotiating' | 'closed' | 'won'

export interface RFQItem {
  productId?: string
  productName: string
  sku?: string
  quantity: number
  specifications?: string
}

export interface RFQ {
  id: string
  userId?: string
  name: string
  company: string
  email: string
  phone: string
  items: RFQItem[]
  targetPrice?: number
  currency: string
  deliveryDate?: string
  incoterms?: string
  destinationCountry?: string
  message?: string
  status: RFQStatus
  quotes: Quote[]
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  supplierId: string
  supplierName: string
  price: number
  currency: string
  leadTime: string
  moq: number
  notes?: string
  createdAt: string
}

export interface RFQCartItem {
  id: number
  slug: string
  name: string
  price: number
  image: string
  brand?: string
  sku?: string
  quantity: number
}

interface RFQContextType {
  rfqs: RFQ[]
  rfqItems: RFQCartItem[]
  addItem: (item: RFQCartItem) => void
  removeItem: (productId: number) => void
  clearItems: () => void
  createRFQ: (data: Omit<RFQ, 'id' | 'status' | 'quotes' | 'createdAt' | 'updatedAt'>) => RFQ
  getRFQ: (id: string) => RFQ | undefined
  getUserRFQs: (userId?: string) => RFQ[]
  updateRFQStatus: (id: string, status: RFQStatus) => void
  addQuote: (rfqId: string, quote: Omit<Quote, 'id' | 'createdAt'>) => void
}

const RFQContext = createContext<RFQContextType | undefined>(undefined)

const RFQ_STORAGE_KEY = 'aegisky-rfqs'
const RFQ_CART_KEY = 'aegisky-rfq-cart'

function loadRFQs(): RFQ[] {
  try {
    return JSON.parse(localStorage.getItem(RFQ_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRFQs(rfqs: RFQ[]) {
  localStorage.setItem(RFQ_STORAGE_KEY, JSON.stringify(rfqs))
}

function loadRFQCart(): RFQCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(RFQ_CART_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRFQCart(items: RFQCartItem[]) {
  localStorage.setItem(RFQ_CART_KEY, JSON.stringify(items))
}

export function RFQProvider({ children }: { children: ReactNode }) {
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [rfqItems, setRfqItems] = useState<RFQCartItem[]>([])

  useEffect(() => {
    setRfqs(loadRFQs())
    setRfqItems(loadRFQCart())
  }, [])

  const addItem = (item: RFQCartItem) => {
    setRfqItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      let updated: RFQCartItem[]
      if (existing) {
        updated = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      } else {
        updated = [...prev, item]
      }
      saveRFQCart(updated)
      return updated
    })
  }

  const removeItem = (productId: number) => {
    setRfqItems(prev => {
      const updated = prev.filter(i => i.id !== productId)
      saveRFQCart(updated)
      return updated
    })
  }

  const clearItems = () => {
    setRfqItems([])
    saveRFQCart([])
  }

  const createRFQ = async (data: Omit<RFQ, 'id' | 'status' | 'quotes' | 'createdAt' | 'updatedAt'>): Promise<RFQ> => {
    const now = new Date().toISOString()
    const newRFQ: RFQ = {
      ...data,
      id: 'rfq_' + Date.now().toString(36),
      status: 'pending',
      quotes: [],
      createdAt: now,
      updatedAt: now,
    }

    // Submit to backend API
    try {
      await fetch('/api/rfq/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: data.email,
          customerName: data.name,
          company: data.company,
          country: data.destinationCountry,
          phone: data.phone,
          message: data.message,
          items: data.items.map(item => ({
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            specifications: item.specifications,
          })),
        }),
      })
    } catch (error) {
      console.error('Failed to submit RFQ to backend:', error)
      // Continue anyway - RFQ is saved locally
    }

    const updated = [newRFQ, ...rfqs]
    setRfqs(updated)
    saveRFQs(updated)
    return newRFQ
  }

  const getRFQ = (id: string) => rfqs.find(r => r.id === id)

  const getUserRFQs = (userId?: string) => {
    if (!userId) return rfqs
    return rfqs.filter(r => r.userId === userId)
  }

  const updateRFQStatus = (id: string, status: RFQStatus) => {
    const updated = rfqs.map(r =>
      r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
    )
    setRfqs(updated)
    saveRFQs(updated)
  }

  const addQuote = (rfqId: string, quote: Omit<Quote, 'id' | 'createdAt'>) => {
    const newQuote: Quote = {
      ...quote,
      id: 'quote_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    }
    const updated = rfqs.map(r =>
      r.id === rfqId
        ? { ...r, quotes: [...r.quotes, newQuote], status: 'quoted' as RFQStatus, updatedAt: new Date().toISOString() }
        : r
    )
    setRfqs(updated)
    saveRFQs(updated)
  }

  return (
    <RFQContext.Provider value={{ rfqs, rfqItems, addItem, removeItem, clearItems, createRFQ, getRFQ, getUserRFQs, updateRFQStatus, addQuote }}>
      {children}
    </RFQContext.Provider>
  )
}

export function useRFQ() {
  const context = useContext(RFQContext)
  if (!context) {
    throw new Error('useRFQ must be used within RFQProvider')
  }
  return context
}

export const statusLabels: Record<RFQStatus, { en: string; ru: string; zh: string; color: string }> = {
  pending: { en: 'Pending', ru: 'Ожидает', zh: '待报价', color: 'bg-yellow-100 text-yellow-700' },
  quoted: { en: 'Quoted', ru: 'Предложено', zh: '已报价', color: 'bg-blue-100 text-blue-700' },
  negotiating: { en: 'Negotiating', ru: 'Переговоры', zh: '议价中', color: 'bg-purple-100 text-purple-700' },
  won: { en: 'Won', ru: 'Выиграно', zh: '已成交', color: 'bg-green-100 text-green-700' },
  closed: { en: 'Closed', ru: 'Закрыто', zh: '已关闭', color: 'bg-gray-100 text-gray-700' },
}
