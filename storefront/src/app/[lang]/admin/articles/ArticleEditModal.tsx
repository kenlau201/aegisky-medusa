'use client';

import { useEffect, useState } from 'react';

export default function ArticleEditModal({ article, onClose, onSave }: { article?: any; onClose: () => void; onSave?: () => void }) {
  const [form, setForm] = useState({
    title: article?.title || '',
    category_id: article?.category_id || '',
    content: article?.content || '',
    summary: article?.summary || '',
    cover_image: article?.cover_image || '',
    status: article?.status || 'draft',
    is_published: article?.is_published || false,
  });
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/articles?includeCategories=true')
      .then(r => r.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  const handleSubmit = async () => {
    if (!form.title) {
      alert('请输入文章标题');
      return;
    }

    const method = article ? 'PUT' : 'POST';
    const url = article ? `/api/admin/articles/${article.id}` : '/api/admin/articles';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    onSave?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[800px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold">{article ? '编辑文章' : '发布文章'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">文章标题 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="输入文章标题"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">文章分类</label>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="">选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">状态</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">封面图片</label>
            <div className="flex items-center gap-3">
              <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 cursor-pointer overflow-hidden">
                {form.cover_image ? (
                  <img src={form.cover_image} className="w-full h-full object-cover" alt="" />
                ) : '+'}
              </div>
              <input
                type="text"
                value={form.cover_image}
                onChange={e => setForm({ ...form, cover_image: e.target.value })}
                className="flex-1 px-3 py-2 border rounded text-sm"
                placeholder="输入图片URL"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">文章摘要</label>
            <textarea
              value={form.summary}
              onChange={e => setForm({ ...form, summary: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="简短描述文章内容"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">文章内容</label>
            <div className="border rounded">
              <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-bold">B</button>
                <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm italic">I</button>
                <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm underline">U</button>
                <span className="w-px h-4 bg-gray-300 mx-1"></span>
                <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">🔗</button>
                <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">🖼️</button>
                <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">📋</button>
              </div>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 text-sm focus:outline-none"
                placeholder="开始编写文章内容..."
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            {article ? '保存' : '发布'}
          </button>
        </div>
      </div>
    </div>
  );
}
