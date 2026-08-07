const { getDbClient, mapProduct } = require("../../../lib/db")

module.exports = {
  GET: async (req, res) => {
    const client = getDbClient()

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24))
    const offset = (page - 1) * limit
    const categoryId = req.query.category_id
    const brandId = req.query.brand_id
    const categorySlug = req.query.category
    const brandSlug = req.query.brand
    const sort = req.query.sort || 'id'
    const order = (req.query.order || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    const minPrice = req.query.min_price ? Number(req.query.min_price) : null
    const maxPrice = req.query.max_price ? Number(req.query.max_price) : null
    const inStock = req.query.in_stock === 'true'
    const search = req.query.q

    try {
      let whereConditions = []
      let params = []
      let paramIndex = 1

      if (categoryId) {
        whereConditions.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = $${paramIndex})`)
        params.push(parseInt(categoryId))
        paramIndex++
      }

      if (brandId) {
        whereConditions.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(brands) AS br WHERE (br->>'id')::int = $${paramIndex})`)
        params.push(parseInt(brandId))
        paramIndex++
      }

      if (categorySlug) {
        const catResult = await client.query(
          'WITH RECURSIVE cat_tree AS (SELECT id, parent FROM aegisky_categories WHERE slug = $1 UNION ALL SELECT c.id, c.parent FROM aegisky_categories c INNER JOIN cat_tree ct ON c.parent = ct.id) SELECT id FROM cat_tree',
          [categorySlug]
        )
        const catIds = catResult.rows.map(r => r.id)
        if (catIds.length > 0) {
          whereConditions.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($${paramIndex}::int[]))`)
          params.push(catIds)
          paramIndex++
        }
      }

      if (brandSlug) {
        whereConditions.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(brands) AS br WHERE br->>'slug' = $${paramIndex})`)
        params.push(brandSlug)
        paramIndex++
      }

      if (minPrice !== null) {
        whereConditions.push(`price >= $${paramIndex}`)
        params.push(minPrice)
        paramIndex++
      }
      if (maxPrice !== null) {
        whereConditions.push(`price <= $${paramIndex}`)
        params.push(maxPrice)
        paramIndex++
      }

      if (inStock) {
        whereConditions.push(`in_stock = true`)
      }

      if (search && search.length >= 2) {
        whereConditions.push(`(name ILIKE $${paramIndex} OR short_description ILIKE $${paramIndex})`)
        params.push(`%${search}%`)
        paramIndex++
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

      const allowedSorts = ['id', 'name', 'price', 'created_at']
      const sortColumn = allowedSorts.includes(sort) ? sort : 'id'

      const countResult = await client.query(
        `SELECT COUNT(*) as total FROM aegisky_products ${whereClause}`,
        params
      )
      const total = parseInt(countResult.rows[0].total)

      const result = await client.query(
        `SELECT * FROM aegisky_products ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      )

      const products = result.rows.map(mapProduct)

      res.json({
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
      console.error('Products API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
