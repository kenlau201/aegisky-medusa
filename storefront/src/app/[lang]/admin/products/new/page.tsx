'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    regular_price: '',
    sale_price: '',
    short_description: '',
    description: '',
    main_image: '',
    in_stock: true,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setForm({ ...form, main_image: data.url });
      } else {
        alert('上传失败: ' + data.error);
      }
    } catch (error: any) {
      alert('上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 生成下一个ID
      const maxIdRes = await fetch('/api/admin/products/max-id');
      const maxIdData = await maxIdRes.json();
      const newId = (maxIdData.maxId || 70000) + 1;

      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + newId;

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          name: form.name,
          slug: slug,
          sku: form.sku,
          price: parseFloat(form.price) || 0,
          regular_price: parseFloat(form.regular_price) || parseFloat(form.price) || 0,
          sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
          short_description: form.short_description,
          description: form.description,
          main_image: form.main_image,
          in_stock: form.in_stock,
          on_sale: !!form.sale_price,
          currency: 'USD',
        }),
      });

      if (res.ok) {
        alert('商品创建成功');
        router.push(`/${lang}/admin/products`);
      } else {
        const err = await res.json();
        alert('创建失败: ' + (err.error || '未知错误'));
      }
    } catch (error: any) {
      alert('创建失败: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href={`/${lang}/admin/products`} className="text-gray-500 hover:text-gray-700">
          ← 返回列表
        </Link>
        <h1 className="text-2xl font-bold">新增商品</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基础信息 */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">基础信息</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品名称 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入商品名称"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU/货号</label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="商品货号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">商品图片</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.main_image}
                  onChange={e => setForm({ ...form, main_image: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-lg"
                  placeholder="图片URL或上传"
                />
                <label className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 relative">
                  {uploading ? '上传中...' : '📁 上传'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">简短描述</label>
            <textarea
              value={form.short_description}
              onChange={e => setForm({ ...form, short_description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={2}
              placeholder="商品简短介绍"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={6}
              placeholder="商品详细描述，支持HTML"
            />
          </div>
        </div>

        {/* 价格 */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">价格库存</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">售价 *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">原价</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.regular_price}
                  onChange={e => setForm({ ...form, regular_price: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">促销价</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.sale_price}
                  onChange={e => setForm({ ...form, sale_price: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="in_stock"
              checked={form.in_stock}
              onChange={e => setForm({ ...form, in_stock: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="in_stock" className="text-sm text-gray-700">上架销售（有库存）</label>
          </div>
        </div>

        {/* 预览图 */}
        {form.main_image && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">图片预览</h2>
            <img src={form.main_image} alt="预览" className="max-w-xs rounded-lg border" />
          </div>
        )}

        {/* 按钮 */}
        <div className="flex gap-4 justify-end">
          <Link
            href={`/${lang}/admin/products`}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '创建商品'}
          </button>
        </div>
      </form>
    </div>
  );
}
