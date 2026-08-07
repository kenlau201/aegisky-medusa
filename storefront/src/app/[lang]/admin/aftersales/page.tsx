'use client';

import { useEffect, useState } from 'react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  pending: '待处理',
  approved: '已同意',
  rejected: '已拒绝',
  completed: '已完成',
  cancelled: '已取消',
};

const typeLabels: Record<string, string> = {
  refund_only: '仅退款',
  return_and_refund: '退货退款',
  exchange: '换货',
};

export default function AftersalesAdminPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'approved', label: '处理中' },
    { key: 'completed', label: '已完成' },
    { key: 'rejected', label: '已拒绝' },
  ];

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/aftersales?status=${tab}&pageSize=50`)
      .then(r => r.json())
      .then(data => { setList(data.aftersales || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">售后管理</h1>
        <p className="text-gray-500 mt-1">处理退款和售后申请</p>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="border-b px-4 flex gap-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`py-3 px-2 border-b-2 transition ${tab === t.key ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">售后编号</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">店铺</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">原因</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">退款金额</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">申请时间</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : list.length > 0 ? list.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm text-blue-600">{item.aftersale_sn}</td>
                <td className="px-6 py-4 text-sm">{typeLabels[item.type] || item.type}</td>
                <td className="px-6 py-4 text-sm">{item.shop_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.reason || '-'}</td>
                <td className="px-6 py-4 font-medium text-red-600">${(item.refund_amount || 0).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[item.status] || 'bg-gray-100'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  {item.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:underline text-sm">同意</button>
                      <button className="text-red-600 hover:underline text-sm">拒绝</button>
                    </div>
                  )}
                  <button className="text-blue-600 hover:underline text-sm">详情</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">暂无售后申请</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
