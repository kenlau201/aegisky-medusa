'use client';

import { useEffect, useState } from 'react';

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <p className="text-gray-500 mt-1">查看和管理所有订单</p>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap gap-4">
          <input type="text" placeholder="订单号/客户名称..." className="px-4 py-2 border rounded-lg w-64" />
          <select className="px-4 py-2 border rounded-lg">
            <option>全部状态</option>
            <option>待付款</option>
            <option>待发货</option>
            <option>已发货</option>
            <option>已完成</option>
            <option>已取消</option>
          </select>
          <input type="date" className="px-4 py-2 border rounded-lg" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">搜索</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">导出订单</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">订单号</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">客户</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">商品</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">金额</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">下单时间</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : orders.length > 0 ? orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-blue-600">{o.order_number || o.id?.slice(0, 8)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{o.customer_name || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{o.item_count || 0} 件商品</td>
                <td className="px-6 py-4 text-sm font-medium">${o.total || '0.00'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {o.status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline text-sm">详情</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">暂无订单数据</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
