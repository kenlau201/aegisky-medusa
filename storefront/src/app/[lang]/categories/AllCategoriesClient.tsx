'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Search, ChevronRight, ChevronDown, Package, FolderTree, Boxes, Cpu, Camera, Battery, Radio, Wrench, Zap, Plane, Eye, Shield } from 'lucide-react'
import type { Category } from '@/lib/data'
import { t, translateText, LanguageCode } from '@/i18n'

interface AllCategoriesClientProps {
  lang: LanguageCode
  categories: Category[]
}

// Category icon mapping based on name keywords
function getCategoryIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('двигател') || n.includes('motor') || n.includes('esc')) return Zap
  if (n.includes('камер') || n.includes('camera') || n.includes('видео') || n.includes('video')) return Camera
  if (n.includes('акб') || n.includes('батаре') || n.includes('battery') || n.includes('li-ion') || n.includes('li-po')) return Battery
  if (n.includes('пропеллер') || n.includes('propeller') || n.includes('лопаст')) return Plane
  if (n.includes('радио') || n.includes('radio') || n.includes('приёмник') || n.includes('передатчик') || n.includes('антенн') || n.includes('elrs')) return Radio
  if (n.includes('полётн') || n.includes('контроллер') || n.includes('flight controller') || n.includes('autopilot') || n.includes('автопилот')) return Cpu
  if (n.includes('fpv') || n.includes('очки') || n.includes('шлем') || n.includes('goggle')) return Eye
  if (n.includes('корпус') || n.includes('frame') || n.includes('рама')) return Boxes
  if (n.includes('подвес') || n.includes('gimbal') || n.includes('стабилизатор')) return Wrench
  if (n.includes('дрон') || n.includes('квадрокоптер') || n.includes('drone') || n.includes('коптер')) return Plane
  if (n.includes('защит') || n.includes('чехол') || n.includes('case')) return Shield
  return Package
}

export default function AllCategoriesClient({ lang, categories }: AllCategoriesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  // Build category tree from real data
  const { rootCats, childrenMap, totalProducts, totalSubcats } = useMemo(() => {
    const roots = categories.filter(c => !c.parent || c.parent === 0)
      .sort((a, b) => b.productCount - a.productCount)
    const childMap: Record<number, Category[]> = {}
    categories.forEach(c => {
      if (c.parent) {
        if (!childMap[c.parent]) childMap[c.parent] = []
        childMap[c.parent].push(c)
      }
    })
    Object.keys(childMap).forEach(k => {
      childMap[Number(k)].sort((a, b) => b.productCount - a.productCount)
    })
    const total = categories.reduce((s, c) => s + c.productCount, 0)
    const subcats = categories.filter(c => c.parent && c.parent !== 0).length
    return { rootCats: roots, childrenMap: childMap, totalProducts: total, totalSubcats: subcats }
  }, [categories])

  // Search results (flat)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()
    return categories
      .filter(c => c.name.toLowerCase().includes(q))
      .sort((a, b) => b.productCount - a.productCount)
  }, [categories, searchQuery])

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleImageError = (id: number) => {
    setImageErrors(prev => new Set(prev).add(id))
  }

  const hasImage = (cat: Category) => cat.image && !imageErrors.has(cat.id)

  // Render a category card (used in search results)
  const renderCategoryCard = (cat: Category, showParent = true) => {
    const parent = showParent && cat.parent ? categories.find(c => c.id === cat.parent) : null
    const Icon = getCategoryIcon(cat.name)
    return (
      <Link
        key={cat.id}
        href={`/${lang}/category/${encodeURIComponent(cat.slug)}`}
        className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
      >
        {hasImage(cat) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.image!}
            alt=""
            className="w-11 h-11 object-contain rounded-lg bg-gray-50 p-1.5 shrink-0"
            onError={() => handleImageError(cat.id)}
          />
        ) : (
          <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center shrink-0 group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors">
            <Icon size={20} className="text-blue-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{translateText(cat.name, lang)}</div>
          {parent && <div className="text-xs text-gray-400 truncate">{translateText(parent.name, lang)}</div>}
        </div>
        <span className="text-xs font-semibold text-gray-600 bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-700 px-2.5 py-1 rounded-full transition-colors">{cat.productCount}</span>
      </Link>
    )
  }

  // Render a subcategory item (with possible children)
  const renderSubcategory = (child: Category, depth = 0) => {
    const grandChildren = childrenMap[child.id] || []
    const isExpanded = expandedIds.has(child.id)
    const Icon = getCategoryIcon(child.name)

    return (
      <div key={child.id}>
        <div className="flex items-stretch">
          <Link
            href={`/${lang}/category/${encodeURIComponent(child.slug)}`}
            className={`flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group ${grandChildren.length > 0 ? 'rounded-r-none border-r-0' : ''}`}
          >
            {hasImage(child) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={child.image!}
                alt=""
                className="w-7 h-7 object-contain rounded shrink-0"
                onError={() => handleImageError(child.id)}
              />
            ) : (
              <Icon size={14} className="text-gray-400 group-hover:text-blue-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-800 truncate group-hover:text-blue-600 transition-colors">{translateText(child.name, lang)}</div>
            </div>
            <span className="text-xs text-gray-400 group-hover:text-blue-500 font-medium">{child.productCount}</span>
          </Link>
          {grandChildren.length > 0 && (
            <button
              onClick={(e) => { e.preventDefault(); toggleExpand(child.id) }}
              className={`px-2 bg-white border border-gray-200 border-l-0 rounded-r-lg hover:bg-gray-50 transition flex items-center ${isExpanded ? 'bg-gray-50' : ''}`}
            >
              <ChevronRight
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Grandchildren */}
        {isExpanded && grandChildren.filter(gc => gc.productCount > 0).length > 0 && (
          <div className="ml-4 mt-1 pl-3 border-l-2 border-blue-100 space-y-1">
            {grandChildren.filter(gc => gc.productCount > 0).map(gc => renderSubcategory(gc, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href={`/${lang}`} className="hover:text-blue-600 transition-colors">{t(lang, 'breadcrumbs.home')}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{t(lang, 'nav.categories')}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <FolderTree className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {lang === 'ru' ? 'Все категории' : lang === 'zh' ? '全部分类' : 'All Categories'}
            </h1>
          </div>
        </div>
        <p className="text-gray-600 ml-15">
          {lang === 'ru'
            ? `${rootCats.length} основных категорий · ${totalSubcats} подкатегорий · ${totalProducts.toLocaleString()} товаров`
            : lang === 'zh'
            ? `${rootCats.length} 个主分类 · ${totalSubcats} 个子分类 · ${totalProducts.toLocaleString()} 个商品`
            : `${rootCats.length} main categories · ${totalSubcats} subcategories · ${totalProducts.toLocaleString()} products`}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mb-8">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={lang === 'ru' ? 'Поиск категории...' : lang === 'zh' ? '搜索分类...' : 'Search categories...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm px-2 py-1 rounded hover:bg-gray-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search results */}
      {searchResults && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {lang === 'ru' ? `Найдено: ${searchResults.length}` : lang === 'zh' ? `找到 ${searchResults.length} 个` : `${searchResults.length} found`}
          </p>
          {searchResults.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>{lang === 'ru' ? 'Ничего не найдено' : lang === 'zh' ? '未找到分类' : 'No categories found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {searchResults.map(cat => renderCategoryCard(cat))}
            </div>
          )}
        </div>
      )}

      {/* Category tree */}
      {!searchResults && (
        <div className="space-y-3">
          {rootCats.map(root => {
            const children = childrenMap[root.id] || []
            const isExpanded = expandedIds.has(root.id)
            const Icon = getCategoryIcon(root.name)

            return (
              <div
                key={root.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'border-blue-200 shadow-md shadow-blue-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Root category header */}
                <div className="flex items-center gap-4 p-4 md:p-5">
                  <Link
                    href={`/${lang}/category/${encodeURIComponent(root.slug)}`}
                    className="flex items-center gap-4 flex-1 min-w-0 group"
                  >
                    {hasImage(root) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={root.image!}
                        alt={root.name}
                        className="w-14 h-14 object-contain rounded-xl bg-gray-50 p-2 shrink-0"
                        onError={() => handleImageError(root.id)}
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center shrink-0 group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors">
                        <Icon size={26} className="text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {translateText(root.name, lang)}
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Boxes size={13} />
                          {root.productCount} {lang === 'ru' ? 'товаров' : lang === 'zh' ? '商品' : 'products'}
                        </span>
                        {children.length > 0 && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <FolderTree size={13} />
                            {children.length} {lang === 'ru' ? 'подкатегорий' : lang === 'zh' ? '子分类' : 'subcategories'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {children.length > 0 && (
                    <button
                      onClick={() => toggleExpand(root.id)}
                      className={`p-2.5 rounded-xl transition-all duration-200 shrink-0 ${
                        isExpanded
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories grid */}
                <div className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}>
                  <div className="overflow-hidden">
                    {children.length > 0 && (
                      <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/80 to-white p-4 md:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                          {children.filter(c => c.productCount > 0).map(child => renderSubcategory(child))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
