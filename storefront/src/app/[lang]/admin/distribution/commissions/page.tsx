export default function PlaceholderPage() {
  const title = "commissions";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500 mt-1">功能开发中，敬请期待</p>
      </div>
      <div className="bg-white rounded-xl border p-12 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">此功能正在开发中</h3>
        <p className="text-gray-500">该模块已在开发计划中，将在后续版本中推出</p>
      </div>
    </div>
  );
}
