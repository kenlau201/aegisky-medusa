'use client';

import { useState } from 'react';

export default function SettingsAdminPage() {
  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: 'Aegisky Medusa',
    site_description: '国际无人机B2B供应链平台',
    currency: 'USD',
    order_auto_confirm_days: 7,
    points_per_yuan: 1,
    register_points: 100,
  });

  const save = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    alert('设置已保存');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 mt-1">商城基础配置、支付、配送、权限</p>
      </div>

      <div className="flex gap-6">
        {/* 左侧设置菜单 */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border p-2">
            {[
              { key: 'basic', label: '基础设置' },
              { key: 'order', label: '订单设置' },
              { key: 'points', label: '积分设置' },
              { key: 'payment', label: '支付设置' },
              { key: 'shipping', label: '配送设置' },
              { key: 'admins', label: '账号权限' },
              { key: 'logs', label: '操作日志' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  tab === t.key ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 设置内容 */}
        <div className="flex-1 bg-white rounded-xl border p-6">
          {tab === 'basic' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-lg mb-4">基础设置</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商城名称</label>
                <input
                  type="text"
                  value={form.site_name}
                  onChange={e => setForm({ ...form, site_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商城描述</label>
                <textarea
                  value={form.site_description}
                  onChange={e => setForm({ ...form, site_description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">默认货币</label>
                <select
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="USD">USD - 美元</option>
                  <option value="CNY">CNY - 人民币</option>
                  <option value="EUR">EUR - 欧元</option>
                  <option value="GBP">GBP - 英镑</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'order' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-lg mb-4">订单设置</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">自动确认收货天数</label>
                <input
                  type="number"
                  value={form.order_auto_confirm_days}
                  onChange={e => setForm({ ...form, order_auto_confirm_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">未支付订单自动取消（分钟）</label>
                <input type="number" defaultValue={30} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">售后申请天数</label>
                <input type="number" defaultValue={7} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          )}

          {tab === 'points' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-lg mb-4">积分设置</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">1元=多少积分</label>
                <input
                  type="number"
                  value={form.points_per_yuan}
                  onChange={e => setForm({ ...form, points_per_yuan: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">注册赠送积分</label>
                <input
                  type="number"
                  value={form.register_points}
                  onChange={e => setForm({ ...form, register_points: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">签到赠送积分</label>
                <input type="number" defaultValue={10} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          )}

          {tab === 'payment' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">支付设置</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Stripe</div>
                    <div className="text-sm text-gray-500">国际信用卡支付</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-gray-500">PayPal账户支付</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {tab === 'shipping' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">配送设置</h3>
              <div className="space-y-3">
                {['顺丰速运', '圆通速递', '中通快递', '韵达快递', 'EMS', 'DHL', 'FedEx'].map(name => (
                  <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                    <span>{name}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'admins' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">账号管理</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ 添加管理员</button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm text-gray-500">账号</th>
                    <th className="text-left py-3 text-sm text-gray-500">姓名</th>
                    <th className="text-left py-3 text-sm text-gray-500">角色</th>
                    <th className="text-left py-3 text-sm text-gray-500">最后登录</th>
                    <th className="text-left py-3 text-sm text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">admin</td>
                    <td className="py-3">系统管理员</td>
                    <td className="py-3"><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">超级管理员</span></td>
                    <td className="py-3 text-sm text-gray-500">刚刚</td>
                    <td className="py-3"><button className="text-blue-600 text-sm">编辑</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === 'logs' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">操作日志</h3>
              <div className="text-center text-gray-400 py-8">暂无操作日志</div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={save}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
