'use client'

import React, { useState, useEffect } from 'react'
import { DRONE_ECCN_CODES } from '@/lib/control-tower/constants'

export default function EUSManager() {
  const [statements, setStatements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    consignee_name: '',
    consignee_country: '',
    end_user_name: '',
    end_user_address: '',
    end_user_country: '',
    end_use_description: '',
    end_use_category: 'CIVILIAN',
    military_use_denial: true,
    no_reexport_agreement: true,
    no_weapons_use: true,
    authorized_signatory: '',
    signatory_title: '',
  })

  useEffect(() => {
    fetchStatements()
  }, [])

  const fetchStatements = async () => {
    try {
      const res = await fetch('/api/control-tower/eus', {
        headers: { 'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d' }
      })
      const data = await res.json()
      setStatements(data.statements || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const submitEUS = async () => {
    try {
      await fetch('/api/control-tower/eus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
        },
        body: JSON.stringify(form)
      })
      setShowForm(false)
      setForm({
        consignee_name: '', consignee_country: '', end_user_name: '',
        end_user_address: '', end_user_country: '', end_use_description: '',
        end_use_category: 'CIVILIAN', military_use_denial: true,
        no_reexport_agreement: true, no_weapons_use: true,
        authorized_signatory: '', signatory_title: '',
      })
      fetchStatements()
    } catch (e) {
      console.error(e)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'RECEIVED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) return <div className="text-[#86868B] text-sm">Loading EUS...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">End User Statements</h2>
          <p className="text-sm text-[#86868B] mt-1">
            End User/End Use Statements (EUS) - required for controlled dual-use exports
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#0071E3] text-white text-xs font-medium rounded-lg hover:bg-[#0077ED] transition"
        >
          + New EUS
        </button>
      </div>

      {/* EUS Form */}
      {showForm && (
        <div className="bg-[#1C1C1E] rounded-xl p-6 border border-[#2D2D2E] space-y-4">
          <h3 className="text-sm font-semibold text-white">New End User Statement</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#86868B] block mb-1.5">Consignee Name *</label>
              <input
                type="text"
                value={form.consignee_name}
                onChange={e => setForm({ ...form, consignee_name: e.target.value })}
                className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#86868B] block mb-1.5">Consignee Country *</label>
              <input
                type="text"
                value={form.consignee_country}
                onChange={e => setForm({ ...form, consignee_country: e.target.value.toUpperCase() })}
                className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
                maxLength={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#86868B] block mb-1.5">End User Name *</label>
              <input
                type="text"
                value={form.end_user_name}
                onChange={e => setForm({ ...form, end_user_name: e.target.value })}
                className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#86868B] block mb-1.5">End User Country *</label>
              <input
                type="text"
                value={form.end_user_country}
                onChange={e => setForm({ ...form, end_user_country: e.target.value.toUpperCase() })}
                className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#86868B] block mb-1.5">End User Address</label>
            <textarea
              value={form.end_user_address}
              onChange={e => setForm({ ...form, end_user_address: e.target.value })}
              className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm h-16"
            />
          </div>

          <div>
            <label className="text-xs text-[#86868B] block mb-1.5">End Use Description *</label>
            <textarea
              value={form.end_use_description}
              onChange={e => setForm({ ...form, end_use_description: e.target.value })}
              placeholder="Detailed description of how the items will be used"
              className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#86868B] block mb-1.5">End Use Category</label>
              <select
                value={form.end_use_category}
                onChange={e => setForm({ ...form, end_use_category: e.target.value })}
                className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="CIVILIAN">Civilian / Commercial</option>
                <option value="RESEARCH">Research / Academic</option>
                <option value="GOVERNMENT">Government (Non-military)</option>
                <option value="HUMANITARIAN">Humanitarian</option>
                <option value="MEDIA">Media / Journalism</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#86868B] block mb-1.5">Authorized Signatory</label>
              <input
                type="text"
                value={form.authorized_signatory}
                onChange={e => setForm({ ...form, authorized_signatory: e.target.value })}
                className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.military_use_denial}
                onChange={e => setForm({ ...form, military_use_denial: e.target.checked })}
                className="w-4 h-4 rounded border-[#3A3A3C] bg-[#2D2D2E]"
              />
              <span className="text-sm text-[#E5E5EA]">
                The items will <strong>not</strong> be used for military, defense, or weapons purposes
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.no_reexport_agreement}
                onChange={e => setForm({ ...form, no_reexport_agreement: e.target.checked })}
                className="w-4 h-4 rounded border-[#3A3A3C] bg-[#2D2D2E]"
              />
              <span className="text-sm text-[#E5E5EA]">
                The items will <strong>not</strong> be re-exported, transferred, or resold without prior authorization
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.no_weapons_use}
                onChange={e => setForm({ ...form, no_weapons_use: e.target.checked })}
                className="w-4 h-4 rounded border-[#3A3A3C] bg-[#2D2D2E]"
              />
              <span className="text-sm text-[#E5E5EA]">
                The items will <strong>not</strong> be used in connection with weapons of mass destruction (nuclear, chemical, biological)
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#3A3A3C] text-[#86868B] rounded-lg text-sm hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={submitEUS}
              disabled={!form.consignee_name || !form.end_user_name || !form.end_use_description}
              className="px-6 py-2 bg-[#0071E3] text-white rounded-lg text-sm hover:bg-[#0077ED] disabled:opacity-50"
            >
              Submit EUS
            </button>
          </div>
        </div>
      )}

      {/* EUS List */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2D2D2E]">
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">EUS #</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">Consignee</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">End User</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">End Use</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">Date</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {statements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#86868B] text-sm">
                  No End User Statements yet. Create one to document end use for controlled exports.
                </td>
              </tr>
            ) : statements.map((eus) => (
              <tr key={eus.id} className="border-b border-[#2D2D2E] hover:bg-[#2D2D2E]/30">
                <td className="px-4 py-3 font-mono text-sm text-white">{eus.eus_number}</td>
                <td className="px-4 py-3">
                  <div className="text-sm text-white">{eus.consignee_name}</div>
                  <div className="text-xs text-[#86868B]">{eus.consignee_country}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-white">{eus.end_user_name}</div>
                  <div className="text-xs text-[#86868B]">{eus.end_user_country}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-[#E5E5EA] max-w-xs truncate">{eus.end_use_description}</div>
                  <div className="text-xs text-[#86868B]">{eus.end_use_category}</div>
                </td>
                <td className="px-4 py-3 text-sm text-[#86868B]">
                  {new Date(eus.signature_date || eus.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(eus.status)}`}>
                    {eus.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Regulatory Note */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="text-blue-400 text-lg">ℹ️</span>
          <div>
            <h4 className="text-sm font-medium text-blue-400">Regulatory Requirement</h4>
            <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
              Under EU Dual-Use Regulation 2021/821 and US EAR Part 744, exporters must obtain and retain
              End User Statements for all controlled dual-use items. Statements must be kept for a minimum
              of 5 years from the date of export and made available to competent authorities upon request.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
