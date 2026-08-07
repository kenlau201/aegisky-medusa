'use client';

import { useState } from 'react';

export default function Page() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["进行中","未开始","已结束"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">活动赠品</h1>
        <p className="text-gray-500 mt-1">赠品活动管理</p>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="border-b flex">
          {tabs.map((tab: string, i: number) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <p>{tabs[activeTab]} - 暂无数据</p>
          <p className="text-sm mt-2">数据将在有相关业务后显示</p>
        </div>
      </div>
    </div>
  );
}