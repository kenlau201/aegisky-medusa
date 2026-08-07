'use client';

import { useState, useEffect } from 'react';

interface ProductDetailModalProps {
  product: any;
  onClose: () => void;
}

const steps = [
  { key: 'basic', label: '基本信息' },
  { key: 'sales', label: '销售信息' },
  { key: 'logistics', label: '物流及配送' },
  { key: 'detail', label: '商品详情' },
  { key: 'advanced', label: '高级信息' },
];

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [currentStep, setCurrentStep] = useState('basic');
  const [formData, setFormData] = useState<any>({
    name: product.name || '',
    sku: product.sku || String(product.id),
    price: product.price || 0,
    regular_price: product.regular_price || product.price || 0,
    stock: 9999,
    weight: 0,
    brand: product.brand_name || '',
    category: '',
    description: product.short_description || product.description || '',
    seo_slug: product.slug || '',
    images: product.images || (product.main_image ? [product.main_image] : []),
    videos: product.videos || [],
    free_shipping: false,
    is_hot: false,
    is_new: false,
    is_recommended: false,
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleSave = async () => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert('保存成功');
      onClose();
    } catch (e) {
      alert('保存失败');
    }
  };

  const generateSEO = () => {
    const slug = formData.name.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData({ ...formData, seo_slug: slug });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">商品详情</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center">
            {steps.map((step, idx) => (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.key)}
                  className={`px-6 py-2 text-sm font-medium rounded transition ${
                    currentStep === step.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {step.label}
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${currentStep === step.key || idx < steps.findIndex(s => s.key === currentStep) ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 基本信息 */}
          {currentStep === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">基本信息</h3>

              {/* 商品类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> 商品类型
                  <span className="text-gray-400 font-normal ml-2 text-xs">不同商品类型可编辑的字段内容不同，商品类型一旦发布后将不可更改</span>
                </label>
                <div className="flex gap-4">
                  <button className="px-6 py-4 border-2 border-blue-600 bg-blue-50 rounded-lg text-center">
                    <div className="font-medium text-blue-600">普通商品</div>
                    <div className="text-xs text-gray-500 mt-1">物流配送</div>
                    <div className="absolute -mt-8 ml-16">✅</div>
                  </button>
                  <button className="px-6 py-4 border rounded-lg text-center hover:border-gray-400">
                    <div className="font-medium text-gray-700">虚拟商品</div>
                    <div className="text-xs text-gray-500 mt-1">无需物流</div>
                  </button>
                </div>
              </div>

              {/* 商品图片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> 商品图片
                </label>
                <div className="flex flex-wrap gap-3">
                  {(formData.images || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-1 right-1 flex gap-1">
                        <button className="w-6 h-6 bg-purple-600 text-white rounded text-xs flex items-center justify-center hover:bg-purple-700" title="AI处理">
                          AI
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-0.5">主图</div>
                      )}
                    </div>
                  ))}
                  <button className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500">
                    <span className="text-2xl">+</span>
                    <span className="text-xs mt-1">上传图片</span>
                  </button>
                  <button className="w-24 h-24 border-2 border-dashed border-purple-300 bg-purple-50 rounded-lg flex flex-col items-center justify-center text-purple-600 hover:bg-purple-100">
                    <span className="text-xl">✨</span>
                    <span className="text-xs mt-1">AI生成</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">您可以通过拖拽来调整相册图片顺序，第一张图将作为商品主图展示</p>
              </div>

              {/* 商品视频 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品视频</label>
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400">
                  <span className="text-2xl">▶</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">如有商品视频则商品视频作为商品主图展示</p>
              </div>

              {/* 商品名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> 商品名称
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-1 text-sm">
                    ✨ AI优化
                  </button>
                </div>
              </div>

              {/* SEO链接 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO链接
                  <span className="ml-1 text-gray-400 cursor-help" title="商品的SEO友好URL">ⓘ</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.seo_slug}
                    onChange={e => setFormData({ ...formData, seo_slug: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button onClick={generateSEO} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">自动生成</button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  SEO链接预览: 域名/product/{formData.seo_slug || '[...]'}.shtml
                </p>
              </div>

              {/* 商品品牌 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品品牌</label>
                <select
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full max-w-md px-4 py-2 border rounded-lg"
                >
                  <option value="">选择品牌</option>
                  {product.brands?.map((b: any) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* 商品类目 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> 商品类目
                </label>
                <select className="w-full max-w-md px-4 py-2 border rounded-lg">
                  <option>选择商品类目</option>
                </select>
              </div>
            </div>
          )}

          {/* 销售信息 */}
          {currentStep === 'sales' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">销售信息</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> 销售价 ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">原价 ($)</label>
                  <input
                    type="number"
                    value={formData.regular_price}
                    onChange={e => setFormData({ ...formData, regular_price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU/货号</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">库存</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">标签</label>
                <div className="flex gap-4">
                  {[
                    { key: 'is_hot', label: '热销' },
                    { key: 'is_new', label: '新品' },
                    { key: 'is_recommended', label: '推荐' },
                  ].map(tag => (
                    <label key={tag.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[tag.key]}
                        onChange={e => setFormData({ ...formData, [tag.key]: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{tag.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 物流及配送 */}
          {currentStep === 'logistics' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">物流及配送</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">重量 (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  className="w-full max-w-xs px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">包邮</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">运费模板</label>
                <select className="w-full max-w-md px-4 py-2 border rounded-lg">
                  <option>默认运费模板</option>
                  <option>全国包邮</option>
                  <option>自定义运费</option>
                </select>
              </div>
            </div>
          )}

          {/* 商品详情 */}
          {currentStep === 'detail' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">商品详情</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品描述</label>
                <div className="border rounded-lg">
                  <div className="border-b px-3 py-2 flex gap-2 bg-gray-50">
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">B</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">I</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">U</button>
                    <span className="border-l mx-1"></span>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">📷</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">🔗</button>
                    <span className="border-l mx-1"></span>
                    <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm flex items-center gap-1">
                      ✨ AI生成详情
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 min-h-[300px] focus:outline-none"
                    placeholder="请输入商品详情描述..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 高级信息 */}
          {currentStep === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">高级信息</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品分类</label>
                <input type="text" disabled className="w-full max-w-md px-4 py-2 border rounded-lg bg-gray-50"
                  value={product.categories?.map((c: any) => c.name).join(' > ') || '-'} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品ID</label>
                <input type="text" disabled className="w-full max-w-xs px-4 py-2 border rounded-lg bg-gray-50 font-mono"
                  value={product.id} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">创建时间</label>
                <input type="text" disabled className="w-full max-w-xs px-4 py-2 border rounded-lg bg-gray-50"
                  value={product.created_at ? new Date(product.created_at).toLocaleString() : '-'} />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-red-600 mb-3">危险操作</h4>
                <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm">
                  删除此商品
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
        </div>
      </div>
    </div>
  );
}
