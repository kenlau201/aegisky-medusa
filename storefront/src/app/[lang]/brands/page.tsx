import Link from 'next/link'
import { getAllBrands } from '@/lib/data'
import { t, LanguageCode } from '@/i18n'
import type { Metadata } from 'next'
import BrandLogo from '@/components/BrandLogo'

export const metadata: Metadata = {
  title: 'All Brands - Aegisky',
}

export default function BrandsPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const brands = getAllBrands()

  // Group by first letter - only show A-Z for non-Russian languages
  const grouped: Record<string, typeof brands> = {}
  const isCyrillic = /[А-Яа-яЁё]/
  brands.forEach(brand => {
    let letter = brand.name.charAt(0).toUpperCase()
    // For non-Russian languages, skip Cyrillic-starting brands or group them under '#'
    if (isCyrillic.test(letter)) {
      if (lang === 'ru') {
        // Russian: keep Cyrillic letters
      } else {
        // Other languages: put Cyrillic brands under '#'
        letter = '#'
      }
    }
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter].push(brand)
  })
  // Sort: A-Z first, then #, then Cyrillic (for Russian)
  const sortedLetters = Object.keys(grouped).sort((a, b) => {
    if (a === '#') return 1
    if (b === '#') return -1
    if (a >= 'A' && a <= 'Z' && b >= 'A' && b <= 'Z') return a.localeCompare(b)
    if (a >= 'A' && a <= 'Z') return -1
    if (b >= 'A' && b <= 'Z') return 1
    return a.localeCompare(b, 'ru')
  })

  const totalProducts = brands.reduce((s, b) => s + b.productCount, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{t(lang, 'nav.brands')}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {lang === 'ru' ? 'Все бренды' : lang === 'zh' ? '全部品牌' : 'All Brands'}
        </h1>
        <p className="text-gray-600">
          {brands.length} {lang === 'ru' ? 'брендов' : lang === 'zh' ? '个品牌' : 'brands'} · {totalProducts.toLocaleString()} {lang === 'ru' ? 'товаров' : 'products'}
        </p>
      </div>

      {/* Letter navigation */}
      <div className="flex flex-wrap gap-1 mb-8 sticky top-36 bg-white/95 backdrop-blur py-3 z-10 border-b border-gray-100">
        {sortedLetters.map(letter => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Brands by letter - source site style: logo image + name below */}
      <div className="space-y-8">
        {sortedLetters.map(letter => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{letter}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {grouped[letter].map(brand => (
                <Link
                  key={brand.id}
                  href={`/${lang}/brand/${brand.slug}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-full h-16 flex items-center justify-center mb-2">
                    <BrandLogo
                      slug={brand.slug}
                      name={brand.name}
                      size="md"
                      rounded="none"
                    />
                  </div>
                  <div className="text-xs text-gray-700 font-medium truncate w-full group-hover:text-blue-600">
                    {brand.name.replace(/&amp;/g, '&')}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
