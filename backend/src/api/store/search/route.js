const { getDbClient, mapProduct, mapCategory, mapBrand } = require("../../../lib/db")

module.exports = {
  GET: async (req, res) => {
    const client = getDbClient()
    const q = (req.query.q || '').trim()

    if (!q || q.length < 2) {
      return res.json({ products: [], categories: [], brands: [], total: 0 })
    }

    const limit = Math.min(50, parseInt(req.query.limit) || 24)
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const offset = (page - 1) * limit

    try {
      const searchPattern = `%${q}%`

      const prodResult = await client.query(
        `SELECT * FROM aegisky_products
         WHERE name ILIKE $1 OR short_description ILIKE $1 OR sku ILIKE $1
         ORDER BY
           CASE WHEN name ILIKE $2 THEN 0 ELSE 1 END,
           review_count DESC,
           id DESC
         LIMIT $3 OFFSET $4`,
        [searchPattern, `${q}%`, limit, offset]
      )
      const products = prodResult.rows.map(mapProduct)

      const countResult = await client.query(
        `SELECT COUNT(*) as total FROM aegisky_products
         WHERE name ILIKE $1 OR short_description ILIKE $1 OR sku ILIKE $1`,
        [searchPattern]
      )
      const total = parseInt(countResult.rows[0].total)

      const catResult = await client.query(
        `SELECT * FROM aegisky_categories WHERE name ILIKE $1 ORDER BY product_count DESC LIMIT 10`,
        [searchPattern]
      )
      const categories = catResult.rows.map(mapCategory)

      const brandResult = await client.query(
        `SELECT * FROM aegisky_brands WHERE name ILIKE $1 ORDER BY product_count DESC LIMIT 10`,
        [searchPattern]
      )
      const brands = brandResult.rows.map(mapBrand)

      res.json({
        products,
        categories,
        brands,
        total,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + limit < total
        }
      })
    } catch (error) {
      console.error('Search API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
