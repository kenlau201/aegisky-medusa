'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { currencies, Currency } from './currency'

// Default rates (same as server-side BASE_EXCHANGE_RATES)
// These MUST match what's used during SSR to prevent hydration mismatch
const DEFAULT_RATES: Record<string, number> = {
  RUB: 1,
  USD: 0.011,
  EUR: 0.010,
  CNY: 0.079,
  JPY: 1.65,
  GBP: 0.0086,
  PLN: 0.045,
  AED: 0.040,
  HKD: 0.086,
  PKR: 3.10,
  IDR: 175,
  KZT: 5.20,
  DKK: 0.076,
  RSD: 1.18,
}

interface CurrencyContextType {
  currency: Currency
  setCurrency: (code: string) => void
  format: (priceInRub: number) => string
  convert: (amount: number, fromCurrency?: string) => number
  currencyCode: string
  mounted: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Start with USD and default rates to EXACTLY match server render
  const [currencyCode, setCurrencyCode] = useState<string>('USD')
  const [rates, setRates] = useState<Record<string, number>>({ ...DEFAULT_RATES })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark as mounted first - this triggers a re-render with client-side values
    setMounted(true)

    // Load saved currency preference
    try {
      const saved = localStorage.getItem('aegisky-currency')
      if (saved && currencies.find(c => c.code === saved)) {
        setCurrencyCode(saved)
      } else {
        // Auto-detect from browser language
        const lang = navigator.language || 'en'
        if (lang.startsWith('zh')) setCurrencyCode('CNY')
        else if (lang.startsWith('ja')) setCurrencyCode('JPY')
        else if (lang.startsWith('ru')) setCurrencyCode('RUB')
        else if (lang.startsWith('de')) setCurrencyCode('EUR')
        else if (lang.startsWith('pl')) setCurrencyCode('PLN')
        else if (lang.startsWith('ar')) setCurrencyCode('AED')
        else if (lang.startsWith('ur')) setCurrencyCode('PKR')
        else if (lang.startsWith('id')) setCurrencyCode('IDR')
        else if (lang.startsWith('kk')) setCurrencyCode('KZT')
        else if (lang.startsWith('da')) setCurrencyCode('DKK')
        else if (lang.startsWith('sr')) setCurrencyCode('RSD')
        else if (lang.startsWith('fr') || lang.startsWith('it') || lang.startsWith('es')) setCurrencyCode('EUR')
        else if (lang.startsWith('en-GB')) setCurrencyCode('GBP')
        else setCurrencyCode('USD')
      }
    } catch (e) {
      // localStorage not available, keep USD
    }

    // Fetch live exchange rates
    fetch('https://open.er-api.com/v6/latest/RUB')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.rates) {
          setRates({
            RUB: 1,
            USD: data.rates.USD || DEFAULT_RATES.USD,
            EUR: data.rates.EUR || DEFAULT_RATES.EUR,
            CNY: data.rates.CNY || DEFAULT_RATES.CNY,
            JPY: data.rates.JPY || DEFAULT_RATES.JPY,
            GBP: data.rates.GBP || DEFAULT_RATES.GBP,
            PLN: data.rates.PLN || DEFAULT_RATES.PLN,
            AED: data.rates.AED || DEFAULT_RATES.AED,
            HKD: data.rates.HKD || DEFAULT_RATES.HKD,
            PKR: data.rates.PKR || DEFAULT_RATES.PKR,
            IDR: data.rates.IDR || DEFAULT_RATES.IDR,
            KZT: data.rates.KZT || DEFAULT_RATES.KZT,
            DKK: data.rates.DKK || DEFAULT_RATES.DKK,
            RSD: data.rates.RSD || DEFAULT_RATES.RSD,
          })
        }
      })
      .catch(() => {
        // Keep default rates on failure
      })
  }, [])

  const setCurrency = useCallback((code: string) => {
    setCurrencyCode(code)
    try {
      localStorage.setItem('aegisky-currency', code)
    } catch (e) {
      // Ignore storage errors
    }
  }, [])

  // Before mount: always use USD + default rates to match server
  // After mount: use user-selected currency + live rates
  const activeCode = mounted ? currencyCode : 'USD'
  const activeRates = mounted ? rates : DEFAULT_RATES
  const currency = currencies.find(c => c.code === activeCode) || currencies[0]

  const format = useCallback((priceInRub: number): string => {
    const rate = activeRates[activeCode] || DEFAULT_RATES.USD
    const converted = priceInRub * rate
    const currency = currencies.find(c => c.code === activeCode) || currencies[0]

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(converted)

    if (currency.symbolPosition === 'before') {
      return `${currency.symbol}${formatted}`
    }
    return `${formatted} ${currency.symbol}`
  }, [activeCode, activeRates])

  const convert = useCallback((amount: number, fromCurrency: string = 'RUB'): number => {
    const fromRate = activeRates[fromCurrency] || 1
    const toRate = activeRates[activeCode] || 1
    return (amount / fromRate) * toRate
  }, [activeCode, activeRates])

  const value = useMemo(() => ({
    currency, setCurrency, format, convert, currencyCode: activeCode, mounted
  }), [currency, setCurrency, format, convert, activeCode, mounted])

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
