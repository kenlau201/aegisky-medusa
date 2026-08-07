const { getDbClient } = require("../../../../lib/db")

module.exports = {
  GET: async (req, res) => {
    const client = getDbClient()
    const q = (req.query.q || '').trim()

    if (!q || q.length < 2) {
      return res.json({ products: [], categories: [], brands: [] })
    }

    try {
      const searchPattern = `${q}%`
      const containsPattern = `%${q}%`

      const prodResult = await client.query(
        `SELECT id, name, slug, price, images, main_image, brands FROM aegisky_products
         WHERE name ILIKE $1 OR name ILIKE $2
         ORDER BY CASE WHEN name ILIKE $1 THEN 0 ELSE 1 END, review_count DESC
         LIMIT 5`,
        [searchPattern, containsPattern]
      )
      const products = prodResult.rows.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        price: r.price ? Number(r.price) : null,
        images: r.images || [],
        mainImage: r.main_image,
        brandName: r.brands && r.brands[0] ? r.brands[0].name : ''
      }))

      const catResult = await client.query(
        `SELECT id, name, slug FROM aegisky_categories WHERE name ILIKE $1 LIMIT 3`,
        [containsPattern]
      )
      const categories = catResult.rows.map(r => ({
        id: r.id, name: r.name, slug: r.slug
      }))

      const brandResult = await client.query(
        `SELECT id, name, slug FROM aegisky_brands WHERE name ILIKE $1 LIMIT 3`,
        [containsPattern]
      )
      const brands = brandResult.rows.map(r => ({
        id: r.id, name: r.name, slug: r.slug
      }))

      res.json({ products, categories, brands })
    } catch (error) {
      console.error('Search suggestions API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
