'use client';

import { useState } from 'react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  pending: '待处理',
  approved: '处理中',
  rejected: '已拒绝',
  completed: '已完成',
};

const typeLabels: Record<string, string> = {
  refund_only: '仅退款',
  return_and_refund: '退货退款',
  exchange: '换货',
};

export default function AftersaleDetailModal({ aftersale, onClose }: { aftersale: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'info' | 'logs'>('info');
  const [refuseReason, setRefuseReason] = useState('');
  const [showRefuse, setShowRefuse] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[700px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div>
            <h3 className="font-bold text-lg">售后详情</h3>
            <span className="text-sm text-gray-500">单号：{aftersale.aftersale_sn}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="border-b px-5 flex gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-1 border-b-2 text-sm ${activeTab === 'info' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
          >
            售后信息
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-1 border-b-2 text-sm ${activeTab === 'logs' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
          >
            处理日志
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'info' ? (
            <div className="space-y-5">
              {/* 状态 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[aftersale.status]}`}>
                  {statusLabels[aftersale.status] || aftersale.status}
                </span>
                <span className="text-sm text-gray-500">申请类型：{typeLabels[aftersale.type] || aftersale.type}</span>
              </div>

              {/* 商品信息 */}
              <div>
                <h4 className="font-medium mb-2 text-sm">商品信息</h4>
                <div className="flex gap-3 p-3 border rounded">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">📦</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{aftersale.product_name || '商品名称'}</div>
                    <div className="text-sm text-gray-500 mt-1">数量：{aftersale.quantity || 1}</div>
                    <div className="text-sm text-red-600 font-medium">退款金额：${(aftersale.refund_amount || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* 买家信息 */}
              <div>
                <h4 className="font-medium mb-2 text-sm">买家信息</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">买家账号：</span>{aftersale.customer_email || '-'}</div>
                  <div><span className="text-gray-500">联系电话：</span>{aftersale.phone || '-'}</div>
                  <div className="col-span-2"><span className="text-gray-500">申请时间：</span>{new Date(aftersale.created_at).toLocaleString()}</div>
                </div>
              </div>

              {/* 售后原因 */}
              <div>
                <h4 className="font-medium mb-2 text-sm">售后原因</h4>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  {aftersale.reason || '无'}
                </div>
              </div>

              {/* 凭证图片 */}
              {aftersale.images && aftersale.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">凭证图片</h4>
                  <div className="flex gap-2">
                    {aftersale.images.map((img: string, i: number) => (
                      <img key={i} src={img} className="w-20 h-20 object-cover rounded border" alt="" />
                    ))}
                  </div>
                </div>
              )}

              {/* 拒绝原因输入 */}
              {showRefuse && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">拒绝原因 <span className="text-red-500">*</span></h4>
                  <textarea
                    value={refuseReason}
                    onChange={e => setRefuseReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="请输入拒绝原因"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative pl-6 border-l-2 border-gray-200">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                <div className="text-sm font-medium">买家提交售后申请</div>
                <div className="text-xs text-gray-500">{new Date(aftersale.created_at).toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {aftersale.status === 'pending' && (
          <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
            {!showRefuse ? (
              <>
                <button onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
                <button
                  onClick={() => setShowRefuse(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  拒绝
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                  同意售后
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowRefuse(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">返回</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  确认拒绝
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
