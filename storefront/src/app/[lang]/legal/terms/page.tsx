import Link from 'next/link'
import { LanguageCode } from '@/i18n'

export const metadata = {
  title: 'Terms of Service | Aegisky',
  description: 'Aegisky B2B platform terms of service',
}

export default function TermsPage({ params: { lang } }: { params: { lang: LanguageCode } }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/${lang}`} className="text-blue-600 text-sm hover:underline mb-6 inline-block">← Back to Home</Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: August 4, 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing or using the Aegisky platform ("Service"), operated by Aegisky Inc. ("Company", "we", "us"),
            you agree to be bound by these Terms of Service. If you disagree with any part, you may not access the Service.
            This Service is intended for B2B (business-to-business) transactions only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Agency & Payment Collection Model</h2>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-amber-900 font-medium mb-2">Important: Payment Collection Agent Model</p>
            <p className="text-amber-800 text-sm">
              Aegisky Inc. acts as an intermediary platform and payment collection agent on behalf of suppliers.
              When you make a payment:
            </p>
            <ul className="list-disc pl-6 mt-2 text-amber-800 text-sm space-y-1">
              <li>Aegisky collects payment as an authorized agent of the supplier</li>
              <li>The actual seller of record is the supplier identified on your order confirmation</li>
              <li>Payment to Aegisky constitutes payment to the supplier</li>
              <li>Aegisky is not the seller of record unless explicitly stated</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. B2B Eligibility</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>You must be a registered business entity or authorized representative</li>
            <li>You must be at least 18 years of age</li>
            <li>Export-controlled products may require end-user certificates</li>
            <li>Drone products are subject to local regulations in your jurisdiction</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Orders & Pricing</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>All prices are in the currency displayed at checkout, locked for 30 minutes during checkout</li>
            <li>Prices are subject to change without notice prior to order acceptance</li>
            <li>Orders are not binding until confirmed by the supplier</li>
            <li>Minimum order quantities (MOQ) may apply for certain products</li>
            <li>Bulk pricing tiers are available for qualified buyers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Credit Card:</strong> Processed via Stripe; payment captured at order confirmation</li>
            <li><strong>Wire Transfer (T/T):</strong> 30% deposit, 70% balance before shipment for orders over $5,000</li>
            <li><strong>Letter of Credit:</strong> Available for orders over $50,000; bank fees apply</li>
            <li>All payments are collected by Aegisky as agent for the supplier</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Shipping & Delivery</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Shipping rates are calculated at checkout via DHL, FedEx, UPS, or EMS</li>
            <li>Delivery times are estimates and not guaranteed</li>
            <li>Customs duties, import taxes, and tariffs are the buyer's responsibility</li>
            <li>Title and risk pass to buyer upon handover to carrier (FOB Hong Kong unless otherwise stated)</li>
            <li>Buyer is responsible for compliance with import regulations in destination country</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Returns & Warranties</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Defective products may be returned within 14 days of delivery</li>
            <li>Warranty terms are set by individual suppliers/manufacturers</li>
            <li>Returns require RMA (Return Merchandise Authorization) from supplier</li>
            <li>Return shipping costs are buyer's responsibility unless item is defective</li>
            <li>Custom/special-order items are non-returnable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Export Compliance</h2>
          <p className="text-gray-700 mb-3">
            Drone and UAV products may be subject to export control regulations including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
            <li>US Export Administration Regulations (EAR)</li>
            <li>EU Dual-Use Regulation</li>
            <li>Wassenaar Arrangement controls</li>
          </ul>
          <p className="text-gray-700 mt-3">
            Buyer agrees not to resell, export, or re-export products to sanctioned countries, entities,
            or for prohibited end-uses including military applications in embargoed destinations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
          <p className="text-gray-700">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, AEGISKY INC. SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
            WHETHER INCURRED DIRECTLY OR INDIRECTLY. TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE
            AMOUNT PAID BY BUYER FOR THE SPECIFIC ORDER GIVING RISE TO THE CLAIM.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Dispute Resolution</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Parties shall first attempt good-faith negotiation for 30 days</li>
            <li>Unresolved disputes shall be resolved by arbitration in Hong Kong under HKIAC rules</li>
            <li>Arbitration shall be conducted in English</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
          <p className="text-gray-700">
            These Terms shall be governed by the laws of Hong Kong SAR, without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-medium">Aegisky Inc.</p>
            <p>Legal: <a href="mailto:legal@aegisky.com" className="text-blue-600">legal@aegisky.com</a></p>
            <p>Cyberport 3, Hong Kong</p>
          </div>
        </section>
      </div>
    </div>
  )
}
