/**
 * Sprint 4+: Add customers table with bcrypt auth, email verification, password reset
 * Also adds: wire transfer proofs, invoices, supplier applications, reviews
 */

const { getDbClient } = require('../lib/db')

async function setupAuthSchema() {
  const db = getDbClient()

  console.log('Setting up auth + extended schema...')

  // 1. Customers table with bcrypt password
  await db.query(`
    CREATE TABLE IF NOT EXISTS aegisky_customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      company VARCHAR(255),
      phone VARCHAR(50),
      country VARCHAR(100),
      role VARCHAR(50) DEFAULT 'buyer', -- buyer, supplier, admin
      email_verified BOOLEAN DEFAULT false,
      email_verify_token VARCHAR(255),
      email_verify_expires TIMESTAMPTZ,
      password_reset_token VARCHAR(255),
      password_reset_expires TIMESTAMPTZ,
      last_login TIMESTAMPTZ,
      login_count INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active', -- active, suspended, pending
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('  ✅ aegisky_customers table')

  // 2. Wire transfer proofs (for bank transfer payment method)
  await db.query(`
    CREATE TABLE IF NOT EXISTS aegisky_payment_proofs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id VARCHAR(255) REFERENCES aegisky_orders(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES aegisky_customers(id),
      proof_type VARCHAR(50) DEFAULT 'wire_transfer',
      file_name VARCHAR(255),
      file_url TEXT,
      amount NUMERIC NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      bank_reference VARCHAR(255),
      sender_name VARCHAR(255),
      sender_bank VARCHAR(255),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'submitted',
      reviewed_by VARCHAR(255),
      reviewed_at TIMESTAMPTZ,
      review_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('  ✅ aegisky_payment_proofs table (wire transfer)')

  // 3. Invoices table
  await db.query(`
    CREATE TABLE IF NOT EXISTS aegisky_invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_number VARCHAR(100) UNIQUE NOT NULL,
      order_id VARCHAR(255) REFERENCES aegisky_orders(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES aegisky_customers(id),
      invoice_date TIMESTAMPTZ DEFAULT NOW(),
      due_date TIMESTAMPTZ,
      status VARCHAR(50) DEFAULT 'issued',
      subtotal NUMERIC NOT NULL,
      tax_amount NUMERIC DEFAULT 0,
      shipping_amount NUMERIC DEFAULT 0,
      discount_amount NUMERIC DEFAULT 0,
      total NUMERIC NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      billing_address JSONB,
      company_info JSONB,
      line_items JSONB,
      payment_terms VARCHAR(255),
      notes TEXT,
      pdf_generated BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('  ✅ aegisky_invoices table')

  // 4. Supplier applications
  await db.query(`
    CREATE TABLE IF NOT EXISTS aegisky_supplier_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      company_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      country VARCHAR(100),
      website VARCHAR(500),
      business_type VARCHAR(100), -- manufacturer, distributor, wholesaler
      product_categories TEXT[],
      year_established INTEGER,
      annual_revenue VARCHAR(50),
      certifications TEXT[], -- ISO, CE, etc.
      message TEXT,
      status VARCHAR(50) DEFAULT 'pending', -- pending, reviewing, approved, rejected
      reviewed_by VARCHAR(255),
      reviewed_at TIMESTAMPTZ,
      review_notes TEXT,
      customer_id UUID REFERENCES aegisky_customers(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('  ✅ aegisky_supplier_applications table')

  // 5. Product reviews
  await db.query(`
    CREATE TABLE IF NOT EXISTS aegisky_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id INTEGER REFERENCES aegisky_products(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES aegisky_customers(id),
      order_id VARCHAR(255) REFERENCES aegisky_orders(id),
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(255),
      content TEXT,
      is_verified_purchase BOOLEAN DEFAULT false,
      is_approved BOOLEAN DEFAULT false,
      helpful_count INTEGER DEFAULT 0,
      images TEXT[],
      supplier_response TEXT,
      supplier_response_at TIMESTAMPTZ,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('  ✅ aegisky_reviews table')

  // 6. Shipment tracking
  await db.query(`
    CREATE TABLE IF NOT EXISTS aegisky_shipments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id VARCHAR(255) REFERENCES aegisky_orders(id) ON DELETE CASCADE,
      tracking_number VARCHAR(255),
      carrier VARCHAR(100),
      service VARCHAR(255),
      label_url TEXT,
      easypost_shipment_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'created',
      estimated_delivery TIMESTAMPTZ,
      shipped_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      weight_grams INTEGER,
      tracking_events JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('  ✅ aegisky_shipments table')

  // 7. Indexes for performance
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_customers_email ON aegisky_customers(email);
    CREATE INDEX IF NOT EXISTS idx_customers_role ON aegisky_customers(role);
    CREATE INDEX IF NOT EXISTS idx_customers_verify_token ON aegisky_customers(email_verify_token) WHERE email_verify_token IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_customers_reset_token ON aegisky_customers(password_reset_token) WHERE password_reset_token IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_payment_proofs_order ON aegisky_payment_proofs(order_id);
    CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON aegisky_payment_proofs(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_order ON aegisky_invoices(order_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_number ON aegisky_invoices(invoice_number);
    CREATE INDEX IF NOT EXISTS idx_supplier_apps_status ON aegisky_supplier_applications(status);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON aegisky_reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_approved ON aegisky_reviews(product_id, is_approved) WHERE is_approved = true;
    CREATE INDEX IF NOT EXISTS idx_shipments_order ON aegisky_shipments(order_id);
    CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON aegisky_shipments(tracking_number);
  `)
  console.log('  ✅ Indexes created')

  // 8. Invoice number sequence
  await db.query(`
    CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000
  `)

  console.log('\n✅ Auth + extended schema setup complete!')
}

setupAuthSchema().catch(console.error)
