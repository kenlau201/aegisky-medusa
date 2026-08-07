import { MetadataRoute } from 'next'
import { languages } from '@/i18n'
import { getAllCategories, getAllBrands, getAllProducts } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aegisky.com'

  // Static pages
  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/categories', priority: 0.9, freq: 'daily' as const },
    { path: '/brands', priority: 0.9, freq: 'daily' as const },
    { path: '/suppliers', priority: 0.8, freq: 'weekly' as const },
    { path: '/applications', priority: 0.8, freq: 'weekly' as const },
    { path: '/pricing', priority: 0.8, freq: 'monthly' as const },
    { path: '/rfq', priority: 0.7, freq: 'monthly' as const },
    { path: '/compare', priority: 0.6, freq: 'monthly' as const },
    { path: '/about', priority: 0.5, freq: 'monthly' as const },
    { path: '/contact', priority: 0.5, freq: 'monthly' as const },
  ]

  const urls: MetadataRoute.Sitemap = []
  const langCodes = languages.map(l => l.code)
  const langAlternates = Object.fromEntries(
    langCodes.map(code => [code, `${baseUrl}/${code}`])
  )

  // Add static pages for all languages
  for (const page of staticPages) {
    for (const lang of langCodes) {
      urls.push({
        url: `${baseUrl}/${lang}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            langCodes.map(code => [code, `${baseUrl}/${code}${page.path}`])
          ),
        },
      })
    }
  }

  // Add ALL category pages
  try {
    const categories = getAllCategories()
    for (const cat of categories) {
      for (const lang of langCodes) {
        urls.push({
          url: `${baseUrl}/${lang}/category/${encodeURIComponent(cat.slug)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch {}

  // Add ALL brand pages
  try {
    const brands = getAllBrands()
    for (const brand of brands) {
      for (const lang of langCodes) {
        urls.push({
          url: `${baseUrl}/${lang}/brand/${encodeURIComponent(brand.slug)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch {}

  // Add product pages (important for SEO)
  try {
    const products = getAllProducts()
    for (const product of products) {
      for (const lang of langCodes) {
        urls.push({
          url: `${baseUrl}/${lang}/product/${encodeURIComponent(product.slug)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch {}

  // Add application pages
  const applicationSlugs = ['entertainment', 'for-training', 'cartography', 'geodesy', 'electrical-installation', 'industrial-work', 'military-purpose', 'rescue-operations', 'agriculture']
  for (const slug of applicationSlugs) {
    for (const lang of langCodes) {
      urls.push({
        url: `${baseUrl}/${lang}/applications/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  // Add solution pages
  const solutionSlugs = ['aerial-photography', 'surveying-mapping', 'inspection', 'agriculture', 'search-rescue', 'security', 'delivery', 'fpv-racing', 'education', 'filmmaking', 'construction', 'defense']
  for (const slug of solutionSlugs) {
    for (const lang of langCodes) {
      urls.push({
        url: `${baseUrl}/${lang}/solutions/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return urls
}
