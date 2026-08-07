import { notFound } from 'next/navigation'
import BrandContent from './BrandContent'
import { getBrandBySlug } from '@/lib/data'
import { LanguageCode } from '@/i18n'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string; lang: LanguageCode } }): Promise<Metadata> {
  let slug = params.slug
  try { slug = decodeURIComponent(slug) } catch {}
  const brand = getBrandBySlug(slug)
  if (!brand) return { title: 'Brand not found' }
  return {
    title: `${brand.name} - Aegisky`,
    description: `Browse ${brand.productCount} products from ${brand.name} on Aegisky.`,
  }
}

export default function BrandPage({ params }: { params: { slug: string; lang: LanguageCode } }) {
  let slug = params.slug
  try { slug = decodeURIComponent(slug) } catch {}
  const brand = getBrandBySlug(slug)
  if (!brand) notFound()

  return <BrandContent brand={{ slug: brand.slug, name: brand.name }} lang={params.lang} />
}
