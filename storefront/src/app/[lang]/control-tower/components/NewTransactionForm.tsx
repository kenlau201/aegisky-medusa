'use client'

import React, { useState } from 'react'
import { DRONE_ECCN_CODES, INCOTERMS, CURRENCIES } from '@/lib/control-tower/constants'

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

const PRODUCTS = [
  { sku: 'DJI-M300-001', name: 'DJI Matrice 300 RTK', defaultEccn: '9A012' },
  { sku: 'DJI-H20T-001', name: 'Zenmuse H20T 云台相机', defaultEccn: '7A001' },
  { sku: 'GEPRC-MARK5-001', name: 'GEPRC Mark5 FPV Drone', defaultEccn: '9A012' },
  { sku: 'IFLIGHT-NAZGUL-001', name: 'iFlight Nazgul Evoque F5', defaultEccn: '9A012' },
  { sku: 'T-MOTOR-F60-001', name: 'T-Motor F60 Pro V 电机', defaultEccn: 'EAR99' },
  { sku: 'RUNCAM-5-001', name: 'RunCam 5 Orange', defaultEccn: 'EAR99' },
  { sku: 'RADMASTER-001', name: 'RadioMaster TX16S 遥控器', defaultEccn: 'EAR99' },
  { sku: 'HQPROP-51466-001', name: 'HQProp 5.1寸三叶桨', defaultEccn: 'EAR99' },
]

export default function NewTransactionForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    buyer_name: '',
    buyer_country: '',
    end_user_name: '',
    end_user_country: '',
    end_user_statement: '',
    product_id: PRODUCTS[0].sku,
    product_name: PRODUCTS[0].name,
    eccn_code: PRODUCTS[0].defaultEccn,
    quantity: 10,
    unit_value: 5000,
    currency: 'USD',
    incoterm: 'FOB',
    destination_country: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleProductChange = (sku: string) => {
    const product = PRODUCTS.find((p) => p.sku === sku)
    if (product) {
      setForm((prev) => ({
        ...prev,
        product_id: product.sku,
        product_name: product.name,
        eccn_code: product.defaultEccn,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/control-tower/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': TENANT_ID,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setResult({ success: res.ok, data })
      if (res.ok) {
        onCreated()
      }
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6 shadow-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white">New Export Declaration</h3>
        <p className="text-xs text-[#86868B] mt-1">
          Submit transaction for automated export control screening
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 买方信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              Buyer Legal Name *
            </label>
            <input
              type="text"
              value={form.buyer_name}
              onChange={(e) => updateField('buyer_name', e.target.value)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3]"
              placeholder="e.g. European Drone Services Sp. z o.o."
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              Buyer Country (ISO 2) *
            </label>
            <input
              type="text"
              maxLength={2}
              value={form.buyer_country}
              onChange={(e) => updateField('buyer_country', e.target.value.toUpperCase())}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono uppercase"
              placeholder="PL"
              required
            />
          </div>
        </div>

        {/* 最终用户 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              End-User Name
            </label>
            <input
              type="text"
              value={form.end_user_name}
              onChange={(e) => updateField('end_user_name', e.target.value)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3]"
              placeholder="If different from buyer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              End-User Country
            </label>
            <input
              type="text"
              maxLength={2}
              value={form.end_user_country}
              onChange={(e) => updateField('end_user_country', e.target.value.toUpperCase())}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono uppercase"
              placeholder="UA"
            />
          </div>
        </div>

        {/* 产品信息 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              Product *
            </label>
            <select
              value={form.product_id}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3]"
            >
              {PRODUCTS.map((p) => (
                <option key={p.sku} value={p.sku}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              ECCN Code
            </label>
            <select
              value={form.eccn_code}
              onChange={(e) => updateField('eccn_code', e.target.value)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono"
            >
              {DRONE_ECCN_CODES.map((e) => (
                <option key={e.eccn_code} value={e.eccn_code}>{e.eccn_code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              Destination Country *
            </label>
            <input
              type="text"
              maxLength={2}
              value={form.destination_country}
              onChange={(e) => updateField('destination_country', e.target.value.toUpperCase())}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono uppercase"
              placeholder="DE"
              required
            />
          </div>
        </div>

        {/* 数量和金额 */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              Quantity *
            </label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => updateField('quantity', parseInt(e.target.value) || 1)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              Unit Value
            </label>
            <input
              type="number"
              min={0}
              value={form.unit_value}
              onChange={(e) => updateField('unit_value', parseFloat(e.target.value) || 0)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              Currency
            </label>
            <select
              value={form.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
              Incoterm
            </label>
            <select
              value={form.incoterm}
              onChange={(e) => updateField('incoterm', e.target.value)}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono"
            >
              {INCOTERMS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* EUS声明 */}
        <div>
          <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">
            End-User Statement *
          </label>
          <textarea
            value={form.end_user_statement}
            onChange={(e) => updateField('end_user_statement', e.target.value)}
            rows={3}
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0071E3] resize-none"
            placeholder="Detailed description of end-use. Items will be used for civilian infrastructure inspection and surveying purposes only..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0071E3] hover:bg-[#147CE5] disabled:opacity-50 text-white font-medium text-xs py-3 rounded-xl transition-all shadow-lg shadow-[#0071E3]/20"
        >
          {submitting ? 'SCREENING...' : '🔍 SUBMIT FOR COMPLIANCE SCREENING'}
        </button>
      </form>

      {/* 结果显示 */}
      {result && (
        <div className={`mt-4 p-4 rounded-xl border text-xs ${
          result.success
            ? result.data.risk_assessment?.riskLevel === 'CRITICAL'
              ? 'bg-[#3A1C1C] border-[#FF453A]'
              : result.data.risk_assessment?.riskLevel === 'HIGH'
              ? 'bg-[#3A2E1C] border-[#FF9F0A]'
              : 'bg-[#1C3D22] border-[#30D158]'
            : 'bg-[#3A1C1C] border-[#FF453A]'
        }`}>
          {result.success ? (
            <>
              <div className="font-medium text-white mb-2">
                Transaction Created: {result.data.transaction?.transaction_ref}
              </div>
              <div className="text-[#86868B]">
                Risk Level: <span className={`font-semibold ${
                  result.data.risk_assessment?.riskLevel === 'CRITICAL' ? 'text-[#FF453A]' :
                  result.data.risk_assessment?.riskLevel === 'HIGH' ? 'text-[#FF9F0A]' :
                  result.data.risk_assessment?.riskLevel === 'MEDIUM' ? 'text-[#FF9F0A]' :
                  'text-[#30D158]'
                }`}>{result.data.risk_assessment?.riskLevel}</span>
                {' '}({result.data.risk_assessment?.totalScore}/100)
              </div>
              <div className="text-[#86868B] mt-1">
                Recommendation: {result.data.risk_assessment?.recommendation}
              </div>
              <div className="text-[#86868B] mt-1">
                Status: {result.data.transaction?.compliance_status}
              </div>
            </>
          ) : (
            <div className="text-[#FF453A]">Error: {result.error || result.data?.error}</div>
          )}
        </div>
      )}
    </div>
  )
}
