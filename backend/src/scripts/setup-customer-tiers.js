/**
 * Sprint 2 - Customer Tiers & Volume Pricing
 * 
 * Customer tiers:
 * - Bronze: default, 0% discount
 * - Silver: 5% discount, $10k+ spent
 * - Gold: 10% discount, $50k+ spent
 * - Platinum: 15% discount, $200k+ spent (negotiated)
 * 
 * Volume pricing: per-product quantity breaks
 */
require('dotenv').config();
const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky';

async function setupCustomerTiers() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  console.log('=== Sprint 2: Customer Tiers & Volume Pricing ===\n');

  try {
    // 1. Customer tiers table
    console.log('1. Creating customer tiers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_customer_tiers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
        min_spend NUMERIC(12,2) NOT NULL DEFAULT 0,
        min_orders INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        benefits JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✓ Customer tiers table created');

    // 2. Customer tier assignments
    console.log('2. Creating customer tier assignments...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_customer_tier_assignments (
        customer_email VARCHAR(255) PRIMARY KEY,
        tier_id VARCHAR(50) REFERENCES aegisky_customer_tiers(id),
        manually_assigned BOOLEAN DEFAULT false,
        total_spent NUMERIC(12,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0,
        assigned_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✓ Tier assignments table created');

    // 3. Volume pricing (quantity breaks per product)
    console.log('3. Creating volume pricing table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS aegisky_volume_pricing (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES aegisky_products(id) ON DELETE CASCADE,
        min_quantity INTEGER NOT NULL,
        discount_percent NUMERIC(5,2) NOT NULL,
        price_override NUMERIC(12,2),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(product_id, min_quantity)
      )
    `);
    console.log('   ✓ Volume pricing table created');

    // 4. Insert default tiers
    console.log('4. Inserting default tiers...');
    const tiers = [
      {
        id: 'bronze',
        name: 'Bronze',
        discount_percent: 0,
        min_spend: 0,
        min_orders: 0,
        description: 'Standard pricing for all new customers',
        benefits: ['Standard support', '15-minute stock reservation']
      },
      {
        id: 'silver',
        name: 'Silver',
        discount_percent: 5,
        min_spend: 10000,
        min_orders: 3,
        description: '5% automatic discount after $10k spent',
        benefits: ['5% off all orders', 'Priority support', '30-minute stock hold']
      },
      {
        id: 'gold',
        name: 'Gold',
        discount_percent: 10,
        min_spend: 50000,
        min_orders: 10,
        description: '10% discount for loyal B2B customers',
        benefits: ['10% off all orders', 'Dedicated account manager', 'Net-30 terms available', '60-minute stock hold']
      },
      {
        id: 'platinum',
        name: 'Platinum',
        discount_percent: 15,
        min_spend: 200000,
        min_orders: 25,
        description: '15% discount for enterprise partners (by approval)',
        benefits: ['15% off all orders', 'Custom pricing', 'Net-60 terms', 'Direct line to sales', 'Priority fulfillment']
      }
    ];

    for (const tier of tiers) {
      await client.query(
        `INSERT INTO aegisky_customer_tiers (id, name, discount_percent, min_spend, min_orders, description, benefits)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           discount_percent = EXCLUDED.discount_percent,
           min_spend = EXCLUDED.min_spend,
           min_orders = EXCLUDED.min_orders,
           description = EXCLUDED.description,
           benefits = EXCLUDED.benefits`,
        [tier.id, tier.name, tier.discount_percent, tier.min_spend, tier.min_orders, tier.description, JSON.stringify(tier.benefits)]
      );
    }
    console.log('   ✓ Default tiers inserted (Bronze/Silver/Gold/Platinum)');

    // 5. Indexes
    console.log('5. Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tier_assignments_email ON aegisky_customer_tier_assignments(customer_email);
      CREATE INDEX IF NOT EXISTS idx_tier_assignments_tier ON aegisky_customer_tier_assignments(tier_id);
      CREATE INDEX IF NOT EXISTS idx_volume_pricing_product ON aegisky_volume_pricing(product_id);
      CREATE INDEX IF NOT EXISTS idx_volume_pricing_qty ON aegisky_volume_pricing(min_quantity);
    `);
    console.log('   ✓ Indexes created');

    // 6. Function to calculate customer tier based on order history
    console.log('6. Creating tier calculation function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION recalculate_customer_tier(p_email VARCHAR)
      RETURNS VARCHAR AS $$
      DECLARE
        v_total_spent NUMERIC;
        v_total_orders INTEGER;
        v_tier VARCHAR(50);
      BEGIN
        -- Calculate customer stats from completed/paid orders
        SELECT COALESCE(SUM(total), 0), COUNT(*)
        INTO v_total_spent, v_total_orders
        FROM aegisky_orders
        WHERE customer_email = p_email
          AND status IN ('paid', 'processing', 'shipped', 'delivered', 'completed');

        -- Upsert assignment
        INSERT INTO aegisky_customer_tier_assignments
          (customer_email, total_spent, total_orders, updated_at)
        VALUES (p_email, v_total_spent, v_total_orders, NOW())
        ON CONFLICT (customer_email) DO UPDATE
          SET total_spent = EXCLUDED.total_spent,
              total_orders = EXCLUDED.total_orders,
              updated_at = NOW();

        -- Determine tier (only if not manually assigned)
        SELECT tier_id INTO v_tier
        FROM aegisky_customer_tier_assignments
        WHERE customer_email = p_email AND manually_assigned = true;

        IF v_tier IS NULL THEN
          IF v_total_spent >= 200000 AND v_total_orders >= 25 THEN
            v_tier := 'platinum';
          ELSIF v_total_spent >= 50000 AND v_total_orders >= 10 THEN
            v_tier := 'gold';
          ELSIF v_total_spent >= 10000 AND v_total_orders >= 3 THEN
            v_tier := 'silver';
          ELSE
            v_tier := 'bronze';
          END IF;

          UPDATE aegisky_customer_tier_assignments
          SET tier_id = v_tier
          WHERE customer_email = p_email;
        END IF;

        RETURN v_tier;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('   ✓ Tier calculation function created');

    console.log('\n=== Customer Tiers Setup Complete ===');
    console.log('');
    console.log('Tier structure:');
    console.log('  Bronze:   0% off  (default)');
    console.log('  Silver:   5% off  ($10k+ spent, 3+ orders)');
    console.log('  Gold:    10% off  ($50k+ spent, 10+ orders)');
    console.log('  Platinum:15% off  ($200k+ spent, 25+ orders, manual approval)');
    console.log('');
    console.log('Volume pricing: Use aegisky_volume_pricing for per-product quantity breaks');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

setupCustomerTiers();
