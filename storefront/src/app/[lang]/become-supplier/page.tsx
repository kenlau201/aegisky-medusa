'use client'

import { useState } from 'react'
import { Check, Building2, Users, FileCheck, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

const COUNTRIES = [
  { code: 'CN', name: 'China' },
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'PL', name: 'Poland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
]

const BUSINESS_TYPES = [
  { value: 'manufacturer', label: 'Original Equipment Manufacturer (OEM)' },
  { value: 'distributor', label: 'Authorized Distributor' },
  { value: 'reseller', label: 'Value-Added Reseller' },
  { value: 'integrator', label: 'System Integrator' },
  { value: 'service_provider', label: 'Service Provider' },
]

export default function BecomeSupplierPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    companyName: '',
    registrationNumber: '',
    taxId: '',
    vatNumber: '',
    country: '',
    foundedYear: '',
    website: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    annualRevenue: '',
    employeeCount: '',
    businessType: 'distributor',
    productCategories: '',
    description: '',
  })

  const [beneficialOwners, setBeneficialOwners] = useState([
    { fullName: '', nationality: '', ownershipPercentage: '', isPep: false, dateOfBirth: '', passportNumber: '' },
  ])

  const update = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateUbo = (index: number, field: string, value: any) => {
    setBeneficialOwners(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addUbo = () => {
    setBeneficialOwners(prev => [...prev, {
      fullName: '', nationality: '', ownershipPercentage: '', isPep: false, dateOfBirth: '', passportNumber: ''
    }])
  }

  const removeUbo = (index: number) => {
    setBeneficialOwners(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/suppliers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, beneficialOwners }),
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Submission failed')
      }
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
          <p className="text-gray-600 text-lg mb-6">
            Thank you for applying to become a verified supplier on Aegisky. Our compliance team will review your
            application and supporting documents within <strong>2-3 business days</strong>.
          </p>
          <p className="text-gray-600 mb-8">
            You will receive a confirmation email at <strong>{formData.contactEmail}</strong> once your
            application has been reviewed.
          </p>
          <div className="bg-blue-50 rounded-xl p-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Our compliance team reviews your company information and UBO declarations</li>
              <li>2. We may request additional documents (business license, certificates)</li>
              <li>3. Once approved, you will receive supplier portal access</li>
              <li>4. You can list your products and start receiving RFQs from global buyers</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Become a Verified Supplier</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join the global trusted network for UAV and industrial components. All suppliers go through
            our KYB (Know Your Business) compliance verification process.
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-10">
          {[
            { num: 1, label: 'Company Info', icon: Building2 },
            { num: 2, label: 'Beneficial Owners', icon: Users },
            { num: 3, label: 'Review & Submit', icon: FileCheck },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-3 ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step > s.num ? 'bg-green-500 text-white' :
                  step === s.num ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className="font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < 2 && <div className={`w-16 sm:w-24 h-1 mx-4 rounded ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 步骤1：公司信息 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Company Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Legal Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => update('companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Shenzhen DJI Sciences and Technologies Ltd."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country of Incorporation *</label>
                  <select
                    value={formData.country}
                    onChange={e => update('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={e => update('registrationNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="e.g. 91440300MA5D..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Founded</label>
                  <input
                    type="number"
                    value={formData.foundedYear}
                    onChange={e => update('foundedYear', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="e.g. 2015"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / EIN</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={e => update('taxId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VAT Number (if applicable)</label>
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={e => update('vatNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="e.g. DE123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => update('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="https://"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={e => update('businessType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 pt-4">Primary Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Name *</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={e => update('contactName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={e => update('contactEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={e => update('contactPhone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue (USD)</label>
                  <select
                    value={formData.annualRevenue}
                    onChange={e => update('annualRevenue', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select range...</option>
                    <option value="1000000">Under $1M</option>
                    <option value="5000000">$1M - $5M</option>
                    <option value="25000000">$5M - $25M</option>
                    <option value="100000000">$25M - $100M</option>
                    <option value="500000000">Over $100M</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brief Description of Products</label>
                <textarea
                  value={formData.description}
                  onChange={e => update('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="What types of UAVs, components, or industrial products do you supply?"
                />
              </div>
            </div>
          )}

          {/* 步骤2：受益所有人 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Beneficial Owners</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Per FATF and international banking standards, we are required to collect information on
                  all individuals who own or control <strong>25% or more</strong> of the company.
                </p>
              </div>

              {beneficialOwners.map((ubo, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Owner #{index + 1}</h3>
                    {beneficialOwners.length > 1 && (
                      <button
                        onClick={() => removeUbo(index)}
                        className="text-red-600 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Legal Name *</label>
                      <input
                        type="text"
                        value={ubo.fullName}
                        onChange={e => updateUbo(index, 'fullName', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
                      <select
                        value={ubo.nationality}
                        onChange={e => updateUbo(index, 'nationality', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Select country...</option>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ownership % *</label>
                      <input
                        type="number"
                        min="25"
                        max="100"
                        value={ubo.ownershipPercentage}
                        onChange={e => updateUbo(index, 'ownershipPercentage', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                        placeholder="Minimum 25%"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={ubo.dateOfBirth}
                        onChange={e => updateUbo(index, 'dateOfBirth', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Passport / ID Number</label>
                      <input
                        type="text"
                        value={ubo.passportNumber}
                        onChange={e => updateUbo(index, 'passportNumber', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ubo.isPep}
                          onChange={e => updateUbo(index, 'isPep', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        This person is a Politically Exposed Person (PEP)
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addUbo}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + Add Another Beneficial Owner
              </button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <strong>Note:</strong> If no individual owns 25% or more, please list the senior managing
                officials who control the company.
              </div>
            </div>
          )}

          {/* 步骤3：确认 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Review & Submit</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Company Summary</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-gray-500">Company</dt><dd className="font-medium">{formData.companyName}</dd></div>
                    <div><dt className="text-gray-500">Country</dt><dd className="font-medium">{COUNTRIES.find(c => c.code === formData.country)?.name || formData.country}</dd></div>
                    <div><dt className="text-gray-500">Contact</dt><dd className="font-medium">{formData.contactName}</dd></div>
                    <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{formData.contactEmail}</dd></div>
                    <div><dt className="text-gray-500">Business Type</dt><dd className="font-medium">{BUSINESS_TYPES.find(t => t.value === formData.businessType)?.label}</dd></div>
                    <div><dt className="text-gray-500">Website</dt><dd className="font-medium">{formData.website || '-'}</dd></div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Beneficial Owners ({beneficialOwners.length})</h3>
                  <div className="space-y-2 text-sm">
                    {beneficialOwners.map((ubo, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                        <span>{ubo.fullName || '(not named)'}</span>
                        <span className="text-gray-500">
                          {COUNTRIES.find(c => c.code === ubo.nationality)?.name || ubo.nationality} • {ubo.ownershipPercentage}%
                          {ubo.isPep && <span className="ml-2 text-orange-600 font-medium">⚠️ PEP</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded" />
                  <span className="text-sm text-blue-900">
                    I confirm that all information provided is true and accurate. I understand that Aegisky
                    will conduct sanctions screening and due diligence checks. Providing false information
                    will result in permanent rejection from the platform.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* 导航按钮 */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!formData.companyName || !formData.country || !formData.contactName || !formData.contactEmail)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
