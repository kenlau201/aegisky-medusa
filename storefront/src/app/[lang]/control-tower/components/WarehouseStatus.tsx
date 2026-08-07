'use client'

import React, { useEffect, useState } from 'react'

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

interface Warehouse {
  warehouse: string
  name: string
  country: string
  zone: string
  total_skus: number
  total_units: number
  total_reserved: number
  available_units: number
}

const WAREHOUSE_ICONS: Record<string, string> = {
  Poland_Central: '🇵🇱',
  Germany_North: '🇩🇪',
  UAE_Freezone: '🇦🇪',
  Singapore_Hub: '🇸🇬',
  US_West: '🇺🇸',
}

const ZONE_COLORS: Record<string, string> = {
  EU_EAST: 'bg-[#0071E3]',
  EU_WEST: 'bg-[#30D158]',
  MIDDLE_EAST: 'bg-[#FF9F0A]',
  APAC: 'bg-[#BF5AF2]',
  AMERICAS: 'bg-[#FF453A]',
}

export default function WarehouseStatus() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWarehouses()
    const interval = setInterval(fetchWarehouses, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/control-tower/inventory/status', {
        headers: { 'X-AEGISKY-TENANT-ID': TENANT_ID },
      })
      if (res.ok) {
        const data = await res.json()
        setWarehouses(data.warehouses || [])
      }
    } catch (e) {
      console.error('Failed to fetch warehouses:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-[#86868B] text-xs">Loading warehouse status...</div>
  }

  return (
    <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Global Warehouse Network</h3>
          <p className="text-xs text-[#86868B] mt-1">Real-time inventory levels across 5 strategic hubs</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
          <span className="text-[10px] text-[#30D158] font-mono tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        {warehouses.map((wh) => {
          const utilization = wh.total_units > 0 ? (wh.total_reserved / wh.total_units) * 100 : 0
          return (
            <div key={wh.warehouse} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{WAREHOUSE_ICONS[wh.warehouse] || '🏭'}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{wh.name}</div>
                    <div className="text-[10px] text-[#86868B] font-mono">
                      {wh.warehouse} · {wh.zone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white">{wh.available_units.toLocaleString()}</div>
                  <div className="text-[10px] text-[#86868B]">available / {wh.total_units.toLocaleString()}</div>
                </div>
              </div>

              {/* 库存条 */}
              <div className="h-2 bg-[#2C2C2E] rounded-full overflow-hidden">
                <div
                  className={`h-full ${ZONE_COLORS[wh.zone] || 'bg-[#0071E3]'} transition-all duration-500`}
                  style={{ width: `${Math.min(100, utilization)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[#86868B]">{wh.total_skus} SKUs</span>
                <span className="text-[10px] text-[#86868B]">{utilization.toFixed(0)}% reserved</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
