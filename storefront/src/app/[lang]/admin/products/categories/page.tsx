'use client';

import { useEffect, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 构建树形结构
  const buildTree = (list: any[], parentId = 0): any[] => {
    return list
      .filter(c => (c.parent_id || 0) === parentId)
      .map(c => ({
        ...c,
        children: buildTree(list, c.id)
      }));
  };

  const tree = buildTree(categories);

  const renderCategoryRow = (cat: any, level: number = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expanded.has(cat.id);

    return (
      <>
        <tr key={cat.id} className="border-b hover:bg-gray-50">
          <td className="px-4 py-3">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <button onClick={() => toggleExpand(cat.id)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 mr-1">
                  {isExpanded ? '▼' : '▶'}
                </button>
              ) : (
                <span className="w-5 h-5 mr-1"></span>
              )}
              {cat.image && <img src={cat.image} className="w-8 h-8 rounded object-cover mr-2" alt="" />}
              <span className="font-medium text-sm">{cat.name}</span>
              <span className="ml-2 text-xs text-gray-400">ID: {cat.id}</span>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">{cat.slug}</td>
          <td className="px-4 py-3 text-center">
            <button
              onClick={() => setEditCategory(cat)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${cat.is_hot ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${cat.is_hot ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </td>
          <td className="px-4 py-3 text-center">
            <button
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${cat.is_visible !== false ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${cat.is_visible !== false ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            <input type="number" defaultValue={cat.sort_order || 0} className="w-16 px-2 py-1 border rounded text-sm text-center" />
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setEditCategory(cat)} className="text-blue-600 hover:text-blue-800">编辑</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setShowAddModal(true)} className="text-blue-600 hover:text-blue-800">添加子类</button>
              <span className="text-gray-300">|</span>
              <button className="text-red-600 hover:text-red-800">删除</button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && cat.children.map((child: any) => renderCategoryRow(child, level + 1))}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品类目</h1>
          <p className="text-gray-500 mt-1">共 {categories.length} 个分类</p>
        </div>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">🌐 批量翻译</button>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            + 添加分类
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">加载中...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">分类名称</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">SEO链接</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-20">热门</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-20">显示</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-24">排序</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-48">操作</th>
              </tr>
            </thead>
            <tbody>
              {tree.length > 0 ? tree.map(cat => renderCategoryRow(cat)) : (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">暂无分类数据</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 添加/编辑分类弹窗 */}
      {(showAddModal || editCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-[500px]">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-bold">{editCategory ? '编辑分类' : '添加分类'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditCategory(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">分类名称 <span className="text-red-500">*</span></label>
                <input type="text" defaultValue={editCategory?.name} className="w-full px-3 py-2 border rounded text-sm" placeholder="输入分类名称" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">上级分类</label>
                <select className="w-full px-3 py-2 border rounded text-sm">
                  <option value={0}>顶级分类</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类图片</label>
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 cursor-pointer">
                  {editCategory?.image ? <img src={editCategory.image} className="w-full h-full object-cover rounded" /> : '+'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">排序</label>
                <input type="number" defaultValue={editCategory?.sort_order || 0} className="w-32 px-3 py-2 border rounded text-sm" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={editCategory?.is_hot} className="w-4 h-4" />
                  <span className="text-sm">设为热门</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={editCategory?.is_visible !== false} className="w-4 h-4" />
                  <span className="text-sm">显示</span>
                </label>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => { setShowAddModal(false); setEditCategory(null); }} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
