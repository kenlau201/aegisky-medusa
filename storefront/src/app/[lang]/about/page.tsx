import Link from 'next/link'
import { ChevronRight, ShieldCheck, Globe, Headphones, BadgeDollarSign } from 'lucide-react'
import { t, LanguageCode } from '@/i18n'

export const dynamicParams = true

export default function AboutPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const features = [
    { icon: ShieldCheck, titleKey: 'whyUs1Title', descKey: 'whyUs1Desc' },
    { icon: Globe, titleKey: 'whyUs2Title', descKey: 'whyUs2Desc' },
    { icon: Headphones, titleKey: 'whyUs3Title', descKey: 'whyUs3Desc' },
    { icon: BadgeDollarSign, titleKey: 'whyUs4Title', descKey: 'whyUs4Desc' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        <ChevronRight size={16} />
        <span className="text-gray-900">{t(lang, 'about.title')}</span>
      </nav>

      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 md:p-12 text-white mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t(lang, 'about.title')}</h1>
        <p className="text-lg text-blue-100 max-w-3xl">{t(lang, 'about.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t(lang, 'about.mission')}</h2>
          <p className="text-gray-600 leading-relaxed">{t(lang, 'about.missionText')}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{t(lang, 'about.foundedValue')}</div>
            <div className="text-sm text-gray-600 mt-1">{t(lang, 'about.founded')}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{t(lang, 'about.countriesValue')}</div>
            <div className="text-sm text-gray-600 mt-1">{t(lang, 'about.countries')}</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{t(lang, 'about.productsValue')}</div>
            <div className="text-sm text-gray-600 mt-1">{t(lang, 'about.products')}</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{t(lang, 'about.brandsValue')}</div>
            <div className="text-sm text-gray-600 mt-1">{t(lang, 'about.brands')}</div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t(lang, 'about.whyUs')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t(lang, `about.${f.titleKey}`)}</h3>
                <p className="text-sm text-gray-500">{t(lang, `about.${f.descKey}`)}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to work with us?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Browse our catalog or contact our team for a custom quote.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={`/${lang}/categories`} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">{t(lang, 'home.catalogButton')}</Link>
          <Link href={`/${lang}/contact`} className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">{t(lang, 'contact.title')}</Link>
        </div>
      </div>
    </div>
  )
}
