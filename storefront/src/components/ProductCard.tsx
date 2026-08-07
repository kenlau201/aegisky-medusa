'use client'

import Link from 'next/link'
import type { Product } from '@/lib/data'
import { t, translateText, LanguageCode } from '@/i18n'
import { useCurrency } from '@/lib/currency-context'
import CompareButton from './CompareButton'
import BrandLogo from './BrandLogo'

export default function ProductCard({ product, lang = 'en' }: { product: Product; lang?: LanguageCode }) {
  const price = product.price || 0
  const regularPrice = product.regularPrice || 0
  const imageUrl = product.mainImage || product.images?.[0]
  const brandName = product.brands?.[0]?.name || ''
  const { format } = useCurrency()
  const translatedName = translateText(product.name, lang)

  const hasDiscount = product.onSale && product.salePrice && product.regularPrice && product.salePrice < product.regularPrice

  return (
    <div className="relative group">
      <Link
        href={`/${lang}/product/${product.slug}`}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all flex flex-col block"
      >
        {/* Image */}
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={translatedName}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-1H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
              {lang === 'ru' ? 'Скидка' : lang === 'zh' ? '促销' : 'Sale'}
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm font-medium">
                {t(lang, 'product.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          {brandName && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <BrandLogo
                slug={product.brands?.[0]?.slug || ''}
                name={brandName}
                size="xs"
                rounded="sm"
              />
              <span className="text-xs text-gray-500 font-medium truncate">
                {brandName}
              </span>
            </div>
          )}
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px] group-hover:text-blue-600 text-sm">
            {translatedName}
          </h3>
          {product.sku && (
            <div className="text-xs text-gray-500 mb-1">
              SKU: {product.sku}
            </div>
          )}
          {parseFloat(product.rating) > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex text-yellow-400 text-xs">
                {'★'.repeat(Math.round(parseFloat(product.rating)))}
                {'☆'.repeat(5 - Math.round(parseFloat(product.rating)))}
              </div>
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            </div>
          )}
          <div className="mt-auto">
            {price > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-blue-600">
                  {format(price)}
                </span>
                {hasDiscount && regularPrice > price && (
                  <span className="text-sm text-gray-400 line-through">
                    {format(regularPrice)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-500 font-medium">
                {t(lang, 'product.onRequest')}
              </span>
            )}
          </div>
        </div>
      </Link>
      {/* Compare button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <CompareButton product={product} lang={lang} />
      </div>
    </div>
  )
}
