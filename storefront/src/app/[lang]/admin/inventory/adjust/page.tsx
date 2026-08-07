'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Search, Check } from 'lucide-react'
import Link from 'next/link'

export default function AdjustPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [newQuantity, setNewQuantity] = useState(0)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check URL for productId
    const params = new URLSearchParams(window.location.search)
    const productId = params.get('productId')
    if (productId) {
      fetch(`/api/admin/products?page=1&pageSize=1&search=${productId}`)
        .then(r => r.json())
        .then(data => {
          if (data.products?.[0]) {
            setSelectedProduct(data.products[0])
            setNewQuantity(data.products[0].stock_quantity ?? 100)
          }
        })
    }
  }, [])

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
    if (!selectedProduct) return
    setSaving(true)
    try {
      await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: newQuantity,
          type: 'adjust',
          reason: reason || '库存盘点调整'
        })
      })
      setSuccess(true)
      setSelectedProduct(null)
      setNewQuantity(0)
      setReason('')
      setSearch('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      alert('操作失败')
    }
    setSaving(false)
  }

  const currentStock = selectedProduct?.stock_quantity ?? 0
  const diff = newQuantity - currentStock

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/en/admin/inventory/search" className="text-blue-600 text-sm hover:underline">← 返回库存查询</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
          <RefreshCw size={24} className="text-blue-600" /> 库存调整
        </h1>
        <p className="text-gray-500 text-sm mt-1">直接设置商品库存数量（盘点修正）</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <Check size={20} /> 调整成功！库存已更新。
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择商品</label>
          {selectedProduct ? (
            <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{selectedProduct.name}</div>
                <div className="text-sm text-gray-500">SKU: {selectedProduct.sku || '-'} | 当前库存: {currentStock}</div>
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
                      onClick={() => { setSelectedProduct(p); setNewQuantity(p.stock_quantity ?? 100); setSearch(''); setProducts([]) }}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">调整后库存数量</label>
          <input
            type="number"
            min="0"
            value={newQuantity}
            onChange={e => setNewQuantity(Number(e.target.value))}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">调整原因</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">请选择</option>
            <option value="库存盘点">库存盘点</option>
            <option value="系统修正">系统修正</option>
            <option value="数据同步">数据同步</option>
            <option value="其他">其他</option>
          </select>
        </div>

        {selectedProduct && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <div className="text-gray-600">当前库存: <span className="font-medium">{currentStock}</span></div>
            <div className="text-gray-600">调整后: <span className="font-medium">{newQuantity}</span></div>
            <div className={`font-semibold mt-1 ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {diff > 0 ? `+${diff}` : diff} ({diff > 0 ? '增加' : diff < 0 ? '减少' : '无变化'})
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedProduct || saving}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? '提交中...' : '确认调整'}
        </button>
      </div>
    </div>
  )
}
