'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronRight, Home, Grid3X3, Building2, FileText, Truck, Info, Phone, ShoppingCart } from 'lucide-react'
import { t, translateText, LanguageCode } from '@/i18n'
import { useAuth } from '@/lib/auth-context'

interface Category {
  id: number
  name: string
  slug: string
  parent: number
  productCount: number
}

export default function MobileNav({ lang, categories }: { lang: LanguageCode; categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const { user } = useAuth()

  const rootCategories = categories.filter(c => !c.parent || c.parent === 0)
    .sort((a, b) => b.productCount - a.productCount)

  const close = () => {
    setIsOpen(false)
    setShowCategories(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-gray-700 hover:text-blue-600"
        aria-label="Menu"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={close} />

          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
              <Link href={`/${lang}`} onClick={close} className="flex items-center gap-2">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <span className="text-xl font-bold text-slate-900">Aegisky</span>
              </Link>
              <button onClick={close} className="p-2 text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* User section */}
            <div className="p-4 border-b border-gray-100">
              {user ? (
                <Link href={`/${lang}/account`} onClick={close} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/${lang}/login`} onClick={close} className="py-2.5 text-center border border-blue-600 text-blue-600 rounded-lg font-medium text-sm">
                    {lang === 'ru' ? 'Войти' : lang === 'zh' ? '登录' : 'Sign In'}
                  </Link>
                  <Link href={`/${lang}/register`} onClick={close} className="py-2.5 text-center bg-blue-600 text-white rounded-lg font-medium text-sm">
                    {lang === 'ru' ? 'Регистрация' : lang === 'zh' ? '注册' : 'Register'}
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              <Link href={`/${lang}`} onClick={close} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Home size={20} className="text-gray-400" />
                <span>{t(lang, 'nav.home')}</span>
              </Link>

              <button
                onClick={() => setShowCategories(!showCategories)}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Grid3X3 size={20} className="text-gray-400" />
                <span className="flex-1 text-left">{t(lang, 'nav.categories')}</span>
                <ChevronRight size={18} className={`text-gray-400 transition-transform ${showCategories ? 'rotate-90' : ''}`} />
              </button>

              {showCategories && (
                <div className="pl-11 space-y-1 py-2 max-h-96 overflow-y-auto">
                  {rootCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${lang}/category/${encodeURIComponent(cat.slug)}`}
                      onClick={close}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      {translateText(cat.name, lang)}
                    </Link>
                  ))}
                  <Link href={`/${lang}/categories`} onClick={close} className="block px-4 py-2 text-sm text-blue-600 font-medium">
                    {lang === 'ru' ? 'Все категории →' : lang === 'zh' ? '所有分类 →' : 'All categories →'}
                  </Link>
                </div>
              )}

              <Link href={`/${lang}/brands`} onClick={close} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Building2 size={20} className="text-gray-400" />
                <span>{t(lang, 'nav.brands')}</span>
              </Link>

              <Link href={`/${lang}/applications`} onClick={close} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Truck size={20} className="text-gray-400" />
                <span>{t(lang, 'applications.title')}</span>
              </Link>

              <Link href={`/${lang}/cart`} onClick={close} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <ShoppingCart size={20} className="text-gray-400" />
                <span>{t(lang, 'nav.cart')}</span>
              </Link>

              <Link href={`/${lang}/rfq`} onClick={close} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <FileText size={20} className="text-gray-400" />
                <span>{t(lang, 'nav.requestQuote')}</span>
              </Link>
            </nav>

            <div className="border-t border-gray-100 p-4 space-y-1">
              <Link href={`/${lang}/about`} onClick={close} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Info size={20} className="text-gray-400" />
                <span>{t(lang, 'footer.about')}</span>
              </Link>
              <Link href={`/${lang}/contact`} onClick={close} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Phone size={20} className="text-gray-400" />
                <span>{t(lang, 'footer.contacts')}</span>
              </Link>
              <Link href={`/${lang}/supplier`} onClick={close} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                <Building2 size={20} className="text-gray-400" />
                <span>{t(lang, 'nav.forSuppliers')}</span>
              </Link>
            </div>

            {/* Legal */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                <Link href={`/${lang}/privacy`} onClick={close} className="hover:text-blue-600">
                  {lang === 'ru' ? 'Конфиденциальность' : lang === 'zh' ? '隐私政策' : 'Privacy'}
                </Link>
                <Link href={`/${lang}/terms`} onClick={close} className="hover:text-blue-600">
                  {lang === 'ru' ? 'Условия' : lang === 'zh' ? '服务条款' : 'Terms'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
