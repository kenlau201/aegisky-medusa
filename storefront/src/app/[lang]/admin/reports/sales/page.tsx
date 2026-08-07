'use client';

import { useState, useEffect } from 'react';

interface SalesData {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  monthlyData: { month: string; revenue: number; count: number }[];
  yearlyData: { year: number; revenue: number; count: number }[];
}

export default function SalesReportPage() {
  const [activeTab, setActiveTab] = useState('amount');
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports/sales')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const money = (n: number) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    { label: '总销售额', value: data ? money(data.totalRevenue) : '...' },
    { label: '订单总数', value: data ? data.orderCount.toString() : '...' },
    { label: '平均订单金额', value: data ? money(data.avgOrderValue) : '...' },
    { label: '有订单月份', value: data ? data.monthlyData.filter(m => m.count > 0).length.toString() : '...' },
  ];

  const maxVal = Math.max(1, ...(data?.monthlyData?.map(m => activeTab === 'amount' ? m.revenue : m.count) || [1]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">销售概览</h1>
        <p className="text-gray-500 mt-1">基于真实订单数据</p>
      </div>

      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab('amount')}
          className={`pb-3 font-medium border-b-2 transition-colors ${activeTab === 'amount' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          订单金额统计
        </button>
        <button
          onClick={() => setActiveTab('count')}
          className={`pb-3 font-medium border-b-2 transition-colors ${activeTab === 'count' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          订单数统计
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border p-5">
            <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-center font-semibold mb-6">{activeTab === 'amount' ? '月度销售额' : '月度订单数'}</h3>
        {data?.monthlyData && data.monthlyData.some(m => m.count > 0) ? (
          <div className="h-64 flex items-end justify-between gap-2">
            {data.monthlyData.map((m, i) => {
              const val = activeTab === 'amount' ? m.revenue : m.count;
              const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="text-xs text-gray-500">{val > 0 ? (activeTab === 'amount' ? money(m.revenue) : m.count) : ''}</div>
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all min-h-[2px]"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  ></div>
                  <div className="text-xs text-gray-400">{m.month}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            {loading ? '加载中...' : '暂无销售数据'}
          </div>
        )}
      </div>
    </div>
  );
}
