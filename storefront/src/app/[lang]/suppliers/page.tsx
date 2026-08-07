import Link from 'next/link'
import { getAllBrands, getAllProducts } from '@/lib/data'
import { SOLUTION_CATEGORIES, matchBrandsToCategory } from '@/lib/solutions'
import { t, LanguageCode } from '@/i18n'
import type { Metadata } from 'next'
import BrandLogo from '@/components/BrandLogo'
import SupplierSearch from '@/components/SupplierSearch'
import { CategoryIcon, BookmarkIcon, ExternalLinkIcon, CheckBadgeIcon } from '@/components/SolutionIcons'

export const metadata: Metadata = {
  title: 'Suppliers & Solutions - Aegisky',
  description: 'Explore 400+ verified drone suppliers, manufacturers and solution providers across the UAV ecosystem.',
}

export default function SuppliersPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const brands = getAllBrands()
  const products = getAllProducts()

  // Get featured suppliers (top brands by product count)
  const featuredBrands = [...brands]
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 24)

  // Count suppliers per category
  const categoryCounts = SOLUTION_CATEGORIES.map(cat => {
    const matched = matchBrandsToCategory(cat, brands, products)
    return { ...cat, supplierCount: matched.length }
  })

  const totalSuppliers = brands.length
  const totalProducts = products.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {lang === 'ru' ? 'Найти поставщика' : lang === 'zh' ? '查找供应商' : 'Find a Supplier'}
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
            {lang === 'ru'
              ? 'Изучите возможности поставщиков беспилотных систем, подсистем, компонентов и услуг'
              : lang === 'zh'
              ? '探索无人机系统、子系统、组件和服务供应商的能力'
              : 'Explore capabilities of unmanned system, subsystem, component and service suppliers'}
          </p>

          {/* Search */}
          <SupplierSearch lang={lang} />
        </div>
      </div>

      {/* Solution Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          {categoryCounts.map(cat => (
            <Link
              key={cat.slug}
              href={`/${lang}/solutions/${cat.slug}`}
              className="bg-white p-5 hover:bg-blue-50 transition-colors group flex items-start gap-3"
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: cat.color + '15', color: cat.color }}
              >
                <CategoryIcon icon={cat.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600 truncate">
                  {lang === 'ru' ? cat.nameRu : lang === 'zh' ? cat.nameZh : cat.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{cat.supplierCount} suppliers</div>
              </div>
            </Link>
          ))}
        </div>

        {/* For Suppliers CTA */}
        <div className="text-center mt-6 mb-12">
          <p className="text-sm text-gray-500">
            {lang === 'ru' ? 'Для поставщиков: ' : lang === 'zh' ? '供应商：' : 'For Suppliers: '}
            <Link href={`/${lang}/contact`} className="text-blue-600 hover:underline font-medium">
              {lang === 'ru' ? 'Сотрудничайте с нами' : lang === 'zh' ? '与我们合作展示您的解决方案' : 'Partner with us to showcase your solutions'}
            </Link>
          </p>
        </div>

        {/* Featured Suppliers */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {lang === 'ru' ? 'Рекомендуемые поставщики' : lang === 'zh' ? '推荐供应商' : 'Featured Suppliers'}
            </h2>
            <Link href={`/${lang}/brands`} className="text-sm text-blue-600 hover:underline font-medium">
              {lang === 'ru' ? 'Все поставщики' : lang === 'zh' ? '查看全部' : 'View all'} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBrands.map(brand => {
              // Get a sample product image for this brand
              const brandProducts = products.filter(p =>
                p.brands?.some(b => b.slug === brand.slug)
              )
              const sampleProduct = brandProducts[0]
              const productImage = sampleProduct?.images?.[0] || sampleProduct?.mainImage

              return (
                <div
                  key={brand.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Card top - product image */}
                  <div className="relative h-40 bg-gray-50 flex items-center justify-center p-4">
                    {productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={productImage}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <BrandLogo slug={brand.slug} name={brand.name} size="xl" rounded="none" />
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm">
                      <BookmarkIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <h3 className="font-bold text-gray-900">{brand.name.replace(/&amp;/g, '&')}</h3>
                      <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                      {brand.productCount} {lang === 'ru' ? 'товаров' : 'products'} ·{' '}
                      {lang === 'ru' ? 'Проверенный поставщик' : lang === 'zh' ? '认证供应商' : 'Verified supplier'}
                    </p>

                    <div className="flex gap-2">
                      <Link
                        href={`/${lang}/supplier/${brand.slug}`}
                        className="flex-1 bg-[#0B1F3A] text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3055] transition-colors flex items-center justify-center gap-1.5"
                      >
                        {lang === 'ru' ? 'Профиль' : lang === 'zh' ? '查看资料' : 'View Profile'}
                      </Link>
                      <Link
                        href={`/${lang}/brand/${brand.slug}`}
                        className="flex-1 border border-gray-300 text-gray-700 text-center py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {lang === 'ru' ? 'Продукты' : lang === 'zh' ? '产品' : 'Products'}
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                    <BrandLogo slug={brand.slug} name={brand.name} size="xs" rounded="sm" />
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                      {brand.productCount > 50 ? 'Platinum' : brand.productCount > 10 ? 'Gold' : 'Verified'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1a3a6a] rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{totalSuppliers}+</div>
              <div className="text-blue-200 text-sm">{lang === 'ru' ? 'Поставщиков' : lang === 'zh' ? '供应商' : 'Suppliers'}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{totalProducts.toLocaleString()}</div>
              <div className="text-blue-200 text-sm">{lang === 'ru' ? 'Товаров' : lang === 'zh' ? '产品' : 'Products'}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">12</div>
              <div className="text-blue-200 text-sm">{lang === 'ru' ? 'Категорий решений' : lang === 'zh' ? '解决方案分类' : 'Solution Categories'}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">50+</div>
              <div className="text-blue-200 text-sm">{lang === 'ru' ? 'Стран' : lang === 'zh' ? '国家' : 'Countries'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
