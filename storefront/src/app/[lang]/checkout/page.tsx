'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck, Building2, MapPin, Truck, CreditCard, Check, Package, ChevronRight, Loader2, Lock, Clock, AlertCircle } from 'lucide-react'
import { t, LanguageCode } from '@/i18n'
import { useCart } from '@/lib/cart-context'
import { useCurrency } from '@/lib/currency-context'
import { useAuth } from '@/lib/auth-context'
import { COUNTRIES } from '@/lib/shipping'

interface ShippingRate {
  id: string
  carrier: string
  service: string
  serviceName: string
  rate: number
  currency: string
  transitDays: number | null
}

export default function CheckoutPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const { items, totalItems, totalPrice, clearCart } = useCart()
  const { format, currencyCode, convert } = useCurrency()
  const { user } = useAuth()

  const [step, setStep] = useState<'address' | 'shipping' | 'payment' | 'review' | 'processing' | 'complete'>('address')
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wire' | 'lc'>('stripe')
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [rateLocked, setRateLocked] = useState<{ lockedAt: string; expiresAt: string } | null>(null)

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: '',
    country: 'US',
    state: '',
    city: '',
    address: '',
    address2: '',
    zipCode: '',
  })

  // Fetch real shipping rates from EasyPost API
  const fetchShippingRates = async () => {
    setLoadingRates(true)
    setError(null)
    try {
      const response = await fetch('/api/store/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: {
            fullName: address.fullName,
            company: address.company,
            address: address.address,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
            phone: address.phone,
            email: address.email,
          },
          items: items.map(i => ({
            weight: i.product.weight || 500,
            quantity: i.quantity,
          })),
        }),
      })
      const data = await response.json()
      if (data.rates && data.rates.length > 0) {
        setShippingRates(data.rates)
      } else {
        setError('Shipping not available to selected country')
      }
    } catch (e) {
      setError('Failed to fetch shipping rates. Please try again.')
    }
    setLoadingRates(false)
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('shipping')
    fetchShippingRates()
  }

  const handleShippingSelect = (rate: ShippingRate) => {
    setSelectedShipping(rate)
    setStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('review')
  }

  // Real checkout - calls backend API
  const handlePlaceOrder = async () => {
    setProcessing(true)
    setError(null)
    setStep('processing')

    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: address.email,
          name: address.fullName,
          company: address.company,
          phone: address.phone,
          country: address.country,
          items: items.map(i => ({
            productId: String(i.product.id),
            productName: i.product.name,
            sku: i.product.sku || '',
            quantity: i.quantity,
            unitPrice: i.product.price || 0,
          })),
          currency: currencyCode,
          shippingAddress: address,
          billingAddress: address,
          notes: `Shipping: ${selectedShipping?.serviceName}`,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.message || 'Checkout failed')
      }

      // Rate is locked at checkout
      if (data.metadata?.rateSnapshot) {
        setRateLocked({
          lockedAt: data.metadata.rateSnapshot.lockedAt,
          expiresAt: data.metadata.rateSnapshot.expiresAt,
        })
      }

      setOrderComplete(data.orderNumber)
      clearCart()
      setStep('complete')
    } catch (e: any) {
      setError(e.message || 'Failed to place order')
      setStep('review')
    }
    setProcessing(false)
  }

  // Calculate totals
  const shippingCost = selectedShipping ? convert(selectedShipping.rate * 90, 'USD') : 0
  const grandTotal = totalPrice + shippingCost

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Package className="mx-auto text-gray-300 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some items before checking out</p>
        <Link href={`/${lang}`} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">Continue Shopping</Link>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="text-green-600" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Your order number:</p>
        <p className="text-2xl font-mono font-bold text-blue-600 mb-6">{orderComplete}</p>

        {/* Rate lock confirmation */}
        {rateLocked && (
          <div className="max-w-lg mx-auto mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-left">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Lock size={16} />
              <span>Exchange rate locked for 30 minutes. Your price is guaranteed in {currencyCode}.</span>
            </div>
          </div>
        )}

        {/* Payment Collection Disclosure */}
        <div className="max-w-lg mx-auto mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <div className="flex items-start gap-3">
            <Building2 className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Payment Collection Notice</p>
              <p className="text-sm text-blue-800">
                Aegisky Inc. acts as an agent and collects payment on behalf of the supplier. The actual seller of record is the supplier as indicated on your order confirmation.
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-8 text-sm">A confirmation email has been sent. You can track your order in your account.</p>
        <div className="flex gap-4 justify-center">
          <Link href={`/${lang}/account`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">View Orders</Link>
          <Link href={`/${lang}`} className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Check },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'nav.home')}</Link>
        <ChevronRight size={16} />
        <Link href={`/${lang}/cart`} className="hover:text-blue-600">{t(lang, 'cart.title')}</Link>
        <ChevronRight size={16} />
        <span className="text-gray-900">Checkout</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 max-w-2xl">
        {steps.map((s, idx) => {
          const Icon = s.icon
          const currentIdx = steps.findIndex(st => st.id === step)
          const isActive = s.id === step
          const isComplete = idx < currentIdx
          return (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isActive ? 'border-blue-600 bg-blue-50' : isComplete ? 'border-green-600 bg-green-50' : 'border-gray-200'
                }`}>
                  {isComplete ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={`w-12 sm:w-20 h-0.5 mx-2 ${isComplete ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* ADDRESS STEP */}
          {step === 'address' && (
            <form onSubmit={handleAddressSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={20} /> Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" required value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input type="text" value={address.company} onChange={e => setAddress({...address, company: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" required value={address.email} onChange={e => setAddress({...address, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="tel" required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select required value={address.country} onChange={e => setAddress({...address, country: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                  <input type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code *</label>
                  <input type="text" required value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input type="text" required value={address.address} onChange={e => setAddress({...address, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Continue to Shipping</button>
              </div>
            </form>
          )}

          {/* SHIPPING STEP - Real EasyPost rates */}
          {step === 'shipping' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Truck size={20} /> Shipping Method</h2>

              {/* Origin notice */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center gap-2">
                <Package size={16} />
                Ships from: <strong>Hong Kong Fulfillment Center</strong>
              </div>

              {loadingRates ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
                  <p className="text-gray-500">Fetching real-time shipping rates from DHL, FedEx, UPS...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
                  <p className="text-red-600 mb-4">{error}</p>
                  <button onClick={fetchShippingRates} className="text-blue-600 text-sm hover:underline">Try again</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingRates.map(rate => (
                    <label key={rate.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition">
                      <input type="radio" name="shipping" onChange={() => handleShippingSelect(rate)} className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-gray-900">{rate.carrier}</span>
                            <span className="text-gray-600 ml-2">{rate.service}</span>
                          </div>
                          <span className="font-bold text-gray-900">{format(convert(rate.rate * 90, 'USD'))}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={14} /> {rate.transitDays || '7-14'} business days</span>
                          <span className="flex items-center gap-1"><Check size={14} /> Tracking included</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <button onClick={() => setStep('address')} className="mt-4 text-blue-600 text-sm hover:underline">← Back to address</button>
            </div>
          )}

          {/* PAYMENT STEP */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment Method</h2>

              {/* Payment Collection Disclosure */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Building2 className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-amber-800">
                    <strong>Payment Collection Notice:</strong> Aegisky Inc. acts as an agent and collects payment on behalf of the supplier. The actual seller of record is the supplier as indicated on your order confirmation.
                  </p>
                </div>
              </div>

              {/* Rate lock notice */}
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-800">
                <Lock size={16} />
                <span>Your exchange rate will be locked for 30 minutes at checkout. Price guaranteed in {currencyCode}.</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition">
                  <input type="radio" name="payment" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="w-4 h-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t(lang, 'checkout.payment.stripe')}</div>
                    <div className="text-sm text-gray-500">{t(lang, 'checkout.payment.stripeDesc')}</div>
                    <div className="flex gap-2 mt-2">
                      {['Visa', 'MC', 'Amex', 'JCB'].map(c => <span key={c} className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{c}</span>)}
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition">
                  <input type="radio" name="payment" checked={paymentMethod === 'wire'} onChange={() => setPaymentMethod('wire')} className="w-4 h-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t(lang, 'checkout.payment.wire')}</div>
                    <div className="text-sm text-gray-500">{t(lang, 'checkout.payment.wireDesc')}</div>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition">
                  <input type="radio" name="payment" checked={paymentMethod === 'lc'} onChange={() => setPaymentMethod('lc')} className="w-4 h-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t(lang, 'checkout.payment.lc')}</div>
                    <div className="text-sm text-gray-500">{t(lang, 'checkout.payment.lcDesc')}</div>
                  </div>
                </label>
                {currencyCode === 'CNY' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    💡 {t(lang, 'checkout.payment.cnyNote')}
                  </div>
                )}
                {currencyCode === 'RUB' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    💡 {t(lang, 'checkout.payment.rubNote')}
                  </div>
                )}
              </div>

              {paymentMethod === 'stripe' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input type="text" placeholder="123" className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><ShieldCheck size={14} /> Secured by 256-bit SSL encryption. Test mode: use 4242 4242 4242 4242.</p>
                </div>
              )}

              {paymentMethod === 'wire' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold mb-2">{t(lang, 'checkout.payment.wireInstructions')}</p>
                  <p>{t(lang, 'checkout.payment.wireInstructionsDesc')}</p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setStep('shipping')} className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">← Back</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Review Order</button>
              </div>
            </form>
          )}

          {/* REVIEW STEP */}
          {step === 'review' && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Your Order</h2>
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><MapPin size={16} /> Shipping Address</h3>
                    <p className="text-sm text-gray-600">
                      {address.fullName} {address.company && `(${address.company})`}<br />
                      {address.address}, {address.city}, {address.state} {address.zipCode}<br />
                      {COUNTRIES.find(c => c.code === address.country)?.name}<br />
                      {address.email} | {address.phone}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><Truck size={16} /> Shipping</h3>
                    <p className="text-sm text-gray-600">{selectedShipping?.serviceName} — {selectedShipping?.transitDays || '7-14'} business days</p>
                    <p className="text-xs text-gray-400 mt-1">Ships from Hong Kong</p>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><CreditCard size={16} /> Payment</h3>
                    <p className="text-sm text-gray-600">
                      {paymentMethod === 'stripe' && 'Credit Card (Stripe) — Test mode'}
                      {paymentMethod === 'wire' && 'Wire Transfer (T/T)'}
                      {paymentMethod === 'lc' && 'Letter of Credit (L/C)'}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><Lock size={16} /> Rate Lock</h3>
                    <p className="text-sm text-green-700 bg-green-50 p-2 rounded">Exchange rate locked for 30 minutes after order placement</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><Package size={16} /> Items ({totalItems})</h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.product.id} className="flex items-center gap-3 text-sm">
                          <img src={item.product.images?.[0] || item.product.mainImage} alt="" className="w-12 h-12 object-contain bg-gray-50 rounded" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 line-clamp-1">{item.product.name}</div>
                            <div className="text-gray-500">Qty: {item.quantity} × {format(item.product.price || 0)}</div>
                          </div>
                          <div className="font-medium">{format((item.product.price || 0) * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final disclosure */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Building2 className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-blue-800">
                    By placing this order, you acknowledge that Aegisky Inc. acts as an agent collecting payment on behalf of the supplier.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">← Back</button>
                <button onClick={handlePlaceOrder} disabled={processing} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50">
                  {processing ? <><Loader2 size={20} className="animate-spin" /> Processing...</> : `Place Order — ${format(grandTotal)}`}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Order...</h2>
              <p className="text-gray-500 text-sm">Locking exchange rates and reserving inventory</p>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.images?.[0] || item.product.mainImage} alt="" className="w-14 h-14 object-contain bg-gray-50 rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap">{format((item.product.price || 0) * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{format(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{selectedShipping ? format(shippingCost) : '—'}</span>
              </div>
              {selectedShipping && (
                <div className="text-xs text-gray-400 pl-1">
                  {selectedShipping.serviceName} • {selectedShipping.transitDays || '7-14'} days
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  Currency
                  <span className="text-xs text-gray-400" title="Rate locked at checkout">ⓘ</span>
                </span>
                <span className="font-medium">{currencyCode}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total</span>
                <span className="text-blue-600">{format(grandTotal)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-green-600" />
                <span>256-bit SSL secured</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock size={14} className="text-green-600" />
                <span>Rate locked for 30 min at checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck size={14} className="text-green-600" />
                <span>DHL/FedEx/UPS worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
