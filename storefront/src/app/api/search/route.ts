import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const sort = searchParams.get('sort') || 'relevance'

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 0 })
  }

  try {
    const query = q.toLowerCase().trim()
    const allProducts = await getAllProducts()

    // Score-based search: name match > SKU match > brand match > description match
    const scored = allProducts
      .map(p => {
        const name = (p.name || '').toLowerCase()
        const sku = (p.sku || '').toLowerCase()
        const brandName = (p.brands?.[0]?.name || '').toLowerCase()
        const shortDesc = (p.shortDescription || '').toLowerCase()
        const categories = (p.categories || []).map(c => c.name.toLowerCase()).join(' ')

        let score = 0
        if (name.includes(query)) score += 100
        if (name.startsWith(query)) score += 50
        if (sku.includes(query)) score += 80
        if (brandName.includes(query)) score += 60
        if (categories.includes(query)) score += 40
        if (shortDesc.includes(query)) score += 20
        // Exact word match bonus
        const words = query.split(/\s+/)
        words.forEach(w => {
          if (name.includes(w)) score += 10
          if (brandName.includes(w)) score += 5
        })

        return { product: p, score }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => {
        if (sort === 'price-asc') return (a.product.price || 0) - (b.product.price || 0)
        if (sort === 'price-desc') return (b.product.price || 0) - (a.product.price || 0)
        if (sort === 'name') return (a.product.name || '').localeCompare(b.product.name || '')
        return b.score - a.score
      })

    const total = scored.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const products = scored.slice(start, start + limit).map(x => x.product)

    return NextResponse.json({ products, total, page, totalPages })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ products: [], total: 0, page: 1, totalPages: 0 })
  }
}
