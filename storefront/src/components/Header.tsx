import Link from 'next/link'
import { getAllCategories, getStats } from '@/lib/data'
import SearchBar from './SearchBar'
import LanguageSwitcher from './LanguageSwitcher'
import CurrencySwitcher from './CurrencySwitcher'
import CartIcon from './CartIcon'
import UserMenu from './UserMenu'
import MegaMenu from './MegaMenu'
import { t, LanguageCode } from '@/i18n'

export default function Header({ lang = 'en' }: { lang?: LanguageCode }) {
  const categories = getAllCategories()
  const stats = getStats()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-gray-300">
              🌍 Global B2B Drone Supply Chain | {stats.totalProducts.toLocaleString()} Products | {stats.totalBrands} Brands
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/trade-center`} className="hover:text-blue-300 transition hidden md:inline text-sm font-medium">
              🌐 Trade Center
            </Link>
            <Link href={`/${lang}/control-tower`} className="hover:text-blue-300 transition hidden md:inline text-sm font-medium">
              🛡️ Control Tower
            </Link>
            <Link href={`/${lang}/pricing`} className="hover:text-blue-300 transition hidden sm:inline">
              {t(lang, 'nav.pricing')}
            </Link>
            <Link href={`/${lang}/supplier`} className="hover:text-blue-300 transition hidden sm:inline">
              {t(lang, 'nav.forSuppliers')}
            </Link>
            <Link href={`/${lang}/contact`} className="hover:text-blue-300 transition">
              {t(lang, 'footer.contact')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu */}
          <MegaMenu lang={lang} categories={categories} />

          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              A
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-slate-900 leading-tight">Aegisky</span>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider leading-none">B2B Drone Platform</div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar lang={lang} />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden lg:block">
              <CurrencySwitcher />
            </div>
            <LanguageSwitcher currentLang={lang} />
            <CartIcon lang={lang} />
            <div className="hidden sm:block">
              <UserMenu lang={lang} />
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-3 md:hidden">
          <SearchBar lang={lang} />
        </div>
      </div>
    </header>
  )
}
