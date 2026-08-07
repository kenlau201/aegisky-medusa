/**
 * Replace all COPTERPARTS.RU → AEGISKY.COM, copterparts.ru → aegisky.com,
 * COPTERPARTS → AEGISKY, Copterparts → Aegisky in runtime data files and database
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT = path.join(__dirname, '..', '..');

// Replacement rules (order matters - longer/more specific first)
function replaceText(text) {
  if (typeof text !== 'string') return text;
  return text
    // URLs first (most specific)
    .replace(/https?:\/\/(www\.)?copterparts\.ru/gi, 'https://aegisky.com')
    .replace(/copterparts\.ru/gi, 'aegisky.com')
    // Brand names
    .replace(/COPTERPARTS\.RU/g, 'AEGISKY.COM')
    .replace(/COPTERPARTS/g, 'AEGISKY')
    .replace(/Copterparts/g, 'Aegisky')
    .replace(/copterparts/g, 'aegisky');
}

function processObject(obj, depth = 0) {
  if (depth > 10) return obj;
  if (typeof obj === 'string') return replaceText(obj);
  if (Array.isArray(obj)) return obj.map(item => processObject(item, depth + 1));
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = processObject(value, depth + 1);
    }
    return result;
  }
  return obj;
}

// Files to process (runtime data only)
const dataFiles = [
  path.join(ROOT, 'data', 'mirror', 'products.json'),
  path.join(ROOT, 'data', 'mirror', 'categories.json'),
  path.join(ROOT, 'data', 'mirror', 'brands.json'),
  path.join(ROOT, 'storefront', 'data', 'products.json'),
  path.join(ROOT, 'storefront', 'data', 'categories.json'),
  path.join(ROOT, 'backend', 'data', 'mirror', 'products.json'),
  path.join(ROOT, 'backend', 'data', 'mirror', 'categories.json'),
];

let totalReplacements = 0;

for (const filePath of dataFiles) {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${filePath}`);
    continue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const before = (raw.match(/copterparts/gi) || []).length;
    if (before === 0) {
      console.log(`OK (no matches): ${path.basename(filePath)}`);
      continue;
    }
    const data = JSON.parse(raw);
    const processed = processObject(data);
    fs.writeFileSync(filePath, JSON.stringify(processed, null, 2), 'utf8');
    const afterRaw = fs.readFileSync(filePath, 'utf8');
    const after = (afterRaw.match(/copterparts/gi) || []).length;
    console.log(`FIXED: ${path.relative(ROOT, filePath)} - ${before} occurrences → ${after} remaining`);
    totalReplacements += before;
  } catch (e) {
    console.error(`ERROR processing ${filePath}: ${e.message}`);
  }
}

console.log(`\nTotal replacements in files: ${totalReplacements}`);

// Now update database
async function updateDatabase() {
  const client = new Client({
    connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky'
  });
  await client.connect();
  console.log('\n--- Updating database ---');

  // Count before
  const beforeCount = await client.query(`
    SELECT COUNT(*) as cnt FROM aegisky_products
    WHERE description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%' OR name ILIKE '%copterparts%'
  `);
  console.log(`Products with copterparts references: ${beforeCount.rows[0].cnt}`);

  // Update products
  const prodRes = await client.query(`
    UPDATE aegisky_products SET
      description = REPLACE(REPLACE(REPLACE(REPLACE(
        description,
        'https://copterparts.ru', 'https://aegisky.com'),
        'http://copterparts.ru', 'https://aegisky.com'),
        'COPTERPARTS.RU', 'AEGISKY.COM'),
        'COPTERPARTS', 'AEGISKY'),
      short_description = REPLACE(REPLACE(REPLACE(REPLACE(
        short_description,
        'https://copterparts.ru', 'https://aegisky.com'),
        'http://copterparts.ru', 'https://aegisky.com'),
        'COPTERPARTS.RU', 'AEGISKY.COM'),
        'COPTERPARTS', 'AEGISKY')
    WHERE description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%'
  `);
  console.log(`Products updated: ${prodRes.rowCount}`);

  // Case-insensitive replacements for Copterparts/copterparts in description
  await client.query(`
    UPDATE aegisky_products SET
      description = REGEXP_REPLACE(description, 'copterparts\.ru', 'aegisky.com', 'gi'),
      short_description = REGEXP_REPLACE(short_description, 'copterparts\.ru', 'aegisky.com', 'gi')
    WHERE description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%'
  `);
  await client.query(`
    UPDATE aegisky_products SET
      description = REGEXP_REPLACE(description, 'copterparts', 'aegisky', 'gi'),
      short_description = REGEXP_REPLACE(short_description, 'copterparts', 'aegisky', 'gi')
    WHERE description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%'
  `);
  console.log('Case-insensitive replacements done for products');

  // Update categories
  const catBefore = await client.query(`SELECT COUNT(*) as cnt FROM aegisky_categories WHERE description ILIKE '%copterparts%'`);
  console.log(`Categories with copterparts: ${catBefore.rows[0].cnt}`);
  await client.query(`
    UPDATE aegisky_categories SET
      description = REGEXP_REPLACE(REGEXP_REPLACE(
        description, 'copterparts\.ru', 'aegisky.com', 'gi'),
        'copterparts', 'aegisky', 'gi'),
      image_url = REPLACE(REPLACE(image_url, 'https://copterparts.ru', 'https://aegisky.com'), 'http://copterparts.ru', 'https://aegisky.com')
    WHERE description ILIKE '%copterparts%' OR image_url ILIKE '%copterparts%'
  `);

  // Update brand name "Copterparts" → "Aegisky"
  const brandRes = await client.query(`
    UPDATE aegisky_brands SET name = 'Aegisky', slug = 'aegisky'
    WHERE name ILIKE 'copterparts'
  `);
  console.log(`Brands renamed: ${brandRes.rowCount}`);

  // Also update brand references in products.brands JSONB
  await client.query(`
    UPDATE aegisky_products
    SET brands = (
      SELECT jsonb_agg(
        CASE
          WHEN value->>'name' ILIKE 'copterparts'
          THEN value || jsonb_build_object('name', 'Aegisky', 'slug', 'aegisky')
          ELSE value
        END
      )
      FROM jsonb_array_elements(brands)
    )
    WHERE brands::text ILIKE '%copterparts%'
  `);
  console.log('Brand references in products updated');

  // Verify
  const afterCount = await client.query(`
    SELECT COUNT(*) as cnt FROM aegisky_products
    WHERE description ILIKE '%copterparts%' OR short_description ILIKE '%copterparts%'
  `);
  console.log(`\nRemaining products with copterparts: ${afterCount.rows[0].cnt}`);

  const afterCat = await client.query(`SELECT COUNT(*) as cnt FROM aegisky_categories WHERE description ILIKE '%copterparts%'`);
  console.log(`Remaining categories with copterparts: ${afterCat.rows[0].cnt}`);

  // Re-export products.json from database
  console.log('\n--- Re-exporting products.json from database ---');
  const prods = await client.query(`SELECT * FROM aegisky_products ORDER BY id`);
  const exportData = prods.rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    permalink: row.permalink,
    sku: row.sku,
    type: row.type,
    parent_id: row.parent_id,
    short_description: row.short_description,
    description: row.description,
    price: row.price,
    regular_price: row.regular_price,
    sale_price: row.sale_price,
    on_sale: row.on_sale,
    currency: row.currency,
    rating: row.rating,
    review_count: row.review_count,
    categories: row.categories,
    brands: row.brands,
    tags: row.tags,
    attributes: row.attributes,
    images: row.images,
    main_image: row.main_image,
    image_count: row.image_count,
    videos: row.videos,
    video_count: row.video_count,
    in_stock: row.in_stock,
    stock_status: row.stock_status,
    weight: row.weight,
    dimensions: row.dimensions,
    formatted_weight: row.formatted_weight,
    formatted_dimensions: row.formatted_dimensions,
    has_options: row.has_options,
    is_purchasable: row.is_purchasable,
    sold_individually: row.sold_individually,
  }));

  const exportPaths = [
    path.join(ROOT, 'data', 'mirror', 'products.json'),
    path.join(ROOT, 'storefront', 'data', 'products.json'),
    path.join(ROOT, 'backend', 'data', 'mirror', 'products.json'),
  ];
  for (const ep of exportPaths) {
    fs.writeFileSync(ep, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`Exported: ${path.relative(ROOT, ep)} (${exportData.length} products)`);
  }

  // Also re-export categories
  const cats = await client.query(`SELECT * FROM aegisky_categories ORDER BY id`);
  const catExport = cats.rows;
  const catPaths = [
    path.join(ROOT, 'data', 'mirror', 'categories.json'),
    path.join(ROOT, 'storefront', 'data', 'categories.json'),
    path.join(ROOT, 'backend', 'data', 'mirror', 'categories.json'),
  ];
  for (const cp of catPaths) {
    fs.writeFileSync(cp, JSON.stringify(catExport, null, 2), 'utf8');
    console.log(`Exported: ${path.relative(ROOT, cp)} (${catExport.length} categories)`);
  }

  // Re-export brands
  const brands = await client.query(`SELECT * FROM aegisky_brands ORDER BY id`);
  const brandPaths = [
    path.join(ROOT, 'data', 'mirror', 'brands.json'),
    path.join(ROOT, 'storefront', 'data', 'brands.json'),
  ];
  for (const bp of brandPaths) {
    fs.writeFileSync(bp, JSON.stringify(brands.rows, null, 2), 'utf8');
    console.log(`Exported: ${path.relative(ROOT, bp)} (${brands.rows.length} brands)`);
  }

  await client.end();
  console.log('\n✓ All done!');
}

updateDatabase().catch(err => {
  console.error('Database update failed:', err);
  process.exit(1);
});
