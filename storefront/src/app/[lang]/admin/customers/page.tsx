'use client';

import { useEffect, useState } from 'react';

const levelColors: Record<string, string> = {
  '普通会员': 'bg-gray-100 text-gray-700',
  '白银会员': 'bg-slate-100 text-slate-700',
  '铂金会员': 'bg-blue-100 text-blue-700',
  '钻石会员': 'bg-cyan-100 text-cyan-700',
  '至尊会员': 'bg-amber-100 text-amber-700',
};

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const pageSize = 20;

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/customers?page=${page}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`)
      .then(r => r.json())
      .then(data => {
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">客户管理</h1>
          <p className="text-gray-500 mt-1">共 {total} 位客户</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 flex gap-4">
        <input
          type="text" placeholder="搜索用户名/邮箱/手机号..."
          value={keyword} onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (setPage(1), load())}
          className="px-4 py-2 border rounded-lg w-80"
        />
        <button onClick={() => { setPage(1); load(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">搜索</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">客户信息</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">联系方式</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">等级</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">积分</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">累计消费</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">订单数</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">注册时间</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : customers.length > 0 ? customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {(c.username || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{c.username || '-'}</div>
                      <div className="text-xs text-gray-500">ID: {c.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div>{c.email || '-'}</div>
                  <div className="text-gray-500">{c.phone || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${levelColors[c.level_name] || 'bg-gray-100'}`}>
                    {c.level_name || '普通会员'}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{c.points || 0}</td>
                <td className="px-6 py-4 font-medium">${(c.total_spent || 0).toFixed(2)}</td>
                <td className="px-6 py-4">{c.order_count || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex w-2 h-2 rounded-full mr-2 ${c.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  {c.status === 'active' ? '正常' : '禁用'}
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">暂无客户数据</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">上一页</button>
          <span className="px-3 py-1">第 {page} / {Math.ceil(total / pageSize)} 页</span>
          <button disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">下一页</button>
        </div>
      )}
    </div>
  );
}
