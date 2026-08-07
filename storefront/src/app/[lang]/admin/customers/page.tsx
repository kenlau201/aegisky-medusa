'use client';

import { useEffect, useState } from 'react';
import CustomerDetailModal from './CustomerDetailModal';

const levelColors: Record<string, string> = {
  '普通会员': 'bg-gray-100 text-gray-700',
  '白银会员': 'bg-slate-100 text-slate-700',
  '铂金会员': 'bg-blue-100 text-blue-700',
  '钻石会员': 'bg-cyan-100 text-cyan-700',
  '至尊会员': 'bg-amber-100 text-amber-700',
};

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ email: '', phone: '', first_name: '', last_name: '', password: '' });
  const pageSize = 20;

  const handleAdd = async () => {
    if (!formData.email) { alert('请输入邮箱'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ email: '', phone: '', first_name: '', last_name: '', password: '' });
        load();
      } else {
        const data = await res.json();
        alert(data.error || '创建失败');
      }
    } catch (e) { alert('创建失败'); }
    setSaving(false);
  };

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/customers?page=${page}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`)
      .then(r => r.json())
      .then(data => {
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">客户列表</h1>
          <p className="text-gray-500 mt-1">共 {total} 位客户</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">+ 添加客户</button>
      </div>

      <div className="bg-white rounded-xl border p-4 flex gap-4">
        <input
          type="text" placeholder="搜索用户名/邮箱/手机号..."
          value={keyword} onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (setPage(1), load())}
          className="px-4 py-2 border rounded-lg w-80 text-sm"
        />
        <select className="px-3 py-2 border rounded-lg text-sm w-32">
          <option>全部等级</option>
          <option>普通会员</option>
          <option>白银会员</option>
          <option>铂金会员</option>
          <option>钻石会员</option>
          <option>至尊会员</option>
        </select>
        <button onClick={() => { setPage(1); load(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">搜索</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">客户信息</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">联系方式</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">等级</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">积分</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">累计消费</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">订单数</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">注册时间</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : customers.length > 0 ? customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {(c.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{c.email}</div>
                      <div className="text-xs text-gray-500">ID: {typeof c.id === 'string' ? c.id.slice(0, 8) : c.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div>{c.email || '-'}</div>
                  <div className="text-gray-500">{c.phone || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${levelColors[c.level_name] || 'bg-gray-100'}`}>
                    {c.level_name || '普通会员'}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-sm">{c.points || 0}</td>
                <td className="px-6 py-4 font-medium text-sm text-red-600">${(c.total_spent || 0).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">{c.order_count || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex w-2 h-2 rounded-full mr-2 ${c.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-sm">{c.status === 'active' ? '正常' : '禁用'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      详情
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="text-blue-600 hover:text-blue-800">编辑</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">暂无客户数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">上一页</button>
          <span className="px-3 py-1 text-sm">第 {page} / {Math.ceil(total / pageSize)} 页</span>
          <button disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">下一页</button>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-[480px]">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-bold">添加客户</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">邮箱 <span className="text-red-500">*</span></label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" placeholder="customer@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">名</label>
                  <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">姓</label>
                  <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">手机号</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">密码</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded text-sm" placeholder="留空则自动生成" />
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
