import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllBrands, getAllProducts } from '@/lib/data'
import { t, LanguageCode } from '@/i18n'
import type { Metadata } from 'next'
import BrandLogo from '@/components/BrandLogo'
import { BookmarkIcon, ExternalLinkIcon, CheckBadgeIcon, MapPinIcon, MailIcon, ChevronRightIcon } from '@/components/SolutionIcons'

export function generateMetadata({ params }: { params: { slug: string; lang: LanguageCode } }): Metadata {
  const brands = getAllBrands()
  const brand = brands.find(b => b.slug === params.slug)
  if (!brand) return { title: 'Not Found' }
  return { title: `${brand.name} - Supplier Profile - Aegisky` }
}

export default function SupplierDetailPage({ params: { slug, lang } }: { params: { slug: string; lang: LanguageCode } }) {
  const brands = getAllBrands()
  const products = getAllProducts()
  const brand = brands.find(b => b.slug === slug)
  if (!brand) notFound()

  const brandProducts = products.filter(p => p.brands?.some(b => b.slug === slug))
  const sampleImage = brandProducts[0]?.images?.[0] || brandProducts[0]?.mainImage

  const displayName = brand.name.replace(/&amp;/g, '&')

  // Generate a company description based on product categories
  const categories = new Set<string>()
  brandProducts.forEach(p => {
    p.categories?.forEach(c => categories.add(c.name))
  })
  const topCategories = Array.from(categories).slice(0, 5)

  const tabs = [
    { id: 'overview', label: lang === 'ru' ? 'ОБЗОР' : lang === 'zh' ? '能力概览' : 'CAPABILITY OVERVIEW', active: true },
    { id: 'products', label: lang === 'ru' ? 'ПРОДУКТЫ' : lang === 'zh' ? '产品' : 'PRODUCTS' },
    { id: 'documents', label: lang === 'ru' ? 'ДОКУМЕНТЫ' : lang === 'zh' ? '文档' : 'DOCUMENTS' },
    { id: 'contact', label: lang === 'ru' ? 'КОНТАКТЫ' : lang === 'zh' ? '联系' : 'CONTACT' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
            <ChevronRightIcon className="w-3 h-3" />
            <Link href={`/${lang}/suppliers`} className="hover:text-blue-600">
              {lang === 'ru' ? 'Поставщики' : lang === 'zh' ? '供应商' : 'Suppliers'}
            </Link>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-gray-900">{displayName}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{displayName}</h1>
              <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                {lang === 'ru' ? 'Проверен' : lang === 'zh' ? '已认证' : 'Verified'}
              </span>
            </div>
            <p className="text-gray-600 text-lg mb-3">
              {topCategories.length > 0
                ? (lang === 'ru'
                    ? `Производитель и поставщик: ${topCategories.join(', ')}`
                    : lang === 'zh'
                    ? `${topCategories.join('、')} 制造商与供应商`
                    : `Manufacturer & supplier of ${topCategories.join(', ')}`)
                : (lang === 'ru' ? 'Поставщик компонентов для БПЛА' : lang === 'zh' ? '无人机组件供应商' : 'Drone & UAV component supplier')}
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
              <MapPinIcon className="w-4 h-4" />
              <span>{lang === 'ru' ? 'Глобальный поставщик' : lang === 'zh' ? '全球供应商' : 'Global Supplier'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${lang}/brand/${brand.slug}`}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {lang === 'ru' ? 'Все продукты' : lang === 'zh' ? '查看全部产品' : 'View Products'}
                <ExternalLinkIcon className="w-4 h-4" />
              </Link>
              <button className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <BookmarkIcon className="w-4 h-4" />
                {lang === 'ru' ? 'Сохранить' : lang === 'zh' ? '收藏' : 'Save'}
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <MailIcon className="w-4 h-4" />
                {lang === 'ru' ? 'Связаться' : lang === 'zh' ? '联系' : 'Contact'}
              </button>
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 mr-1">{lang === 'ru' ? 'Подписаться:' : lang === 'zh' ? '关注：' : 'Follow:'}</span>
            <a href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mt-8">
          <nav className="flex gap-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab.active
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8 py-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Overview */}
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong>{displayName}</strong>{' '}
                {lang === 'ru'
                  ? `является ведущим поставщиком и производителем компонентов для беспилотных летательных аппаратов и робототехники. Компания предлагает широкий ассортимент продукции — ${brandProducts.length} наименований в категориях: ${topCategories.join(', ')}.`
                  : lang === 'zh'
                  ? `是无人机和机器人领域领先的组件供应商和制造商。提供 ${brandProducts.length} 种产品，涵盖：${topCategories.join('、')}。`
                  : `is a leading supplier and manufacturer of components for unmanned aerial vehicles and robotics. The company offers ${brandProducts.length} products across categories including ${topCategories.join(', ')}.`}
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                {lang === 'ru'
                  ? 'Продукция используется в профессиональных и промышленных приложениях, включая FPV, аэрофотосъёмку, картографию, инспекцию, поисково-спасательные операции и оборонные системы. Все товары проходят контроль качества и доступны для глобальной доставки.'
                  : lang === 'zh'
                  ? '产品广泛应用于专业和工业场景，包括FPV、航空摄影、测绘、巡检、搜救和国防系统。所有产品均经过质量检验，支持全球配送。'
                  : 'Products are used in professional and industrial applications including FPV, aerial photography, mapping, inspection, search & rescue, and defense systems. All products undergo quality control and are available for worldwide shipping.'}
              </p>
            </div>

            {/* Jump to section */}
            <div className="mt-8 border-l-4 border-blue-600 pl-4 py-2 bg-blue-50/50 rounded-r-lg">
              <div className="text-sm font-medium text-gray-500 mb-2">
                {lang === 'ru' ? 'Быстрый переход:' : lang === 'zh' ? '快速跳转：' : 'Jump to Section:'}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {topCategories.map((cat, i) => (
                  <a key={i} href={`#section-${i}`} className="text-sm text-blue-600 hover:underline">{cat}</a>
                ))}
              </div>
            </div>

            {/* Products grid */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {lang === 'ru' ? 'Продукты' : lang === 'zh' ? '产品' : 'Products'} ({brandProducts.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {brandProducts.slice(0, 12).map(product => (
                  <Link
                    key={product.id}
                    href={`/${lang}/product/${product.slug || product.id}`}
                    className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="h-36 bg-white flex items-center justify-center p-3">
                      {product.mainImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.mainImage} alt={product.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-gray-300 text-3xl">📦</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">{product.name}</h3>
                      {product.price && parseFloat(String(product.price)) > 0 && (
                        <div className="text-sm font-bold text-blue-600 mt-1">${product.price}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {brandProducts.length > 12 && (
                <div className="text-center mt-6">
                  <Link
                    href={`/${lang}/brand/${brand.slug}`}
                    className="inline-block bg-[#0B1F3A] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3055] transition-colors"
                  >
                    {lang === 'ru' ? `Все ${brandProducts.length} продуктов` : lang === 'zh' ? `查看全部 ${brandProducts.length} 个产品` : `View all ${brandProducts.length} products`}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-36">
              {/* Company image */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {sampleImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sampleImage} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <BrandLogo slug={brand.slug} name={brand.name} size="xl" rounded="none" />
                )}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 shadow-sm">
                  <BookmarkIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <BrandLogo slug={brand.slug} name={brand.name} size="md" rounded="md" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{displayName}</h3>
                    <p className="text-xs text-gray-500">{brandProducts.length} products</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {topCategories.length > 0
                    ? (lang === 'ru' ? `Производитель: ${topCategories.join(', ')}` : `Manufacturer of ${topCategories.join(', ')}`)
                    : 'Drone & UAV component supplier'}
                </p>

                <div className="space-y-2.5 mb-5 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>{lang === 'ru' ? 'Штаб-квартира: Глобально' : lang === 'zh' ? '总部：全球' : 'Headquarters: Global'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MailIcon className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <a href="#" className="hover:text-blue-600">sales@aegisky.com</a>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/${lang}/brand/${brand.slug}`}
                    className="block w-full bg-[#0B1F3A] text-white text-center py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a3055] transition-colors"
                  >
                    {lang === 'ru' ? 'Все продукты' : lang === 'zh' ? '查看产品' : 'View Products'}
                  </Link>
                  <button className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <MailIcon className="w-4 h-4" />
                    {lang === 'ru' ? 'Связаться с поставщиком' : lang === 'zh' ? '联系供应商' : 'Contact Supplier'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
