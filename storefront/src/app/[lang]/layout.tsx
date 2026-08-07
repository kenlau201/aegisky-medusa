import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompareBar from '@/components/CompareBar'
import ClientProviders from '@/components/ClientProviders'
import SentryInit from '@/components/SentryInit'
import CookieConsent from '@/components/CookieConsent'
import { languages, LanguageCode } from '@/i18n'
import { ensureDataLoaded } from '@/lib/data'

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang: lang.code }))
}

// Get language direction
function getDirection(lang: LanguageCode): 'ltr' | 'rtl' {
  const langConfig = languages.find(l => l.code === lang)
  return langConfig?.rtl ? 'rtl' : 'ltr'
}

// Generate hreflang alternates for SEO
function getHreflangAlternates(path: string = '') {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aegisky.com'
  const alternates: Record<string, string> = {}
  languages.forEach(lang => {
    alternates[lang.code] = `${baseUrl}/${lang.code}${path}`
  })
  alternates['x-default'] = `${baseUrl}/en${path}`
  return alternates
}

export async function generateMetadata({ params }: { params: { lang: LanguageCode } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    en: 'Aegisky - International B2B Drone & UAV Supply Chain Platform',
    ru: 'Aegisky - Международная B2B платформа для дронов и БПЛА',
    zh: 'Aegisky - 国际无人机B2B供应链平台',
    ar: 'إيجيسكي - منصة B2B دولية لطائرات بدون طيار',
  }

  const descriptions: Record<string, string> = {
    en: '6384+ products, 438+ brands. FPV drones, industrial UAVs, LiDAR, components. Global shipping, B2B pricing.',
    ru: '6384+ товаров, 438+ брендов. FPV дроны, промышленные БПЛА, лидары, комплектующие.',
    zh: '6384+产品，438+品牌。FPV无人机、工业无人机、激光雷达、零部件。全球配送，B2B定价。',
    ar: 'أكثر من 6384 منتج و438 علامة تجارية. طائرات FPV وطائرات بدون طيار صناعية ومكونات.',
  }

  return {
    title: titles[params.lang] || titles.en,
    description: descriptions[params.lang] || descriptions.en,
    alternates: {
      canonical: `/${params.lang}`,
      languages: getHreflangAlternates(),
    },
    openGraph: {
      title: titles[params.lang] || titles.en,
      description: descriptions[params.lang] || descriptions.en,
      type: 'website',
      locale: params.lang,
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Aegisky',
    },
  }
}

export default async function LangLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: LanguageCode }
}) {
  await ensureDataLoaded()

  const dir = getDirection(lang)

  return (
    <ClientProviders>
      <SentryInit />
      <div className="min-h-screen flex flex-col" lang={lang} dir={dir}>
        <Header lang={lang} />
        <main className="flex-1">
          {children}
        </main>
        <Footer lang={lang} />
        <CompareBar lang={lang} />
        <CookieConsent lang={lang} />
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function(){}); }); }`
        }}
      />
    </ClientProviders>
  )
}
