/**
 * Aegisky Medusa - Data Import Script
 * Imports products/categories/brands from JSON mirror into PostgreSQL
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data', 'mirror');
const BATCH_SIZE = 500;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky'
  });
  await client.connect();
  console.log('[import] Connected to database');

  // ============ 1. Brands ============
  console.log('\n[import] === Brands ===');
  const brands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json'), 'utf8'));
  console.log(`[import] Found ${brands.length} brands`);

  await client.query('TRUNCATE TABLE aegisky_brands CASCADE');
  for (let i = 0; i < brands.length; i += BATCH_SIZE) {
    const batch = brands.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];
    let idx = 1;
    for (const b of batch) {
      placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++})`);
      values.push(b.id, b.name, b.slug, b.productCount || 0);
    }
    await client.query(
      `INSERT INTO aegisky_brands (id, name, slug, product_count) VALUES ${placeholders.join(',')}
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, product_count=EXCLUDED.product_count`,
      values
    );
    console.log(`  Brands: ${Math.min(i + BATCH_SIZE, brands.length)}/${brands.length}`);
  }

  // ============ 2. Categories ============
  console.log('\n[import] === Categories ===');
  const cats = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));
  console.log(`[import] Found ${cats.length} categories`);

  await client.query('TRUNCATE TABLE aegisky_categories CASCADE');
  for (let i = 0; i < cats.length; i += BATCH_SIZE) {
    const batch = cats.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];
    let idx = 1;
    for (const c of batch) {
      placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
      values.push(
        c.id, c.name, c.slug, c.parent || 0,
        c.description || null, c.image || null,
        c.productCount || 0, c.depth || 0,
        JSON.stringify(c.path || []), c.childrenCount || 0
      );
    }
    await client.query(
      `INSERT INTO aegisky_categories (id, name, slug, parent, description, image_url, product_count, depth, path, children_count)
       VALUES ${placeholders.join(',')}
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name, slug=EXCLUDED.slug, parent=EXCLUDED.parent,
         description=EXCLUDED.description, image_url=EXCLUDED.image_url,
         product_count=EXCLUDED.product_count, depth=EXCLUDED.depth,
         path=EXCLUDED.path, children_count=EXCLUDED.children_count`,
      values
    );
    console.log(`  Categories: ${Math.min(i + BATCH_SIZE, cats.length)}/${cats.length}`);
  }

  // ============ 3. Products ============
  console.log('\n[import] === Products ===');
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
  console.log(`[import] Found ${products.length} products`);

  await client.query('TRUNCATE TABLE aegisky_products CASCADE');
  let imported = 0;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];
    let idx = 1;
    for (const p of batch) {
      placeholders.push(`($${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++},$${idx++})`);
      values.push(
        p.id, p.name, p.slug, p.permalink || null, p.sku || null,
        p.type || 'simple', p.parent || 0,
        p.shortDescription || null, p.description || null,
        p.price || null, p.regularPrice || null, p.salePrice || null,
        p.onSale || false, p.currency || 'RUB',
        p.rating || 0, p.reviewCount || 0,
        JSON.stringify(p.categories || []), JSON.stringify(p.brands || []),
        JSON.stringify(p.tags || []), JSON.stringify(p.attributes || []),
        JSON.stringify(p.images || []), p.mainImage || null, p.imageCount || 0,
        JSON.stringify(p.videos || []), p.videoCount || 0,
        p.inStock !== false, p.stockStatus || 'instock',
        p.lowStockRemaining || null, p.isOnBackorder || false,
        p.weight || null, JSON.stringify(p.dimensions || null),
        p.formattedWeight || null, p.formattedDimensions || null,
        p.hasOptions || false, p.isPurchasable !== false, p.soldIndividually || false
      );
    }
    await client.query(
      `INSERT INTO aegisky_products (
        id, name, slug, permalink, sku, type, parent_id,
        short_description, description, price, regular_price, sale_price,
        on_sale, currency, rating, review_count,
        categories, brands, tags, attributes, images, main_image, image_count,
        videos, video_count, in_stock, stock_status,
        low_stock_remaining, is_on_backorder, weight, dimensions,
        formatted_weight, formatted_dimensions, has_options, is_purchasable, sold_individually
      ) VALUES ${placeholders.join(',')}
      ON CONFLICT (id) DO UPDATE SET
        name=EXCLUDED.name, slug=EXCLUDED.slug, permalink=EXCLUDED.permalink,
        sku=EXCLUDED.sku, type=EXCLUDED.type, parent_id=EXCLUDED.parent_id,
        short_description=EXCLUDED.short_description, description=EXCLUDED.description,
        price=EXCLUDED.price, regular_price=EXCLUDED.regular_price, sale_price=EXCLUDED.sale_price,
        on_sale=EXCLUDED.on_sale, currency=EXCLUDED.currency,
        rating=EXCLUDED.rating, review_count=EXCLUDED.review_count,
        categories=EXCLUDED.categories, brands=EXCLUDED.brands, tags=EXCLUDED.tags,
        attributes=EXCLUDED.attributes, images=EXCLUDED.images, main_image=EXCLUDED.main_image,
        image_count=EXCLUDED.image_count, videos=EXCLUDED.videos, video_count=EXCLUDED.video_count,
        in_stock=EXCLUDED.in_stock, stock_status=EXCLUDED.stock_status,
        low_stock_remaining=EXCLUDED.low_stock_remaining, is_on_backorder=EXCLUDED.is_on_backorder,
        weight=EXCLUDED.weight, dimensions=EXCLUDED.dimensions,
        formatted_weight=EXCLUDED.formatted_weight, formatted_dimensions=EXCLUDED.formatted_dimensions,
        has_options=EXCLUDED.has_options, is_purchasable=EXCLUDED.is_purchasable,
        sold_individually=EXCLUDED.sold_individually`,
      values
    );
    imported += batch.length;
    console.log(`  Products: ${imported}/${products.length}`);
  }

  // ============ 4. Product-Brand relationships ============
  console.log('\n[import] === Product-Brand relationships ===');
  await client.query('TRUNCATE TABLE aegisky_product_brands CASCADE');
  let relCount = 0;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];
    let idx = 1;
    for (const p of batch) {
      if (p.brands && Array.isArray(p.brands)) {
        for (const b of p.brands) {
          const bid = typeof b === 'object' ? b.id : b;
          if (bid) {
            placeholders.push(`($${idx++}, $${idx++})`);
            values.push(p.id, bid);
            relCount++;
          }
        }
      }
    }
    if (placeholders.length > 0) {
      await client.query(
        `INSERT INTO aegisky_product_brands (product_id, brand_id) VALUES ${placeholders.join(',')} ON CONFLICT DO NOTHING`,
        values
      );
    }
  }
  console.log(`  Inserted ${relCount} product-brand relationships`);

  // ============ 5. Product-Category relationships ============
  console.log('\n[import] === Product-Category relationships ===');
  await client.query('TRUNCATE TABLE aegisky_product_categories CASCADE');
  relCount = 0;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];
    let idx = 1;
    for (const p of batch) {
      if (p.categories && Array.isArray(p.categories)) {
        for (const c of p.categories) {
          const cid = typeof c === 'object' ? c.id : c;
          if (cid) {
            placeholders.push(`($${idx++}, $${idx++})`);
            values.push(p.id, cid);
            relCount++;
          }
        }
      }
    }
    if (placeholders.length > 0) {
      await client.query(
        `INSERT INTO aegisky_product_categories (product_id, category_id) VALUES ${placeholders.join(',')} ON CONFLICT DO NOTHING`,
        values
      );
    }
  }
  console.log(`  Inserted ${relCount} product-category relationships`);

  // ============ 6. Tags ============
  console.log('\n[import] === Tags ===');
  try {
    const tagsRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tags.json'), 'utf8'));
    const tags = Array.isArray(tagsRaw) ? tagsRaw : (tagsRaw.tags || []);
    if (tags.length > 0) {
      await client.query('TRUNCATE TABLE aegisky_tags CASCADE');
      const values = [];
      const placeholders = [];
      let idx = 1;
      for (const t of tags) {
        const tid = t.id || idx;
        placeholders.push(`($${idx++}, $${idx++}, $${idx++})`);
        values.push(tid, t.name || String(t), t.slug || String(t).toLowerCase().replace(/\s+/g, '-'));
      }
      await client.query(
        `INSERT INTO aegisky_tags (id, name, slug) VALUES ${placeholders.join(',')} ON CONFLICT DO NOTHING`,
        values
      );
      console.log(`  Inserted ${tags.length} tags`);
    }
  } catch(e) { console.log('  No tags file or empty'); }

  // ============ Verify ============
  console.log('\n[import] === Verification ===');
  const counts = await client.query(`
    SELECT 'products' as tbl, COUNT(*) as cnt FROM aegisky_products
    UNION ALL SELECT 'categories', COUNT(*) FROM aegisky_categories
    UNION ALL SELECT 'brands', COUNT(*) FROM aegisky_brands
    UNION ALL SELECT 'product_brands', COUNT(*) FROM aegisky_product_brands
    UNION ALL SELECT 'product_categories', COUNT(*) FROM aegisky_product_categories
  `);
  for (const row of counts.rows) {
    console.log(`  ${row.tbl}: ${row.cnt}`);
  }

  await client.end();
  console.log('\n[import] Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
