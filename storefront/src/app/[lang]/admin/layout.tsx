'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useState } from 'react';

interface MenuItem {
  label: string;
  href?: string;
  children?: MenuItem[];
}

const menuGroups: { title: string; icon: string; items: MenuItem[] }[] = [
  {
    title: '商城',
    icon: '🏪',
    items: [
      { label: '概览', href: '/admin/dashboard' },
      {
        label: '订单管理',
        children: [
          { label: '全部订单', href: '/admin/orders' },
          { label: '积分订单', href: '/admin/orders/points' },
          { label: '订单导出', href: '/admin/orders/export' },
        ]
      },
      {
        label: '售后管理',
        children: [
          { label: '售后概览', href: '/admin/aftersales/overview' },
          { label: '退款审核', href: '/admin/aftersales' },
          { label: '退款日志', href: '/admin/aftersales/logs' },
        ]
      },
      {
        label: '商品管理',
        children: [
          { label: '商品列表', href: '/admin/products' },
          { label: '商品概览', href: '/admin/products/overview' },
          { label: '商品类目', href: '/admin/products/categories' },
          { label: '商品品牌', href: '/admin/products/brands' },
          { label: '商品评价', href: '/admin/products/reviews' },
          { label: '商品审核', href: '/admin/products/audit' },
          { label: '服务配置', href: '/admin/products/services' },
          { label: '批量操作', href: '/admin/products/batch' },
        ]
      },
      {
        label: '库存管理',
        children: [
          { label: '库存日志', href: '/admin/inventory/logs' },
          { label: '库存查询', href: '/admin/inventory/search' },
          { label: '商品入库', href: '/admin/inventory/inbound' },
          { label: '商品出库', href: '/admin/inventory/outbound' },
          { label: '库存调整', href: '/admin/inventory/adjust' },
        ]
      },
    ]
  },
  {
    title: '营销',
    icon: '🎯',
    items: [
      { label: '营销概览', href: '/admin/promotions' },
      {
        label: '营销管理',
        children: [
          { label: '优惠券', href: '/admin/promotions/coupons' },
          { label: '限时秒杀', href: '/admin/promotions/seckill' },
          { label: '满减活动', href: '/admin/promotions/discount' },
          { label: '满赠活动', href: '/admin/promotions/gift' },
          { label: '限时折扣', href: '/admin/promotions/timed-discount' },
          { label: '拼团活动', href: '/admin/promotions/group-buy' },
          { label: '活动赠品', href: '/admin/promotions/presents' },
          { label: '积分商品', href: '/admin/promotions/point-products' },
          { label: '积分签到', href: '/admin/promotions/checkin' },
          { label: '余额充值', href: '/admin/promotions/recharge' },
          { label: '电子卡券', href: '/admin/promotions/cards' },
          { label: '买家秀', href: '/admin/promotions/buyer-show' },
          { label: '礼品卡', href: '/admin/promotions/gift-cards' },
          { label: '抽奖活动', href: '/admin/promotions/lottery' },
        ]
      },
    ]
  },
  {
    title: '组织',
    icon: '🏢',
    items: [
      {
        label: '店铺管理',
        children: [
          { label: '店铺列表', href: '/admin/shops' },
          { label: '店铺设置', href: '/admin/shops/settings' },
        ]
      },
      {
        label: '供应商管理',
        children: [
          { label: '供应商列表', href: '/admin/suppliers' },
          { label: '供应商设置', href: '/admin/suppliers/settings' },
          { label: '供应商商品', href: '/admin/suppliers/products' },
          { label: '供应商订单', href: '/admin/suppliers/orders' },
        ]
      },
      {
        label: '商户管理',
        children: [
          { label: '入驻申请', href: '/admin/applications' },
          { label: '商户列表', href: '/admin/merchants' },
          { label: '商户设置', href: '/admin/merchants/settings' },
          { label: '招商内容', href: '/admin/merchants/recruitment' },
        ]
      },
    ]
  },
  {
    title: '分销',
    icon: '🤝',
    items: [
      { label: '分销概览', href: '/admin/distribution' },
      {
        label: '分销设置',
        children: [
          { label: '分销模式', href: '/admin/distribution/mode' },
        ]
      },
      {
        label: '分销商品',
        children: [
          { label: '商品佣金管理', href: '/admin/distribution/commissions' },
          { label: '成交分析', href: '/admin/distribution/analysis' },
        ]
      },
      {
        label: '分销员',
        children: [
          { label: '分销员管理', href: '/admin/distribution/distributors' },
          { label: '分销员分组', href: '/admin/distribution/groups' },
          { label: '分销员排行', href: '/admin/distribution/ranking' },
          { label: '分销员明细', href: '/admin/distribution/details' },
          { label: '客户成交', href: '/admin/distribution/customers' },
        ]
      },
      {
        label: '分销结算',
        children: [
          { label: '结算方案设置', href: '/admin/distribution/settlement' },
          { label: '业绩结算', href: '/admin/distribution/performance' },
        ]
      },
      {
        label: '内容管理',
        children: [
          { label: '分销攻略', href: '/admin/distribution/guide' },
          { label: '素材分类', href: '/admin/distribution/material-cats' },
          { label: '素材管理', href: '/admin/distribution/materials' },
        ]
      },
    ]
  },
  {
    title: '客户',
    icon: '👥',
    items: [
      {
        label: '客户管理',
        children: [
          { label: '等级权益', href: '/admin/customers/levels' },
          { label: '客户列表', href: '/admin/customers' },
          { label: '客户标签', href: '/admin/customers/tags' },
          { label: '客户设置', href: '/admin/customers/settings' },
        ]
      },
      {
        label: '实名认证',
        children: [
          { label: '认证设置', href: '/admin/customers/verification-settings' },
          { label: '客户认证', href: '/admin/customers/verification' },
        ]
      },
      {
        label: '消息管理',
        children: [
          { label: '站内信', href: '/admin/customers/messages' },
        ]
      },
    ]
  },
  {
    title: '内容',
    icon: '📝',
    items: [
      {
        label: '素材管理',
        children: [
          { label: '素材中心', href: '/admin/content/media' },
        ]
      },
      {
        label: '文章管理',
        children: [
          { label: '文章列表', href: '/admin/articles' },
          { label: '文章分类', href: '/admin/articles/categories' },
        ]
      },
      {
        label: '协议管理',
        children: [
          { label: '服务协议', href: '/admin/content/agreements/service' },
          { label: '隐私政策', href: '/admin/content/agreements/privacy' },
        ]
      },
      {
        label: '留言管理',
        children: [
          { label: '留言反馈', href: '/admin/content/feedbacks' },
        ]
      },
      {
        label: '视频号',
        children: [
          { label: '视频号列表', href: '/admin/content/channels' },
        ]
      },
    ]
  },
  {
    title: '财务',
    icon: '💰',
    items: [
      {
        label: '会员资金管理',
        children: [
          { label: '资金总览', href: '/admin/finance' },
          { label: '提现管理', href: '/admin/finance/withdrawals' },
          { label: '充值管理', href: '/admin/finance/recharges' },
          { label: '分销佣金', href: '/admin/finance/distribution-commission' },
          { label: '积分日志', href: '/admin/finance/point-logs' },
        ]
      },
      {
        label: '分账管理',
        children: [
          { label: '分账设置', href: '/admin/finance/settlement-settings' },
          { label: '提现设置', href: '/admin/finance/withdrawal-settings' },
          { label: '服务费率', href: '/admin/finance/fees' },
        ]
      },
      {
        label: '店铺资金管理',
        children: [
          { label: '资金概览', href: '/admin/finance/shop-overview' },
          { label: '店铺资金', href: '/admin/finance/shop-funds' },
          { label: '对账单下载', href: '/admin/finance/shop-statements' },
          { label: '对账单明细', href: '/admin/finance/shop-statement-details' },
          { label: '提现管理', href: '/admin/finance/shop-withdrawals' },
          { label: '资金日志', href: '/admin/finance/shop-logs' },
        ]
      },
      {
        label: '供应商资金管理',
        children: [
          { label: '资金概览', href: '/admin/finance/supplier-overview' },
          { label: '供应商资金', href: '/admin/finance/supplier-funds' },
          { label: '对账单下载', href: '/admin/finance/supplier-statements' },
          { label: '对账单明细', href: '/admin/finance/supplier-statement-details' },
          { label: '提现管理', href: '/admin/finance/supplier-withdrawals' },
          { label: '资金日志', href: '/admin/finance/supplier-logs' },
        ]
      },
      {
        label: '交易管理',
        children: [
          { label: '交易日志', href: '/admin/finance/transactions' },
          { label: '余额日志', href: '/admin/finance/balance-logs' },
        ]
      },
    ]
  },
  {
    title: '数据',
    icon: '📊',
    items: [
      {
        label: '销售统计',
        children: [
          { label: '销售概览', href: '/admin/reports/sales' },
          { label: '销售明细', href: '/admin/reports/sales-details' },
          { label: '销售指标', href: '/admin/reports/sales-metrics' },
          { label: '销售排行', href: '/admin/reports/sales-ranking' },
        ]
      },
      {
        label: '客户统计',
        children: [
          { label: '客户概览', href: '/admin/reports/customers' },
          { label: '访问统计', href: '/admin/reports/visits' },
          { label: '消费排行', href: '/admin/reports/consumption-ranking' },
          { label: '新增客户', href: '/admin/reports/new-customers' },
        ]
      },
    ]
  },
  {
    title: '设置',
    icon: '⚙️',
    items: [
      {
        label: '商城设置',
        children: [
          { label: '基础信息', href: '/admin/settings' },
          { label: '商品设置', href: '/admin/settings/product' },
          { label: '交易设置', href: '/admin/settings/trade' },
          { label: '订单设置', href: '/admin/settings/order' },
          { label: '小票打印', href: '/admin/settings/receipt' },
          { label: '客服设置', href: '/admin/settings/customer-service' },
          { label: '个性化设置', href: '/admin/settings/customization' },
          { label: '小程序设置', href: '/admin/settings/miniprogram' },
          { label: '经营模式', href: '/admin/settings/business-mode' },
        ]
      },
      {
        label: '配送设置',
        children: [
          { label: '配送设置', href: '/admin/settings/shipping' },
          { label: '物流公司', href: '/admin/settings/logistics' },
        ]
      },
      {
        label: '系统设置',
        children: [
          { label: '全局设置', href: '/admin/settings/global' },
          { label: '登录设置', href: '/admin/settings/login' },
          { label: '支付设置', href: '/admin/settings/payment' },
          { label: '地区管理', href: '/admin/settings/regions' },
          { label: '邮件服务器', href: '/admin/settings/mail-server' },
          { label: '邮件模板', href: '/admin/settings/mail-template' },
          { label: '友情链接', href: '/admin/settings/friend-links' },
          { label: 'API版本', href: '/admin/settings/api-version' },
          { label: '授权信息', href: '/admin/settings/authorization' },
        ]
      },
      {
        label: '账号权限',
        children: [
          { label: '管理员列表', href: '/admin/settings/admins' },
          { label: '账号管理', href: '/admin/auth/accounts' },
          { label: '角色管理', href: '/admin/settings/roles' },
          { label: '操作日志', href: '/admin/settings/logs' },
          { label: '菜单管理', href: '/admin/settings/menus' },
        ]
      },
      {
        label: '消息设置',
        children: [
          { label: '消息管理', href: '/admin/settings/notifications' },
          { label: '通知设置', href: '/admin/settings/notification-settings' },
        ]
      },
    ]
  },
  {
    title: '装修',
    icon: '🎨',
    items: [
      { label: '主题风格', href: '/admin/settings/decoration/theme' },
      {
        label: '移动端装修',
        children: [
          { label: '页面管理', href: '/admin/decoration/mobile/pages' },
          { label: '分类页', href: '/admin/decoration/mobile/category' },
          { label: '主导航栏', href: '/admin/decoration/mobile/nav' },
          { label: '会员页', href: '/admin/decoration/mobile/member' },
          { label: '开屏广告', href: '/admin/settings/decoration/splash' },
          { label: '其他页面', href: '/admin/decoration/mobile/other' },
          { label: '分类导航', href: '/admin/decoration/mobile/category-nav' },
        ]
      },
      {
        label: 'PC端装修',
        children: [
          { label: '首页装修', href: '/admin/decoration/pc/home' },
          { label: '页面管理', href: '/admin/settings/pc/pages' },
          { label: '导航菜单', href: '/admin/settings/pc/navigation' },
          { label: '分类抽屉', href: '/admin/settings/pc/category-drawer' },
          { label: '其他页面', href: '/admin/decoration/pc/other' },
          { label: '自定义页', href: '/admin/decoration/pc/custom' },
        ]
      },
    ]
  },
  {
    title: '批发',
    icon: '🏭',
    items: [
      { label: '询价管理', href: '/admin/wholesale/inquiry' },
      { label: '批量订单', href: '/admin/wholesale/bulk-order' },
      { label: '企业认证', href: '/admin/wholesale/verification' },
      { label: '价格控制', href: '/admin/wholesale/price-control' },
    ]
  },
  {
    title: '跨境',
    icon: '🌍',
    items: [
      { label: '专享组件', href: '/admin/cross-border/components' },
      { label: 'PC模板', href: '/admin/cross-border/pc-template' },
      { label: '移动端模板', href: '/admin/cross-border/mobile-template' },
      { label: '第三方登录', href: '/admin/cross-border/login' },
      { label: '翻译管理', href: '/admin/cross-border/translation' },
      { label: '图片智能处理', href: '/admin/cross-border/image' },
    ]
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const lang = params.lang as string;
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['商品管理', '订单管理', '售后管理']));

  const prefix = `/${lang}`;

  const toggleExpand = (label: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href && (pathname === item.href || pathname?.startsWith(item.href + '/'))) return true;
    if (item.children) return item.children.some(child => isItemActive(child));
    return false;
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.children) {
      const isExpanded = expandedMenus.has(item.label);
      const hasActiveChild = isItemActive(item);
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
              hasActiveChild ? 'text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{item.label}</span>
            <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
          </button>
          {isExpanded && (
            <div className="bg-gray-50">
              {item.children.map(child => (
                <Link
                  key={child.href}
                  href={prefix + child.href}
                  className={`flex items-center pl-8 pr-4 py-1.5 text-sm transition-colors ${
                    child.href && (pathname === child.href || pathname?.startsWith(child.href + '/'))
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-medium'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={prefix + item.href}
        className={`flex items-center px-4 py-2 text-sm transition-colors ${
          item.href && (pathname === item.href || pathname?.startsWith(item.href + '/'))
            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} flex flex-col flex-shrink-0 overflow-y-auto`} style={{maxHeight: '100vh'}}>
        <div className="h-16 border-b flex items-center justify-between px-4 flex-shrink-0">
          {!collapsed && <span className="font-bold text-lg text-blue-600">Aegisky Admin</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded text-gray-500"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="flex-1 py-2">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-1">
              {!collapsed && (
                <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {!collapsed && group.items.map(item => renderMenuItem(item))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 flex-shrink-0">
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
