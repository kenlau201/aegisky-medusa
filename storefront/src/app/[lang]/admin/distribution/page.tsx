'use client';

import { useState } from 'react';

export default function DistributionOverviewPage() {
  const [period, setPeriod] = useState('today');

  const coreStats = [
    { label: '今日新增分销员数', value: '0' },
    { label: '今日分销员销售额（元）', value: '¥0.00' },
    { label: '今日成交客户数', value: '0' },
    { label: '今日支出佣金（元）', value: '¥0.00' },
  ];

  const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}时`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">分销概览</h1>
      </div>

      {/* 核心数据汇总 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">核心数据汇总</h2>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPeriod('today')}
                className={`px-4 py-1 rounded text-sm ${period === 'today' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
              >今日</button>
              <button
                onClick={() => setPeriod('total')}
                className={`px-4 py-1 rounded text-sm ${period === 'total' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
              >累计</button>
            </div>
            <span className="text-sm text-gray-400">更新时间：{new Date().toLocaleString()}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {coreStats.map((stat) => (
            <div key={stat.label}>
              <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 核心指标趋势 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">核心指标趋势</h2>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm text-gray-600">时间筛选：</span>
          <select className="px-3 py-2 border rounded text-sm">
            <option>自然日</option>
          </select>
          <input type="date" defaultValue="2026-08-07" className="px-3 py-2 border rounded text-sm" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">搜索</button>
        </div>
        <div className="relative h-64">
          <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-400 text-right pr-2">
            <span>1</span>
            <span>0.8</span>
            <span>0.6</span>
            <span>0.4</span>
            <span>0.2</span>
            <span>0</span>
          </div>
          <div className="ml-16 h-full flex items-end justify-between gap-1 pb-8 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0,1,2,3,4,5].map(i => <div key={i} className="border-t border-gray-100 w-full"></div>)}
            </div>
            {hours.map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative z-10">
                <div className="w-full bg-blue-500 rounded-t" style={{height: '0%'}}></div>
              </div>
            ))}
          </div>
          <div className="ml-16 flex justify-between text-xs text-gray-500 absolute bottom-0 left-0 right-0">
            {hours.filter((_, i) => i % 2 === 0).map(h => <span key={h} className="flex-1 text-center">{h}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
