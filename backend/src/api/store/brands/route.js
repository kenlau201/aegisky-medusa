const { getDbClient, mapBrand } = require("../../../lib/db")

module.exports = {
  GET: async (req, res) => {
    const client = getDbClient()

    try {
      const result = await client.query(
        'SELECT * FROM aegisky_brands ORDER BY name ASC'
      )
      const brands = result.rows.map(mapBrand)

      const grouped = {}
      for (const brand of brands) {
        const letter = brand.name.charAt(0).toUpperCase()
        if (!grouped[letter]) grouped[letter] = []
        grouped[letter].push(brand)
      }

      res.json({ brands, grouped, total: brands.length })
    } catch (error) {
      console.error('Brands API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
