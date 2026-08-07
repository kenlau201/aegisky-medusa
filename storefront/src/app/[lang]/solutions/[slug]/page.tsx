import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllBrands, getAllProducts } from '@/lib/data'
import { SOLUTION_CATEGORIES, getCategoryBySlug, matchBrandsToCategory } from '@/lib/solutions'
import { t, LanguageCode } from '@/i18n'
import type { Metadata } from 'next'
import BrandLogo from '@/components/BrandLogo'
import { CategoryIcon, BookmarkIcon, ExternalLinkIcon, CheckBadgeIcon, GridIcon, ListIcon, ChevronRightIcon } from '@/components/SolutionIcons'

export function generateStaticParams() {
  return SOLUTION_CATEGORIES.map(c => ({ slug: c.slug }))
}

export function generateMetadata({ params }: { params: { slug: string; lang: LanguageCode } }): Metadata {
  const cat = getCategoryBySlug(params.slug)
  if (!cat) return { title: 'Not Found' }
  return { title: `${cat.name} - Suppliers & Solutions - Aegisky` }
}

export default function SolutionCategoryPage({ params: { slug, lang } }: { params: { slug: string; lang: LanguageCode } }) {
  const cat = getCategoryBySlug(slug)
  if (!cat) notFound()

  const brands = getAllBrands()
  const products = getAllProducts()
  const matchedSuppliers = matchBrandsToCategory(cat, brands, products)

  // Get sample products for this category
  const categoryProducts = products.filter(p => {
    const catArr = Array.isArray(p.categories) ? p.categories : []
    const tagArr = Array.isArray(p.tags) ? p.tags : []
    const text = [
      ...catArr.map(c => (c.slug || '') + ' ' + (c.name || '')),
      ...tagArr.map(tg => (tg.slug || '') + ' ' + (tg.name || '')),
    ].join(' ').toLowerCase()
    return cat.keywords.some(k => text.includes(k.toLowerCase()))
  }).slice(0, 6)

  const catName = lang === 'ru' ? cat.nameRu : lang === 'zh' ? cat.nameZh : cat.name
  const catDesc = lang === 'ru' ? cat.descriptionRu : lang === 'zh' ? cat.descriptionZh : cat.description

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link href={`/${lang}/suppliers`} className="hover:text-blue-600">
              {lang === 'ru' ? 'Поставщики' : lang === 'zh' ? '供应商' : 'Suppliers'}
            </Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-gray-900">{catName}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat.color + '15', color: cat.color }}
                >
                  <CategoryIcon icon={cat.icon} className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: cat.color }}>
                  {lang === 'ru' ? 'ВЕДУЩИЕ ПОСТАВЩИКИ' : lang === 'zh' ? '全球领先供应商' : 'LEADING GLOBAL SUPPLIERS'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{catName}</h1>
              <p className="text-gray-500 text-lg mb-4">{catDesc}</p>
              <div className="h-px bg-gray-200 my-4" />
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">{catDesc}</p>
              <div className="flex flex-wrap gap-3">
                <a href="#suppliers" className="bg-[#0B1F3A] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3055] transition-colors">
                  {lang === 'ru' ? `Посмотреть ${matchedSuppliers.length} поставщиков` : lang === 'zh' ? `查看 ${matchedSuppliers.length} 家供应商` : `View ${matchedSuppliers.length} Suppliers`}
                </a>
                <a href="#products" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  {lang === 'ru' ? `Посмотреть ${categoryProducts.length} решений` : lang === 'zh' ? `查看 ${categoryProducts.length} 个方案` : `View ${categoryProducts.length} Solutions`}
                </a>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                {lang === 'ru' ? 'Поставщикам: ' : lang === 'zh' ? '供应商：' : 'Suppliers: '}
                <Link href={`/${lang}/contact`} className="text-blue-600 hover:underline">
                  {lang === 'ru' ? 'Присоединяйтесь к экосистеме' : lang === 'zh' ? '加入生态系统' : 'Join the Ecosystem'}
                </Link>
              </p>
            </div>

            {/* Featured sponsor spot */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="text-center text-xs text-gray-400 uppercase tracking-wider mb-3">
                {lang === 'ru' ? 'Категория представлена' : lang === 'zh' ? '本类别推荐' : 'Category Presented by'}
              </div>
              {matchedSuppliers[0] && (
                <Link href={`/${lang}/supplier/${matchedSuppliers[0].slug}`} className="block">
                  <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                    <BrandLogo slug={matchedSuppliers[0].slug} name={matchedSuppliers[0].name} size="xl" rounded="none" className="mx-auto mb-3" />
                    <div className="font-bold text-gray-900">{matchedSuppliers[0].name.replace(/&amp;/g, '&')}</div>
                    <div className="text-xs text-gray-500 mt-1">{matchedSuppliers[0].productCount} products</div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1" id="suppliers">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {lang === 'ru' ? 'Поставщики: ' : lang === 'zh' ? '供应商：' : 'Suppliers: '}{catName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {matchedSuppliers.length} {lang === 'ru' ? 'ведущих поставщиков' : lang === 'zh' ? '家领先供应商' : 'Leading Suppliers'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-blue-50 text-blue-600 rounded-lg" title="Grid View">
                  <GridIcon className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="List View">
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Supplier grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {matchedSuppliers.slice(0, 18).map(supplier => {
                const supplierProducts = products.filter(p =>
                  p.brands?.some(b => b.slug === supplier.slug)
                )
                const sampleProduct = supplierProducts[0]
                const productImage = sampleProduct?.images?.[0] || sampleProduct?.mainImage

                return (
                  <div
                    key={supplier.slug}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative h-36 bg-gray-50 flex items-center justify-center p-4">
                      {productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={productImage} alt={supplier.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <BrandLogo slug={supplier.slug} name={supplier.name} size="lg" rounded="none" />
                      )}
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm">
                        <BookmarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <h3 className="font-bold text-gray-900 text-sm">{supplier.name.replace(/&amp;/g, '&')}</h3>
                        <CheckBadgeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[32px]">
                        {supplier.productCount} {lang === 'ru' ? 'товаров в категории' : 'products in this category'}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/${lang}/supplier/${supplier.slug}`}
                          className="flex-1 bg-[#0B1F3A] text-white text-center py-2 rounded-lg text-xs font-medium hover:bg-[#1a3055] transition-colors"
                        >
                          {lang === 'ru' ? 'Профиль' : lang === 'zh' ? '资料' : 'View Profile'}
                        </Link>
                        <Link
                          href={`/${lang}/brand/${supplier.slug}`}
                          className="flex-1 border border-gray-300 text-gray-700 text-center py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          {lang === 'ru' ? 'Продукты' : lang === 'zh' ? '产品' : 'Products'}
                        </Link>
                      </div>
                    </div>
                    <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                      <BrandLogo slug={supplier.slug} name={supplier.name} size="xs" rounded="sm" />
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                        {supplier.productCount > 30 ? 'Platinum' : supplier.productCount > 10 ? 'Gold' : 'Verified'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Products section */}
            {categoryProducts.length > 0 && (
              <div id="products" className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {lang === 'ru' ? 'Решения и продукты' : lang === 'zh' ? '解决方案与产品' : 'Solutions & Products'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categoryProducts.map(product => (
                    <Link
                      key={product.id}
                      href={`/${lang}/product/${product.slug || product.id}`}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div className="h-32 bg-gray-50 flex items-center justify-center p-3">
                        {product.mainImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.mainImage} alt={product.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <div className="text-gray-300 text-3xl">📦</div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">{product.name}</h3>
                        {product.price && (
                          <div className="text-sm font-bold text-blue-600 mt-1">${product.price}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Related Categories */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-36">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                {lang === 'ru' ? 'Связанные категории' : lang === 'zh' ? '相关分类' : 'Related Categories'}
              </h3>
              <ul className="space-y-1">
                {cat.relatedCategories.map(rc => {
                  const rcCat = SOLUTION_CATEGORIES.find(c => c.slug === rc.slug)
                  if (!rcCat) return null
                  return (
                    <li key={rc.slug}>
                      <Link
                        href={`/${lang}/solutions/${rc.slug}`}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <span style={{ color: rcCat.color }}>
                          <CategoryIcon icon={rcCat.icon} className="w-4 h-4" />
                        </span>
                        {lang === 'ru' ? rcCat.nameRu : lang === 'zh' ? rcCat.nameZh : rcCat.name}
                      </Link>
                    </li>
                  )
                })}
                {SOLUTION_CATEGORIES.filter(c => c.slug !== cat.slug && !cat.relatedCategories.find(r => r.slug === c.slug)).slice(0, 4).map(rc => (
                  <li key={rc.slug}>
                    <Link
                      href={`/${lang}/solutions/${rc.slug}`}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <span style={{ color: rc.color }}>
                        <CategoryIcon icon={rc.icon} className="w-4 h-4" />
                      </span>
                      {lang === 'ru' ? rc.nameRu : lang === 'zh' ? rc.nameZh : rc.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
