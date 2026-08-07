import { NextResponse } from 'next/server'
import { getAllProducts, getAllCategories, getAllBrands } from '@/lib/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const lang = searchParams.get('lang') || 'en'

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ products: [], categories: [], brands: [] })
  }

  try {
    const query = q.toLowerCase().trim()
    const [products, categories, brands] = await Promise.all([
      getAllProducts(),
      getAllCategories(),
      getAllBrands(),
    ])

    // Search products - match name, sku, brand name
    const matchedProducts = products
      .filter(p => {
        const name = (p.name || '').toLowerCase()
        const sku = (p.sku || '').toLowerCase()
        const brandName = (p.brands?.[0]?.name || '').toLowerCase()
        return name.includes(query) || sku.includes(query) || brandName.includes(query)
      })
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        mainImage: p.mainImage,
        images: p.images,
        brands: p.brands,
        brandName: p.brands?.[0]?.name || '',
      }))

    // Search categories
    const matchedCategories = categories
      .filter(c => (c.name || '').toLowerCase().includes(query))
      .slice(0, 3)
      .map(c => ({ id: c.id, name: c.name, slug: c.slug }))

    // Search brands
    const matchedBrands = brands
      .filter(b => (b.name || '').toLowerCase().includes(query))
      .slice(0, 3)
      .map(b => ({ id: b.id, name: b.name, slug: b.slug }))

    return NextResponse.json({
      products: matchedProducts,
      categories: matchedCategories,
      brands: matchedBrands,
    })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ products: [], categories: [], brands: [] })
  }
}
