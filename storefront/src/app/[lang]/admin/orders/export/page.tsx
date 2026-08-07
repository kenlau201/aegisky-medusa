'use client';

import { useState } from 'react';

export default function OrderExportPage() {
  const [dateRange, setDateRange] = useState('15days');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set([
    'order_no', 'product_name', 'price', 'quantity', 'total', 'buyer', 'status', 'create_time'
  ]));

  const allFields = [
    { key: 'order_no', label: '订单编号' },
    { key: 'product_name', label: '商品名称' },
    { key: 'sku', label: '商品规格' },
    { key: 'price', label: '商品单价' },
    { key: 'quantity', label: '购买数量' },
    { key: 'total', label: '订单总额' },
    { key: 'buyer', label: '买家账号' },
    { key: 'buyer_name', label: '收货人' },
    { key: 'phone', label: '联系电话' },
    { key: 'address', label: '收货地址' },
    { key: 'status', label: '订单状态' },
    { key: 'payment_method', label: '支付方式' },
    { key: 'shipping_method', label: '配送方式' },
    { key: 'tracking_no', label: '物流单号' },
    { key: 'shop_name', label: '店铺名称' },
    { key: 'create_time', label: '下单时间' },
    { key: 'pay_time', label: '付款时间' },
    { key: 'ship_time', label: '发货时间' },
  ];

  const toggleField = (key: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelectedFields(new Set(allFields.map(f => f.key)));
  const clearAll = () => setSelectedFields(new Set());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">订单导出</h1>
        <p className="text-gray-500 mt-1">选择需要导出的字段和时间范围</p>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* 时间范围 */}
        <div>
          <h3 className="font-medium mb-3">导出时间范围</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'today', label: '今天' },
              { value: 'yesterday', label: '昨天' },
              { value: '7days', label: '最近7天' },
              { value: '15days', label: '最近15天' },
              { value: '30days', label: '最近30天' },
              { value: 'this_month', label: '本月' },
              { value: 'last_month', label: '上月' },
              { value: 'custom', label: '自定义' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-4 py-2 rounded text-sm border ${dateRange === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 导出字段 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">选择导出字段（共 {allFields.length} 个，已选 {selectedFields.size} 个）</h3>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-sm text-blue-600 hover:text-blue-800">全选</button>
              <button onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-700">清空</button>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {allFields.map(field => (
              <label key={field.key} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.has(field.key)}
                  onChange={() => toggleField(field.key)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{field.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            将导出为 Excel (.xlsx) 文件
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50">保存配置</button>
            <button className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              📥 导出 Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
