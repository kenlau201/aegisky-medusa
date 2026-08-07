'use client'

import React, { useEffect, useState } from 'react'

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

interface Stats {
  totalInventory: number
  totalReserved: number
  availableUnits: number
  pendingAudits: number
  approvedAudits: number
  rejectedAudits: number
  totalDispatches: number
  warehouseCount: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/control-tower/dashboard', {
        headers: { 'X-AEGISKY-TENANT-ID': TENANT_ID },
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6 animate-pulse h-32" />
        ))}
      </div>
    )
  }

  const statCards = [
    {
      label: 'TOTAL INVENTORY UNITS',
      value: stats?.totalInventory?.toLocaleString() || '0',
      subtext: `${stats?.warehouseCount || 0} global warehouses`,
      color: 'text-white',
      accent: 'bg-[#0071E3]',
    },
    {
      label: 'AVAILABLE FOR DISPATCH',
      value: stats?.availableUnits?.toLocaleString() || '0',
      subtext: `${stats?.totalReserved?.toLocaleString() || 0} units reserved`,
      color: 'text-[#30D158]',
      accent: 'bg-[#30D158]',
    },
    {
      label: 'PENDING COMPLIANCE',
      value: stats?.pendingAudits || 0,
      subtext: `${stats?.approvedAudits || 0} approved | ${stats?.rejectedAudits || 0} rejected`,
      color: 'text-[#FF9F0A]',
      accent: 'bg-[#FF9F0A]',
    },
    {
      label: 'TOTAL DISPATCHES',
      value: stats?.totalDispatches || 0,
      subtext: 'cross-border shipments',
      color: 'text-white',
      accent: 'bg-[#BF5AF2]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, i) => (
        <div
          key={i}
          className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-5 shadow-2xl relative overflow-hidden group hover:border-[#3A3A3C] transition-colors"
        >
          <div className={`absolute top-0 left-0 w-1 h-full ${card.accent} opacity-50 group-hover:opacity-100 transition-opacity`} />
          <div className="text-[10px] font-semibold tracking-[0.15em] text-[#86868B] mb-3">{card.label}</div>
          <div className={`text-3xl font-light ${card.color} mb-1`}>{card.value}</div>
          <div className="text-[10px] text-[#86868B]">{card.subtext}</div>
        </div>
      ))}
    </div>
  )
}
