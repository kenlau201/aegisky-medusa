/**
 * Exchange rate locking for checkout
 * Sprint 3 Globalization: Lock rates at checkout time
 */

// In-memory rate cache (in production, use Redis)
let rateCache = {}
let lastFetch = 0
const CACHE_TTL = 3600000 // 1 hour

/**
 * Fetch current exchange rates (base RUB)
 */
async function fetchExchangeRates() {
  const now = Date.now()
  if (Object.keys(rateCache).length > 0 && now - lastFetch < CACHE_TTL) {
    return rateCache
  }

  try {
    // Try exchangerate-api
    const response = await fetch('https://open.er-api.com/v6/latest/RUB')
    if (response.ok) {
      const data = await response.json()
      if (data.rates) {
        rateCache = data.rates
        lastFetch = now
        return rateCache
      }
    }
  } catch (e) {
    console.log('Exchange rate API unavailable, using fallback rates')
  }

  // Fallback static rates (approximate, for development)
  rateCache = {
    RUB: 1,
    USD: 0.011,
    EUR: 0.010,
    GBP: 0.0086,
    CNY: 0.079,
    JPY: 1.65,
    AED: 0.040,
    SAR: 0.041,
  }
  lastFetch = now
  return rateCache
}

/**
 * Create a rate snapshot at checkout time
 * This locks the rates for this order
 */
async function createRateSnapshot() {
  const rates = await fetchExchangeRates()
  const now = new Date()
  const expires = new Date(now.getTime() + 30 * 60000) // 30 minute lock

  return {
    base: 'RUB',
    rates: { ...rates },
    lockedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  }
}

/**
 * Convert price using locked snapshot rates
 */
function convertWithSnapshot(amountInRub, targetCurrency, snapshot) {
  if (!snapshot || !snapshot.rates || !snapshot.rates[targetCurrency]) {
    // Fallback to live rates if no snapshot
    return amountInRub * (rateCache[targetCurrency] || 0.011)
  }
  return amountInRub * snapshot.rates[targetCurrency]
}

/**
 * Format price with snapshot (for order history views)
 */
function formatPriceWithSnapshot(amountInRub, currency, snapshot) {
  const converted = convertWithSnapshot(amountInRub, currency, snapshot)
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', CNY: '¥', JPY: '¥', RUB: '₽', AED: 'د.إ', SAR: '﷼'
  }
  const symbol = symbols[currency] || ''
  const decimals = ['JPY'].includes(currency) ? 0 : 2
  return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

module.exports = {
  fetchExchangeRates,
  createRateSnapshot,
  convertWithSnapshot,
  formatPriceWithSnapshot,
}
