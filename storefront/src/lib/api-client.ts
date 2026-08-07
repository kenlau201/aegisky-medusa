// ============================================================
// Aegisky Medusa - Backend API Client
// Connects to Medusa.js backend at http://localhost:9000
// ============================================================

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
export const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a'

// Backwards compat
const API_BASE_URL = API_BASE

// Cache for server-side requests
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface FetchOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
  useCache?: boolean
  cacheTTL?: number
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, useCache = true, cacheTTL = CACHE_TTL } = options

  const cacheKey = `${method}:${endpoint}:${body ? JSON.stringify(body) : ''}`

  // Check cache (only for GET requests on server side)
  if (useCache && method === 'GET' && typeof window === 'undefined') {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data as T
    }
  }

  const url = `${API_BASE_URL}${endpoint}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY,
    ...headers,
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      // Next.js specific options
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    } as RequestInit)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error ${response.status}: ${errorText}`)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Cache successful GET responses
    if (useCache && method === 'GET' && typeof window === 'undefined') {
      cache.set(cacheKey, { data, timestamp: Date.now() })
    }

    return data as T
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    throw error
  }
}

// ============================================================
// Products API
// ============================================================

export interface ProductsResponse {
  products: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface ProductFilters {
  page?: number
  limit?: number
  category_id?: number
  brand_id?: number
  category?: string
  brand?: string
  sort?: string
  order?: 'asc' | 'desc'
  min_price?: number
  max_price?: number
  in_stock?: boolean
  q?: string
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })
  const query = params.toString() ? `?${params.toString()}` : ''
  return fetchAPI<ProductsResponse>(`/store/products${query}`)
}

export async function getProduct(slugOrId: string): Promise<{ product: any; relatedProducts: any[] }> {
  return fetchAPI(`/store/products/${encodeURIComponent(slugOrId)}`)
}

// ============================================================
// Categories API
// ============================================================

export interface CategoriesResponse {
  categories: any[]
  total: number
}

export async function getCategories(parentId?: number, depth?: number): Promise<CategoriesResponse> {
  const params = new URLSearchParams()
  if (parentId !== undefined) params.set('parent_id', String(parentId))
  if (depth !== undefined) params.set('depth', String(depth))
  const query = params.toString() ? `?${params.toString()}` : ''
  return fetchAPI<CategoriesResponse>(`/store/categories${query}`)
}

export async function getCategory(slug: string, page = 1, limit = 24): Promise<any> {
  return fetchAPI(`/store/categories/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`)
}

// ============================================================
// Brands API
// ============================================================

export interface BrandsResponse {
  brands: any[]
  grouped: Record<string, any[]>
  total: number
}

export async function getBrands(): Promise<BrandsResponse> {
  return fetchAPI<BrandsResponse>('/store/brands')
}

export async function getBrand(slug: string, page = 1, limit = 24): Promise<any> {
  return fetchAPI(`/store/brands/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`)
}

// ============================================================
// Search API
// ============================================================

export interface SearchResponse {
  products: any[]
  categories: any[]
  brands: any[]
  total: number
  pagination: {
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

export async function search(query: string, page = 1, limit = 24): Promise<SearchResponse> {
  return fetchAPI(`/store/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
}

export async function getSearchSuggestions(query: string): Promise<{ products: any[]; categories: any[]; brands: any[] }> {
  return fetchAPI(`/store/search/suggestions?q=${encodeURIComponent(query)}`)
}

// ============================================================
// RFQ API
// ============================================================

export async function submitRFQ(data: {
  customerEmail: string
  customerName: string
  company?: string
  country?: string
  phone?: string
  message?: string
  items: any[]
}): Promise<{ success: boolean; rfqId: string; message: string }> {
  return fetchAPI('/store/rfq', { method: 'POST', body: data, useCache: false })
}

// ============================================================
// Health check
// ============================================================

export async function checkAPIHealth(): Promise<boolean> {
  try {
    const data = await fetchAPI<{ status: string }>('/store/health', { useCache: false })
    return data.status === 'ok'
  } catch {
    return false
  }
}

// ============================================================
// API availability check (with fallback)
// ============================================================

let apiAvailable: boolean | null = null

export async function isAPIAvailable(): Promise<boolean> {
  if (apiAvailable !== null) return apiAvailable
  try {
    apiAvailable = await checkAPIHealth()
  } catch {
    apiAvailable = false
  }
  return apiAvailable
}

export function setAPIAvailable(available: boolean) {
  apiAvailable = available
}

// ============================================================
// Auth API (Sprint 4+)
// ============================================================

export async function registerCustomer(data: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  country?: string
}) {
  return fetchAPI('/store/auth/register', { method: 'POST', body: data, useCache: false })
}

export async function verifyEmail(token: string) {
  return fetchAPI(`/store/auth/verify-email?token=${encodeURIComponent(token)}`, { useCache: false })
}

export async function forgotPassword(email: string) {
  return fetchAPI('/store/auth/forgot-password', { method: 'POST', body: { email }, useCache: false })
}

export async function resetPassword(token: string, newPassword: string) {
  return fetchAPI('/store/auth/reset-password', { method: 'POST', body: { token, newPassword }, useCache: false })
}

// ============================================================
// Payments - Wire Transfer (Sprint 4+)
// ============================================================

export async function submitWireProof(data: {
  orderId: string
  amount: number
  currency: string
  bankReference?: string
  senderName?: string
  senderBank?: string
  notes?: string
}) {
  return fetchAPI('/store/payments/wire-proof', { method: 'POST', body: data, useCache: false })
}

// ============================================================
// Invoices (Sprint 4+)
// ============================================================

export function getInvoicePdfUrl(invoiceId: string): string {
  return `${API_BASE}/store/invoices/${invoiceId}/pdf?x-publishable-api-key=${PUBLISHABLE_KEY}`
}

// ============================================================
// Reviews API (Sprint 4+)
// ============================================================

export async function getProductReviews(productId: string | number) {
  return fetchAPI<{ reviews: any[]; stats: any }>(`/store/reviews?productId=${productId}`, { useCache: false })
}

export async function submitReview(data: {
  productId: string | number
  orderId?: string
  rating: number
  title?: string
  content?: string
  customerId?: string
}) {
  return fetchAPI('/store/reviews', { method: 'POST', body: data, useCache: false })
}

// ============================================================
// Shipping Tracking (Sprint 4+)
// ============================================================

export async function trackShipment(params: { trackingNumber?: string; carrier?: string; orderId?: string }) {
  const qs = new URLSearchParams()
  if (params.trackingNumber) qs.set('trackingNumber', params.trackingNumber)
  if (params.carrier) qs.set('carrier', params.carrier)
  if (params.orderId) qs.set('orderId', params.orderId)
  return fetchAPI<{ status: string; events: any[]; trackingUrl?: string }>(`/store/shipments/track?${qs.toString()}`, { useCache: false })
}

// ============================================================
// Supplier Applications (Sprint 4+)
// ============================================================

export async function submitSupplierApplication(data: {
  email: string
  companyName: string
  contactName: string
  phone?: string
  country?: string
  website?: string
  businessType?: string
  productCategories?: string[]
  yearEstablished?: number
  annualRevenue?: string
  certifications?: string[]
  message?: string
}) {
  return fetchAPI('/store/supplier-applications', { method: 'POST', body: data, useCache: false })
}

// ============================================================
// Admin API helpers (Sprint 4+)
// ============================================================

export function getAdminToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('aegisky_admin_token')
  }
  return null
}

export function adminAuthHeaders(): Record<string, string> {
  const token = getAdminToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export function adminExportOrdersUrl(status?: string): string {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  const token = getAdminToken()
  // Token will be sent via Authorization header in fetch
  return `${API_BASE}/store/admin/export/orders${params.toString() ? '?' + params.toString() : ''}`
}

export default {
  getProducts,
  getProduct,
  getCategories,
  getCategory,
  getBrands,
  getBrand,
  search,
  getSearchSuggestions,
  submitRFQ,
  checkAPIHealth,
  isAPIAvailable,
  registerCustomer,
  verifyEmail,
  forgotPassword,
  resetPassword,
  submitWireProof,
  getInvoicePdfUrl,
  getProductReviews,
  submitReview,
  trackShipment,
  submitSupplierApplication,
  adminExportOrdersUrl,
}
