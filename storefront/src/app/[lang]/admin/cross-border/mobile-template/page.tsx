'use client';

export default function Page() {
  const stats = [{"label":"模板数","value":"5"},{"label":"当前模板","value":"默认"},{"label":"已定制","value":"0"},{"label":"状态","value":"正常"}];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">移动端模板</h1>
        <p className="text-gray-500 mt-1">跨境移动端模板</p>
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