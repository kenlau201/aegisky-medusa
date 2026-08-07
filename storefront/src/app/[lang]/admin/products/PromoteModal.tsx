'use client';

import { useState, useEffect } from 'react';

interface PromoteModalProps {
  product: any;
  onClose: () => void;
}

const channels = [
  { key: 'pc', label: 'PC', icon: '💻' },
  { key: 'h5', label: 'H5/公众号', icon: '📱' },
  { key: 'miniapp', label: '小程序', icon: '🔲' },
  { key: 'settings', label: '推广设置', icon: '⚙️' },
  { key: 'share', label: '分享信息', icon: '📤' },
];

export default function PromoteModal({ product, onClose }: PromoteModalProps) {
  const [activeChannel, setActiveChannel] = useState('pc');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const productUrl = `https://aegisky.com/product/${product.slug || product.id}.html`;
  const shortUrl = `https://aegisky.co/p/${product.id}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">商品推广</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧渠道 */}
          <div className="w-40 border-r bg-gray-50 py-4">
            {channels.map(ch => (
              <button
                key={ch.key}
                onClick={() => setActiveChannel(ch.key)}
                className={`w-full text-left px-5 py-3 text-sm transition flex items-center gap-2 ${
                  activeChannel === ch.key
                    ? 'bg-white text-blue-600 font-medium border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{ch.icon}</span>
                {ch.label}
              </button>
            ))}
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeChannel === 'pc' && (
              <div className="space-y-6">
                <h3 className="font-medium text-gray-900">PC端推广</h3>

                {/* 二维码区域 */}
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-4">
                      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📱</div>
                          <div className="text-xs text-gray-500">扫码查看商品</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">PC端商品二维码</p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">素材下载</h4>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                          🖼️ 下载海报
                        </button>
                        <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                          📷 下载二维码
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">路径复制</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">适用于限时活动等字符有限的场景</p>
                          <div className="flex gap-2">
                            <input readOnly value={shortUrl} className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm" />
                            <button
                              onClick={() => copyToClipboard(shortUrl)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                              复制短链接
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">适用于分享长期活动等场景</p>
                          <div className="flex gap-2">
                            <input readOnly value={productUrl} className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm" />
                            <button
                              onClick={() => copyToClipboard(productUrl)}
                              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                            >
                              复制原链接
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {copied && (
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
                    ✅ 链接已复制到剪贴板
                  </div>
                )}
              </div>
            )}

            {activeChannel === 'h5' && (
              <div className="space-y-6">
                <h3 className="font-medium text-gray-900">H5/公众号推广</h3>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-4">
                      <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📱</div>
                          <div className="text-xs text-gray-500">微信扫码访问</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">H5端商品二维码</p>
                  </div>
                  <div className="flex-1 space-y-4">
                    <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">🖼️ 下载海报</button>
                    <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">📷 下载二维码</button>
                  </div>
                </div>
              </div>
            )}

            {activeChannel === 'miniapp' && (
              <div className="space-y-6">
                <h3 className="font-medium text-gray-900">小程序推广</h3>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-4">
                      <div className="w-full h-full bg-green-50 rounded flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🔲</div>
                          <div className="text-xs text-gray-500">微信小程序码</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">小程序码</p>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">小程序路径</label>
                      <input readOnly value={`pages/product/detail?id=${product.id}`} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm font-mono" />
                    </div>
                    <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">📷 下载小程序码</button>
                  </div>
                </div>
              </div>
            )}

            {activeChannel === 'settings' && (
              <div className="space-y-6">
                <h3 className="font-medium text-gray-900">推广设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-sm">开启分销</div>
                        <div className="text-xs text-gray-500 mt-1">允许分销员推广此商品并获得佣金</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">佣金比例 (%)</label>
                    <input type="number" defaultValue={10} className="w-40 px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-sm">开启秒杀</div>
                        <div className="text-xs text-gray-500 mt-1">参与限时秒杀活动</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeChannel === 'share' && (
              <div className="space-y-6">
                <h3 className="font-medium text-gray-900">分享信息</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分享标题</label>
                    <input
                      type="text"
                      defaultValue={product.name}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分享描述</label>
                    <textarea
                      rows={3}
                      defaultValue={product.short_description || ''}
                      className="w-full px-4 py-2 border rounded-lg resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分享图片</label>
                    <div className="flex items-center gap-4">
                      {product.main_image && (
                        <img src={product.main_image} className="w-20 h-20 object-cover rounded-lg border" alt="" />
                      )}
                      <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">更换图片</button>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存设置</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
