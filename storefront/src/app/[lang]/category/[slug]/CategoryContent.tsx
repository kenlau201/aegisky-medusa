'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import BrandLogo from '@/components/BrandLogo'
import { SlidersHorizontal, ChevronLeft, ChevronRight, Package, X, ChevronDown, ChevronUp } from 'lucide-react'
import { t, translateText, translateDescription, LanguageCode } from '@/i18n'
import type { Product } from '@/lib/data'

function sanitizeHtml(html: string): string {
  if (!html) return ''
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

interface Brand { id: number; name: string; slug: string; count: number }
interface AttrTerm { id: number; name: string; slug: string; count: number }
interface AttrDef { id: number; name: string; slug: string; terms: AttrTerm[] }
interface CategoryPathItem { id: number; name: string; slug: string }

interface CategoryData {
  category: { id: number; name: string; slug: string; parent: number; productCount: number; description?: string; depth: number; path: CategoryPathItem[] }
  products: Product[]
  total: number; page: number; perPage: number; totalPages: number
  brands: Brand[]
  attributes: AttrDef[]
  selectedBrands: number[]
  selectedAttrs: { attrId: number; termValues: string[] }[]
  priceRange: { min: number; max: number }
  minPrice: number; maxPrice: number
  inStockCount: number; onSaleCount: number
  inStockOnly: boolean; onSaleOnly: boolean
  childCategories?: { id: number; name: string; slug: string; productCount: number }[]
  breadcrumbs: CategoryPathItem[]
}

interface CategoryContentProps { lang: LanguageCode; initialSlug: string }

function parseFiltersFromURL() {
  const params = new URLSearchParams(window.location.search)
  const brands = params.get('brands')?.split(',').map(Number).filter(Boolean) || []
  const minPrice = params.get('minPrice') ? Number(params.get('minPrice')) : null
  const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : null
  const inStock = params.get('inStock') === 'true'
  const onSale = params.get('onSale') === 'true'
  const attrs: { attrId: number; termValues: string[] }[] = []
  for (const [key, value] of params.entries()) {
    if (key.startsWith('filter_attr_')) {
      const idStr = key.substring(12)
      if (/^\d+$/.test(idStr)) {
        attrs.push({ attrId: parseInt(idStr), termValues: value.split(',').map(v => v.trim()).filter(Boolean) })
      }
    }
  }
  return { brands, minPrice, maxPrice, inStock, onSale, attrs }
}

function buildURLQueryString(filters: {
  page: number; sort: string; brands: number[]; minPrice: number | null; maxPrice: number | null;
  inStock: boolean; onSale: boolean; attrs: { attrId: number; termValues: string[] }[]
}) {
  const p = new URLSearchParams()
  p.set('page', String(filters.page))
  if (filters.sort && filters.sort !== 'default') p.set('sort', filters.sort)
  if (filters.brands.length > 0) p.set('brands', filters.brands.join(','))
  if (filters.minPrice !== null) p.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== null) p.set('maxPrice', String(filters.maxPrice))
  if (filters.inStock) p.set('inStock', 'true')
  if (filters.onSale) p.set('onSale', 'true')
  for (const af of filters.attrs) {
    if (af.termValues.length > 0) p.set(`filter_attr_${af.attrId}`, af.termValues.join(','))
  }
  return p.toString()
}

function FilterSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-200 py-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">{children}</div>}
    </div>
  )
}

function CategoryContentInner({ lang, initialSlug }: CategoryContentProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [currentPage, setCurrentPage] = useState(1)
  const [currentSort, setCurrentSort] = useState('default')
  const [selectedBrands, setSelectedBrands] = useState<number[]>([])
  const [selectedAttrs, setSelectedAttrs] = useState<{ attrId: number; termValues: string[] }[]>([])
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [onSaleOnly, setOnSaleOnly] = useState(false)
  const [priceMinInput, setPriceMinInput] = useState('')
  const [priceMaxInput, setPriceMaxInput] = useState('')

  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Initialize from URL
  useEffect(() => {
    const f = parseFiltersFromURL()
    setSelectedBrands(f.brands)
    setMinPrice(f.minPrice)
    setMaxPrice(f.maxPrice)
    setInStockOnly(f.inStock)
    setOnSaleOnly(f.onSale)
    setSelectedAttrs(f.attrs)
    setPriceMinInput(f.minPrice !== null ? String(f.minPrice) : '')
    setPriceMaxInput(f.maxPrice !== null ? String(f.maxPrice) : '')
    const params = new URLSearchParams(window.location.search)
    setCurrentPage(Math.max(1, parseInt(params.get('page') || '1')))
    setCurrentSort(params.get('sort') || 'default')
  }, [initialSlug])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('slug', initialSlug)
      params.set('page', currentPage.toString())
      params.set('perPage', '24')
      if (currentSort !== 'default') params.set('sort', currentSort)
      if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','))
      if (minPrice !== null) params.set('minPrice', String(minPrice))
      if (maxPrice !== null) params.set('maxPrice', String(maxPrice))
      if (inStockOnly) params.set('inStock', 'true')
      if (onSaleOnly) params.set('onSale', 'true')
      for (const af of selectedAttrs) {
        if (af.termValues.length > 0) params.set(`filter_attr_${af.attrId}`, af.termValues.join(','))
      }
      params.set('_t', Date.now().toString())

      const res = await fetch(`/api/category?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.redirect) { router.push(json.redirect); return }
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [initialSlug, currentPage, currentSort, selectedBrands, minPrice, maxPrice, inStockOnly, onSaleOnly, selectedAttrs, router])

  useEffect(() => { fetchData() }, [fetchData])

  // Update URL when filters change
  useEffect(() => {
    const qs = buildURLQueryString({ page: currentPage, sort: currentSort, brands: selectedBrands, minPrice, maxPrice, inStock: inStockOnly, onSale: onSaleOnly, attrs: selectedAttrs })
    const url = `${pathname}?${qs}`
    router.push(url, { scroll: false })
  }, [currentPage, currentSort, selectedBrands, minPrice, maxPrice, inStockOnly, onSaleOnly, selectedAttrs, pathname, router])

  const goToPage = useCallback((p: number) => {
    if (p < 1) return
    setCurrentPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleBrand = useCallback((bid: number) => {
    setSelectedBrands(prev => prev.includes(bid) ? prev.filter(b => b !== bid) : [...prev, bid])
    setCurrentPage(1)
  }, [])

  const toggleAttrTerm = useCallback((attrId: number, termId: number) => {
    setSelectedAttrs(prev => {
      const existing = prev.find(a => a.attrId === attrId)
      if (existing) {
        const has = existing.termValues.includes(String(termId))
        const newVals = has ? existing.termValues.filter(v => v !== String(termId)) : [...existing.termValues, String(termId)]
        if (newVals.length === 0) return prev.filter(a => a.attrId !== attrId)
        return prev.map(a => a.attrId === attrId ? { ...a, termValues: newVals } : a)
      }
      return [...prev, { attrId, termValues: [String(termId)] }]
    })
    setCurrentPage(1)
  }, [])

  const applyPrice = useCallback(() => {
    const mn = priceMinInput ? Number(priceMinInput) : null
    const mx = priceMaxInput ? Number(priceMaxInput) : null
    setMinPrice(mn && !isNaN(mn) ? mn : null)
    setMaxPrice(mx && !isNaN(mx) ? mx : null)
    setCurrentPage(1)
  }, [priceMinInput, priceMaxInput])

  const clearAll = useCallback(() => {
    setSelectedBrands([])
    setSelectedAttrs([])
    setMinPrice(null)
    setMaxPrice(null)
    setInStockOnly(false)
    setOnSaleOnly(false)
    setPriceMinInput('')
    setPriceMaxInput('')
    setCurrentSort('default')
    setCurrentPage(1)
  }, [])

  const activeFilterCount = selectedBrands.length + selectedAttrs.reduce((s, a) => s + a.termValues.length, 0) + (minPrice !== null ? 1 : 0) + (maxPrice !== null ? 1 : 0) + (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0)

  const isAttrTermSelected = useCallback((attrId: number, termId: number) => {
    return selectedAttrs.some(a => a.attrId === attrId && a.termValues.includes(String(termId)))
  }, [selectedAttrs])

  const totalPages = data?.totalPages || 1

  const getPageNumbers = () => {
    const pages: number[] = []
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i) }
    else if (currentPage <= 3) { for (let i = 1; i <= 5; i++) pages.push(i); pages.push(-1); pages.push(totalPages) }
    else if (currentPage >= totalPages - 2) { pages.push(1); pages.push(-2); for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i) }
    else { pages.push(1); pages.push(-2); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i); pages.push(-1); pages.push(totalPages) }
    return pages
  }

  const uiText = (ru: string, en: string, zh: string) => {
    if (lang === 'ru') return ru
    if (lang === 'zh') return zh
    return en
  }

  const sortOptions = [
    { value: 'default', label: uiText('По популярности', 'Popularity', '综合排序') },
    { value: 'rating', label: uiText('По рейтингу', 'Rating', '评分最高') },
    { value: 'newest', label: uiText('По новизне', 'Newest', '最新上架') },
    { value: 'price-asc', label: uiText('По возрастанию цены', 'Price: Low to High', '价格从低到高') },
    { value: 'price-desc', label: uiText('По убыванию цены', 'Price: High to Low', '价格从高到低') },
  ]

  // Filter sidebar content (shared between desktop and mobile)
  const FilterSidebar = () => {
    if (!data) return null
    return (
      <div className="space-y-0">
        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="pb-4">
            <button onClick={clearAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              {uiText('Сбросить все фильтры', 'Clear all filters', '清除所有筛选')}
            </button>
          </div>
        )}

        {/* Price */}
        <FilterSection title={uiText('Цена', 'Price', '价格')}>
          {(() => {
            const rangeMin = data.priceRange.min
            const rangeMax = data.priceRange.max
            const curMin = minPrice ?? rangeMin
            const curMax = maxPrice ?? rangeMax
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-600">${curMin.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-blue-600">${curMax.toLocaleString()}</span>
                </div>
                <div className="relative h-2 mb-2">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <div
                    className="absolute h-2 bg-blue-600 rounded-full"
                    style={{
                      left: `${((curMin - rangeMin) / (rangeMax - rangeMin)) * 100}%`,
                      right: `${100 - ((curMax - rangeMin) / (rangeMax - rangeMin)) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    value={curMin}
                    onChange={e => {
                      const v = Number(e.target.value)
                      if (v < curMax) {
                        setPriceMinInput(String(v))
                        setMinPrice(v)
                        setCurrentPage(1)
                      }
                    }}
                    className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <input
                    type="range"
                    min={rangeMin}
                    max={rangeMax}
                    value={curMax}
                    onChange={e => {
                      const v = Number(e.target.value)
                      if (v > curMin) {
                        setPriceMaxInput(String(v))
                        setMaxPrice(v)
                        setCurrentPage(1)
                      }
                    }}
                    className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>${rangeMin.toLocaleString()}</span>
                  <span>${rangeMax.toLocaleString()}</span>
                </div>
                {(minPrice !== null || maxPrice !== null) && (
                  <button
                    onClick={() => { setMinPrice(null); setMaxPrice(null); setPriceMinInput(''); setPriceMaxInput(''); setCurrentPage(1) }}
                    className="text-xs text-blue-600 hover:underline mt-2"
                  >
                    {uiText('Сбросить', 'Reset', '重置')}
                  </button>
                )}
              </div>
            )
          })()}
        </FilterSection>

        {/* In stock / On sale */}
        <FilterSection title={uiText('Наличие', 'Availability', '库存状态')}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={inStockOnly} onChange={e => { setInStockOnly(e.target.checked); setCurrentPage(1) }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">{uiText('В наличии', 'In stock', '有货')}</span>
            <span className="text-xs text-gray-400 ml-auto">({data.inStockCount})</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={onSaleOnly} onChange={e => { setOnSaleOnly(e.target.checked); setCurrentPage(1) }}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">{uiText('Со скидкой', 'On sale', '促销')}</span>
            <span className="text-xs text-gray-400 ml-auto">({data.onSaleCount})</span>
          </label>
        </FilterSection>

        {/* Brands */}
        {data.brands.length > 0 && (
          <FilterSection title={uiText('Бренд', 'Brand', '品牌')}>
            {data.brands.slice(0, 30).map(brand => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                <input type="checkbox" checked={selectedBrands.includes(brand.id)} onChange={() => toggleBrand(brand.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <BrandLogo slug={brand.slug} name={brand.name} size="xs" rounded="sm" />
                <span className="text-sm text-gray-700 truncate flex-1">{translateText(brand.name, lang)}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">({brand.count})</span>
              </label>
            ))}
          </FilterSection>
        )}

        {/* Dynamic attributes */}
        {data.attributes.map(attr => (
          <FilterSection key={attr.id} title={translateText(attr.name, lang)}>
            {attr.terms.slice(0, 20).map(term => (
              <label key={term.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                <input type="checkbox" checked={isAttrTermSelected(attr.id, term.id)} onChange={() => toggleAttrTerm(attr.id, term.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 truncate flex-1">{translateText(term.name, lang)}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">({term.count})</span>
              </label>
            ))}
          </FilterSection>
        ))}
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-72"></div>)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || t(lang, 'category.notFound')}</h1>
        <Link href={`/${lang}/categories`} className="text-blue-600 hover:underline">{t(lang, 'category.backToCategories')}</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-4 flex flex-wrap items-center gap-y-1">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        {data.breadcrumbs?.map((item, idx) => {
          const isLast = idx === data.breadcrumbs.length - 1
          return (
            <span key={item.id} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? <span className="text-gray-900 font-medium">{translateText(item.name, lang)}</span>
                : <Link href={`/${lang}/category/${encodeURIComponent(item.slug)}`} className="hover:text-blue-600">{translateText(item.name, lang)}</Link>}
            </span>
          )
        })}
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{translateText(data.category.name, lang)}</h1>
        {data.category.description && (
          <div className="text-gray-600 prose prose-sm max-w-none mb-2" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: sanitizeHtml(translateDescription(data.category.description, lang)) }} />
        )}
        <p className="text-gray-500 text-sm">{data.total} {lang === 'ru' ? 'товаров' : 'products'}</p>
      </div>

      {/* Subcategories */}
      {data.childCategories && data.childCategories.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.childCategories.filter(c => c.productCount > 0).map(child => (
              <Link key={child.id} href={`/${lang}/category/${encodeURIComponent(child.slug)}`}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 truncate">{translateText(child.name, lang)}</span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{child.productCount}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 gap-3">
        <button onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2">
          <SlidersHorizontal size={16} />
          {uiText('Фильтры', 'Filters', '筛选')}
          {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">{uiText('Фильтры', 'Filters', '筛选')}</span>
          {activeFilterCount > 0 && <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5">{activeFilterCount}</span>}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-500 hidden sm:inline">{t(lang, 'category.sortBy')}:</span>
          <select value={currentSort} onChange={e => { setCurrentSort(e.target.value); setCurrentPage(1) }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-4 bg-white rounded-xl border border-gray-200 p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <FilterSidebar />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="text-center py-4 mb-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {data.products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p>{uiText('Товары не найдены', 'No products found', '未找到商品')}</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="mt-4 text-blue-600 hover:underline text-sm">
                  {lang === 'ru' ? 'Сбросить фильтры' : 'Clear filters'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.products.map(product => <ProductCard key={product.id} product={product} lang={lang} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <>
              <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1 || loading}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <ChevronLeft size={20} />
                </button>
                {getPageNumbers().map((p, idx) => p < 0
                  ? <span key={`e-${idx}`} className="px-2 text-gray-400">...</span>
                  : <button key={p} onClick={() => goToPage(p)} disabled={loading}
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition ${p === currentPage ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-300 hover:bg-gray-50 text-gray-700'} disabled:opacity-50`}>{p}</button>
                )}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages || loading}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="text-center text-sm text-gray-500 mt-4">
                {uiText(`Страница ${currentPage} из ${totalPages}`, `Page ${currentPage} of ${totalPages}`, `第 ${currentPage} 页，共 ${totalPages} 页`)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{uiText('Фильтры', 'Filters', '筛选')}</h2>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-medium rounded-full px-2 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedBrands([])
                      setSelectedAttrs([])
                      setMinPrice(null)
                      setMaxPrice(null)
                      setInStockOnly(false)
                      setOnSaleOnly(false)
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    {uiText('Сбросить', 'Clear', '清除')}
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {uiText('Показать', 'Show results', '查看结果')}
                  <span className="bg-white/20 text-sm px-2 py-0.5 rounded-full">{data.total}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CategoryContent(props: CategoryContentProps) {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-64 mb-4"></div></div></div>}>
      <CategoryContentInner {...props} />
    </Suspense>
  )
}
