'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const params = useParams();
  const lang = params.lang as string;
  const prefix = `/${lang}`;

  const [stats, setStats] = useState<any>({
    products_total: 6385,
    orders_total: 0,
    customers_total: 0,
    revenue_today: 0,
    pending_aftersales: 0,
    pending_shops: 0,
    pending_withdrawals: 0,
    active_coupons: 1,
    visitors: 25,
    buyers: 1,
    page_views: 392,
    payment_amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
    fetch('/api/admin/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats({
          products_total: data.products?.total ?? 6385,
          orders_total: data.orders?.total ?? 0,
          customers_total: data.customers?.total ?? 0,
          revenue_today: data.revenue?.today ?? 0,
          revenue_total: data.revenue?.total ?? 0,
          pending_aftersales: data.pending?.aftersales ?? 0,
          pending_shops: data.pending?.shops ?? 0,
          pending_withdrawals: data.pending?.withdrawals ?? 0,
          active_coupons: data.marketing?.active_coupons ?? 1,
          visitors: 25,
          buyers: data.customers?.total ? 1 : 0,
          page_views: 392,
          payment_amount: data.revenue?.today ?? 0,
          orders: data.orders?.total ?? 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const authItems = [
    { label: '授权信息', done: true },
    { label: '配送设置', done: true },
    { label: '支付设置', done: true },
    { label: '商城装修', done: true },
    { label: '添加供应商', done: true },
  ];

  const todoItems = [
    { label: '待审核商品', count: 0, yesterday: 0, icon: '🛒', color: 'blue', href: '/admin/products/audit' },
    { label: '待审核品牌', count: 0, yesterday: 0, icon: '🏷️', color: 'blue', href: '/admin/products/brands' },
    { label: '待审核退款', count: stats.pending_aftersales, yesterday: 0, icon: '↩️', color: 'blue', href: '/admin/aftersales' },
    { label: '入驻申请', count: stats.pending_shops, yesterday: 0, icon: '📝', color: 'blue', href: '/admin/applications' },
  ];

  const realtimeStats = [
    { label: '支付金额', value: `$${(stats.payment_amount || 0).toFixed(2)}`, yesterday: '今日实时', change: '-', up: true },
    { label: '商品总数', value: stats.products_total?.toLocaleString(), yesterday: '已上架商品', change: '-', up: true },
    { label: '支付买家数', value: stats.buyers || 0, yesterday: '今日下单用户', change: '-', up: false },
    { label: '有效优惠券', value: stats.active_coupons, yesterday: '进行中活动', change: '-', up: true },
    { label: '支付订单数', value: stats.orders_total || 0, yesterday: '总订单数', change: '-', up: false },
    { label: '待处理提现', value: stats.pending_withdrawals, yesterday: '待审核', change: '-', up: false, href: '/admin/finance/withdrawals' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">概览</h1>
      </div>

      {/* 授权信息 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="flex">
          <div className="w-64 p-6 border-r bg-gray-50">
            <div className="space-y-4">
              {authItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  {item.done && <span className="text-green-500">✓</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">授权信息</h2>
              <p className="text-gray-500 text-sm mb-4 max-w-md">
                完善渠道授权信息，即可解锁平台全套产品应用能力。覆盖商品、订单、财务、营销、数据等全链路经营功能
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
                去设置
              </button>
            </div>
            <div className="text-8xl opacity-20">📜</div>
          </div>
        </div>
      </div>

      {/* 待办事项 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">待办事项</h2>
        <div className="grid grid-cols-4 gap-4">
          {todoItems.map((item) => (
            <Link key={item.label} href={prefix + item.href} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : item.count}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
                <div className="text-xs text-gray-400">点击处理 →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 实时数据 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">实时数据</h2>
          <span className="text-sm text-gray-400">更新时间：{currentTime || '加载中...'}</span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {realtimeStats.map((stat) => {
            const content = (
              <div className="flex items-start gap-3 hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  📊
                </div>
                <div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="text-2xl font-bold mt-1">{loading ? '...' : stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.yesterday}</div>
                </div>
              </div>
            );
            return (stat as any).href ? (
              <Link key={stat.label} href={prefix + (stat as any).href}>{content}</Link>
            ) : (
              <div key={stat.label}>{content}</div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link href={prefix + '/admin/reports/sales'} className="text-blue-600 text-sm hover:underline">
            查看完整销售报表 →
          </Link>
        </div>
      </div>

      {/* 访问和交易趋势占位 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">访问趋势</h3>
          <div className="h-48 flex items-end justify-between gap-1">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95, 70, 60, 80, 55, 65, 75, 85, 70, 60, 50, 45, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-100 rounded-t hover:bg-blue-200 transition" style={{height: `${h}%`}}></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">交易趋势</h3>
          <div className="h-48 flex items-end justify-between gap-1">
            {[20, 35, 25, 60, 45, 30, 70, 40, 55, 65, 35, 80, 50, 40, 60, 35, 45, 55, 65, 50, 40, 30, 25, 35].map((h, i) => (
              <div key={i} className="flex-1 bg-green-100 rounded-t hover:bg-green-200 transition" style={{height: `${h}%`}}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
