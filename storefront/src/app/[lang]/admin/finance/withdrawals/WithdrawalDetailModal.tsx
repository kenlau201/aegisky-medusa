'use client';

import { useState } from 'react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '待打款',
  paid: '已打款',
  rejected: '已拒绝',
};

export default function WithdrawalDetailModal({ withdrawal, onClose, onUpdate }: { withdrawal: any; onClose: () => void; onUpdate?: () => void }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const handleApprove = async () => {
    await fetch(`/api/admin/withdrawals/${withdrawal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    onUpdate?.();
    onClose();
  };

  const handlePaid = async () => {
    await fetch(`/api/admin/withdrawals/${withdrawal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' }),
    });
    onUpdate?.();
    onClose();
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert('请输入拒绝原因');
      return;
    }
    await fetch(`/api/admin/withdrawals/${withdrawal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', reject_reason: rejectReason }),
    });
    onUpdate?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[550px]">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div>
            <h3 className="font-bold">提现详情</h3>
            <span className="text-sm text-gray-500">单号：{withdrawal.withdrawal_sn || withdrawal.id}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className={`px-3 py-1 rounded-full text-sm ${statusColors[withdrawal.status]}`}>
              {statusLabels[withdrawal.status] || withdrawal.status}
            </span>
            <span className="text-2xl font-bold text-red-600">
              ${(withdrawal.amount || 0).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-500">申请人</label>
              <div className="mt-1">{withdrawal.user_email || withdrawal.shop_name || '-'}</div>
            </div>
            <div>
              <label className="text-gray-500">申请时间</label>
              <div className="mt-1">{new Date(withdrawal.created_at).toLocaleString()}</div>
            </div>
            <div>
              <label className="text-gray-500">提现金额</label>
              <div className="mt-1 font-medium text-red-600">${(withdrawal.amount || 0).toFixed(2)}</div>
            </div>
            <div>
              <label className="text-gray-500">手续费</label>
              <div className="mt-1">${(withdrawal.fee || 0).toFixed(2)}</div>
            </div>
            <div className="col-span-2">
              <label className="text-gray-500">实际到账</label>
              <div className="mt-1 font-medium text-green-600">
                ${((withdrawal.amount || 0) - (withdrawal.fee || 0)).toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-sm">收款方式</label>
            <div className="mt-1 p-3 border rounded text-sm">
              <div className="font-medium">{withdrawal.payment_method || '银行转账'}</div>
              <div className="text-gray-500 mt-1">{withdrawal.account_info || '待补充'}</div>
            </div>
          </div>

          {withdrawal.reject_reason && (
            <div>
              <label className="text-gray-500 text-sm">拒绝原因</label>
              <div className="mt-1 p-3 bg-red-50 text-red-700 rounded text-sm">
                {withdrawal.reject_reason}
              </div>
            </div>
          )}

          {showReject && (
            <div>
              <label className="text-gray-500 text-sm">拒绝原因 <span className="text-red-500">*</span></label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded text-sm mt-1"
                placeholder="请输入拒绝原因"
              />
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
          {withdrawal.status === 'pending' && !showReject && (
            <>
              <button onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
              <button
                onClick={() => setShowReject(true)}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                拒绝
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                通过审核
              </button>
            </>
          )}
          {withdrawal.status === 'approved' && (
            <>
              <button onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">关闭</button>
              <button
                onClick={handlePaid}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                确认打款
              </button>
            </>
          )}
          {showReject && (
            <>
              <button onClick={() => setShowReject(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">返回</button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                确认拒绝
              </button>
            </>
          )}
          {(withdrawal.status === 'paid' || withdrawal.status === 'rejected') && (
            <button onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">关闭</button>
          )}
        </div>
      </div>
    </div>
  );
}
