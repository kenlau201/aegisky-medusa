'use client';

import { useState, useEffect } from 'react';

export default function PCPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const columns = [{"key":"title","label":"标题"},{"key":"path","label":"路径"},{"key":"views","label":"浏览"},{"key":"status","label":"状态"}];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PC页面管理</h1>
        <p className="text-gray-500 mt-1">PC端自定义页面</p>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex gap-2">
            <input type="text" placeholder="搜索..." className="px-3 py-1.5 border rounded text-sm w-64" />
            <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">搜索</button>
          </div>
          <button className="px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">导出</button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((c: any) => (
                  <th key={c.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((c: any) => (
                    <td key={c.key} className="px-4 py-3 text-sm">{row[c.key] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}