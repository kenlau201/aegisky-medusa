import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '..', 'data', 'mirror')

// Module-level cache - populated on first request, reused for subsequent requests
let _productsCache: Product[] | null = null
let _categoriesCache: Category[] | null = null
let _cacheTimestamp: number = 0
const CACHE_TTL = 60000 // 60 seconds

function loadJSON<T>(filename: string): T | null {
  try {
    const filePath = path.join(DATA_DIR, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

function getProducts(): Product[] {
  const now = Date.now()
  if (_productsCache && (now - _cacheTimestamp) < CACHE_TTL) {
    return _productsCache
  }
  const raw = loadJSON<any[]>('products.json') || []
  _productsCache = raw.map(normalizeProduct)
  _cacheTimestamp = now
  return _productsCache
}

function getCategories(): Category[] {
  if (_categoriesCache) return _categoriesCache
  const raw = loadJSON<any[]>('categories.json') || []
  _categoriesCache = raw.map(c => ({
    ...c,
    productCount: c.productCount || c.product_count || 0,
  }))
  return _categoriesCache
}

interface Product {
  id: number
  name: string
  slug: string
  sku?: string
  price: number | null
  regularPrice?: number
  salePrice?: number
  onSale?: boolean
  inStock?: boolean
  images?: string[]
  mainImage?: string
  imageCount?: number
  categories: { id: number; name: string; slug: string }[]
  brands: { id: number; name: string; slug: string }[]
  attributes?: any[]
  shortDescription?: string
  description?: string
  rating?: string
  reviewCount?: number
  [key: string]: any
}

interface Category {
  id: number
  name: string
  slug: string
  parent: number
  description?: string
  productCount: number
  depth: number
  path?: any
  childrenCount?: number
  image?: string
}

function normalizeProduct(p: any): Product {
  let attrs = p.attributes
  if (typeof attrs === 'string') {
    try { attrs = JSON.parse(attrs) } catch { attrs = [] }
  }
  if (!Array.isArray(attrs)) attrs = []
  return {
    ...p,
    id: Number(p.id),
    price: p.price !== null && p.price !== undefined ? Number(p.price) : null,
    regularPrice: p.regularPrice !== undefined ? Number(p.regularPrice) : (p.regular_price ? Number(p.regular_price) : null),
    salePrice: p.salePrice !== undefined ? Number(p.salePrice) : (p.sale_price ? Number(p.sale_price) : null),
    onSale: p.onSale !== undefined ? p.onSale : p.on_sale || false,
    inStock: p.inStock !== undefined ? p.inStock : p.in_stock !== undefined ? p.in_stock : true,
    mainImage: p.mainImage || p.main_image || (Array.isArray(p.images) ? p.images[0] : ''),
    imageCount: p.imageCount || p.image_count || (Array.isArray(p.images) ? p.images.length : 0),
    images: Array.isArray(p.images) ? p.images : [],
    categories: Array.isArray(p.categories) ? p.categories : [],
    brands: Array.isArray(p.brands) ? p.brands : [],
    attributes: attrs,
    shortDescription: p.shortDescription || p.short_description || '',
    rating: p.rating || '0',
    reviewCount: p.reviewCount || p.review_count || 0,
  }
}

function getDescendantIds(categories: Category[], parentId: number): Set<number> {
  const ids = new Set<number>()
  const direct = categories.filter(c => c.parent === parentId)
  for (const child of direct) {
    ids.add(child.id)
    getDescendantIds(categories, child.id).forEach(id => ids.add(id))
  }
  return ids
}

function buildBreadcrumbs(categories: Category[], category: Category): Category[] {
  const path: Category[] = []
  let current: Category | undefined = category
  while (current) {
    path.unshift(current)
    if (current.parent === 0) break
    current = categories.find(c => c.id === current!.parent)
  }
  return path
}

// Extract attribute term values from a product's attributes
function getProductAttrTerms(product: Product, attrId: number): { id: number; name: string; slug: string }[] {
  if (!product.attributes || !Array.isArray(product.attributes)) return []
  const result: { id: number; name: string; slug: string }[] = []
  for (const attr of product.attributes) {
    if (Number(attr.id) === attrId && Array.isArray(attr.terms)) {
      for (const term of attr.terms) {
        result.push({
          id: Number(term.id),
          name: term.name || '',
          slug: term.slug || ''
        })
      }
    }
  }
  return result
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '24')
  const sortBy = searchParams.get('sort') || 'default'
  const brandsParam = searchParams.get('brands')
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null
  const inStockOnly = searchParams.get('inStock') === 'true'
  const onSaleOnly = searchParams.get('onSale') === 'true'
  const searchQ = searchParams.get('q') || ''

  // Collect attribute filters: filter_attr_{id} = comma-separated term IDs/slugs
  const attrFilters: { attrId: number; termValues: string[] }[] = []
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter_attr_')) {
      const idStr = key.substring(12)
      if (/^\d+$/.test(idStr)) {
        attrFilters.push({ attrId: parseInt(idStr), termValues: value.split(',').map(v => v.trim()).filter(Boolean) })
      }
    }
  }

  if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  const decodedSlug = decodeURIComponent(slug)

  const products = getProducts()
  const categories = getCategories()

  const category = categories.find(c => c.slug === decodedSlug || String(c.id) === decodedSlug)
  if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 })

  const catIds = new Set<number>([category.id])
  getDescendantIds(categories, category.id).forEach(id => catIds.add(id))

  // Base: all products in this category (before filters)
  const allCatProducts = products.filter(p => p.categories.some(c => catIds.has(Number(c.id))))

  // Apply filters
  let filtered = [...allCatProducts]

  if (brandsParam) {
    const brandIds = brandsParam.split(',').map(Number).filter(Boolean)
    if (brandIds.length > 0) {
      filtered = filtered.filter(p => p.brands.some(b => brandIds.includes(Number(b.id))))
    }
  }
  if (minPrice !== null) filtered = filtered.filter(p => p.price !== null && p.price >= minPrice)
  if (maxPrice !== null) filtered = filtered.filter(p => p.price !== null && p.price <= maxPrice)
  if (inStockOnly) filtered = filtered.filter(p => p.inStock)
  if (onSaleOnly) filtered = filtered.filter(p => p.onSale)
  if (searchQ && searchQ.length >= 2) {
    const q = searchQ.toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q))
  }

  // Apply attribute filters
  for (const af of attrFilters) {
    filtered = filtered.filter(p => {
      const terms = getProductAttrTerms(p, af.attrId)
      return terms.some(t =>
        af.termValues.includes(String(t.id)) || af.termValues.includes(t.slug)
      )
    })
  }

  // === Build facets (from allCatProducts, not filtered) ===
  // Brands
  const brandCountMap = new Map<number, { name: string; slug: string; count: number }>()
  for (const p of allCatProducts) {
    for (const b of p.brands) {
      const bid = Number(b.id)
      if (!brandCountMap.has(bid)) brandCountMap.set(bid, { name: b.name, slug: b.slug, count: 0 })
      brandCountMap.get(bid)!.count++
    }
  }
  const availableBrands = Array.from(brandCountMap.entries())
    .map(([id, data]) => ({ id, name: data.name, slug: data.slug, count: data.count }))
    .sort((a, b) => b.count - a.count)

  // Price range
  const prices = allCatProducts.map(p => p.price).filter((p): p is number => p !== null)
  const priceRange = prices.length > 0
    ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
    : { min: 0, max: 0 }

  // Attributes with terms and counts
  const attrMap = new Map<number, { id: number; name: string; slug: string; terms: Map<number, { id: number; name: string; slug: string; count: number }> }>()
  for (const p of allCatProducts) {
    if (!p.attributes || !Array.isArray(p.attributes)) continue
    for (const attr of p.attributes) {
      const aid = Number(attr.id)
      if (!aid || !attr.name) continue
      if (!attrMap.has(aid)) {
        attrMap.set(aid, { id: aid, name: attr.name, slug: attr.slug || '', terms: new Map() })
      }
      const ae = attrMap.get(aid)!
      if (Array.isArray(attr.terms)) {
        for (const term of attr.terms) {
          const tid = Number(term.id)
          if (!tid) continue
          if (!ae.terms.has(tid)) {
            ae.terms.set(tid, { id: tid, name: term.name || '', slug: term.slug || '', count: 0 })
          }
          ae.terms.get(tid)!.count++
        }
      }
    }
  }
  const availableAttributes = Array.from(attrMap.values())
    // 过滤掉重复的品牌属性：已经有专门的brands字段，不要在属性里再显示Brand/Бренд
    .filter(ae => {
      const nameLower = ae.name.toLowerCase().trim()
      return nameLower !== 'бренд' && nameLower !== 'brand' && nameLower !== '品牌'
    })
    .map(ae => ({
      id: ae.id,
      name: ae.name,
      slug: ae.slug || ae.name.toLowerCase().replace(/\s+/g, '-'),
      terms: Array.from(ae.terms.values())
        .filter(t => t.count > 0)
        .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }))
    .filter(ae => ae.terms.length >= 2)
    .sort((a, b) => {
      const totalA = a.terms.reduce((s, t) => s + t.count, 0)
      const totalB = b.terms.reduce((s, t) => s + t.count, 0)
      return totalB - totalA
    })

  // Sort
  const sorted = [...filtered]
  switch (sortBy) {
    case 'price': case 'price-asc':
      sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)); break
    case 'price-desc':
      sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity)); break
    case 'name': case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'ru')); break
    case 'rating':
      sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)); break
    case 'popularity':
      sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break
    case 'date': case 'newest':
      sorted.sort((a, b) => b.id - a.id); break
    case 'oldest':
      sorted.sort((a, b) => a.id - b.id); break
    default:
      sorted.sort((a, b) => b.id - a.id)
  }

  // Paginate
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const pagedProducts = sorted.slice(start, start + perPage)

  // Child categories - 实时计算每个子分类（含后代）的商品数，不使用静态productCount
  const childCats = categories
    .filter(c => c.parent === category.id)
    .map(c => {
      // 计算该子分类及其所有后代分类下的商品数
      const childCatIds = new Set<number>([c.id])
      getDescendantIds(categories, c.id).forEach(id => childCatIds.add(id))
      const realCount = allCatProducts.filter(p => p.categories.some(pc => childCatIds.has(Number(pc.id)))).length
      return { id: c.id, name: c.name, slug: c.slug, productCount: realCount, image: c.image || null }
    })
    .filter(c => c.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)

  const breadcrumbs = buildBreadcrumbs(categories, category).map(c => ({ id: c.id, name: c.name, slug: c.slug }))

  const selectedBrandIds = brandsParam ? brandsParam.split(',').map(Number).filter(Boolean) : []

  return NextResponse.json({
    category: {
      id: category.id, name: category.name, slug: category.slug, parent: category.parent,
      description: category.description || '', productCount: total, depth: category.depth,
      image: category.image || null, path: breadcrumbs,
    },
    products: pagedProducts,
    total, page, perPage, totalPages,
    brands: availableBrands,
    attributes: availableAttributes,
    selectedBrands: selectedBrandIds,
    selectedAttrs: attrFilters,
    priceRange,
    minPrice: minPrice ?? priceRange.min,
    maxPrice: maxPrice ?? priceRange.max,
    inStockCount: allCatProducts.filter(p => p.inStock).length,
    onSaleCount: allCatProducts.filter(p => p.onSale).length,
    inStockOnly, onSaleOnly,
    childCategories: childCats,
    breadcrumbs,
  })
}
