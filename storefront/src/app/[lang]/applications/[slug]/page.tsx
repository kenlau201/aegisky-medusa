import { Suspense } from 'react'
import ApplicationContent from './ApplicationContent'
import { LanguageCode } from '@/i18n'

export const dynamicParams = true

export default function ApplicationDetailPage({ params: { lang, slug } }: { params: { lang: LanguageCode; slug: string } }) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">Loading...</div>
    }>
      <ApplicationContent lang={lang} slug={slug} />
    </Suspense>
  )
}
