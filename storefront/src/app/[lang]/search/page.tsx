import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search as SearchIcon, SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { getAllProducts } from '@/lib/data'
import { t, LanguageCode } from '@/i18n'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search - Aegisky',
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { lang: LanguageCode }
  searchParams: { q?: string; page?: string; sort?: string }
}) {
  const lang = params.lang
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')
  const sort = searchParams.sort || 'relevance'
  const perPage = 24

  let products: any[] = []
  let total = 0
  let totalPages = 0

  if (query && query.trim().length > 0) {
    const allProducts = getAllProducts()
    const q = query.toLowerCase().trim()

    // Score-based search
    const scored = allProducts
      .map(p => {
        const name = (p.name || '').toLowerCase()
        const sku = (p.sku || '').toLowerCase()
        const brandName = Array.isArray(p.brands) ? (p.brands[0]?.name || '').toLowerCase() : ''
        const shortDesc = (p.shortDescription || '').toLowerCase()
        const categories = Array.isArray(p.categories) ? p.categories.map((c: any) => c.name?.toLowerCase() || '').join(' ') : ''

        let score = 0
        if (name.includes(q)) score += 100
        if (name.startsWith(q)) score += 50
        if (sku.includes(q)) score += 80
        if (brandName.includes(q)) score += 60
        if (categories.includes(q)) score += 40
        if (shortDesc.includes(q)) score += 20
        const words = q.split(/\s+/)
        words.forEach(w => {
          if (name.includes(w)) score += 10
          if (brandName.includes(w)) score += 5
        })

        return { product: p, score }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => {
        if (sort === 'price-asc') return (a.product.price || 0) - (b.product.price || 0)
        if (sort === 'price-desc') return (b.product.price || 0) - (a.product.price || 0)
        if (sort === 'name') return (a.product.name || '').localeCompare(b.product.name || '')
        return b.score - a.score
      })

    total = scored.length
    totalPages = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    products = scored.slice(start, start + perPage).map(x => x.product)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const pageUrl = (p: number) => {
    const params = new URLSearchParams()
    params.set('q', query)
    if (p > 1) params.set('page', String(p))
    if (sort !== 'relevance') params.set('sort', sort)
    return `/${lang}/search?${params.toString()}`
  }

  const sortUrl = (s: string) => {
    const params = new URLSearchParams()
    params.set('q', query)
    if (s !== 'relevance') params.set('sort', s)
    return `/${lang}/search?${params.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <SearchIcon size={24} className="text-blue-600" />
          {lang === 'ru' ? `Результаты поиска: ${query}` : lang === 'zh' ? `搜索结果：${query}` : `Search results: ${query}`}
        </h1>
        <p className="text-gray-600 text-sm">
          {lang === 'ru' ? `Найдено: ${total}` : lang === 'zh' ? `找到 ${total} 个结果` : `${total} products found`}
        </p>
      </div>

      {/* Toolbar */}
      {products.length > 0 && (
        <div className="flex items-center justify-between mb-6 bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">
              {lang === 'ru' ? `Страница ${page} из ${totalPages}` : lang === 'zh' ? `第 ${page} 页，共 ${totalPages} 页` : `Page ${page} of ${totalPages}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {lang === 'ru' ? 'Сортировка:' : lang === 'zh' ? '排序:' : 'Sort:'}
            </span>
            <div className="flex items-center gap-1">
              <Link href={sortUrl('relevance')} className={`px-2 py-1 text-xs rounded ${sort === 'relevance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t(lang, 'category.sortOptions.recommended')}
              </Link>
              <Link href={sortUrl('price-asc')} className={`px-2 py-1 text-xs rounded ${sort === 'price-asc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t(lang, 'category.sortOptions.priceAsc')}
              </Link>
              <Link href={sortUrl('price-desc')} className={`px-2 py-1 text-xs rounded ${sort === 'price-desc' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t(lang, 'category.sortOptions.priceDesc')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {page > 1 && (
                <Link
                  href={pageUrl(page - 1)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  <ChevronLeft size={20} />
                </Link>
              )}
              {getPageNumbers().map((p, i) =>
                typeof p === 'string' ? (
                  <span key={i} className="px-2 text-gray-400">...</span>
                ) : (
                  <Link
                    key={i}
                    href={pageUrl(p)}
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg font-medium text-sm transition ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
              {page < totalPages && (
                <Link
                  href={pageUrl(page + 1)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>
          )}
        </>
      ) : query ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="text-gray-400" size={28} />
          </div>
          <p className="text-gray-500 mb-4">{t(lang, 'search.noResults')}</p>
          <p className="text-sm text-gray-400 mb-6">
            {lang === 'ru' ? 'Попробуйте изменить запрос или посмотрите каталог' : lang === 'zh' ? '尝试修改搜索词或浏览分类目录' : 'Try different keywords or browse our catalog'}
          </p>
          <Link href={`/${lang}/categories`} className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
            {t(lang, 'nav.catalog')}
          </Link>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="text-gray-400" size={28} />
          </div>
          <p className="text-gray-500 mb-4">
            {lang === 'ru' ? 'Введите поисковый запрос' : lang === 'zh' ? '请输入搜索关键词' : 'Enter a search query'}
          </p>
        </div>
      )}
    </div>
  )
}
