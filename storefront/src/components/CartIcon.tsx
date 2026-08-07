'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { t, LanguageCode } from '@/i18n'

export default function CartIcon({ lang }: { lang: LanguageCode }) {
  const { totalItems } = useCart()

  return (
    <Link href={`/${lang}/cart`} className="relative p-2 hover:bg-gray-100 rounded-lg transition" title={t(lang, 'nav.cart')}>
      <ShoppingCart size={22} className="text-gray-700" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  )
}
