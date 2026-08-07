'use client'

import Link from 'next/link'
import { X, GitCompare, ArrowRight } from 'lucide-react'
import { useCompare } from '@/lib/compare-context'
import { t, LanguageCode } from '@/i18n'

interface CompareBarProps {
  lang: LanguageCode
}

export default function CompareBar({ lang }: CompareBarProps) {
  const { compareItems, removeFromCompare, clearCompare } = useCompare()

  if (compareItems.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              {compareItems.length} {t(lang, 'compare.items')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {compareItems.map(product => (
              <div key={product.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 whitespace-nowrap">
                <span className="text-sm text-gray-700 max-w-[150px] truncate">{product.name}</span>
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
            >
              {t(lang, 'compare.clear')}
            </button>
            <Link
              href={`/${lang}/compare`}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {t(lang, 'compare.compare')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
