'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'
import { LanguageCode, t } from '@/i18n'

const COOKIE_CONSENT_KEY = 'aegisky_cookie_consent'

export default function CookieConsent({ lang }: { lang: LanguageCode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Show after short delay
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }))
    setVisible(false)
  }

  const acceptNecessary = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
          <div className="text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-1">Cookie Consent</p>
            <p>
              We use cookies to ensure the platform works correctly, analyze traffic, and improve your experience.
              By clicking "Accept All", you consent to our use of cookies. See our{' '}
              <Link href={`/${lang}/legal/privacy`} className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={acceptNecessary}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Necessary Only
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Accept All
          </button>
        </div>
        <button
          onClick={acceptNecessary}
          className="absolute top-2 right-2 sm:hidden text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
