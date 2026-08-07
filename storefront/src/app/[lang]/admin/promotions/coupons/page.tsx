'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  expired: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  active: '进行中',
  inactive: '已停用',
  expired: '已过期',
};

export default function CouponsAdminPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'fixed',
    discount_amount: '10',
    discount_percentage: '10',
    min_spend: '0',
    total_issue: '100',
    per_user_limit: '1',
  });

  const loadCoupons = () => {
    setLoading(true);
    fetch('/api/admin/coupons?page=1&pageSize=50')
      .then(r => r.json())
      .then(data => {
        setCoupons(data.coupons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          discount_amount: parseFloat(form.discount_amount) || 0,
          discount_percentage: parseFloat(form.discount_percentage) || 0,
          min_spend: parseFloat(form.min_spend) || 0,
          total_issue: parseInt(form.total_issue) || 100,
          per_user_limit: parseInt(form.per_user_limit) || 1,
        }),
      });
      if (res.ok) {
        alert('优惠券创建成功');
        setShowCreate(false);
        setForm({ name: '', type: 'fixed', discount_amount: '10', discount_percentage: '10', min_spend: '0', total_issue: '100', per_user_limit: '1' });
        loadCoupons();
      } else {
        const err = await res.json();
        alert('创建失败: ' + err.error);
      }
    } catch (e: any) { alert('创建失败: ' + e.message); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (coupon: any) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">优惠券管理</h1>
          <p className="text-gray-500 mt-1">创建和管理优惠券</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + 创建优惠券
        </button>
      </div>

      {/* 创建弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">创建优惠券</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优惠券名称 *</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例如：新人立减10元"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优惠类型</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="fixed" checked={form.type === 'fixed'} onChange={e => setForm({ ...form, type: e.target.value })} />
                    <span>满减（固定金额）</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="percentage" checked={form.type === 'percentage'} onChange={e => setForm({ ...form, type: e.target.value })} />
                    <span>折扣（百分比）</span>
                  </label>
                </div>
              </div>

              {form.type === 'fixed' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">优惠金额 ($)</label>
                  <input type="number" step="0.01" value={form.discount_amount} onChange={e => setForm({ ...form, discount_amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">折扣百分比 (%)</label>
                  <input type="number" step="0.1" value={form.discount_percentage} onChange={e => setForm({ ...form, discount_percentage: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最低消费 ($)</label>
                  <input type="number" step="0.01" value={form.min_spend} onChange={e => setForm({ ...form, min_spend: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发放总量</label>
                  <input type="number" value={form.total_issue} onChange={e => setForm({ ...form, total_issue: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">每人限领</label>
                <input type="number" value={form.per_user_limit} onChange={e => setForm({ ...form, per_user_limit: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">取消</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? '创建中...' : '创建优惠券'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">名称</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">优惠</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">门槛</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">已领/总量</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">有效期至</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : coupons.length > 0 ? coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4">
                  {c.type === 'fixed' ? `减 $${c.discount_amount}` : `${c.discount_percentage}% 折扣`}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {c.min_spend > 0 ? `满 $${c.min_spend}` : '无门槛'}
                </td>
                <td className="px-6 py-4 text-gray-600">{c.used_count || 0} / {c.total_issue}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[c.status] || 'bg-gray-100'}`}>
                    {statusLabels[c.status] || c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {c.end_at ? new Date(c.end_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStatus(c)}
                    className={`text-sm ${c.status === 'active' ? 'text-orange-600 hover:underline' : 'text-green-600 hover:underline'}`}
                  >
                    {c.status === 'active' ? '停用' : '启用'}
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">暂无优惠券，点击右上角创建</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
