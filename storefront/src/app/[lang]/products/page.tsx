import type { Metadata } from 'next'
import { Suspense } from 'react'
import ProductsContent from './ProductsContent'
import { LanguageCode } from '@/i18n'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: {
  params: { lang: LanguageCode }
}): Promise<Metadata> {
  const lang = params.lang
  const title = lang === 'ru'
    ? 'Все товары - Aegisky'
    : lang === 'zh'
    ? '全部商品 - Aegisky无人机供应链'
    : 'All Products - Aegisky'

  const description = lang === 'ru'
    ? 'Каталог из 6300+ товаров: дроны, FPV системы, комплектующие. Доставка по всему миру, B2B поставки.'
    : lang === 'zh'
    ? '6300+商品目录：无人机、FPV系统、零部件。全球配送，B2B供应链。'
    : 'Browse 6,300+ products: drones, FPV systems, components. Global shipping, B2B supply chain.'

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/products`,
      languages: {
        'en': '/en/products',
        'ru': '/ru/products',
        'zh': '/zh/products',
      },
    },
  }
}

export default function ProductsPage({ params }: {
  params: { lang: LanguageCode }
}) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent lang={params.lang} />
    </Suspense>
  )
}
