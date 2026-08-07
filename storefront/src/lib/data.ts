// ============================================================
// Aegisky Medusa - 数据层（支持本地JSON和后端API双模式）
// 100% 还原 copterparts.ru 的真实数据，不做任何"智能"加工
// ============================================================

import fs from 'fs'
import path from 'path'

// ============================================================
// 后端API配置
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a'
const USE_BACKEND_API = process.env.NEXT_PUBLIC_USE_BACKEND_API === 'true'

// API数据加载状态
let apiLoadPromise: Promise<void> | null = null
let apiLoadFailed = false

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'x-publishable-api-key': PUBLISHABLE_KEY,
    },
    // Next.js缓存
    next: { revalidate: 300 },
  } as RequestInit)

  if (!response.ok) {
    throw new Error(`API ${endpoint} failed: ${response.status}`)
  }
  return response.json()
}

// 从后端API批量加载所有数据
async function loadDataFromAPI(): Promise<void> {
  if (apiLoadFailed) {
    // 如果API加载失败过，回退到本地JSON
    console.log('[data] API previously failed, using local JSON')
    return
  }

  try {
    console.log('[data] Loading data from Medusa backend API...')

    // 并行加载分类和品牌
    const [categoriesData, brandsData] = await Promise.all([
      fetchFromAPI<{ categories: any[] }>('/store/categories'),
      fetchFromAPI<{ brands: any[] }>('/store/brands'),
    ])

    // 批量加载商品（每次100个，使用offset分页）
    const allProducts: any[] = []
    let offset = 0
    const pageSize = 100
    let hasMore = true
    const seenIds = new Set<number>()

    while (hasMore && offset < 20000) {
      const productsData = await fetchFromAPI<{ products: any[]; count?: number }>(
        `/store/products?limit=${pageSize}&offset=${offset}`
      )
      const batch = productsData.products || []
      if (batch.length === 0) {
        hasMore = false
        break
      }
      // Deduplicate by ID to prevent infinite loops
      let newCount = 0
      for (const p of batch) {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id)
          allProducts.push(p)
          newCount++
        }
      }
      if (newCount === 0) {
        hasMore = false
        break
      }
      // Stop when we get fewer items than page size (last page)
      if (batch.length < pageSize) {
        hasMore = false
      }
      // Also stop if count is provided and we've reached it
      if (productsData.count && allProducts.length >= productsData.count) {
        hasMore = false
      }
      offset += pageSize
    }

    // 转换API数据格式以匹配现有Product接口
    productsCache = allProducts.map(p => ({
      ...p,
      videos: p.videos || [],
      galleryVideos: p.galleryVideos || [],
      videoCount: p.videoCount || (p.videos?.length || 0),
      price: p.price !== null ? Number(p.price) : null,
      regularPrice: p.regularPrice !== null ? Number(p.regularPrice) : null,
      salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
    }))

    categoriesCache = categoriesData.categories
    brandsCache = brandsData.brands
    tagsCache = []
    attributesCache = []

    console.log(`[data] Loaded from API: ${productsCache.length} products, ${categoriesCache.length} categories, ${brandsCache.length} brands`)
  } catch (error) {
    console.error('[data] Failed to load from API, falling back to local JSON:', error)
    apiLoadFailed = true
    // 清除可能部分加载的缓存，让后续loadJSON加载本地数据
    productsCache = null
    categoriesCache = null
    brandsCache = null
  }
}

// 确保数据已加载（在服务端组件中调用）
export async function ensureDataLoaded(): Promise<void> {
  if (!USE_BACKEND_API) return
  if (productsCache && categoriesCache && brandsCache) return
  if (!apiLoadPromise) {
    apiLoadPromise = loadDataFromAPI()
  }
  await apiLoadPromise
}

// ============================================================
// 类型定义 - 完全对应 WooCommerce Store API
// ============================================================

export interface WooCategory {
  id: number
  name: string
  slug: string
}

export interface WooBrand {
  id: number
  name: string
  slug: string
}

export interface WooTag {
  id: number
  name: string
  slug: string
}

export interface WooAttributeTerm {
  id: number
  name: string
  slug: string
}

export interface WooAttribute {
  id: number
  name: string
  slug: string
  has_variations: boolean
  terms: WooAttributeTerm[]
}

export interface ProductVideo {
  url: string
  type: string
  local: boolean
}

export interface Product {
  id: number
  name: string
  slug: string
  permalink: string
  sku: string
  type: string
  parent: number

  shortDescription: string
  description: string

  price: number | null
  regularPrice: number | null
  salePrice: number | null
  onSale: boolean
  currency: string
  priceHtml: string

  rating: string
  reviewCount: number

  categories: WooCategory[]
  brands: WooBrand[]
  tags: WooTag[]
  attributes: WooAttribute[]

  images: string[]
  mainImage: string
  imageCount: number
  videos: ProductVideo[]
  videoCount: number
  galleryVideos: ProductVideo[]

  inStock: boolean
  stockStatus: string
  lowStockRemaining: number | null
  isOnBackorder: boolean

  weight: string
  dimensions: { length?: string; width?: string; height?: string }
  formattedWeight: string
  formattedDimensions: string

  hasOptions: boolean
  isPurchasable: boolean
  soldIndividually: boolean
  variations: any[]

  _raw: any
}

export interface CategoryPathItem {
  id: number
  name: string
  slug: string
}

export interface Category {
  id: number
  name: string
  slug: string
  parent: number
  productCount: number
  image?: string | null
  description?: string
  depth: number
  path: CategoryPathItem[]
  childrenCount: number
}

export interface Brand {
  id: number
  name: string
  slug: string
  productCount: number
}

export interface Tag {
  id: number
  name: string
  slug: string
  productCount: number
}

export interface AttributeDef {
  id: number
  name: string
  slug: string
  hasVariations: boolean
  productCount: number
  terms: { id: number; name: string; slug: string; count: number }[]
}

// ============================================================
// 数据加载
// ============================================================

const DATA_DIR = path.join(process.cwd(), '..', 'data', 'mirror')

function loadJSON<T>(filename: string): T | null {
  try {
    const filePath = path.join(DATA_DIR, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch (e) {
    console.error(`Failed to load ${filename}:`, e)
    return null
  }
}

// 缓存
let productsCache: Product[] | null = null
let categoriesCache: Category[] | null = null
let brandsCache: Brand[] | null = null
let tagsCache: Tag[] | null = null
let attributesCache: AttributeDef[] | null = null

// 标记是否已经尝试过API加载
let apiInitStarted = false

// 在服务端启动时自动触发API加载（仅服务端）
if (typeof window === 'undefined' && USE_BACKEND_API && !apiInitStarted) {
  apiInitStarted = true
  apiLoadPromise = loadDataFromAPI()
}

// ============================================================
// 基础数据函数
// ============================================================

export function getAllProducts(): Product[] {
  if (productsCache) return productsCache
  const raw = loadJSON<any[]>('products.json') || []
  // 价格在镜像数据生成时已从戈比转换为卢布，这里直接使用
  // 同时处理 snake_case (DB export) 和 camelCase (API) 两种字段名
  productsCache = raw.map(p => ({
    ...p,
    // Map snake_case to camelCase for DB-exported JSON
    id: p.id,
    name: decodeHtml(p.name),
    slug: p.slug,
    sku: p.sku,
    shortDescription: decodeHtml(p.shortDescription || p.short_description || ''),
    description: p.description || '',
    price: p.price !== null && p.price !== undefined ? Number(p.price) : null,
    regularPrice: p.regularPrice !== undefined ? Number(p.regularPrice) : (p.regular_price ? Number(p.regular_price) : null),
    salePrice: p.salePrice !== undefined ? Number(p.salePrice) : (p.sale_price ? Number(p.sale_price) : null),
    onSale: p.onSale !== undefined ? p.onSale : p.on_sale || false,
    inStock: p.inStock !== undefined ? p.inStock : p.in_stock !== undefined ? p.in_stock : true,
    mainImage: p.mainImage || p.main_image || (Array.isArray(p.images) ? p.images[0] : ''),
    imageCount: p.imageCount || p.image_count || (Array.isArray(p.images) ? p.images.length : 0),
    videoCount: p.videoCount || p.video_count || (Array.isArray(p.videos) ? p.videos.length : 0),
    reviewCount: p.reviewCount || p.review_count || 0,
    formattedWeight: p.formattedWeight || p.formatted_weight || '',
    formattedDimensions: p.formattedDimensions || p.formatted_dimensions || '',
    hasOptions: p.hasOptions || p.has_options || false,
    isPurchasable: p.isPurchasable !== undefined ? p.isPurchasable : p.is_purchasable !== undefined ? p.is_purchasable : true,
    soldIndividually: p.soldIndividually || p.sold_individually || false,
    stockStatus: p.stockStatus || p.stock_status || { text: '', class: 'in-stock' },
    videos: p.videos || [],
    galleryVideos: p.galleryVideos || [],
    images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []),
    categories: Array.isArray(p.categories) ? p.categories : (typeof p.categories === 'string' ? JSON.parse(p.categories) : []),
    brands: Array.isArray(p.brands) ? p.brands : (typeof p.brands === 'string' ? JSON.parse(p.brands) : []),
  }))
  return productsCache
}

export function getAllCategories(): Category[] {
  if (categoriesCache) return categoriesCache
  const raw = loadJSON<any[]>('categories.json') || []
  const products = getAllProducts()

  // 先建立基础映射
  const catMap = new Map<number, Category>()
  for (const c of raw) {
    catMap.set(Number(c.id), {
      id: Number(c.id),
      name: c.name,
      slug: c.slug,
      parent: c.parent ?? 0,
      description: c.description || '',
      imageUrl: c.imageUrl ?? c.image_url ?? null,
      productCount: 0, // 先置0，后面实时计算
      depth: c.depth ?? 0,
      path: c.path || [],
      childrenCount: c.childrenCount ?? c.children_count ?? 0,
    })
  }

  // 递归获取所有子分类ID
  function getDescendantIds(catId: number): Set<number> {
    const ids = new Set<number>()
    const direct = [...catMap.values()].filter(c => c.parent === catId)
    for (const child of direct) {
      ids.add(child.id)
      getDescendantIds(child.id).forEach(id => ids.add(id))
    }
    return ids
  }

  // 基于商品数据实时计算每个分类（含子分类）的商品数
  for (const cat of catMap.values()) {
    const catIds = new Set([cat.id])
    getDescendantIds(cat.id).forEach(id => catIds.add(id))
    cat.productCount = products.filter(p =>
      Array.isArray(p.categories) && p.categories.some(pc => catIds.has(Number(pc.id)))
    ).length
  }

  categoriesCache = [...catMap.values()]
  return categoriesCache
}

// Decode HTML entities like &amp; &lt; &gt; etc.
function decodeHtml(str: string): string {
  if (!str) return str
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

export function getAllBrands(): Brand[] {
  if (brandsCache) return brandsCache
  const raw = loadJSON<any[]>('brands.json') || []
  const products = getAllProducts()

  // 基于商品数据实时计算每个品牌的商品数
  const brandCounts = new Map<number, number>()
  for (const p of products) {
    if (Array.isArray(p.brands)) {
      for (const b of p.brands) {
        const bid = Number(b.id)
        brandCounts.set(bid, (brandCounts.get(bid) || 0) + 1)
      }
    }
  }

  brandsCache = raw.map(b => ({
    id: Number(b.id),
    name: decodeHtml(b.name),
    slug: b.slug,
    productCount: brandCounts.get(Number(b.id)) ?? 0,
  }))
  return brandsCache
}

export function getAllTags(): Tag[] {
  if (tagsCache) return tagsCache
  tagsCache = loadJSON<Tag[]>('tags.json') || []
  return tagsCache
}

export function getAllAttributes(): AttributeDef[] {
  if (attributesCache) return attributesCache
  attributesCache = loadJSON<AttributeDef[]>('attributes.json') || []
  return attributesCache
}

// ============================================================
// 单条查询
// ============================================================

export function getProductById(id: number): Product | null {
  return getAllProducts().find(p => p.id === id) || null
}

export function getProductBySlug(slug: string): Product | null {
  return getAllProducts().find(p => p.slug === slug) || null
}

export function getCategoryById(id: number): Category | null {
  return getAllCategories().find(c => c.id === id) || null
}

export function getCategoryBySlug(slug: string): Category | null {
  return getAllCategories().find(c => c.slug === slug) || null
}

export function getRootCategories(): Category[] {
  return getAllCategories().filter(c => c.parent === 0)
}

export function getChildCategories(parentId: number): Category[] {
  return getAllCategories().filter(c => c.parent === parentId)
}

export function getCategoryBreadcrumbs(slug: string): CategoryPathItem[] {
  const cat = getCategoryBySlug(slug)
  if (!cat) return []
  return cat.path || []
}

export function getBrandById(id: number): Brand | null {
  return getAllBrands().find(b => b.id === id) || null
}

export function getBrandBySlug(slug: string): Brand | null {
  return getAllBrands().find(b => b.slug === slug) || null
}

export function getTagBySlug(slug: string): Tag | null {
  return getAllTags().find(t => t.slug === slug) || null
}

export function getAttributeById(id: number): AttributeDef | null {
  return getAllAttributes().find(a => a.id === id) || null
}

// ============================================================
// 按分类/品牌/标签查询商品
// ============================================================

// 递归获取分类及其所有子分类的ID（与WooCommerce分类页面行为一致）
function getAllCategoryIds(catId: number): Set<number> {
  const ids = new Set<number>([catId])
  const children = getAllCategories().filter(c => c.parent === catId)
  children.forEach(child => {
    getAllCategoryIds(child.id).forEach(id => ids.add(id))
  })
  return ids
}

// 获取分类的商品总数（包含所有子分类，与WooCommerce一致 - 只计有货商品）
export function getCategoryProductCount(catId: number): number {
  const allIds = getAllCategoryIds(catId)
  return getAllProducts().filter(p =>
    p.inStock && p.categories.some(c => allIds.has(c.id))
  ).length
}

export function getProductsByCategoryId(catId: number): Product[] {
  const allIds = getAllCategoryIds(catId)
  return getAllProducts().filter(p =>
    p.inStock && p.categories.some(c => allIds.has(c.id))
  )
}

export function getProductsByCategorySlug(slug: string): Product[] {
  const cat = getCategoryBySlug(slug)
  if (!cat) return []
  return getProductsByCategoryId(cat.id)
}

export function getProductsByBrandId(brandId: number): Product[] {
  return getAllProducts().filter(p =>
    p.inStock && p.brands.some(b => b.id === brandId)
  )
}

export function getProductsByBrandSlug(slug: string): Product[] {
  const brand = getBrandBySlug(slug)
  if (!brand) return []
  return getProductsByBrandId(brand.id)
}

export function getProductsByTagId(tagId: number): Product[] {
  return getAllProducts().filter(p =>
    p.inStock && p.tags.some(t => t.id === tagId)
  )
}

// ============================================================
// 搜索和筛选
// ============================================================

export interface ProductFilters {
  query?: string
  categoryId?: number
  brandId?: number
  tagId?: number
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  onSaleOnly?: boolean
  attributeFilters?: { attrId: number; termIds: number[] }[]
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest' | 'rating'
}

export function searchProducts(filters: ProductFilters): Product[] {
  let results = [...getAllProducts()]

  // 默认只显示有货商品（与源站WooCommerce隐藏缺货商品设置一致）
  if (filters.inStockOnly !== false) {
    results = results.filter(p => p.inStock)
  }

  if (filters.query) {
    const q = filters.query.toLowerCase()
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }

  if (filters.categoryId) {
    results = results.filter(p =>
      p.categories.some(c => c.id === filters.categoryId)
    )
  }

  if (filters.brandId) {
    results = results.filter(p =>
      p.brands.some(b => b.id === filters.brandId)
    )
  }

  if (filters.tagId) {
    results = results.filter(p =>
      p.tags.some(t => t.id === filters.tagId)
    )
  }

  if (filters.minPrice !== undefined) {
    results = results.filter(p => p.price !== null && p.price >= filters.minPrice!)
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter(p => p.price !== null && p.price <= filters.maxPrice!)
  }

  if (filters.inStockOnly) {
    results = results.filter(p => p.inStock)
  }

  if (filters.onSaleOnly) {
    results = results.filter(p => p.onSale)
  }

  if (filters.attributeFilters) {
    filters.attributeFilters.forEach(({ attrId, termIds }) => {
      results = results.filter(p =>
        p.attributes.some(a =>
          a.id === attrId && a.terms.some(t => termIds.includes(t.id))
        )
      )
    })
  }

  // 排序
  switch (filters.sortBy) {
    case 'price-asc':
      results.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
      break
    case 'price-desc':
      results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      break
    case 'name':
      results.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      break
    case 'rating':
      results.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      break
    case 'newest':
    default:
      results.sort((a, b) => b.id - a.id)
  }

  return results
}

// ============================================================
// 统计
// ============================================================

export function getStats() {
  const products = getAllProducts()
  const inStockProducts = products.filter(p => p.inStock)
  const withPrice = inStockProducts.filter(p => p.price !== null)
  const prices = withPrice.map(p => p.price!).filter(p => p > 0)

  return {
    totalProducts: inStockProducts.length,
    totalCategories: getAllCategories().length,
    totalBrands: getAllBrands().length,
    totalTags: getAllTags().length,
    totalAttributes: getAllAttributes().length,
    inStock: inStockProducts.length,
    onSale: inStockProducts.filter(p => p.onSale).length,
    withPrice: withPrice.length,
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    avgPrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
  }
}

export function getPriceRange(): { min: number; max: number } {
  const stats = getStats()
  return { min: stats.minPrice, max: stats.maxPrice }
}

// ============================================================
// 推荐商品
// ============================================================

export function getFeaturedProducts(limit = 12): Product[] {
  return getAllProducts()
    .filter(p => p.inStock && p.mainImage && p.price !== null)
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating) || b.reviewCount - a.reviewCount)
    .slice(0, limit)
}

export function getNewProducts(limit = 12): Product[] {
  return getAllProducts()
    .filter(p => p.inStock && p.mainImage)
    .sort((a, b) => b.id - a.id)
    .slice(0, limit)
}

export function getOnSaleProducts(limit = 12): Product[] {
  return getAllProducts()
    .filter(p => p.inStock && p.onSale && p.mainImage)
    .slice(0, limit)
}

export function getRelatedProducts(product: Product, limit = 8): Product[] {
  const sameCategory = new Set<number>()
  product.categories.forEach(c => sameCategory.add(c.id))

  return getAllProducts()
    .filter(p =>
      p.id !== product.id &&
      p.inStock &&
      p.categories.some(c => sameCategory.has(c.id))
    )
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, limit)
}

// ============================================================
// 价格格式化
// ============================================================

export function formatPrice(price: number | null, currency: string = 'RUB', locale: string = 'en'): string {
  if (price === null) return 'Price on request'

  // 价格已经是卢布单位（镜像数据生成时已从戈比转换）
  const amount = price

  try {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

// ============================================================
// 工具函数
// ============================================================

export function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '"')
    .replace(/&raquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
