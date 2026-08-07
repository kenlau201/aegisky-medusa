'use client'

import { GitCompare, Check } from 'lucide-react'
import { useCompare } from '@/lib/compare-context'
import type { Product } from '@/lib/data'
import { t, LanguageCode } from '@/i18n'

interface CompareButtonProps {
  product: Product
  lang: LanguageCode
  variant?: 'icon' | 'button'
}

export default function CompareButton({ product, lang, variant = 'icon' }: CompareButtonProps) {
  const { isInCompare, toggleCompare, compareItems } = useCompare()
  const inCompare = isInCompare(product.id)
  const isFull = compareItems.length >= 4 && !inCompare

  if (variant === 'button') {
    return (
      <button
        onClick={() => toggleCompare(product)}
        disabled={isFull}
        className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
          inCompare
            ? 'bg-green-50 text-green-700 border border-green-200'
            : isFull
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
        }`}
      >
        {inCompare ? (
          <>
            <Check className="w-4 h-4" />
            {t(lang, 'compare.added')}
          </>
        ) : (
          <>
            <GitCompare className="w-4 h-4" />
            {t(lang, 'compare.add')}
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={() => toggleCompare(product)}
      disabled={isFull}
      title={inCompare ? t(lang, 'compare.added') : t(lang, 'compare.add')}
      className={`p-2 rounded-lg transition-all ${
        inCompare
          ? 'bg-green-50 text-green-600'
          : isFull
          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
          : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-blue-600 border border-gray-200'
      }`}
    >
      {inCompare ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
    </button>
  )
}
