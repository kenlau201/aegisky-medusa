'use client';

export default function Page() {
  const stats = [{"label":"今日PV","value":"0"},{"label":"今日UV","value":"0"},{"label":"跳出率","value":"0%"},{"label":"平均停留","value":"0s"}];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">访问统计</h1>
        <p className="text-gray-500 mt-1">网站访问数据</p>
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