'use client';

import { useEffect, useState } from 'react';

interface FinanceData {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  pendingRevenue: number;
  paidRevenue: number;
  currency: string;
  recentOrders: { order_number: string; total: number; status: string; created_at: string; customer_name: string }[];
  statusBreakdown: { status: string; count: number; total: number }[];
}

export default function FinanceOverviewPage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/finance/overview')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const money = (n: number) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    { label: '总收入', value: data ? money(data.totalRevenue) : '...', color: 'text-green-600' },
    { label: '订单总数', value: data ? data.orderCount.toString() : '...', color: 'text-blue-600' },
    { label: '平均订单金额', value: data ? money(data.avgOrderValue) : '...', color: 'text-purple-600' },
    { label: '待付款金额', value: data ? money(data.pendingRevenue) : '...', color: 'text-orange-600' },
    { label: '已付款金额', value: data ? money(data.paidRevenue) : '...', color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">资金总览</h1>
        <p className="text-gray-500 mt-1">基于真实订单数据的财务概览</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className="text-sm text-gray-500 mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{loading ? '...' : s.value}</div>
          </div>
        ))}
      </div>

      {/* 订单状态分布 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded"></span>
          订单状态分布
        </h2>
        {data?.statusBreakdown && data.statusBreakdown.length > 0 ? (
          <div className="space-y-3">
            {data.statusBreakdown.map(s => {
              const pct = data.totalRevenue > 0 ? (Number(s.total) / data.totalRevenue * 100) : 0;
              const colors: Record<string, string> = {
                pending: 'bg-yellow-500', paid: 'bg-green-500', shipped: 'bg-blue-500',
                completed: 'bg-gray-500', cancelled: 'bg-red-500', pending_payment: 'bg-orange-500',
              };
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{s.status} ({s.count} 笔)</span>
                    <span className="font-medium">{money(Number(s.total))}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[s.status] || 'bg-blue-500'} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">{loading ? '加载中...' : '暂无订单数据'}</div>
        )}
      </div>

      {/* 最近订单 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <h2 className="text-base font-semibold p-6 pb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded"></span>
          最近订单
        </h2>
        {data?.recentOrders && data.recentOrders.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-t">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">订单号</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">客户</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.recentOrders.map((o, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-mono text-blue-600">{o.order_number}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{o.customer_name || '-'}</td>
                  <td className="px-6 py-3 text-sm font-medium">{money(o.total)}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{o.status}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-400 text-center py-8">{loading ? '加载中...' : '暂无订单数据'}</div>
        )}
      </div>
    </div>
  );
}
