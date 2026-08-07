import Link from 'next/link'
import { ChevronRight, FileText } from 'lucide-react'
import { LanguageCode } from '@/i18n'

export const dynamicParams = true

export default function TermsPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  const isZh = lang === 'zh'
  const isRu = lang === 'ru'

  const sections = isZh ? [
    { title: '1. 服务说明', content: 'Aegisky是一个B2B无人机及零部件供应链平台，连接全球买家与供应商。我们提供商品展示、RFQ询价、订单管理、支付处理和物流协调服务。本平台不直接销售商品，所有交易均在买家和供应商之间进行。' },
    { title: '2. 账户注册', content: '您必须提供准确、完整的注册信息，并对您的账户安全负责。您不得将账户转让给第三方。如发现未经授权的使用，请立即通知我们。我们保留因违反条款而暂停或终止账户的权利。' },
    { title: '3. 用户行为', content: '您同意不：发布虚假或误导性信息；侵犯他人知识产权；从事欺诈或非法活动；上传恶意软件或试图破坏平台安全；发送垃圾邮件或骚扰其他用户；违反任何适用的出口管制法律或制裁规定。' },
    { title: '4. 商品与定价', content: '商品信息由供应商提供，我们不对其准确性或完整性作保证。所有价格均为指示性价格，最终价格以供应商确认为准。我们保留随时修改或停止服务的权利。' },
    { title: '5. 订单与支付', content: '订单构成买家购买要约，供应商确认后形成具有约束力的合同。支付通过我们的平台或指定支付处理商进行。我们可能对交易收取服务费，具体费用将在交易前明确说明。' },
    { title: '6. 出口管制合规', content: '所有交易必须遵守适用的出口管制法律，包括但不限于美国EAR/ITAR、欧盟两用物项条例。买家和供应商负责获取必要的进出口许可证。我们保留对受制裁方进行筛查并拒绝可疑交易的权利。' },
    { title: '7. 知识产权', content: '平台上的所有内容（商标、标志、文本、图像）均为Aegisky或其许可方的财产。用户保留其上传内容的所有权，但授予我们使用该内容运营平台的许可。' },
    { title: '8. 免责声明', content: '平台按"现状"提供，不提供任何明示或暗示的保证。我们不对因使用平台而产生的任何间接、附带或后果性损害承担责任。在法律允许的最大范围内，我们对任何索赔的责任不超过相关交易金额。' },
    { title: '9. 争议解决', content: '因本条款产生的争议应首先通过友好协商解决。协商不成的，任何一方可将争议提交新加坡国际仲裁中心（SIAC）按其届时有效的仲裁规则进行仲裁。仲裁裁决为终局裁决。' },
    { title: '10. 条款修改', content: '我们保留随时修改这些条款的权利。修改后继续使用平台即表示您接受修改后的条款。重大变更将通过电子邮件或平台通知告知您。' },
  ] : isRu ? [
    { title: '1. Описание услуг', content: 'Aegisky — это B2B платформа для цепочки поставок дронов и комплектующих, соединяющая покупателей и поставщиков по всему миру. Мы предоставляем каталог товаров, RFQ запросы, управление заказами, обработку платежей и логистику.' },
    { title: '2. Регистрация учетной записи', content: 'Вы должны предоставить точную и полную информацию при регистрации. Вы несете ответственность за безопасность вашей учетной записи. Мы оставляем за собой право приостановить или прекратить действие учетной записи за нарушение условий.' },
    { title: '3. Поведение пользователя', content: 'Вы соглашаетесь не: публиковать ложную информацию; нарушать права интеллектуальной собственности; заниматься мошенничеством; загружать вредоносное ПО; отправлять спам; нарушать законы об экспортном контроле.' },
    { title: '4. Товары и цены', content: 'Информация о товарах предоставляется поставщиками. Все цены являются ориентировочными, окончательная цена подтверждается поставщиком.' },
    { title: '5. Заказы и оплата', content: 'Заказ является предложением покупателя; после подтверждения поставщиком формируется обязательный договор. Оплата производится через платформу или указанного платежного оператора.' },
    { title: '6. Экспортный контроль', content: 'Все транзакции должны соответствовать применимым законам об экспортном контроле. Покупатели и поставщики несут ответственность за получение необходимых лицензий. Мы оставляем за собой право проверять санкционные списки.' },
    { title: '7. Интеллектуальная собственность', content: 'Все содержимое платформы является собственностью Aegisky или её лицензиаров. Пользователи сохраняют права на загруженный контент, но предоставляют нам лицензию на его использование.' },
    { title: '8. Отказ от гарантий', content: 'Платформа предоставляется "как есть" без каких-либо гарантий. Мы не несем ответственности за косвенные убытки. Наша ответственность ограничена суммой соответствующей транзакции.' },
    { title: '9. Разрешение споров', content: 'Споры разрешаются путем переговоров. При недостижении согласия спор передается в Сингапурский международный арбитражный центр (SIAC).' },
    { title: '10. Изменения условий', content: 'Мы оставляем за собой право изменять эти условия. Продолжение использования платформы после изменений означает ваше согласие с ними.' },
  ] : [
    { title: '1. Description of Services', content: 'Aegisky is a B2B drone and components supply chain platform connecting global buyers with suppliers. We provide product listings, RFQ services, order management, payment processing, and logistics coordination. The platform does not directly sell goods; all transactions occur between buyers and suppliers.' },
    { title: '2. Account Registration', content: 'You must provide accurate and complete registration information and are responsible for the security of your account. You may not transfer your account to third parties. We reserve the right to suspend or terminate accounts for violations of these terms.' },
    { title: '3. User Conduct', content: 'You agree not to: post false or misleading information; infringe intellectual property rights; engage in fraud or illegal activities; upload malware or attempt to breach platform security; send spam or harass other users; violate any applicable export control laws or sanctions.' },
    { title: '4. Products and Pricing', content: 'Product information is provided by suppliers; we do not warrant its accuracy or completeness. All prices are indicative; final prices are subject to supplier confirmation. We reserve the right to modify or discontinue services at any time.' },
    { title: '5. Orders and Payments', content: 'An order constitutes a buyer offer; upon supplier confirmation, a binding contract is formed. Payments are processed through our platform or designated payment processors. We may charge service fees, which will be clearly disclosed before transactions.' },
    { title: '6. Export Control Compliance', content: 'All transactions must comply with applicable export control laws, including but not limited to US EAR/ITAR and EU Dual-Use Regulations. Buyers and suppliers are responsible for obtaining necessary import/export licenses. We reserve the right to screen against sanctions lists and reject suspicious transactions.' },
    { title: '7. Intellectual Property', content: 'All platform content (trademarks, logos, text, images) is the property of Aegisky or its licensors. Users retain ownership of their uploaded content but grant us a license to use such content to operate the platform.' },
    { title: '8. Disclaimer of Warranties', content: 'The platform is provided "as is" without any warranties, express or implied. We shall not be liable for any indirect, incidental, or consequential damages. To the maximum extent permitted by law, our liability for any claim shall not exceed the amount of the relevant transaction.' },
    { title: '9. Dispute Resolution', content: 'Disputes shall first be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to the Singapore International Arbitration Centre (SIAC) under its then-current rules. Arbitration awards are final and binding.' },
    { title: '10. Modifications to Terms', content: 'We reserve the right to modify these terms at any time. Continued use of the platform after modifications constitutes acceptance of the revised terms. Material changes will be communicated via email or platform notification.' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${lang}`} className="hover:text-blue-600">{isZh ? '首页' : isRu ? 'Главная' : 'Home'}</Link>
        <ChevronRight size={16} />
        <span className="text-gray-900">{isZh ? '服务条款' : isRu ? 'Условия использования' : 'Terms of Service'}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isZh ? '服务条款' : isRu ? 'Условия использования' : 'Terms of Service'}
            </h1>
            <p className="text-sm text-gray-500">{isZh ? '最后更新：2026年1月' : isRu ? 'Последнее обновление: Январь 2026' : 'Last updated: January 2026'}</p>
          </div>
        </div>
        <p className="text-gray-600">
          {isZh
            ? '使用Aegisky平台即表示您同意受这些服务条款约束。请仔细阅读。'
            : isRu
            ? 'Используя платформу Aegisky, вы соглашаетесь с этими условиями использования. Пожалуйста, прочтите внимательно.'
            : 'By using the Aegisky platform, you agree to be bound by these Terms of Service. Please read them carefully.'}
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
          {isZh ? '另请参阅我们的' : isRu ? 'См. также нашу' : 'See also our'}{' '}
          <Link href={`/${lang}/privacy`} className="text-blue-600 hover:underline">
            {isZh ? '隐私政策' : isRu ? 'Политику конфиденциальности' : 'Privacy Policy'}
          </Link>
        </p>
      </div>
    </div>
  )
}
