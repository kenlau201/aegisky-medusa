'use client';

import { useState } from 'react';

export default function MediaCenterPage() {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState('all');

  const folders = [
    { id: 'all', name: '全部素材', count: 26257 },
    { id: 'products', name: '商品图片', count: 26257 },
    { id: 'categories', name: '分类图片', count: 1037 },
    { id: 'brands', name: '品牌LOGO', count: 432 },
    { id: 'articles', name: '文章图片', count: 0 },
    { id: 'videos', name: '商品视频', count: 71 },
  ];

  // 模拟一些图片
  const mockImages = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    name: `image_${i + 1}.jpg`,
    size: `${(Math.random() * 500 + 100).toFixed(0)} KB`,
    url: '',
    time: '2026-08-07',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">素材中心</h1>
          <p className="text-gray-500 mt-1">管理图片和视频素材</p>
        </div>
        <div className="flex gap-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">新建文件夹</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            📤 上传素材
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border flex min-h-[600px]">
        {/* 左侧文件夹 */}
        <div className="w-48 border-r p-3">
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">文件夹</div>
          <div className="space-y-0.5">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm ${
                  selectedFolder === folder.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>📁</span>
                  {folder.name}
                </span>
                <span className="text-xs text-gray-400">{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 flex flex-col">
          {/* 工具栏 */}
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('image')}
                className={`px-3 py-1.5 rounded text-sm ${activeTab === 'image' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
              >
                图片
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded text-sm ${activeTab === 'video' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
              >
                视频
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="搜索素材名称" className="px-3 py-1.5 border rounded text-sm w-48" />
              <div className="flex border rounded overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1.5 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  ▦
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1.5 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  ☰
                </button>
              </div>
              <button className="text-sm text-red-600 hover:text-red-800">批量删除</button>
            </div>
          </div>

          {/* 素材网格 */}
          <div className="flex-1 p-4 overflow-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* 上传占位 */}
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer">
                  <span className="text-3xl">+</span>
                  <span className="text-xs mt-1">上传</span>
                </label>

                {mockImages.map(img => (
                  <div key={img.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border hover:border-blue-400 cursor-pointer">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      🖼️
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end opacity-0 group-hover:opacity-100">
                      <div className="w-full p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="text-white text-xs truncate">{img.name}</div>
                        <div className="text-white/70 text-xs">{img.size}</div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                      <input type="checkbox" className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 w-10">
                      <input type="checkbox" className="w-4 h-4" />
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">文件名</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">大小</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">上传时间</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockImages.map(img => (
                    <tr key={img.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2"><input type="checkbox" className="w-4 h-4" /></td>
                      <td className="px-4 py-2 text-sm flex items-center gap-2">
                        <span className="text-gray-400">🖼️</span>
                        {img.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">{img.size}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{img.time}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 text-sm">
                          <button className="text-blue-600">复制链接</button>
                          <button className="text-red-600">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
