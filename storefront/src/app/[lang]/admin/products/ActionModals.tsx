'use client';

import { useState, useEffect } from 'react';

// ============ 越权操作弹窗 ============
export function UnauthorizedActionModal({ product, onClose }: { product: any; onClose: () => void }) {
  const [action, setAction] = useState('force_offline');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    alert(`越权操作已执行：${action}\n商品：${product.name}\n原因：${reason || '未填写'}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[500px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold text-orange-600">⚠️ 越权操作</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-700">
            <strong>警告：</strong>越权操作将绕过正常审核流程，请谨慎使用。所有操作将记录到操作日志。
          </div>

          <div className="p-3 bg-gray-50 rounded text-sm">
            <div><span className="text-gray-500">商品ID：</span>{product.id}</div>
            <div className="truncate"><span className="text-gray-500">商品名称：</span>{product.name}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">操作类型</label>
            <select value={action} onChange={e => setAction(e.target.value)} className="w-full px-3 py-2 border rounded text-sm">
              <option value="force_offline">强制下架</option>
              <option value="force_online">强制上架</option>
              <option value="change_price">强制改价</option>
              <option value="change_shop">转移店铺归属</option>
              <option value="lock_stock">锁定库存</option>
              <option value="delete">强制删除</option>
            </select>
          </div>

          {action === 'change_price' && (
            <div>
              <label className="block text-sm font-medium mb-2">新价格 ($)</label>
              <input type="number" className="w-full px-3 py-2 border rounded text-sm" placeholder="输入新价格" />
            </div>
          )}

          {action === 'change_shop' && (
            <div>
              <label className="block text-sm font-medium mb-2">目标店铺</label>
              <select className="w-full px-3 py-2 border rounded text-sm">
                <option>自营店铺</option>
                <option>Apple旗舰店</option>
                <option>DJI大疆旗舰店</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">操作原因 <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="请详细说明越权操作的原因，将记录到审计日志"
            />
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">确认执行</button>
        </div>
      </div>
    </div>
  );
}

// ============ 推广弹窗 ============
export function PromoteModal({ product, onClose }: { product: any; onClose: () => void }) {
  const [channels, setChannels] = useState<string[]>(['homepage']);
  const [commission, setCommission] = useState(5);

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const handleSubmit = () => {
    alert(`推广已设置：${channels.join(', ')}\n佣金比例：${commission}%`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[550px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold">商品推广</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="p-3 bg-blue-50 rounded text-sm">
            <div className="font-medium text-blue-700 mb-1">推广商品</div>
            <div className="text-gray-700 truncate">{product.name}</div>
            <div className="text-gray-500 text-xs mt-1">ID: {product.id} | 价格: ${product.price}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">推广渠道</label>
            <div className="space-y-2">
              {[
                { key: 'homepage', label: '首页推荐位', desc: '在网站首页轮播图/推荐位展示' },
                { key: 'category_top', label: '分类页置顶', desc: '在所属分类页顶部展示' },
                { key: 'search_top', label: '搜索结果置顶', desc: '相关关键词搜索结果排名第一' },
                { key: 'distributor', label: '分销员推广', desc: '允许分销员推广此商品赚取佣金' },
                { key: 'coupon_bind', label: '关联优惠券', desc: '商品详情页自动展示相关优惠券' },
              ].map(ch => (
                <label key={ch.key} className={`flex items-start gap-3 p-3 border rounded cursor-pointer ${channels.includes(ch.key) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input type="checkbox" checked={channels.includes(ch.key)} onChange={() => toggleChannel(ch.key)} className="w-4 h-4 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">{ch.label}</div>
                    <div className="text-xs text-gray-500">{ch.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {channels.includes('distributor') && (
            <div>
              <label className="block text-sm font-medium mb-2">分销佣金比例 (%)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="50" value={commission} onChange={e => setCommission(parseInt(e.target.value))} className="flex-1" />
                <span className="w-12 text-center font-medium text-blue-600">{commission}%</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">推广有效期</label>
            <div className="flex items-center gap-2">
              <input type="date" className="px-3 py-2 border rounded text-sm" />
              <span className="text-gray-400">至</span>
              <input type="date" className="px-3 py-2 border rounded text-sm" />
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">确认推广</button>
        </div>
      </div>
    </div>
  );
}

// ============ AI功能进度弹窗 ============
export function AIProcessingModal({ product, action, onClose }: { product: any; action: string; onClose: () => void }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'processing' | 'done' | 'error'>('processing');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const steps: Record<string, string[]> = {
      '智能批量翻译图片': [
        '正在下载商品图片...',
        '识别图片中的文字...',
        '调用AI翻译引擎...',
        '重新渲染翻译后的图片...',
        '上传新图片到CDN...',
        '更新商品图片记录...',
      ],
      '智能消除图片文字': [
        '正在下载商品图片...',
        '检测图片中的文字区域...',
        'AI智能填充背景...',
        '去除水印和文字...',
        '优化图片质量...',
        '上传处理后的图片...',
      ],
      '一键翻译商品文字': [
        '提取商品名称和描述...',
        '识别源语言...',
        '翻译商品名称...',
        '翻译商品描述...',
        '翻译商品属性和规格...',
        '保存多语言内容...',
      ],
    };

    const currentSteps = steps[action] || ['处理中...'];
    let step = 0;

    const timer = setInterval(() => {
      if (step < currentSteps.length) {
        setLogs(prev => [...prev, currentSteps[step]]);
        setProgress(Math.round(((step + 1) / currentSteps.length) * 100));
        step++;
      } else {
        setStatus('done');
        clearInterval(timer);
      }
    }, 800);

    return () => clearInterval(timer);
  }, [action]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[500px] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold flex items-center gap-2">
            <span className="text-purple-600">✨</span> {action}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" disabled={status === 'processing'}>&times;</button>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2 truncate">商品：{product.name}</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${status === 'done' ? 'bg-green-500' : 'bg-purple-600'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium w-10 text-right">{progress}%</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded p-3 h-40 overflow-y-auto font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="text-green-400 mb-1">
                <span className="text-gray-500">[{String(i + 1).padStart(2, '0')}]</span> {log}
              </div>
            ))}
            {status === 'processing' && <div className="text-yellow-400 animate-pulse">▌ 处理中...</div>}
            {status === 'done' && <div className="text-green-400 mt-2">✓ 处理完成！</div>}
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end bg-gray-50">
          {status === 'done' ? (
            <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">完成</button>
          ) : (
            <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded text-sm cursor-not-allowed">处理中...</button>
          )}
        </div>
      </div>
    </div>
  );
}
