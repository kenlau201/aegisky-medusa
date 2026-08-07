'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Clock, TrendingUp, X } from 'lucide-react'
import { t, LanguageCode } from '@/i18n'
import type { Product } from '@/lib/data'
import { useCurrency } from '@/lib/currency-context'

interface Suggestion {
  type: 'product' | 'category' | 'brand' | 'history' | 'trending'
  text: string
  product?: Product & { brandName?: string }
}

const TRENDING_SEARCHES = [
  'brushless motor', 'flight controller', 'FPV camera', 'VTX',
  'LiPo battery', 'ESC', 'propeller', 'GPS module', 'ELRS receiver',
  'carbon frame', 'gimbal', 'thermal camera'
]

export default function SearchBar({ lang = 'en' }: { lang?: LanguageCode }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLFormElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const { format } = useCurrency()

  // Load search history from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem('aegisky-search-history')
      if (history) setSearchHistory(JSON.parse(history).slice(0, 5))
    } catch {}
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchText: string) => {
    if (!searchText || searchText.length < 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchText)}&lang=${lang}`)
      if (res.ok) {
        const data = await res.json()
        const newSuggestions: Suggestion[] = []

        // Products
        if (data.products) {
          data.products.slice(0, 5).forEach((p: Product) => {
            newSuggestions.push({ type: 'product', text: p.name, product: p })
          })
        }
        // Categories
        if (data.categories) {
          data.categories.slice(0, 3).forEach((c: { name: string; slug: string }) => {
            newSuggestions.push({ type: 'category', text: c.name })
          })
        }
        // Brands
        if (data.brands) {
          data.brands.slice(0, 3).forEach((b: { name: string; slug: string }) => {
            newSuggestions.push({ type: 'brand', text: b.name })
          })
        }

        setSuggestions(newSuggestions)
      }
    } catch {
      // Ignore errors
    }
    setLoading(false)
  }, [lang])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 200)
    } else {
      setSuggestions([])
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchSuggestions])

  const saveToHistory = (searchText: string) => {
    const newHistory = [searchText, ...searchHistory.filter(h => h !== searchText)].slice(0, 8)
    setSearchHistory(newHistory)
    try { localStorage.setItem('aegisky-search-history', JSON.stringify(newHistory)) } catch {}
  }

  const handleSearch = (searchText?: string) => {
    const finalQuery = searchText || query
    if (finalQuery.trim()) {
      saveToHistory(finalQuery.trim())
      setShowDropdown(false)
      router.push(`/${lang}/search?q=${encodeURIComponent(finalQuery.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex].text)
      } else {
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const clearHistory = () => {
    setSearchHistory([])
    try { localStorage.removeItem('aegisky-search-history') } catch {}
  }

  const showInitialState = query.length < 2 && showDropdown

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder={t(lang, 'nav.searchPlaceholder')}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setSelectedIndex(-1) }}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        className="w-full pl-4 pr-12 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm md:text-base"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-1.5 md:p-2 rounded-md hover:bg-blue-700 transition"
      >
        <Search size={18} className="md:w-5 md:h-5" />
      </button>

      {/* Autocomplete dropdown */}
      {showDropdown && (showInitialState || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Initial state: history + trending */}
          {showInitialState && (
            <div className="p-2">
              {searchHistory.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {lang === 'ru' ? 'Недавние' : lang === 'zh' ? '最近搜索' : 'Recent'}
                    </span>
                    <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500">
                      {lang === 'ru' ? 'Очистить' : lang === 'zh' ? '清除' : 'Clear'}
                    </button>
                  </div>
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setQuery(item); handleSearch(item) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded text-left"
                    >
                      <Clock size={14} className="text-gray-400" />
                      <span className="truncate">{item}</span>
                    </button>
                  ))}
                </div>
              )}
              <div>
                <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp size={12} />
                  {lang === 'ru' ? 'Популярное' : lang === 'zh' ? '热门搜索' : 'Trending'}
                </div>
                <div className="flex flex-wrap gap-2 px-2 py-2">
                  {TRENDING_SEARCHES.slice(0, 8).map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setQuery(item); handleSearch(item) }}
                      className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 text-xs rounded-full transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search results */}
          {!showInitialState && suggestions.length > 0 && (
            <div className="py-1">
              {loading && (
                <div className="px-4 py-3 text-sm text-gray-400">
                  {lang === 'ru' ? 'Поиск...' : lang === 'zh' ? '搜索中...' : 'Searching...'}
                </div>
              )}
              {suggestions.map((sugg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(sugg.text)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition ${
                    idx === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {sugg.type === 'product' && sugg.product ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sugg.product.images?.[0] || sugg.product.mainImage || ''}
                        alt=""
                        className="w-10 h-10 object-contain bg-gray-50 rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{sugg.text}</div>
                        <div className="text-xs text-gray-500">
                          {(sugg.product as any).brandName || sugg.product.brands?.[0]?.name} · {sugg.product.price ? format(sugg.product.price) : ''}
                        </div>
                      </div>
                    </>
                  ) : sugg.type === 'category' ? (
                    <>
                      <div className="w-10 h-10 bg-purple-50 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-xs font-bold">CAT</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{sugg.text}</div>
                        <div className="text-xs text-gray-500">
                          {lang === 'ru' ? 'Категория' : lang === 'zh' ? '分类' : 'Category'}
                        </div>
                      </div>
                    </>
                  ) : sugg.type === 'brand' ? (
                    <>
                      <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-bold">BR</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{sugg.text}</div>
                        <div className="text-xs text-gray-500">
                          {lang === 'ru' ? 'Бренд' : lang === 'zh' ? '品牌' : 'Brand'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Search size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 flex-1">{sugg.text}</span>
                    </>
                  )}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 text-left font-medium"
                >
                  {lang === 'ru' ? `Все результаты по "${query}"` : lang === 'zh' ? `查看"${query}"的所有结果` : `See all results for "${query}"`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  )
}
