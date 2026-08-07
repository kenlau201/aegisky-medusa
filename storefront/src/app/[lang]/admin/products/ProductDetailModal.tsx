'use client';

import { useState, useEffect } from 'react';

interface ProductDetailModalProps {
  product: any;
  onClose: () => void;
  mode?: 'detail' | 'edit' | 'overrule';
}

const steps = [
  { key: 'basic', label: '基本信息' },
  { key: 'sales', label: '销售信息' },
  { key: 'logistics', label: '物流及配送' },
  { key: 'detail', label: '商品详情' },
  { key: 'advanced', label: '高级信息' },
];

export default function ProductDetailModal({ product, onClose, mode = 'detail' }: ProductDetailModalProps) {
  const [currentStep, setCurrentStep] = useState('basic');
  const [formData, setFormData] = useState<any>({
    name: product.name || '',
    sku: product.sku || String(product.id),
    price: product.price || 0,
    market_price: product.regular_price || product.price || 0,
    cost_price: 0,
    stock: 9999,
    weight: 0,
    brand: product.brand_name || '',
    category: '',
    description: product.short_description || '',
    seo_slug: product.slug || '',
    keywords: '',
    short_desc: '',
    is_on_sale: product.in_stock ?? true,
    sale_mode: 'normal',
    presale_type: 'full',
    presale_deposit_percent: 10,
    presale_deposit_amount: 0,
    presale_valid: 'permanent',
    presale_balance_days: 2,
    presale_balance_hours: 0,
    presale_ship_days: 2,
    spec_type: 'single',
    specs: [],
    logistics_type: 'fixed',
    logistics_fee: 0,
    logistics_template: 'default',
    limit_buy: false,
    limit_count: 0,
    services: {
      global: true,
      merchant_ship: true,
      ship_24h: true,
      return_7d: true,
      exchange_7d: true,
      on_time: true,
    },
    virtual_sales: 0,
    related_products: [],
    images: product.images || (product.main_image ? [product.main_image] : []),
    videos: product.videos || [],
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
      alert(mode === 'overrule' ? '越权操作成功' : '保存成功');
      onClose();
    } catch (e) {
      alert('操作失败');
    }
  };

  const generateSEO = () => {
    const slug = formData.name.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData({ ...formData, seo_slug: slug });
  };

  const title = mode === 'overrule' ? '越权编辑商品' : '商品详情';
  const submitText = mode === 'overrule' ? '确认' : '保存';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{title}</h2>
          <div className="flex items-center gap-3">
            {mode === 'overrule' && (
              <button className="px-4 py-1.5 border border-blue-500 text-blue-600 rounded-lg text-sm hover:bg-blue-50 flex items-center gap-1">
                🌐 一键翻译
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-center">
            {steps.map((step, idx) => (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.key)}
                  className={`px-8 py-2 text-sm font-medium transition ${
                    currentStep === step.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {step.label}
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-10 h-0.5 ${idx < steps.findIndex(s => s.key === currentStep) ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ========== 基本信息 ========== */}
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
                  <button className="relative px-8 py-4 border-2 border-blue-600 bg-blue-50 rounded-lg text-center">
                    <div className="font-medium text-blue-600">普通商品</div>
                    <div className="text-xs text-gray-500 mt-1">物流配送</div>
                    <div className="absolute top-2 right-2 text-blue-600">✅</div>
                  </button>
                  <button className="px-8 py-4 border rounded-lg text-center hover:border-gray-400">
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
                  {(formData.images || []).slice(0, 4).map((img: string, idx: number) => (
                    <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-1 right-1">
                        <button className="w-6 h-6 bg-purple-600 text-white rounded text-xs flex items-center justify-center hover:bg-purple-700" title="AI处理">
                          AI
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500">
                    <span className="text-2xl">+</span>
                  </button>
                  <button className="w-24 h-24 border-2 border-dashed border-purple-300 bg-purple-50 rounded-lg flex flex-col items-center justify-center text-purple-600 hover:bg-purple-100">
                    <span className="text-xl">✨</span>
                    <span className="text-xs mt-1">AI</span>
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
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm flex items-center gap-1">
                    AI
                  </button>
                </div>
              </div>

              {/* SEO链接 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO链接
                  <span className="ml-1 text-gray-400 cursor-help text-xs">ⓘ</span>
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
                <div className="flex items-center gap-2">
                  <select className="flex-1 max-w-md px-4 py-2 border rounded-lg">
                    <option>美妆 / 迷人彩妆 / 粉底</option>
                  </select>
                  {mode === 'overrule' && <button className="text-blue-600 text-sm hover:underline">刷新</button>}
                </div>
              </div>

              {/* 商品重量 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品重量</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.001"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                    className="w-40 px-4 py-2 border rounded-l-lg"
                  />
                  <span className="px-3 py-2 border border-l-0 rounded-r-lg bg-gray-50 text-gray-600">Kg</span>
                </div>
              </div>

              {/* 商品编码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品编码</label>
                <input
                  type="text"
                  value={formData.sku}
                  disabled
                  className="w-full max-w-lg px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">如果您不输入商品编码，系统将自动生成一个唯一的编码</p>
              </div>

              {/* 搜索关键词 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">搜索关键词</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="用空格分隔，为空时会自动根据商品名称分词"
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm">AI</button>
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">更新关键词</button>
                </div>
              </div>

              {/* 商品描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品描述</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.short_desc}
                    onChange={e => setFormData({ ...formData, short_desc: e.target.value })}
                    placeholder="遮瑕持久不脱妆"
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1">
                    🌐 多语言
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  该描述可作为"商品卖点"的概述及促销信息补充 <a href="#" className="text-blue-600 hover:underline">查看示例</a>
                </p>
              </div>

              {/* 是否上架 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">是否上架</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.is_on_sale}
                      onChange={() => setFormData({ ...formData, is_on_sale: true })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">上架</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.is_on_sale}
                      onChange={() => setFormData({ ...formData, is_on_sale: false })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">下架</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">上架则允许销售（未审核的商品无法手动上架）</p>
              </div>

              {/* 定时下架 */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-600">启用定时下架</span>
                </label>
                <input type="datetime-local" disabled className="px-3 py-1.5 border rounded-lg bg-gray-50 text-sm" />
              </div>
            </div>
          )}

          {/* ========== 销售信息 ========== */}
          {currentStep === 'sales' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">销售信息</h3>

              {/* 销售模式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">销售模式
                  <span className="ml-1 text-gray-400 cursor-help text-xs">ⓘ</span>
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.sale_mode === 'normal'}
                      onChange={() => setFormData({ ...formData, sale_mode: 'normal' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">现货销售</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.sale_mode === 'presale'}
                      onChange={() => setFormData({ ...formData, sale_mode: 'presale' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">预售模式</span>
                    <span className="ml-1 text-gray-400 cursor-help text-xs">ⓘ</span>
                  </label>
                </div>
              </div>

              {/* 预售设置 */}
              {formData.sale_mode === 'presale' && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4 ml-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <span className="text-sm text-red-500">*</span>
                        <span className="text-sm">预售方式</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" className="w-4 h-4" />
                        <span className="text-sm">全款预售</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" defaultChecked className="w-4 h-4" />
                        <span className="text-sm">定金预售</span>
                      </label>
                    </div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">售后规则 ⓘ</button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-red-500">*</span>
                    <span className="text-sm w-24">定金收取方式</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">按</span>
                    </label>
                    <input type="number" defaultValue={10} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    <span className="text-sm">%</span>
                    <span className="text-sm">收取定金</span>
                    <label className="flex items-center gap-2 cursor-pointer ml-4">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">向下取整数</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4 ml-28">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" className="w-4 h-4" />
                      <span className="text-sm">按固定金额</span>
                    </label>
                    <input type="number" defaultValue={0.00} className="w-20 px-2 py-1 border rounded text-center text-sm" />
                    <span className="text-sm">元</span>
                    <span className="text-sm text-gray-500">收取定金</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm w-24">预售有效期</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">长期有效</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm w-24">预售定金</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">定金不退</span>
                    </label>
                    <span className="text-xs text-gray-500">预售定金不支持退款，若要退款请联系客服处理，或支付尾款后申请售后</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-red-500">*</span>
                    <span className="text-sm w-24">尾款支付时间</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">支付定金后</span>
                    </label>
                    <input type="number" defaultValue={2} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    <span className="text-sm">天</span>
                    <span className="text-sm">开始支付尾款，并需要在</span>
                    <input type="number" defaultValue={1} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    <span className="text-sm">天</span>
                    <input type="number" defaultValue={0} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    <span className="text-sm">小时</span>
                    <span className="text-sm">内完成支付</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-red-500">*</span>
                    <span className="text-sm w-24">发货时间</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">支付全款后</span>
                    </label>
                    <input type="number" defaultValue={2} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    <span className="text-sm">天</span>
                    <input type="number" defaultValue={0} className="w-16 px-2 py-1 border rounded text-center text-sm" />
                    <span className="text-sm">小时</span>
                    <span className="text-sm">后开始发货</span>
                  </div>
                </div>
              )}

              {/* 属性模板 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">属性模板</label>
                <select className="w-64 px-4 py-2 border rounded-lg">
                  <option>请选择</option>
                </select>
              </div>

              {/* 商品属性 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品属性</label>
                <div className="border rounded-lg p-4 min-h-[60px] bg-gray-50">
                  <button className="text-sm text-blue-600 hover:text-blue-800">+ 添加商品属性</button>
                </div>
              </div>

              {/* 销售规格 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">销售规格</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.spec_type === 'single'}
                      onChange={() => setFormData({ ...formData, spec_type: 'single' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">统一规格</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.spec_type === 'multi'}
                      onChange={() => setFormData({ ...formData, spec_type: 'multi' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">多规格</span>
                  </label>
                </div>
              </div>

              {/* 统一规格价格 */}
              {formData.spec_type === 'single' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-red-500">*</span> 一口价 ($)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-red-500">*</span> 库存
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">市场价 ($)</label>
                    <input
                      type="number"
                      value={formData.market_price}
                      onChange={e => setFormData({ ...formData, market_price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">成本价 ($)</label>
                    <input
                      type="number"
                      value={formData.cost_price}
                      onChange={e => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">商品条码</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              )}

              {/* 附加服务 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  附加服务
                  <span className="ml-1 text-gray-400 cursor-help text-xs">ⓘ</span>
                </label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <button className="text-sm text-blue-600 hover:text-blue-800">+ 添加商品附加服务</button>
                </div>
              </div>

              {/* 商品限购 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品限购</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.limit_buy}
                      onChange={() => setFormData({ ...formData, limit_buy: false })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">不限购</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.limit_buy}
                      onChange={() => setFormData({ ...formData, limit_buy: true })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">限购</span>
                    <input
                      type="number"
                      value={formData.limit_count}
                      onChange={e => setFormData({ ...formData, limit_count: parseInt(e.target.value) })}
                      disabled={!formData.limit_buy}
                      className="w-24 px-3 py-1 border rounded text-sm disabled:bg-gray-50"
                    />
                    <span className="text-sm">件</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========== 物流及配送 ========== */}
          {currentStep === 'logistics' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">物流及配送</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <span className="text-red-500">*</span> 快递运费
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.logistics_type === 'fixed'}
                        onChange={() => setFormData({ ...formData, logistics_type: 'fixed' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">固定运费</span>
                    </label>
                    <span className="text-gray-400">¥</span>
                    <input
                      type="number"
                      value={formData.logistics_fee}
                      onChange={e => setFormData({ ...formData, logistics_fee: parseFloat(e.target.value) })}
                      disabled={formData.logistics_type !== 'fixed'}
                      className="w-32 px-3 py-1.5 border rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.logistics_type === 'template'}
                        onChange={() => setFormData({ ...formData, logistics_type: 'template' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">运费模板</span>
                    </label>
                    <select
                      disabled={formData.logistics_type !== 'template'}
                      className="w-48 px-3 py-1.5 border rounded-lg disabled:bg-gray-50"
                    >
                      <option>默认模板</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  设置固定运费为0时，前台展示为免运费。<a href="#" className="text-blue-600 hover:underline">查看示例</a>
                </p>
              </div>
            </div>
          )}

          {/* ========== 商品详情 ========== */}
          {currentStep === 'detail' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">商品详情</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品详情</label>
                <div className="border rounded-lg">
                  <div className="border-b px-3 py-2 flex gap-1 bg-gray-50 flex-wrap">
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-bold">B</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm italic">I</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm underline">U</button>
                    <span className="border-l mx-1"></span>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">🔤</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">🎨</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">📷</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">🔗</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">📋</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">↩️</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">↪️</button>
                    <span className="border-l mx-1"></span>
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm flex items-center gap-1">
                      ✨ AI生成详情
                    </button>
                  </div>
                  <div className="p-8 min-h-[400px] flex items-center justify-center bg-gray-50">
                    {formData.images && formData.images.length > 0 ? (
                      <div className="space-y-0 max-w-md">
                        {formData.images.slice(0, 3).map((img: string, idx: number) => (
                          <img key={idx} src={img} className="w-full" alt="" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-sm">点击上方工具栏的图片按钮上传商品详情图</p>
                        <p className="text-xs mt-1">建议宽度 750px，高度不限</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== 高级信息 ========== */}
          {currentStep === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">高级信息</h3>

              {/* 服务说明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">服务说明</label>
                <div className="flex flex-wrap gap-6">
                  {[
                    { key: 'global', label: '售全球' },
                    { key: 'merchant_ship', label: '商家发货&售后' },
                    { key: 'ship_24h', label: '24小时发货' },
                    { key: 'return_7d', label: '7天无理由退换货' },
                    { key: 'exchange_7d', label: '7天无理由换货' },
                    { key: 'on_time', label: '准时到达' },
                  ].map(svc => (
                    <label key={svc.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services[svc.key]}
                        onChange={e => setFormData({
                          ...formData,
                          services: { ...formData.services, [svc.key]: e.target.checked }
                        })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{svc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 虚拟销售 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">虚拟销售</label>
                <input
                  type="number"
                  value={formData.virtual_sales}
                  onChange={e => setFormData({ ...formData, virtual_sales: parseInt(e.target.value) })}
                  className="w-40 px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">虚拟销售会随下单而增加，但不是真实销售数据</p>
              </div>

              {/* 相关商品 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">相关商品</label>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">选择商品</button>
                <p className="text-xs text-gray-500 mt-1">最多添加10个商品，仅用于在商品详情页展示</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-100">取消</button>
          <button onClick={handleSave} className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{submitText}</button>
        </div>
      </div>
    </div>
  );
}
