'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then(r => r.json())
      .then(data => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setOrder({ ...order, status });
    setUpdating(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">加载中...</div>;
  }

  if (!order) {
    return <div className="text-center py-12 text-gray-400">订单不存在</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${lang}/admin/orders`} className="text-gray-500 hover:text-gray-700">
            ← 返回列表
          </Link>
          <h1 className="text-2xl font-bold">订单详情</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => updateStatus('paid')}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                标记已付款
              </button>
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={updating}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                取消订单
              </button>
            </>
          )}
          {order.status === 'paid' && (
            <button
              onClick={() => updateStatus('shipped')}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              标记已发货
            </button>
          )}
          {order.status === 'shipped' && (
            <button
              onClick={() => updateStatus('completed')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              确认完成
            </button>
          )}
          {order.status === 'completed' && (
            <button
              onClick={() => updateStatus('refunded')}
              disabled={updating}
              className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50"
            >
              退款
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 订单基本信息 */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">订单信息</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">订单号</div>
                <div className="font-mono font-medium mt-1">{order.order_number}</div>
              </div>
              <div>
                <div className="text-gray-500">下单时间</div>
                <div className="font-medium mt-1">{new Date(order.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">支付状态</div>
                <div className="font-medium mt-1">{order.payment_status || '待支付'}</div>
              </div>
              <div>
                <div className="text-gray-500">发货状态</div>
                <div className="font-medium mt-1">{order.fulfillment_status || '未发货'}</div>
              </div>
            </div>
          </div>

          {/* 商品列表 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">商品明细</h2>
            {order.items && order.items.length > 0 ? (
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 text-sm text-gray-500">商品</th>
                    <th className="text-right py-2 text-sm text-gray-500">单价</th>
                    <th className="text-right py-2 text-sm text-gray-500">数量</th>
                    <th className="text-right py-2 text-sm text-gray-500">小计</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3">{item.title || item.product_title}</td>
                      <td className="text-right py-3">${item.unit_price || item.price}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3 font-medium">${(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-400">暂无商品明细</div>
            )}
          </div>
        </div>

        {/* 金额汇总 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">金额汇总</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">商品小计</span>
                <span>${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">运费</span>
                <span>${(order.shipping_total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">税费</span>
                <span>${(order.tax_total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">优惠</span>
                <span className="text-red-500">-${(order.discount_total || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-base">
                <span>实付金额</span>
                <span className="text-red-600">${(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 客户信息 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">客户信息</h2>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-gray-500">邮箱</div>
                <div className="font-medium mt-1">{order.email || '-'}</div>
              </div>
              {order.shipping_address && (
                <div>
                  <div className="text-gray-500">收货地址</div>
                  <div className="font-medium mt-1">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                    {order.shipping_address.address_1}<br />
                    {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}<br />
                    {order.shipping_address.country_code}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
