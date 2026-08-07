'use client'

import { X, Check, Minus, ChevronLeft, GitCompare } from 'lucide-react'
import Link from 'next/link'
import { useCompare } from '@/lib/compare-context'
import { useCurrency } from '@/lib/currency-context'
import { t, translateText, LanguageCode } from '@/i18n'
import type { Product } from '@/lib/data'

interface ComparePageClientProps {
  lang: LanguageCode
}

export default function ComparePageClient({ lang }: ComparePageClientProps) {
  const { compareItems, removeFromCompare, clearCompare } = useCompare()
  const { format } = useCurrency()

  // Collect all unique attribute names across all compared products
  const allAttributeNames = new Set<string>()
  compareItems.forEach(p => {
    if (p.attributes && Array.isArray(p.attributes)) {
      p.attributes.forEach(attr => {
        if (attr.name) allAttributeNames.add(attr.name)
      })
    }
  })
  const attributeNames = Array.from(allAttributeNames)

  // Get attribute value for a product by attribute name
  const getAttributeValue = (product: Product, attrName: string): string => {
    if (!product.attributes || !Array.isArray(product.attributes)) return ''
    const attr = product.attributes.find(a => a.name === attrName)
    if (!attr || !attr.terms || attr.terms.length === 0) return ''
    return attr.terms.map(t => t.name).join(', ')
  }

  if (compareItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <GitCompare className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t(lang, 'compare.title')}</h1>
        <p className="text-gray-500 mb-8">{t(lang, 'compare.empty')}</p>
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t(lang, 'compare.browse')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t(lang, 'compare.title')}</h1>
          <p className="text-gray-500 mt-1">{compareItems.length} {t(lang, 'compare.items')}</p>
        </div>
        <button
          onClick={clearCompare}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          {t(lang, 'compare.clearAll')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 bg-gray-50 border border-gray-200 w-48 sticky left-0 z-10">
                <span className="text-sm font-semibold text-gray-700">{t(lang, 'compare.feature')}</span>
              </th>
              {compareItems.map(product => (
                <th key={product.id} className="p-4 bg-white border border-gray-200 min-w-[220px] align-top">
                  <div className="relative">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-2 -right-2 p-1 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <Link href={`/${lang}/product/${product.slug}`} className="block group">
                      <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                        {product.images?.[0] || product.mainImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images?.[0] || product.mainImage}
                            alt={translateText(product.name, lang)}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <GitCompare className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
                        {translateText(product.name, lang)}
                      </h3>
                    </Link>
                    {product.price && (
                      <div className="text-lg font-bold text-gray-900">
                        {format(product.price)}
                      </div>
                    )}
                    {product.brands?.[0] && (
                      <div className="text-sm text-gray-500 mt-1">
                        {translateText(product.brands[0].name, lang)}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 sticky left-0">
                {t(lang, 'compare.availability')}
              </td>
              {compareItems.map(product => (
                <td key={product.id} className="p-4 border border-gray-200 text-center">
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                      <Check className="w-4 h-4" />
                      {t(lang, 'product.inStock')}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">{t(lang, 'product.outOfStock')}</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 sticky left-0">
                SKU
              </td>
              {compareItems.map(product => (
                <td key={product.id} className="p-4 border border-gray-200 text-sm text-gray-600 text-center font-mono">
                  {product.sku || <Minus className="w-4 h-4 text-gray-300 mx-auto" />}
                </td>
              ))}
            </tr>
            {attributeNames.map(attrName => (
              <tr key={attrName}>
                <td className="p-4 bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 sticky left-0">
                  {translateText(attrName, lang)}
                </td>
                {compareItems.map(product => {
                  const value = getAttributeValue(product, attrName)
                  return (
                    <td key={product.id} className="p-4 border border-gray-200 text-sm text-gray-900 text-center">
                      {value ? (
                        <span>{translateText(value, lang)}</span>
                      ) : (
                        <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
