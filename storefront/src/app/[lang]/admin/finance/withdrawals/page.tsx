'use client';

import { useEffect, useState } from 'react';
import WithdrawalDetailModal from './WithdrawalDetailModal';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '待打款',
  rejected: '已拒绝',
  paid: '已打款',
  failed: '打款失败',
};

export default function WithdrawalsAdminPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '待打款' },
    { key: 'paid', label: '已打款' },
    { key: 'rejected', label: '已拒绝' },
  ];

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/withdrawals?status=${tab}&pageSize=50`)
      .then(r => r.json())
      .then(data => { setList(data.withdrawals || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">提现管理</h1>
        <p className="text-gray-500 mt-1">审核用户和店铺提现申请</p>
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
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">用户</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">提现金额</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">手续费</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">实际到账</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">收款方式</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">申请时间</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : list.length > 0 ? list.map(w => (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-sm">{w.user_name || w.user_email || '-'}</td>
                <td className="px-6 py-4 font-medium text-sm">${(w.amount || 0).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">${(w.fee || 0).toFixed(2)}</td>
                <td className="px-6 py-4 font-medium text-sm text-blue-600">${(w.actual_amount || w.amount - (w.fee || 0) || 0).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <div>{w.account_type === 'alipay' ? '支付宝' : w.account_type === 'wechat' ? '微信' : '银行转账'}</div>
                  <div className="text-gray-500 text-xs">{w.account_name || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[w.status] || 'bg-gray-100'}`}>
                    {statusLabels[w.status] || w.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(w.created_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <button
                      onClick={() => setSelectedWithdrawal(w)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      详情
                    </button>
                    {w.status === 'pending' && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button className="text-green-600 hover:text-green-800">通过</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-red-600 hover:text-red-800">拒绝</button>
                      </>
                    )}
                    {w.status === 'approved' && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button className="text-blue-600 hover:text-blue-800">打款</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">暂无提现申请</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedWithdrawal && (
        <WithdrawalDetailModal
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onUpdate={load}
        />
      )}
    </div>
  );
}
