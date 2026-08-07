'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface DashboardData {
  products: { total: number; low_stock: number; categories: number; brands: number };
  orders: { total: number; today: number; statuses: { status: string; count: number }[] };
  customers: { total: number };
  revenue: { total: number; today: number };
  pending: { shops: number; suppliers: number; aftersales: number; withdrawals: number; rfqs: number; reviews: number };
  marketing: { active_coupons: number };
  inventory: { total_logs: number };
  weekly: { date: string; count: number; revenue: number }[];
  top_brands: { name: string; product_count: number }[];
}

export default function AdminDashboard() {
  const params = useParams();
  const lang = params.lang as string;
  const prefix = `/${lang}`;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleString()), 60000);
    fetch('/api/admin/dashboard/stats')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) => n?.toLocaleString() || '0';
  const money = (n: number) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const todoItems = [
    { label: '待审核RFQ', count: data?.pending.rfqs || 0, icon: '📋', color: 'blue', href: '/admin/rfq' },
    { label: '待审供应商', count: data?.pending.suppliers || 0, icon: '🏢', color: 'green', href: '/admin/suppliers' },
    { label: '待处理退款', count: data?.pending.aftersales || 0, icon: '↩️', color: 'orange', href: '/admin/aftersales' },
    { label: '低库存预警', count: data?.products.low_stock || 0, icon: '⚠️', color: 'red', href: '/admin/inventory/search' },
  ];

  const statCards = [
    { label: '商品总数', value: data ? fmt(data.products.total) : '...', sub: `${data?.products.categories || 0} 分类 / ${data?.products.brands || 0} 品牌`, icon: '📦' },
    { label: '订单总数', value: data ? fmt(data.orders.total) : '...', sub: `今日 ${data?.orders.today || 0} 单`, icon: '🛒' },
    { label: '客户总数', value: data ? fmt(data.customers.total) : '...', sub: '已注册用户', icon: '👥' },
    { label: '总收入', value: data ? money(data.revenue.total) : '...', sub: `今日 ${money(data?.revenue.today || 0)}`, icon: '💰' },
    { label: '有效优惠券', value: data ? String(data.marketing.active_coupons) : '...', sub: '进行中活动', icon: '🎫' },
    { label: '库存操作日志', value: data ? fmt(data.inventory.total_logs) : '...', sub: '出入库记录', icon: '📊' },
  ];

  // Build chart from weekly data or empty
  const maxOrders = Math.max(1, ...(data?.weekly?.map(w => Number(w.count)) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">概览</h1>
        <span className="text-sm text-gray-400">更新时间：{currentTime || '加载中...'}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="text-2xl font-bold">{loading ? '...' : card.value}</div>
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* 待办事项 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">待办事项</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {todoItems.map((item) => (
            <Link key={item.label} href={prefix + item.href} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : item.count}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
                <div className="text-xs text-blue-500 mt-1">点击处理 →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 近7天订单趋势 */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">近7天订单趋势</h3>
          {data?.weekly && data.weekly.length > 0 ? (
            <div>
              <div className="h-48 flex items-end justify-between gap-2">
                {data.weekly.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500">{Number(w.count)}</div>
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                      style={{ height: `${Math.max(5, (Number(w.count) / maxOrders) * 100)}%` }}
                    ></div>
                    <div className="text-xs text-gray-400">{new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              {loading ? '加载中...' : '暂无订单数据'}
            </div>
          )}
        </div>

        {/* 订单状态分布 */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">订单状态分布</h3>
          {data?.orders.statuses && data.orders.statuses.length > 0 ? (
            <div className="space-y-3">
              {data.orders.statuses.map(s => {
                const pct = data.orders.total > 0 ? (Number(s.count) / data.orders.total * 100) : 0;
                const colors: Record<string, string> = {
                  pending: 'bg-yellow-500', paid: 'bg-green-500', shipped: 'bg-blue-500',
                  completed: 'bg-gray-500', cancelled: 'bg-red-500', pending_payment: 'bg-orange-500',
                  compensation_pending: 'bg-purple-500',
                };
                return (
                  <div key={s.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{s.status}</span>
                      <span className="font-medium">{s.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[s.status] || 'bg-blue-500'} rounded-full`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              {loading ? '加载中...' : '暂无订单数据'}
            </div>
          )}
        </div>
      </div>

      {/* Top Brands + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Top 品牌（按商品数）</h3>
          {data?.top_brands && data.top_brands.length > 0 ? (
            <div className="space-y-3">
              {data.top_brands.map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <Link href={`${prefix}/suppliers/${b.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="text-gray-700 hover:text-blue-600">{b.name}</Link>
                  </div>
                  <span className="text-sm text-gray-500">{b.product_count} products</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">{loading ? '加载中...' : '暂无数据'}</div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`${prefix}/admin/products`} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-center text-sm">商品管理</Link>
            <Link href={`${prefix}/admin/orders`} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-center text-sm">订单管理</Link>
            <Link href={`${prefix}/admin/customers`} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-center text-sm">客户管理</Link>
            <Link href={`${prefix}/admin/rfq`} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-center text-sm">RFQ管理</Link>
            <Link href={`${prefix}/admin/finance`} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-center text-sm">财务概览</Link>
            <Link href={`${prefix}/admin/reports/sales`} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-center text-sm">销售报表</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
