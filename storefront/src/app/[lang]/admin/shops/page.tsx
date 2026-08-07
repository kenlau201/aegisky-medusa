'use client';

import { useEffect, useState } from 'react';

export default function ShopsAdminPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/shops')
      .then(r => r.json())
      .then(data => {
        setShops(data.shops || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredShops = shops.filter((s: any) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search && !s.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/shops/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setShops(shops.map((s: any) => s.id === id ? { ...s, status } : s));
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">店铺管理</h1>
          <p className="text-gray-500 mt-1">共 {shops.length} 家店铺</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + 新增店铺
        </button>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="搜索店铺名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">全部状态</option>
            <option value="active">营业中</option>
            <option value="pending">待审核</option>
            <option value="disabled">已禁用</option>
          </select>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">店铺信息</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">联系人</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredShops.map((shop: any) => (
              <tr key={shop.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {shop.logo_url ? (
                      <img src={shop.logo_url} className="w-10 h-10 rounded object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">🏪</div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{shop.name}</div>
                      <div className="text-sm text-gray-500">{shop.description || '暂无描述'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div>{shop.contact_name || '-'}</div>
                  <div className="text-gray-400">{shop.contact_phone || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    shop.status === 'active' ? 'bg-green-100 text-green-700' :
                    shop.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {shop.status === 'active' ? '营业中' : shop.status === 'pending' ? '待审核' : '已禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {shop.is_self_operated ? (
                    <span className="text-blue-600">自营店铺</span>
                  ) : (
                    <span>入驻店铺</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:underline text-sm">编辑</button>
                    {shop.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(shop.id, 'active')} className="text-green-600 hover:underline text-sm">通过</button>
                        <button onClick={() => updateStatus(shop.id, 'disabled')} className="text-red-600 hover:underline text-sm">拒绝</button>
                      </>
                    )}
                    {shop.status === 'active' && (
                      <button onClick={() => updateStatus(shop.id, 'disabled')} className="text-red-600 hover:underline text-sm">禁用</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredShops.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  暂无店铺数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
