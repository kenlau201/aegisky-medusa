'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProductDetailModal from './ProductDetailModal';

export default function ProductsAdminPage() {
  const params = useParams();
  const lang = params.lang as string;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [aiProcessing, setAiProcessing] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/products?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.ceil(total / pageSize);

  const handleAIAction = async (productId: number, action: string) => {
    setOpenDropdown(null);
    setAiProcessing(action);
    try {
      await fetch('/api/admin/products/ai-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action })
      });
      alert(`AI任务"${action}"已提交，处理中...`);
    } catch (e) {
      alert('AI功能调用失败');
    }
    setAiProcessing(null);
  };

  const togglePublish = async (productId: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ in_stock: !currentStatus })
      });
      setProducts(products.map((p: any) =>
        p.id === productId ? { ...p, in_stock: !currentStatus } : p
      ));
    } catch (e) {
      alert('操作失败');
    }
  };

  const openDetail = (product: any) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品列表</h1>
          <p className="text-gray-500 mt-1">共 {total.toLocaleString()} 件商品</p>
        </div>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">批量导出</button>
          <Link href={`/${lang}/admin/products/new`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            + 新增商品
          </Link>
        </div>
      </div>

      {/* Tab */}
      <div className="bg-white rounded-xl border">
        <div className="border-b px-4 flex gap-6">
          {[
            { key: 'on_sale', label: '出售中的商品' },
            { key: 'off_shelf', label: '已下架商品' }
          ].map(t => (
            <button key={t.key} onClick={() => setStatusFilter(t.key)}
              className={`py-3 px-2 border-b-2 text-sm transition ${statusFilter === t.key ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 筛选 */}
        <div className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">商品名称:</label>
            <input
              type="text"
              placeholder="输入商品名称/货号"
              defaultValue={search}
              onKeyDown={(e) => e.key === 'Enter' && setSearch((e.target as HTMLInputElement).value)}
              className="px-3 py-1.5 border rounded text-sm w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">店铺:</label>
            <select className="px-3 py-1.5 border rounded text-sm">
              <option>请输入店铺名称</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">分类:</label>
            <select className="px-3 py-1.5 border rounded text-sm">
              <option>选择分类</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">品牌:</label>
            <select className="px-3 py-1.5 border rounded text-sm">
              <option>选择品牌</option>
            </select>
          </div>
          <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">搜索</button>
          <button className="px-4 py-1.5 border rounded text-sm hover:bg-gray-50">重置</button>
        </div>
      </div>

      {/* AI处理中提示 */}
      {aiProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-blue-700 text-sm">AI正在处理: {aiProcessing}，请稍候...</span>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">商品名称</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">商品信息</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">是否上架</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">库存</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">排序</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : products.length > 0 ? products.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.main_image ? (
                      <img src={p.main_image} className="w-14 h-14 rounded object-cover border" alt="" />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-2xl">📦</div>
                    )}
                    <div className="max-w-xs">
                      <div className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">{p.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">自营店铺</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">编码: <span className="font-mono">{p.sku || p.id}</span></div>
                  <div className="text-sm font-medium text-red-600 mt-1">售价: ${p.price}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => togglePublish(p.id, p.in_stock)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${p.in_stock ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${p.in_stock ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.stock || 9999}</td>
                <td className="px-6 py-4 text-sm text-gray-700">100</td>
                <td className="px-6 py-4 relative" ref={openDropdown === p.id ? dropdownRef : null}>
                  <div className="flex items-center gap-3 text-sm">
                    <button onClick={() => openDetail(p)} className="text-blue-600 hover:text-blue-800">详情</button>
                    <span className="text-gray-300">|</span>
                    <button className="text-blue-600 hover:text-blue-800">越权操作</button>
                    <span className="text-gray-300">|</span>
                    <button className="text-blue-600 hover:text-blue-800">查看商品</button>
                    <span className="text-gray-300">|</span>
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === p.id ? null : p.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        更多
                        <svg className={`w-3 h-3 transition ${openDropdown === p.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openDropdown === p.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-50 min-w-[160px]">
                          <button onClick={() => { setOpenDropdown(null); alert('推广功能开发中'); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            推广
                          </button>
                          <button onClick={() => handleAIAction(p.id, '智能批量翻译图片')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <span className="text-purple-600">✨</span> 智能批量翻译图片
                          </button>
                          <button onClick={() => handleAIAction(p.id, '智能消除图片文字')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <span className="text-purple-600">✨</span> 智能消除图片文字
                          </button>
                          <button onClick={() => handleAIAction(p.id, '一键翻译商品文字')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <span className="text-purple-600">✨</span> 一键翻译商品文字
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">暂无商品数据</td></tr>
            )}
          </tbody>
        </table>

        {/* 分页 */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            第 {page} 页 / 共 {totalPages} 页，总计 {total.toLocaleString()} 条
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 商品详情弹窗 */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
}
