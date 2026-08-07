import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ChevronRight, Package, Shield, Zap, Radio, Globe, TrendingUp, Tag, Layers } from 'lucide-react'
import { getAllProducts, getAllCategories, getAllBrands, getFeaturedProducts, getStats, getOnSaleProducts, ensureDataLoaded } from '@/lib/data'
import { t, LanguageCode } from '@/i18n'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aegisky - Global B2B Drone & UAV Supply Chain Platform',
  description: '6,384 drone products, 438 brands. FPV drones, industrial UAVs, motors, ESCs, batteries, flight controllers, cameras, and more.',
  alternates: {
    canonical: 'https://aegisky.com',
  },
}

export default async function HomePage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  await ensureDataLoaded()
  const products = getAllProducts()
  const categories = getAllCategories()
  const brands = getAllBrands()
  const featuredProducts = getFeaturedProducts(12)
  const onSaleProducts = getOnSaleProducts(8)
  const stats = getStats()

  // Top categories by product count
  const topCategories = [...categories]
    .filter(c => c.productCount >= 5)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 30)

  // Top brands
  const topBrands = [...brands]
    .filter(b => b.productCount >= 10)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 18)

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://aegisky.com/#organization',
        name: 'Aegisky',
        url: 'https://aegisky.com',
        description: 'Global B2B drone and UAV supply chain platform.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://aegisky.com/#website',
        url: 'https://aegisky.com',
        name: 'Aegisky',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://aegisky.com/en/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 md:p-16 text-white mb-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {lang === 'ru' ? 'Более 600 поставщиков по всему миру' : lang === 'zh' ? '全球600+供应商' : '600+ Verified Suppliers Worldwide'}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {lang === 'ru' ? (
                <>Международная B2B платформа<br /><span className="text-blue-400">для дронов и комплектующих</span></>
              ) : lang === 'zh' ? (
                <>全球B2B无人机<br /><span className="text-blue-400">供应链平台</span></>
              ) : (
                <>Global B2B Drone<br /><span className="text-blue-400">Supply Chain Platform</span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
              {lang === 'ru'
                ? `${stats.totalProducts.toLocaleString()} товаров, ${stats.totalBrands}+ брендов, ${stats.totalCategories} категорий. FPV дроны, промышленные БПЛА, комплектующие.`
                : lang === 'zh'
                ? `${stats.totalProducts.toLocaleString()} 产品, ${stats.totalBrands}+ 品牌, ${stats.totalCategories} 分类。FPV无人机、工业无人机、零部件。`
                : `${stats.totalProducts.toLocaleString()} products, ${stats.totalBrands}+ brands, ${stats.totalCategories} categories. FPV drones, industrial UAVs, components.`
              }
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${lang}/categories`} className="bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg shadow-blue-500/25">
                {t(lang, 'home.catalogButton')}
              </Link>
              <Link href={`/${lang}/brands`} className="bg-blue-600/80 backdrop-blur text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-500 border border-blue-400/30 transition">
                {t(lang, 'home.brandsButton')}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/10">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{stats.totalProducts.toLocaleString()}</div>
                <div className="text-sm text-blue-200">{lang === 'ru' ? 'Товаров' : lang === 'zh' ? '产品数' : 'Products'}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">{stats.totalBrands}+</div>
                <div className="text-sm text-blue-200">{lang === 'ru' ? 'Брендов' : lang === 'zh' ? '品牌数' : 'Brands'}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">{stats.totalCategories}</div>
                <div className="text-sm text-blue-200">{lang === 'ru' ? 'Категорий' : lang === 'zh' ? '分类' : 'Categories'}</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">50+</div>
                <div className="text-sm text-blue-200">{lang === 'ru' ? 'Стран' : lang === 'zh' ? '国家' : 'Countries'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href={`/${lang}/categories`} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalCategories}</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'Категорий' : lang === 'zh' ? '全部分类' : 'Categories'}</div>
                </div>
              </div>
            </Link>
            <Link href={`/${lang}/brands`} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalBrands}</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'Брендов' : lang === 'zh' ? '品牌' : 'Brands'}</div>
                </div>
              </div>
            </Link>
            <Link href={`/${lang}/categories`} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <Tag size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.onSale}</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'Со скидкой' : lang === 'zh' ? '促销商品' : 'On Sale'}</div>
                </div>
              </div>
            </Link>
            <Link href={`/${lang}/categories`} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.inStock}</div>
                  <div className="text-sm text-gray-500">{lang === 'ru' ? 'В наличии' : lang === 'zh' ? '有货' : 'In Stock'}</div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t(lang, 'home.popularProducts')}</h2>
            <Link href={`/${lang}/categories`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
              {t(lang, 'home.viewAll')} <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        </section>

        {/* On Sale Products */}
        {onSaleProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap size={24} className="text-orange-500" />
                {lang === 'ru' ? 'Распродажа' : lang === 'zh' ? '特价促销' : 'On Sale'}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {onSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {lang === 'ru' ? 'Популярные категории' : lang === 'zh' ? '热门分类' : 'Popular Categories'}
            </h2>
            <Link href={`/${lang}/categories`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
              {t(lang, 'home.viewAll')} <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {topCategories.slice(0, 18).map((cat) => (
              <Link
                key={cat.id}
                href={`/${lang}/category/${cat.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center text-blue-600">
                  <Package size={18} />
                </div>
                <div className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight min-h-[32px]">
                  {cat.name}
                </div>
                <div className="text-xs text-blue-600 font-semibold mt-1">{cat.productCount}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Brands */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t(lang, 'home.featuredBrands')}</h2>
            <Link href={`/${lang}/brands`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
              {t(lang, 'home.viewAll')} <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {topBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/${lang}/brand/${brand.slug}`}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all"
              >
                <div className="font-bold text-gray-800 text-sm mb-1 truncate">{brand.name}</div>
                <div className="text-xs text-gray-500">{brand.productCount} {lang === 'ru' ? 'товаров' : lang === 'zh' ? '产品' : 'products'}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Value Props */}
        <section className="mb-12">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4">
                <Shield size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {lang === 'ru' ? 'Проверенные поставщики' : lang === 'zh' ? '认证供应商' : 'Verified Suppliers'}
              </h3>
              <p className="text-sm text-gray-500">
                {lang === 'ru' ? 'Все поставщики проходят проверку' : lang === 'zh' ? '所有供应商经过验证' : 'All suppliers vetted'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <Globe size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {lang === 'ru' ? 'Доставка по миру' : lang === 'zh' ? '全球配送' : 'Global Shipping'}
              </h3>
              <p className="text-sm text-gray-500">
                {lang === 'ru' ? 'Доставка в 50+ стран' : lang === 'zh' ? '配送至50+国家' : 'Ships to 50+ countries'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                <Zap size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {lang === 'ru' ? 'B2B цены' : lang === 'zh' ? 'B2B价格' : 'B2B Pricing'}
              </h3>
              <p className="text-sm text-gray-500">
                {lang === 'ru' ? 'Оптовые цены и скидки' : lang === 'zh' ? '批发价和折扣' : 'Wholesale & bulk discounts'}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                <Radio size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {lang === 'ru' ? 'Запрос цены' : lang === 'zh' ? '询价' : 'Request Quote'}
              </h3>
              <p className="text-sm text-gray-500">
                {lang === 'ru' ? 'Ответ в течение 24 часов' : lang === 'zh' ? '24小时内回复' : 'Response within 24h'}
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
