'use client'

import React, { useState } from 'react'

// 多语言词典
const LOCALE_DICTIONARY = {
  en: {
    title: 'End-User Statement (EUS) Certification Framework',
    subtitle: 'Programmatic international trade embargo filtering system operating on first-principles verification.',
    company: 'Buyer Corporate Legal Name (Verified)',
    country: 'Destination Country Alpha-2 ISO Code',
    statement: 'Legal End-Use Affirmation & Anti-Diversion Statement Clause',
    submit: 'Execute Digital Legal Endorsement',
    companyPlaceholder: 'e.g. NATO Procurement Agency Eastern Division Sp. z o.o.',
    countryPlaceholder: 'e.g. PL, UA, DE',
    statementPlaceholder: 'The importing enterprise officially declares under penalty of international law that the requested avionics payloads will be solely integrated for lawful defensive reconnaissance, strictly prohibiting illicit uncertified routing.',
    sanctionedNotice: 'Sanctioned countries (RU/IR/KP/SY/CU/VE) will be automatically rejected.',
  },
  uk: {
    title: 'Сертифікація заяви кінцевого користувача (EUS)',
    subtitle: 'Система програмної фільтрації міжнародних торгових ембарго на основі перевірки перших принципів.',
    company: 'Юридична назва компанії-покупця (Перевірено)',
    country: 'Код країни призначення (ISO Alpha-2)',
    statement: 'Юридична заява про кінцеве використання та нерозповсюдження',
    submit: 'Виконати цифрове завірення',
    companyPlaceholder: 'напр. Державне підприємство "Антонов"',
    countryPlaceholder: 'напр. UA, PL, DE',
    statementPlaceholder: 'Підприємство-імпортер офіційно заявляє під страхом міжнародного права, що запитувані авіаційні вантажі будуть використовуватися виключно для законних оборонних цілей.',
    sanctionedNotice: 'Санкційні країни (RU/IR/KP/SY/CU/VE) будуть автоматично відхилені.',
  },
  pl: {
    title: 'Certyfikacja Oświadczenia Końcowego Użytkownika (EUS)',
    subtitle: 'Programowy system filtrowania embargo handlowego działający na zasadzie weryfikacji pierwszych zasad.',
    company: 'Prawna Nazwa Firmy Kupującej (Zweryfikowana)',
    country: 'Kod ISO Kraju Docelowego (Alpha-2)',
    statement: 'Prawne Oświadczenie o Przeznaczeniu i Zakazie Reeksportu',
    submit: 'Podpisz Cyfrowo i Prześlij',
    companyPlaceholder: 'np. Polska Grupa Zbrojeniowa S.A.',
    countryPlaceholder: 'np. PL, DE, UA',
    statementPlaceholder: 'Przedsiębiorstwo importujące oficjalnie oświadcza pod groźbą kary prawa międzynarodowego, że zamawiane ładunki awioniczne będą wykorzystywane wyłącznie do legalnych celów obronnych.',
    sanctionedNotice: 'Kraje objęte sankcjami (RU/IR/KP/SY/CU/VE) zostaną automatycznie odrzucone.',
  },
  de: {
    title: 'Endnutzererklärung (EUS) Zertifizierung',
    subtitle: 'Programmatisches Embargo-Filtersystem basierend auf First-Principles-Verifikation.',
    company: 'Rechtlicher Name des kaufenden Unternehmens (Verifiziert)',
    country: 'Zielland ISO Alpha-2 Code',
    statement: 'Rechtliche Endverbleibserklärung & Anti-Umleitungs-Erklärung',
    submit: 'Digitale Rechtliche Bestätigung Ausführen',
    companyPlaceholder: 'z.B. Rheinmetall Defence GmbH',
    countryPlaceholder: 'z.B. DE, PL, UA',
    statementPlaceholder: 'Das importierende Unternehmen erklärt offiziell unter Strafe des internationalen Rechts, dass die angeforderten Avionik-Ladungen ausschließlich für rechtmäßige Verteidigungszwecke integriert werden.',
    sanctionedNotice: 'Sanktionsländer (RU/IR/KP/SY/CU/VE) werden automatisch abgelehnt.',
  },
}

type LanguageKey = keyof typeof LOCALE_DICTIONARY

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

export default function ComplianceForm() {
  const [activeLang, setActiveLang] = useState<LanguageKey>('en')
  const [corporateName, setCorporateName] = useState('')
  const [targetIso, setTargetIso] = useState('')
  const [legalBody, setLegalBody] = useState('')
  const [networkBanner, setNetworkBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const t = LOCALE_DICTIONARY[activeLang]

  const processFormSubmission = async (event: React.FormEvent) => {
    event.preventDefault()
    setNetworkBanner(null)
    setLoading(true)

    try {
      const apiResponse = await fetch('/api/control-tower/compliance/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AEGISKY-TENANT-ID': TENANT_ID,
        },
        body: JSON.stringify({
          buyer_company_name: corporateName,
          target_country: targetIso.toUpperCase().trim(),
          end_user_statement: legalBody,
        }),
      })

      const responsePayload = await apiResponse.json()

      if (apiResponse.status === 202) {
        setNetworkBanner({
          type: 'success',
          message: `✓ SYSTEM COMPLIANCE PASS: Audit tracking hash deployed -> ${responsePayload.audit_id?.substring(0, 8)}... | Risk: ${responsePayload.risk_level}`,
        })
      } else {
        setNetworkBanner({
          type: 'error',
          message: `✕ SYSTEM REGULATORY BLOCK: ${responsePayload.message || responsePayload.error}`,
        })
      }
    } catch {
      setNetworkBanner({ type: 'error', message: '✕ SYSTEM EXCEPTION: Edge gateway connection fallback.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 语言切换 */}
      <div className="flex bg-[#2C2C2E] p-1 rounded-xl w-fit border border-[#3A3A3C]">
        {(Object.keys(LOCALE_DICTIONARY) as LanguageKey[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeLang === lang ? 'bg-[#0071E3] text-white shadow-md' : 'text-[#86868B] hover:text-white'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <form onSubmit={processFormSubmission} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[#86868B] mb-2">{t.company}</label>
          <input
            type="text"
            value={corporateName}
            onChange={(e) => setCorporateName(e.target.value)}
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0071E3] transition-colors font-mono"
            placeholder={t.companyPlaceholder}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#86868B] mb-2">{t.country}</label>
          <input
            type="text"
            maxLength={2}
            value={targetIso}
            onChange={(e) => setTargetIso(e.target.value)}
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0071E3] transition-colors font-mono uppercase"
            placeholder={t.countryPlaceholder}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#86868B] mb-2">{t.statement}</label>
          <textarea
            value={legalBody}
            onChange={(e) => setLegalBody(e.target.value)}
            rows={5}
            className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0071E3] transition-colors font-mono leading-relaxed resize-none"
            placeholder={t.statementPlaceholder}
            required
          />
        </div>

        <div className="text-[10px] text-[#FF9F0A] bg-[#2C2C2E] px-3 py-2 rounded-lg border border-[#3A3A3C]">
          ⚠ {t.sanctionedNotice}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0071E3] hover:bg-[#147CE5] disabled:opacity-50 text-white font-medium text-xs py-3 px-4 rounded-xl transition-all duration-200 transform active:scale-[0.99] shadow-lg shadow-[#0071E3]/20"
        >
          {loading ? 'PROCESSING...' : t.submit}
        </button>
      </form>

      {networkBanner && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono transition-all duration-300 animate-fadeIn whitespace-pre-wrap break-all ${
            networkBanner.type === 'success'
              ? 'bg-[#1C3D22] border-[#30D158] text-[#30D158]'
              : 'bg-[#3A1C1C] border-[#FF453A] text-[#FF453A]'
          }`}
        >
          {networkBanner.message}
        </div>
      )}
    </div>
  )
}
