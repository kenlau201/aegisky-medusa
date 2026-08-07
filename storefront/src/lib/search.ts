/**
 * AI Semantic Search Engine
 * Uses TF-IDF with synonym expansion and typo tolerance
 */

import { Product } from './data'

// ==================== Synonym Dictionary ====================
const SYNONYMS: Record<string, string[]> = {
  // Drone types
  drone: ['uav', 'quadcopter', 'multirotor', 'aircraft', 'copter'],
  uav: ['drone', 'unmanned aerial vehicle', 'quadcopter'],
  quadcopter: ['drone', 'quad', 'multirotor'],
  fpv: ['first person view', 'racing drone', 'freestyle'],
  'racing drone': ['fpv', 'race copter', 'speed drone'],

  // Flight controller
  'flight controller': ['fc', 'flight control', 'controller board', 'f4', 'f7', 'h7'],
  fc: ['flight controller', 'flight control board'],
  f4: ['flight controller', 'stm32f4'],
  f7: ['flight controller', 'stm32f7'],
  h7: ['flight controller', 'stm32h7'],

  // Motors
  motor: ['brushless motor', 'outrunner', 'engine', 'kv'],
  'brushless motor': ['motor', 'outrunner', 'bldc'],
  kv: ['motor', 'rpm per volt', 'motor rating'],
  outrunner: ['motor', 'brushless'],

  // ESC
  esc: ['electronic speed controller', 'speed controller', 'blheli', 'blheli_s', 'blheli_32'],
  'speed controller': ['esc', 'blheli'],
  blheli: ['esc', 'blheli_s', 'blheli_32'],

  // Propellers
  propeller: ['prop', 'blade', 'airscrew', 'cw', 'ccw'],
  prop: ['propeller', 'blade'],
  blade: ['propeller', 'prop'],

  // Battery
  battery: ['lipo', 'li-po', 'lihv', 'li-ion', 'cell', 'batt'],
  lipo: ['battery', 'li-po', 'lithium polymer'],
  lihv: ['battery', 'high voltage lipo'],
  'li-ion': ['battery', 'lithium ion'],
  cell: ['battery', 's', '1s', '2s', '3s', '4s', '5s', '6s'],
  mah: ['battery capacity', 'capacity'],

  // FPV System
  vtx: ['video transmitter', 'video tx', 'transmitter'],
  'video transmitter': ['vtx', 'vt', 'video sender'],
  vrx: ['video receiver', 'video rx'],
  camera: ['fpv camera', 'cam', 'ccd', 'cmos', 'hd camera'],
  'fpv camera': ['camera', 'cam', 'ccd', 'cmos'],
  goggles: ['fpv goggles', 'video glasses', 'headset', 'hdo'],
  'fpv goggles': ['goggles', 'headset', 'video glasses'],
  antenna: ['antennae', 'aerial', 'rhcp', 'lhcp', 'pagoda', 'dipole'],
  rhcp: ['antenna', 'right hand circular polarization'],
  lhcp: ['antenna', 'left hand circular polarization'],

  // Receiver / Radio
  receiver: ['rx', 'rc receiver', 'radio receiver', 'diversity'],
  rx: ['receiver', 'radio receiver'],
  transmitter: ['tx', 'radio transmitter', 'remote', 'radio'],
  tx: ['transmitter', 'radio', 'remote control'],
  elrs: ['expresslrs', 'long range receiver', '2.4ghz', '900mhz'],
  expresslrs: ['elrs', 'long range'],
  crossfire: ['tbs crossfire', 'long range', '900mhz'],
  frsky: ['receiver', 'x9d', 'taranis', 'd16'],
  dsmx: ['spektrum', 'receiver', 'dsm2'],
  sbus: ['receiver protocol', 'serial bus'],
  ppm: ['receiver protocol'],

  // GPS
  gps: ['gnss', 'navigation', 'ublox', 'm8n', 'm10'],
  gnss: ['gps', 'global navigation'],
  ublox: ['gps', 'm8n', 'm10', 'neo'],
  compass: ['magnetometer', 'hmc5883', 'qmc5883'],
  magnetometer: ['compass', 'magnetic sensor'],

  // Frame
  frame: ['chassis', 'airframe', 'kit', 'wheelbase'],
  chassis: ['frame', 'airframe'],
  'carbon fiber': ['cf', 'carbon', 'carbon fibre'],
  cf: ['carbon fiber', 'carbon'],
  wheelbase: ['frame size', 'motor to motor'],

  // Industrial
  'industrial drone': ['commercial drone', 'enterprise drone', 'survey drone', 'mapping drone'],
  'enterprise drone': ['industrial drone', 'commercial uav'],
  mapping: ['survey', 'photogrammetry', 'topography', 'lidar'],
  survey: ['mapping', 'photogrammetry', 'aerial survey'],
  lidar: ['light detection and ranging', 'laser scanning', 'mapping'],
  thermal: ['thermal camera', 'infrared', 'flir', 'heat camera'],
  infrared: ['thermal', 'ir', 'flir'],
  gimbal: ['camera mount', 'stabilizer', 'brushless gimbal'],
  stabilizer: ['gimbal', 'camera mount'],

  // Cargo / Delivery
  'cargo drone': ['delivery drone', 'transport drone', 'heavy lift', 'payload'],
  'delivery drone': ['cargo drone', 'transport drone', 'parcel drone'],
  'heavy lift': ['cargo drone', 'large drone', 'high payload'],
  payload: ['cargo capacity', 'load capacity', 'carry weight'],

  // Common adjectives
  longrange: ['long range', 'lr', 'extended range'],
  'long range': ['longrange', 'lr', 'extended range'],
  waterproof: ['water resistant', 'ip67', 'weatherproof'],
  miniature: ['micro', 'tiny', 'small', 'mini', 'nano'],
  micro: ['miniature', 'tiny', 'small', 'nano'],
  mini: ['small', 'compact', 'micro'],
  heavy: ['large', 'big', 'high power'],
  highpower: ['high power', 'powerful', 'high performance'],
}

// ==================== Stop Words ====================
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
  'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
  'too', 'very', 'just', 'also', 'now', 'here', 'there', 'when', 'where',
  'why', 'how', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him',
  'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'for',
  'sale', 'buy', 'price', 'cheap', 'best', 'good', 'new', 'original',
  'genuine', 'authentic', 'high', 'quality', 'professional', 'oem',
])

// ==================== Tokenizer ====================
function tokenize(text: string): string[] {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t))
}

// Expand query with synonyms
function expandQuery(tokens: string[]): string[] {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    // Direct synonym lookup
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach(s => expanded.add(s))
    }
    // Multi-word synonyms
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (key.includes(' ') && key.includes(token)) {
        expanded.add(key)
        syns.forEach(s => expanded.add(s))
      }
    }
  }
  return Array.from(expanded)
}

// Simple Levenshtein distance for typo tolerance
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

// ==================== Search Index ====================
interface SearchDocument {
  product: Product
  tokens: Map<string, number> // token -> frequency in document
  nameTokens: Set<string>
  brandTokens: Set<string>
  categoryTokens: Set<string>
}

let searchIndex: SearchDocument[] | null = null
let documentFrequencies: Map<string, number> = new Map()
let totalDocuments = 0

function buildIndex(products: Product[]): void {
  searchIndex = products.map(product => {
    // Tokenize different fields with different weights
    const nameTokens = tokenize(product.name)
    const brandTokens = product.brands?.length ? tokenize(product.brands.map(b => b.name).join(' ')) : []
    const categoryTokens = product.categories?.flatMap(c => tokenize(c.name)) || []
    const descTokens = tokenize(product.shortDescription + ' ' + product.description)
    const attrTokens = product.attributes ? Object.entries(product.attributes).flatMap(([k, v]) => [...tokenize(k), ...tokenize(String(v))]) : []
    const skuTokens = product.sku ? tokenize(product.sku) : []

    const tokenFreq = new Map<string, number>()

    // Name tokens get weight 5x
    nameTokens.forEach(t => tokenFreq.set(t, (tokenFreq.get(t) || 0) + 5))
    // Brand tokens get weight 4x
    brandTokens.forEach(t => tokenFreq.set(t, (tokenFreq.get(t) || 0) + 4))
    // Category tokens get weight 3x
    categoryTokens.forEach(t => tokenFreq.set(t, (tokenFreq.get(t) || 0) + 3))
    // SKU exact match gets weight 8x
    skuTokens.forEach(t => tokenFreq.set(t, (tokenFreq.get(t) || 0) + 8))
    // Attribute tokens get weight 2x
    attrTokens.forEach(t => tokenFreq.set(t, (tokenFreq.get(t) || 0) + 2))
    // Description tokens get weight 1x
    descTokens.forEach(t => tokenFreq.set(t, (tokenFreq.get(t) || 0) + 1))

    return {
      product,
      tokens: tokenFreq,
      nameTokens: new Set(nameTokens),
      brandTokens: new Set(brandTokens),
      categoryTokens: new Set(categoryTokens),
    }
  })

  // Calculate document frequencies
  documentFrequencies = new Map()
  totalDocuments = searchIndex.length
  for (const doc of searchIndex) {
    for (const token of doc.tokens.keys()) {
      documentFrequencies.set(token, (documentFrequencies.get(token) || 0) + 1)
    }
  }
}

// ==================== Search Function ====================
export interface SearchResult {
  product: Product
  score: number
  matchedFields: string[]
}

export function semanticSearch(
  query: string,
  products: Product[],
  options: { limit?: number; threshold?: number } = {}
): SearchResult[] {
  const { limit = 24, threshold = 0.1 } = options

  if (!query || query.trim().length === 0) return []

  // Build index if not built or products changed
  if (!searchIndex || searchIndex.length !== products.length) {
    buildIndex(products)
  }

  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []

  // Expand query with synonyms
  const expandedTokens = expandQuery(queryTokens)

  // Calculate scores
  const results: SearchResult[] = []

  for (const doc of searchIndex!) {
    let score = 0
    const matchedFields: string[] = []

    for (const qToken of expandedTokens) {
      // Exact token match
      if (doc.tokens.has(qToken)) {
        const tf = doc.tokens.get(qToken)!
        const df = documentFrequencies.get(qToken) || 1
        // TF-IDF scoring
        const idf = Math.log(totalDocuments / df) + 1
        score += tf * idf

        if (doc.nameTokens.has(qToken) && !matchedFields.includes('name')) matchedFields.push('name')
        if (doc.brandTokens.has(qToken) && !matchedFields.includes('brand')) matchedFields.push('brand')
        if (doc.categoryTokens.has(qToken) && !matchedFields.includes('category')) matchedFields.push('category')
      } else {
        // Fuzzy match for typos (only for tokens longer than 3 chars)
        if (qToken.length > 3) {
          for (const docToken of doc.tokens.keys()) {
            if (docToken.length > 3 && Math.abs(docToken.length - qToken.length) <= 2) {
              const dist = levenshtein(qToken, docToken)
              if (dist === 1) {
                // One character off - partial match
                const tf = doc.tokens.get(docToken)!
                score += tf * 0.3
                if (!matchedFields.includes('fuzzy')) matchedFields.push('fuzzy')
                break
              }
            }
          }
        }
      }
    }

    // SKU exact match bonus
    if (doc.product.sku && doc.product.sku.toLowerCase().includes(query.toLowerCase().trim())) {
      score += 50
      matchedFields.push('sku')
    }

    // Phrase match bonus (if multiple query tokens appear in name in order)
    if (queryTokens.length > 1) {
      const nameLower = doc.product.name.toLowerCase()
      if (nameLower.includes(query.toLowerCase())) {
        score += 15
        if (!matchedFields.includes('phrase')) matchedFields.push('phrase')
      }
    }

    if (score > threshold) {
      results.push({ product: doc.product, score, matchedFields })
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  return limit ? results.slice(0, limit) : results
}

// Get search suggestions / autocomplete
export function getSuggestions(query: string, products: Product[], limit = 8): string[] {
  if (!query || query.length < 2) return []

  const results = semanticSearch(query, products, { limit: limit * 2 })
  const suggestions = new Set<string>()

  for (const result of results.slice(0, limit * 2)) {
    const name = result.product.name
    // Add product name
    if (name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(name)
    }
    // Add brand + category combos
    if (result.product.brands?.length) {
      suggestions.add(`${result.product.brands[0].name} ${result.product.categories?.[0]?.name || ''}`.trim())
    }
  }

  return Array.from(suggestions).slice(0, limit)
}

// Get related searches
export function getRelatedSearches(query: string, products: Product[]): string[] {
  const results = semanticSearch(query, products, { limit: 10 })
  const related = new Set<string>()

  for (const result of results) {
    // Add category names
    result.product.categories?.forEach(c => related.add(c.name))
    // Add brand names
    result.product.brands?.forEach(b => related.add(b.name))
    // Add key attribute values
    if (result.product.attributes) {
      Object.values(result.product.attributes).slice(0, 3).forEach(v => {
        if (v && String(v).length < 30) related.add(String(v))
      })
    }
  }

  return Array.from(related).slice(0, 6)
}
