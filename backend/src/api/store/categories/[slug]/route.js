const { getDbClient, mapCategory, mapProduct } = require("../../../../lib/db")
const { LEGACY_CATEGORY_MAP } = require("../../../../lib/legacy-redirects")
const url = require("url")

function extractSlugFromUrl(req, resourceType) {
  let slug = ''
  if (req.params && req.params.slug) slug = req.params.slug
  if (!slug || slug === '%3Aslug' || slug === '[slug]') {
    const parsedUrl = url.parse(req.originalUrl || req.url || '')
    const pathParts = parsedUrl.pathname.split('/')
    const idx = pathParts.indexOf(resourceType)
    if (idx >= 0 && pathParts[idx + 1]) slug = pathParts[idx + 1]
  }
  if (req.query && req.query.slug) slug = req.query.slug
  try { slug = decodeURIComponent(slug) } catch {}
  return slug
}

module.exports = {
  GET: async (req, res) => {
    const client = getDbClient()
    const slug = extractSlugFromUrl(req, 'categories')
    const page = Math.max(1, parseInt(req.query?.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query?.perPage) || parseInt(req.query?.limit) || 24))
    const offset = (page - 1) * limit

    if (!slug) return res.status(400).json({ error: 'Slug is required' })

    try {
      const newSlug = LEGACY_CATEGORY_MAP[slug]
      if (newSlug) return res.redirect(301, `/store/categories/${encodeURIComponent(newSlug)}`)

      const catResult = await client.query(
        'SELECT * FROM aegisky_categories WHERE slug = $1 OR id::text = $1 LIMIT 1', [slug]
      )
      if (catResult.rows.length === 0) return res.status(404).json({ error: 'Category not found' })
      const category = mapCategory(catResult.rows[0])

      // Get all child category IDs (recursive)
      const childResult = await client.query(
        `WITH RECURSIVE cat_tree AS (
          SELECT id FROM aegisky_categories WHERE id = $1
          UNION ALL
          SELECT c.id FROM aegisky_categories c INNER JOIN cat_tree ct ON c.parent = ct.id
        ) SELECT id FROM cat_tree`, [category.id]
      )
      const allCatIds = childResult.rows.map(r => r.id)

      // Direct children
      const childrenResult = await client.query(
        'SELECT * FROM aegisky_categories WHERE parent = $1 ORDER BY product_count DESC', [category.id]
      )
      const children = childrenResult.rows.map(mapCategory)

      const breadcrumbs = category.path || []

      // Build filter conditions
      const params = [allCatIds]
      let paramIdx = 2
      const whereConditions = [
        `EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($1))`
      ]

      // Price filter
      const minPrice = req.query.min_price ? Number(req.query.min_price) : null
      const maxPrice = req.query.max_price ? Number(req.query.max_price) : null
      if (minPrice !== null) { whereConditions.push(`price >= $${paramIdx++}`); params.push(minPrice) }
      if (maxPrice !== null) { whereConditions.push(`price <= $${paramIdx++}`); params.push(maxPrice) }

      // Brand filter
      const brandFilter = req.query.brand_id ? parseInt(req.query.brand_id) : null
      const brandSlugFilter = req.query.brand || null
      if (brandFilter) {
        whereConditions.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(brands) AS br WHERE (br->>'id')::int = $${paramIdx++})`)
        params.push(brandFilter)
      } else if (brandSlugFilter) {
        whereConditions.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(brands) AS br WHERE br->>'slug' = $${paramIdx++})`)
        params.push(brandSlugFilter)
      }

      // Attribute filters: filter_attr_{id} or filter_attr_{slug} = term_id or term_slug
      // Also support multiple values: filter_attr_51=1,2,3
      const attrFilters = []
      for (const [key, value] of Object.entries(req.query)) {
        let attrId = null
        if (key.startsWith('filter_attr_')) {
          const idOrSlug = key.substring(12)
          if (/^\d+$/.test(idOrSlug)) {
            attrId = parseInt(idOrSlug)
          } else {
            // Look up attribute ID by slug - we'll do this in JS
            const attrIdResult = await client.query(
              `SELECT DISTINCT attr->>'id' as aid FROM aegisky_products, jsonb_array_elements(attributes) attr WHERE attr->>'slug' = $1 OR lower(attr->>'name') = lower($2) LIMIT 1`,
              [idOrSlug, idOrSlug.replace(/-/g, ' ')]
            )
            if (attrIdResult.rows.length > 0) attrId = parseInt(attrIdResult.rows[0].aid)
          }
        }
        if (attrId && value) {
          const termValues = String(value).split(',').map(v => v.trim()).filter(Boolean)
          if (termValues.length > 0) {
            const termOrs = []
            for (const tv of termValues) {
              if (/^\d+$/.test(tv)) {
                termOrs.push(`(term->>'id')::int = $${paramIdx++}`)
                params.push(parseInt(tv))
              } else {
                termOrs.push(`term->>'slug' = $${paramIdx++}`)
                params.push(tv)
              }
            }
            whereConditions.push(`EXISTS (
              SELECT 1 FROM jsonb_array_elements(attributes) attr, jsonb_array_elements(attr->'terms') term
              WHERE (attr->>'id')::int = $${paramIdx++} AND (${termOrs.join(' OR ')})
            )`)
            params.push(attrId)
            attrFilters.push({ attrId, termValues })
          }
        }
      }

      // In-stock filter
      const inStockOnly = req.query.in_stock === 'true' || req.query.in_stock === '1'
      if (inStockOnly) whereConditions.push(`in_stock = true`)

      // On-sale filter
      const onSaleOnly = req.query.on_sale === 'true' || req.query.on_sale === '1'
      if (onSaleOnly) whereConditions.push(`on_sale = true`)

      // Search
      const searchQ = req.query.q || req.query.search
      if (searchQ && searchQ.length >= 2) {
        whereConditions.push(`(name ILIKE $${paramIdx++} OR short_description ILIKE $${paramIdx++})`)
        params.push(`%${searchQ}%`)
        params.push(`%${searchQ}%`)
      }

      const whereClause = 'WHERE ' + whereConditions.join(' AND ')

      // Sorting
      const sortMap = {
        'price': 'price', 'price-asc': 'price ASC', 'price-desc': 'price DESC',
        'name': 'name', 'name-asc': 'name ASC', 'name-desc': 'name DESC',
        'rating': 'rating DESC', 'popularity': 'review_count DESC',
        'date': 'id DESC', 'newest': 'id DESC', 'oldest': 'id ASC'
      }
      const sortParam = (req.query.sort || 'default').toLowerCase()
      const orderBy = sortMap[sortParam] || 'id DESC'

      // Total count
      const countResult = await client.query(
        `SELECT COUNT(DISTINCT id) as total FROM aegisky_products ${whereClause}`, params
      )
      const total = parseInt(countResult.rows[0].total)

      // Products
      const prodResult = await client.query(
        `SELECT DISTINCT p.* FROM aegisky_products p ${whereClause}
         ORDER BY ${orderBy} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, limit, offset]
      )
      const products = prodResult.rows.map(mapProduct)

      // === Build filter data (facets) ===
      // For facets, we use the base category filter + already-applied filters EXCEPT the facet itself
      // For simplicity, we compute facets based on all products in category (not affected by other filters)
      // This is acceptable for B2B catalog performance

      // Price range
      const priceRangeResult = await client.query(
        `SELECT MIN(price)::int as min_p, MAX(price)::int as max_p FROM aegisky_products
         WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($1))
         AND price > 0`, [allCatIds]
      )
      const priceRange = {
        min: parseInt(priceRangeResult.rows[0].min_p) || 0,
        max: parseInt(priceRangeResult.rows[0].max_p) || 0
      }

      // Brands with counts
      const brandsResult = await client.query(`
        SELECT br->>'id' as bid, br->>'name' as bname, br->>'slug' as bslug, COUNT(DISTINCT p.id) as cnt
        FROM aegisky_products p, jsonb_array_elements(p.brands) br
        WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($1))
        GROUP BY bid, bname, bslug
        HAVING COUNT(DISTINCT p.id) > 0
        ORDER BY cnt DESC
      `, [allCatIds])
      const brands = brandsResult.rows.map(r => ({
        id: parseInt(r.bid), name: r.bname, slug: r.bslug, count: parseInt(r.cnt)
      }))

      // Attributes with terms and counts
      // Get all distinct attribute IDs/names used in this category's products
      const attrResult = await client.query(`
        SELECT DISTINCT attr->>'id' as aid, attr->>'name' as aname, attr->>'slug' as aslug
        FROM aegisky_products p, jsonb_array_elements(p.attributes) attr
        WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($1))
      `, [allCatIds])

      const attributes = []
      for (const ar of attrResult.rows) {
        const aid = parseInt(ar.aid)
        const termsResult = await client.query(`
          SELECT term->>'id' as tid, term->>'name' as tname, term->>'slug' as tslug, COUNT(DISTINCT p.id) as cnt
          FROM aegisky_products p, jsonb_array_elements(p.attributes) attr, jsonb_array_elements(attr->'terms') term
          WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($1))
          AND (attr->>'id')::int = $2
          GROUP BY tid, tname, tslug
          HAVING COUNT(DISTINCT p.id) > 0
          ORDER BY tname
        `, [allCatIds, aid])

        if (termsResult.rows.length >= 2) {
          attributes.push({
            id: aid,
            name: ar.aname,
            slug: ar.aslug || ar.aname.toLowerCase().replace(/\s+/g, '-'),
            terms: termsResult.rows.map(t => ({
              id: parseInt(t.tid),
              name: t.tname,
              slug: t.tslug,
              count: parseInt(t.cnt)
            }))
          })
        }
      }

      // Sort attributes by number of products (most useful first)
      attributes.sort((a, b) => {
        const totalA = a.terms.reduce((s, t) => s + t.count, 0)
        const totalB = b.terms.reduce((s, t) => s + t.count, 0)
        return totalB - totalA
      })

      // Stats
      const inStockResult = await client.query(
        `SELECT COUNT(DISTINCT id) as cnt FROM aegisky_products
         WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($1))
         AND in_stock = true`, [allCatIds]
      )
      const onSaleResult = await client.query(
        `SELECT COUNT(DISTINCT id) as cnt FROM aegisky_products
         WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(categories) AS cat WHERE (cat->>'id')::int = ANY($1))
         AND on_sale = true`, [allCatIds]
      )

      res.json({
        category,
        children,
        breadcrumbs,
        products,
        brands,
        attributes,
        priceRange,
        inStockCount: parseInt(inStockResult.rows[0].cnt),
        onSaleCount: parseInt(onSaleResult.rows[0].cnt),
        pagination: {
          page, limit, total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + limit < total
        }
      })
    } catch (error) {
      console.error('Category detail API error:', error)
      res.status(500).json({ error: 'Internal server error', details: error.message })
    }
  }
}
