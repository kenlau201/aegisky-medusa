'use client'

import { useState, useEffect } from 'react'
import { History, ArrowUpRight, ArrowDownRight, RefreshCw, Search } from 'lucide-react'

interface LogEntry {
  id: number
  product_id: number
  product_name: string
  type: 'inbound' | 'outbound' | 'adjust'
  quantity: number
  before_qty: number
  after_qty: number
  reason: string
  operator: string
  created_at: string
}

export default function InventoryLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Try to fetch from API, fall back to empty
    fetch('/api/admin/inventory/logs')
      .then(r => r.ok ? r.json() : { logs: [] })
      .then(data => setLogs(data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  const typeConfig = {
    inbound: { label: '入库', color: 'bg-green-100 text-green-700', icon: ArrowUpRight },
    outbound: { label: '出库', color: 'bg-orange-100 text-orange-700', icon: ArrowDownRight },
    adjust: { label: '调整', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  }

  const filtered = logs.filter(l => {
    if (filterType !== 'all' && l.type !== filterType) return false
    if (search && !l.product_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">库存日志</h1>
        <p className="text-gray-500 text-sm mt-1">查看所有库存变动记录</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索商品..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="all">全部类型</option>
          <option value="inbound">入库</option>
          <option value="outbound">出库</option>
          <option value="adjust">调整</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">变动</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">变动前</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">变动后</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">原因</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作人</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <History size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400">暂无库存变动记录</p>
                  <p className="text-gray-300 text-sm mt-1">进行入库、出库或调整操作后，记录将显示在此</p>
                </td>
              </tr>
            ) : filtered.map(log => {
              const cfg = typeConfig[log.type]
              const Icon = cfg.icon
              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${cfg.color}`}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{log.product_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {log.quantity > 0 ? '+' : ''}{log.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{log.before_qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{log.after_qty}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{log.reason || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{log.operator || 'admin'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
