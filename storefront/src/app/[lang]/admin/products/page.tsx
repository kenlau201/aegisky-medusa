'use client';

import { useEffect, useState } from 'react';

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/products?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="text-gray-500 mt-1">共 {total.toLocaleString()} 件商品</p>
        </div>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50">批量导入</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ 新增商品</button>
        </div>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="搜索商品名称/货号..."
            defaultValue={search}
            onKeyDown={(e) => e.key === 'Enter' && setSearch((e.target as HTMLInputElement).value)}
            className="px-4 py-2 border rounded-lg w-64"
          />
          <select className="px-4 py-2 border rounded-lg">
            <option>全部分类</option>
          </select>
          <select className="px-4 py-2 border rounded-lg">
            <option>全部状态</option>
            <option>出售中</option>
            <option>已下架</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">搜索</button>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">商品名称</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">分类</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">价格</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">品牌</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : products.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} className="w-12 h-12 rounded object-cover" alt="" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">📦</div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 max-w-md truncate">{p.name}</div>
                      <div className="text-sm text-gray-500">ID: {p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.category_name || '-'}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">${p.price || '0.00'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.brand_name || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:underline text-sm">编辑</button>
                    <button className="text-red-600 hover:underline text-sm">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页 */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            第 {page} 页 / 共 {totalPages} 页，总计 {total} 条
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
