'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const params = useParams();
  const lang = params.lang as string;
  const prefix = `/${lang}`;

  const [stats, setStats] = useState<any>({
    products: 6385,
    brands: 438,
    pending_aftersales: 58,
    applications: 0,
    payment_amount: 515.97,
    visitors: 25,
    buyers: 1,
    page_views: 392,
    orders: 3,
  });

  useEffect(() => {
    fetch('/api/admin/dashboard/stats')
      .then(r => r.json())
      .then(data => setStats(prev => ({ ...prev, ...data })))
      .catch(console.error);
  }, []);

  const authItems = [
    { label: '授权信息', done: true },
    { label: '配送设置', done: true },
    { label: '支付设置', done: true },
    { label: '商城装修', done: true },
    { label: '添加供应商', done: true },
  ];

  const todoItems = [
    { label: '待审核商品', count: 0, yesterday: 0, icon: '🛒', color: 'blue' },
    { label: '待审核品牌', count: 0, yesterday: 0, icon: '🏷️', color: 'blue' },
    { label: '待审核退款', count: stats.pending_aftersales || 58, yesterday: 58, icon: '↩️', color: 'blue' },
    { label: '入驻申请', count: stats.applications || 0, yesterday: 0, icon: '📝', color: 'blue' },
  ];

  const realtimeStats = [
    { label: '支付金额', value: `$${(stats.payment_amount || 515.97).toFixed(2)}`, yesterday: '昨日全天 12.68', change: '3969.16%', up: true },
    { label: '访客数', value: stats.visitors || 25, yesterday: '昨日全天 18', change: '38.89%', up: true },
    { label: '支付买家数', value: stats.buyers || 1, yesterday: '昨日全天 1', change: '-', up: false },
    { label: '浏览量', value: stats.page_views || 392, yesterday: '昨日全天 171', change: '129.24%', up: true },
    { label: '支付订单数', value: stats.orders || 3, yesterday: '昨日全天 4', change: '-25%', up: false },
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
            <div key={item.label} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
                <div className="text-xs text-gray-400">昨日 {item.yesterday}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 实时数据 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">实时数据</h2>
          <span className="text-sm text-gray-400">更新时间：{new Date().toLocaleString()}</span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {realtimeStats.map((stat) => (
            <div key={stat.label} className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                📊
              </div>
              <div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold mt-1">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {stat.yesterday}
                  {stat.change !== '-' && (
                    <span className={`ml-2 ${stat.up ? 'text-red-500' : 'text-green-500'}`}>
                      日环比 {stat.change} {stat.up ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center">
            <Link href={prefix + '/admin/reports/sales'} className="text-blue-600 text-sm hover:underline">
              查看更多销售统计 →
            </Link>
          </div>
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
