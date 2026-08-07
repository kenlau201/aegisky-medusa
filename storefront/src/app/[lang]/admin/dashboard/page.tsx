'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const params = useParams();
  const lang = params.lang as string;
  const prefix = `/${lang}`;

  const [stats, setStats] = useState<any>({
    orders: { total: 0, pending: 0, today: 0 },
    products: { total: 0, pending_review: 0 },
    customers: { total: 0, today: 0 },
    revenue: { today: 0, total: 0 },
    pending: { shops: 0, suppliers: 0, aftersales: 0, withdrawals: 0 }
  });

  useEffect(() => {
    // 从API获取统计数据
    fetch('/api/admin/dashboard/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const statCards = [
    { label: '今日销售额', value: `¥${stats.revenue.today.toLocaleString()}`, change: '+12.5%', color: 'blue' },
    { label: '今日订单', value: stats.orders.today, change: '+8.2%', color: 'green' },
    { label: '商品总数', value: stats.products.total.toLocaleString(), change: '', color: 'purple' },
    { label: '客户总数', value: stats.customers.total.toLocaleString(), change: '', color: 'orange' },
  ];

  const todoItems = [
    { label: '待审核店铺', count: stats.pending.shops, href: prefix + '/admin/shops', color: 'blue' },
    { label: '待审核供应商', count: stats.pending.suppliers, href: prefix + '/admin/suppliers', color: 'green' },
    { label: '待处理售后', count: stats.pending.aftersales, href: prefix + '/admin/aftersales', color: 'red' },
    { label: '待审核提现', count: stats.pending.withdrawals, href: prefix + '/admin/finance/withdrawals', color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">概览</h1>
        <p className="text-gray-500 mt-1">欢迎使用 Aegisky Medusa 管理后台</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{card.label}</span>
              {card.change && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">{card.change}</span>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{card.value}</div>
          </div>
        ))}
      </div>

      {/* 待办事项 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">待办事项</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {todoItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`text-3xl font-bold text-${item.color}-600`}>{item.count}</div>
              <div className="text-sm text-gray-600 mt-1">{item.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: '商品管理', href: prefix + '/admin/products', icon: '📦' },
            { label: '订单管理', href: prefix + '/admin/orders', icon: '📋' },
            { label: '营销活动', href: prefix + '/admin/promotions', icon: '🎯' },
            { label: '客户管理', href: prefix + '/admin/customers', icon: '👥' },
            { label: '财务管理', href: prefix + '/admin/finance', icon: '💰' },
            { label: '数据统计', href: prefix + '/admin/reports/sales', icon: '📊' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm text-gray-700 mt-2">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 系统信息 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统信息</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">系统版本</span>
            <div className="font-medium text-gray-900 mt-1">v6.0.0</div>
          </div>
          <div>
            <span className="text-gray-500">数据库</span>
            <div className="font-medium text-gray-900 mt-1">PostgreSQL 16</div>
          </div>
          <div>
            <span className="text-gray-500">缓存</span>
            <div className="font-medium text-gray-900 mt-1">Redis 7</div>
          </div>
          <div>
            <span className="text-gray-500">运行时间</span>
            <div className="font-medium text-gray-900 mt-1">正常</div>
          </div>
        </div>
      </div>
    </div>
  );
}
