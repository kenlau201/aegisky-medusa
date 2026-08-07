'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { t, translateText, LanguageCode } from '@/i18n'
import type { Product } from '@/lib/data'
import { getAllProducts, getAllBrands, getAllCategories } from '@/lib/data'

const PER_PAGE = 24

interface ProductsPageProps {
  lang: LanguageCode
}

export default function ProductsPage({ lang }: ProductsPageProps) {
  const allProducts = useMemo(() => getAllProducts(), [])
  const brands = useMemo(() => getAllBrands(), [])
  const categories = useMemo(() => getAllCategories(), [])

  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('default')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<number | ''>('')
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...allProducts]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q)
      )
    }

    if (selectedBrand) {
      result = result.filter(p => (p.brands || []).some(b => b.id === selectedBrand))
    }

    if (selectedCategory) {
      result = result.filter(p => (p.categories || []).some(c => c.id === selectedCategory))
    }

    if (inStockOnly) {
      result = result.filter(p => p.inStock)
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
        break
      case 'price-desc':
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
        result.sort((a, b) => (b.id || 0) - (a.id || 0))
        break
      case 'rating':
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        break
    }

    return result
  }, [allProducts, searchQuery, selectedBrand, selectedCategory, inStockOnly, sortBy])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const startIdx = (currentPage - 1) * PER_PAGE
  const pageProducts = filtered.slice(startIdx, startIdx + PER_PAGE)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedBrand('')
    setSelectedCategory('')
    setInStockOnly(false)
    setSortBy('default')
    setCurrentPage(1)
  }

  const labels = {
    en: { title: 'All Products', showing: 'Showing', of: 'of', products: 'products', sortBy: 'Sort by', filters: 'Filters', search: 'Search products...', brand: 'Brand', category: 'Category', inStock: 'In stock only', reset: 'Reset filters', perPage: 'per page', noResults: 'No products found', noResultsDesc: 'Try adjusting your filters or search query' },
    zh: { title: '全部商品', showing: '显示', of: '/', products: '件商品', sortBy: '排序', filters: '筛选', search: '搜索商品...', brand: '品牌', category: '分类', inStock: '仅显示有货', reset: '重置筛选', perPage: '每页', noResults: '未找到商品', noResultsDesc: '请尝试调整筛选条件或搜索关键词' },
    ru: { title: 'Все товары', showing: 'Показано', of: 'из', products: 'товаров', sortBy: 'Сортировка', filters: 'Фильтры', search: 'Поиск товаров...', brand: 'Бренд', category: 'Категория', inStock: 'В наличии', reset: 'Сбросить', perPage: 'на стр.', noResults: 'Товары не найдены', noResultsDesc: 'Попробуйте изменить фильтры или поисковый запрос' },
  }
  const l = labels[lang as keyof typeof labels] || labels.en

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href={`/${lang}`} className="hover:text-blue-600">{lang === 'zh' ? '首页' : lang === 'ru' ? 'Главная' : 'Home'}</Link>
            <span>/</span>
            <span className="text-gray-900">{l.title}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{l.title}</h1>
          <p className="text-gray-500 mt-1">{filtered.length.toLocaleString()} {l.products}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder={l.search}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="default">{lang === 'zh' ? '默认排序' : lang === 'ru' ? 'По умолчанию' : 'Default'}</option>
            <option value="price-asc">{lang === 'zh' ? '价格从低到高' : lang === 'ru' ? 'Цена ↑' : 'Price: Low to High'}</option>
            <option value="price-desc">{lang === 'zh' ? '价格从高到低' : lang === 'ru' ? 'Цена ↓' : 'Price: High to Low'}</option>
            <option value="name">{lang === 'zh' ? '名称' : lang === 'ru' ? 'Название' : 'Name'}</option>
            <option value="newest">{lang === 'zh' ? '最新' : lang === 'ru' ? 'Новинки' : 'Newest'}</option>
            <option value="rating">{lang === 'zh' ? '评分' : lang === 'ru' ? 'Рейтинг' : 'Top Rated'}</option>
          </select>

          {/* Toggle filters on mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <SlidersHorizontal size={18} />
            {l.filters}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{l.filters}</h2>
                <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">{l.reset}</button>
              </div>

              {/* Brand filter */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{l.brand}</label>
                <select
                  value={selectedBrand}
                  onChange={e => { setSelectedBrand(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1) }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">{lang === 'zh' ? '全部品牌' : lang === 'ru' ? 'Все бренды' : 'All Brands'}</option>
                  {brands.slice(0, 100).map(b => (
                    <option key={b.id} value={b.id}>{translateText(b.name, lang)} ({b.productCount})</option>
                  ))}
                </select>
              </div>

              {/* Category filter */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{l.category}</label>
                <select
                  value={selectedCategory}
                  onChange={e => { setSelectedCategory(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1) }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">{lang === 'zh' ? '全部分类' : lang === 'ru' ? 'Все категории' : 'All Categories'}</option>
                  {categories.filter(c => c.parent === 0).slice(0, 50).map(c => (
                    <option key={c.id} value={c.id}>{translateText(c.name, lang)} ({c.productCount})</option>
                  ))}
                </select>
              </div>

              {/* In stock */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => { setInStockOnly(e.target.checked); setCurrentPage(1) }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{l.inStock}</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="text-sm text-gray-500 mb-4">
              {l.showing} {filtered.length === 0 ? 0 : startIdx + 1}-{Math.min(startIdx + PER_PAGE, filtered.length)} {l.of} {filtered.length.toLocaleString()} {l.products}
            </div>

            {pageProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-gray-500 text-lg">{l.noResults}</p>
                <p className="text-gray-400 text-sm mt-2">{l.noResultsDesc}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {pageProducts.map(product => (
                  <ProductCard key={product.id} product={product} lang={lang} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number
                  if (totalPages <= 7) {
                    page = i + 1
                  } else if (currentPage <= 4) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i
                  } else {
                    page = currentPage - 3 + i
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
