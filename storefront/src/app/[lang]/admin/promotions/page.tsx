'use client';

import { useState, useEffect } from 'react';

const shortcuts = [
  { name: '优惠券', desc: '向客户发放店铺优惠券', icon: '🎫', color: 'bg-red-500', href: '/admin/promotions/coupons' },
  { name: '限时秒杀', desc: '快速抢购引导顾客更多消费', icon: '⚡', color: 'bg-red-500', href: '/admin/promotions/seckill' },
  { name: '满减', desc: '购满一定金额或件数享受优惠', icon: '💰', color: 'bg-red-500', href: '/admin/promotions/discount' },
  { name: '满赠', desc: '购满一定金额或件数享受优惠', icon: '🎁', color: 'bg-red-500', href: '/admin/promotions/gift' },
  { name: '限时折扣', desc: '设置商品限时打折促销', icon: '🏷️', color: 'bg-red-500', href: '/admin/promotions/timed-discount' },
  { name: '日历签到', desc: '每日签到领取积分或奖励', icon: '📅', color: 'bg-red-500', href: '/admin/promotions/checkin' },
  { name: '赠品', desc: '设置赠品，回馈客户', icon: '🎀', color: 'bg-red-500', href: '/admin/promotions/presents' },
  { name: '余额充值', desc: '充值店铺余额', icon: '💳', color: 'bg-red-500', href: '/admin/promotions/recharge' },
];

const activityTabs = ['全部', '秒杀', '优惠券', '限时折扣', '满减', '满赠', '抽奖'];

const activities = [
  { name: '吉牡9折', shop: '自营店铺', type: '限时折扣', time: '2026-07-17 00:00:00 至 2029-07-31 00:00:00', status: '活动进行中' },
  { name: '新人专享', shop: '自营店铺', type: '优惠券', time: '2026-08-01 至 2026-12-31', status: '活动进行中' },
];

export default function PromotionOverviewPage() {
  const [activeTab, setActiveTab] = useState('全部');
  const [prefix, setPrefix] = useState('/en');
  useEffect(() => {
    setPrefix(`/${window.location.pathname.split('/')[1]}`);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">营销概览</h1>
        <p className="text-gray-500 mt-1">仅统计优惠券、满减/折、限时折扣、秒杀、满赠活动</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-bold text-blue-600">16</div>
          <div className="text-sm text-gray-500 mt-1">进行中的活动</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-bold">0</div>
          <div className="text-sm text-gray-500 mt-1">7天内到期活动</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-bold">0</div>
          <div className="text-sm text-gray-500 mt-1">未开始活动</div>
        </div>
      </div>

      {/* 商家常用 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">商家常用</h2>
        <div className="grid grid-cols-4 gap-4">
          {shortcuts.map((item) => (
            <a key={item.name} href={prefix + item.href} className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white text-xl`}>{item.icon}</div>
              <div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 活动记录 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">活动记录</h2>
        <div className="flex gap-6 border-b mb-4">
          {activityTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-3 font-medium">活动名称</th>
              <th className="pb-3 font-medium">所属店铺</th>
              <th className="pb-3 font-medium">活动类型</th>
              <th className="pb-3 font-medium">活动时间</th>
              <th className="pb-3 font-medium">活动状态</th>
              <th className="pb-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activities.map((act, i) => (
              <tr key={i} className="text-sm">
                <td className="py-3">{act.name}</td>
                <td className="py-3 text-gray-600">{act.shop}</td>
                <td className="py-3 text-gray-600">{act.type}</td>
                <td className="py-3 text-gray-600">{act.time}</td>
                <td className="py-3"><span className="text-green-600">{act.status}</span></td>
                <td className="py-3">
                  <button className="text-blue-600 hover:underline mr-2">查看活动</button>
                  <button className="text-red-600 hover:underline">禁用活动</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
