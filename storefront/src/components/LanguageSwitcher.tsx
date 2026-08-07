'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { languages, LanguageCode, getPathWithoutLang } from '@/i18n'
import { useCurrency } from '@/lib/currency-context'

interface LanguageSwitcherProps {
  currentLang: LanguageCode
}

// Map language to default currency
const langToCurrency: Record<LanguageCode, string> = {
  zh: 'CNY',
  en: 'USD',
  ru: 'RUB',
  ja: 'JPY',
  de: 'EUR',
  pl: 'PLN',
  ar: 'AED',
  ur: 'PKR',
  id: 'IDR',
  kk: 'KZT',
  da: 'DKK',
  sr: 'RSD',
  fr: 'EUR',
  es: 'EUR',
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { setCurrency } = useCurrency()

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-set currency based on current language on mount and when language changes
  useEffect(() => {
    const targetCurrency = langToCurrency[currentLang]
    if (targetCurrency) {
      setCurrency(targetCurrency)
    }
  }, [currentLang, setCurrency])

  const switchLanguage = (langCode: LanguageCode) => {
    const pathWithoutLang = getPathWithoutLang(pathname)
    const newPath = `/${langCode}${pathWithoutLang === '/' ? '' : pathWithoutLang}`
    setIsOpen(false)
    // Switch currency to match language
    const targetCurrency = langToCurrency[langCode]
    if (targetCurrency) {
      setCurrency(targetCurrency)
    }
    router.push(newPath)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition ${
                lang.code === currentLang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div>
                <div className="font-medium text-sm">{lang.nativeName}</div>
                <div className="text-xs text-gray-500">{lang.name}</div>
              </div>
              {lang.code === currentLang && (
                <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
