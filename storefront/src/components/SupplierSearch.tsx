'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon } from './SolutionIcons'
import { LanguageCode } from '@/i18n'

export default function SupplierSearch({ lang }: { lang: LanguageCode }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/${lang}/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        <SearchIcon className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={lang === 'ru' ? 'Что вы ищете?' : lang === 'zh' ? '您在找什么？' : 'What are you looking for?'}
        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
      />
    </form>
  )
}
