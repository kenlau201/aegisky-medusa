'use client';

import { useState } from 'react';

export default function CouponEditModal({ coupon, onClose, onSave }: { coupon?: any; onClose: () => void; onSave?: () => void }) {
  const [form, setForm] = useState({
    name: coupon?.name || '',
    type: coupon?.type || 'fixed',
    discount_amount: coupon?.discount_amount || 0,
    discount_percentage: coupon?.discount_percentage || 0,
    min_spend: coupon?.min_spend || 0,
    total_issue: coupon?.total_issue || 100,
    per_user_limit: coupon?.per_user_limit || 1,
    start_at: coupon?.start_at ? new Date(coupon.start_at).toISOString().slice(0, 16) : '',
    end_at: coupon?.end_at ? new Date(coupon.end_at).toISOString().slice(0, 16) : '',
  });

  const handleSubmit = async () => {
    if (!form.name) {
      alert('请输入优惠券名称');
      return;
    }

    const method = coupon ? 'PUT' : 'POST';
    const url = coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[550px]">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold">{coupon ? '编辑优惠券' : '创建优惠券'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">优惠券名称 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="例如：新人专享立减20美元"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">优惠类型</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="fixed"
                  checked={form.type === 'fixed'}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-4 h-4"
                />
                <span className="text-sm">满减券（固定金额）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="percentage"
                  checked={form.type === 'percentage'}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-4 h-4"
                />
                <span className="text-sm">折扣券（百分比）</span>
              </label>
            </div>
          </div>

          {form.type === 'fixed' ? (
            <div>
              <label className="block text-sm font-medium mb-1">优惠金额 ($)</label>
              <input
                type="number"
                value={form.discount_amount}
                onChange={e => setForm({ ...form, discount_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">折扣比例 (%)</label>
              <input
                type="number"
                value={form.discount_percentage}
                onChange={e => setForm({ ...form, discount_percentage: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded text-sm"
                min="1" max="99"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">最低消费 ($)</label>
            <input
              type="number"
              value={form.min_spend}
              onChange={e => setForm({ ...form, min_spend: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="0 表示无门槛"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">发放总量</label>
              <input
                type="number"
                value={form.total_issue}
                onChange={e => setForm({ ...form, total_issue: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">每人限领</label>
              <input
                type="number"
                value={form.per_user_limit}
                onChange={e => setForm({ ...form, per_user_limit: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">开始时间</label>
              <input
                type="datetime-local"
                value={form.start_at}
                onChange={e => setForm({ ...form, start_at: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">结束时间</label>
              <input
                type="datetime-local"
                value={form.end_at}
                onChange={e => setForm({ ...form, end_at: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            {coupon ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  );
}
