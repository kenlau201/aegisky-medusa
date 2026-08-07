'use client';

import { useState } from 'react';

const levels = [
  { id: 'vip1', name: '普通会员', icon: 'V1', color: 'from-orange-400 to-red-500', upgrade: '无门槛', benefits: '享受会员包邮', keepRule: '不降级', count: 23 },
  { id: 'vip2', name: '白银会员', icon: 'V2', color: 'from-gray-300 to-gray-500', upgrade: '999成长值', benefits: '会员折扣9.5折 1倍会员积分 享受会员包邮', keepRule: '不降级', count: 0 },
  { id: 'vip3', name: '铂金会员', icon: 'V3', color: 'from-blue-300 to-blue-500', upgrade: '2999成长值', benefits: '会员折扣9折 1.5倍会员积分 享受会员包邮', keepRule: '不降级', count: 2 },
  { id: 'vip4', name: '钻石会员', icon: 'V4', color: 'from-blue-400 to-indigo-600', upgrade: '6999成长值', benefits: '会员折扣8.5折 2倍会员积分 享受会员包邮', keepRule: '不降级', count: 0 },
  { id: 'vip5', name: '至尊会员', icon: 'V5', color: 'from-purple-400 to-purple-600', upgrade: '9999成长值', benefits: '会员折扣8折 2.5倍会员积分 享受会员包邮', keepRule: '不降级', count: 1 },
];

export default function CustomerLevelsPage() {
  const [editingLevel, setEditingLevel] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">等级权益</h1>
          <p className="text-gray-500 mt-1">管理会员等级和权益</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">编辑会员方案</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">等级</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">会员图标</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">会员名称</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">会员卡面</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">升级条件</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">会员权益</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">保级规则</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">会员数</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {levels.map((level) => (
              <tr key={level.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{level.id.toUpperCase()}</td>
                <td className="px-6 py-4"><span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-600 rounded font-bold text-sm">{level.icon}</span></td>
                <td className="px-6 py-4 text-sm font-medium">{level.name}</td>
                <td className="px-6 py-4"><div className={`w-16 h-10 rounded bg-gradient-to-r ${level.color}`}></div></td>
                <td className="px-6 py-4 text-sm">{level.upgrade}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{level.benefits}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{level.keepRule}</td>
                <td className="px-6 py-4 text-sm font-medium">{level.count}</td>
                <td className="px-6 py-4"><button onClick={() => setEditingLevel(level)} className="text-blue-600 hover:text-blue-800 text-sm">编辑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-[500px]">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-bold">编辑等级 - {editingLevel.name}</h3>
              <button onClick={() => setEditingLevel(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium mb-1">升级条件（成长值）</label><input type="number" className="w-full px-3 py-2 border rounded text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">会员折扣</label><select className="w-full px-3 py-2 border rounded text-sm"><option>不打折</option><option>9.5折</option><option>9折</option><option>8.5折</option><option>8折</option></select></div>
              <div><label className="block text-sm font-medium mb-1">积分倍数</label><select className="w-full px-3 py-2 border rounded text-sm"><option>1倍</option><option>1.5倍</option><option>2倍</option><option>2.5倍</option></select></div>
              <div className="flex items-center gap-2"><input type="checkbox" defaultChecked id="fs" className="w-4 h-4" /><label htmlFor="fs" className="text-sm">享受会员包邮</label></div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setEditingLevel(null)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">取消</button>
              <button onClick={() => setEditingLevel(null)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
