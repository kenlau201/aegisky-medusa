'use client';

import { useEffect, useState } from 'react';

export default function PromotionsAdminPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [tab, setTab] = useState('activities');

  useEffect(() => {
    fetch('/api/admin/promotions')
      .then(r => r.json())
      .then(data => {
        setPromotions(data.promotions || []);
        setCoupons(data.coupons || []);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">营销管理</h1>
          <p className="text-gray-500 mt-1">优惠券、满减、秒杀、拼团等营销活动</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ 创建活动</button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {[
            { key: 'activities', label: '营销活动' },
            { key: 'coupons', label: '优惠券' },
            { key: 'points', label: '积分签到' },
            { key: 'lottery', label: '抽奖活动' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'activities' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">活动名称</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">活动时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {promotions.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(p.start_at).toLocaleDateString()} - {new Date(p.end_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status === 'active' ? '进行中' : p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-sm">编辑</button>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">暂无营销活动</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'coupons' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">优惠券名称</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">优惠</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">使用门槛</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">已领取/已使用</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-red-600 font-medium">
                    {c.type === 'fixed' ? `¥${c.discount_amount}` : `${c.discount_percentage}%`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">满¥{c.min_spend}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.used_count || 0} / {c.total_issue}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline text-sm">编辑</button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">暂无优惠券</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'points' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">积分签到配置</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm text-gray-600 mb-1">每日签到奖励积分</label>
              <input type="number" defaultValue={10} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">连续签到额外奖励</label>
              <input type="number" defaultValue={50} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">保存设置</button>
          </div>
        </div>
      )}

      {tab === 'lottery' && (
        <div className="bg-white rounded-xl border p-6 text-center text-gray-400 py-12">
          抽奖活动功能开发中
        </div>
      )}
    </div>
  );
}
