'use client';

import { useState } from 'react';

export default function Page() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<any>({});

  const fields = [{"key":"enable","label":"启用积分","type":"switch"},{"key":"earn_rate","label":"积分比例(1元=N积分)","type":"number"},{"key":"sign_points","label":"签到积分","type":"number"},{"key":"expire_days","label":"积分有效期(天)","type":"number"}];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">积分设置</h1>
        <p className="text-gray-500 mt-1">积分规则配置</p>
      </div>
      <div className="bg-white rounded-xl border p-6 max-w-2xl">
        <div className="space-y-4">
          {fields.map((f: any) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              {f.type === 'switch' ? (
                <button
                  onClick={() => setForm({...form, [f.key]: !form[f.key]})}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form[f.key] ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form[f.key] ? 'left-6' : 'left-0.5'}`} />
                </button>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] || ''}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder={f.placeholder || ''}
                />
              ) : f.type === 'select' ? (
                <select
                  value={form[f.key] || ''}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="">请选择</option>
                  {(f.options || []).map((o: string) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type || 'text'}
                  value={form[f.key] || ''}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder={f.placeholder || ''}
                />
              )}
              {f.hint && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {saved ? '已保存 ✓' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}