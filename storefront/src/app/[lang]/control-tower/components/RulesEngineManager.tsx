'use client'

import React, { useState, useEffect } from 'react'

interface ComplianceRule {
  id: string
  rule_code: string
  rule_name: string
  rule_description: string
  rule_category: string
  severity: string
  conditions: any
  action: string
  action_message: string
  is_active: boolean
  priority: number
  version: number
}

const CATEGORY_LABELS: Record<string, string> = {
  SANCTIONS: '制裁筛查',
  EMBARGO: '禁运管制',
  LICENSE: '许可证要求',
  RED_FLAG: '红旗指标',
  END_USE: '最终用途',
}

const SEVERITY_COLORS: Record<string, string> = {
  BLOCK: 'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/30',
  REJECT: 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/30',
  REVIEW: 'bg-[#FFD60A]/20 text-[#FFD60A] border-[#FFD60A]/30',
  WARNING: 'bg-[#0071E3]/20 text-[#0071E3] border-[#0071E3]/30',
  INFO: 'bg-[#86868B]/20 text-[#86868B] border-[#86868B]/30',
}

const ACTION_LABELS: Record<string, string> = {
  BLOCK_TRANSACTION: '🚫 拦截交易',
  REQUIRE_LICENSE: '📜 要求许可证',
  REQUIRE_REVIEW: '👁️ 人工复核',
  REQUIRE_EUS: '📋 要求EUS',
  LOG_ALERT: '🔔 记录警报',
}

export default function RulesEngineManager() {
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [testForm, setTestForm] = useState({
    buyer_company_name: '',
    destination_country: '',
    eccn_code: '',
    quantity: 1,
    end_use_statement: '',
    has_eus: false,
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/control-tower/rules', {
        headers: { 'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d' }
      })
      const data = await res.json()
      setRules(data.rules || [])
    } catch (e) {
      console.error('Failed to fetch rules:', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleRule = async (rule: ComplianceRule) => {
    try {
      await fetch(`/api/control-tower/rules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
        },
        body: JSON.stringify({ ...rule, is_active: !rule.is_active })
      })
      fetchRules()
    } catch (e) {
      console.error('Failed to toggle rule:', e)
    }
  }

  const runRuleTest = async () => {
    try {
      const res = await fetch('/api/control-tower/rules/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
        },
        body: JSON.stringify(testForm)
      })
      const data = await res.json()
      setTestResult(data)
    } catch (e) {
      console.error('Failed to evaluate rules:', e)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-white">智能合规防火墙 - 规则引擎</h2>
        <p className="text-xs text-[#86868B] mt-1">白皮书6.1节：Compliance-as-Code 可编程规则引擎，支持动态配置、版本管理、实时评估</p>
      </div>

      {/* 规则测试沙箱 */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] p-6">
        <h3 className="text-sm font-medium text-white mb-4">🧪 规则测试沙箱</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-[#86868B] mb-1">买方公司名称</label>
            <input
              type="text"
              value={testForm.buyer_company_name}
              onChange={(e) => setTestForm({ ...testForm, buyer_company_name: e.target.value })}
              placeholder="e.g. DJI Technology"
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071E3]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#86868B] mb-1">目的国 (Alpha-2)</label>
            <input
              type="text"
              maxLength={2}
              value={testForm.destination_country}
              onChange={(e) => setTestForm({ ...testForm, destination_country: e.target.value.toUpperCase() })}
              placeholder="e.g. RU, IR, DE, PL"
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071E3] uppercase"
            />
          </div>
          <div>
            <label className="block text-xs text-[#86868B] mb-1">ECCN编码</label>
            <input
              type="text"
              value={testForm.eccn_code}
              onChange={(e) => setTestForm({ ...testForm, eccn_code: e.target.value })}
              placeholder="e.g. 9A012, EAR99"
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071E3]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#86868B] mb-1">数量</label>
            <input
              type="number"
              value={testForm.quantity}
              onChange={(e) => setTestForm({ ...testForm, quantity: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071E3]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-[#86868B] mb-1">最终用途声明</label>
            <textarea
              value={testForm.end_use_statement}
              onChange={(e) => setTestForm({ ...testForm, end_use_statement: e.target.value })}
              placeholder="e.g. For civilian mapping and surveying purposes"
              rows={2}
              className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071E3] resize-none"
            />
          </div>
        </div>
        <button
          onClick={runRuleTest}
          className="px-4 py-2 bg-[#0071E3] hover:bg-[#147CE5] text-white text-xs font-medium rounded-lg transition-all"
        >
          ▶ 运行规则评估
        </button>

        {/* 测试结果 */}
        {testResult && (
          <div className="mt-4 p-4 bg-[#0A0A0A] rounded-lg border border-[#2D2D2E]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white">评估结果</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                testResult.overall_status === 'BLOCKED' ? 'bg-[#FF453A]/20 text-[#FF453A]' :
                testResult.overall_status === 'PENDING_REVIEW' ? 'bg-[#FFD60A]/20 text-[#FFD60A]' :
                testResult.overall_status === 'APPROVED' ? 'bg-[#30D158]/20 text-[#30D158]' :
                'bg-[#FF9F0A]/20 text-[#FF9F0A]'
              }`}>
                {testResult.overall_status}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-3 text-center">
              <div className="bg-[#1C1C1E] rounded p-2">
                <div className="text-lg font-bold text-white">{testResult.rules_evaluated}</div>
                <div className="text-[10px] text-[#86868B]">评估规则数</div>
              </div>
              <div className="bg-[#1C1C1E] rounded p-2">
                <div className="text-lg font-bold text-[#FF9F0A]">{testResult.rules_matched}</div>
                <div className="text-[10px] text-[#86868B]">命中规则</div>
              </div>
              <div className="bg-[#1C1C1E] rounded p-2">
                <div className="text-lg font-bold text-[#FF453A]">{testResult.risk_score}</div>
                <div className="text-[10px] text-[#86868B]">风险评分</div>
              </div>
              <div className="bg-[#1C1C1E] rounded p-2">
                <div className="text-lg font-bold text-[#30D158]">{testResult.should_block ? 'NO' : 'YES'}</div>
                <div className="text-[10px] text-[#86868B]">是否放行</div>
              </div>
            </div>
            {testResult.alerts?.length > 0 && (
              <div className="space-y-1">
                {testResult.alerts.map((alert: any, i: number) => (
                  <div key={i} className={`text-xs p-2 rounded border ${SEVERITY_COLORS[alert.level] || SEVERITY_COLORS.INFO}`}>
                    <span className="font-medium">[{alert.level}]</span> {alert.message}
                    {alert.details && <span className="opacity-70 ml-2">— {alert.details}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 规则列表 */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2D2D2E]">
          <h3 className="text-sm font-medium text-white">已配置规则 ({rules.length})</h3>
        </div>
        <div className="divide-y divide-[#2D2D2E]">
          {loading ? (
            <div className="px-6 py-8 text-center text-[#86868B] text-xs">加载中...</div>
          ) : rules.length === 0 ? (
            <div className="px-6 py-8 text-center text-[#86868B] text-xs">暂无规则</div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className={`px-6 py-4 hover:bg-[#2C2C2E]/30 transition-colors cursor-pointer ${
                  !rule.is_active ? 'opacity-50' : ''
                }`}
                onClick={() => setSelectedRule(selectedRule?.id === rule.id ? null : rule)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${SEVERITY_COLORS[rule.severity]}`}>
                      {rule.severity}
                    </span>
                    <span className="text-xs text-[#86868B] font-mono">{rule.rule_code}</span>
                    <span className="text-sm text-white">{rule.rule_name}</span>
                    <span className="text-[10px] text-[#86868B] bg-[#2C2C2E] px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[rule.rule_category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#86868B]">v{rule.version}</span>
                    <span className="text-[10px] text-[#86868B]">优先级: {rule.priority}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleRule(rule); }}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                        rule.is_active
                          ? 'bg-[#30D158]/20 text-[#30D158]'
                          : 'bg-[#3A3A3C] text-[#86868B]'
                      }`}
                    >
                      {rule.is_active ? '● 启用' : '○ 禁用'}
                    </button>
                  </div>
                </div>

                {selectedRule?.id === rule.id && (
                  <div className="mt-4 pl-4 border-l-2 border-[#0071E3] space-y-3">
                    <p className="text-xs text-[#86868B]">{rule.rule_description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#86868B]">动作：</span>
                        <span className="text-white">{ACTION_LABELS[rule.action] || rule.action}</span>
                      </div>
                      <div>
                        <span className="text-[#86868B]">消息：</span>
                        <span className="text-[#FF9F0A] font-mono text-[10px]">{rule.action_message}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[#86868B] text-xs">条件配置：</span>
                      <pre className="mt-1 bg-[#0A0A0A] p-3 rounded-lg text-[10px] text-[#30D158] font-mono overflow-x-auto">
                        {JSON.stringify(rule.conditions, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
