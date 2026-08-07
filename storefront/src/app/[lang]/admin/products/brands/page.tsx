'use client';

import { useEffect, useState } from 'react';

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBrand, setEditBrand] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'audit'>('list');

  useEffect(() => {
    fetch('/api/admin/brands')
      .then(r => r.json())
      .then(data => {
        setBrands(data.brands || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredBrands = brands.filter(b =>
    !search || b.name?.toLowerCase().includes(search.toLowerCase())
  );

  // 按首字母分组
  const groupedByLetter = filteredBrands.reduce((acc: any, brand) => {
    const letter = (brand.name_initial || brand.name?.[0] || '#').toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品品牌</h1>
          <p className="text-gray-500 mt-1">共 {brands.length} 个品牌</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          + 添加品牌
        </button>
      </div>

      {/* Tab */}
      <div className="bg-white rounded-xl border">
        <div className="border-b px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-2 border-b-2 text-sm ${activeTab === 'list' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
          >
            品牌管理
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-2 border-b-2 text-sm ${activeTab === 'audit' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
          >
            品牌审核
          </button>
        </div>

        <div className="p-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="搜索品牌名称"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 border rounded text-sm w-64"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">加载中...</div>
        ) : activeTab === 'list' ? (
          <div className="divide-y">
            {Object.keys(groupedByLetter).sort().map(letter => (
              <div key={letter}>
                <div className="px-4 py-2 bg-gray-50 text-sm font-bold text-gray-500">{letter}</div>
                <div className="divide-y">
                  {groupedByLetter[letter].map((brand: any) => (
                    <div key={brand.id} className="px-4 py-3 flex items-center hover:bg-gray-50">
                      <div className="w-12 h-12 mr-4">
                        {brand.logo ? (
                          <img src={brand.logo} className="w-full h-full object-contain" alt={brand.name} />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-lg font-bold">
                            {brand.name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{brand.name}</div>
                        <div className="text-xs text-gray-400">ID: {brand.id} | 商品数: {brand.product_count || 0}</div>
                      </div>
                      <div className="flex items-center gap-4 mr-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" defaultChecked={brand.is_hot} className="w-4 h-4" />
                          <span className="text-gray-600">热销</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" defaultChecked={brand.is_visible !== false} className="w-4 h-4" />
                          <span className="text-gray-600">显示</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <button onClick={() => setEditBrand(brand)} className="text-blue-600 hover:text-blue-800">编辑</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-red-600 hover:text-red-800">删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">暂无待审核品牌</div>
        )}
      </div>

      {/* 添加/编辑品牌弹窗 */}
      {(showAddModal || editBrand) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-[450px]">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-bold">{editBrand ? '编辑品牌' : '添加品牌'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditBrand(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">品牌名称 <span className="text-red-500">*</span></label>
                <input type="text" defaultValue={editBrand?.name} className="w-full px-3 py-2 border rounded text-sm" placeholder="输入品牌名称" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">品牌首字母</label>
                <input type="text" maxLength={1} defaultValue={editBrand?.name_initial} className="w-20 px-3 py-2 border rounded text-sm text-center" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">品牌LOGO</label>
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 cursor-pointer">
                  {editBrand?.logo ? <img src={editBrand.logo} className="w-full h-full object-contain" /> : '+'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">品牌简介</label>
                <textarea rows={3} className="w-full px-3 py-2 border rounded text-sm" placeholder="输入品牌简介" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={editBrand?.is_hot} className="w-4 h-4" />
                  <span className="text-sm">热销品牌</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={editBrand?.is_visible !== false} className="w-4 h-4" />
                  <span className="text-sm">显示</span>
                </label>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => { setShowAddModal(false); setEditBrand(null); }} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
