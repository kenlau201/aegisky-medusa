'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface PromotionData {
  activeCoupons: number;
  totalCoupons: number;
  coupons: { id: string; name: string; code: string; discount_type: string; discount_value: number; status: string; valid_from: string; valid_to: string }[];
}

const shortcuts = [
  { name: '优惠券', desc: '向客户发放店铺优惠券', icon: '🎫', color: 'bg-red-500', href: '/admin/promotions/coupons' },
  { name: '限时秒杀', desc: '快速抢购引导顾客更多消费', icon: '⚡', color: 'bg-orange-500', href: '/admin/promotions/seckill' },
  { name: '满减', desc: '购满一定金额或件数享受优惠', icon: '💰', color: 'bg-green-500', href: '/admin/promotions/discount' },
  { name: '满赠', desc: '购满一定金额或件数享受优惠', icon: '🎁', color: 'bg-purple-500', href: '/admin/promotions/gift' },
  { name: '限时折扣', desc: '设置商品限时打折促销', icon: '🏷️', color: 'bg-blue-500', href: '/admin/promotions/timed-discount' },
  { name: '日历签到', desc: '每日签到领取积分或奖励', icon: '📅', color: 'bg-teal-500', href: '/admin/promotions/checkin' },
  { name: '赠品', desc: '设置赠品，回馈客户', icon: '🎀', color: 'bg-pink-500', href: '/admin/promotions/presents' },
  { name: '余额充值', desc: '充值店铺余额', icon: '💳', color: 'bg-indigo-500', href: '/admin/promotions/recharge' },
];

export default function PromotionOverviewPage() {
  const params = useParams();
  const lang = params.lang as string;
  const prefix = `/${lang}`;
  const [data, setData] = useState<PromotionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/promotions/overview')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">营销概览</h1>
        <p className="text-gray-500 mt-1">优惠券和促销活动管理</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-bold text-blue-600">{loading ? '...' : data?.activeCoupons ?? 0}</div>
          <div className="text-sm text-gray-500 mt-1">进行中的优惠券</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-bold">{loading ? '...' : data?.totalCoupons ?? 0}</div>
          <div className="text-sm text-gray-500 mt-1">优惠券总数</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-500 mt-1">其他促销活动</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">商家常用</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shortcuts.map(item => (
            <Link key={item.name} href={prefix + item.href} className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white text-xl`}>{item.icon}</div>
              <div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">优惠券列表</h2>
        {data?.coupons && data.coupons.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-3 font-medium">名称</th>
                <th className="pb-3 font-medium">代码</th>
                <th className="pb-3 font-medium">折扣</th>
                <th className="pb-3 font-medium">有效期</th>
                <th className="pb-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.coupons.map(c => (
                <tr key={c.id} className="text-sm">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3 font-mono text-blue-600">{c.code}</td>
                  <td className="py-3">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}</td>
                  <td className="py-3 text-gray-500">{c.valid_from ? new Date(c.valid_from).toLocaleDateString() : '-'} ~ {c.valid_to ? new Date(c.valid_to).toLocaleDateString() : '-'}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-400 text-center py-8">{loading ? '加载中...' : '暂无优惠券数据'}</div>
        )}
      </div>
    </div>
  );
}
