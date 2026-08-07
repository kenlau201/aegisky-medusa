const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

(async () => {
  await c.connect();

  const origFile = 'D:\\项目备份\\Aegisky-Medusa\\aegisky-medusa\\data\\mirror\\products_backup_before_cleanup.json';
  const origArr = JSON.parse(fs.readFileSync(origFile, 'utf8'));
  const origMap = new Map(origArr.map(p => [Number(p.id), p]));

  const missingIds = [75763, 63439, 63147, 63139, 63131, 63123, 26064, 25583, 8522];

  // First, get a template from an existing simple product to match all field defaults
  const template = await c.query(`SELECT * FROM aegisky_products WHERE id = 63146`);
  const tpl = template.rows[0];

  let inserted = 0;
  for (const id of missingIds) {
    const p = origMap.get(id);
    if (!p) { console.log(`[${id}] not found in original`); continue; }

    // Check if already exists
    const exists = await c.query('SELECT id FROM aegisky_products WHERE id = $1', [id]);
    if (exists.rows.length > 0) {
      console.log(`[${id}] already exists, skipping`);
      continue;
    }

    // Build images array
    let images = [];
    if (Array.isArray(p.images)) {
      images = p.images.filter(img => typeof img === 'string' && img.startsWith('/'));
    }
    // If no real images, use placeholder
    if (images.length === 0) {
      images = ['/images/placeholder-product.svg'];
    }
    const mainImage = images[0];
    const imageCount = images.length;

    // Build categories JSON - ensure proper format
    let categories = p.categories || [];
    if (typeof categories === 'string') {
      try { categories = JSON.parse(categories); } catch(e) { categories = []; }
    }

    // Build brands
    let brands = p.brands || [];
    if (typeof brands === 'string') {
      try { brands = JSON.parse(brands); } catch(e) { brands = []; }
    }

    // Build attributes
    let attributes = p.attributes || [];
    if (typeof attributes === 'string') {
      try { attributes = JSON.parse(attributes); } catch(e) { attributes = []; }
    }

    // Build dimensions
    let dimensions = p.dimensions || { length: 0, width: 0, height: 0 };
    if (typeof dimensions === 'string') {
      try { dimensions = JSON.parse(dimensions); } catch(e) { dimensions = { length: 0, width: 0, height: 0 }; }
    }

    // Stock status
    let stockStatus = p.stock_status || { text: '', class: 'in-stock' };
    if (typeof stockStatus === 'string') {
      try { stockStatus = JSON.parse(stockStatus); } catch(e) { stockStatus = { text: '', class: 'in-stock' }; }
    }

    const price = p.price ? parseFloat(p.price) : 0;
    const regularPrice = p.regular_price ? parseFloat(p.regular_price) : price;
    const salePrice = p.sale_price ? parseFloat(p.sale_price) : price;

    const now = new Date();

    const query = `
      INSERT INTO aegisky_products (
        id, name, slug, permalink, sku, type, parent_id, short_description, description,
        price, regular_price, sale_price, on_sale, currency, rating, review_count,
        categories, brands, tags, attributes, images, main_image, image_count,
        videos, video_count, in_stock, stock_status, low_stock_remaining, is_on_backorder,
        weight, dimensions, formatted_weight, formatted_dimensions,
        has_options, is_purchasable, sold_individually, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17::jsonb, $18::jsonb, $19, $20::jsonb, $21::jsonb, $22, $23,
        $24::jsonb, $25, $26, $27::jsonb, $28, $29,
        $30, $31::jsonb, $32, $33,
        $34, $35, $36, $37, $38
      )
    `;

    const values = [
      id,
      p.name || '',
      p.slug || '',
      p.permalink || '#',
      p.sku || null,
      p.type || 'simple',
      p.parent_id || 0,
      p.short_description || null,
      p.description || null,
      price,
      regularPrice,
      salePrice,
      p.on_sale || false,
      p.currency || 'RUB',
      p.rating || 0,
      p.review_count || 0,
      JSON.stringify(categories),
      JSON.stringify(brands),
      p.tags || null,
      JSON.stringify(attributes),
      JSON.stringify(images),
      mainImage,
      imageCount,
      JSON.stringify(p.videos || []),
      p.video_count || 0,
      p.in_stock !== undefined ? p.in_stock : true,
      JSON.stringify(stockStatus),
      p.low_stock_remaining || null,
      p.is_on_backorder || false,
      p.weight || 0,
      JSON.stringify(dimensions),
      p.formatted_weight || null,
      p.formatted_dimensions || null,
      p.has_options || false,
      p.is_purchasable !== undefined ? p.is_purchasable : true,
      p.sold_individually || false,
      now,
      now
    ];

    try {
      await c.query(query, values);
      inserted++;
      console.log(`[${id}] INSERTED: ${p.name.substring(0, 60)} | price: ${price} | imgs: ${imageCount} | cats: ${categories.length}`);
    } catch (err) {
      console.log(`[${id}] FAILED: ${err.message}`);
    }
  }

  // Verify
  const total = await c.query('SELECT COUNT(*) as cnt FROM aegisky_products');
  console.log(`\nTotal products now: ${total.rows[0].cnt}`);

  // Check no duplicate IDs
  const dup = await c.query('SELECT id, COUNT(*) FROM aegisky_products GROUP BY id HAVING COUNT(*) > 1');
  console.log(`Duplicate IDs: ${dup.rows.length}`);

  await c.end();
})();
