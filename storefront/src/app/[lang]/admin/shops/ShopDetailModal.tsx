'use client';

import { useState } from 'react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  disabled: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  disabled: '已禁用',
};

export default function ShopDetailModal({ shop, onClose }: { shop: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'products' | 'orders'>('info');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[800px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🏪</div>
            <div>
              <h3 className="font-bold text-lg">{shop.name}</h3>
              <span className={`inline-block px-2 py-0.5 rounded text-xs ${statusColors[shop.status]}`}>
                {statusLabels[shop.status] || shop.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="border-b px-5 flex gap-6">
          {[
            { key: 'info', label: '店铺信息' },
            { key: 'settings', label: '店铺设置' },
            { key: 'products', label: '商品列表' },
            { key: 'orders', label: '订单记录' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-1 border-b-2 text-sm ${activeTab === tab.key ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">店铺ID</label>
                  <div className="font-mono mt-1">{shop.id}</div>
                </div>
                <div>
                  <label className="text-gray-500">店铺名称</label>
                  <div className="mt-1">{shop.name}</div>
                </div>
                <div>
                  <label className="text-gray-500">店铺类型</label>
                  <div className="mt-1">{shop.type || '自营'}</div>
                </div>
                <div>
                  <label className="text-gray-500">联系人</label>
                  <div className="mt-1">{shop.contact_name || '-'}</div>
                </div>
                <div>
                  <label className="text-gray-500">联系电话</label>
                  <div className="mt-1">{shop.contact_phone || '-'}</div>
                </div>
                <div>
                  <label className="text-gray-500">联系邮箱</label>
                  <div className="mt-1">{shop.contact_email || '-'}</div>
                </div>
                <div>
                  <label className="text-gray-500">入驻时间</label>
                  <div className="mt-1">{new Date(shop.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-gray-500">审核时间</label>
                  <div className="mt-1">{shop.approved_at ? new Date(shop.approved_at).toLocaleString() : '-'}</div>
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-sm">店铺简介</label>
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                  {shop.description || '暂无简介'}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 text-sm">审核操作</h4>
                <div className="flex gap-2">
                  {shop.status === 'pending' && (
                    <>
                      <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">通过审核</button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">拒绝</button>
                    </>
                  )}
                  {shop.status === 'approved' && (
                    <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm hover:bg-red-100">禁用店铺</button>
                  )}
                  {shop.status === 'disabled' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">启用店铺</button>
                  )}
                  <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50">编辑信息</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">佣金设置</h4>
                <div className="flex items-center gap-3">
                  <label className="text-sm w-24">平台佣金率</label>
                  <input type="number" defaultValue={shop.commission_rate || 5} className="w-24 px-3 py-1.5 border rounded text-sm" />
                  <span className="text-sm">%</span>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">权限设置</h4>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm">允许发布商品</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm">允许参与营销活动</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">允许自提</span>
                </label>
              </div>
              <div className="pt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">保存设置</button>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="text-center py-12 text-gray-400">该店铺暂无商品</div>
          )}

          {activeTab === 'orders' && (
            <div className="text-center py-12 text-gray-400">暂无订单记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
