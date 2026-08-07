'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Package, ArrowUpRight, ArrowDownRight, History, SlidersHorizontal, Download } from 'lucide-react'

interface InventoryItem {
  id: number
  name: string
  sku: string
  stock_quantity: number
  in_stock: boolean
  shop_name: string | null
  price: number
  image_count: number
}

export default function InventorySearchPage() {
  const [products, setProducts] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 20

  useEffect(() => {
    fetchInventory()
  }, [page, search, stockFilter])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(perPage) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      let items = data.products || []
      if (stockFilter === 'instock') items = items.filter((p: InventoryItem) => p.in_stock && p.stock_quantity > 0)
      if (stockFilter === 'lowstock') items = items.filter((p: InventoryItem) => p.in_stock && p.stock_quantity > 0 && p.stock_quantity <= 10)
      if (stockFilter === 'outofstock') items = items.filter((p: InventoryItem) => !p.in_stock || p.stock_quantity === 0)
      setProducts(items)
      setTotal(data.total || 0)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const totalPages = Math.ceil(total / perPage)
  const inStockCount = products.filter(p => p.in_stock && p.stock_quantity > 0).length
  const lowStockCount = products.filter(p => p.in_stock && p.stock_quantity > 0 && p.stock_quantity <= 10).length
  const outOfStockCount = products.filter(p => !p.in_stock || p.stock_quantity === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">库存查询</h1>
          <p className="text-gray-500 text-sm mt-1">查看和管理商品库存</p>
        </div>
        <div className="flex gap-2">
          <Link href="/en/admin/inventory/inbound" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            <ArrowUpRight size={16} /> 入库
          </Link>
          <Link href="/en/admin/inventory/outbound" className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
            <ArrowDownRight size={16} /> 出库
          </Link>
          <Link href="/en/admin/inventory/logs" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
            <History size={16} /> 日志
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">商品总数</div>
          <div className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">有货</div>
          <div className="text-2xl font-bold text-green-600">{inStockCount}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">低库存(≤10)</div>
          <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">缺货</div>
          <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索商品名称/SKU..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={stockFilter}
            onChange={e => { setStockFilter(e.target.value); setPage(1) }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">全部状态</option>
            <option value="instock">有货</option>
            <option value="lowstock">低库存</option>
            <option value="outofstock">缺货</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Download size={16} /> 导出
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">店铺</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">库存</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
            ) : products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-gray-300" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">{p.name}</div>
                      <div className="text-xs text-gray-400">ID: {p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.sku || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.shop_name || '自营店铺'}</td>
                <td className="px-4 py-3 text-sm font-medium text-red-600">${p.price}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-semibold ${p.stock_quantity === 0 ? 'text-red-600' : p.stock_quantity <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {p.stock_quantity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.in_stock && p.stock_quantity > 0 ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">有货</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">缺货</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/en/admin/inventory/adjust?productId=${p.id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                    调整
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <div className="text-sm text-gray-500">共 {total.toLocaleString()} 条记录</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
              >上一页</button>
              <span className="px-3 py-1 text-sm text-gray-600">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
              >下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
