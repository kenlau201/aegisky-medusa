'use client'

import React, { useState, useEffect } from 'react'

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

interface Alert {
  id: string
  alert_type: string
  severity: string
  entity_type: string
  entity_id: string
  title: string
  description: string
  status: string
  created_at: string
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  CRITICAL: { bg: 'bg-[#3A1C1C]', border: 'border-[#FF453A]', text: 'text-[#FF453A]', icon: '🔴' },
  HIGH: { bg: 'bg-[#3A2E1C]', border: 'border-[#FF9F0A]', text: 'text-[#FF9F0A]', icon: '🟠' },
  WARNING: { bg: 'bg-[#2C2C2E]', border: 'border-[#FFD60A]', text: 'text-[#FFD60A]', icon: '🟡' },
  INFO: { bg: 'bg-[#1C2C3A]', border: 'border-[#0071E3]', text: 'text-[#0071E3]', icon: '🔵' },
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState({ open: 0, critical: 0, high: 0 })
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/control-tower/alerts/list?status=OPEN', {
        headers: { 'X-AEGISKY-TENANT-ID': TENANT_ID },
      })
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
        setStats(data.stats || { open: 0, critical: 0, high: 0 })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/control-tower/alerts/list', { method: 'POST' }) // 简化，实际应有专门的更新API
      fetchAlerts()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return null

  if (alerts.length === 0) {
    return (
      <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Compliance Alerts</h3>
          <span className="text-[10px] text-[#30D158] bg-[#1C3D22] px-2 py-1 rounded-full">
            SYSTEM NOMINAL
          </span>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✓</div>
          <div className="text-sm text-[#30D158]">No active compliance alerts</div>
          <div className="text-xs text-[#86868B] mt-1">All transactions within risk parameters</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">Compliance Alerts</h3>
          <p className="text-xs text-[#86868B] mt-0.5">
            {stats.open} active · {stats.critical} critical · {stats.high} high
          </p>
        </div>
        {stats.critical > 0 && (
          <span className="text-[10px] text-white bg-[#FF453A] px-3 py-1 rounded-full animate-pulse font-semibold">
            ⚠ ACTION REQUIRED
          </span>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.INFO
          return (
            <div
              key={alert.id}
              className={`${style.bg} border ${style.border} rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01]`}
              onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${style.text}`}>{alert.severity}</span>
                    <span className="text-[10px] text-[#86868B] font-mono">
                      {new Date(alert.created_at).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium">{alert.title}</div>
                  {expanded === alert.id && (
                    <div className="mt-2 text-xs text-[#86868B] leading-relaxed">
                      {alert.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
