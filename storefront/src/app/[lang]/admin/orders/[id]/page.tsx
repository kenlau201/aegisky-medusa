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
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNo, setTrackingNo] = useState('');
  const [logisticsCompany, setLogisticsCompany] = useState('SF');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then(r => r.json())
      .then(data => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  const updateStatus = async (status: string, extra?: any) => {
    setUpdating(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extra }),
    });
    setOrder({ ...order, status, ...extra });
    setUpdating(false);
    setShowShipModal(false);
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
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">打印订单</button>
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => updateStatus('paid')}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                标记已付款
              </button>
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={updating}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm"
              >
                取消订单
              </button>
            </>
          )}
          {order.status === 'paid' && (
            <button
              onClick={() => setShowShipModal(true)}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              去发货
            </button>
          )}
          {order.status === 'shipped' && (
            <button
              onClick={() => updateStatus('completed')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              确认完成
            </button>
          )}
          {(order.status === 'shipped' || order.status === 'completed') && (
            <button
              onClick={() => updateStatus('refunded')}
              disabled={updating}
              className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 text-sm"
            >
              退款
            </button>
          )}
        </div>
      </div>

      {/* 状态进度条 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between">
          {['pending', 'paid', 'shipped', 'completed'].map((s, i) => {
            const statusOrder = ['pending', 'paid', 'shipped', 'completed'];
            const currentIdx = statusOrder.indexOf(order.status);
            const thisIdx = statusOrder.indexOf(s);
            const isDone = thisIdx <= currentIdx && order.status !== 'cancelled' && order.status !== 'refunded';
            return (
              <div key={s} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    isDone ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className={`mt-2 text-sm ${isDone ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    {statusLabels[s]}
                  </span>
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${isDone && thisIdx < currentIdx ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            );
          })}
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
                <div className="text-gray-500">支付方式</div>
                <div className="font-medium mt-1">{order.payment_method || '信用卡'}</div>
              </div>
              <div>
                <div className="text-gray-500">支付时间</div>
                <div className="font-medium mt-1">{order.paid_at ? new Date(order.paid_at).toLocaleString() : '-'}</div>
              </div>
              {order.tracking_no && (
                <>
                  <div>
                    <div className="text-gray-500">物流公司</div>
                    <div className="font-medium mt-1">{order.logistics_company || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">物流单号</div>
                    <div className="font-mono font-medium mt-1 text-blue-600">{order.tracking_no}</div>
                  </div>
                </>
              )}
            </div>
            {order.remark && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-gray-500 text-sm">订单备注</div>
                <div className="mt-1 text-sm">{order.remark}</div>
              </div>
            )}
          </div>

          {/* 商品列表 */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">商品明细</h2>
            {order.items && order.items.length > 0 ? (
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 text-sm text-gray-500">商品</th>
                    <th className="text-center py-2 text-sm text-gray-500">规格</th>
                    <th className="text-right py-2 text-sm text-gray-500">单价</th>
                    <th className="text-right py-2 text-sm text-gray-500">数量</th>
                    <th className="text-right py-2 text-sm text-gray-500">小计</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3 text-sm">{item.title || item.product_title}</td>
                      <td className="py-3 text-center text-sm text-gray-500">{item.variant_title || '-'}</td>
                      <td className="text-right py-3 text-sm">${item.unit_price || item.price}</td>
                      <td className="text-right py-3 text-sm">{item.quantity}</td>
                      <td className="text-right py-3 text-sm font-medium">${(item.unit_price * item.quantity).toFixed(2)}</td>
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
            <h2 className="text-lg font-semibold mb-4">收货信息</h2>
            <div className="space-y-2 text-sm">
              {order.shipping_address ? (
                <>
                  <div>
                    <div className="text-gray-500">收货人</div>
                    <div className="font-medium mt-1">
                      {order.shipping_address.first_name} {order.shipping_address.last_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">联系电话</div>
                    <div className="font-medium mt-1">{order.shipping_address.phone || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">收货地址</div>
                    <div className="font-medium mt-1">
                      {order.shipping_address.address_1}<br />
                      {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}<br />
                      {order.shipping_address.country_code}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">暂无收货信息</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 发货弹窗 */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-[450px]">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-bold">订单发货</h3>
              <button onClick={() => setShowShipModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">物流公司</label>
                <select
                  value={logisticsCompany}
                  onChange={e => setLogisticsCompany(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="SF">顺丰速运</option>
                  <option value="YTO">圆通速递</option>
                  <option value="ZTO">中通快递</option>
                  <option value="YD">韵达快递</option>
                  <option value="EMS">EMS</option>
                  <option value="JD">京东物流</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">物流单号 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={trackingNo}
                  onChange={e => setTrackingNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="请输入物流单号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">发货备注</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="可选"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowShipModal(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
              <button
                onClick={() => updateStatus('shipped', { tracking_no: trackingNo, logistics_company: logisticsCompany, remark })}
                disabled={!trackingNo || updating}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                确认发货
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
