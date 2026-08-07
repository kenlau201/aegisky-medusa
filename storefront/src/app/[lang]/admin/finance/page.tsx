'use client';

export default function FinanceOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">资金总览</h1>
      </div>

      {/* 日期范围 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">日期范围：</span>
          <input type="date" className="px-3 py-2 border rounded text-sm" />
          <span className="text-gray-400">至</span>
          <input type="date" className="px-3 py-2 border rounded text-sm" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">搜索</button>
          <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50">重置</button>
        </div>
      </div>

      {/* 客户账户信息 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded"></span>
          客户账户信息
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">客户充值总额</div>
            <div className="text-2xl font-bold">¥520.02</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">提现金额</div>
            <div className="text-2xl font-bold">¥0.00</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">客户余额变化金额</div>
            <div className="text-2xl font-bold">¥10836171.14</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">客户冻结变化金额</div>
            <div className="text-2xl font-bold">¥10038.00</div>
          </div>
        </div>
      </div>

      {/* 余额使用信息 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded"></span>
          余额使用信息
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">交易使用余额</div>
            <div className="text-2xl font-bold">¥553245.34</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">交易使用积分</div>
            <div className="text-2xl font-bold">¥19204.00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
