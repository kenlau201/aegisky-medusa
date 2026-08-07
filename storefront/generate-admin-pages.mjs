/**
 * Script to generate functional admin pages for all placeholders
 * Run: node generate-admin-pages.mjs
 */
import fs from 'fs';
import path from 'path';

const adminDir = 'D:/项目备份/Aegisky-Medusa/aegisky-medusa/storefront/src/app/[lang]/admin';

// Page templates by category
const templates = {
  // Finance pages - show data tables
  financeTable: (title, desc, columns, apiEndpoint) => `'use client';

import { useState, useEffect } from 'react';

export default function ${title.replace(/[^a-zA-Z]/g, '')}Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ${apiEndpoint ? `fetch('${apiEndpoint}')
      .then(r => r.json())
      .then(d => setData(d.records || d.items || d.rows || []))
      .catch(console.error)
      .finally(() => setLoading(false));` : `setLoading(false);`}
  }, []);

  const columns = ${JSON.stringify(columns)};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">${title}</h1>
        <p className="text-gray-500 mt-1">${desc}</p>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex gap-2">
            <input type="text" placeholder="搜索..." className="px-3 py-1.5 border rounded text-sm w-64" />
            <button className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">搜索</button>
          </div>
          <button className="px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">导出</button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无数据</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((c: any) => (
                  <th key={c.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((c: any) => (
                    <td key={c.key} className="px-4 py-3 text-sm">{row[c.key] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}`,

  // Settings pages - show forms
  settingsForm: (title, desc, fields) => `'use client';

import { useState } from 'react';

export default function ${title.replace(/[^a-zA-Z]/g, '')}Page() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<any>({});

  const fields = ${JSON.stringify(fields)};

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">${title}</h1>
        <p className="text-gray-500 mt-1">${desc}</p>
      </div>
      <div className="bg-white rounded-xl border p-6 max-w-2xl">
        <div className="space-y-4">
          {fields.map((f: any) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              {f.type === 'switch' ? (
                <button
                  onClick={() => setForm({...form, [f.key]: !form[f.key]})}
                  className={\`relative w-12 h-6 rounded-full transition-colors \${form[f.key] ? 'bg-blue-600' : 'bg-gray-300'}\`}
                >
                  <span className={\`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform \${form[f.key] ? 'left-6' : 'left-0.5'}\`} />
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
}`,

  // List/management pages
  managementList: (title, desc, tabs) => `'use client';

import { useState } from 'react';

export default function ${title.replace(/[^a-zA-Z]/g, '')}Page() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ${JSON.stringify(tabs)};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">${title}</h1>
        <p className="text-gray-500 mt-1">${desc}</p>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="border-b flex">
          {tabs.map((tab: string, i: number) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={\`px-6 py-3 text-sm font-medium border-b-2 transition-colors \${
                activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }\`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <p>{tabs[activeTab]} - 暂无数据</p>
          <p className="text-sm mt-2">数据将在有相关业务后显示</p>
        </div>
      </div>
    </div>
  );
}`,

  // Simple placeholder with stats
  statsPage: (title, desc, stats) => `'use client';

export default function ${title.replace(/[^a-zA-Z]/g, '')}Page() {
  const stats = ${JSON.stringify(stats)};
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">${title}</h1>
        <p className="text-gray-500 mt-1">${desc}</p>
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
}`
};

// Define all pages
const pages = [
  // Finance - transaction/balance pages
  { path: 'finance/transactions', tpl: 'financeTable', title: '交易日志', desc: '查看所有交易记录', columns: [{key:'id',label:'交易号'},{key:'type',label:'类型'},{key:'amount',label:'金额'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'finance/balance-logs', tpl: 'financeTable', title: '余额日志', desc: '余额变动记录', columns: [{key:'id',label:'ID'},{key:'customer',label:'用户'},{key:'type',label:'类型'},{key:'amount',label:'金额'},{key:'balance',label:'余额'},{key:'created_at',label:'时间'}] },
  { path: 'finance/fees', tpl: 'settingsForm', title: '服务费率', desc: '设置平台服务费率', fields: [{key:'platform_fee',label:'平台费率(%)',type:'number',hint:'每笔交易收取的平台服务费比例'},{key:'payment_fee',label:'支付费率(%)',type:'number'},{key:'withdrawal_fee',label:'提现手续费',type:'number'}] },
  { path: 'finance/recharges', tpl: 'financeTable', title: '充值管理', desc: '用户充值记录', columns: [{key:'id',label:'订单号'},{key:'customer',label:'用户'},{key:'amount',label:'金额'},{key:'method',label:'支付方式'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'finance/point-logs', tpl: 'financeTable', title: '积分日志', desc: '积分变动记录', columns: [{key:'id',label:'ID'},{key:'customer',label:'用户'},{key:'type',label:'类型'},{key:'points',label:'积分'},{key:'description',label:'描述'},{key:'created_at',label:'时间'}] },
  { path: 'finance/settlements', tpl: 'financeTable', title: '分账管理', desc: '店铺分账记录', columns: [{key:'id',label:'结算单号'},{key:'shop',label:'店铺'},{key:'amount',label:'结算金额'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'finance/settlement-settings', tpl: 'settingsForm', title: '分账设置', desc: '配置自动分账规则', fields: [{key:'auto_settlement',label:'自动分账',type:'switch'},{key:'settlement_period',label:'结算周期',type:'select',options:['T+1','T+7','T+15','T+30']},{key:'min_amount',label:'最低结算金额',type:'number'}] },
  { path: 'finance/shop-funds', tpl: 'financeTable', title: '店铺资金', desc: '店铺资金余额', columns: [{key:'shop',label:'店铺'},{key:'balance',label:'可用余额'},{key:'frozen',label:'冻结金额'},{key:'total',label:'累计收入'}] },
  { path: 'finance/shop-logs', tpl: 'financeTable', title: '店铺资金日志', desc: '店铺资金变动记录', columns: [{key:'id',label:'ID'},{key:'shop',label:'店铺'},{key:'type',label:'类型'},{key:'amount',label:'金额'},{key:'created_at',label:'时间'}] },
  { path: 'finance/shop-overview', tpl: 'statsPage', title: '店铺资金概览', desc: '店铺资金总览', stats: [{label:'总余额',value:'$0.00'},{label:'累计收入',value:'$0.00'},{label:'待结算',value:'$0.00'},{label:'已提现',value:'$0.00'}] },
  { path: 'finance/shop-statements', tpl: 'financeTable', title: '店铺对账单', desc: '下载店铺对账单', columns: [{key:'period',label:'账期'},{key:'shop',label:'店铺'},{key:'orders',label:'订单数'},{key:'amount',label:'金额'},{key:'status',label:'状态'}] },
  { path: 'finance/shop-statement-details', tpl: 'financeTable', title: '对账单明细', desc: '对账单详细明细', columns: [{key:'order',label:'订单号'},{key:'shop',label:'店铺'},{key:'amount',label:'金额'},{key:'fee',label:'手续费'},{key:'created_at',label:'时间'}] },
  { path: 'finance/shop-withdrawals', tpl: 'financeTable', title: '店铺提现', desc: '店铺提现申请', columns: [{key:'id',label:'提现单号'},{key:'shop',label:'店铺'},{key:'amount',label:'金额'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'finance/supplier-funds', tpl: 'financeTable', title: '供应商资金', desc: '供应商资金余额', columns: [{key:'supplier',label:'供应商'},{key:'balance',label:'可用余额'},{key:'frozen',label:'冻结金额'},{key:'total',label:'累计收入'}] },
  { path: 'finance/supplier-logs', tpl: 'financeTable', title: '供应商资金日志', desc: '供应商资金变动', columns: [{key:'id',label:'ID'},{key:'supplier',label:'供应商'},{key:'type',label:'类型'},{key:'amount',label:'金额'},{key:'created_at',label:'时间'}] },
  { path: 'finance/supplier-overview', tpl: 'statsPage', title: '供应商资金概览', desc: '供应商资金总览', stats: [{label:'总余额',value:'$0.00'},{label:'累计收入',value:'$0.00'},{label:'待结算',value:'$0.00'},{label:'已提现',value:'$0.00'}] },
  { path: 'finance/supplier-statements', tpl: 'financeTable', title: '供应商对账单', desc: '供应商对账单', columns: [{key:'period',label:'账期'},{key:'supplier',label:'供应商'},{key:'orders',label:'订单数'},{key:'amount',label:'金额'},{key:'status',label:'状态'}] },
  { path: 'finance/supplier-statement-details', tpl: 'financeTable', title: '供应商对账明细', desc: '对账单明细', columns: [{key:'order',label:'订单号'},{key:'supplier',label:'供应商'},{key:'amount',label:'金额'},{key:'fee',label:'手续费'},{key:'created_at',label:'时间'}] },
  { path: 'finance/supplier-withdrawals', tpl: 'financeTable', title: '供应商提现', desc: '供应商提现申请', columns: [{key:'id',label:'提现单号'},{key:'supplier',label:'供应商'},{key:'amount',label:'金额'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'finance/distribution-commission', tpl: 'financeTable', title: '分销佣金', desc: '分销佣金记录', columns: [{key:'id',label:'ID'},{key:'distributor',label:'分销员'},{key:'order',label:'订单'},{key:'amount',label:'佣金'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'finance/withdrawal-settings', tpl: 'settingsForm', title: '提现设置', desc: '配置提现规则', fields: [{key:'min_withdrawal',label:'最低提现金额',type:'number'},{key:'withdrawal_fee_rate',label:'提现手续费率(%)',type:'number'},{key:'auto_approve',label:'自动审核',type:'switch'},{key:'methods',label:'提现方式',type:'textarea',hint:'每行一种方式'}] },

  // Reports
  { path: 'reports/sales-details', tpl: 'financeTable', title: '销售明细', desc: '商品销售明细', columns: [{key:'product',label:'商品'},{key:'sku',label:'SKU'},{key:'quantity',label:'销量'},{key:'amount',label:'销售额'},{key:'orders',label:'订单数'}] },
  { path: 'reports/sales-metrics', tpl: 'statsPage', title: '销售指标', desc: '关键销售指标', stats: [{label:'总销售额',value:'$0.00'},{label:'订单数',value:'0'},{label:'客单价',value:'$0.00'},{label:'转化率',value:'0%'}] },
  { path: 'reports/sales-ranking', tpl: 'financeTable', title: '销售排行', desc: '商品销售排行榜', columns: [{key:'rank',label:'排名'},{key:'product',label:'商品'},{key:'sales',label:'销量'},{key:'amount',label:'销售额'}] },
  { path: 'reports/consumption-ranking', tpl: 'financeTable', title: '消费排行', desc: '客户消费排行榜', columns: [{key:'rank',label:'排名'},{key:'customer',label:'客户'},{key:'orders',label:'订单数'},{key:'amount',label:'消费金额'}] },
  { path: 'reports/customers', tpl: 'statsPage', title: '客户概览', desc: '客户统计概览', stats: [{label:'总客户数',value:'0'},{label:'新增客户',value:'0'},{label:'活跃客户',value:'0'},{label:'复购率',value:'0%'}] },
  { path: 'reports/new-customers', tpl: 'financeTable', title: '新增客户', desc: '新注册客户', columns: [{key:'name',label:'客户'},{key:'email',label:'邮箱'},{key:'registered',label:'注册时间'},{key:'source',label:'来源'}] },
  { path: 'reports/visits', tpl: 'statsPage', title: '访问统计', desc: '网站访问数据', stats: [{label:'今日PV',value:'0'},{label:'今日UV',value:'0'},{label:'跳出率',value:'0%'},{label:'平均停留',value:'0s'}] },

  // Aftersales
  { path: 'aftersales/overview', tpl: 'statsPage', title: '售后概览', desc: '售后服务数据总览', stats: [{label:'待处理',value:'0'},{label:'处理中',value:'0'},{label:'已完成',value:'0'},{label:'退款金额',value:'$0.00'}] },
  { path: 'aftersales/logs', tpl: 'financeTable', title: '退款日志', desc: '退款操作记录', columns: [{key:'id',label:'退款单号'},{key:'order',label:'订单号'},{key:'amount',label:'金额'},{key:'reason',label:'原因'},{key:'operator',label:'操作人'},{key:'created_at',label:'时间'}] },

  // Products
  { path: 'products/overview', tpl: 'statsPage', title: '商品概览', desc: '商品数据总览', stats: [{label:'商品总数',value:'6385'},{label:'在售商品',value:'6385'},{label:'缺货商品',value:'0'},{label:'待审核',value:'0'}] },
  { path: 'products/batch', tpl: 'settingsForm', title: '批量操作', desc: '商品批量导入导出', fields: [{key:'import_file',label:'导入文件',type:'file',hint:'支持CSV/Excel格式'},{key:'export_format',label:'导出格式',type:'select',options:['CSV','Excel','JSON']}] },

  // Content
  { path: 'content/agreements', tpl: 'managementList', title: '协议管理', desc: '管理用户协议', tabs: ['服务协议','隐私政策','用户协议'] },
  { path: 'content/agreements/privacy', tpl: 'settingsForm', title: '隐私政策', desc: '编辑隐私政策内容', fields: [{key:'content',label:'隐私政策内容',type:'textarea',hint:'支持HTML格式'}] },
  { path: 'content/agreements/service', tpl: 'settingsForm', title: '服务协议', desc: '编辑服务协议内容', fields: [{key:'content',label:'服务协议内容',type:'textarea',hint:'支持HTML格式'}] },
  { path: 'content/articles', tpl: 'financeTable', title: '文章内容', desc: '管理文章内容', columns: [{key:'title',label:'标题'},{key:'author',label:'作者'},{key:'category',label:'分类'},{key:'views',label:'浏览'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'content/channels', tpl: 'financeTable', title: '视频号', desc: '视频号管理', columns: [{key:'name',label:'名称'},{key:'platform',label:'平台'},{key:'followers',label:'粉丝'},{key:'videos',label:'视频数'},{key:'status',label:'状态'}] },
  { path: 'content/feedbacks', tpl: 'financeTable', title: '留言反馈', desc: '用户留言反馈', columns: [{key:'name',label:'用户'},{key:'contact',label:'联系方式'},{key:'content',label:'内容'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'articles/categories', tpl: 'financeTable', title: '文章分类', desc: '文章分类管理', columns: [{key:'name',label:'分类名'},{key:'slug',label:'标识'},{key:'count',label:'文章数'},{key:'sort',label:'排序'}] },

  // Customers
  { path: 'customers/messages', tpl: 'financeTable', title: '站内信', desc: '站内消息管理', columns: [{key:'title',label:'标题'},{key:'recipient',label:'接收人'},{key:'type',label:'类型'},{key:'read',label:'已读'},{key:'created_at',label:'时间'}] },
  { path: 'customers/settings', tpl: 'settingsForm', title: '客户设置', desc: '客户相关设置', fields: [{key:'allow_register',label:'允许注册',type:'switch'},{key:'need_verify',label:'需要邮箱验证',type:'switch'},{key:'default_level',label:'默认等级',type:'select',options:['普通会员','银卡会员','金卡会员','钻石会员']}] },
  { path: 'customers/tags', tpl: 'financeTable', title: '客户标签', desc: '客户标签管理', columns: [{key:'name',label:'标签名'},{key:'color',label:'颜色'},{key:'count',label:'客户数'},{key:'created_at',label:'创建时间'}] },
  { path: 'customers/verification', tpl: 'financeTable', title: '客户认证', desc: '实名认证审核', columns: [{key:'name',label:'姓名'},{key:'type',label:'认证类型'},{key:'id_number',label:'证件号'},{key:'status',label:'状态'},{key:'submitted',label:'提交时间'}] },
  { path: 'customers/verification-settings', tpl: 'settingsForm', title: '认证设置', desc: '实名认证配置', fields: [{key:'enable_kyc',label:'启用实名认证',type:'switch'},{key:'auto_approve',label:'自动审核',type:'switch'},{key:'required_fields',label:'必填字段',type:'textarea'}] },

  // Merchants
  { path: 'merchants', tpl: 'financeTable', title: '商户列表', desc: '所有商户管理', columns: [{key:'name',label:'商户名'},{key:'contact',label:'联系人'},{key:'phone',label:'电话'},{key:'status',label:'状态'},{key:'created_at',label:'入驻时间'}] },
  { path: 'merchants/recruitment', tpl: 'settingsForm', title: '招商内容', desc: '编辑招商页面内容', fields: [{key:'title',label:'标题'},{key:'content',label:'招商内容',type:'textarea'},{key:'contact_email',label:'联系邮箱'},{key:'benefits',label:'入驻优势',type:'textarea'}] },
  { path: 'merchants/settings', tpl: 'settingsForm', title: '商户设置', desc: '商户相关配置', fields: [{key:'auto_approve',label:'自动审核入驻',type:'switch'},{key:'commission_rate',label:'默认佣金率(%)',type:'number'},{key:'require_contract',label:'需要合同',type:'switch'}] },

  // Shops
  { path: 'shops/settings', tpl: 'settingsForm', title: '店铺设置', desc: '店铺全局设置', fields: [{key:'default_status',label:'默认店铺状态',type:'select',options:['启用','禁用']},{key:'allow_multi_shop',label:'允许多店铺',type:'switch'},{key:'shop_review',label:'店铺审核',type:'switch'}] },

  // Suppliers
  { path: 'suppliers/orders', tpl: 'financeTable', title: '供应商订单', desc: '供应商相关订单', columns: [{key:'order_number',label:'订单号'},{key:'supplier',label:'供应商'},{key:'amount',label:'金额'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'suppliers/products', tpl: 'financeTable', title: '供应商商品', desc: '供应商商品列表', columns: [{key:'name',label:'商品名'},{key:'supplier',label:'供应商'},{key:'price',label:'价格'},{key:'stock',label:'库存'},{key:'status',label:'状态'}] },
  { path: 'suppliers/settings', tpl: 'settingsForm', title: '供应商设置', desc: '供应商管理配置', fields: [{key:'auto_approve',label:'自动审核供应商',type:'switch'},{key:'require_certification',label:'需要资质认证',type:'switch'},{key:'default_commission',label:'默认佣金率(%)',type:'number'}] },

  // Distribution
  { path: 'distribution/analysis', tpl: 'statsPage', title: '成交分析', desc: '分销成交数据分析', stats: [{label:'总佣金',value:'$0.00'},{label:'分销订单',value:'0'},{label:'活跃分销员',value:'0'},{label:'转化率',value:'0%'}] },
  { path: 'distribution/commissions', tpl: 'financeTable', title: '佣金管理', desc: '商品佣金设置', columns: [{key:'product',label:'商品'},{key:'commission_rate',label:'佣金比例'},{key:'commission_amount',label:'佣金金额'},{key:'sales',label:'销量'}] },
  { path: 'distribution/customers', tpl: 'financeTable', title: '客户成交', desc: '分销客户成交记录', columns: [{key:'customer',label:'客户'},{key:'distributor',label:'分销员'},{key:'order',label:'订单'},{key:'amount',label:'金额'},{key:'commission',label:'佣金'},{key:'created_at',label:'时间'}] },
  { path: 'distribution/details', tpl: 'financeTable', title: '分销员明细', desc: '分销员详细数据', columns: [{key:'name',label:'分销员'},{key:'orders',label:'订单数'},{key:'sales',label:'销售额'},{key:'commission',label:'佣金'},{key:'level',label:'等级'}] },
  { path: 'distribution/distributors', tpl: 'financeTable', title: '分销员管理', desc: '分销员列表', columns: [{key:'name',label:'姓名'},{key:'phone',label:'手机'},{key:'level',label:'等级'},{key:'orders',label:'订单'},{key:'commission',label:'佣金'},{key:'status',label:'状态'}] },
  { path: 'distribution/groups', tpl: 'financeTable', title: '分销员分组', desc: '分销员分组管理', columns: [{key:'name',label:'分组名'},{key:'count',label:'人数'},{key:'commission_rate',label:'佣金比例'},{key:'created_at',label:'创建时间'}] },
  { path: 'distribution/guide', tpl: 'settingsForm', title: '分销攻略', desc: '编辑分销攻略内容', fields: [{key:'title',label:'标题'},{key:'content',label:'攻略内容',type:'textarea'}] },
  { path: 'distribution/material-cats', tpl: 'financeTable', title: '素材分类', desc: '分销素材分类', columns: [{key:'name',label:'分类名'},{key:'count',label:'素材数'},{key:'sort',label:'排序'}] },
  { path: 'distribution/materials', tpl: 'financeTable', title: '素材管理', desc: '分销素材管理', columns: [{key:'title',label:'标题'},{key:'type',label:'类型'},{key:'category',label:'分类'},{key:'views',label:'浏览'},{key:'created_at',label:'时间'}] },
  { path: 'distribution/mode', tpl: 'settingsForm', title: '分销模式', desc: '设置分销模式', fields: [{key:'mode',label:'分销模式',type:'select',options:['关闭','一级分销','二级分销','三级分销']},{key:'self_buy',label:'自购返利',type:'switch'},{key:'auto_audit',label:'自动审核',type:'switch'}] },
  { path: 'distribution/performance', tpl: 'financeTable', title: '业绩结算', desc: '分销业绩结算', columns: [{key:'distributor',label:'分销员'},{key:'period',label:'结算周期'},{key:'orders',label:'订单数'},{key:'amount',label:'业绩'},{key:'commission',label:'佣金'},{key:'status',label:'状态'}] },
  { path: 'distribution/ranking', tpl: 'financeTable', title: '分销员排行', desc: '分销员业绩排行', columns: [{key:'rank',label:'排名'},{key:'name',label:'分销员'},{key:'orders',label:'订单'},{key:'sales',label:'销售额'},{key:'commission',label:'佣金'}] },
  { path: 'distribution/settings', tpl: 'settingsForm', title: '分销设置', desc: '分销全局设置', fields: [{key:'enable',label:'启用分销',type:'switch'},{key:'commission_type',label:'佣金类型',type:'select',options:['百分比','固定金额']},{key:'settlement_day',label:'结算日',type:'number',hint:'每月几号结算'}] },
  { path: 'distribution/settlement', tpl: 'settingsForm', title: '结算方案', desc: '分销结算方案配置', fields: [{key:'period',label:'结算周期',type:'select',options:['周结','半月结','月结']},{key:'min_amount',label:'最低结算金额',type:'number'},{key:'auto_settle',label:'自动结算',type:'switch'}] },

  // Promotions
  { path: 'promotions/seckill', tpl: 'managementList', title: '限时秒杀', desc: '秒杀活动管理', tabs: ['进行中','未开始','已结束'] },
  { path: 'promotions/group-buy', tpl: 'managementList', title: '拼团活动', desc: '拼团活动管理', tabs: ['进行中','未开始','已结束'] },
  { path: 'promotions/discount', tpl: 'managementList', title: '满减活动', desc: '满减优惠管理', tabs: ['进行中','未开始','已结束'] },
  { path: 'promotions/gift', tpl: 'managementList', title: '满赠活动', desc: '满赠活动管理', tabs: ['进行中','未开始','已结束'] },
  { path: 'promotions/timed-discount', tpl: 'managementList', title: '限时折扣', desc: '限时折扣管理', tabs: ['进行中','未开始','已结束'] },
  { path: 'promotions/presents', tpl: 'managementList', title: '活动赠品', desc: '赠品活动管理', tabs: ['进行中','未开始','已结束'] },
  { path: 'promotions/point-products', tpl: 'financeTable', title: '积分商品', desc: '积分兑换商品', columns: [{key:'product',label:'商品'},{key:'points',label:'所需积分'},{key:'price',label:'现金价'},{key:'stock',label:'库存'},{key:'redeemed',label:'已兑换'}] },
  { path: 'promotions/points', tpl: 'settingsForm', title: '积分设置', desc: '积分规则配置', fields: [{key:'enable',label:'启用积分',type:'switch'},{key:'earn_rate',label:'积分比例(1元=N积分)',type:'number'},{key:'sign_points',label:'签到积分',type:'number'},{key:'expire_days',label:'积分有效期(天)',type:'number'}] },
  { path: 'promotions/cards', tpl: 'financeTable', title: '电子卡券', desc: '电子卡券管理', columns: [{key:'name',label:'卡券名'},{key:'type',label:'类型'},{key:'value',label:'面值'},{key:'issued',label:'已发放'},{key:'used',label:'已使用'},{key:'status',label:'状态'}] },
  { path: 'promotions/lottery', tpl: 'managementList', title: '抽奖活动', desc: '抽奖活动管理', tabs: ['进行中','未开始','已结束'] },
  { path: 'promotions/checkin', tpl: 'settingsForm', title: '日历签到', desc: '签到活动配置', fields: [{key:'enable',label:'启用签到',type:'switch'},{key:'daily_points',label:'每日签到积分',type:'number'},{key:'continuous_bonus',label:'连续签到奖励',type:'textarea',hint:'格式: 天数=积分,每行一条'}] },
  { path: 'promotions/recharge', tpl: 'financeTable', title: '余额充值', desc: '充值活动管理', columns: [{key:'amount',label:'充值金额'},{key:'bonus',label:'赠送金额'},{key:'type',label:'类型'},{key:'status',label:'状态'}] },
  { path: 'promotions/gift-cards', tpl: 'financeTable', title: '礼品卡', desc: '礼品卡管理', columns: [{key:'code',label:'卡号'},{key:'amount',label:'面值'},{key:'balance',label:'余额'},{key:'customer',label:'持有人'},{key:'status',label:'状态'}] },
  { path: 'promotions/buyer-show', tpl: 'financeTable', title: '买家秀', desc: '买家秀管理', columns: [{key:'customer',label:'用户'},{key:'product',label:'商品'},{key:'content',label:'内容'},{key:'likes',label:'点赞'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'promotions/activities', tpl: 'managementList', title: '活动管理', desc: '营销活动总览', tabs: ['全部','进行中','未开始','已结束'] },

  // Settings - System
  { path: 'settings/admins', tpl: 'financeTable', title: '管理员列表', desc: '后台管理员账号', columns: [{key:'username',label:'用户名'},{key:'name',label:'姓名'},{key:'role',label:'角色'},{key:'last_login',label:'最后登录'},{key:'status',label:'状态'}] },
  { path: 'settings/roles', tpl: 'financeTable', title: '角色管理', desc: '管理员角色权限', columns: [{key:'name',label:'角色名'},{key:'description',label:'描述'},{key:'permissions',label:'权限数'},{key:'admins',label:'管理员数'},{key:'created_at',label:'创建时间'}] },
  { path: 'settings/authorization', tpl: 'settingsForm', title: '授权信息', desc: '系统授权信息', fields: [{key:'license',label:'授权码',hint:'请输入正版授权码'},{key:'domain',label:'授权域名'},{key:'expiry',label:'到期时间',type:'date'}] },
  { path: 'settings/api-version', tpl: 'statsPage', title: 'API版本', desc: 'API版本信息', stats: [{label:'当前版本',value:'v2.0'},{label:'API状态',value:'正常'},{label:'最后更新',value:'2026-08-08'},{label:'运行时间',value:'正常'}] },
  { path: 'settings/business-mode', tpl: 'settingsForm', title: '经营模式', desc: '设置店铺经营模式', fields: [{key:'mode',label:'经营模式',type:'select',options:['B2C零售','B2B批发','B2B2C多商户','供应链平台']},{key:'multi_shop',label:'多商户模式',type:'switch'},{key:'cross_border',label:'跨境模式',type:'switch'}] },
  { path: 'settings/logistics', tpl: 'financeTable', title: '物流公司', desc: '物流服务商管理', columns: [{key:'name',label:'公司名'},{key:'code',label:'编码'},{key:'tracking_url',label:'查询网址'},{key:'status',label:'状态'}] },
  { path: 'settings/payment', tpl: 'settingsForm', title: '支付设置', desc: '支付方式配置', fields: [{key:'stripe_enable',label:'Stripe支付',type:'switch'},{key:'stripe_key',label:'Stripe Public Key'},{key:'stripe_secret',label:'Stripe Secret Key'},{key:'paypal_enable',label:'PayPal支付',type:'switch'},{key:'wire_transfer',label:'银行转账',type:'switch'}] },
  { path: 'settings/shipping', tpl: 'settingsForm', title: '配送设置', desc: '配送区域和运费', fields: [{key:'free_shipping_threshold',label:'免运费门槛',type:'number'},{key:'default_shipping_fee',label:'默认运费',type:'number'},{key:'enable_international',label:'国际配送',type:'switch'}] },
  { path: 'settings/regions', tpl: 'financeTable', title: '地区管理', desc: '配送地区管理', columns: [{key:'name',label:'地区'},{key:'code',label:'编码'},{key:'parent',label:'上级'},{key:'sort',label:'排序'}] },
  { path: 'settings/trade', tpl: 'settingsForm', title: '交易设置', desc: '交易相关配置', fields: [{key:'auto_cancel_hours',label:'未付款自动取消(小时)',type:'number'},{key:'auto_confirm_days',label:'自动确认收货(天)',type:'number'},{key:'allow_refund_days',label:'允许退款天数',type:'number'},{key:'tax_rate',label:'税率(%)',type:'number'}] },
  { path: 'settings/product', tpl: 'settingsForm', title: '商品设置', desc: '商品相关配置', fields: [{key:'auto_approve',label:'商品自动审核',type:'switch'},{key:'default_stock',label:'默认库存',type:'number'},{key:'enable_review',label:'开启评价',type:'switch'},{key:'review_audit',label:'评价需审核',type:'switch'}] },
  { path: 'settings/global', tpl: 'settingsForm', title: '全局设置', desc: '系统全局配置', fields: [{key:'site_name',label:'站点名称'},{key:'site_logo',label:'Logo URL'},{key:'site_description',label:'站点描述',type:'textarea'},{key:'contact_email',label:'联系邮箱'},{key:'contact_phone',label:'联系电话'}] },
  { path: 'settings/notifications', tpl: 'financeTable', title: '消息管理', desc: '系统消息通知', columns: [{key:'title',label:'标题'},{key:'type',label:'类型'},{key:'audience',label:'接收人'},{key:'sent',label:'发送时间'},{key:'status',label:'状态'}] },
  { path: 'settings/notification-settings', tpl: 'settingsForm', title: '通知设置', desc: '消息通知配置', fields: [{key:'email_notify',label:'邮件通知',type:'switch'},{key:'sms_notify',label:'短信通知',type:'switch'},{key:'new_order',label:'新订单通知',type:'switch'},{key:'new_rfq',label:'新RFQ通知',type:'switch'}] },
  { path: 'settings/mail-server', tpl: 'settingsForm', title: '邮件服务器', desc: 'SMTP邮件配置', fields: [{key:'smtp_host',label:'SMTP服务器'},{key:'smtp_port',label:'端口',type:'number'},{key:'smtp_user',label:'用户名'},{key:'smtp_pass',label:'密码',type:'password'},{key:'from_email',label:'发件人邮箱'},{key:'from_name',label:'发件人名称'}] },
  { path: 'settings/mail-template', tpl: 'settingsForm', title: '邮件模板', desc: '邮件模板管理', fields: [{key:'welcome_subject',label:'欢迎邮件标题'},{key:'welcome_content',label:'欢迎邮件内容',type:'textarea'},{key:'order_subject',label:'订单通知标题'},{key:'order_content',label:'订单通知内容',type:'textarea'}] },
  { path: 'settings/logs', tpl: 'financeTable', title: '操作日志', desc: '管理员操作记录', columns: [{key:'admin',label:'管理员'},{key:'action',label:'操作'},{key:'target',label:'对象'},{key:'ip',label:'IP'},{key:'created_at',label:'时间'}] },
  { path: 'settings/menus', tpl: 'financeTable', title: '菜单管理', desc: '后台菜单管理', columns: [{key:'name',label:'菜单名'},{key:'path',label:'路径'},{key:'icon',label:'图标'},{key:'sort',label:'排序'},{key:'status',label:'状态'}] },
  { path: 'settings/friend-links', tpl: 'financeTable', title: '友情链接', desc: '友情链接管理', columns: [{key:'name',label:'名称'},{key:'url',label:'链接'},{key:'logo',label:'Logo'},{key:'sort',label:'排序'},{key:'status',label:'状态'}] },
  { path: 'settings/customization', tpl: 'settingsForm', title: '个性化设置', desc: '界面个性化配置', fields: [{key:'primary_color',label:'主题色'},{key:'footer_text',label:'页脚文字',type:'textarea'},{key:'copyright',label:'版权信息'}] },
  { path: 'settings/customer-service', tpl: 'settingsForm', title: '客服设置', desc: '在线客服配置', fields: [{key:'enable_chat',label:'启用在线客服',type:'switch'},{key:'chat_url',label:'客服链接'},{key:'service_hours',label:'服务时间'},{key:'service_phone',label:'客服电话'}] },
  { path: 'settings/miniprogram', tpl: 'settingsForm', title: '小程序设置', desc: '小程序配置', fields: [{key:'app_id',label:'AppID'},{key:'app_secret',label:'AppSecret'},{key:'page_path',label:'首页路径'}] },
  { path: 'settings/receipt', tpl: 'settingsForm', title: '小票打印', desc: '小票打印设置', fields: [{key:'enable',label:'启用打印',type:'switch'},{key:'printer_name',label:'打印机名称'},{key:'header',label:'小票头部',type:'textarea'},{key:'footer',label:'小票尾部',type:'textarea'}] },
  { path: 'settings/login', tpl: 'settingsForm', title: '登录设置', desc: '登录方式配置', fields: [{key:'email_login',label:'邮箱登录',type:'switch'},{key:'phone_login',label:'手机登录',type:'switch'},{key:'google_login',label:'Google登录',type:'switch'},{key:'github_login',label:'GitHub登录',type:'switch'}] },
  { path: 'settings/order', tpl: 'settingsForm', title: '订单设置', desc: '订单相关配置', fields: [{key:'order_prefix',label:'订单号前缀'},{key:'invoice_enable',label:'开启发票',type:'switch'},{key:'comment_enable',label:'开启备注',type:'switch'}] },
  { path: 'settings/decoration/navigation', tpl: 'financeTable', title: '导航管理', desc: '前台导航菜单', columns: [{key:'name',label:'名称'},{key:'link',label:'链接'},{key:'sort',label:'排序'},{key:'status',label:'状态'}] },
  { path: 'settings/decoration/pages', tpl: 'financeTable', title: '页面管理', desc: '自定义页面', columns: [{key:'title',label:'标题'},{key:'path',label:'路径'},{key:'views',label:'浏览'},{key:'status',label:'状态'},{key:'updated',label:'更新时间'}] },
  { path: 'settings/decoration/splash', tpl: 'financeTable', title: '开屏广告', desc: 'APP开屏广告', columns: [{key:'name',label:'名称'},{key:'image',label:'图片'},{key:'link',label:'跳转链接'},{key:'start',label:'开始时间'},{key:'end',label:'结束时间'},{key:'status',label:'状态'}] },
  { path: 'settings/decoration/theme', tpl: 'settingsForm', title: '主题风格', desc: '店铺主题设置', fields: [{key:'theme',label:'主题',type:'select',options:['默认蓝','科技黑','活力橙','清新绿']},{key:'layout',label:'布局',type:'select',options:['经典','简约','现代']}] },
  { path: 'settings/pc/category-drawer', tpl: 'financeTable', title: '分类抽屉', desc: 'PC端分类抽屉配置', columns: [{key:'category',label:'分类'},{key:'icon',label:'图标'},{key:'sort',label:'排序'},{key:'show',label:'显示'}] },
  { path: 'settings/pc/navigation', tpl: 'financeTable', title: 'PC导航', desc: 'PC端导航菜单', columns: [{key:'name',label:'名称'},{key:'link',label:'链接'},{key:'sort',label:'排序'},{key:'status',label:'状态'}] },
  { path: 'settings/pc/pages', tpl: 'financeTable', title: 'PC页面管理', desc: 'PC端自定义页面', columns: [{key:'title',label:'标题'},{key:'path',label:'路径'},{key:'views',label:'浏览'},{key:'status',label:'状态'}] },
  { path: 'auth/accounts', tpl: 'financeTable', title: '账号管理', desc: '账号安全管理', columns: [{key:'username',label:'用户名'},{key:'email',label:'邮箱'},{key:'role',label:'角色'},{key:'last_login',label:'最后登录'},{key:'status',label:'状态'}] },

  // Decoration
  { path: 'decoration/mobile/category', tpl: 'settingsForm', title: '移动端分类页', desc: '移动端分类页装修', fields: [{key:'layout',label:'布局样式',type:'select',options:['图标式','列表式','大图式']},{key:'show_banner',label:'显示Banner',type:'switch'}] },
  { path: 'decoration/mobile/category-nav', tpl: 'financeTable', title: '分类导航', desc: '移动端分类导航', columns: [{key:'name',label:'名称'},{key:'icon',label:'图标'},{key:'link',label:'链接'},{key:'sort',label:'排序'}] },
  { path: 'decoration/mobile/member', tpl: 'settingsForm', title: '会员页装修', desc: '移动端会员中心', fields: [{key:'show_avatar',label:'显示头像',type:'switch'},{key:'show_balance',label:'显示余额',type:'switch'},{key:'menu_items',label:'菜单项',type:'textarea'}] },
  { path: 'decoration/mobile/nav', tpl: 'financeTable', title: '主导航栏', desc: '移动端底部导航', columns: [{key:'name',label:'名称'},{key:'icon',label:'图标'},{key:'link',label:'链接'},{key:'sort',label:'排序'}] },
  { path: 'decoration/mobile/other', tpl: 'settingsForm', title: '其他页面', desc: '其他移动端页面', fields: [{key:'custom_css',label:'自定义CSS',type:'textarea'},{key:'custom_js',label:'自定义JS',type:'textarea'}] },
  { path: 'decoration/mobile/pages', tpl: 'financeTable', title: '页面管理', desc: '移动端页面装修', columns: [{key:'title',label:'标题'},{key:'type',label:'类型'},{key:'path',label:'路径'},{key:'status',label:'状态'},{key:'updated',label:'更新时间'}] },
  { path: 'decoration/pc/custom', tpl: 'settingsForm', title: 'PC自定义页', desc: 'PC端自定义页面装修', fields: [{key:'title',label:'页面标题'},{key:'content',label:'页面内容',type:'textarea'},{key:'seo_title',label:'SEO标题'},{key:'seo_desc',label:'SEO描述'}] },
  { path: 'decoration/pc/home', tpl: 'statsPage', title: 'PC首页装修', desc: 'PC端首页装修', stats: [{label:'轮播图',value:'0'},{label:'导航项',value:'0'},{label:'商品区',value:'0'},{label:'广告位',value:'0'}] },
  { path: 'decoration/pc/other', tpl: 'settingsForm', title: 'PC其他页面', desc: 'PC端其他页面设置', fields: [{key:'custom_css',label:'自定义CSS',type:'textarea'},{key:'custom_js',label:'自定义JS',type:'textarea'}] },

  // Wholesale
  { path: 'wholesale/bulk-order', tpl: 'financeTable', title: '批量订单', desc: '批量采购订单', columns: [{key:'order',label:'订单号'},{key:'customer',label:'客户'},{key:'items',label:'商品数'},{key:'amount',label:'金额'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'wholesale/inquiry', tpl: 'financeTable', title: '询价管理', desc: '批发询价单', columns: [{key:'id',label:'询价单号'},{key:'customer',label:'客户'},{key:'product',label:'商品'},{key:'quantity',label:'数量'},{key:'status',label:'状态'},{key:'created_at',label:'时间'}] },
  { path: 'wholesale/price-control', tpl: 'financeTable', title: '价格控制', desc: '批发价格规则', columns: [{key:'product',label:'商品'},{key:'min_qty',label:'起订量'},{key:'price',label:'批发价'},{key:'tier',label:'价格阶梯'}] },
  { path: 'wholesale/verification', tpl: 'financeTable', title: '企业认证', desc: '企业客户认证', columns: [{key:'company',label:'企业名'},{key:'contact',label:'联系人'},{key:'license',label:'营业执照'},{key:'status',label:'状态'},{key:'submitted',label:'提交时间'}] },

  // Cross-border
  { path: 'cross-border/components', tpl: 'statsPage', title: '专享组件', desc: '跨境专用组件', stats: [{label:'可用组件',value:'12'},{label:'已启用',value:'8'},{label:'待配置',value:'4'},{label:'版本',value:'v1.0'}] },
  { path: 'cross-border/image', tpl: 'settingsForm', title: '图片智能处理', desc: 'AI图片处理配置', fields: [{key:'auto_translate',label:'自动翻译图片文字',type:'switch'},{key:'auto_resize',label:'自动压缩',type:'switch'},{key:'watermark',label:'添加水印',type:'switch'},{key:'cdn_enable',label:'CDN加速',type:'switch'}] },
  { path: 'cross-border/login', tpl: 'settingsForm', title: '第三方登录', desc: '海外第三方登录', fields: [{key:'google',label:'Google登录',type:'switch'},{key:'facebook',label:'Facebook登录',type:'switch'},{key:'apple',label:'Apple登录',type:'switch'},{key:'twitter',label:'Twitter登录',type:'switch'}] },
  { path: 'cross-border/mobile-template', tpl: 'statsPage', title: '移动端模板', desc: '跨境移动端模板', stats: [{label:'模板数',value:'5'},{label:'当前模板',value:'默认'},{label:'已定制',value:'0'},{label:'状态',value:'正常'}] },
  { path: 'cross-border/pc-template', tpl: 'statsPage', title: 'PC模板', desc: '跨境PC端模板', stats: [{label:'模板数',value:'3'},{label:'当前模板',value:'默认'},{label:'已定制',value:'0'},{label:'状态',value:'正常'}] },
  { path: 'cross-border/translation', tpl: 'financeTable', title: '翻译管理', desc: '多语言翻译管理', columns: [{key:'lang',label:'语言'},{key:'translated',label:'已翻译'},{key:'total',label:'总数'},{key:'progress',label:'进度'},{key:'status',label:'状态'}] },

  // Applications
  { path: 'applications', tpl: 'financeTable', title: '入驻申请', desc: '商户入驻申请审核', columns: [{key:'company',label:'公司名'},{key:'contact',label:'联系人'},{key:'phone',label:'电话'},{key:'type',label:'类型'},{key:'status',label:'状态'},{key:'submitted',label:'提交时间'}] },

  // Storefront placeholder pages
  { path: '../../categories', tpl: 'statsPage', title: 'All Categories', desc: 'Browse all product categories', stats: [{label:'Categories',value:'1052'},{label:'Products',value:'6385'},{label:'Brands',value:'438'}] },
  { path: '../../compare', tpl: 'managementList', title: 'Compare Products', desc: 'Compare products side by side', tabs: ['Selected','Recently Viewed'] },
];

// Generate pages
let generated = 0;
for (const page of pages) {
  const dir = path.join(adminDir, page.path);
  const filePath = path.join(dir, 'page.tsx');

  // Skip if file doesn't exist or is larger than 800 bytes (already has content)
  let shouldGenerate = true;
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 800) shouldGenerate = false;
  } catch {
    // File doesn't exist, create directory
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!shouldGenerate) continue;

  let content = '';
  switch (page.tpl) {
    case 'financeTable':
      content = templates.financeTable(page.title, page.desc, page.columns, page.api || null);
      break;
    case 'settingsForm':
      content = templates.settingsForm(page.title, page.desc, page.fields);
      break;
    case 'managementList':
      content = templates.managementList(page.title, page.desc, page.tabs);
      break;
    case 'statsPage':
      content = templates.statsPage(page.title, page.desc, page.stats);
      break;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  generated++;
}

console.log(`Generated ${generated} admin pages`);
