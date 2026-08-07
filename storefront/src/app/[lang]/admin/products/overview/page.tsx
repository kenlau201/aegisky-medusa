'use client';

import { useEffect, useState } from 'react';

export default function ProductsOverviewPage() {
  const [stats, setStats] = useState({ total: 0, inStock: 0, outOfStock: 0, onSale: 0, categories: 0, brands: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/products/overview')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: '商品总数', value: stats.total, color: 'text-blue-600' },
    { label: '在售商品', value: stats.inStock, color: 'text-green-600' },
    { label: '缺货商品', value: stats.outOfStock, color: 'text-red-600' },
    { label: '促销商品', value: stats.onSale, color: 'text-orange-600' },
    { label: '商品分类', value: stats.categories, color: 'text-purple-600' },
    { label: '商品品牌', value: stats.brands, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">商品概览</h1>
        <p className="text-gray-500 mt-1">基于真实商品数据</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? '...' : s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
