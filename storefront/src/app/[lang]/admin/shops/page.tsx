'use client';

import { useEffect, useState } from 'react';
import ShopDetailModal from './ShopDetailModal';

export default function ShopsAdminPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact_name: '', contact_phone: '', description: '' });
  const [saving, setSaving] = useState(false);

  const refreshShops = async () => {
    const res = await fetch('/api/admin/shops');
    const data = await res.json();
    setShops(data.shops || []);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) { alert('请输入店铺名称'); return; }
    setSaving(true);
    try {
      await fetch('/api/admin/shops', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'pending', is_self_operated: false })
      });
      await refreshShops();
      setShowAddModal(false);
      setFormData({ name: '', contact_name: '', contact_phone: '', description: '' });
    } catch (e) { alert('创建失败'); } finally { setSaving(false); }
  };

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
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
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
            className="px-4 py-2 border rounded-lg w-64 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="all">全部状态</option>
            <option value="approved">营业中</option>
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
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">店铺信息</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">联系人</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">类型</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">操作</th>
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
                      <div className="font-medium text-gray-900 text-sm">{shop.name}</div>
                      <div className="text-xs text-gray-500">{shop.description || '暂无描述'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div>{shop.contact_name || '-'}</div>
                  <div className="text-gray-400 text-xs">{shop.contact_phone || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    shop.status === 'approved' ? 'bg-green-100 text-green-700' :
                    shop.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {shop.status === 'approved' ? '营业中' : shop.status === 'pending' ? '待审核' : '已禁用'}
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
                  <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <button
                      onClick={() => setSelectedShop(shop)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      详情
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => setSelectedShop(shop)} className="text-blue-600 hover:text-blue-800">编辑</button>
                    {shop.status === 'pending' && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => updateStatus(shop.id, 'approved')} className="text-green-600 hover:text-green-800">通过</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => updateStatus(shop.id, 'disabled')} className="text-red-600 hover:text-red-800">拒绝</button>
                      </>
                    )}
                    {shop.status === 'approved' && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => updateStatus(shop.id, 'disabled')} className="text-red-600 hover:text-red-800">禁用</button>
                      </>
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

      {selectedShop && (
        <ShopDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}

      {/* 新增店铺弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-[500px]">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-bold">新增店铺</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">店铺名称 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" placeholder="输入店铺名称" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">联系人</label>
                <input type="text" value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" placeholder="联系人姓名" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">联系电话</label>
                <input type="text" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" placeholder="联系电话" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">店铺描述</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" placeholder="店铺简介" />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
              <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">{saving ? '创建中...' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
