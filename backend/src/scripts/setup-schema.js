/**
 * Aegisky Medusa - Database Schema Setup
 * Creates custom tables for products, categories, brands, etc.
 */

const { Client } = require('pg')
const path = require('path')
const fs = require('fs')

// Load env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky'

async function setupSchema() {
  const client = new Client({ connectionString: CONNECTION_STRING })
  await client.connect()
  console.log('Connected to PostgreSQL')

  try {
    // Create extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    await client.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm";')

    // ============================================
    // Categories table (WooCommerce taxonomy)
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_categories (
        id INTEGER PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        parent INTEGER DEFAULT 0,
        description TEXT,
        image_url TEXT,
        product_count INTEGER DEFAULT 0,
        depth INTEGER DEFAULT 0,
        path JSONB DEFAULT '[]',
        children_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_categories_slug ON aegisky_categories(slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_categories_parent ON aegisky_categories(parent);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_categories_name_trgm ON aegisky_categories USING gin (name gin_trgm_ops);')

    // ============================================
    // Brands table
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_brands (
        id INTEGER PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        product_count INTEGER DEFAULT 0,
        logo_url TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_brands_slug ON aegisky_brands(slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON aegisky_brands USING gin (name gin_trgm_ops);')

    // ============================================
    // Tags table
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_tags (
        id INTEGER PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        product_count INTEGER DEFAULT 0
      );
    `)

    // ============================================
    // Attributes table
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_attributes (
        id INTEGER PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL,
        has_variations BOOLEAN DEFAULT false,
        product_count INTEGER DEFAULT 0,
        terms JSONB DEFAULT '[]'
      );
    `)

    // ============================================
    // Products table
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_products (
        id INTEGER PRIMARY KEY,
        name VARCHAR(1000) NOT NULL,
        slug VARCHAR(1000) NOT NULL UNIQUE,
        permalink TEXT,
        sku VARCHAR(500),
        type VARCHAR(100) DEFAULT 'simple',
        parent_id INTEGER DEFAULT 0,
        
        short_description TEXT,
        description TEXT,
        
        price DECIMAL(12,2),
        regular_price DECIMAL(12,2),
        sale_price DECIMAL(12,2),
        on_sale BOOLEAN DEFAULT false,
        currency VARCHAR(10) DEFAULT 'RUB',
        
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        
        categories JSONB DEFAULT '[]',
        brands JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        attributes JSONB DEFAULT '[]',
        
        images JSONB DEFAULT '[]',
        main_image TEXT,
        image_count INTEGER DEFAULT 0,
        
        videos JSONB DEFAULT '[]',
        video_count INTEGER DEFAULT 0,
        
        in_stock BOOLEAN DEFAULT true,
        stock_status VARCHAR(50) DEFAULT 'instock',
        low_stock_remaining INTEGER,
        is_on_backorder BOOLEAN DEFAULT false,
        
        weight DECIMAL(10,2),
        dimensions JSONB,
        formatted_weight VARCHAR(100),
        formatted_dimensions VARCHAR(200),
        
        has_options BOOLEAN DEFAULT false,
        is_purchasable BOOLEAN DEFAULT true,
        sold_individually BOOLEAN DEFAULT false,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_slug ON aegisky_products(slug);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_sku ON aegisky_products(sku);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_price ON aegisky_products(price);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_in_stock ON aegisky_products(in_stock);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON aegisky_products USING gin (name gin_trgm_ops);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_categories ON aegisky_products USING gin (categories);')
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_brands ON aegisky_products USING gin (brands);')

    // ============================================
    // Product-Category junction (for fast filtering)
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_product_categories (
        product_id INTEGER REFERENCES aegisky_products(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES aegisky_categories(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, category_id)
      );
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_pc_category ON aegisky_product_categories(category_id);')

    // ============================================
    // Product-Brand junction
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_product_brands (
        product_id INTEGER REFERENCES aegisky_products(id) ON DELETE CASCADE,
        brand_id INTEGER REFERENCES aegisky_brands(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, brand_id)
      );
    `)
    await client.query('CREATE INDEX IF NOT EXISTS idx_pb_brand ON aegisky_product_brands(brand_id);')

    // ============================================
    // RFQ table
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_rfqs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_email VARCHAR(500),
        customer_name VARCHAR(500),
        company VARCHAR(500),
        country VARCHAR(10),
        phone VARCHAR(100),
        message TEXT,
        items JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    console.log('✅ All tables created successfully')
  } catch (err) {
    console.error('Error setting up schema:', err)
    throw err
  } finally {
    await client.end()
  }
}

setupSchema().catch(console.error)
