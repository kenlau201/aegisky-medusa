const { getDbClient, mapProduct } = require("../../../../lib/db")
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
    const slug = extractSlugFromUrl(req, 'products')

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' })
    }

    try {
      const result = await client.query(
        'SELECT * FROM aegisky_products WHERE slug = $1 OR id::text = $1 LIMIT 1',
        [slug]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' })
      }

      const product = mapProduct(result.rows[0])

      let relatedProducts = []
      if (product.categories && product.categories.length > 0) {
        const catIds = product.categories.map(c => c.id)
        // Use a simpler related products query
        const placeholders = catIds.map((_, i) => `$${i + 2}`).join(',')
        const relatedResult = await client.query(
          `SELECT DISTINCT p.* FROM aegisky_products p,
           jsonb_array_elements(p.categories) AS cat
           WHERE p.id != $1 AND (cat->>'id')::int = ANY($2::int[])
           ORDER BY p.id DESC LIMIT 8`,
          [product.id, catIds]
        )
        relatedProducts = relatedResult.rows.map(mapProduct)
      }

      res.json({ product, relatedProducts })
    } catch (error) {
      console.error('Product detail API error:', error)
      res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  }
}
