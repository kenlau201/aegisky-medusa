'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Search, Plus, Edit, Eye, Package, CheckCircle, XCircle } from 'lucide-react'

interface Supplier {
  id: number
  name: string
  slug: string
  logo: string | null
  description: string | null
  product_count: number
  status: string
  contact_name: string | null
  contact_email: string | null
  created_at: string
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  useEffect(() => {
    fetchSuppliers()
  }, [page])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/brands?page=${page}&pageSize=${perPage}`)
      const data = await res.json()
      setSuppliers(data.brands || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const filtered = suppliers.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={24} /> 供应商管理
          </h1>
          <p className="text-gray-500 text-sm mt-1">管理所有供应商/品牌信息</p>
        </div>
        <Link href="/en/admin/products/brands" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={16} /> 管理品牌
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">供应商总数</div>
          <div className="text-2xl font-bold text-gray-900">{suppliers.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">有商品的供应商</div>
          <div className="text-2xl font-bold text-green-600">{suppliers.filter(s => s.product_count > 0).length}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">无商品的供应商</div>
          <div className="text-2xl font-bold text-yellow-600">{suppliers.filter(s => !s.product_count).length}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">总商品数</div>
          <div className="text-2xl font-bold text-blue-600">{suppliers.reduce((sum, s) => sum + (s.product_count || 0), 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索供应商名称..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">供应商</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">商品数</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">加载中...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">暂无供应商</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo} alt={s.name} className="w-10 h-10 object-contain rounded bg-gray-50" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-400">
                        {s.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-400">ID: {s.id} | {s.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Package size={14} /> {s.product_count || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{s.description || '-'}</td>
                <td className="px-4 py-3">
                  {s.product_count > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <CheckCircle size={12} /> 活跃
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      <XCircle size={12} /> 无商品
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/en/brand/${s.slug}`} className="p-1 text-gray-400 hover:text-blue-600" title="查看">
                      <Eye size={16} />
                    </Link>
                    <Link href={`/en/admin/products/brands`} className="p-1 text-gray-400 hover:text-blue-600" title="编辑">
                      <Edit size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
