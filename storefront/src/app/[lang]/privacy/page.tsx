import Link from 'next/link'
import { ChevronRight, Shield } from 'lucide-react'
import { LanguageCode } from '@/i18n'

export const dynamicParams = true

export default function PrivacyPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const isZh = lang === 'zh'
  const isRu = lang === 'ru'

  const sections = isZh ? [
    { title: '1. 信息收集', content: '我们收集您在注册账户、下单、提交RFQ或使用我们服务时提供的信息，包括但不限于：姓名、电子邮件地址、公司名称、电话号码、送货地址和支付信息。我们还自动收集设备信息、IP地址、浏览器类型和访问日志。' },
    { title: '2. 信息使用', content: '我们使用收集的信息来：处理交易和订单、提供客户支持、发送订单更新和营销通讯（您可随时退订）、改进我们的网站和服务、防止欺诈和非法活动、遵守法律义务。' },
    { title: '3. 信息共享', content: '我们不会出售您的个人信息。我们可能在以下情况下共享信息：与完成交易所需的服务提供商（支付处理商、物流公司）共享；应法律要求或保护我们的权利；与我们的关联公司和受信任的合作伙伴共享，且受保密协议约束。' },
    { title: '4. 数据安全', content: '我们采用AES-256加密存储敏感数据，使用SSL/TLS加密传输中的数据，实施访问控制和定期安全审计。支付信息由符合PCI-DSS标准的第三方支付处理商处理，我们不存储您的完整信用卡信息。' },
    { title: '5. Cookie政策', content: '我们使用Cookie和类似技术来：维持您的登录状态、记住您的偏好设置（语言、货币）、分析网站流量和使用情况、提供个性化内容。您可以通过浏览器设置管理Cookie，但这可能影响网站功能。' },
    { title: '6. 您的权利（GDPR/CCPA）', content: '根据适用的数据保护法律，您有权：访问我们持有的关于您的个人数据；更正不准确的数据；请求删除您的数据（"被遗忘权"）；限制或反对数据处理；数据可携性；撤回同意。如需行使这些权利，请联系privacy@aegisky.com。' },
    { title: '7. 数据保留', content: '我们在您的账户活跃期间保留您的个人数据，并在法律要求或合法商业目的需要的期限内保留。交易记录保留至少7年以满足税务和会计要求。' },
    { title: '8. 国际数据传输', content: '您的信息可能被传输到您所在国家以外的服务器，这些国家可能有不同的数据保护法律。我们采取适当措施确保此类传输符合适用法律。' },
    { title: '9. 儿童隐私', content: '我们的服务不面向16岁以下的儿童。我们不会故意收集儿童的个人信息。如果您认为我们可能收集了儿童信息，请联系我们。' },
    { title: '10. 联系我们', content: '如有任何隐私问题或请求，请联系：privacy@aegisky.com。我们将在30天内回复您的请求。' },
  ] : isRu ? [
    { title: '1. Сбор информации', content: 'Мы собираем информацию, которую вы предоставляете при регистрации, размещении заказов, отправке RFQ или использовании наших услуг, включая: имя, email, название компании, телефон, адрес доставки и платежную информацию. Мы также автоматически собираем информацию об устройстве, IP-адресе, типе браузера и журналах доступа.' },
    { title: '2. Использование информации', content: 'Мы используем собранную информацию для: обработки транзакций и заказов, предоставления поддержки клиентам, отправки обновлений заказов и маркетинговых сообщений (вы можете отписаться), улучшения нашего сайта и услуг, предотвращения мошенничества, соблюдения юридических обязательств.' },
    { title: '3. Обмен информацией', content: 'Мы не продаем вашу личную информацию. Мы можем делиться информацией с: поставщиками услуг, необходимыми для完成 транзакций (платежные системы, логистика); по требованию закона; с нашими аффилированными лицами и доверенными партнерами по соглашениям о конфиденциальности.' },
    { title: '4. Безопасность данных', content: 'Мы используем шифрование AES-256 для хранения конфиденциальных данных, SSL/TLS для передачи данных, контроль доступа и регулярные аудиты безопасности. Платежная информация обрабатывается PCI-DSS сертифицированными процессорами.' },
    { title: '5. Политика Cookie', content: 'Мы используем Cookie для: поддержания вашей сессии входа, запоминания настроек (язык, валюта), анализа трафика, предоставления персонализированного контента. Вы можете управлять Cookie через настройки браузера.' },
    { title: '6. Ваши права (GDPR/CCPA)', content: 'Согласно применимому законодательству, вы имеете право: доступ к вашим данным, исправление неточных данных, удаление данных, ограничение обработки, переносимость данных, отзыв согласия. Для этого свяжитесь с privacy@aegisky.com.' },
    { title: '7. Хранение данных', content: 'Мы храним ваши личные данные в течение активности вашей учетной записи и в течение срока, требуемого законом. Записи о транзакциях хранятся не менее 7 лет для налоговых целей.' },
    { title: '8. Международная передача', content: 'Ваша информация может передаваться на серверы за пределами вашей страны. Мы принимаем соответствующие меры для обеспечения защиты данных.' },
    { title: '9. Конфиденциальность детей', content: 'Наши услуги не предназначены для лиц младше 16 лет. Мы сознательно не собираем информацию о детях.' },
    { title: '10. Свяжитесь с нами', content: 'По вопросам конфиденциальности: privacy@aegisky.com. Мы ответим в течение 30 дней.' },
  ] : [
    { title: '1. Information We Collect', content: 'We collect information you provide when registering, placing orders, submitting RFQs, or using our services, including but not limited to: name, email address, company name, phone number, shipping address, and payment information. We also automatically collect device information, IP address, browser type, and access logs.' },
    { title: '2. How We Use Your Information', content: 'We use collected information to: process transactions and orders, provide customer support, send order updates and marketing communications (you may opt out at any time), improve our website and services, prevent fraud and illegal activities, and comply with legal obligations.' },
    { title: '3. Information Sharing', content: 'We do not sell your personal information. We may share information with: service providers necessary to complete transactions (payment processors, logistics companies); when required by law or to protect our rights; with our affiliates and trusted partners under confidentiality agreements.' },
    { title: '4. Data Security', content: 'We employ AES-256 encryption for sensitive data storage, SSL/TLS encryption for data in transit, access controls, and regular security audits. Payment information is processed by PCI-DSS compliant third-party payment processors; we do not store your full credit card details.' },
    { title: '5. Cookie Policy', content: 'We use cookies and similar technologies to: maintain your login session, remember your preferences (language, currency), analyze website traffic and usage, and provide personalized content. You can manage cookies through your browser settings, though this may affect site functionality.' },
    { title: '6. Your Rights (GDPR/CCPA)', content: 'Under applicable data protection laws, you have the right to: access personal data we hold about you; correct inaccurate data; request deletion of your data ("right to be forgotten"); restrict or object to processing; data portability; and withdraw consent. To exercise these rights, contact privacy@aegisky.com.' },
    { title: '7. Data Retention', content: 'We retain your personal data for the duration your account is active, and for as long as required by law or legitimate business purposes. Transaction records are retained for a minimum of 7 years to meet tax and accounting requirements.' },
    { title: '8. International Data Transfers', content: 'Your information may be transferred to servers outside your country, which may have different data protection laws. We take appropriate measures to ensure such transfers comply with applicable law.' },
    { title: '9. Children\'s Privacy', content: 'Our services are not directed to children under 16. We do not knowingly collect personal information from children. If you believe we may have collected information from a child, please contact us.' },
    { title: '10. Contact Us', content: 'For any privacy concerns or requests, please contact: privacy@aegisky.com. We will respond to your request within 30 days.' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{isZh ? '首页' : isRu ? 'Главная' : 'Home'}</Link>
        <ChevronRight size={16} />
        <span className="text-gray-900">{isZh ? '隐私政策' : isRu ? 'Политика конфиденциальности' : 'Privacy Policy'}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isZh ? '隐私政策' : isRu ? 'Политика конфиденциальности' : 'Privacy Policy'}
            </h1>
            <p className="text-sm text-gray-500">{isZh ? '最后更新：2026年1月' : isRu ? 'Последнее обновление: Январь 2026' : 'Last updated: January 2026'}</p>
          </div>
        </div>
        <p className="text-gray-600">
          {isZh
            ? 'Aegisky（"我们"）致力于保护您的隐私。本隐私政策说明我们如何收集、使用、共享和保护您的个人信息。使用我们的服务即表示您同意本政策。'
            : isRu
            ? 'Aegisky ("мы") обязуется защищать вашу конфиденциальность. Эта политика объясняет, как мы собираем, используем и защищаем вашу личную информацию.'
            : 'Aegisky ("we") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information. By using our services, you agree to this policy.'}
        </p>
      </div>

      <div className="prose prose-gray max-w-none space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          {isZh ? '另请参阅我们的' : isRu ? 'См. также наши' : 'See also our'}{' '}
          <Link href={`/${lang}/terms`} className="text-blue-600 hover:underline">
            {isZh ? '服务条款' : isRu ? 'Условия использования' : 'Terms of Service'}
          </Link>
        </p>
      </div>
    </div>
  )
}
