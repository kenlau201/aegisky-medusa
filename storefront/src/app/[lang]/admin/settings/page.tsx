'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [copyrightType, setCopyrightType] = useState('default');
  const [supportType, setSupportType] = useState('default');
  const [hideCopyright, setHideCopyright] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">基础信息</h1>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-6">
        <h2 className="text-lg font-semibold pb-4 border-b">商城信息</h2>

        {/* LOGO */}
        <div className="flex items-start gap-4">
          <label className="w-32 text-sm text-gray-600 pt-2">商城LOGO-黑底</label>
          <div className="flex-1">
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <span className="text-blue-600 font-bold text-xl">Aegisky</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">请根据页面设置对应大小的LOGO，高清需要上传双倍大小</p>
          </div>
        </div>

        {/* 商城名称 */}
        <div className="flex items-start gap-4">
          <label className="w-32 text-sm text-gray-600 pt-2">商城名称</label>
          <div className="flex-1 max-w-md">
            <div className="flex">
              <input type="text" defaultValue="Aegisky Medusa" className="flex-1 px-3 py-2 border rounded-l text-sm" />
              <button className="px-3 py-2 border border-l-0 rounded-r bg-gray-50 text-gray-400 hover:text-blue-600">AI</button>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="flex items-start gap-4">
          <label className="w-32 text-sm text-gray-600 pt-2">版权信息</label>
          <div className="flex-1">
            <div className="flex items-center gap-6 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="copyright" checked={copyrightType === 'default'} onChange={() => setCopyrightType('default')} className="w-4 h-4" />
                <span className="text-sm">系统默认</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="copyright" checked={copyrightType === 'custom'} onChange={() => setCopyrightType('custom')} className="w-4 h-4" />
                <span className="text-sm">自定义</span>
              </label>
            </div>
            <input
              type="text"
              disabled={copyrightType === 'default'}
              placeholder="Copyright © 2026 Aegisky. All Rights Reserved"
              className="w-full max-w-lg px-3 py-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-2">版权信息将会显示在商城页面底部，如需自定义或隐藏，请购买去版权服务。<a href="#" className="text-blue-600">查看示例</a></p>
          </div>
        </div>

        {/* 技术支持标识 */}
        <div className="flex items-start gap-4">
          <label className="w-32 text-sm text-gray-600 pt-2">技术支持标识</label>
          <div className="flex-1">
            <div className="flex items-center gap-6 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="support" checked={supportType === 'default'} onChange={() => setSupportType('default')} className="w-4 h-4" />
                <span className="text-sm">系统默认</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="support" checked={supportType === 'custom'} onChange={() => setSupportType('custom')} className="w-4 h-4" />
                <span className="text-sm">自定义</span>
              </label>
            </div>
            <p className="text-xs text-gray-400">技术标识将会显示在商城页面底部，如需自定义或隐藏，请购买去版权服务。<a href="#" className="text-blue-600">查看示例</a></p>
          </div>
        </div>

        {/* 标题栏版权隐藏 */}
        <div className="flex items-start gap-4">
          <label className="w-32 text-sm text-gray-600 pt-2">标题栏版权隐藏</label>
          <div className="flex-1">
            <div className="flex items-center gap-6 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="hideCopy" checked={hideCopyright} onChange={() => setHideCopyright(true)} className="w-4 h-4" />
                <span className="text-sm">是</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="hideCopy" checked={!hideCopyright} onChange={() => setHideCopyright(false)} className="w-4 h-4" />
                <span className="text-sm">否</span>
              </label>
            </div>
            <p className="text-xs text-gray-400">购买去版权服务后可修改 <a href="#" className="text-blue-600">查看示例</a></p>
          </div>
        </div>

        {/* 地址展示 */}
        <div className="flex items-start gap-4">
          <label className="w-32 text-sm text-gray-600 pt-2">地址展示</label>
          <div className="flex-1 max-w-md">
            <div className="flex">
              <input type="text" defaultValue="深圳市南山区科技园" className="flex-1 px-3 py-2 border rounded-l text-sm" />
              <button className="px-3 py-2 border border-l-0 rounded-r bg-gray-50 text-gray-400 hover:text-blue-600">AI</button>
            </div>
            <p className="text-xs text-gray-400 mt-2">企业地址会展示在商城PC端底部，为空则不显示</p>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-4 border-t">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">提交</button>
        </div>
      </div>
    </div>
  );
}
