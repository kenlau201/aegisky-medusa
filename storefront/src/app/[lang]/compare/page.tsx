import { Suspense } from 'react'
import ComparePageClient from './ComparePageClient'
import { LanguageCode } from '@/i18n'

export const dynamic = 'force-dynamic'

export default function ComparePage({ params }: { params: { lang: LanguageCode } }) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <ComparePageClient lang={params.lang} />
    </Suspense>
  )
}
