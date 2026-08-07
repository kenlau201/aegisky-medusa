import Link from 'next/link'
import { LanguageCode } from '@/i18n'

export const metadata = {
  title: 'Privacy Policy | Aegisky',
  description: 'Aegisky privacy policy and GDPR compliance information',
}

export default function PrivacyPolicyPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/${lang}`} className="text-blue-600 text-sm hover:underline mb-6 inline-block">← Back to Home</Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: August 4, 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Overview</h2>
          <p className="text-gray-700">
            Aegisky Inc. ("we", "us", "our") operates the B2B drone supply chain platform.
            This Privacy Policy describes how we collect, use, and protect your personal data in accordance
            with the General Data Protection Regulation (GDPR) and applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data Controller</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <p className="font-medium">Aegisky Inc.</p>
            <p>Email: privacy@aegisky.com</p>
            <p>Address: Cyberport 3, Hong Kong</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Personal Data We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Account Data:</strong> Name, email, company name, phone number, password (hashed)</li>
            <li><strong>Order Data:</strong> Shipping/billing address, payment info (processed by Stripe; we never store full card numbers)</li>
            <li><strong>RFQ Data:</strong> Product inquiries, quantities, specifications</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
            <li><strong>Communication:</strong> Emails, support tickets</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Legal Basis (GDPR Article 6)</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Contract performance:</strong> Processing orders, delivering products</li>
            <li><strong>Legitimate interest:</strong> Fraud prevention, security, service improvement</li>
            <li><strong>Consent:</strong> Marketing communications (opt-out anytime)</li>
            <li><strong>Legal obligation:</strong> Tax, accounting, regulatory compliance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your GDPR Rights</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { right: 'Right of Access', desc: 'Request a copy of your personal data' },
              { right: 'Right to Rectification', desc: 'Correct inaccurate data' },
              { right: 'Right to Erasure', desc: 'Request deletion ("right to be forgotten")' },
              { right: 'Right to Restriction', desc: 'Limit how we process your data' },
              { right: 'Data Portability', desc: 'Receive data in machine-readable format' },
              { right: 'Right to Object', desc: 'Object to processing based on legitimate interests' },
            ].map(item => (
              <div key={item.right} className="border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-900 text-sm">{item.right}</p>
                <p className="text-gray-600 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-700 mt-4">
            Exercise rights at <a href="mailto:privacy@aegisky.com" className="text-blue-600">privacy@aegisky.com</a>. Response within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Account data: While active, deleted within 12 months of closure</li>
            <li>Order data: 7 years (tax/legal requirements)</li>
            <li>Communication data: 3 years</li>
            <li>Technical/log data: 90 days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Processors & Transfers</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li><strong>Stripe</strong> — Payment processing (PCI DSS)</li>
            <li><strong>EasyPost/DHL/FedEx/UPS</strong> — Shipping</li>
            <li><strong>Cloudflare</strong> — CDN & security</li>
          </ul>
          <p className="text-gray-700 mt-3 text-sm">International transfers protected by EU Standard Contractual Clauses.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Security</h2>
          <p className="text-gray-700">
            TLS 1.3 encryption, 256-bit SSL, bcrypt password hashing, regular audits.
            Payment data processed exclusively through Stripe's PCI-compliant infrastructure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-medium">Data Protection Officer</p>
            <p>Email: <a href="mailto:privacy@aegisky.com" className="text-blue-600">privacy@aegisky.com</a></p>
          </div>
        </section>
      </div>
    </div>
  )
}
