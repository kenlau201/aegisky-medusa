'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Product } from '@/lib/data'

interface CompareContextType {
  compareItems: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: number) => void
  clearCompare: () => void
  isInCompare: (productId: number) => boolean
  toggleCompare: (product: Product) => void
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

const MAX_COMPARE_ITEMS = 4

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([])

  const addToCompare = useCallback((product: Product) => {
    setCompareItems(prev => {
      if (prev.length >= MAX_COMPARE_ITEMS) return prev
      if (prev.find(p => p.id === product.id)) return prev
      return [...prev, product]
    })
  }, [])

  const removeFromCompare = useCallback((productId: number) => {
    setCompareItems(prev => prev.filter(p => p.id !== productId))
  }, [])

  const clearCompare = useCallback(() => {
    setCompareItems([])
  }, [])

  const isInCompare = useCallback((productId: number) => {
    return compareItems.some(p => p.id === productId)
  }, [compareItems])

  const toggleCompare = useCallback((product: Product) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id)
    } else {
      addToCompare(product)
    }
  }, [isInCompare, addToCompare, removeFromCompare])

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      toggleCompare,
    }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}
