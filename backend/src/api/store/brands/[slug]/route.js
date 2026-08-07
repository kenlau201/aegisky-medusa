const { getDbClient, mapBrand, mapProduct } = require("../../../../lib/db")
const url = require("url")

function extractSlugFromUrl(req, resourceType) {
  let slug = ''
  if (req.params && req.params.slug) {
    slug = req.params.slug
  }
  if (!slug || slug === '%3Aslug' || slug === '[slug]') {
    const parsedUrl = url.parse(req.originalUrl || req.url || '')
    const pathParts = parsedUrl.pathname.split('/')
    const idx = pathParts.indexOf(resourceType)
    if (idx >= 0 && pathParts[idx + 1]) {
      slug = pathParts[idx + 1]
    }
  }
  if (req.query && req.query.slug) {
    slug = req.query.slug
  }
  try { slug = decodeURIComponent(slug) } catch {}
  return slug
}

module.exports = {
  GET: async (req, res) => {
    const client = getDbClient()
    const slug = extractSlugFromUrl(req, 'brands')
    const page = Math.max(1, parseInt(req.query?.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query?.limit) || 24))
    const offset = (page - 1) * limit

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' })
    }

    try {
      const brandResult = await client.query(
        'SELECT * FROM aegisky_brands WHERE slug = $1 OR id::text = $1 LIMIT 1',
        [slug]
      )

      if (brandResult.rows.length === 0) {
        return res.status(404).json({ error: 'Brand not found' })
      }

      const brand = mapBrand(brandResult.rows[0])

      const countResult = await client.query(
        `SELECT COUNT(DISTINCT p.id) as total FROM aegisky_products p
         WHERE EXISTS (
           SELECT 1 FROM jsonb_array_elements(p.brands) AS br
           WHERE (br->>'id')::int = $1
         )`,
        [brand.id]
      )
      const total = parseInt(countResult.rows[0].total)

      const prodResult = await client.query(
        `SELECT DISTINCT p.* FROM aegisky_products p
         WHERE EXISTS (
           SELECT 1 FROM jsonb_array_elements(p.brands) AS br
           WHERE (br->>'id')::int = $1
         )
         ORDER BY p.id DESC
         LIMIT $2 OFFSET $3`,
        [brand.id, limit, offset]
      )
      const products = prodResult.rows.map(mapProduct)

      res.json({
        brand,
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + limit < total
        }
      })
    } catch (error) {
      console.error('Brand detail API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
