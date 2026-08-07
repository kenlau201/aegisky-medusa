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
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    // 基本信息
    product_type: 'normal',
    name: product.name || '',
    sku: product.sku || String(product.id),
    seo_slug: product.slug || '',
    brand: product.brand_name || '',
    category_id: '',
    weight: 0,
    keywords: '',
    subtitle: product.short_description || '',
    is_on_sale: true,
    scheduled_off: false,
    scheduled_off_time: '',
    images: product.images || (product.main_image ? [product.main_image] : []),
    videos: product.videos || [],

    // 销售信息
    sale_mode: 'stock', // stock=现货, presale=预售
    presale_type: 'deposit', // full=全款, deposit=定金
    deposit_percent: 10,
    deposit_amount: 0,
    presale_valid: 'longterm',
    deposit_refund: false,
    balance_days: 2,
    balance_hours: 0,
    balance_within_days: 1,
    balance_within_hours: 0,
    ship_days: 2,
    ship_hours: 0,
    spec_mode: 'single', // single=统一规格, multi=多规格
    specs: [],
    price: product.price || 0,
    market_price: product.regular_price || 0,
    cost_price: 0,
    stock: 9999,
    barcode: '',

    // 物流
    shipping_type: 'fixed', // fixed=固定运费, template=运费模板
    shipping_fee: 0,
    shipping_template: 'default',

    // 商品详情
    description: product.description || '',
    detail_images: [],

    // 高级信息
    service_tags: ['global', 'merchant_ship', '24h_ship', '7day_return'],
    virtual_sales: 0,
    related_products: [],
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // 加载品牌和分类
    fetch('/api/admin/brands').then(r => r.json()).then(d => setBrands(d.brands || [])).catch(() => {});
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

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
    updateField('seo_slug', slug);
  };

  const InputField = ({ label, required, children, hint }: any) => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[95vw] max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <h2 className="text-base font-bold">商品详情</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Steps */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center">
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
            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-blue-600 pl-2 mb-5">基本信息</h3>

              <InputField label="商品类型" required hint="不同商品类型可编辑的字段内容不同，商品类型一旦发布后将不可更改">
                <div className="flex gap-4">
                  <button
                    onClick={() => updateField('product_type', 'normal')}
                    className={`relative px-8 py-3 border-2 rounded-lg text-center ${formData.product_type === 'normal' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className={`font-medium ${formData.product_type === 'normal' ? 'text-blue-600' : 'text-gray-700'}`}>普通商品</div>
                    <div className="text-xs text-gray-500 mt-1">物流配送</div>
                    {formData.product_type === 'normal' && <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">✓</div>}
                  </button>
                  <button
                    onClick={() => updateField('product_type', 'virtual')}
                    className={`px-8 py-3 border-2 rounded-lg text-center ${formData.product_type === 'virtual' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className={`font-medium ${formData.product_type === 'virtual' ? 'text-blue-600' : 'text-gray-700'}`}>虚拟商品</div>
                    <div className="text-xs text-gray-500 mt-1">无需物流</div>
                  </button>
                </div>
              </InputField>

              <InputField label="商品图片" required>
                <div className="flex flex-wrap gap-3">
                  {(formData.images || []).map((img: string, idx: number) => (
                    <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button className="absolute top-1 right-1 w-5 h-5 bg-purple-600 text-white rounded text-xs flex items-center justify-center hover:bg-purple-700">AI</button>
                      {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] text-center py-0.5">主图</div>}
                    </div>
                  ))}
                  <button className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-blue-400">
                    <span className="text-xl">+</span>
                  </button>
                  <button className="w-20 h-20 border-2 border-dashed border-purple-300 bg-purple-50 rounded flex flex-col items-center justify-center text-purple-600 hover:bg-purple-100">
                    <span className="text-lg">✨</span>
                    <span className="text-[10px]">AI</span>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">您可以通过拖拽来调整相册图片顺序，第一张图将作为商品主图展示</p>
              </InputField>

              <InputField label="商品视频">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
                  <span className="text-xl">▶</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">如有商品视频则商品视频作为商品主图展示</p>
              </InputField>

              <InputField label="商品名称" required>
                <div className="flex gap-2 max-w-3xl">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="px-3 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded text-xs flex items-center gap-1 hover:bg-purple-100">
                    ✨ AI
                  </button>
                </div>
              </InputField>

              <InputField label="SEO链接" hint={`SEO链接预览：域名/product/${formData.seo_slug || '[...]'}.shtml`}>
                <div className="flex gap-2 max-w-3xl">
                  <input
                    type="text"
                    value={formData.seo_slug}
                    onChange={e => updateField('seo_slug', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                  <button onClick={generateSEO} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">自动生成</button>
                </div>
              </InputField>

              <InputField label="商品品牌">
                <select
                  value={formData.brand}
                  onChange={e => updateField('brand', e.target.value)}
                  className="w-64 px-3 py-2 border rounded text-sm"
                >
                  <option value="">选择品牌</option>
                  {brands.map((b: any) => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </InputField>

              <InputField label="商品类目" required>
                <select
                  value={formData.category_id}
                  onChange={e => updateField('category_id', e.target.value)}
                  className="w-64 px-3 py-2 border rounded text-sm"
                >
                  <option value="">选择商品类目</option>
                  {categories.filter((c: any) => c.depth <= 1).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </InputField>

              <InputField label="商品重量">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.001"
                    value={formData.weight}
                    onChange={e => updateField('weight', parseFloat(e.target.value))}
                    className="w-32 px-3 py-2 border rounded text-sm"
                  />
                  <span className="text-sm text-gray-500">Kg</span>
                </div>
              </InputField>

              <InputField label="商品编码" hint="如果您不输入商品编码，系统将自动生成一个唯一的编码">
                <input
                  type="text"
                  value={formData.sku}
                  onChange={e => updateField('sku', e.target.value)}
                  className="w-full max-w-lg px-3 py-2 border rounded text-sm bg-gray-50"
                />
              </InputField>

              <InputField label="搜索关键词" hint="用空格分隔，为空时会自动根据商品名称分词">
                <div className="flex gap-2 max-w-3xl">
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={e => updateField('keywords', e.target.value)}
                    placeholder="粉底 底妆 美妆 混油皮"
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                  <button className="px-3 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded text-xs flex items-center gap-1 hover:bg-purple-100">
                    ✨ 更新关键词
                  </button>
                </div>
              </InputField>

              <InputField label="商品描述" hint="该描述可作为'商品卖点'的概述及促销信息补充">
                <div className="flex gap-2 max-w-3xl">
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => updateField('subtitle', e.target.value)}
                    placeholder="遮瑕持久不脱妆"
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                  <button className="px-3 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded text-xs flex items-center gap-1 hover:bg-purple-100">
                    🌐 多语言
                  </button>
                </div>
              </InputField>

              <InputField label="是否上架" hint="上架则允许销售（未审核的商品无法手动上架）">
                <div className="flex items-center gap-6 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_on_sale" checked={formData.is_on_sale} onChange={() => updateField('is_on_sale', true)} className="w-4 h-4" />
                    <span className="text-sm">上架</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_on_sale" checked={!formData.is_on_sale} onChange={() => updateField('is_on_sale', false)} className="w-4 h-4" />
                    <span className="text-sm">下架</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.scheduled_off} onChange={e => updateField('scheduled_off', e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm">启用定时下架</span>
                  </label>
                  <input type="datetime-local" disabled={!formData.scheduled_off} className="px-3 py-1.5 border rounded text-sm disabled:bg-gray-100" />
                </div>
              </InputField>
            </div>
          )}

          {/* ========== 销售信息 ========== */}
          {currentStep === 'sales' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-blue-600 pl-2 mb-5">销售信息</h3>

              <InputField label="销售模式">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="sale_mode" checked={formData.sale_mode === 'stock'} onChange={() => updateField('sale_mode', 'stock')} className="w-4 h-4" />
                    <span className="text-sm">现货销售</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="sale_mode" checked={formData.sale_mode === 'presale'} onChange={() => updateField('sale_mode', 'presale')} className="w-4 h-4" />
                    <span className="text-sm">预售模式</span>
                    <span className="text-gray-400 text-xs cursor-help" title="预售商品设置">ⓘ</span>
                  </label>
                </div>
              </InputField>

              {formData.sale_mode === 'presale' && (
                <div className="ml-6 pl-4 border-l-2 border-gray-100 mb-5">
                  <InputField label="预售方式" required>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="presale_type" checked={formData.presale_type === 'full'} onChange={() => updateField('presale_type', 'full')} className="w-4 h-4" />
                        <span className="text-sm">全款预售</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="presale_type" checked={formData.presale_type === 'deposit'} onChange={() => updateField('presale_type', 'deposit')} className="w-4 h-4" />
                        <span className="text-sm">定金预售</span>
                      </label>
                      <span className="text-sm text-gray-500 ml-auto">售后规则 <span className="cursor-help">ⓘ</span></span>
                    </div>
                  </InputField>

                  {formData.presale_type === 'deposit' && (
                    <>
                      <InputField label="定金收取方式" required>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="deposit_mode" defaultChecked className="w-4 h-4" />
                              <span className="text-sm">按</span>
                            </label>
                            <input type="number" value={formData.deposit_percent} onChange={e => updateField('deposit_percent', parseInt(e.target.value))} className="w-20 px-2 py-1 border rounded text-sm" />
                            <span className="text-sm">%</span>
                            <span className="text-sm">收取定金</span>
                            <label className="flex items-center gap-2 cursor-pointer ml-4">
                              <input type="checkbox" className="w-4 h-4" />
                              <span className="text-sm">向下取整</span>
                            </label>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="deposit_mode" className="w-4 h-4" />
                              <span className="text-sm">按固定金额</span>
                            </label>
                            <input type="number" value={formData.deposit_amount} onChange={e => updateField('deposit_amount', parseFloat(e.target.value))} className="w-24 px-2 py-1 border rounded text-sm" />
                            <span className="text-sm">元</span>
                            <span className="text-sm">收取定金</span>
                          </div>
                        </div>
                      </InputField>

                      <InputField label="预售有效期">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="presale_valid" defaultChecked className="w-4 h-4" />
                          <span className="text-sm">长期有效</span>
                        </label>
                      </InputField>

                      <InputField label="预售定金" hint="预售定金不支持退款，若要退款请联系客服处理，或支付尾款后申请售后">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="deposit_refund" defaultChecked className="w-4 h-4" />
                          <span className="text-sm">定金不退</span>
                        </label>
                      </InputField>

                      <InputField label="尾款支付时间" required>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="balance_time" defaultChecked className="w-4 h-4" />
                              <span className="text-sm">支付定金后</span>
                            </label>
                            <input type="number" value={formData.balance_days} onChange={e => updateField('balance_days', parseInt(e.target.value))} className="w-16 px-2 py-1 border rounded text-sm" />
                            <span className="text-sm">天</span>
                            <span className="text-sm">开始支付尾款，并需要在</span>
                            <input type="number" value={formData.balance_within_days} onChange={e => updateField('balance_within_days', parseInt(e.target.value))} className="w-16 px-2 py-1 border rounded text-sm" />
                            <span className="text-sm">天</span>
                            <input type="number" value={formData.balance_within_hours} onChange={e => updateField('balance_within_hours', parseInt(e.target.value))} className="w-16 px-2 py-1 border rounded text-sm" />
                            <span className="text-sm">小时</span>
                            <span className="text-sm">内完成支付</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="balance_time" className="w-4 h-4" />
                              <span className="text-sm">固定时间</span>
                            </label>
                            <input type="date" className="px-2 py-1 border rounded text-sm" />
                            <span className="text-sm">~</span>
                            <input type="date" className="px-2 py-1 border rounded text-sm" />
                          </div>
                        </div>
                      </InputField>

                      <InputField label="发货时间" required>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="ship_time" defaultChecked className="w-4 h-4" />
                              <span className="text-sm">支付全款后</span>
                            </label>
                            <input type="number" value={formData.ship_days} onChange={e => updateField('ship_days', parseInt(e.target.value))} className="w-16 px-2 py-1 border rounded text-sm" />
                            <span className="text-sm">天</span>
                            <input type="number" value={formData.ship_hours} onChange={e => updateField('ship_hours', parseInt(e.target.value))} className="w-16 px-2 py-1 border rounded text-sm" />
                            <span className="text-sm">小时</span>
                            <span className="text-sm">后开始发货</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="ship_time" className="w-4 h-4" />
                              <span className="text-sm">指定日期</span>
                            </label>
                            <input type="date" className="px-2 py-1 border rounded text-sm" />
                          </div>
                        </div>
                      </InputField>
                    </>
                  )}
                </div>
              )}

              <InputField label="属性模板">
                <select className="w-64 px-3 py-2 border rounded text-sm">
                  <option value="">请选择</option>
                </select>
              </InputField>

              <InputField label="商品属性">
                <button className="px-4 py-2 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-400">
                  + 添加商品属性
                </button>
              </InputField>

              <InputField label="销售规格">
                <div className="flex items-center gap-6 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="spec_mode" checked={formData.spec_mode === 'single'} onChange={() => updateField('spec_mode', 'single')} className="w-4 h-4" />
                    <span className="text-sm">统一规格</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="spec_mode" checked={formData.spec_mode === 'multi'} onChange={() => updateField('spec_mode', 'multi')} className="w-4 h-4" />
                    <span className="text-sm">多规格</span>
                  </label>
                </div>

                {formData.spec_mode === 'single' ? (
                  <div className="grid grid-cols-4 gap-4 max-w-2xl bg-gray-50 p-4 rounded">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1"><span className="text-red-500">*</span> 一口价 ($)</label>
                      <input type="number" value={formData.price} onChange={e => updateField('price', parseFloat(e.target.value))} className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1"><span className="text-red-500">*</span> 库存</label>
                      <input type="number" value={formData.stock} onChange={e => updateField('stock', parseInt(e.target.value))} className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">市场价 ($)</label>
                      <input type="number" value={formData.market_price} onChange={e => updateField('market_price', parseFloat(e.target.value))} className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">成本价 ($)</label>
                      <input type="number" value={formData.cost_price} onChange={e => updateField('cost_price', parseFloat(e.target.value))} className="w-full px-2 py-1.5 border rounded text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* 多规格示例 */}
                    <div className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm w-16">规格名:</span>
                        <input type="text" defaultValue="混油命定" className="px-2 py-1 border rounded text-sm w-40" />
                        <button className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded text-xs">✨ AI</button>
                        <label className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                          <input type="checkbox" className="w-3 h-3" /> 添加规格图片
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-16">
                        {['584 中性一白', '674 黄调自然白', '774 橄榄自然白'].map((v, i) => (
                          <div key={i} className="flex items-center gap-1 px-3 py-1 bg-white border rounded-full text-sm">
                            {v}
                            <button className="text-purple-600 text-xs ml-1">✨</button>
                          </div>
                        ))}
                        <button className="px-3 py-1 border border-dashed rounded-full text-xs text-gray-500">+ 增加规格值</button>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-400">
                      + 添加商品规格
                    </button>
                    <p className="text-xs text-gray-400">仅支持为第一组规格设置规格图片，买家选择不同规格会看到对应规格图片，建议尺寸：800 x 800像素</p>

                    {/* 规格明细表格 */}
                    <div className="border rounded overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">规格明细</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">一口价</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">库存</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">市场价</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">成本价</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">规格编码</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">商品条形码</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {[1, 2, 3].map(i => (
                            <tr key={i}>
                              <td className="px-3 py-2">584 中性一白</td>
                              <td className="px-3 py-2"><input defaultValue="456.00" className="w-20 px-2 py-1 border rounded text-sm" /></td>
                              <td className="px-3 py-2"><input defaultValue="1000" className="w-16 px-2 py-1 border rounded text-sm" /></td>
                              <td className="px-3 py-2"><input defaultValue="547.20" className="w-20 px-2 py-1 border rounded text-sm" /></td>
                              <td className="px-3 py-2"><input placeholder="0.00" className="w-20 px-2 py-1 border rounded text-sm" /></td>
                              <td className="px-3 py-2"><input className="w-24 px-2 py-1 border rounded text-sm" /></td>
                              <td className="px-3 py-2"><input className="w-28 px-2 py-1 border rounded text-sm" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </InputField>
            </div>
          )}

          {/* ========== 物流及配送 ========== */}
          {currentStep === 'logistics' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-blue-600 pl-2 mb-5">物流及配送</h3>

              <InputField label="快递运费" required hint="设置固定运费为0时，前台展示为免运费。">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="shipping_type" checked={formData.shipping_type === 'fixed'} onChange={() => updateField('shipping_type', 'fixed')} className="w-4 h-4" />
                      <span className="text-sm">固定运费</span>
                    </label>
                    <span className="text-sm">¥</span>
                    <input
                      type="number"
                      value={formData.shipping_fee}
                      onChange={e => updateField('shipping_fee', parseFloat(e.target.value))}
                      disabled={formData.shipping_type !== 'fixed'}
                      className="w-24 px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="shipping_type" checked={formData.shipping_type === 'template'} onChange={() => updateField('shipping_type', 'template')} className="w-4 h-4" />
                      <span className="text-sm">运费模板</span>
                    </label>
                    <select
                      value={formData.shipping_template}
                      onChange={e => updateField('shipping_template', e.target.value)}
                      disabled={formData.shipping_type !== 'template'}
                      className="w-48 px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                    >
                      <option value="default">默认模板</option>
                      <option value="free">全国包邮</option>
                    </select>
                  </div>
                </div>
              </InputField>
            </div>
          )}

          {/* ========== 商品详情 ========== */}
          {currentStep === 'detail' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-blue-600 pl-2 mb-5">商品详情</h3>

              <InputField label="商品详情">
                <div className="border rounded">
                  <div className="border-b px-3 py-2 flex gap-1 bg-gray-50 flex-wrap">
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-bold">B</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm italic">I</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm underline">U</button>
                    <span className="border-l mx-1"></span>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">📷</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">🔗</button>
                    <button className="px-2 py-1 hover:bg-gray-200 rounded text-sm">≡</button>
                    <span className="border-l mx-1"></span>
                    <button className="px-3 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded text-xs flex items-center gap-1 ml-auto hover:bg-purple-100">
                      ✨ AI生成详情
                    </button>
                  </div>
                  <div className="p-4 min-h-[300px] bg-white">
                    {product.description ? (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                    ) : (
                      <p className="text-gray-400 text-sm">请输入商品详情内容...</p>
                    )}
                  </div>
                </div>
              </InputField>

              <InputField label="详情图片">
                <div className="flex flex-wrap gap-3">
                  <button className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-blue-400">
                    <span className="text-xl">+</span>
                    <span className="text-xs mt-1">上传图片</span>
                  </button>
                </div>
              </InputField>
            </div>
          )}

          {/* ========== 高级信息 ========== */}
          {currentStep === 'advanced' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-l-4 border-blue-600 pl-2 mb-5">高级信息</h3>

              <InputField label="服务说明">
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'global', label: '售全球' },
                    { key: 'merchant_ship', label: '商家发货&售后' },
                    { key: '24h_ship', label: '24小时发货' },
                    { key: '7day_return', label: '7天无理由退货' },
                    { key: '7day_exchange', label: '7天无理由换货' },
                    { key: 'ontime', label: '准时到达' },
                  ].map(tag => (
                    <label key={tag.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={formData.service_tags.includes(tag.key)} className="w-4 h-4" />
                      <span className="text-sm">{tag.label}</span>
                    </label>
                  ))}
                </div>
              </InputField>

              <InputField label="虚拟销售" hint="虚拟销售会随下单而增加，但不是真实销售数据">
                <input
                  type="number"
                  value={formData.virtual_sales}
                  onChange={e => updateField('virtual_sales', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border rounded text-sm"
                />
              </InputField>

              <InputField label="相关商品" hint="最多添加10个商品，仅用于在商品详情页展示">
                <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50">选择商品</button>
              </InputField>

              <div className="mt-8 pt-6 border-t">
                <h4 className="text-sm font-medium text-red-600 mb-3">⚠️ 危险操作</h4>
                <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm hover:bg-red-100">
                  删除此商品
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 border rounded hover:bg-gray-100 text-sm">取消</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">保存</button>
        </div>
      </div>
    </div>
  );
}
