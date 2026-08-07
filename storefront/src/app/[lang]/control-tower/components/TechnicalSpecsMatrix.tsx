'use client'

import React, { useState, useEffect } from 'react'

interface TechnicalSpec {
  id: string
  sku: string
  category: string
  mtbf_hours: number | null
  frequency_hopping: boolean
  anti_emi_grade: string | null
  max_thrust_g: number | null
  ingress_protection: string | null
  working_temp_min_c: number | null
  working_temp_max_c: number | null
  power_consumption_w: number | null
  weight_g: number | null
  dimensions_mm: string | null
  operating_voltage_v: string | null
  data_interface: string | null
  certification_standards: string[]
  cad_step_url: string | null
  cad_obj_url: string | null
  preview_3d: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  BLDC_MOTOR: '无刷电机',
  FLIGHT_CTRL: '飞控系统',
  FPV_V_TX: '图传发射',
  ESC: '电调',
  PROPELLER: '螺旋桨',
  GPS_MODULE: 'GPS模块',
  BATTERY: '电池',
  CAMERA: '相机',
  GIMBAL: '云台',
  RADIO: '遥控接收机',
}

const EMI_GRADES = ['MIL-STD-461G', 'MIL-STD-810G', 'CE Class A', 'CE Class B', 'FCC Class A', 'FCC Class B', 'IC']
const IP_RATINGS = ['IP54', 'IP55', 'IP56', 'IP65', 'IP66', 'IP67', 'IP68']

export default function TechnicalSpecsMatrix() {
  const [specs, setSpecs] = useState<TechnicalSpec[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchSpecs()
  }, [])

  const fetchSpecs = async () => {
    try {
      const res = await fetch('/api/control-tower/technical-specs', {
        headers: { 'X-AEGISKY-TENANT-ID': '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d' }
      })
      const data = await res.json()
      setSpecs(data.specs || [])
    } catch (e) {
      console.error('Failed to fetch specs:', e)
    } finally {
      setLoading(false)
    }
  }

  const filteredSpecs = filterCategory
    ? specs.filter(s => s.category === filterCategory)
    : specs

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">工业级技术参数矩阵</h2>
          <p className="text-xs text-[#86868B] mt-1">白皮书6.2节：无人机配件工业级参数管理（MTBF/EMI/IP防护/温度范围/CAD模型）</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#0071E3] hover:bg-[#147CE5] text-white text-xs font-medium rounded-lg transition-all"
        >
          + 添加参数
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
            !filterCategory ? 'bg-[#0071E3] text-white' : 'bg-[#2C2C2E] text-[#86868B] hover:text-white'
          }`}
        >
          全部 ({specs.length})
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const count = specs.filter(s => s.category === key).length
          if (count === 0) return null
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                filterCategory === key ? 'bg-[#0071E3] text-white' : 'bg-[#2C2C2E] text-[#86868B] hover:text-white'
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* 参数表格 */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2D2D2E] bg-[#2C2C2E]">
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">分类</th>
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">MTBF(小时)</th>
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">抗EMI等级</th>
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">最大推力</th>
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">IP防护</th>
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">工作温度</th>
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">认证</th>
                <th className="px-4 py-3 text-left font-medium text-[#86868B]">3D模型</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-[#86868B]">加载中...</td></tr>
              ) : filteredSpecs.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-[#86868B]">暂无数据</td></tr>
              ) : (
                filteredSpecs.map((spec) => (
                  <tr key={spec.id} className="border-b border-[#2D2D2E] hover:bg-[#2C2C2E]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-white">{spec.sku}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#3A3A3C] rounded text-[#E5E5EA]">
                        {CATEGORY_LABELS[spec.category] || spec.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#E5E5EA]">{spec.mtf_hours || '-'}</td>
                    <td className="px-4 py-3">
                      {spec.anti_emi_grade ? (
                        <span className="px-2 py-0.5 bg-[#1C3D22] text-[#30D158] rounded text-[10px]">
                          {spec.anti_emi_grade}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-[#E5E5EA]">{spec.max_thrust_g ? `${spec.max_thrust_g}g` : '-'}</td>
                    <td className="px-4 py-3">
                      {spec.ingress_protection ? (
                        <span className="px-2 py-0.5 bg-[#1C3D22] text-[#30D158] rounded text-[10px]">
                          {spec.ingress_protection}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-[#E5E5EA]">
                      {spec.working_temp_min_c !== null && spec.working_temp_max_c !== null
                        ? `${spec.working_temp_min_c}°C ~ ${spec.working_temp_max_c}°C`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(spec.certification_standards || []).slice(0, 3).map((cert, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-[#0071E3]/20 text-[#0071E3] rounded text-[10px]">
                            {cert}
                          </span>
                        ))}
                        {(spec.certification_standards || []).length > 3 && (
                          <span className="text-[#86868B] text-[10px]">+{(spec.certification_standards || []).length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {spec.preview_3d ? (
                        <span className="text-[#30D158]">✓ STEP/OBJ</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 字段说明 */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#2D2D2E] p-6">
        <h3 className="text-sm font-medium text-white mb-4">技术参数字段说明</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          {[
            ['mtbf_hours', '平均无故障工作时间（小时）'],
            ['frequency_hopping', '是否支持跳频抗干扰'],
            ['anti_emi_grade', '电磁兼容等级（军标/CE/FCC）'],
            ['max_thrust_g', '最大推力（克）- 电机参数'],
            ['ingress_protection', '防尘防水等级（IP54-IP68）'],
            ['working_temp_celsius', '工作温度范围（-40°C ~ 85°C）'],
            ['power_consumption_w', '功耗（瓦）'],
            ['operating_voltage_v', '工作电压范围'],
            ['certification_standards', '认证标准（CE/FCC/RoHS/军标）'],
            ['cad_step/obj_url', '工业级CAD模型（STEP/OBJ格式）'],
            ['preview_3d', '浏览器3D预览支持'],
            ['data_interface', '数据接口（UART/I2C/CAN/PWM）'],
          ].map(([field, desc]) => (
            <div key={field} className="flex items-start gap-2">
              <code className="text-[#0071E3] bg-[#0071E3]/10 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{field}</code>
              <span className="text-[#86868B]">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
