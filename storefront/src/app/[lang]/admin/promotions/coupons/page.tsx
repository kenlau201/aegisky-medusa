'use client';

import { useEffect, useState } from 'react';
import CouponEditModal from './CouponEditModal';

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
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);

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

  const toggleStatus = async (coupon: any) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('确定删除此优惠券？')) return;
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          + 创建优惠券
        </button>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">名称</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">优惠</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">门槛</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">已领/总量</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">有效期至</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : coupons.length > 0 ? coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-sm">{c.name}</td>
                <td className="px-6 py-4 text-sm font-medium text-red-600">
                  {c.type === 'fixed' ? `减 $${c.discount_amount}` : `${c.discount_percentage}% 折扣`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {c.min_spend > 0 ? `满 $${c.min_spend}` : '无门槛'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.used_count || 0} / {c.total_issue}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[c.status] || 'bg-gray-100'}`}>
                    {statusLabels[c.status] || c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {c.end_at ? new Date(c.end_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <button
                      onClick={() => setEditCoupon(c)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => toggleStatus(c)}
                      className={c.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
                    >
                      {c.status === 'active' ? '停用' : '启用'}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => deleteCoupon(c.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">暂无优惠券，点击右上角创建</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CouponEditModal
          onClose={() => setShowCreate(false)}
          onSave={loadCoupons}
        />
      )}

      {editCoupon && (
        <CouponEditModal
          coupon={editCoupon}
          onClose={() => setEditCoupon(null)}
          onSave={loadCoupons}
        />
      )}
    </div>
  );
}
