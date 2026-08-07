'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useState } from 'react';

const menuGroups = [
  {
    title: '商城',
    icon: '🏪',
    items: [
      { label: '概览', href: '/admin/dashboard' },
      { label: '商品管理', href: '/admin/products' },
      { label: '订单管理', href: '/admin/orders' },
      { label: '售后管理', href: '/admin/aftersales' },
    ]
  },
  {
    title: '营销',
    icon: '🎯',
    items: [
      { label: '营销概览', href: '/admin/promotions' },
      { label: '优惠券', href: '/admin/promotions/coupons' },
      { label: '活动管理', href: '/admin/promotions/activities' },
      { label: '积分签到', href: '/admin/promotions/points' },
    ]
  },
  {
    title: '组织',
    icon: '🏢',
    items: [
      { label: '店铺管理', href: '/admin/shops' },
      { label: '供应商管理', href: '/admin/suppliers' },
      { label: '入驻申请', href: '/admin/applications' },
    ]
  },
  {
    title: '分销',
    icon: '🤝',
    items: [
      { label: '分销概览', href: '/admin/distribution' },
      { label: '分销员管理', href: '/admin/distribution/distributors' },
      { label: '佣金管理', href: '/admin/distribution/commissions' },
      { label: '分销设置', href: '/admin/distribution/settings' },
    ]
  },
  {
    title: '客户',
    icon: '👥',
    items: [
      { label: '客户列表', href: '/admin/customers' },
      { label: '会员等级', href: '/admin/customers/levels' },
      { label: '客户标签', href: '/admin/customers/tags' },
      { label: '实名认证', href: '/admin/customers/verification' },
      { label: '站内信', href: '/admin/customers/messages' },
    ]
  },
  {
    title: '内容',
    icon: '📝',
    items: [
      { label: '素材中心', href: '/admin/content/media' },
      { label: '文章管理', href: '/admin/content/articles' },
      { label: '协议管理', href: '/admin/content/agreements' },
      { label: '留言反馈', href: '/admin/content/feedbacks' },
    ]
  },
  {
    title: '财务',
    icon: '💰',
    items: [
      { label: '资金总览', href: '/admin/finance' },
      { label: '充值管理', href: '/admin/finance/recharges' },
      { label: '提现管理', href: '/admin/finance/withdrawals' },
      { label: '分账管理', href: '/admin/finance/settlements' },
      { label: '交易日志', href: '/admin/finance/transactions' },
    ]
  },
  {
    title: '数据',
    icon: '📊',
    items: [
      { label: '销售统计', href: '/admin/reports/sales' },
      { label: '客户统计', href: '/admin/reports/customers' },
    ]
  },
  {
    title: '设置',
    icon: '⚙️',
    items: [
      { label: '基础设置', href: '/admin/settings' },
      { label: '账号权限', href: '/admin/settings/admins' },
      { label: '配送设置', href: '/admin/settings/shipping' },
      { label: '支付设置', href: '/admin/settings/payment' },
      { label: '操作日志', href: '/admin/settings/logs' },
    ]
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const lang = params.lang as string;
  const [collapsed, setCollapsed] = useState(false);

  const prefix = `/${lang}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} flex flex-col`}>
        <div className="h-16 border-b flex items-center justify-between px-4">
          {!collapsed && <span className="font-bold text-lg text-blue-600">Aegisky Admin</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded text-gray-500"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-2">
              {!collapsed && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={prefix + item.href}
                    className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {collapsed && <span className="text-lg">{group.icon}</span>}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-800">管理后台</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/${lang}`} className="text-sm text-gray-500 hover:text-blue-600">返回前台</Link>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
