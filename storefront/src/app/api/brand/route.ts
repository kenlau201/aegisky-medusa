import { NextResponse } from 'next/server'
import { getAllProducts, getBrandBySlug } from '@/lib/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const sort = searchParams.get('sort') || 'featured'

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    // Use local JSON data (same mode as the rest of the site)
    const brand = getBrandBySlug(slug)
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    let allProducts = getAllProducts().filter(p => {
      const brands = Array.isArray(p.brands) ? p.brands : []
      return brands.some(b => b.slug === slug)
    })

    // Sort
    if (sort === 'price-asc') {
      allProducts.sort((a, b) => (parseFloat(String(a.price)) || 0) - (parseFloat(String(b.price)) || 0))
    } else if (sort === 'price-desc') {
      allProducts.sort((a, b) => (parseFloat(String(b.price)) || 0) - (parseFloat(String(a.price)) || 0))
    } else if (sort === 'name') {
      allProducts.sort((a, b) => a.name.localeCompare(b.name))
    }

    const total = allProducts.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const products = allProducts.slice(start, start + limit)

    return NextResponse.json({
      brand: { slug: brand.slug, name: brand.name, productCount: brand.productCount },
      products,
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error('Brand API error:', error)
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 })
  }
}
