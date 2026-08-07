'use client';

import { useState } from 'react';

export default function ProductAuditPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const pendingProducts = [
    { id: 79673, name: '新提交的无人机配件', shop: '自营店铺', price: 299, submitTime: '2026-08-07 10:00', reason: '' },
  ];

  const tabs = [
    { key: 'pending', label: '待审核', count: pendingProducts.length },
    { key: 'approved', label: '已通过', count: 0 },
    { key: 'rejected', label: '已驳回', count: 0 },
    { key: 'all', label: '全部', count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">商品审核</h1>
        <p className="text-gray-500 mt-1">审核商家提交的商品</p>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="border-b px-4 flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-2 border-b-2 text-sm ${activeTab === tab.key ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
            >
              {tab.label}
              {tab.count > 0 && <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* 筛选 */}
        <div className="p-4 flex flex-wrap gap-4 items-center border-b">
          <input type="text" placeholder="商品名称/货号" className="px-3 py-1.5 border rounded text-sm w-52" />
          <select className="px-3 py-1.5 border rounded text-sm w-40">
            <option>选择店铺</option>
          </select>
          <select className="px-3 py-1.5 border rounded text-sm w-32">
            <option>选择分类</option>
          </select>
          <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm">搜索</button>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">商品信息</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">店铺</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">价格</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">提交时间</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activeTab === 'pending' && pendingProducts.length > 0 ? pendingProducts.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-gray-400">ID: {p.id}</div>
                </td>
                <td className="px-4 py-3 text-sm">{p.shop}</td>
                <td className="px-4 py-3 text-sm font-medium text-red-600">${p.price}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.submitTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <button className="text-blue-600 hover:text-blue-800">查看</button>
                    <span className="text-gray-300">|</span>
                    <button className="text-green-600 hover:text-green-800">通过</button>
                    <span className="text-gray-300">|</span>
                    <button className="text-red-600 hover:text-red-800">驳回</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">暂无数据</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
