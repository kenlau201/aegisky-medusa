'use client';

export default function Page() {
  const stats = [{"label":"可用组件","value":"12"},{"label":"已启用","value":"8"},{"label":"待配置","value":"4"},{"label":"版本","value":"v1.0"}];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">专享组件</h1>
        <p className="text-gray-500 mt-1">跨境专用组件</p>
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