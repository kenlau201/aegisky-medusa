/**
 * Aegisky - 多货币引擎
 * 支持多币种切换、汇率换算、地区定价
 */

export interface Currency {
  code: string
  symbol: string
  name: string
  nameEn: string
  flag: string
  decimals: number
  symbolPosition: 'before' | 'after'
}

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: '美元', nameEn: 'US Dollar', flag: '🇺🇸', decimals: 2, symbolPosition: 'before' },
  { code: 'EUR', symbol: '€', name: '欧元', nameEn: 'Euro', flag: '🇪🇺', decimals: 2, symbolPosition: 'before' },
  { code: 'CNY', symbol: '¥', name: '人民币', nameEn: 'Chinese Yuan', flag: '🇨🇳', decimals: 2, symbolPosition: 'before' },
  { code: 'JPY', symbol: '¥', name: '日元', nameEn: 'Japanese Yen', flag: '🇯🇵', decimals: 0, symbolPosition: 'before' },
  { code: 'GBP', symbol: '£', name: '英镑', nameEn: 'British Pound', flag: '🇬🇧', decimals: 2, symbolPosition: 'before' },
  { code: 'RUB', symbol: '₽', name: '卢布', nameEn: 'Russian Ruble', flag: '🇷🇺', decimals: 2, symbolPosition: 'after' },
  { code: 'PLN', symbol: 'zł', name: '波兰兹罗提', nameEn: 'Polish Zloty', flag: '🇵🇱', decimals: 2, symbolPosition: 'after' },
  { code: 'AED', symbol: 'د.إ', name: '迪拉姆', nameEn: 'UAE Dirham', flag: '🇦🇪', decimals: 2, symbolPosition: 'after' },
  { code: 'HKD', symbol: 'HK$', name: '港币', nameEn: 'Hong Kong Dollar', flag: '🇭🇰', decimals: 2, symbolPosition: 'before' },
  { code: 'PKR', symbol: '₨', name: '巴基斯坦卢比', nameEn: 'Pakistani Rupee', flag: '🇵🇰', decimals: 0, symbolPosition: 'before' },
  { code: 'IDR', symbol: 'Rp', name: '印尼盾', nameEn: 'Indonesian Rupiah', flag: '🇮🇩', decimals: 0, symbolPosition: 'before' },
  { code: 'KZT', symbol: '₸', name: '哈萨克坚戈', nameEn: 'Kazakhstani Tenge', flag: '🇰🇿', decimals: 2, symbolPosition: 'after' },
  { code: 'DKK', symbol: 'kr', name: '丹麦克朗', nameEn: 'Danish Krone', flag: '🇩🇰', decimals: 2, symbolPosition: 'after' },
  { code: 'RSD', symbol: 'дин', name: '塞尔维亚第纳尔', nameEn: 'Serbian Dinar', flag: '🇷🇸', decimals: 0, symbolPosition: 'after' },
]

// 基础汇率（相对USD），生产环境应从API实时获取
// 基准货币：RUB（源站价格为卢布）
const BASE_EXCHANGE_RATES: Record<string, number> = {
  RUB: 1,
  USD: 0.011,    // 1 RUB = 0.011 USD
  EUR: 0.010,    // 1 RUB = 0.010 EUR
  CNY: 0.079,    // 1 RUB = 0.079 CNY
  JPY: 1.65,     // 1 RUB = 1.65 JPY
  GBP: 0.0086,   // 1 RUB = 0.0086 GBP
  PLN: 0.045,    // 1 RUB = 0.045 PLN
  AED: 0.040,    // 1 RUB = 0.040 AED
  HKD: 0.086,    // 1 RUB = 0.086 HKD
  PKR: 3.10,     // 1 RUB = 3.10 PKR
  IDR: 175,      // 1 RUB = 175 IDR
  KZT: 5.20,     // 1 RUB = 5.20 KZT
  DKK: 0.076,    // 1 RUB = 0.076 DKK
  RSD: 1.18,     // 1 RUB = 1.18 RSD
}

export let exchangeRates = { ...BASE_EXCHANGE_RATES }
let lastRateUpdate: Date | null = null

/**
 * 从API更新汇率（使用免费汇率API）
 */
export async function updateExchangeRates(): Promise<boolean> {
  try {
    // 使用免费的exchangerate API
    const response = await fetch('https://open.er-api.com/v6/latest/RUB')
    if (response.ok) {
      const data = await response.json()
      if (data.rates) {
        exchangeRates = {
          RUB: 1,
          USD: data.rates.USD || BASE_EXCHANGE_RATES.USD,
          EUR: data.rates.EUR || BASE_EXCHANGE_RATES.EUR,
          CNY: data.rates.CNY || BASE_EXCHANGE_RATES.CNY,
          JPY: data.rates.JPY || BASE_EXCHANGE_RATES.JPY,
          GBP: data.rates.GBP || BASE_EXCHANGE_RATES.GBP,
          PLN: data.rates.PLN || BASE_EXCHANGE_RATES.PLN,
          AED: data.rates.AED || BASE_EXCHANGE_RATES.AED,
          HKD: data.rates.HKD || BASE_EXCHANGE_RATES.HKD,
          PKR: data.rates.PKR || BASE_EXCHANGE_RATES.PKR,
          IDR: data.rates.IDR || BASE_EXCHANGE_RATES.IDR,
          KZT: data.rates.KZT || BASE_EXCHANGE_RATES.KZT,
          DKK: data.rates.DKK || BASE_EXCHANGE_RATES.DKK,
          RSD: data.rates.RSD || BASE_EXCHANGE_RATES.RSD,
        }
        lastRateUpdate = new Date()
        return true
      }
    }
  } catch (e) {
    console.log('Using fallback exchange rates')
  }
  return false
}

/**
 * 将卢布价格转换为目标货币
 */
export function convertPrice(priceInRub: number, targetCurrency: string): number {
  const rate = exchangeRates[targetCurrency] || exchangeRates.USD
  return priceInRub * rate
}

/**
 * 格式化价格显示
 */
export function formatPrice(priceInRub: number, currencyCode: string, locale: string = 'en'): string {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0]
  const converted = convertPrice(priceInRub, currencyCode)

  const localeMap: Record<string, string> = {
    zh: 'zh-CN',
    ru: 'ru-RU',
    ja: 'ja-JP',
    de: 'de-DE',
    pl: 'pl-PL',
    ar: 'ar-SA',
    ur: 'ur-PK',
    id: 'id-ID',
    kk: 'kk-KZ',
    da: 'da-DK',
    sr: 'sr-RS',
    fr: 'fr-FR',
    es: 'es-ES',
    en: 'en-US',
  }
  const formatted = new Intl.NumberFormat(localeMap[locale] || 'en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(converted)

  if (currency.symbolPosition === 'before') {
    return `${currency.symbol}${formatted}`
  }
  return `${formatted} ${currency.symbol}`
}

/**
 * 获取汇率更新时间
 */
export function getLastRateUpdate(): Date | null {
  return lastRateUpdate
}

/**
 * 获取货币对象
 */
export function getCurrency(code: string): Currency {
  return currencies.find(c => c.code === code) || currencies[0]
}
