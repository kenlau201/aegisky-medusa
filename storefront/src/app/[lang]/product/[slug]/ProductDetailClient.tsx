'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Star, ShoppingCart, Heart, Share2, Truck, Shield, Package, Check, Minus, Plus, ExternalLink, X, ChevronLeft, ChevronRight as ChevronRightIcon, ZoomIn } from 'lucide-react'
import type { Product } from '@/lib/data'
import { t, translateText, translateDescription, LanguageCode } from '@/i18n'
import { useCurrency } from '@/lib/currency-context'
import { useCart } from '@/lib/cart-context'
import { useRFQ } from '@/lib/rfq-context'
import ProductCard from '@/components/ProductCard'

// B2B Compliance: Determine HS code based on product type
function getHsCode(product: Product): string {
  const name = (product.name || '').toLowerCase()
  const cats = Array.isArray(product.categories) ? product.categories.map(c => c.name?.toLowerCase() || '') : []
  const allText = name + ' ' + cats.join(' ')

  if (allText.includes('аккумулятор') || allText.includes('battery') || allText.includes('li-po') || allText.includes('lipo') || allText.includes('li-ion')) {
    return '8507.60' // Lithium-ion batteries
  }
  if (allText.includes('двигатель') || allText.includes('motor') || allText.includes('brushless')) {
    return '8501.31' // DC motors < 750W
  }
  if (allText.includes('камера') || allText.includes('camera') || allText.includes('камеры') || allText.includes('fpv')) {
    if (allText.includes('camera') || allText.includes('камера')) return '8525.80' // TV cameras/digital cameras
  }
  if (allText.includes('пропеллер') || allText.includes('propeller') || allText.includes('blade') || allText.includes('frame') || allText.includes('рама')) {
    return '8806.90' // Parts of UAVs
  }
  if (allText.includes('квадрокоптер') || allText.includes('дрон') || allText.includes('drone') || allText.includes('quadcopter') || allText.includes('uav') || allText.includes('multirotor')) {
    return '8806.20' // Unmanned aircraft < 25kg
  }
  if (allText.includes('контроллер') || allText.includes('controller') || allText.includes('flight controller') || allText.includes('полетный')) {
    return '8543.70' // Other electrical equipment
  }
  if (allText.includes('gps') || allText.includes('модуль') || allText.includes('module') || allText.includes('receiver') || allText.includes('приемник')) {
    return '8526.91' // GPS receivers
  }
  return '8806.90' // Default: UAV parts
}

// B2B Compliance: Determine certifications based on product category
function getCertifications(product: Product): string[] {
  const certs = ['CE', 'FCC', 'RoHS']
  const name = (product.name || '').toLowerCase()
  const cats = Array.isArray(product.categories) ? product.categories.map(c => c.name?.toLowerCase() || '') : []
  const allText = name + ' ' + cats.join(' ')

  if (allText.includes('battery') || allText.includes('аккумулятор') || allText.includes('lipo') || allText.includes('li-ion')) {
    certs.push('UN38.3', 'MSDS')
  }
  if (allText.includes('drone') || allText.includes('дрон') || allText.includes('quadcopter') || allText.includes('квадрокоптер')) {
    certs.push('FCC Part 15', 'CE RED')
  }
  if (allText.includes('radio') || allText.includes('transmitter') || allText.includes('передатчик') || allText.includes('receiver') || allText.includes('приемник')) {
    certs.push('CE RED')
  }
  return certs
}

// Simple HTML sanitizer (preserves video tags)
function sanitizeHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*\S+/gi, '')
    .replace(/javascript:/gi, '')
}

// Split description HTML into segments with videos embedded at original positions
function parseDescriptionWithVideos(html: string, videos: Array<{ url: string; type?: string }>) {
  if (!html) return { segments: [] as Array<{ type: 'html'; content: string } | { type: 'video'; url: string; videoType?: string }> }

  // Match all video tags
  const videoRegex = /<video\b[^>]*>[\s\S]*?<\/video>/gi
  const segments: Array<{ type: 'html'; content: string } | { type: 'video'; url: string; videoType?: string }> = []

  let lastIndex = 0
  let videoIndex = 0
  let match

  while ((match = videoRegex.exec(html)) !== null) {
    // Add HTML before this video
    const htmlBefore = html.substring(lastIndex, match.index)
    if (htmlBefore.trim()) {
      segments.push({ type: 'html', content: htmlBefore })
    }

    // Extract video src from the matched tag
    const videoTag = match[0]
    let videoUrl = ''
    let videoType = 'video/mp4'

    // Try to find <source src="...">
    const sourceMatch = videoTag.match(/<source\s+[^>]*src=["']([^"']+)["']/i)
    if (sourceMatch) {
      videoUrl = sourceMatch[1]
      const typeMatch = sourceMatch[0].match(/type=["']([^"']+)["']/i)
      if (typeMatch) videoType = typeMatch[1]
    } else {
      // Try direct src on video tag
      const srcMatch = videoTag.match(/src=["']([^"']+)["']/i)
      if (srcMatch) videoUrl = srcMatch[1]
    }

    // Fallback to videos array if URL not found in HTML
    if (!videoUrl && videos[videoIndex]) {
      videoUrl = videos[videoIndex].url
      videoType = videos[videoIndex].type || 'video/mp4'
    }

    if (videoUrl) {
      segments.push({ type: 'video', url: videoUrl, videoType })
    }

    videoIndex++
    lastIndex = match.index + match[0].length
  }

  // Add remaining HTML after last video
  const htmlAfter = html.substring(lastIndex)
  if (htmlAfter.trim()) {
    segments.push({ type: 'html', content: htmlAfter })
  }

  return { segments }
}

interface ProductDetailClientProps {
  product: Product
  relatedProducts: Product[]
  lang: LanguageCode
}

export default function ProductDetailClient({ product, relatedProducts, lang }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Ensure client hydration matches server
  useEffect(() => {
    setMounted(true)
  }, [])

  const { format } = useCurrency()
  const { addItem } = useCart()
  const { addItem: addToRfq } = useRFQ()

  // Gallery images only (no videos) - memoize to prevent new array references
  const galleryImages = useMemo(() =>
    (product.images || []).filter((url): url is string => typeof url === 'string'),
    [product.images]
  )

  // Videos from product data - memoize
  const videos = useMemo(() =>
    (product.videos || []).filter((v): v is { url: string; type: string; local: boolean } =>
      v && typeof v.url === 'string'
    ),
    [product.videos]
  )

  // Price calculation
  const finalPrice = useMemo(() =>
    product.onSale && product.salePrice && product.salePrice < (product.regularPrice || product.price || 0)
      ? product.salePrice
      : (product.price || product.regularPrice || 0),
    [product.onSale, product.salePrice, product.regularPrice, product.price]
  )
  const hasDiscount = product.onSale && product.salePrice && product.regularPrice && product.salePrice < product.regularPrice

  // Translated content - memoize
  const translatedName = useMemo(() => translateText(product.name || '', lang), [product.name, lang])
  const brandName = product.brands?.[0]?.name || ''
  const primaryCategory = product.categories?.[0]
  const translatedCategories = useMemo(() => product.categories?.map(c => ({
    ...c,
    name: translateText(c.name, lang)
  })) || [], [product.categories, lang])

  // Cache short description translation
  const translatedShortDesc = useMemo(() =>
    product.shortDescription ? translateDescription(product.shortDescription, lang).replace(/<[^>]*>/g, '') : '',
    [product.shortDescription, lang]
  )

  // Navigation
  const goToImage = useCallback((idx: number) => {
    if (idx >= 0 && idx < galleryImages.length) {
      setSelectedImage(idx)
    }
  }, [galleryImages.length])

  const goNext = useCallback(() => {
    setSelectedImage(i => Math.min(i + 1, galleryImages.length - 1))
  }, [galleryImages.length])

  const goPrev = useCallback(() => {
    setSelectedImage(i => Math.max(i - 1, 0))
  }, [])

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') setLightboxIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setLightboxIndex(i => Math.min(galleryImages.length - 1, i + 1))
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, galleryImages.length, closeLightbox])

  // Preload ALL gallery images on mount for instant switching
  useEffect(() => {
    galleryImages.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [galleryImages])

  // Parse description with videos embedded at original positions
  // Memoize expensive description processing - only recompute when product/lang changes
  const { segments: descriptionSegments } = useMemo(() => {
    const rawDescription = translateDescription(product.description || '', lang)
    return parseDescriptionWithVideos(rawDescription, videos)
  }, [product.description, lang, videos])

  // Process HTML segments: sanitize, add lazy loading, etc.
  const processedSegments = useMemo(() => descriptionSegments.map(seg => {
    if (seg.type === 'html') {
      let content = sanitizeHtml(seg.content)
        .replace(/^\s*<\/p>\s*/gi, '')
        .replace(/\s*<\/p>\s*$/gi, '')
        .replace(/<p>\s*<\/p>/gi, '')
        .trim()
      content = content.replace(/<img\b/gi, '<img loading="lazy" decoding="async"')
      content = content.replace(/<a\s+href="https?:\/\//gi, '<a target="_blank" rel="noopener noreferrer" href="https://')
      return { ...seg, content }
    }
    return seg
  }), [descriptionSegments])

  const handleAddToCart = () => {
    addItem(product, quantity)
  }

  const handleAddToRfq = () => {
    addToRfq({
      id: product.id,
      slug: product.slug,
      name: translatedName,
      price: product.price || 0,
      image: product.mainImage,
      brand: brandName,
      sku: product.sku,
      quantity,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" suppressHydrationWarning>
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center flex-wrap gap-1">
        <Link href={`/${lang}`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.home')}</Link>
        <ChevronRight size={14} />
        <Link href={`/${lang}/categories`} className="hover:text-blue-600">{t(lang, 'breadcrumbs.catalog')}</Link>
        {primaryCategory && (
          <>
            <ChevronRight size={14} />
            <Link href={`/${lang}/category/${primaryCategory.slug}`} className="hover:text-blue-600">
              {translateText(primaryCategory.name, lang)}
            </Link>
          </>
        )}
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden group" suppressHydrationWarning>
            {/* Image counter */}
            {mounted && galleryImages.length > 1 && (
              <div className="absolute top-4 left-4 z-20 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                {selectedImage + 1} / {galleryImages.length}
              </div>
            )}

            {/* Zoom hint */}
            <div className="absolute top-4 right-4 z-20 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={12} />
              <span>Click to zoom</span>
            </div>

            {/* Navigation arrows */}
            {mounted && galleryImages.length > 1 && selectedImage > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 transition-transform duration-100 hover:scale-110 active:scale-90"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {mounted && galleryImages.length > 1 && selectedImage < galleryImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 transition-transform duration-100 hover:scale-110 active:scale-90"
                aria-label="Next image"
              >
                <ChevronRightIcon size={20} />
              </button>
            )}

            {/* Clickable overlay for lightbox */}
            <button
              type="button"
              onClick={() => openLightbox(selectedImage)}
              className="absolute inset-0 z-10 w-full h-full cursor-zoom-in"
              aria-label="Open image in lightbox"
            />

            {/* Main image - no key to avoid re-mount, instant src swap */}
            {galleryImages.length > 0 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={galleryImages[selectedImage]}
                alt={translatedName}
                className="w-full h-full object-contain p-8 select-none transition-opacity duration-100"
                draggable={false}
                loading="eager"
                decoding="async"
                style={{ opacity: 1 }}
              />
            )}
          </div>

          {/* Thumbnails */}
          {mounted && galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" suppressHydrationWarning>
              {galleryImages.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToImage(i)}
                  className={`w-20 h-20 shrink-0 border-2 rounded-lg overflow-hidden transition-colors duration-100 relative ${
                    selectedImage === i
                      ? 'border-blue-500 ring-2 ring-blue-100 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-contain p-2" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          {/* Brand */}
          {brandName && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600">{translateText(brandName, lang)}</span>
              {product.sku && <span className="text-sm text-gray-400">SKU: {product.sku}</span>}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{translatedName}</h1>

          {/* Short description */}
          {translatedShortDesc && (
            <p className="text-gray-600 leading-relaxed">
              {translatedShortDesc}
            </p>
          )}

          {/* Price */}
          <div className="py-4 border-t border-b border-gray-100">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-blue-600">
                {format(finalPrice)}
              </span>
              {hasDiscount && product.regularPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {format(product.regularPrice)}
                </span>
              )}
              {hasDiscount && product.regularPrice && product.salePrice && (
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  -{Math.round((1 - product.salePrice / product.regularPrice) * 100)}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">USD · Bulk pricing available</p>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {product.inStock !== false ? (
              <>
                <Check size={18} className="text-green-500" />
                <span className="text-green-600 font-medium">In Stock</span>
              </>
            ) : (
              <>
                <span className="text-orange-500">Out of Stock</span>
              </>
            )}
          </div>

          {/* Categories */}
          {translatedCategories.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Categories:</p>
              <div className="flex flex-wrap gap-2">
                {translatedCategories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/${lang}/category/${cat.slug}`}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>

          {/* RFQ + Wishlist + Share */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddToRfq}
              className="flex-1 h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-colors"
            >
              Request Quote
            </button>
            <button
              type="button"
              className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart size={20} />
            </button>
            <button
              type="button"
              className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              aria-label="Share"
            >
              <Share2 size={20} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <Truck size={24} className="mx-auto text-blue-600 mb-2" />
              <p className="text-xs text-gray-600">Worldwide Shipping</p>
            </div>
            <div className="text-center">
              <Shield size={24} className="mx-auto text-green-600 mb-2" />
              <p className="text-xs text-gray-600">Verified Suppliers</p>
            </div>
            <div className="text-center">
              <Package size={24} className="mx-auto text-orange-500 mb-2" />
              <p className="text-xs text-gray-600">Bulk Discounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`pb-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'description'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(lang, 'product.description')}
            </button>
            {product.attributes && product.attributes.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'specs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t(lang, 'product.specifications')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(lang, 'product.shipping')}
            </button>
          </div>
        </div>

        <div className="py-8">
          {/* Description tab with videos embedded at original positions */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              {processedSegments.length > 0 ? (
                processedSegments.map((segment, i) => {
                  if (segment.type === 'video') {
                    return (
                      <div key={`video-${i}`} className="max-w-3xl">
                        <video
                          src={segment.url}
                          controls
                          preload="metadata"
                          className="w-full aspect-video bg-black rounded-xl"
                          playsInline
                          controlsList="nodownload"
                        >
                          <source src={segment.url} type={segment.videoType || 'video/mp4'} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={`html-${i}`}
                      className="prose prose-lg max-w-none prose-img:rounded-xl prose-headings:text-gray-900"
                      suppressHydrationWarning
                      dangerouslySetInnerHTML={{ __html: segment.content }}
                    />
                  )
                })
              ) : (
                <p className="text-gray-500">{t(lang, 'product.noDescription')}</p>
              )}
            </div>
          )}

          {/* Specs tab */}
          {activeTab === 'specs' && product.attributes && product.attributes.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <tbody>
                  {product.attributes.map((attr, i) => (
                    <tr key={attr.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 w-1/3">
                        {translateText(attr.name, lang)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {attr.terms?.map(term => translateText(term.name, lang)).join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                  {product.formattedWeight && product.formattedWeight !== 'Н/Д' && (
                    <tr className="bg-white">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{t(lang, 'product.weight')}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{product.formattedWeight}</td>
                    </tr>
                  )}
                  {product.formattedDimensions && product.formattedDimensions !== 'Н/Д' && (
                    <tr className="bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{t(lang, 'product.dimensions')}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{product.formattedDimensions}</td>
                    </tr>
                  )}
                  {/* B2B Compliance Info */}
                  <tr className="bg-white">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {lang === 'ru' ? 'Код ТН ВЭД' : lang === 'zh' ? 'HS海关编码' : 'HS Code'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700 font-mono">
                      {getHsCode(product)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {lang === 'ru' ? 'Сертификация' : lang === 'zh' ? '合规认证' : 'Certifications'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      <div className="flex flex-wrap gap-1.5">
                        {getCertifications(product).map(cert => (
                          <span key={cert} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            ✓ {cert}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {lang === 'ru' ? 'Условия поставки' : lang === 'zh' ? '贸易条款' : 'Trade Terms'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">FOB, CIF, EXW, DDP</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {lang === 'ru' ? 'Мин. заказ' : lang === 'zh' ? '最小起订量' : 'Min. Order'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {product.type === 'simple' && product.price && product.price > 50000 ? '1 pc' : '1 pc (sample available)'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Shipping tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={20} className="text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      {lang === 'ru' ? 'Мировая доставка' : lang === 'zh' ? '全球配送' : 'Worldwide Shipping'}
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• DHL, FedEx, UPS Express (3-7 days)</li>
                    <li>• Air freight (7-14 days)</li>
                    <li>• Sea freight (30-45 days, bulk orders)</li>
                    <li>• {lang === 'ru' ? 'Склады в США, ЕС, Гонконге' : lang === 'zh' ? '美国、欧盟、香港海外仓' : 'Warehouses: US, EU, Hong Kong'}</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={20} className="text-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      {lang === 'ru' ? 'Торговые гарантии' : lang === 'zh' ? '贸易保障' : 'Trade Assurance'}
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• FOB / CIF / EXW / DDP Incoterms 2020</li>
                    <li>• {lang === 'ru' ? 'Защита платежей' : lang === 'zh' ? '支付保护' : 'Payment protection'}</li>
                    <li>• {lang === 'ru' ? 'Контроль качества' : lang === 'zh' ? '质量检验' : 'Quality inspection'}</li>
                    <li>• {lang === 'ru' ? 'Возврат и обмен' : lang === 'zh' ? '退换货保障' : 'Return & exchange'}</li>
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={20} className="text-amber-600" />
                    <h4 className="font-semibold text-gray-900">
                      {lang === 'ru' ? 'Оплата' : lang === 'zh' ? '支付方式' : 'Payment Methods'}
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• T/T Bank Transfer (B2B orders)</li>
                    <li>• PayPal, Stripe, Credit Card</li>
                    <li>• L/C (Letter of Credit, large orders)</li>
                    <li>• Western Union, MoneyGram</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={20} className="text-purple-600" />
                    <h4 className="font-semibold text-gray-900">
                      {lang === 'ru' ? 'Таможня' : lang === 'zh' ? '清关文件' : 'Customs & Docs'}
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Commercial Invoice & Packing List</li>
                    <li>• Certificate of Origin (CO/Form A)</li>
                    <li>• HS Code: {getHsCode(product)}</li>
                    <li>• {lang === 'ru' ? 'Декларация соответствия' : lang === 'zh' ? '符合性声明' : 'Declaration of Conformity'}</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {lang === 'ru' ? 'Информация о доставке' : lang === 'zh' ? '配送说明' : 'Shipping Information'}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t(lang, 'product.shipping1')}</li>
                  <li>• {t(lang, 'product.shipping2')}</li>
                  <li>• {t(lang, 'product.shipping3')}</li>
                  <li>• {t(lang, 'product.shipping4')}</li>
                  <li>• {lang === 'ru' ? 'Оптовые скидки обсуждаются индивидуально' : lang === 'zh' ? '批量订单可议价' : 'Bulk discounts available for volume orders'}</li>
                  <li>• {lang === 'ru' ? 'Свяжитесь с нами для расчета стоимости доставки' : lang === 'zh' ? '联系我们获取运费报价' : 'Contact us for custom shipping quotes'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t(lang, 'product.related')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between p-4 text-white relative z-20">
            <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {galleryImages.length}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition active:scale-90"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main image area */}
          <div className="flex-1 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Nav buttons */}
            {lightboxIndex > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(i => Math.max(0, i - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition active:scale-90"
                aria-label="Previous"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            {lightboxIndex < galleryImages.length - 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(i => Math.min(galleryImages.length - 1, i + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition active:scale-90"
                aria-label="Next"
              >
                <ChevronRightIcon size={28} />
              </button>
            )}

            {/* Image */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={lightboxIndex}
                src={galleryImages[lightboxIndex]}
                alt={translatedName}
                className="max-w-full max-h-full object-contain select-none animate-fadeIn"
                draggable={false}
                loading="eager"
              />
            </div>
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="p-4 flex justify-center gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
              {galleryImages.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-150 active:scale-90 ${
                    i === lightboxIndex ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-contain p-1" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
