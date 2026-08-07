const { getDbClient, mapCategory } = require("../../../lib/db")

module.exports = {
  GET: async (req, res) => {
    const client = getDbClient()
    const parentId = req.query.parent_id
    const depth = req.query.depth

    try {
      let query = 'SELECT * FROM aegisky_categories'
      let params = []
      let conditions = []

      // Return all categories (restored to old structure)
      if (req.query.include_legacy !== 'true') {
        // No filter - return all categories
      }

      if (parentId !== undefined) {
        conditions.push('parent = $' + (params.length + 1))
        params.push(parentId === '0' ? 0 : parseInt(parentId))
      }

      if (depth) {
        conditions.push('depth = $' + (params.length + 1))
        params.push(parseInt(depth))
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }

      query += ' ORDER BY product_count DESC, name ASC'

      const result = await client.query(query, params)
      const categories = result.rows.map(mapCategory)

      res.json({ categories, total: categories.length })
    } catch (error) {
      console.error('Categories API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
