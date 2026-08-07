export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import dynamicClient from 'next/dynamic'
import { getProductBySlug, getRelatedProducts } from '@/lib/data'
import { translateText, LanguageCode } from '@/i18n'
import type { Metadata } from 'next'
import { generateProductSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/geo/schema-generator'

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

  // 提取技术参数（如果有）
  const additionalProperty: Array<{ name: string; value: string }> = [];
  if (product.specifications) {
    for (const [key, value] of Object.entries(product.specifications)) {
      if (value) additionalProperty.push({ name: key, value: String(value) });
    }
  }

  // B2B FAQ - 工业无人机买家常见问题
  const faqQuestions = [
    {
      question: `What is the MOQ for ${product.name}?`,
      answer: `Standard MOQ applies. Bulk pricing and OEM/ODM customizations are available for enterprise orders. Contact our sales team for volume discounts and lead times.`,
    },
    {
      question: `Is ${product.name} export compliant?`,
      answer: `All products on Aegisky undergo ECCN classification and export compliance screening. CE/FCC certifications are available where applicable. We provide full export documentation for cross-border shipments.`,
    },
    {
      question: `What is the lead time for ${product.name}?`,
      answer: `Standard lead time is 2-4 weeks for in-stock items. Custom OEM orders typically require 4-8 weeks depending on specifications and quantity.`,
    },
    {
      question: `Do you offer OEM/ODM for this product?`,
      answer: `Yes, most manufacturers on Aegisky offer OEM/ODM services including custom branding, firmware modifications, and hardware customization. Contact us to discuss your requirements.`,
    },
    {
      question: `What warranty and support is included?`,
      answer: `All products come with standard manufacturer warranty. Extended warranty, on-site support, and technical training are available for enterprise customers.`,
    },
  ];

  // 用我们的GEO schema生成器
  const productJsonLd = generateProductSchema({
    id: product.id,
    name: product.name,
    sku: product.sku,
    description: (product.shortDescription || product.description || '').replace(/<[^>]*>/g, '').substring(0, 1000),
    images: product.images.slice(0, 10),
    brand: product.brands?.[0]?.name,
    category: product.categories?.[0]?.name,
    price: product.price,
    currency: product.currency || 'USD',
    inStock: product.inStock,
    url: `https://aegisky.com/${params.lang}/product/${params.slug}`,
    additionalProperty,
    moq: '1 unit (sample), 10+ units for bulk pricing',
    businessFunction: 'http://purl.org/goodrelations/v1#Manufacture',
  });

  const breadcrumbItems = [
    { name: 'Home', url: `https://aegisky.com/${params.lang}` },
    { name: 'Products', url: `https://aegisky.com/${params.lang}/categories` },
  ];
  if (product.categories?.[0]) {
    breadcrumbItems.push({
      name: product.categories[0].name,
      url: `https://aegisky.com/${params.lang}/category/${product.categories[0].slug}`,
    });
  }
  breadcrumbItems.push({ name: product.name.substring(0, 60), url: '' });

  const breadcrumbJsonLd = generateBreadcrumbSchema({ items: breadcrumbItems });
  const faqJsonLd = generateFAQSchema(faqQuestions);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} lang={params.lang} />
    </>
  )
}
