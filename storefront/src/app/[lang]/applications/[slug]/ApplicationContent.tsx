'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import BrandLogo from '@/components/BrandLogo'
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp, Check, Settings, Target, Award, FileText, Package } from 'lucide-react'
import { t, LanguageCode } from '@/i18n'
import type { Product } from '@/lib/data'
import { applicationAreas, getApplicationBySlug } from '@/lib/applications'

// Static gradient class map for Tailwind JIT
const GRADIENT_CLASSES: Record<string, string> = {
  'from-red-900 via-slate-900 to-red-950': 'from-red-900 via-slate-900 to-red-950',
  'from-orange-900 via-slate-900 to-amber-950': 'from-orange-900 via-slate-900 to-amber-950',
  'from-blue-900 via-slate-900 to-indigo-950': 'from-blue-900 via-slate-900 to-indigo-950',
  'from-teal-900 via-slate-900 to-cyan-950': 'from-teal-900 via-slate-900 to-cyan-950',
  'from-pink-900 via-slate-900 to-rose-950': 'from-pink-900 via-slate-900 to-rose-950',
  'from-green-900 via-slate-900 to-emerald-950': 'from-green-900 via-slate-900 to-emerald-950',
  'from-yellow-900 via-slate-900 to-orange-950': 'from-yellow-900 via-slate-900 to-orange-950',
  'from-purple-900 via-slate-900 to-violet-950': 'from-purple-900 via-slate-900 to-violet-950',
  'from-cyan-900 via-slate-900 to-blue-950': 'from-cyan-900 via-slate-900 to-blue-950',
}

function getGradientClass(slug: string): string {
  const app = applicationAreas.find(a => a.slug === slug)
  if (!app) return 'from-slate-900 via-slate-800 to-slate-950'
  return GRADIENT_CLASSES[app.gradient] || 'from-slate-900 via-slate-800 to-slate-950'
}

interface Brand { id: number; name: string; slug: string; count: number }
interface AttrTerm { id: number; name: string; slug: string; count: number }
interface AttrDef { id: number; name: string; slug: string; terms: AttrTerm[] }

interface AppData {
  tag: { id: number; name: string; slug: string; productCount: number }
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
}

interface AppContentProps { lang: LanguageCode; slug: string }

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

function getLocalized(app: ReturnType<typeof getApplicationBySlug>, lang: LanguageCode, field: string): string | string[] {
  if (!app) return ''
  const key = field as keyof typeof app
  const val = app[key]
  if (typeof val === 'object' && val !== null) {
    const l = lang === 'zh' ? 'zh' : lang === 'ru' ? 'ru' : 'en'
    return (val as Record<string, any>)[l] || (val as Record<string, any>)['en'] || ''
  }
  return val as string
}

function getLocalizedText(app: ReturnType<typeof getApplicationBySlug>, lang: LanguageCode, field: string): string {
  const v = getLocalized(app, lang, field)
  return typeof v === 'string' ? v : ''
}

function getLocalizedList(app: ReturnType<typeof getApplicationBySlug>, lang: LanguageCode, field: string): string[] {
  const v = getLocalized(app, lang, field)
  return Array.isArray(v) ? v : []
}

export default function ApplicationContent({ lang, slug }: AppContentProps) {
  const router = useRouter()
  const pathname = usePathname()

  const app = getApplicationBySlug(slug)
  const isEn = lang === 'en'
  const isRu = lang === 'ru'
  const isZh = lang === 'zh'

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

  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'usecases' | 'value'>('overview')

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
  }, [slug])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('slug', slug)
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

      const res = await fetch(`/api/application?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [slug, currentPage, currentSort, selectedBrands, minPrice, maxPrice, inStockOnly, onSaleOnly, selectedAttrs])

  useEffect(() => { fetchData() }, [fetchData])

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
    setCurrentPage(1)
  }, [])

  const selectedFiltersCount = selectedBrands.length + selectedAttrs.reduce((s, a) => s + a.termValues.length, 0) + (minPrice !== null ? 1 : 0) + (maxPrice !== null ? 1 : 0) + (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0)

  const sortLabels: Record<string, Record<string, string>> = {
    en: { default: 'Default', popularity: 'Popularity', rating: 'Rating', newest: 'Newest', 'price-asc': 'Price: Low to High', 'price-desc': 'Price: High to Low', 'name-asc': 'Name A-Z' },
    ru: { default: 'По умолчанию', popularity: 'Популярность', rating: 'Рейтинг', newest: 'Новинки', 'price-asc': 'Цена: по возрастанию', 'price-desc': 'Цена: по убыванию', 'name-asc': 'Название А-Я' },
    zh: { default: '默认', popularity: '人气', rating: '评分', newest: '最新', 'price-asc': '价格从低到高', 'price-desc': '价格从高到低', 'name-asc': '名称 A-Z' },
  }
  const sortLabel = sortLabels[lang] || sortLabels.en

  const tabLabels = {
    overview: isRu ? 'Обзор' : isZh ? '概述' : 'Overview',
    config: isRu ? 'Конфигурация' : isZh ? '典型配置' : 'Configuration',
    usecases: isRu ? 'Применение' : isZh ? '应用场景' : 'Use Cases',
    value: isRu ? 'Ценность' : isZh ? '核心价值' : 'Value',
  }

  const productsLabel = isRu ? 'товаров' : isZh ? '个产品' : 'products'
  const filtersLabel = isRu ? 'Фильтры' : isZh ? '筛选' : 'Filters'
  const sortByLabel = isRu ? 'Сортировка:' : isZh ? '排序：' : 'Sort by:'
  const priceLabel = isRu ? 'Цена' : isZh ? '价格' : 'Price'
  const inStockLabel = isRu ? 'В наличии' : isZh ? '有货' : 'In stock'
  const onSaleLabel = isRu ? 'Со скидкой' : isZh ? '促销' : 'On sale'
  const brandLabel = isRu ? 'Бренд' : isZh ? '品牌' : 'Brand'
  const clearAllLabel = isRu ? 'Сбросить все' : isZh ? '清除全部' : 'Clear all'
  const showingLabel = isRu ? 'Показано' : isZh ? '显示' : 'Showing'
  const ofLabel = isRu ? 'из' : isZh ? '/' : 'of'
  const prevLabel = isRu ? 'Назад' : isZh ? '上一页' : 'Previous'
  const nextLabel = isRu ? 'Вперёд' : isZh ? '下一页' : 'Next'

  // Pagination
  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null
    const pages: (number | string)[] = []
    const tp = data.totalPages
    const cp = data.page
    pages.push(1)
    if (cp > 3) pages.push('...')
    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) pages.push(i)
    if (cp < tp - 2) pages.push('...')
    if (tp > 1) pages.push(tp)

    return (
      <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
        <button onClick={() => goToPage(cp - 1)} disabled={cp <= 1}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1">
          <ChevronLeft size={16} /> {prevLabel}
        </button>
        {pages.map((p, i) => typeof p === 'string' ? (
          <span key={`e${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button key={p} onClick={() => goToPage(p)}
            className={`w-10 h-10 rounded-lg text-sm font-medium ${p === cp ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => goToPage(cp + 1)} disabled={cp >= tp}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1">
          {nextLabel} <ChevronRight size={16} />
        </button>
      </div>
    )
  }

  const sidebar = (
    <div className="space-y-0">
      {/* Price */}
      <FilterSection title={priceLabel}>
        {data && (() => {
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
                <div className="absolute h-2 bg-blue-600 rounded-full"
                  style={{
                    left: `${((curMin - rangeMin) / (rangeMax - rangeMin)) * 100}%`,
                    right: `${100 - ((curMax - rangeMin) / (rangeMax - rangeMin)) * 100}%`,
                  }} />
                <input type="range" min={rangeMin} max={rangeMax} value={curMin}
                  onChange={e => { const v = Number(e.target.value); if (v < curMax) { setPriceMinInput(String(v)); setMinPrice(v); setCurrentPage(1) } }}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
                <input type="range" min={rangeMin} max={rangeMax} value={curMax}
                  onChange={e => { const v = Number(e.target.value); if (v > curMin) { setPriceMaxInput(String(v)); setMaxPrice(v); setCurrentPage(1) } }}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>${rangeMin.toLocaleString()}</span>
                <span>${rangeMax.toLocaleString()}</span>
              </div>
              {(minPrice !== null || maxPrice !== null) && (
                <button onClick={() => { setMinPrice(null); setMaxPrice(null); setPriceMinInput(''); setPriceMaxInput(''); setCurrentPage(1) }}
                  className="text-xs text-blue-600 hover:underline mt-2">
                  {isRu ? 'Сбросить' : isZh ? '重置' : 'Reset'}
                </button>
              )}
            </div>
          )
        })()}
      </FilterSection>

      {/* Availability */}
      <FilterSection title={isRu ? 'Наличие' : isZh ? '库存' : 'Availability'}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={inStockOnly} onChange={() => { setInStockOnly(!inStockOnly); setCurrentPage(1) }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-gray-700">{inStockLabel}</span>
          {data && <span className="text-xs text-gray-400 ml-auto">({data.inStockCount})</span>}
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={onSaleOnly} onChange={() => { setOnSaleOnly(!onSaleOnly); setCurrentPage(1) }}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-gray-700">{onSaleLabel}</span>
          {data && <span className="text-xs text-gray-400 ml-auto">({data.onSaleCount})</span>}
        </label>
      </FilterSection>

      {/* Brands */}
      {data && data.brands.length > 0 && (
        <FilterSection title={brandLabel}>
          {data.brands.slice(0, 30).map(b => (
            <label key={b.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
              <input type="checkbox" checked={selectedBrands.includes(b.id)} onChange={() => toggleBrand(b.id)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <BrandLogo slug={b.slug} name={b.name} size="xs" rounded="sm" />
              <span className="text-sm text-gray-700 truncate flex-1">{b.name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">({b.count})</span>
            </label>
          ))}
        </FilterSection>
      )}

      {/* Dynamic attributes */}
      {data?.attributes.map(attr => (
        <FilterSection key={attr.id} title={attr.name}>
          {attr.terms.map(term => {
            const isChecked = selectedAttrs.find(a => a.attrId === attr.id)?.termValues.includes(String(term.id)) || false
            return (
              <label key={term.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isChecked} onChange={() => toggleAttrTerm(attr.id, term.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 truncate">{term.name}</span>
                <span className="text-xs text-gray-400 ml-auto">({term.count})</span>
              </label>
            )
          })}
        </FilterSection>
      ))}

      {selectedFiltersCount > 0 && (
        <button onClick={clearAll} className="w-full mt-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium">
          {clearAllLabel} ({selectedFiltersCount})
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        <ChevronRight size={14} />
        <Link href={`/${lang}/applications`} className="hover:text-blue-600">{t(lang, 'applications.title')}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900">{app ? getLocalizedText(app, lang, 'name') : (data?.tag.name || slug)}</span>
      </nav>

      {/* Hero / Rich Content */}
      {app && (
        <div className={`bg-gradient-to-br ${getGradientClass(slug)} rounded-2xl p-6 md:p-10 text-white mb-8 relative overflow-hidden`}>
          <div className="absolute top-4 right-6 text-7xl md:text-9xl opacity-20 select-none">{app.icon}</div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{app.icon}</span>
              <h1 className="text-2xl md:text-4xl font-bold">{getLocalizedText(app, lang, 'name')}</h1>
            </div>
            <p className="text-base md:text-lg text-white/80 mb-4">{getLocalizedText(app, lang, 'tagline')}</p>
            <p className="text-sm md:text-base text-white/70 leading-relaxed">{getLocalizedText(app, lang, 'description')}</p>
            {data && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm">
                <Check size={16} />
                <span>{data.total} {productsLabel}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs for detailed info */}
      {app && (
        <div className="mb-8">
          <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
            {([
              ['overview', FileText],
              ['config', Settings],
              ['usecases', Target],
              ['value', Award],
            ] as const).map(([key, Icon]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <Icon size={16} />
                {tabLabels[key]}
              </button>
            ))}
          </div>
          <div className="py-6">
            {activeTab === 'overview' && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p className="text-base">{getLocalizedText(app, lang, 'description')}</p>
              </div>
            )}
            {activeTab === 'config' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {getLocalizedList(app, lang, 'configurations').map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <Settings size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'usecases' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {getLocalizedList(app, lang, 'useCases').map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                    <Target size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'value' && (
              <div className="grid sm:grid-cols-2 gap-3">
                {getLocalizedList(app, lang, 'value').map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                    <Award size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <SlidersHorizontal size={16} />
            {filtersLabel}
            {selectedFiltersCount > 0 && <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{selectedFiltersCount}</span>}
          </button>
          <div className="text-sm text-gray-500">
            {loading ? '...' : data ? `${showingLabel} ${((data.page - 1) * data.perPage) + 1}–${Math.min(data.page * data.perPage, data.total)} ${ofLabel} ${data.total}` : ''}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden sm:inline">{sortByLabel}</span>
          <select value={currentSort} onChange={e => { setCurrentSort(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {Object.entries(sortLabel).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal size={18} className="text-gray-500" />
              <span className="font-semibold text-gray-900">{filtersLabel}</span>
              {selectedFiltersCount > 0 && <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{selectedFiltersCount}</span>}
            </div>
            {sidebar}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : data && data.products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.products.map(p => <ProductCard key={p.id} product={p} lang={lang} />)}
              </div>
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>{isRu ? 'Товары не найдены' : isZh ? '未找到产品' : 'No products found'}</p>
            </div>
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
                <span className="font-semibold text-lg">{filtersLabel}</span>
                {selectedFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-medium rounded-full px-2 py-0.5">
                    {selectedFiltersCount}
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
              {sidebar}
            </div>
            <div className="p-4 border-t bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex gap-3">
                {selectedFiltersCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    {lang === 'ru' ? 'Сбросить' : lang === 'zh' ? '清除' : 'Clear'}
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  {lang === 'ru' ? 'Показать' : lang === 'zh' ? '显示结果' : 'Show results'}
                  <span className="bg-white/20 text-sm px-2 py-0.5 rounded-full">{data?.total || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
