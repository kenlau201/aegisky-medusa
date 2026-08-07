export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import dynamicClient from 'next/dynamic'
import { getProductBySlug, getRelatedProducts } from '@/lib/data'
import { translateText, LanguageCode } from '@/i18n'
import type { Metadata } from 'next'

const ProductDetailClient = dynamicClient(() => import('./ProductDetailClient'), {
  ssr: false,
  loading: () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl"></div>
            <div className="flex gap-3">
              {[1,2,3].map(i => <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl"></div>)}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-14 bg-blue-100 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
})

export async function generateMetadata({ params }: { params: { slug: string; lang: LanguageCode } }): Promise<Metadata> {
  let slug = params.slug
  try { slug = decodeURIComponent(slug) } catch {}
  const product = getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }

  const translatedName = translateText(product.name, params.lang)
  const cleanName = translatedName.replace(/<[^>]*>/g, '').substring(0, 150)
  const cleanDesc = (product.shortDescription || product.description || '').replace(/<[^>]*>/g, '').substring(0, 200)
  const brandName = product.brands?.[0]?.name || ''
  const primaryCategory = product.categories?.[0]
  const translatedCategory = primaryCategory ? translateText(primaryCategory.name, params.lang) : ''

  return {
    title: `${cleanName} | Aegisky`,
    description: cleanDesc || `Buy ${cleanName} from Aegisky. ${brandName} ${product.sku}. Worldwide shipping, bulk pricing.`,
    alternates: {
      canonical: `https://aegisky.com/${params.lang}/product/${params.slug}`,
    },
    openGraph: {
      title: cleanName,
      description: cleanDesc,
      images: product.mainImage ? [{ url: product.mainImage, width: 800, height: 800 }] : undefined,
      type: 'website',
    },
  }
}

export default function ProductDetailPage({ params }: { params: { slug: string; lang: LanguageCode } }) {
  let slug = params.slug
  try { slug = decodeURIComponent(slug) } catch {}
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product, 8)

  // Product JSON-LD structured data
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    mpn: product.sku,
    description: (product.shortDescription || product.description || '').replace(/<[^>]*>/g, '').substring(0, 500),
    image: product.images.slice(0, 5),
    brand: product.brands?.[0] ? { '@type': 'Brand', name: product.brands[0].name } : undefined,
    category: product.categories?.[0]?.name,
    offers: product.price && product.price > 0 ? {
      '@type': 'Offer',
      url: `https://aegisky.com/${params.lang}/product/${params.slug}`,
      priceCurrency: product.currency || 'RUB',
      price: product.price.toFixed(2),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Aegisky',
      },
    } : undefined,
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating || '4.5',
      reviewCount: product.reviewCount,
    } : undefined,
  }

  // Breadcrumb JSON-LD
  const breadcrumbItems: any[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aegisky.com' },
    { '@type': 'ListItem', position: 2, name: 'Catalog', item: 'https://aegisky.com/en/categories' },
  ]
  if (product.categories?.[0]) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: product.categories[0].name,
      item: `https://aegisky.com/en/category/${product.categories[0].slug}`,
    })
  }
  breadcrumbItems.push({
    '@type': 'ListItem',
    position: breadcrumbItems.length + 1,
    name: product.name.substring(0, 60),
  })

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} lang={params.lang} />
    </>
  )
}
