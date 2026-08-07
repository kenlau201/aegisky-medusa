'use client'

import React, { useState } from 'react'
import ComplianceForm from './components/ComplianceForm'
import InventoryRouter from './components/InventoryRouter'
import DashboardStats from './components/DashboardStats'
import WarehouseStatus from './components/WarehouseStatus'
import TransactionsWorkbench from './components/TransactionsWorkbench'
import AlertsPanel from './components/AlertsPanel'
import NewTransactionForm from './components/NewTransactionForm'
import LicensesManager from './components/LicensesManager'
import ScreeningTool from './components/ScreeningTool'
import EUSManager from './components/EUSManager'
import ClassificationManager from './components/ClassificationManager'
import ReportsCenter from './components/ReportsCenter'
import TechnicalSpecsMatrix from './components/TechnicalSpecsMatrix'
import RulesEngineManager from './components/RulesEngineManager'

type Tab = 'dashboard' | 'new-transaction' | 'workbench' | 'compliance' | 'routing' | 'warehouses' | 'licenses' | 'screening' | 'eus' | 'classifications' | 'reports' | 'tech-specs' | 'rules-engine'

export default function ControlTowerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'new-transaction', label: 'New Declaration', icon: '📝' },
    { id: 'workbench', label: 'Compliance Workbench', icon: '⚖️' },
    { id: 'rules-engine', label: 'Rules Engine', icon: '⚙️' },
    { id: 'licenses', label: 'Licenses', icon: '📜' },
    { id: 'classifications', label: 'ECCN Classification', icon: '🏷️' },
    { id: 'tech-specs', label: 'Technical Specs', icon: '🔧' },
    { id: 'screening', label: 'Denied Party Screening', icon: '🔍' },
    { id: 'eus', label: 'End User Statements', icon: '📋' },
    { id: 'routing', label: 'Cargo Routing', icon: '🚚' },
    { id: 'warehouses', label: 'Warehouses', icon: '🏭' },
    { id: 'reports', label: 'Reports', icon: '📑' },
  ]

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7]">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 border-b border-[#2D2D2E] bg-black/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold tracking-[0.2em] bg-gradient-to-r from-white via-[#E5E5EA] to-[#86868B] bg-clip-text text-transparent">
              AEGISKY INDUSTRIAL CONTROL TOWER
            </span>
            <span className="text-[10px] text-[#86868B] font-mono">v4.0 · COMPLIANCE-AS-CODE SUITE</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
              <span className="text-[#30D158] font-mono">SYSTEM NOMINAL</span>
            </div>
            <div className="h-3 w-[1px] bg-[#2D2D2E]" />
            <span className="text-[#86868B] font-mono">TENANT: 4a8b9c1d...</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8 animate-fadeIn">
        {/* 标题区 */}
        <div>
          <h1 className="text-4xl font-normal tracking-tight sm:text-5xl text-white">
            Supply control tower.{' '}
            <span className="text-[#86868B]">Export compliance by design.</span>
          </h1>
          <p className="max-w-3xl text-sm text-[#86868B] leading-relaxed mt-3">
            Operational matrix platform for global UAV manufacturers and licensed distributors.
            Compliant with EU Dual-Use Regulation 2021/821, US EAR, and Wassenaar Arrangement.
            Multi-tenant isolation, automated sanctions screening, risk-based approval workflow,
            and immutable audit trail.
          </p>
        </div>

        {/* 标签导航 */}
        <div className="flex gap-2 border-b border-[#2D2D2E] pb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-white border-[#0071E3]'
                  : 'text-[#86868B] border-transparent hover:text-white hover:border-[#3A3A3C]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <DashboardStats key={refreshKey} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertsPanel key={`alerts-${refreshKey}`} />
              <WarehouseStatus key={`wh-${refreshKey}`} />
            </div>
            <TransactionsWorkbench key={`tx-${refreshKey}`} />
          </div>
        )}

        {/* 新交易申报 */}
        {activeTab === 'new-transaction' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NewTransactionForm onCreated={() => setRefreshKey((k) => k + 1)} />
            </div>
            <div className="space-y-6">
              <AlertsPanel key={`alerts-nt-${refreshKey}`} />
              <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6">
                <h4 className="text-sm font-medium text-white mb-3">📋 Compliance Checklist</h4>
                <ul className="space-y-2 text-xs text-[#86868B]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D158]">✓</span>
                    <span>Sanctions screening (OFAC/EU/UN lists)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D158]">✓</span>
                    <span>End-user / end-use verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D158]">✓</span>
                    <span>ECCN classification check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D158]">✓</span>
                    <span>Diversion risk assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D158]">✓</span>
                    <span>License requirement determination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#30D158]">✓</span>
                    <span>Immutable audit logging</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 合规工作台 */}
        {activeTab === 'workbench' && (
          <div className="space-y-6">
            <AlertsPanel key={`alerts-wb-${refreshKey}`} />
            <TransactionsWorkbench key={`tx-wb-${refreshKey}`} />
          </div>
        )}

        {/* EUS网关 */}
        {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-8 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-white mb-1">Dual-Use Policy Endorsement</h2>
                <p className="text-xs text-[#86868B]">
                  Programmatic international trade embargo filtering system.
                  Supports EN/UK/PL/DE locales.
                </p>
              </div>
              <ComplianceForm />
            </div>
            <div className="space-y-6">
              <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6">
                <h4 className="text-sm font-medium text-white mb-3">🚫 Comprehensive Embargo</h4>
                <div className="flex flex-wrap gap-2">
                  {['RU', 'IR', 'KP', 'SY', 'CU', 'VE', 'BY', 'MM', 'SD', 'LY'].map((c) => (
                    <span key={c} className="px-2 py-1 bg-[#3A1C1C] text-[#FF453A] text-[10px] font-mono rounded border border-[#FF453A]">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-[#86868B] mt-3">
                  Shipments to these jurisdictions are automatically blocked.
                </p>
              </div>
              <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6">
                <h4 className="text-sm font-medium text-white mb-3">⚠️ Enhanced Due Diligence</h4>
                <div className="flex flex-wrap gap-2">
                  {['HK', 'AE', 'TR', 'CY', 'PA', 'KY'].map((c) => (
                    <span key={c} className="px-2 py-1 bg-[#3A2E1C] text-[#FF9F0A] text-[10px] font-mono rounded border border-[#FF9F0A]">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-[#86868B] mt-3">
                  High-risk transshipment jurisdictions require enhanced review.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 货物路由 */}
        {activeTab === 'routing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-8 shadow-2xl">
              <InventoryRouter />
            </div>
            <WarehouseStatus />
          </div>
        )}

        {/* 仓库网络 */}
        {activeTab === 'warehouses' && (
          <div className="space-y-6">
            <WarehouseStatus />
            <div className="bg-[#1C1C1E] rounded-2xl border border-[#2D2D2E] p-6">
              <h3 className="text-lg font-medium text-white mb-4">Global Fulfillment Network</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { code: 'Poland_Central', name: '波兰中心仓', country: 'PL', zone: 'Eastern Europe', sla: '2-3 days', cover: 'EU East, CIS' },
                  { code: 'Germany_North', name: '德国北部仓', country: 'DE', zone: 'Western Europe', sla: '1-2 days', cover: 'EU West, UK' },
                  { code: 'UAE_Freezone', name: '阿联酋自由港', country: 'AE', zone: 'Middle East', sla: '3-5 days', cover: 'MENA, Africa' },
                  { code: 'Singapore_Hub', name: '新加坡枢纽', country: 'SG', zone: 'Asia Pacific', sla: '4-6 days', cover: 'APAC, Oceania' },
                  { code: 'US_West', name: '美西仓', country: 'US', zone: 'Americas', sla: '5-8 days', cover: 'North/South America' },
                ].map((wh) => (
                  <div key={wh.code} className="bg-[#2C2C2E] rounded-xl p-4 border border-[#3A3A3C]">
                    <div className="text-2xl mb-2">
                      {wh.country === 'PL' ? '🇵🇱' : wh.country === 'DE' ? '🇩🇪' : wh.country === 'AE' ? '🇦🇪' : wh.country === 'SG' ? '🇸🇬' : '🇺🇸'}
                    </div>
                    <div className="text-sm font-medium text-white">{wh.name}</div>
                    <div className="text-[10px] text-[#86868B] font-mono mt-1">{wh.code}</div>
                    <div className="mt-3 space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-[#86868B]">Zone:</span>
                        <span className="text-white">{wh.zone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#86868B]">SLA:</span>
                        <span className="text-[#30D158]">{wh.sla}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#86868B]">Covers:</span>
                        <span className="text-white text-right">{wh.cover}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 许可证管理 */}
        {activeTab === 'licenses' && <LicensesManager />}

        {/* ECCN分类管理 */}
        {activeTab === 'classifications' && <ClassificationManager />}

        {/* 被拒绝方筛查 */}
        {activeTab === 'screening' && <ScreeningTool />}

        {/* 最终用户声明 */}
        {activeTab === 'eus' && <EUSManager />}

        {/* 合规报告 */}
        {activeTab === 'reports' && <ReportsCenter />}

        {/* 规则引擎 */}
        {activeTab === 'rules-engine' && <RulesEngineManager />}

        {/* 技术参数矩阵 */}
        {activeTab === 'tech-specs' && <TechnicalSpecsMatrix />}

        {/* 底部 */}
        <div className="pt-8 border-t border-[#2D2D2E]">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] text-[#86868B] font-mono">
            <div className="flex items-center gap-6">
              <span>ENCRYPTION: AES-256</span>
              <span>AUDIT: SHA-256 CHAINED</span>
              <span>COMPLIANCE: EU 2021/821 · US EAR · WASSENAAR</span>
            </div>
            <div>© 2026 Aegisky Industrial · Dual-Use Trade Compliance Platform v4.0</div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  )
}
