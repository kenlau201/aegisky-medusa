'use client';

import { useState } from 'react';

const levelColors: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-700',
  silver: 'bg-slate-100 text-slate-700',
  platinum: 'bg-cyan-100 text-cyan-700',
  diamond: 'bg-blue-100 text-blue-700',
  supreme: 'bg-amber-100 text-amber-700',
};

const levelLabels: Record<string, string> = {
  normal: '普通会员',
  silver: '白银会员',
  platinum: '铂金会员',
  diamond: '钻石会员',
  supreme: '至尊会员',
};

export default function CustomerDetailModal({ customer, onClose }: { customer: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'address' | 'logs'>('info');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[750px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {(customer.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold">{customer.email}</h3>
              <span className={`inline-block px-2 py-0.5 rounded text-xs ${levelColors[customer.level] || levelColors.normal}`}>
                {levelLabels[customer.level] || '普通会员'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="border-b px-5 flex gap-6">
          {[
            { key: 'info', label: '基本信息' },
            { key: 'orders', label: '订单记录' },
            { key: 'address', label: '收货地址' },
            { key: 'logs', label: '操作日志' },
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
                  <label className="text-gray-500">用户ID</label>
                  <div className="font-mono mt-1">{customer.id}</div>
                </div>
                <div>
                  <label className="text-gray-500">邮箱</label>
                  <div className="mt-1">{customer.email}</div>
                </div>
                <div>
                  <label className="text-gray-500">手机号</label>
                  <div className="mt-1">{customer.phone || '-'}</div>
                </div>
                <div>
                  <label className="text-gray-500">昵称</label>
                  <div className="mt-1">{customer.nickname || '-'}</div>
                </div>
                <div>
                  <label className="text-gray-500">注册时间</label>
                  <div className="mt-1">{new Date(customer.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-gray-500">最后登录</label>
                  <div className="mt-1">{customer.last_login ? new Date(customer.last_login).toLocaleString() : '-'}</div>
                </div>
                <div>
                  <label className="text-gray-500">积分</label>
                  <div className="mt-1 font-medium text-blue-600">{customer.points || 0}</div>
                </div>
                <div>
                  <label className="text-gray-500">余额</label>
                  <div className="mt-1 font-medium text-green-600">${(customer.balance || 0).toFixed(2)}</div>
                </div>
                <div>
                  <label className="text-gray-500">累计消费</label>
                  <div className="mt-1 font-medium text-red-600">${(customer.total_spent || 0).toFixed(2)}</div>
                </div>
                <div>
                  <label className="text-gray-500">订单数</label>
                  <div className="mt-1">{customer.order_count || 0}</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 text-sm">标签</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">新用户</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">已验证邮箱</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 text-sm">状态操作</h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">编辑资料</button>
                  <button className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">调整积分</button>
                  <button className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">调整余额</button>
                  <button className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-sm hover:bg-red-100">禁用账号</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="text-center py-12 text-gray-400">暂无订单记录</div>
          )}

          {activeTab === 'address' && (
            <div className="text-center py-12 text-gray-400">暂无收货地址</div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <div>账号注册</div>
                  <div className="text-xs text-gray-400">{new Date(customer.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
