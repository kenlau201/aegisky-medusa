/**
 * Sprint 2 - Database Index Optimization
 * 
 * Addresses Blind Spot 1: N+1 queries and performance
 * Target: All list API SQL execution < 50ms
 */
require('dotenv').config();
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky';

async function optimizeIndexes() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('=== Sprint 2: Database Index Optimization ===\n');

  try {
    // 1. Enable pg_stat_statements for query analysis
    console.log('1. Enabling pg_stat_statements extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pg_stat_statements');
    console.log('   ✓ pg_stat_statements enabled (query performance monitoring)');

    // 2. Products table indexes
    console.log('\n2. Creating products table indexes...');
    
    const productIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_slug ON aegisky_products(slug)',
      'CREATE INDEX IF NOT EXISTS idx_products_price ON aegisky_products(price)',
      'CREATE INDEX IF NOT EXISTS idx_products_type ON aegisky_products(type)',
      'CREATE INDEX IF NOT EXISTS idx_products_in_stock ON aegisky_products(in_stock)',
      'CREATE INDEX IF NOT EXISTS idx_products_on_sale ON aegisky_products(on_sale)',
      'CREATE INDEX IF NOT EXISTS idx_products_created_at ON aegisky_products(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON aegisky_products USING gin (name gin_trgm_ops)',
      'CREATE INDEX IF NOT EXISTS idx_products_sku ON aegisky_products(sku)',
      // GIN indexes for JSONB arrays (categories, brands, tags)
      'CREATE INDEX IF NOT EXISTS idx_products_categories ON aegisky_products USING gin (categories)',
      'CREATE INDEX IF NOT EXISTS idx_products_brands ON aegisky_products USING gin (brands)',
      'CREATE INDEX IF NOT EXISTS idx_products_tags ON aegisky_products USING gin (tags)',
    ];

    for (const sql of productIndexes) {
      await client.query(sql);
    }
    console.log(`   ✓ Created ${productIndexes.length} product indexes`);

    // 3. Categories table indexes
    console.log('\n3. Creating categories table indexes...');
    const categoryIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_categories_slug ON aegisky_categories(slug)',
      'CREATE INDEX IF NOT EXISTS idx_categories_parent ON aegisky_categories(parent)',
      'CREATE INDEX IF NOT EXISTS idx_categories_depth ON aegisky_categories(depth)',
      'CREATE INDEX IF NOT EXISTS idx_categories_name_trgm ON aegisky_categories USING gin (name gin_trgm_ops)',
    ];
    for (const sql of categoryIndexes) {
      await client.query(sql);
    }
    console.log(`   ✓ Created ${categoryIndexes.length} category indexes`);

    // 4. Product-category join table
    console.log('\n4. Creating join table indexes...');
    const joinIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_pc_product ON aegisky_product_categories(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_pc_category ON aegisky_product_categories(category_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_pc_unique ON aegisky_product_categories(product_id, category_id)',
      'CREATE INDEX IF NOT EXISTS idx_pb_product ON aegisky_product_brands(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_pb_brand ON aegisky_product_brands(brand_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_pb_unique ON aegisky_product_brands(product_id, brand_id)',
    ];
    for (const sql of joinIndexes) {
      await client.query(sql);
    }
    console.log(`   ✓ Created ${joinIndexes.length} join table indexes`);

    // 5. Orders table indexes
    console.log('\n5. Creating orders table indexes...');
    const orderIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_orders_number ON aegisky_orders(order_number)',
      'CREATE INDEX IF NOT EXISTS idx_orders_email ON aegisky_orders(customer_email)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON aegisky_orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON aegisky_orders(payment_status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created ON aegisky_orders(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_orders_customer ON aegisky_orders(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_pi ON aegisky_orders(stripe_payment_intent_id)',
    ];
    for (const sql of orderIndexes) {
      await client.query(sql);
    }
    console.log(`   ✓ Created ${orderIndexes.length} order indexes`);

    // 6. Order items indexes
    console.log('\n6. Creating order items indexes...');
    const itemIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_items_order ON aegisky_order_items(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_items_product ON aegisky_order_items(product_id)',
    ];
    for (const sql of itemIndexes) {
      await client.query(sql);
    }
    console.log(`   ✓ Created ${itemIndexes.length} order item indexes`);

    // 7. Stock reservations indexes
    console.log('\n7. Creating stock reservation indexes...');
    const stockIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_reservations_product ON aegisky_stock_reservations(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_reservations_order ON aegisky_stock_reservations(order_id)',
      'CREATE INDEX IF NOT EXISTS idx_reservations_status ON aegisky_stock_reservations(status)',
      'CREATE INDEX IF NOT EXISTS idx_reservations_expires ON aegisky_stock_reservations(expires_at)',
    ];
    for (const sql of stockIndexes) {
      await client.query(sql);
    }
    console.log(`   ✓ Created ${stockIndexes.length} stock indexes`);

    // 8. RFQ and quotes indexes
    console.log('\n8. Creating RFQ indexes...');
    const rfqIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_rfq_email ON aegisky_rfqs(customer_email)',
      'CREATE INDEX IF NOT EXISTS idx_rfq_status ON aegisky_rfqs(status)',
      'CREATE INDEX IF NOT EXISTS idx_rfq_created ON aegisky_rfqs(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_quotes_rfq ON aegisky_rfq_quotes(rfq_id)',
      'CREATE INDEX IF NOT EXISTS idx_quotes_supplier ON aegisky_rfq_quotes(supplier_email)',
      'CREATE INDEX IF NOT EXISTS idx_quotes_status ON aegisky_rfq_quotes(status)',
      'CREATE INDEX IF NOT EXISTS idx_negotiation_rfq ON aegisky_negotiation_log(rfq_id)',
    ];
    for (const sql of rfqIndexes) {
      await client.query(sql);
    }
    console.log(`   ✓ Created ${rfqIndexes.length} RFQ indexes`);

    // 9. Brands and tags indexes
    console.log('\n9. Creating brands/tags indexes...');
    const miscIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_brands_slug ON aegisky_brands(slug)',
      'CREATE INDEX IF NOT EXISTS idx_tags_slug ON aegisky_tags(slug)',
      'CREATE INDEX IF NOT EXISTS idx_attributes_slug ON aegisky_attributes(slug)',
    ];
    for (const sql of miscIndexes) {
      await client.query(sql);
    }
    console.log(`   ✓ Created ${miscIndexes.length} misc indexes`);

    // 10. Run ANALYZE to update statistics
    console.log('\n10. Running ANALYZE to update query planner statistics...');
    await client.query('ANALYZE aegisky_products');
    await client.query('ANALYZE aegisky_categories');
    await client.query('ANALYZE aegisky_orders');
    await client.query('ANALYZE aegisky_brands');
    console.log('   ✓ Table statistics updated');

    // Count total indexes
    const countResult = await client.query(`
      SELECT COUNT(*) as count FROM pg_indexes 
      WHERE tablename LIKE 'aegisky_%' AND schemaname = 'public'
    `);
    
    console.log(`\n=== Index Optimization Complete ===`);
    console.log(`Total aegisky_* indexes: ${countResult.rows[0].count}`);
    console.log('');
    console.log('Performance targets:');
    console.log('  - Product list with filters: < 50ms');
    console.log('  - Category page with products: < 80ms');
    console.log('  - Search with trigram: < 100ms');
    console.log('  - Order list: < 30ms');
    console.log('');
    console.log('Monitor with: SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 20;');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

optimizeIndexes();
