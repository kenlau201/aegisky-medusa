'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, Search, Check } from 'lucide-react'
import Link from 'next/link'

export default function InboundPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (search.length < 2) { setProducts([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/admin/products?page=1&pageSize=10&search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setProducts(data.products || [])
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSubmit = async () => {
    if (!selectedProduct || quantity <= 0) return
    setSaving(true)
    try {
      await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          type: 'inbound',
          reason: reason || '采购入库'
        })
      })
      setSuccess(true)
      setSelectedProduct(null)
      setQuantity(1)
      setReason('')
      setSearch('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      alert('操作失败')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/en/admin/inventory/search" className="text-blue-600 text-sm hover:underline">← 返回库存查询</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
          <ArrowUpRight size={24} className="text-green-600" /> 商品入库
        </h1>
        <p className="text-gray-500 text-sm mt-1">增加商品库存数量</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <Check size={20} /> 入库成功！库存已更新。
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 space-y-5">
        {/* Product selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择商品</label>
          {selectedProduct ? (
            <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                <div className="text-sm text-gray-500">SKU: {selectedProduct.sku || '-'} | 当前库存: {selectedProduct.stock_quantity ?? 100}</div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-red-600 text-sm hover:underline">更换</button>
            </div>
          ) : (
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="输入商品名称或SKU搜索..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {products.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProduct(p); setSearch(''); setProducts([]) }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-gray-400 text-xs">ID: {p.id} | 库存: {p.stock_quantity ?? 100}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">入库数量</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">入库原因</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">请选择</option>
            <option value="采购入库">采购入库</option>
            <option value="退货入库">退货入库</option>
            <option value="盘盈入库">盘盈入库</option>
            <option value="调拨入库">调拨入库</option>
            <option value="其他">其他</option>
          </select>
        </div>

        {/* Preview */}
        {selectedProduct && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <div className="text-gray-600">当前库存: <span className="font-medium">{selectedProduct.stock_quantity ?? 100}</span></div>
            <div className="text-gray-600">入库数量: <span className="font-medium text-green-600">+{quantity}</span></div>
            <div className="text-gray-900 font-semibold mt-1">入库后库存: {(selectedProduct.stock_quantity ?? 100) + quantity}</div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedProduct || quantity <= 0 || saving}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? '提交中...' : '确认入库'}
        </button>
      </div>
    </div>
  )
}
