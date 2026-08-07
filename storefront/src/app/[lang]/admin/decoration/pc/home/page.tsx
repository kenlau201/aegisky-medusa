'use client';

export default function PCPage() {
  const stats = [{"label":"轮播图","value":"0"},{"label":"导航项","value":"0"},{"label":"商品区","value":"0"},{"label":"广告位","value":"0"}];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PC首页装修</h1>
        <p className="text-gray-500 mt-1">PC端首页装修</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s: any) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-2xl font-bold mt-1">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
        <div className="text-4xl mb-4">📊</div>
        <p>详细数据将在有业务数据后展示</p>
      </div>
    </div>
  );
}