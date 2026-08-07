'use client';

import { useState } from 'react';

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<'product' | 'aftersale'>('product');

  const productServices = [
    { id: 1, name: '售全球', icon: '🌍', desc: '商品支持全球发货', enabled: true, isDefault: true },
    { id: 2, name: '商家发货&售后', icon: '🏪', desc: '由商家直接发货并提供售后服务', enabled: true, isDefault: true },
    { id: 3, name: '24小时发货', icon: '⚡', desc: '承诺24小时内发货', enabled: true, isDefault: false },
    { id: 4, name: '7天无理由退货', icon: '↩️', desc: '支持7天无理由退货', enabled: true, isDefault: false },
    { id: 5, name: '7天无理由换货', icon: '🔄', desc: '支持7天无理由换货', enabled: false, isDefault: false },
    { id: 6, name: '准时到达', icon: '⏰', desc: '承诺准时送达', enabled: false, isDefault: false },
    { id: 7, name: '正品保障', icon: '✅', desc: '正品保证，假一赔十', enabled: true, isDefault: false },
    { id: 8, name: '顺丰包邮', icon: '📦', desc: '顺丰速运，包邮', enabled: false, isDefault: false },
  ];

  const aftersaleServices = [
    { id: 1, name: '退货退款', desc: '支持退货并退款', enabled: true },
    { id: 2, name: '仅退款', desc: '支持仅退款不退货', enabled: true },
    { id: 3, name: '换货', desc: '支持换货服务', enabled: true },
    { id: 4, name: '维修', desc: '提供维修服务', enabled: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">服务配置</h1>
        <p className="text-gray-500 mt-1">配置商品服务和售后服务</p>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="border-b px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('product')}
            className={`py-3 px-2 border-b-2 text-sm ${activeTab === 'product' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
          >
            商品服务
          </button>
          <button
            onClick={() => setActiveTab('aftersale')}
            className={`py-3 px-2 border-b-2 text-sm ${activeTab === 'aftersale' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
          >
            售后服务
          </button>
        </div>

        <div className="p-4 flex justify-end">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            + 添加服务
          </button>
        </div>

        {activeTab === 'product' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {productServices.map(service => (
              <div key={service.id} className={`border rounded-lg p-4 ${service.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{service.icon}</span>
                  <label className="relative inline-flex h-5 w-9 items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={service.enabled} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition"></div>
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-4"></span>
                  </label>
                </div>
                <div className="font-medium text-sm">{service.name}</div>
                <div className="text-xs text-gray-500 mt-1">{service.desc}</div>
                {service.isDefault && (
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">默认</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {aftersaleServices.map(service => (
              <div key={service.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="font-medium text-sm">{service.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{service.desc}</div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex h-5 w-9 items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={service.enabled} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition"></div>
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-4"></span>
                  </label>
                  <button className="text-blue-600 text-sm hover:text-blue-800">编辑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
