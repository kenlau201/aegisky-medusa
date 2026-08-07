/**
 * Database connection helper
 */
const { Client } = require('pg')

let client = null

function getDbClient() {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky'
    })
    client.connect().catch(err => {
      console.error('Database connection error:', err)
      client = null
    })
  }
  return client
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    permalink: row.permalink,
    sku: row.sku,
    type: row.type,
    parent: row.parent_id,
    shortDescription: row.short_description,
    description: row.description,
    price: row.price ? Number(row.price) : null,
    regularPrice: row.regular_price ? Number(row.regular_price) : null,
    salePrice: row.sale_price ? Number(row.sale_price) : null,
    onSale: row.on_sale,
    currency: row.currency,
    rating: row.rating ? String(row.rating) : '0',
    reviewCount: row.review_count,
    categories: row.categories || [],
    brands: row.brands || [],
    tags: row.tags || [],
    attributes: row.attributes || [],
    images: row.images || [],
    mainImage: row.main_image,
    imageCount: row.image_count,
    videos: row.videos || [],
    videoCount: row.video_count,
    inStock: row.in_stock,
    stockStatus: row.stock_status,
    weight: row.weight,
    dimensions: row.dimensions,
    formattedWeight: row.formatted_weight,
    formattedDimensions: row.formatted_dimensions,
    hasOptions: row.has_options,
    isPurchasable: row.is_purchasable,
    soldIndividually: row.sold_individually,
  }
}

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parent: row.parent,
    description: row.description,
    image: row.image_url,
    productCount: row.product_count,
    depth: row.depth,
    path: row.path || [],
    childrenCount: row.children_count,
  }
}

function mapBrand(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    productCount: row.product_count,
    logo: row.logo_url,
    description: row.description,
  }
}

module.exports = { getDbClient, mapProduct, mapCategory, mapBrand }
