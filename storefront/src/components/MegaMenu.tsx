'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Menu, ChevronRight, Search, X, ChevronDown, Package, Boxes, Cpu, Camera, Battery, Radio, Wrench, Zap, Plane, Eye, Shield, FolderTree, Layers, Building2 } from 'lucide-react'
import { t, LanguageCode } from '@/i18n'
import type { Category } from '@/lib/data'
import { applicationAreas } from '@/lib/applications'

interface MegaMenuProps {
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
  if (n.includes('сервопривод') || n.includes('servo')) return Wrench
  if (n.includes('заряд') || n.includes('charger')) return Battery
  if (n.includes('робот') || n.includes('robot')) return Boxes
  if (n.includes('лидар') || n.includes('lidar')) return Eye
  if (n.includes('тепловиз') || n.includes('thermal')) return Camera
  if (n.includes('антен') || n.includes('antenna')) return Radio
  return Package
}

export default function MegaMenu({ lang, categories }: MegaMenuProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  // Build category tree from real data
  const { rootCats, childrenMap, totalProducts, maxDepth } = useMemo(() => {
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
    const maxD = Math.max(...categories.map(c => c.depth || 0))
    return { rootCats: roots, childrenMap: childMap, totalProducts: total, maxDepth: maxD }
  }, [categories])

  // Search results - search across all categories including children
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return categories
      .filter(c => c.name.toLowerCase().includes(q))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 100)
  }, [categories, searchQuery])

  const toggleExpand = (catId: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  const expandAll = () => {
    setExpandedIds(new Set(categories.map(c => c.id)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const handleImageError = (id: number) => {
    setImageErrors(prev => new Set(prev).add(id))
  }

  const hasImage = (cat: Category) => cat.image && !imageErrors.has(cat.id)

  const renderIcon = (cat: Category, size: number = 16) => {
    const Icon = getCategoryIcon(cat.name)
    return <Icon size={size} className="text-blue-500" />
  }

  // Recursive category item renderer
  const renderCategoryItem = (cat: Category, depth: number = 0) => {
    const children = childrenMap[cat.id] || []
    const isExpanded = expandedIds.has(cat.id)
    const hasChildren = children.length > 0
    const Icon = getCategoryIcon(cat.name)
    const indent = depth * 16

    return (
      <div key={cat.id} className="select-none">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition group"
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          {hasImage(cat) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cat.image!}
              alt=""
              className={`object-contain rounded bg-gray-50 p-0.5 shrink-0 ${depth === 0 ? 'w-9 h-9' : depth === 1 ? 'w-7 h-7' : 'w-5 h-5'}`}
              onError={() => handleImageError(cat.id)}
            />
          ) : (
            <div className={`shrink-0 rounded flex items-center justify-center ${
              depth === 0 ? 'w-9 h-9 bg-gradient-to-br from-blue-50 to-indigo-100' :
              depth === 1 ? 'w-7 h-7 bg-gray-100 group-hover:bg-blue-100' :
              'w-5 h-5 bg-gray-50 group-hover:bg-blue-50'
            } transition-colors`}>
              <Icon size={depth === 0 ? 18 : depth === 1 ? 13 : 10} className={
                depth === 0 ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
              } />
            </div>
          )}

          <Link
            href={`/${lang}/category/${encodeURIComponent(cat.slug)}`}
            onClick={() => setMobileOpen(false)}
            className="flex-1 min-w-0"
          >
            <div className={`truncate transition-colors group-hover:text-blue-600 ${
              depth === 0 ? 'text-sm font-semibold text-gray-900' :
              depth === 1 ? 'text-sm text-gray-700' :
              'text-xs text-gray-600'
            }`}>
              {cat.name}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="font-medium">{cat.productCount}</span>
              {hasChildren && (
                <span className="text-blue-500">· {children.length}</span>
              )}
            </div>
          </Link>

          {hasChildren && (
            <button
              onClick={(e) => { e.preventDefault(); toggleExpand(cat.id) }}
              className={`p-1 rounded transition shrink-0 ${
                isExpanded ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-400'
              }`}
            >
              <ChevronDown size={depth === 0 ? 18 : 14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Recursive children */}
        {isExpanded && hasChildren && (
          <div className={`ml-2 my-0.5 ${depth === 0 ? 'pl-2 border-l-2 border-blue-200' : depth === 1 ? 'pl-2 border-l-2 border-blue-100' : 'pl-1'}`}>
            {children.map(child => renderCategoryItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Mega Menu */}
      <nav className="hidden lg:block">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
          >
            <Menu size={18} />
            {t(lang, 'nav.allCategories')}
          </button>

          <Link href={`/${lang}/categories`} className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition font-medium">
            {t(lang, 'nav.categories')}
          </Link>
          <Link href={`/${lang}/applications`} className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition font-medium flex items-center gap-1">
            <Layers size={15} />
            {t(lang, 'applications.title')}
          </Link>
          <Link href={`/${lang}/brands`} className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition font-medium">
            {t(lang, 'nav.brands')}
          </Link>
          <Link href={`/${lang}/suppliers`} className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition font-medium flex items-center gap-1">
            <Building2 size={15} />
            {lang === 'ru' ? 'Поставщики и решения' : lang === 'zh' ? '供应商与解决方案' : 'Suppliers & Solutions'}
          </Link>
        </div>
      </nav>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden p-2 text-gray-700 hover:text-blue-600"
      >
        <Menu size={24} />
      </button>

      {/* Mega Menu Panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FolderTree size={20} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white">{t(lang, 'nav.allCategories')}</span>
                  <div className="text-xs text-blue-100">
                    {categories.length} {lang === 'ru' ? 'категорий' : 'categories'} · {totalProducts.toLocaleString()} {lang === 'ru' ? 'товаров' : 'products'} · {maxDepth + 1} {lang === 'ru' ? 'ур.' : 'lvl'}
                  </div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-white/20 rounded-lg text-white transition">
                <X size={22} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={lang === 'ru' ? 'Поиск категорий...' : lang === 'zh' ? '搜索分类...' : 'Search categories...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Suppliers & Solutions quick links */}
            {!searchQuery.trim() && (
              <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                <Link
                  href={`/${lang}/suppliers`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Building2 size={16} className="text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    {lang === 'ru' ? 'Каталог поставщиков' : lang === 'zh' ? '供应商目录' : 'Find a Supplier'}
                  </span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
                <Link
                  href={`/${lang}/solutions`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Layers size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    {lang === 'ru' ? 'Технологии и решения' : lang === 'zh' ? '技术与解决方案' : 'Solutions & Technology'}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">12</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              </div>
            )}

            {/* Application Areas quick links */}
            {!searchQuery.trim() && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <Link
                  href={`/${lang}/applications`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 mb-2"
                >
                  <Layers size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-gray-900">{t(lang, 'applications.title')}</span>
                  <ChevronRight size={14} className="text-gray-400 ml-auto" />
                </Link>
                <div className="grid grid-cols-3 gap-1.5">
                  {applicationAreas.map(area => {
                    const name = lang === 'en' ? area.name.en : lang === 'zh' ? area.name.zh : area.name.ru
                    return (
                      <Link
                        key={area.slug}
                        href={`/${lang}/applications/${area.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-1.5 px-2 py-1.5 bg-white rounded-lg text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition truncate"
                      >
                        <span className="text-sm">{area.icon}</span>
                        <span className="truncate">{name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Expand/Collapse controls */}
            {!searchQuery.trim() && (
              <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <button
                  onClick={expandAll}
                  className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  {lang === 'ru' ? 'Развернуть все' : lang === 'zh' ? '展开全部' : 'Expand all'}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={collapseAll}
                  className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 rounded transition"
                >
                  {lang === 'ru' ? 'Свернуть все' : lang === 'zh' ? '折叠全部' : 'Collapse all'}
                </button>
              </div>
            )}

            {/* Category list */}
            <div className="flex-1 overflow-y-auto">
              {searchQuery.trim() ? (
                // Search results
                <div className="p-2">
                  {searchResults.map(cat => {
                    const parent = cat.parent ? categories.find(c => c.id === cat.parent) : null
                    const pathStr = cat.path ? cat.path.map(p => p.name).join(' / ') : (parent?.name || '')
                    return (
                      <Link
                        key={cat.id}
                        href={`/${lang}/category/${encodeURIComponent(cat.slug)}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition group"
                      >
                        {hasImage(cat) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cat.image!}
                            alt=""
                            className="w-9 h-9 object-contain rounded-lg bg-gray-50 p-1"
                            onError={() => handleImageError(cat.id)}
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                            {renderIcon(cat, 18)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate group-hover:text-blue-600 transition-colors">{cat.name}</div>
                          {pathStr && <div className="text-xs text-gray-400 truncate">{pathStr}</div>}
                        </div>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-700 px-2 py-0.5 rounded-full transition-colors">{cat.productCount}</span>
                      </Link>
                    )
                  })}
                  {searchResults.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Package size={40} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">{lang === 'ru' ? 'Ничего не найдено' : lang === 'zh' ? '未找到结果' : 'No results found'}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Full category tree - recursive render
                <div className="p-2">
                  {rootCats.map(root => renderCategoryItem(root, 0))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <Link
                href={`/${lang}/categories`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-medium text-sm shadow-md"
              >
                <FolderTree size={18} />
                {t(lang, 'home.viewAll')}
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
