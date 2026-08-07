'use client'

import React, { useState, useEffect } from 'react'

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

const ZONES = [
  { code: 'EU_EAST', name: 'Eastern Europe Corridor', warehouse: 'Poland Central Hub', icon: '🇵🇱' },
  { code: 'EU_WEST', name: 'Western Europe Corridor', warehouse: 'Germany North Hub', icon: '🇩🇪' },
  { code: 'MIDDLE_EAST', name: 'Middle East Corridor', warehouse: 'UAE Freezone Hub', icon: '🇦🇪' },
  { code: 'APAC', name: 'Asia Pacific Corridor', warehouse: 'Singapore Hub', icon: '🇸🇬' },
  { code: 'AMERICAS', name: 'Americas Corridor', warehouse: 'US West Hub', icon: '🇺🇸' },
]

const SAMPLE_PRODUCTS = [
  { sku: 'DJI-M300-001', name: 'DJI Matrice 300 RTK' },
  { sku: 'DJI-H20T-001', name: 'Zenmuse H20T Camera' },
  { sku: 'GEPRC-MARK5-001', name: 'GEPRC Mark5 FPV' },
  { sku: 'T-MOTOR-F60-001', name: 'T-Motor F60 Pro V' },
]

interface DispatchResult {
  status: string
  allocated_warehouse?: string
  warehouse_name?: string
  dispatched_quantity?: number
  remaining_available?: number
  estimated_delivery?: string
  total_available?: number
  recommended_action?: string
}

export default function InventoryRouter() {
  const [selectedProduct, setSelectedProduct] = useState(SAMPLE_PRODUCTS[0].sku)
  const [quantity, setQuantity] = useState(100)
  const [telemetryLog, setTelemetryLog] = useState<string>('System on standby. Core telemetry data link established.')
  const [loading, setLoading] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<DispatchResult | null>(null)

  const executeRouting = async (zone: string) => {
    setLoading(zone)
    setTelemetryLog(`[${new Date().toISOString()}] INITIATING: Routing request to ${zone} zone...`)

    try {
      const response = await fetch('/api/control-tower/inventory/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': TENANT_ID,
        },
        body: JSON.stringify({
          product_id: selectedProduct,
          quantity,
          zone,
        }),
      })

      const data = await response.json()
      setLastResult(data)

      if (response.status === 200) {
        setTelemetryLog(
          `[${new Date().toISOString()}] ✅ ROUTING SUCCESS\n` +
          `Warehouse: ${data.warehouse_name} (${data.allocated_warehouse})\n` +
          `Dispatched: ${data.dispatched_quantity} units\n` +
          `ETA: ${data.estimated_delivery}\n` +
          `Remaining: ${data.remaining_available} units`
        )
      } else {
        setTelemetryLog(
          `[${new Date().toISOString()}] ❌ ROUTING BLOCKED\n` +
          `Status: ${data.status}\n` +
          `Total Available: ${data.total_available} units\n` +
          `Action: ${data.recommended_action}`
        )
      }
    } catch {
      setTelemetryLog(`[${new Date().toISOString()}] 💥 CRITICAL: Core pipeline telemetry handshake timeout.`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Automated Cargo Routing</h3>
        <p className="text-xs text-[#86868B] mb-4">
          Simulate and dispatch cross-border inventory allocation instantly based on target destination vectors.
        </p>
      </div>

      {/* 产品和数量选择 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">Product SKU</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono"
          >
            {SAMPLE_PRODUCTS.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.sku}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#86868B] mb-1.5 uppercase tracking-wider">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min={1}
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071E3] font-mono"
          />
        </div>
      </div>

      {/* 区域按钮 */}
      <div className="space-y-2 flex-1">
        {ZONES.map((zone) => (
          <button
            key={zone.code}
            onClick={() => executeRouting(zone.code)}
            disabled={loading !== null}
            className="w-full text-left px-4 py-3 bg-[#2C2C2E] hover:bg-[#3A3A3C] disabled:opacity-50 rounded-xl text-xs transition-all border border-[#3A3A3C] flex justify-between items-center group"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{zone.icon}</span>
              <div>
                <div className="font-medium text-white">{zone.name}</div>
                <div className="text-[10px] text-[#86868B]">{zone.warehouse}</div>
              </div>
            </div>
            {loading === zone.code ? (
              <span className="text-[#FF9F0A] animate-pulse">PROCESSING...</span>
            ) : (
              <span className="text-[#0071E3] group-hover:translate-x-1 transition-transform">Dispatch →</span>
            )}
          </button>
        ))}
      </div>

      {/* 遥测日志 */}
      <div className="mt-4 pt-4 border-t border-[#2D2D2E]">
        <span className="text-[10px] tracking-[0.15em] text-[#86868B] block mb-2 font-mono font-semibold">
          REAL-TIME TELEMETRY LOG
        </span>
        <div className="bg-black p-3 rounded-xl border border-[#2D2D2D] text-[10px] font-mono text-[#30D158] leading-relaxed whitespace-pre-wrap h-32 overflow-y-auto">
          {telemetryLog}
        </div>
      </div>
    </div>
  )
}
