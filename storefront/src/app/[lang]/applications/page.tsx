import Link from 'next/link'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { t, LanguageCode } from '@/i18n'
import { applicationAreas } from '@/lib/applications'
import fs from 'fs'
import path from 'path'

// Static maps for Tailwind JIT
const GRADIENT_CLASSES: Record<string, string> = {
  'from-red-900 via-slate-900 to-red-950': 'from-red-900 via-slate-900 to-red-950',
  'from-orange-900 via-slate-900 to-amber-950': 'from-orange-900 via-slate-900 to-amber-950',
  'from-blue-900 via-slate-900 to-indigo-950': 'from-blue-900 via-slate-900 to-indigo-950',
  'from-teal-900 via-slate-900 to-cyan-950': 'from-teal-900 via-slate-900 to-cyan-950',
  'from-pink-900 via-slate-900 to-rose-950': 'from-pink-900 via-slate-900 to-rose-950',
  'from-green-900 via-slate-900 to-emerald-950': 'from-green-900 via-slate-900 to-emerald-950',
  'from-yellow-900 via-slate-900 to-orange-950': 'from-yellow-900 via-slate-900 to-orange-950',
  'from-purple-900 via-slate-900 to-violet-950': 'from-purple-900 via-slate-900 to-violet-950',
  'from-cyan-900 via-slate-900 to-blue-950': 'from-cyan-900 via-slate-900 to-blue-950',
}

const COLOR_CLASSES: Record<string, string> = {
  'bg-red-50 text-red-600 border-red-200': 'bg-red-50 text-red-600 border-red-200',
  'bg-orange-50 text-orange-600 border-orange-200': 'bg-orange-50 text-orange-600 border-orange-200',
  'bg-blue-50 text-blue-600 border-blue-200': 'bg-blue-50 text-blue-600 border-blue-200',
  'bg-teal-50 text-teal-600 border-teal-200': 'bg-teal-50 text-teal-600 border-teal-200',
  'bg-pink-50 text-pink-600 border-pink-200': 'bg-pink-50 text-pink-600 border-pink-200',
  'bg-green-50 text-green-600 border-green-200': 'bg-green-50 text-green-600 border-green-200',
  'bg-yellow-50 text-yellow-600 border-yellow-200': 'bg-yellow-50 text-yellow-600 border-yellow-200',
  'bg-purple-50 text-purple-600 border-purple-200': 'bg-purple-50 text-purple-600 border-purple-200',
  'bg-cyan-50 text-cyan-600 border-cyan-200': 'bg-cyan-50 text-cyan-600 border-cyan-200',
}

export const dynamicParams = true

function loadTags() {
  try {
    const fp = path.join(process.cwd(), '..', 'data', 'mirror', 'tags.json')
    return JSON.parse(fs.readFileSync(fp, 'utf8'))
  } catch {
    return []
  }
}

export default function ApplicationsPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const tags = loadTags() as { id: number; name: string; slug: string; count: number }[]
  const isEn = lang === 'en'
  const isRu = lang === 'ru'
  const isZh = lang === 'zh'

  // Merge rich content with actual counts
  const areas = applicationAreas.map(area => {
    const tagData = tags.find(tg => tg.slug === area.slug || tg.id === area.id)
    return {
      ...area,
      count: tagData?.count || 0,
      tagName: tagData?.name || area.name.ru,
    }
  })

  const title = isRu ? 'Сферы применения' : isZh ? '应用领域' : 'Application Areas'
  const subtitle = isRu
    ? 'Профессиональные дрон-решения для различных отраслей — от развлечений до обороны'
    : isZh
    ? '从娱乐到国防，面向各行业的专业无人机解决方案'
    : 'Professional drone solutions across industries — from entertainment to defense'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900">{title}</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 md:p-12 text-white mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-blue-100 max-w-3xl">{subtitle}</p>
          <div className="flex gap-6 mt-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{areas.length}</span>
              <span className="text-sm text-blue-200">{isRu ? 'направлений' : isZh ? '个领域' : 'sectors'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{areas.reduce((s, a) => s + a.count, 0)}</span>
              <span className="text-sm text-blue-200">{isRu ? 'товаров' : isZh ? '个产品' : 'products'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Application cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {areas.map((area) => {
          const localizedName = isEn ? area.name.en : isZh ? area.name.zh : area.name.ru
          const localizedTagline = isEn ? area.tagline.en : isZh ? area.tagline.zh : area.tagline.ru
          return (
            <Link key={area.slug} href={`/${lang}/applications/${area.slug}`}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${GRADIENT_CLASSES[area.gradient] || 'from-slate-900 to-slate-950'} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 ${COLOR_CLASSES[area.color] || 'bg-gray-50 text-gray-600 border-gray-200'} border rounded-xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform`}>
                  {area.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{localizedName}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{localizedTagline}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">{area.count} {isRu ? 'товаров' : isZh ? '个产品' : 'products'}</span>
                  <span className="flex items-center gap-1 text-sm text-gray-400 group-hover:text-blue-600 transition-colors">
                    {isRu ? 'Смотреть' : isZh ? '查看' : 'Explore'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* CTA */}
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {isRu ? 'Не нашли свою отрасль?' : isZh ? '没找到您的行业？' : 'Don\'t see your industry?'}
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          {isRu
            ? 'Мы поставляем дрон-решения для любых задач — свяжитесь с нами для подбора конфигурации под ваши требования'
            : isZh
            ? '我们提供满足任何需求的无人机解决方案——联系我们，根据您的要求选择配置'
            : 'We supply drone solutions for any use case — contact us for a custom configuration tailored to your requirements'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={`/${lang}/categories`} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            {isRu ? 'Каталог' : isZh ? '浏览目录' : 'Browse Catalog'}
          </Link>
          <Link href={`/${lang}/rfq`} className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            {t(lang, 'nav.requestQuote')}
          </Link>
        </div>
      </div>
    </div>
  )
}
