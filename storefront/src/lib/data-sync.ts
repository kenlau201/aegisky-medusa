/**
 * Data Sync Module - Export database to JSON files for frontend consumption
 * Called after admin CRUD operations to keep frontend in sync
 */
import { pool } from './control-tower/db'
import fs from 'fs'
import path from 'path'

// Both data directories need to be kept in sync
const DATA_DIRS = [
  path.join(process.cwd(), '..', 'data', 'mirror'),
  path.join(process.cwd(), 'data'),
]

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Decode HTML entities including numeric entities
function decodeHtml(str: string): string {
  if (!str) return str
  let result = str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
  result = result
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&times;/g, '\u00D7')
    .replace(/&divide;/g, '\u00F7')
    .replace(/&laquo;/g, '\u00AB')
    .replace(/&raquo;/g, '\u00BB')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&trade;/g, '\u2122')
    .replace(/&reg;/g, '\u00AE')
    .replace(/&copy;/g, '\u00A9')
    .replace(/&deg;/g, '\u00B0')
    .replace(/&plusmn;/g, '\u00B1')
  return result
}

function writeJsonToDirs(filename: string, data: any) {
  const json = JSON.stringify(data)
  for (const dir of DATA_DIRS) {
    try {
      ensureDir(dir)
      const filePath = path.join(dir, filename)
      // Write atomically using temp file then rename
      const tempPath = filePath + '.tmp'
      fs.writeFileSync(tempPath, json, 'utf-8')
      fs.renameSync(tempPath, filePath)
      console.log(`[data-sync] Wrote ${filename} to ${dir} (${(json.length / 1024 / 1024).toFixed(2)} MB)`)
    } catch (err) {
      console.error(`[data-sync] Failed to write ${filename} to ${dir}:`, err)
    }
  }
}

export async function syncProducts(): Promise<number> {
  console.log('[data-sync] Syncing products from database...')
  const result = await pool.query(`
    SELECT
      id, name, slug, sku, price, regular_price, sale_price,
      short_description, description, main_image,
      in_stock, stock_status, stock_quantity, on_sale, currency,
      images, videos, categories, brands, tags, attributes,
      image_count, video_count, weight, dimensions,
      rating, review_count, created_at
    FROM aegisky_products
    ORDER BY id
  `)

  const products = result.rows.map(p => ({
    id: p.id,
    name: decodeHtml(p.name),
    slug: p.slug,
    sku: p.sku || '',
    type: 'simple',
    parent: 0,
    shortDescription: decodeHtml(p.short_description || ''),
    description: decodeHtml(p.description || ''),
    price: p.price !== null ? Number(p.price) : null,
    regularPrice: p.regular_price !== null ? Number(p.regular_price) : null,
    salePrice: p.sale_price !== null ? Number(p.sale_price) : null,
    onSale: p.on_sale || false,
    currency: p.currency || 'USD',
    priceHtml: '',
    rating: p.rating || '0',
    reviewCount: p.review_count || 0,
    categories: Array.isArray(p.categories) ? p.categories : [],
    brands: Array.isArray(p.brands) ? p.brands : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    attributes: Array.isArray(p.attributes) ? p.attributes : [],
    images: Array.isArray(p.images) ? p.images : [],
    mainImage: p.main_image || (Array.isArray(p.images) ? p.images[0] : ''),
    imageCount: p.image_count || (Array.isArray(p.images) ? p.images.length : 0),
    videos: Array.isArray(p.videos) ? p.videos : [],
    videoCount: p.video_count || (Array.isArray(p.videos) ? p.videos.length : 0),
    galleryVideos: [],
    inStock: p.in_stock !== false,
    stockStatus: p.stock_status || 'instock',
    stockQuantity: p.stock_quantity || 100,
    lowStockRemaining: null,
    isOnBackorder: false,
    weight: p.weight || '',
    dimensions: p.dimensions || {},
    formattedWeight: '',
    formattedDimensions: '',
    hasOptions: false,
    isPurchasable: true,
    soldIndividually: false,
    variations: [],
    permalink: `/product/${p.slug}`,
    createdAt: p.created_at,
  }))

  writeJsonToDirs('products.json', products)
  console.log(`[data-sync] Synced ${products.length} products`)
  return products.length
}

export async function syncCategories(): Promise<number> {
  console.log('[data-sync] Syncing categories from database...')
  const result = await pool.query(`
    SELECT id, name, slug, parent, description, image_url,
           product_count, depth, path, children_count
    FROM aegisky_categories
    ORDER BY id
  `)

  const categories = result.rows.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent: c.parent || 0,
    description: c.description || '',
    imageUrl: c.image_url || null,
    image: c.image_url || null,
    productCount: c.product_count || 0,
    depth: c.depth || 0,
    path: Array.isArray(c.path) ? c.path : [],
    childrenCount: c.children_count || 0,
  }))

  writeJsonToDirs('categories.json', categories)
  console.log(`[data-sync] Synced ${categories.length} categories`)
  return categories.length
}

export async function syncBrands(): Promise<number> {
  console.log('[data-sync] Syncing brands from database...')
  const result = await pool.query(`
    SELECT id, name, slug, product_count, logo_url, description
    FROM aegisky_brands
    ORDER BY id
  `)

  const brands = result.rows.map(b => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    productCount: b.product_count || 0,
    logoUrl: b.logo_url || null,
    logo: b.logo_url || null,
    description: b.description || '',
  }))

  writeJsonToDirs('brands.json', brands)
  console.log(`[data-sync] Synced ${brands.length} brands`)
  return brands.length
}

export async function syncAll(): Promise<{ products: number; categories: number; brands: number }> {
  const [products, categories, brands] = await Promise.all([
    syncProducts(),
    syncCategories(),
    syncBrands(),
  ])
  return { products, categories, brands }
}
