'use client'

import React, { useState } from 'react'

interface ScreeningResult {
  match_found: boolean
  match_score: number
  matched_party?: {
    name: string
    country: string
    list: string
    reason: string
  }
  recommendation: string
}

export default function ScreeningTool() {
  const [entityName, setEntityName] = useState('')
  const [entityCountry, setEntityCountry] = useState('')
  const [screening, setScreening] = useState(false)
  const [result, setResult] = useState<ScreeningResult | null>(null)
  const [history, setHistory] = useState<any[]>([])

  const runScreening = async () => {
    if (!entityName) return
    setScreening(true)
    setResult(null)

    try {
      const res = await fetch('/api/control-tower/screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
        },
        body: JSON.stringify({
          entity_name: entityName,
          entity_country: entityCountry,
          entity_type: 'COMPANY'
        })
      })
      const data = await res.json()
      setResult(data)
      setHistory(prev => [data.screening, ...prev].slice(0, 10))
    } catch (e) {
      console.error(e)
    } finally {
      setScreening(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-red-500'
    if (score >= 75) return 'text-orange-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  const listsChecked = [
    { code: 'SDN', name: 'OFAC SDN List', country: 'US' },
    { code: 'ENTITY_LIST', name: 'BIS Entity List', country: 'US' },
    { code: 'DENIED_PERSONS', name: 'Denied Persons List', country: 'US' },
    { code: 'UN_1267', name: 'UN 1267 Sanctions', country: 'UN' },
    { code: 'EU_SANCTIONS', name: 'EU Sanctions List', country: 'EU' },
    { code: 'UK_HMT', name: 'UK HMT Sanctions', country: 'UK' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Denied Party Screening</h2>
        <p className="text-sm text-[#86868B] mt-1">
          Screen entities against global sanctions and denied party lists (OFAC, BIS, UN, EU)
        </p>
      </div>

      {/* Screening Form */}
      <div className="bg-[#1C1C1E] rounded-xl p-6 border border-[#2D2D2E]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-[#86868B] block mb-2">Entity Name *</label>
            <input
              type="text"
              value={entityName}
              onChange={e => setEntityName(e.target.value)}
              placeholder="Company name, individual, or organization"
              className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-4 py-3 text-white text-sm focus:border-[#0071E3] focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && runScreening()}
            />
          </div>
          <div>
            <label className="text-xs text-[#86868B] block mb-2">Country</label>
            <input
              type="text"
              value={entityCountry}
              onChange={e => setEntityCountry(e.target.value)}
              placeholder="Country code (e.g., DE)"
              className="w-full bg-[#2D2D2E] border border-[#3A3A3C] rounded-lg px-4 py-3 text-white text-sm focus:border-[#0071E3] focus:outline-none"
              maxLength={2}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#86868B]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Screening against {listsChecked.length} global lists with fuzzy matching
          </div>
          <button
            onClick={runScreening}
            disabled={screening || !entityName}
            className="px-6 py-2.5 bg-[#0071E3] text-white text-sm font-medium rounded-lg hover:bg-[#0077ED] disabled:opacity-50 transition"
          >
            {screening ? 'Screening...' : 'Run Screening'}
          </button>
        </div>
      </div>

      {/* Lists Checked */}
      <div className="flex flex-wrap gap-2">
        {listsChecked.map(list => (
          <div key={list.code} className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1E] rounded-lg border border-[#2D2D2E]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-[#E5E5EA]">{list.name}</span>
            <span className="text-[10px] text-[#86868B]">{list.country}</span>
          </div>
        ))}
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-xl p-6 border ${
          result.match_found
            ? result.match_score >= 90
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
            : 'bg-green-500/10 border-green-500/30'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{result.match_found ? '⚠️' : '✅'}</span>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    result.match_found
                      ? result.match_score >= 90 ? 'text-red-400' : 'text-orange-400'
                      : 'text-green-400'
                  }`}>
                    {result.match_found ? 'Potential Match Detected' : 'No Matches Found'}
                  </h3>
                  <p className="text-sm text-[#86868B] mt-0.5">{result.recommendation}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(result.match_score)}`}>
                {result.match_score}%
              </div>
              <div className="text-xs text-[#86868B]">Match Score</div>
            </div>
          </div>

          {result.matched_party && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-[#86868B]">Matched Name</div>
                  <div className="text-sm text-white font-medium">{result.matched_party.name}</div>
                </div>
                <div>
                  <div className="text-xs text-[#86868B]">Country</div>
                  <div className="text-sm text-white">{result.matched_party.country}</div>
                </div>
                <div>
                  <div className="text-xs text-[#86868B]">List</div>
                  <div className="text-sm text-white">{result.matched_party.list}</div>
                </div>
                <div>
                  <div className="text-xs text-[#86868B]">Reason</div>
                  <div className="text-sm text-white">{result.matched_party.reason}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Screenings */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Recent Screenings</h3>
          <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] overflow-hidden">
            {history.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[#2D2D2E] last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${item.match_found ? 'bg-orange-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="text-sm text-white">{item.entity_name}</div>
                    <div className="text-xs text-[#86868B]">{item.entity_country || 'N/A'} · {new Date(item.screened_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono ${getScoreColor(item.match_score)}`}>{item.match_score}%</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    item.status === 'CLEARED' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
