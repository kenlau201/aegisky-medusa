'use client'

import { ShieldCheck, AlertTriangle, XCircle, Info, Lock } from 'lucide-react'
import { screenTransaction, classifyProduct, getComplianceBadge, ComplianceResult } from '@/lib/compliance'
import type { Product } from '@/lib/data'
import { LanguageCode } from '@/i18n'

interface ComplianceBannerProps {
  product?: Product
  destinationCountry?: string
  endUse?: string
  endUser?: string
  lang?: LanguageCode
  variant?: 'inline' | 'card'
}

export function ComplianceBadge({ eccnCode, lang = 'en' }: { eccnCode: string; lang?: LanguageCode }) {
  const badge = getComplianceBadge(eccnCode)
  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${colorClasses[badge.color as keyof typeof colorClasses]}`}>
      <Lock size={10} />
      ECCN: {badge.label}
    </span>
  )
}

export default function ComplianceBanner({
  product,
  destinationCountry,
  endUse,
  endUser,
  lang = 'en',
  variant = 'card',
}: ComplianceBannerProps) {
  if (!product || !destinationCountry) return null

  const eccnCode = classifyProduct(product)
  const result: ComplianceResult = screenTransaction({
    productECCN: eccnCode,
    destinationCountry,
    endUse,
    endUser,
  })

  if (result.allowed && !result.requiresLicense && result.warnings.length === 0) {
    return (
      <div className={`flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 ${variant === 'inline' ? 'text-sm' : ''}`}>
        <ShieldCheck className="text-green-600 flex-shrink-0 mt-0.5" size={variant === 'inline' ? 16 : 20} />
        <div>
          <div className="font-medium text-green-800">
            {lang === 'ru' ? 'Соответствие экспортному контролю' : lang === 'zh' ? '出口管制合规' : 'Export Compliance Clear'}
          </div>
          <div className="text-green-700 text-sm">
            {lang === 'ru' ? `ECCN ${eccnCode} — лицензия не требуется для ${destinationCountry}` : lang === 'zh' ? `ECCN ${eccnCode} — 出口至${destinationCountry}无需许可` : `ECCN ${eccnCode} — No license required for ${destinationCountry}`}
          </div>
        </div>
      </div>
    )
  }

  if (!result.allowed) {
    return (
      <div className={`flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 ${variant === 'inline' ? 'text-sm' : ''}`}>
        <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={variant === 'inline' ? 16 : 20} />
        <div>
          <div className="font-medium text-red-800 mb-1">
            {lang === 'ru' ? 'Экспорт запрещён' : lang === 'zh' ? '出口受限' : 'Export Restricted'}
          </div>
          {result.restrictions.map((r, i) => (
            <div key={i} className="text-red-700 text-sm">{r}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200 ${variant === 'inline' ? 'text-sm' : ''}`}>
      <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={variant === 'inline' ? 16 : 20} />
      <div>
        <div className="font-medium text-yellow-800 mb-1">
          {lang === 'ru' ? 'Требуется проверка соответствия' : lang === 'zh' ? '需要合规审查' : 'Compliance Review Required'}
        </div>
        {result.warnings.map((w, i) => (
          <div key={i} className="text-yellow-700 text-sm">{w}</div>
        ))}
        <div className="text-yellow-600 text-xs mt-2 flex items-center gap-1">
          <Info size={12} />
          {lang === 'ru' ? 'Наша команда свяжется с вами для оформления лицензии' : lang === 'zh' ? '我们的团队将联系您办理许可证' : 'Our compliance team will contact you for license processing'}
        </div>
      </div>
    </div>
  )
}
