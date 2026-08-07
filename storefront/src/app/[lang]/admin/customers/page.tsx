'use client';

import { useEffect, useState } from 'react';

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(r => r.json())
      .then(data => {
        setCustomers(data.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
        <p className="text-gray-500 mt-1">管理平台注册用户</p>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-wrap gap-4">
          <input type="text" placeholder="搜索客户名称/手机号/邮箱..." className="px-4 py-2 border rounded-lg w-64" />
          <select className="px-4 py-2 border rounded-lg">
            <option>全部等级</option>
            <option>普通会员</option>
            <option>白银会员</option>
            <option>铂金会员</option>
            <option>钻石会员</option>
            <option>至尊会员</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">搜索</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">客户信息</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">联系方式</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">会员等级</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">消费金额</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">注册时间</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : customers.length > 0 ? customers.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {(c.first_name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{c.first_name} {c.last_name}</div>
                      <div className="text-sm text-gray-500">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.phone || '-'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">普通会员</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">${c.total_spent || '0.00'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:underline text-sm">详情</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">暂无客户数据</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
