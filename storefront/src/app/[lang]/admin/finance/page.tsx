'use client';

import { useEffect, useState } from 'react';

export default function FinanceAdminPage() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalRecharge: 0,
    totalWithdraw: 0,
    pendingWithdraw: 0,
    totalCommission: 0,
  });

  useEffect(() => {
    fetch('/api/admin/finance/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    { label: '用户总余额', value: `¥${stats.totalBalance.toLocaleString()}`, color: 'blue' },
    { label: '累计充值', value: `¥${stats.totalRecharge.toLocaleString()}`, color: 'green' },
    { label: '累计提现', value: `¥${stats.totalWithdraw.toLocaleString()}`, color: 'purple' },
    { label: '待审核提现', value: stats.pendingWithdraw, color: 'orange' },
    { label: '累计分销佣金', value: `¥${stats.totalCommission.toLocaleString()}`, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">财务管理</h1>
        <p className="text-gray-500 mt-1">资金流水、充值提现、分账结算</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border p-5">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className={`text-2xl font-bold text-${card.color}-600 mt-2`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '充值管理', href: '/admin/finance/recharges', icon: '💳' },
          { label: '提现审核', href: '/admin/finance/withdrawals', icon: '💸' },
          { label: '分账管理', href: '/admin/finance/settlements', icon: '📊' },
          { label: '交易日志', href: '/admin/finance/transactions', icon: '📝' },
        ].map(item => (
          <a key={item.label} href={item.href} className="bg-white rounded-xl border p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors flex flex-col items-center">
            <span className="text-3xl">{item.icon}</span>
            <span className="text-sm font-medium text-gray-700 mt-2">{item.label}</span>
          </a>
        ))}
      </div>

      {/* 最近交易 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">最近交易记录</h2>
        <div className="text-center text-gray-400 py-8">交易记录加载中...</div>
      </div>
    </div>
  );
}
