export default function DistributionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">分销概览</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5"><div className="text-sm text-gray-500">分销员总数</div><div className="text-2xl font-bold mt-2">0</div></div>
        <div className="bg-white rounded-xl border p-5"><div className="text-sm text-gray-500">今日销售额</div><div className="text-2xl font-bold mt-2">$0.00</div></div>
        <div className="bg-white rounded-xl border p-5"><div className="text-sm text-gray-500">累计佣金</div><div className="text-2xl font-bold mt-2">$0.00</div></div>
        <div className="bg-white rounded-xl border p-5"><div className="text-sm text-gray-500">待结算佣金</div><div className="text-2xl font-bold mt-2">$0.00</div></div>
      </div>
    </div>
  );
}
