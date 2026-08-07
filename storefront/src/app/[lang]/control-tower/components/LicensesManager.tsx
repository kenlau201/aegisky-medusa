'use client'

import React, { useState, useEffect } from 'react'

interface License {
  id: string
  license_number: string
  issuing_authority: string
  issuing_country: string
  license_type: string
  eccn_codes: string[]
  consignee_name: string
  consignee_country: string
  items_description: string
  quantity_approved: number
  quantity_used: number
  issue_date: string
  expiry_date: string
  status: string
  conditions?: string
}

export default function LicensesManager() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [usageAmount, setUsageAmount] = useState('')

  useEffect(() => {
    fetchLicenses()
  }, [])

  const fetchLicenses = async () => {
    try {
      const res = await fetch('/api/control-tower/licenses', {
        headers: { 'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d' }
      })
      const data = await res.json()
      setLicenses(data.licenses || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const recordUsage = async (licenseId: string) => {
    if (!usageAmount) return
    await fetch(`/api/control-tower/licenses/${licenseId}/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
      },
      body: JSON.stringify({ quantity_used: parseInt(usageAmount) })
    })
    setUsageAmount('')
    setSelectedLicense(null)
    fetchLicenses()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'EXPIRED': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'SUSPENDED': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      INDIVIDUAL: 'Individual License',
      DISTRIBUTION: 'Distribution License',
      COMPREHENSIVE: 'Comprehensive License',
      GENERAL_EU: 'EU General Authorization',
      NLR: 'No License Required',
      GOVT: 'Government End Use',
      TEMPORARY: 'Temporary Export'
    }
    return types[type] || type
  }

  if (loading) return <div className="text-[#86868B] text-sm">Loading licenses...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Export Licenses</h2>
          <p className="text-sm text-[#86868B] mt-1">Manage export authorizations and track license usage</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-[#0071E3] text-white text-xs font-medium rounded-lg hover:bg-[#0077ED] transition"
        >
          + Register License
        </button>
      </div>

      {/* License Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1C1C1E] rounded-xl p-4 border border-[#2D2D2E]">
          <div className="text-2xl font-semibold text-white">{licenses.length}</div>
          <div className="text-xs text-[#86868B] mt-1">Total Licenses</div>
        </div>
        <div className="bg-[#1C1C1E] rounded-xl p-4 border border-[#2D2D2E]">
          <div className="text-2xl font-semibold text-green-400">{licenses.filter(l => l.status === 'ACTIVE').length}</div>
          <div className="text-xs text-[#86868B] mt-1">Active</div>
        </div>
        <div className="bg-[#1C1C1E] rounded-xl p-4 border border-[#2D2D2E]">
          <div className="text-2xl font-semibold text-yellow-400">{licenses.filter(l => new Date(l.expiry_date) < new Date(Date.now() + 90*24*60*60*1000) && l.status === 'ACTIVE').length}</div>
          <div className="text-xs text-[#86868B] mt-1">Expiring Soon</div>
        </div>
        <div className="bg-[#1C1C1E] rounded-xl p-4 border border-[#2D2D2E]">
          <div className="text-2xl font-semibold text-blue-400">
            {licenses.reduce((sum, l) => sum + (l.quantity_approved - l.quantity_used), 0)}
          </div>
          <div className="text-xs text-[#86868B] mt-1">Remaining Quantity</div>
        </div>
      </div>

      {/* License List */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2D2D2E]">
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">License #</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">Type</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">Consignee</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">ECCN</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">Usage</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">Expiry</th>
              <th className="text-left text-xs font-medium text-[#86868B] px-4 py-3">Status</th>
              <th className="text-xs font-medium text-[#86868B] px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => {
              const usagePct = (license.quantity_used / license.quantity_approved) * 100
              const isExpiringSoon = new Date(license.expiry_date) < new Date(Date.now() + 90*24*60*60*1000)
              return (
                <tr key={license.id} className="border-b border-[#2D2D2E] hover:bg-[#2D2D2E]/30">
                  <td className="px-4 py-3">
                    <div className="text-sm font-mono text-white">{license.license_number}</div>
                    <div className="text-xs text-[#86868B]">{license.issuing_authority}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#E5E5EA]">{getTypeLabel(license.license_type)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-white">{license.consignee_name}</div>
                    <div className="text-xs text-[#86868B]">{license.consignee_country}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(license.eccn_codes || []).map(eccn => (
                        <span key={eccn} className="px-2 py-0.5 bg-[#0071E3]/20 text-[#0071E3] text-xs rounded font-mono">
                          {eccn}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-24">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#86868B]">{license.quantity_used}/{license.quantity_approved}</span>
                      </div>
                      <div className="h-1.5 bg-[#2D2D2E] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${usagePct > 80 ? 'bg-red-500' : usagePct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${isExpiringSoon ? 'text-yellow-400' : 'text-[#86868B]'}`}>
                      {new Date(license.expiry_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(license.status)}`}>
                      {license.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedLicense(license)}
                      className="text-xs text-[#0071E3] hover:underline"
                    >
                      Record Usage
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Record Usage Modal */}
      {selectedLicense && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedLicense(null)}>
          <div className="bg-[#1C1C1E] rounded-xl p-6 w-full max-w-md border border-[#2D2D2E]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Record License Usage</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#86868B] block mb-1">License</label>
                <div className="text-sm text-white font-mono">{selectedLicense.license_number}</div>
              </div>
              <div>
                <label className="text-xs text-[#86868B] block mb-1">Remaining: {selectedLicense.quantity_approved - selectedLicense.quantity_used} units</label>
                <input
                  type="number"
                  value={usageAmount}
                  onChange={e => setUsageAmount(e.target.value)}
                  className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="Quantity used"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedLicense(null)}
                  className="flex-1 px-4 py-2 border border-[#3A3A3C] text-[#86868B] rounded-lg text-sm hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => recordUsage(selectedLicense.id)}
                  className="flex-1 px-4 py-2 bg-[#0071E3] text-white rounded-lg text-sm hover:bg-[#0077ED]"
                >
                  Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
