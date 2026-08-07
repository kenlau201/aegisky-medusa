/**
 * Aegisky Medusa - Sprint 1 Database Schema
 * Orders, Payments, Inventory Reservations, RFQ Quotes
 */
const { Client } = require('pg')
require('dotenv').config()

const connectionString = process.env.DATABASE_URL || 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky'

async function setupSprint1Schema() {
  const client = new Client({ connectionString })
  await client.connect()
  console.log('Connected to database')

  try {
    await client.query('BEGIN')

    // ============================================
    // 1. ORDERS - 订单主表
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_orders (
        id VARCHAR(50) PRIMARY KEY,
        order_number VARCHAR(30) UNIQUE NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_id VARCHAR(100),
        customer_name VARCHAR(255),
        customer_company VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_country VARCHAR(100),
        
        -- Financial
        subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
        tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        shipping_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        total DECIMAL(15,2) NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        
        -- Status machine
        status VARCHAR(30) NOT NULL DEFAULT 'draft',
        -- draft -> pending_payment -> paid -> processing -> shipped -> delivered -> completed
        -- -> cancelled -> refunded
        -- -> compensation_pending (special state for manual review)
        payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
        fulfillment_status VARCHAR(30) NOT NULL DEFAULT 'unfulfilled',
        
        -- Shipping
        shipping_address JSONB,
        billing_address JSONB,
        shipping_method VARCHAR(100),
        tracking_number VARCHAR(200),
        tracking_url TEXT,
        estimated_delivery DATE,
        
        -- RFQ link
        rfq_id UUID,
        quote_id UUID,
        quote_version INTEGER,
        
        -- Stripe
        stripe_payment_intent_id VARCHAR(100),
        stripe_customer_id VARCHAR(100),
        
        -- Metadata
        notes TEXT,
        admin_notes TEXT,
        compensation_reason TEXT,
        metadata JSONB DEFAULT '{}',
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        paid_at TIMESTAMPTZ,
        shipped_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ
      )
    `)

    // Order number sequence
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000
    `)

    // ============================================
    // 2. ORDER ITEMS - 订单商品
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR(50) NOT NULL REFERENCES aegisky_orders(id) ON DELETE CASCADE,
        product_id INTEGER,
        product_slug VARCHAR(500),
        product_name TEXT NOT NULL,
        sku VARCHAR(200),
        brand VARCHAR(255),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DECIMAL(15,2) NOT NULL,
        total_price DECIMAL(15,2) NOT NULL,
        specifications TEXT,
        reservation_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // ============================================
    // 3. PAYMENTS - 支付记录
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR(50) NOT NULL REFERENCES aegisky_orders(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        -- pending -> succeeded -> captured -> refunded
        -- -> failed -> compensation_pending
        
        -- Stripe fields
        stripe_payment_intent_id VARCHAR(100),
        stripe_charge_id VARCHAR(100),
        stripe_refund_id VARCHAR(100),
        stripe_receipt_url TEXT,
        
        -- Risk & review
        risk_score INTEGER,
        risk_level VARCHAR(20),
        failure_code VARCHAR(100),
        failure_message TEXT,
        refund_amount DECIMAL(15,2) DEFAULT 0,
        refund_reason TEXT,
        
        -- Webhook data
        raw_response JSONB,
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        captured_at TIMESTAMPTZ,
        refunded_at TIMESTAMPTZ
      )
    `)

    // ============================================
    // 4. STOCK RESERVATIONS - 库存预留
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_stock_reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id INTEGER NOT NULL,
        order_id VARCHAR(50) REFERENCES aegisky_orders(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'reserved',
        -- reserved -> captured -> released -> expired
        expires_at TIMESTAMPTZ NOT NULL,
        locked_by VARCHAR(100),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Index for finding expired reservations
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reservations_expires 
      ON aegisky_stock_reservations(expires_at) WHERE status = 'reserved'
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reservations_product 
      ON aegisky_stock_reservations(product_id, status)
    `)

    // ============================================
    // 5. RFQ QUOTES - 报价（带版本号）
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_rfq_quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL REFERENCES aegisky_rfqs(id) ON DELETE CASCADE,
        version INTEGER NOT NULL DEFAULT 1,
        
        -- Supplier info
        supplier_id VARCHAR(100),
        supplier_name VARCHAR(255) NOT NULL,
        supplier_email VARCHAR(255),
        supplier_phone VARCHAR(100),
        
        -- Quote details
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        unit_price DECIMAL(15,2),
        total_price DECIMAL(15,2),
        quantity INTEGER,
        moq INTEGER,
        lead_time_days INTEGER,
        shipping_cost DECIMAL(15,2) DEFAULT 0,
        payment_terms VARCHAR(255),
        incoterms VARCHAR(10) DEFAULT 'EXW',
        valid_until DATE,
        
        -- Negotiation
        status VARCHAR(30) NOT NULL DEFAULT 'submitted',
        -- submitted -> sent -> viewed -> accepted -> rejected -> countered -> expired -> converted
        buyer_message TEXT,
        supplier_message TEXT,
        terms_and_conditions TEXT,
        
        -- Conversion
        converted_order_id VARCHAR(50) REFERENCES aegisky_orders(id) ON DELETE SET NULL,
        converted_at TIMESTAMPTZ,
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        UNIQUE(rfq_id, version)
      )
    `)

    // ============================================
    // 6. NEGOTIATION LOG - 沟通日志
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_negotiation_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL REFERENCES aegisky_rfqs(id) ON DELETE CASCADE,
        quote_id UUID REFERENCES aegisky_rfq_quotes(id) ON DELETE SET NULL,
        actor_type VARCHAR(20) NOT NULL, -- buyer, supplier, admin, system
        actor_id VARCHAR(100),
        actor_name VARCHAR(255),
        action VARCHAR(50) NOT NULL,
        -- created, quote_submitted, quote_viewed, counter_offer, accepted, rejected, order_created, message
        message TEXT,
        old_value JSONB,
        new_value JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // ============================================
    // 7. COMPENSATION LOG - 补偿/异常日志
    // ============================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_compensation_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR(50) REFERENCES aegisky_orders(id) ON DELETE SET NULL,
        payment_id UUID REFERENCES aegisky_payments(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        -- payment_success_stock_failed, shipping_failed, customer_dispute, admin_override
        severity VARCHAR(20) NOT NULL DEFAULT 'warning',
        -- info, warning, critical
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        -- pending -> reviewing -> resolved -> waived
        description TEXT NOT NULL,
        error_details JSONB,
        resolution TEXT,
        resolved_by VARCHAR(100),
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query('COMMIT')
    console.log('✅ Sprint 1 schema created successfully')
    console.log('   - aegisky_orders')
    console.log('   - aegisky_order_items')
    console.log('   - aegisky_payments')
    console.log('   - aegisky_stock_reservations')
    console.log('   - aegisky_rfq_quotes (with versioning)')
    console.log('   - aegisky_negotiation_log')
    console.log('   - aegisky_compensation_log')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Schema creation failed:', error)
    throw error
  } finally {
    await client.end()
  }
}

setupSprint1Schema().catch(console.error)
