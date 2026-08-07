'use client'

import Link from 'next/link'
import { ChevronRight, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useCurrency } from '@/lib/currency-context'
import { t, LanguageCode } from '@/i18n'

export default function CartPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const { format } = useCurrency()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
          <ChevronRight size={16} />
          <span className="text-gray-900">{t(lang, 'cart.title')}</span>
        </nav>
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-gray-400" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t(lang, 'cart.empty')}</h1>
          <p className="text-gray-500 mb-8">{t(lang, 'cart.emptyDesc')}</p>
          <Link href={`/${lang}/categories`} className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            {t(lang, 'cart.continueShopping')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        <ChevronRight size={16} />
        <span className="text-gray-900">{t(lang, 'cart.title')}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{t(lang, 'cart.title')} ({totalItems})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
              <Link href={`/${lang}/product/${item.product.slug}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.product.images?.[0] || item.product.mainImage || '/placeholder.svg'}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/${lang}/product/${item.product.slug}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                  {item.product.name}
                </Link>
                {item.product.brands?.[0] && (
                  <div className="text-sm text-gray-500 mt-1">{item.product.brands[0].name}</div>
                )}
                <div className="text-sm text-gray-500 mt-1">SKU: {item.product.sku}</div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{format((item.product.price || 0) * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 transition p-1"
                      title={t(lang, 'cart.remove')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Link href={`/${lang}/categories`} className="text-blue-600 hover:text-blue-700 font-medium">
              ← {t(lang, 'cart.continueShopping')}
            </Link>
            <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-medium">
              {t(lang, 'cart.clearCart')}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(lang, 'cart.subtotal')}</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>{t(lang, 'cart.total')} ({totalItems} {t(lang, 'applications.products')})</span>
                <span>{format(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t(lang, 'product.shipping')}</span>
                <span className="text-green-600">{t(lang, 'product.onRequest')}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>{t(lang, 'cart.total')}</span>
                <span>{format(totalPrice)}</span>
              </div>
            </div>
            <Link
              href={`/${lang}/checkout`}
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition mb-2"
            >
              {lang === 'ru' ? 'Быстрый заказ' : lang === 'zh' ? '立即结账' : 'Checkout Now'}
            </Link>
            <Link
              href={`/${lang}/rfq`}
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {lang === 'ru' ? 'Запросить КП' : lang === 'zh' ? '询价报价' : 'Request Quote'}
            </Link>
            <p className="text-xs text-gray-500 text-center mt-4">
              {lang === 'ru' ? 'Оплата картой или через запрос цены' : lang === 'zh' ? '支持信用卡支付或询价' : 'Pay by card or request a quote'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
