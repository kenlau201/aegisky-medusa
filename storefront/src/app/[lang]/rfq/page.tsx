'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronRight, Check, FileText, Clock, Shield, Mail, Package, Globe, Calendar, DollarSign } from 'lucide-react'
import { t, LanguageCode } from '@/i18n'
import { useRFQ } from '@/lib/rfq-context'
import { useAuth } from '@/lib/auth-context'
import { useCurrency } from '@/lib/currency-context'
import ComplianceBanner from '@/components/ComplianceBanner'

export default function RFQPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const searchParams = useSearchParams()
  const prefillProduct = searchParams.get('product') || ''
  const prefillSku = searchParams.get('sku') || ''

  const { createRFQ } = useRFQ()
  const { user } = useAuth()
  const { currencyCode } = useCurrency()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phone || '',
    product: prefillProduct,
    sku: prefillSku,
    quantity: '',
    targetPrice: '',
    currency: currencyCode,
    deliveryDate: '',
    incoterms: 'FOB',
    destinationCountry: user?.country || '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [rfqId, setRfqId] = useState('')

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        company: user.company || prev.company,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        destinationCountry: user.country || prev.destinationCountry,
      }))
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const rfq = createRFQ({
      userId: user?.id,
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      items: [{
        productName: formData.product,
        sku: formData.sku,
        quantity: parseInt(formData.quantity) || 1,
        specifications: formData.message,
      }],
      targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
      currency: formData.currency,
      deliveryDate: formData.deliveryDate,
      incoterms: formData.incoterms,
      destinationCountry: formData.destinationCountry,
      message: formData.message,
    })
    setRfqId(rfq.id)
    setSubmitted(true)
  }

  const benefits = [
    { icon: FileText, title: lang === 'ru' ? 'Индивидуальное предложение' : lang === 'zh' ? '定制报价' : 'Custom Quote', desc: lang === 'ru' ? 'Цены под ваши объёмы' : lang === 'zh' ? '根据您的数量定价' : 'Pricing based on your volume' },
    { icon: Clock, title: lang === 'ru' ? 'Ответ за 24 часа' : lang === 'zh' ? '24小时内回复' : 'Response in 24h', desc: lang === 'ru' ? 'Работаем по будням' : lang === 'zh' ? '工作日回复' : 'Business days' },
    { icon: Shield, title: lang === 'ru' ? 'Гарантия качества' : lang === 'zh' ? '质量保证' : 'Quality Guaranteed', desc: lang === 'ru' ? 'Только оригинальная продукция' : lang === 'zh' ? '正品保证' : 'Authentic products only' },
    { icon: Mail, title: lang === 'ru' ? 'Прямой контакт' : lang === 'zh' ? '直接联系' : 'Direct Contact', desc: lang === 'ru' ? 'Менеджер свяжется с вами' : lang === 'zh' ? '专属经理对接' : 'Dedicated manager' },
  ]

  const incotermsOptions = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        <ChevronRight size={16} />
        <span className="text-gray-900">{t(lang, 'rfq.title')}</span>
      </nav>

      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-6 md:p-12 text-white mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{t(lang, 'rfq.title')}</h1>
        <p className="text-base md:text-lg text-blue-100 max-w-3xl">{t(lang, 'rfq.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="text-green-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {lang === 'ru' ? 'Запрос отправлен!' : lang === 'zh' ? '询价已提交!' : 'RFQ Submitted!'}
                </h2>
                <p className="text-gray-600 max-w-md mx-auto mb-2">
                  {lang === 'ru'
                    ? 'Спасибо! Наш менеджер свяжется с вами в течение 24 часов.'
                    : lang === 'zh'
                    ? '感谢您的询价！我们将在24小时内与您联系。'
                    : 'Thank you! Our team will contact you within 24 hours.'}
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  RFQ ID: <span className="font-mono font-medium">{rfqId}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href={`/${lang}/account`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                    {lang === 'ru' ? 'Мои запросы' : lang === 'zh' ? '我的询价' : 'View My RFQs'}
                  </Link>
                  <Link href={`/${lang}`} className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                    {lang === 'ru' ? 'На главную' : lang === 'zh' ? '返回首页' : 'Back to Home'}
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail size={20} className="text-blue-600" />
                    {lang === 'ru' ? 'Контактная информация' : lang === 'zh' ? '联系信息' : 'Contact Information'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'rfq.name')} *</label>
                      <input
                        type="text" required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'rfq.company')}</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'rfq.email')} *</label>
                      <input
                        type="email" required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'rfq.phone')}</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={20} className="text-blue-600" />
                    {lang === 'ru' ? 'Информация о товаре' : lang === 'zh' ? '产品信息' : 'Product Details'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'rfq.product')} *</label>
                      <input
                        type="text" required
                        value={formData.product}
                        onChange={(e) => setFormData({...formData, product: e.target.value})}
                        placeholder={lang === 'ru' ? 'SKU, название или описание' : lang === 'zh' ? 'SKU、名称或描述' : 'SKU, name or description'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'rfq.quantity')}</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                          placeholder="e.g. 100"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <DollarSign size={14} />
                          {lang === 'ru' ? 'Целевая цена' : lang === 'zh' ? '目标价格' : 'Target Price'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.targetPrice}
                          onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
                          placeholder={lang === 'ru' ? 'Необязательно' : 'Optional'}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" />
                    {lang === 'ru' ? 'Доставка' : lang === 'zh' ? '物流信息' : 'Shipping'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Incoterms</label>
                      <select
                        value={formData.incoterms}
                        onChange={(e) => setFormData({...formData, incoterms: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                      >
                        {incotermsOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Calendar size={14} />
                        {lang === 'ru' ? 'Желаемая дата' : lang === 'zh' ? '期望日期' : 'Desired Date'}
                      </label>
                      <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {lang === 'ru' ? 'Страна назначения' : lang === 'zh' ? '目的国' : 'Destination'}
                      </label>
                      <input
                        type="text"
                        value={formData.destinationCountry}
                        onChange={(e) => setFormData({...formData, destinationCountry: e.target.value})}
                        placeholder={lang === 'ru' ? 'Страна' : 'Country'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'rfq.message')}</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder={lang === 'ru' ? 'Технические требования, сертификаты, упаковка...' : lang === 'zh' ? '技术要求、认证、包装...' : 'Technical requirements, certifications, packaging...'}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  />
                </div>

                {/* Compliance check */}
                {formData.destinationCountry && formData.product && (
                  <ComplianceBanner
                    product={{ name: formData.product, slug: '', id: 0, sku: formData.sku } as any}
                    destinationCountry={formData.destinationCountry}
                    endUse={formData.message}
                    lang={lang}
                  />
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
                >
                  {t(lang, 'rfq.submit')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          {/* Process Steps */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {lang === 'ru' ? 'Как это работает' : lang === 'zh' ? '流程' : 'How It Works'}
            </h3>
            <div className="space-y-4">
              {[
                { num: '1', text: lang === 'ru' ? 'Отправьте запрос' : lang === 'zh' ? '提交询价' : 'Submit RFQ' },
                { num: '2', text: lang === 'ru' ? 'Получите предложения' : lang === 'zh' ? '收到报价' : 'Get Quotes' },
                { num: '3', text: lang === 'ru' ? 'Сравните и выберите' : lang === 'zh' ? '比较选择' : 'Compare & Choose' },
                { num: '4', text: lang === 'ru' ? 'Безопасная сделка' : lang === 'zh' ? '安全交易' : 'Secure Trade' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <span className="text-sm text-gray-700 pt-1">{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          {benefits.map((b, i) => {
            const Icon = b.icon
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="text-blue-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{b.title}</h3>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
