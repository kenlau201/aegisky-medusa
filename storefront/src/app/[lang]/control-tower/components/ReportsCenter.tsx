'use client'

import React, { useState, useEffect } from 'react'
import { REPORT_TYPES } from '@/lib/control-tower/constants'

export default function ReportsCenter() {
  const [reports, setReports] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState('LICENSE_USAGE')
  const [lastReport, setLastReport] = useState<any>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/control-tower/reports', {
        headers: { 'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d' }
      })
      const data = await res.json()
      setReports(data.reports || [])
    } catch (e) {
      console.error(e)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/control-tower/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
        },
        body: JSON.stringify({ report_type: selectedType })
      })
      const data = await res.json()
      setLastReport(data)
      fetchReports()
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GENERATED': return 'bg-green-500/20 text-green-400'
      case 'SUBMITTED': return 'bg-blue-500/20 text-blue-400'
      case 'DRAFT': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Compliance Reports</h2>
        <p className="text-sm text-[#86868B] mt-1">
          Generate regulatory reports for BIS, EU authorities, and internal compliance audits
        </p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map(rt => (
          <div
            key={rt.code}
            onClick={() => setSelectedType(rt.code)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              selectedType === rt.code
                ? 'bg-[#0071E3]/10 border-[#0071E3]'
                : 'bg-[#1C1C1E] border-[#2D2D2E] hover:border-[#3A3A3C]'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-white">{rt.label}</h4>
              <span className="text-[10px] px-2 py-0.5 bg-[#2D2D2E] text-[#86868B] rounded">{rt.frequency}</span>
            </div>
            <p className="text-xs text-[#86868B] leading-relaxed">{rt.description}</p>
            {rt.due_date && <p className="text-[10px] text-yellow-500 mt-2">Due: {rt.due_date}</p>}
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex items-center justify-between bg-[#1C1C1E] rounded-xl p-4 border border-[#2D2D2E]">
        <div>
          <h4 className="text-sm font-medium text-white">Generate {REPORT_TYPES.find(r => r.code === selectedType)?.label}</h4>
          <p className="text-xs text-[#86868B] mt-0.5">Report will cover the current period to date</p>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="px-6 py-2.5 bg-[#0071E3] text-white text-sm font-medium rounded-lg hover:bg-[#0077ED] disabled:opacity-50 transition"
        >
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Last Report Preview */}
      {lastReport && lastReport.report_data && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <h4 className="text-sm font-medium text-green-400 mb-3">
            ✓ Report Generated: {lastReport.report.report_number}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(lastReport.report_data)
              .filter(([k, v]) => typeof v === 'number')
              .map(([key, value]) => (
                <div key={key}>
                  <div className="text-lg font-semibold text-white">{String(value)}</div>
                  <div className="text-xs text-[#86868B] capitalize">{key.replace(/_/g, ' ')}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Report History */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2D2D2E]">
          <h3 className="text-sm font-medium text-white">Report History</h3>
        </div>
        {reports.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#86868B] text-sm">No reports generated yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2D2D2E]">
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Report #</th>
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Type</th>
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Period</th>
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Generated</th>
                <th className="text-left text-xs font-medium text-[#86868B] px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(rpt => (
                <tr key={rpt.id} className="border-b border-[#2D2D2E]">
                  <td className="px-4 py-3 font-mono text-xs text-white">{rpt.report_number}</td>
                  <td className="px-4 py-3 text-sm text-white">{rpt.report_type}</td>
                  <td className="px-4 py-3 text-xs text-[#86868B]">
                    {rpt.period_start ? new Date(rpt.period_start).toLocaleDateString() : '—'} to {rpt.period_end ? new Date(rpt.period_end).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#86868B]">{new Date(rpt.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(rpt.status)}`}>{rpt.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Keeping Note */}
      <div className="bg-[#1C1C1E] rounded-xl p-4 border border-[#2D2D2E]">
        <div className="flex gap-3">
          <span className="text-lg">📋</span>
          <div>
            <h4 className="text-sm font-medium text-white">Record Keeping Requirements</h4>
            <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
              Per US EAR §762.2 and EU Dual-Use Regulation Article 23, all export records including
              licenses, EUS, screening results, and shipping documents must be retained for
              <strong className="text-white"> 5 years </strong>
              from the date of export. Records must be made available to competent authorities
              within 24 hours of request.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
