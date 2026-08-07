import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, Building2, Zap, Globe, Shield, Headphones, FileText, Users, TrendingUp, Package } from 'lucide-react'
import { LanguageCode } from '@/i18n'

export const metadata: Metadata = {
  title: 'Pricing & Plans',
  description: 'Choose the right plan for your business. Free, Professional, Enterprise tiers for drone B2B sourcing.',
}

const plans = [
  {
    id: 'free',
    name: 'Free Buyer',
    nameZh: '免费采购',
    nameRu: 'Бесплатный',
    price: { monthly: 0, yearly: 0 },
    description: {
      en: 'Start sourcing drone components',
      zh: '开始采购无人机配件',
      ru: 'Начните закупки',
    },
    icon: Package,
    color: 'gray',
    popular: false,
    features: [
      { en: 'Browse 6,300+ products', zh: '浏览6,300+商品', ru: '6,300+ товаров', included: true },
      { en: 'Basic search & filters', zh: '基础搜索筛选', ru: 'Базовый поиск', included: true },
      { en: 'RFQ submissions (3/month)', zh: '每月3次询价', ru: '3 RFQ в месяц', included: true },
      { en: 'Standard shipping rates', zh: '标准运费', ru: 'Стандартная доставка', included: true },
      { en: 'Email support', zh: '邮件支持', ru: 'Email поддержка', included: true },
      { en: 'Bulk pricing access', zh: '批量价格', ru: 'Оптовые цены', included: false },
      { en: 'Dedicated account manager', zh: '专属客户经理', ru: 'Персональный менеджер', included: false },
      { en: 'API access', zh: 'API访问', ru: 'API доступ', included: false },
    ],
    cta: { en: 'Get Started', zh: '免费开始', ru: 'Начать' },
  },
  {
    id: 'professional',
    name: 'Professional',
    nameZh: '专业版',
    nameRu: 'Профессиональный',
    price: { monthly: 199, yearly: 1990 },
    description: {
      en: 'For growing drone businesses',
      zh: '适用于成长型无人机企业',
      ru: 'Для растущего бизнеса',
    },
    icon: Zap,
    color: 'blue',
    popular: true,
    features: [
      { en: 'Everything in Free', zh: '包含免费版全部功能', ru: 'Всё из Free', included: true },
      { en: 'Unlimited RFQs', zh: '无限询价', ru: 'Безлимитные RFQ', included: true },
      { en: 'Bulk & tiered pricing', zh: '批量阶梯价格', ru: 'Оптовые цены', included: true },
      { en: 'Sample ordering', zh: '样品订购', ru: 'Заказ образцов', included: true },
      { en: 'Priority shipping rates', zh: '优先运费折扣', ru: 'Приоритетная доставка', included: true },
      { en: 'Compliance documents', zh: '合规文件下载', ru: 'Документы соответствия', included: true },
      { en: 'Order tracking', zh: '订单追踪', ru: 'Отслеживание заказов', included: true },
      { en: 'Priority support (24h)', zh: '优先支持(24小时)', ru: 'Поддержка 24ч', included: true },
    ],
    cta: { en: 'Start Free Trial', zh: '开始免费试用', ru: 'Попробовать' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameZh: '企业版',
    nameRu: 'Корпоративный',
    price: { monthly: 499, yearly: 4990 },
    description: {
      en: 'For large-scale operations',
      zh: '适用于大规模运营',
      ru: 'Для крупных операций',
    },
    icon: Building2,
    color: 'slate',
    popular: false,
    features: [
      { en: 'Everything in Professional', zh: '包含专业版全部功能', ru: 'Всё из Professional', included: true },
      { en: 'Dedicated account manager', zh: '专属客户经理', ru: 'Персональный менеджер', included: true },
      { en: 'Custom pricing & contracts', zh: '定制价格合同', ru: 'Индивидуальные цены', included: true },
      { en: 'API access & EDI integration', zh: 'API与EDI集成', ru: 'API и EDI', included: true },
      { en: 'White-label options', zh: '白标方案', ru: 'White-label', included: true },
      { en: 'Volume discounts (10%+)', zh: '大额折扣(10%+)', ru: 'Скидки от 10%', included: true },
      { en: 'Warehousing & fulfillment', zh: '仓储与代发', ru: 'Склад и фулфилмент', included: true },
      { en: 'SLA guarantee (99.9%)', zh: 'SLA保障(99.9%)', ru: 'SLA 99.9%', included: true },
    ],
    cta: { en: 'Contact Sales', zh: '联系销售', ru: 'Связаться' },
  },
]

const addons = [
  {
    icon: Globe,
    name: { en: 'Global Compliance Package', zh: '全球合规包', ru: 'Комплаенс пакет' },
    price: '$99/mo',
    desc: { en: 'FCC/CE/UL docs, ECCN classification, HS codes', zh: 'FCC/CE/UL文件、ECCN分类、HS编码', ru: 'Документы FCC/CE/UL, ECCN, HS' },
  },
  {
    icon: TrendingUp,
    name: { en: 'Market Intelligence', zh: '市场情报', ru: 'Аналитика рынка' },
    price: '$149/mo',
    desc: { en: 'Price trends, supply chain alerts, competitor data', zh: '价格趋势、供应链预警、竞品数据', ru: 'Тренды цен, алерты, конкуренты' },
  },
  {
    icon: Shield,
    name: { en: 'Quality Inspection', zh: '质检服务', ru: 'Контроль качества' },
    price: 'From $49/order',
    desc: { en: 'Pre-shipment inspection, test reports, photo verification', zh: '发货前检验、测试报告、照片验证', ru: 'Инспекция, отчёты, фото' },
  },
  {
    icon: Headphones,
    name: { en: 'Concierge Sourcing', zh: '代采购服务', ru: 'Консьерж закупки' },
    price: '5% of order',
    desc: { en: 'We source, negotiate, QC, and ship for you', zh: '我们帮您寻源、谈判、质检、发货', ru: 'Поиск, переговоры, КК, доставка' },
  },
]

export default function PricingPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const isZh = lang === 'zh'
  const isRu = lang === 'ru'

  const getText = (obj: { en: string; zh: string; ru: string }) => {
    if (isZh) return obj.zh
    if (isRu) return obj.ru
    return obj.en
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {isZh ? '简单透明的定价' : isRu ? 'Простые и прозрачные тарифы' : 'Simple, Transparent Pricing'}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {isZh
              ? '从免费采购到企业级供应链解决方案，选择适合您业务规模的方案'
              : isRu
              ? 'От бесплатных закупок до корпоративных решений — выберите подходящий тариф'
              : 'From free sourcing to enterprise supply chain solutions — choose the plan that scales with your business.'}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 bg-slate-700/50 rounded-full px-4 py-2 text-sm">
            <FileText size={16} className="text-green-400" />
            {isZh ? '所有方案均包含14天免费试用' : isRu ? 'Все тарифы включают 14-дневный триал' : 'All plans include a 14-day free trial'}
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isPopular = plan.popular
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  isPopular ? 'ring-2 ring-blue-600 scale-105 z-10' : 'border border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="bg-blue-600 text-white text-center py-1.5 text-sm font-semibold">
                    {isZh ? '最受欢迎' : isRu ? 'Популярный' : 'Most Popular'}
                  </div>
                )}
                <div className="p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      plan.color === 'slate' ? 'bg-slate-100 text-slate-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {isZh ? plan.nameZh : isRu ? plan.nameRu : plan.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-6">{getText(plan.description)}</p>

                  <div className="mb-6">
                    {plan.price.monthly === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">
                        {isZh ? '免费' : isRu ? 'Бесплатно' : 'Free'}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">${plan.price.monthly}</span>
                        <span className="text-gray-500">/{isZh ? '月' : isRu ? 'мес' : 'mo'}</span>
                      </div>
                    )}
                    {plan.price.yearly > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        {isZh ? `年付 $${plan.price.yearly}（省$${plan.price.monthly * 12 - plan.price.yearly}）` : isRu ? `Годовой: $${plan.price.yearly} (экономия $${plan.price.monthly * 12 - plan.price.yearly})` : `Billed yearly: $${plan.price.yearly} (save $${plan.price.monthly * 12 - plan.price.yearly})`}
                      </div>
                    )}
                  </div>

                  <Link
                    href={plan.id === 'enterprise' ? `/${lang}/contact` : `/${lang}/register?plan=${plan.id}`}
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition mb-6 ${
                      isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : plan.id === 'enterprise'
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                    }`}
                  >
                    {getText(plan.cta)}
                  </Link>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check size={18} className="text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <X size={18} className="text-gray-300 mt-0.5 shrink-0" />
                        )}
                        <span className={feature.included ? 'text-gray-700 text-sm' : 'text-gray-400 text-sm line-through'}>
                          {getText({ en: feature.en, zh: feature.zh, ru: feature.ru })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add-ons */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {isZh ? '增值服务' : isRu ? 'Дополнительные услуги' : 'Add-on Services'}
          </h2>
          <p className="text-center text-gray-500 mb-10">
            {isZh ? '按需添加专业服务，助力您的业务增长' : isRu ? 'Добавьте профессиональные услуги по мере необходимости' : 'Add professional services as your business needs grow.'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {addons.map((addon, i) => {
              const Icon = addon.icon
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
                  <Icon size={28} className="text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">{getText(addon.name)}</h3>
                  <div className="text-blue-600 font-bold text-lg mb-2">{addon.price}</div>
                  <p className="text-sm text-gray-500">{getText(addon.desc)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            {isZh ? '常见问题' : isRu ? 'Частые вопросы' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: { en: 'Can I switch plans at any time?', zh: '我可以随时更换方案吗？', ru: 'Можно ли менять тариф?' },
                a: { en: 'Yes, you can upgrade or downgrade at any time. Changes take effect immediately with prorated billing.', zh: '是的，您可以随时升级或降级。变更立即生效，按比例计费。', ru: 'Да, вы можете менять тариф в любое время.' },
              },
              {
                q: { en: 'What payment methods are accepted?', zh: '支持哪些支付方式？', ru: 'Какие способы оплаты?' },
                a: { en: 'We accept all major credit cards, PayPal, wire transfer for Enterprise, and letters of credit for large orders.', zh: '我们支持主流信用卡、PayPal、企业版电汇、大额订单信用证。', ru: 'Карты, PayPal, банковский перевод для Enterprise.' },
              },
              {
                q: { en: 'Is there a setup fee?', zh: '有设置费吗？', ru: 'Есть ли плата за настройку?' },
                a: { en: 'No setup fees. No long-term contracts. All plans are month-to-month unless you choose annual billing.', zh: '无设置费，无长期合同。所有方案均为按月付费，也可选择年付。', ru: 'Нет платы за настройку. Без долгосрочных контрактов.' },
              },
              {
                q: { en: 'Do you offer custom enterprise solutions?', zh: '提供定制企业方案吗？', ru: 'Есть ли кастомные решения?' },
                a: { en: 'Yes. Enterprise customers get custom integrations, dedicated infrastructure, volume pricing, and SLA guarantees. Contact our sales team.', zh: '是的。企业客户可获得定制集成、专属基础设施、批量价格和SLA保障。请联系销售团队。', ru: 'Да. Enterprise-клиенты получают кастомные интеграции, SLA и индивидуальные цены.' },
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{getText(faq.q)}</h3>
                <p className="text-gray-600 text-sm">{getText(faq.a)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {isZh ? '准备好升级您的无人机供应链了吗？' : isRu ? 'Готовы модернизировать цепочку поставок?' : 'Ready to upgrade your drone supply chain?'}
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            {isZh
              ? '加入100+国家的数千家企业，通过Aegisky采购无人机及配件'
              : isRu
              ? 'Присоединяйтесь к тысячам компаний из 100+ стран, закупающих дроны через Aegisky'
              : 'Join thousands of businesses across 100+ countries sourcing drones and components through Aegisky.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${lang}/register`} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              {isZh ? '免费开始' : isRu ? 'Начать бесплатно' : 'Start for Free'}
            </Link>
            <Link href={`/${lang}/contact`} className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              {isZh ? '联系销售' : isRu ? 'Связаться с продажами' : 'Contact Sales'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
