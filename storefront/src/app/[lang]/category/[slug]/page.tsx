import type { Metadata } from 'next'
import { Suspense } from 'react'
import CategoryContent from './CategoryContent'
import { LanguageCode } from '@/i18n'
import { getCategoryBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateMetadata({ params }: {
  params: { slug: string; lang: LanguageCode }
}): Promise<Metadata> {
  let slug = params.slug
  try { slug = decodeURIComponent(slug) } catch {}

  const category = getCategoryBySlug(slug)
  if (!category) {
    return {
      title: 'Category Not Found',
      robots: { index: false },
    }
  }

  const lang = params.lang
  const title = lang === 'ru'
    ? `${category.name} - купить в Aegisky`
    : lang === 'zh'
    ? `${category.name} - Aegisky无人机供应链`
    : `${category.name} - Buy at Aegisky`

  const description = lang === 'ru'
    ? `${category.name}: ${category.productCount} товаров. Доставка по всему миру, оптовые цены, B2B поставки дронов и комплектующих.`
    : lang === 'zh'
    ? `${category.name}: ${category.productCount}款产品。全球配送，批发价格，无人机及零部件B2B供应链。`
    : `${category.name}: ${category.productCount} products. Global shipping, wholesale prices, B2B drone and component supply chain.`

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.lang}/category/${encodeURIComponent(category.slug)}`,
      languages: {
        'en': `/en/category/${encodeURIComponent(category.slug)}`,
        'ru': `/ru/category/${encodeURIComponent(category.slug)}`,
        'zh': `/zh/category/${encodeURIComponent(category.slug)}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: category.image ? [category.image] : undefined,
    },
  }
}

export default function CategoryPage({ params }: {
  params: { slug: string; lang: LanguageCode }
}) {
  let slug = params.slug
  try { slug = decodeURIComponent(slug) } catch {}

  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
        </div>
      </div>
    }>
      <CategoryContent
        initialSlug={slug}
        lang={params.lang}
      />
    </Suspense>
  )
}
