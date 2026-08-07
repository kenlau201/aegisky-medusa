/**
 * Aegisky Medusa - Data Import Script
 * Imports products, categories, brands, tags, attributes from JSON mirror
 */

const { Client } = require('pg')
const path = require('path')
const fs = require('fs')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data', 'mirror')
const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky'

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename)
  console.log(`Loading ${filename}...`)
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

async function importData() {
  const client = new Client({ connectionString: CONNECTION_STRING })
  await client.connect()
  console.log('Connected to PostgreSQL')
  console.log(`Data directory: ${DATA_DIR}`)

  try {
    // Start transaction
    await client.query('BEGIN')

    // ============================================
    // 1. Import Categories
    // ============================================
    console.log('\n--- Importing Categories ---')
    const categories = loadJSON('categories.json')
    console.log(`Found ${categories.length} categories`)

    for (let i = 0; i < categories.length; i++) {
      const c = categories[i]
      await client.query(`
        INSERT INTO aegisky_categories (id, name, slug, parent, description, image_url, product_count, depth, path, children_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          parent = EXCLUDED.parent,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          product_count = EXCLUDED.product_count,
          depth = EXCLUDED.depth,
          path = EXCLUDED.path,
          children_count = EXCLUDED.children_count,
          updated_at = NOW()
      `, [
        c.id, c.name, c.slug, c.parent || 0,
        c.description || null, c.image || null,
        c.productCount || 0, c.depth || 0,
        JSON.stringify(c.path || []), c.childrenCount || 0
      ])
      if ((i + 1) % 200 === 0) console.log(`  Imported ${i + 1}/${categories.length} categories`)
    }
    console.log(`✅ ${categories.length} categories imported`)

    // ============================================
    // 2. Import Brands
    // ============================================
    console.log('\n--- Importing Brands ---')
    const brands = loadJSON('brands.json')
    console.log(`Found ${brands.length} brands`)

    for (let i = 0; i < brands.length; i++) {
      const b = brands[i]
      await client.query(`
        INSERT INTO aegisky_brands (id, name, slug, product_count)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          product_count = EXCLUDED.product_count
      `, [b.id, b.name, b.slug, b.productCount || 0])
      if ((i + 1) % 100 === 0) console.log(`  Imported ${i + 1}/${brands.length} brands`)
    }
    console.log(`✅ ${brands.length} brands imported`)

    // ============================================
    // 3. Import Tags
    // ============================================
    console.log('\n--- Importing Tags ---')
    const tags = loadJSON('tags.json')
    console.log(`Found ${tags.length} tags`)

    for (const t of tags) {
      await client.query(`
        INSERT INTO aegisky_tags (id, name, slug, product_count)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          product_count = EXCLUDED.product_count
      `, [t.id, t.name, t.slug, t.productCount || 0])
    }
    console.log(`✅ ${tags.length} tags imported`)

    // ============================================
    // 4. Import Attributes
    // ============================================
    console.log('\n--- Importing Attributes ---')
    const attributes = loadJSON('attributes.json')
    console.log(`Found ${attributes.length} attributes`)

    for (const a of attributes) {
      await client.query(`
        INSERT INTO aegisky_attributes (id, name, slug, has_variations, product_count, terms)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          has_variations = EXCLUDED.has_variations,
          product_count = EXCLUDED.product_count,
          terms = EXCLUDED.terms
      `, [
        a.id, a.name, a.slug,
        a.has_variations || a.hasVariations || false,
        a.productCount || 0,
        JSON.stringify(a.terms || [])
      ])
    }
    console.log(`✅ ${attributes.length} attributes imported`)

    // ============================================
    // 5. Import Products
    // ============================================
    console.log('\n--- Importing Products ---')
    const products = loadJSON('products.json')
    console.log(`Found ${products.length} products`)

    // Clear existing junction data
    await client.query('DELETE FROM aegisky_product_categories')
    await client.query('DELETE FROM aegisky_product_brands')

    let imported = 0
    for (let i = 0; i < products.length; i++) {
      const p = products[i]

      await client.query(`
        INSERT INTO aegisky_products (
          id, name, slug, permalink, sku, type, parent_id,
          short_description, description,
          price, regular_price, sale_price, on_sale, currency,
          rating, review_count,
          categories, brands, tags, attributes,
          images, main_image, image_count,
          videos, video_count,
          in_stock, stock_status, low_stock_remaining, is_on_backorder,
          weight, dimensions, formatted_weight, formatted_dimensions,
          has_options, is_purchasable, sold_individually
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9,
          $10, $11, $12, $13, $14,
          $15, $16,
          $17, $18, $19, $20,
          $21, $22, $23,
          $24, $25,
          $26, $27, $28, $29,
          $30, $31, $32, $33,
          $34, $35, $36
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          price = EXCLUDED.price,
          regular_price = EXCLUDED.regular_price,
          sale_price = EXCLUDED.sale_price,
          description = EXCLUDED.description,
          short_description = EXCLUDED.short_description,
          categories = EXCLUDED.categories,
          brands = EXCLUDED.brands,
          images = EXCLUDED.images,
          main_image = EXCLUDED.main_image,
          videos = EXCLUDED.videos,
          in_stock = EXCLUDED.in_stock,
          updated_at = NOW()
      `, [
        p.id, p.name, p.slug, p.permalink || null, p.sku || null, p.type || 'simple', p.parent || 0,
        p.shortDescription || null, p.description || null,
        p.price, p.regularPrice, p.salePrice, p.onSale || false, p.currency || 'RUB',
        p.rating ? Number(p.rating) : 0, p.reviewCount || 0,
        JSON.stringify(p.categories || []), JSON.stringify(p.brands || []),
        JSON.stringify(p.tags || []), JSON.stringify(p.attributes || []),
        JSON.stringify(p.images || []), p.mainImage || null, p.imageCount || 0,
        JSON.stringify(p.videos || []), p.videoCount || 0,
        p.inStock !== false, p.stockStatus || 'instock',
        p.lowStockRemaining || null, p.isOnBackorder || false,
        p.weight || null, JSON.stringify(p.dimensions || null),
        p.formattedWeight || null, p.formattedDimensions || null,
        p.hasOptions || false, p.isPurchasable !== false, p.soldIndividually || false
      ])

      // Insert category relations
      if (p.categories && Array.isArray(p.categories)) {
        for (const cat of p.categories) {
          if (cat && cat.id) {
            await client.query(`
              INSERT INTO aegisky_product_categories (product_id, category_id)
              VALUES ($1, $2) ON CONFLICT DO NOTHING
            `, [p.id, cat.id])
          }
        }
      }

      // Insert brand relations
      if (p.brands && Array.isArray(p.brands)) {
        for (const brand of p.brands) {
          if (brand && brand.id) {
            await client.query(`
              INSERT INTO aegisky_product_brands (product_id, brand_id)
              VALUES ($1, $2) ON CONFLICT DO NOTHING
            `, [p.id, brand.id])
          }
        }
      }

      imported++
      if (imported % 500 === 0) console.log(`  Imported ${imported}/${products.length} products`)
    }
    console.log(`✅ ${imported} products imported`)

    // Commit
    await client.query('COMMIT')

    // ============================================
    // Verify counts
    // ============================================
    console.log('\n--- Verification ---')
    const catCount = await client.query('SELECT COUNT(*) FROM aegisky_categories')
    const brandCount = await client.query('SELECT COUNT(*) FROM aegisky_brands')
    const prodCount = await client.query('SELECT COUNT(*) FROM aegisky_products')
    const pcCount = await client.query('SELECT COUNT(*) FROM aegisky_product_categories')
    const pbCount = await client.query('SELECT COUNT(*) FROM aegisky_product_brands')

    console.log(`Categories: ${catCount.rows[0].count}`)
    console.log(`Brands: ${brandCount.rows[0].count}`)
    console.log(`Products: ${prodCount.rows[0].count}`)
    console.log(`Product-Category relations: ${pcCount.rows[0].count}`)
    console.log(`Product-Brand relations: ${pbCount.rows[0].count}`)

    console.log('\n🎉 Data import complete!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Import failed:', err)
    throw err
  } finally {
    await client.end()
  }
}

importData().catch(console.error)
