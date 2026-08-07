'use client'

import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import BrandLogo from '@/components/BrandLogo'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/data'
import { t, LanguageCode } from '@/i18n'

export default function BrandContent({ brand, lang }: { brand: { slug: string; name: string }; lang: LanguageCode }) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 24

  const fetchData = useCallback(async (page: number, sort: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('slug', brand.slug)
      params.set('page', String(page))
      params.set('limit', String(perPage))
      if (sort) params.set('sort', sort)
      params.set('_t', String(Date.now()))

      const res = await fetch(`/api/brand?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const data = await res.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Brand fetch error:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [brand.slug])

  // Initialize from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      const p = parseInt(sp.get('page') || '1')
      const s = sp.get('sort') || 'featured'
      setCurrentPage(p)
      setSortBy(s)
      fetchData(p, s)
    }
  }, [fetchData])

  // Fetch on page/sort change
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      fetchData(currentPage, sortBy)
    }
  }, [currentPage, sortBy])

  // Browser back/forward
  useEffect(() => {
    const onPop = () => {
      const sp = new URLSearchParams(window.location.search)
      setCurrentPage(parseInt(sp.get('page') || '1'))
      setSortBy(sp.get('sort') || 'featured')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return
    setCurrentPage(p)
    const url = new URL(window.location.href)
    url.searchParams.set('page', String(p))
    if (sortBy !== 'featured') url.searchParams.set('sort', sortBy)
    router.push(url.pathname + url.search, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (s: string) => {
    setSortBy(s)
    setCurrentPage(1)
    const url = new URL(window.location.href)
    url.searchParams.set('page', '1')
    if (s !== 'featured') url.searchParams.set('sort', s)
    else url.searchParams.delete('sort')
    router.push(url.pathname + url.search, { scroll: false })
  }

  // Pagination numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | string)[] = [1]
    if (currentPage > 4) pages.push('...')
    const start = Math.max(2, currentPage - 2)
    const end = Math.min(totalPages - 1, currentPage + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 3) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-72"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${lang}/brands`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.brands')}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{brand.name}</span>
      </nav>

      {/* Brand info */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
        <div className="flex items-center gap-6">
          <BrandLogo
            slug={brand.slug}
            name={brand.name}
            size="xl"
            rounded="xl"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand.name}</h1>
            <p className="text-gray-600 mb-3">{t(lang, 'brand.products', { count: total })}</p>
            <Link
              href={`/${lang}/supplier/${brand.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              {lang === 'ru' ? 'Профиль поставщика' : lang === 'zh' ? '查看供应商资料' : 'View Supplier Profile'}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{t(lang, 'brand.brandProducts')}</h2>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="featured">{t(lang, 'category.sortOptions.recommended')}</option>
          <option value="price-asc">{t(lang, 'category.sortOptions.priceAsc')}</option>
          <option value="price-desc">{t(lang, 'category.sortOptions.priceDesc')}</option>
          <option value="name">{t(lang, 'category.sortOptions.name')}</option>
        </select>
      </div>

      {/* Products grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500">{t(lang, 'search.noResults')}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 mt-8">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              ‹
            </button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-40`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              ›
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {lang === 'zh' ? `第 ${currentPage} 页，共 ${totalPages} 页` :
             lang === 'ru' ? `Страница ${currentPage} из ${totalPages}` :
             `Page ${currentPage} of ${totalPages}`}
          </div>
        </div>
      )}
    </div>
  )
}
