'use client'

import React, { useState, useEffect } from 'react'
import { DRONE_ECCN_CODES } from '@/lib/control-tower/constants'

export default function ClassificationManager() {
  const [classifications, setClassifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    product_name: '',
    product_description: '',
    eccn_code: '9A012',
    classification_basis: '',
  })

  useEffect(() => {
    fetchClassifications()
  }, [])

  const fetchClassifications = async () => {
    try {
      const res = await fetch('/api/control-tower/classifications', {
        headers: { 'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d' }
      })
      const data = await res.json()
      setClassifications(data.classifications || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const submitClassification = async () => {
    await fetch('/api/control-tower/classifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
      },
      body: JSON.stringify(form)
    })
    setShowForm(false)
    setForm({ product_name: '', product_description: '', eccn_code: '9A012', classification_basis: '' })
    fetchClassifications()
  }

  const getControlReasonColor = (reason: string) => {
    if (reason.includes('NS')) return 'bg-red-500/20 text-red-400'
    if (reason.includes('MT')) return 'bg-orange-500/20 text-orange-400'
    if (reason.includes('RS')) return 'bg-purple-500/20 text-purple-400'
    if (reason.includes('AT')) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">ECCN Classification</h2>
          <p className="text-sm text-[#86868B] mt-1">
            Export Control Classification Numbers - determine licensing requirements for your products
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#0071E3] text-white text-xs font-medium rounded-lg hover:bg-[#0077ED] transition"
        >
          + Classify Product
        </button>
      </div>

      {/* ECCN Reference */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] p-4">
        <h3 className="text-sm font-medium text-white mb-3">Drone-Related ECCN Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DRONE_ECCN_CODES.map(eccn => (
            <div key={eccn.eccn} className="bg-[#2D2D2E] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-bold text-[#0071E3]">{eccn.eccn}</span>
                <div className="flex gap-1">
                  {eccn.control_reasons.map(r => (
                    <span key={r} className={`px-1.5 py-0.5 text-[10px] rounded ${getControlReasonColor(r)}`}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#E5E5EA]">{eccn.title}</p>
              {eccn.at_notes && <p className="text-[10px] text-[#86868B] mt-1">{eccn.at_notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Classification Form */}
      {showForm && (
        <div className="bg-[#1C1C1E] rounded-xl p-6 border border-[#2D2D2E] space-y-4">
          <h3 className="text-sm font-semibold text-white">New Product Classification</h3>
          <div>
            <label className="text-xs text-[#86868B] block mb-1.5">Product Name *</label>
            <input
              type="text"
              value={form.product_name}
              onChange={e => setForm({ ...form, product_name: e.target.value })}
              className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-[#86868B] block mb-1.5">Product Description</label>
            <textarea
              value={form.product_description}
              onChange={e => setForm({ ...form, product_description: e.target.value })}
              className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#86868B] block mb-1.5">ECCN Code</label>
              <select
                value={form.eccn_code}
                onChange={e => setForm({ ...form, eccn_code: e.target.value })}
                className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
              >
                {DRONE_ECCN_CODES.map(e => (
                  <option key={e.eccn} value={e.eccn}>{e.eccn} - {e.title.substring(0, 50)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#86868B] block mb-1.5">Classification Basis</label>
              <input
                type="text"
                value={form.classification_basis}
                onChange={e => setForm({ ...form, classification_basis: e.target.value })}
                placeholder="Technical analysis, CCATS, etc."
                className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#3A3A3C] text-[#86868B] rounded-lg text-sm">Cancel</button>
            <button onClick={submitClassification} disabled={!form.product_name} className="px-6 py-2 bg-[#0071E3] text-white rounded-lg text-sm disabled:opacity-50">Save Classification</button>
          </div>
        </div>
      )}

      {/* Classified Products */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2D2D2E]">
          <h3 className="text-sm font-medium text-white">Classified Products ({classifications.length})</h3>
        </div>
        {classifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#86868B] text-sm">
            No products classified yet. Classify your products to determine export licensing requirements.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D2D2E]">
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Classification #</th>
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Product</th>
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">ECCN</th>
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Date</th>
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {classifications.map(cls => (
                <tr key={cls.id} className="border-b border-[#2D2D2E]">
                  <td className="px-4 py-3 font-mono text-xs text-white">{cls.classification_number}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-white">{cls.product_name}</div>
                    <div className="text-xs text-[#86868B] max-w-md truncate">{cls.product_description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-[#0071E3]/20 text-[#0071E3] text-xs rounded font-mono">{cls.eccn_code}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#86868B]">{new Date(cls.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">{cls.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
