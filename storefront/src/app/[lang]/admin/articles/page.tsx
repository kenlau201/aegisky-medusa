'use client';

import { useEffect, useState } from 'react';
import ArticleEditModal from './ArticleEditModal';

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editArticle, setEditArticle] = useState<any>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/articles?keyword=${encodeURIComponent(keyword)}&pageSize=50`)
      .then(r => r.json())
      .then(data => { setArticles(data.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteArticle = async (id: string) => {
    if (!confirm('确定删除此文章？')) return;
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">文章管理</h1>
          <p className="text-gray-500 mt-1">发布和管理内容文章</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + 发布文章
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4 flex gap-4">
        <input type="text" placeholder="搜索文章标题..." value={keyword} onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()} className="px-4 py-2 border rounded-lg w-80 text-sm" />
        <button onClick={load} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">搜索</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">标题</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">分类</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">作者</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">浏览</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">发布时间</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
            ) : articles.length > 0 ? articles.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-sm max-w-md truncate">{a.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{a.category_name || '-'}</td>
                <td className="px-6 py-4 text-sm">{a.author || 'Admin'}</td>
                <td className="px-6 py-4 text-sm">{a.view_count || 0}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {a.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{a.published_at ? new Date(a.published_at).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <button
                      onClick={() => setEditArticle(a)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => deleteArticle(a.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">暂无文章，点击右上角发布</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <ArticleEditModal
          onClose={() => setShowCreate(false)}
          onSave={load}
        />
      )}

      {editArticle && (
        <ArticleEditModal
          article={editArticle}
          onClose={() => setEditArticle(null)}
          onSave={load}
        />
      )}
    </div>
  );
}
