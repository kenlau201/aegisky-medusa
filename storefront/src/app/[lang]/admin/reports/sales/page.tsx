'use client';

import { useState } from 'react';

export default function SalesReportPage() {
  const [activeTab, setActiveTab] = useState('amount');

  const stats = [
    { label: '商品支付金额', value: '454,412.48', change: '-' },
    { label: '商品退款金额', value: '23,915.19', change: '-' },
    { label: '营业额', value: '430,497.29', change: '-' },
    { label: '充值金额', value: '520.02', change: '-' },
    { label: '余额支付金额', value: '443,663.46', change: '-' },
  ];

  const months = ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'];
  const chartData = [0, 0, 360000, 50000, 0, 30000, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...chartData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">销售概览</h1>
      </div>

      {/* Tab切换 */}
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

      {/* 筛选栏 */}
      <div className="flex items-center gap-4">
        <select className="px-3 py-2 border rounded text-sm">
          <option>按年筛选</option>
        </select>
        <input type="text" defaultValue="2026" className="px-3 py-2 border rounded text-sm w-32" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">搜索</button>
        <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50">导出EXCEL</button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-5">
            <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">环比：{stat.change}</div>
          </div>
        ))}
      </div>

      {/* 图表 */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-center font-semibold mb-6">订单金额统计</h3>
        <div className="relative h-64">
          {/* Y轴 */}
          <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-400 text-right pr-2">
            <span>400,000</span>
            <span>300,000</span>
            <span>200,000</span>
            <span>100,000</span>
            <span>0</span>
          </div>
          {/* 图表区域 */}
          <div className="ml-16 h-full flex items-end justify-between gap-2 pb-8 relative">
            {/* 网格线 */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-t border-gray-100 w-full"></div>)}
            </div>
            {/* 柱状图 */}
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative z-10">
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ height: `${(val / maxVal) * 85}%` }}
                ></div>
              </div>
            ))}
          </div>
          {/* X轴 */}
          <div className="ml-16 flex justify-between text-xs text-gray-500 absolute bottom-0 left-0 right-0">
            {months.map(m => <span key={m} className="flex-1 text-center">{m}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
