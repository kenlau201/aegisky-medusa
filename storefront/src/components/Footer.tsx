import Link from 'next/link'
import { t, LanguageCode } from '@/i18n'

export default function Footer({ lang = 'en' }: { lang?: LanguageCode }) {
  return (
    <footer className="bg-slate-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <span className="text-2xl font-bold text-white">Aegisky</span>
            </div>
            <p className="text-sm text-gray-400">
              {t(lang, 'footer.description')}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t(lang, 'footer.catalog')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${lang}/categories`} className="hover:text-white transition">{t(lang, 'footer.allCategories')}</Link></li>
              <li><Link href={`/${lang}/brands`} className="hover:text-white transition">{t(lang, 'footer.allBrands')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t(lang, 'footer.service')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${lang}/pricing`} className="hover:text-white transition">{t(lang, 'nav.pricing')}</Link></li>
              <li><Link href={`/${lang}/rfq`} className="hover:text-white transition">{t(lang, 'footer.rfq')}</Link></li>
              <li><Link href={`/${lang}/supplier`} className="hover:text-white transition">{t(lang, 'footer.suppliers')}</Link></li>
              <li><Link href={`/${lang}/applications`} className="hover:text-white transition">{t(lang, 'applications.title')}</Link></li>
              <li><Link href={`/${lang}/about`} className="hover:text-white transition">{t(lang, 'footer.about')}</Link></li>
              <li><Link href={`/${lang}/contact`} className="hover:text-white transition">{t(lang, 'footer.contacts')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t(lang, 'footer.contacts')}</h3>
            <ul className="space-y-2 text-sm">
              <li>📧 sales@aegisky.com</li>
              <li>🌐 {lang === 'ru' ? 'Глобальная доставка' : lang === 'zh' ? '全球配送' : 'Worldwide Shipping'}</li>
              <li>🕐 24/7 {lang === 'ru' ? 'поддержка' : lang === 'zh' ? '客户支持' : 'Support'}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              {t(lang, 'footer.rights')}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href={`/${lang}/privacy`} className="hover:text-white transition">
                {lang === 'ru' ? 'Конфиденциальность' : lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
              </Link>
              <Link href={`/${lang}/terms`} className="hover:text-white transition">
                {lang === 'ru' ? 'Условия' : lang === 'zh' ? '服务条款' : 'Terms of Service'}
              </Link>
              <Link href={`/${lang}/contact`} className="hover:text-white transition">
                {lang === 'ru' ? 'Контакты' : lang === 'zh' ? '联系我们' : 'Contact'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
