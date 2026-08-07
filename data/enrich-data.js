/**
 * Aegisky Medusa - Data Enrichment Script
 * 
 * Processes raw WooCommerce data and produces:
 * 1. Standard category mapping (1033 → ~55 categories)
 * 2. English translations for categories, brands, attributes
 * 3. Attribute extraction from descriptions using pattern matching
 * 4. Clean English slugs
 * 5. Enriched products.json with all fields
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'export');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'enriched');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load translations
const { ATTRIBUTE_TRANSLATIONS, CATEGORY_TRANSLATIONS, BRAND_TRANSLATIONS, TECH_TERMS } = require('./translations.js');
const { STANDARD_CATEGORIES, CATEGORY_MAPPING } = require('./standard-categories.js');

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Decode URL-encoded Russian text
function decodeRussian(str) {
  if (!str) return str;
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

// Generate clean English slug
function generateSlug(text, id) {
  if (!text) return `product-${id}`;
  
  // First try to translate
  let translated = translateText(text);
  
  // Convert to lowercase, replace non-alphanumeric with dashes
  let slug = translated
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
  
  if (!slug || slug.length < 2) {
    // Fallback: use product type + id
    slug = `item-${id}`;
  }
  
  return `${slug}-${id}`;
}

// Simple word-by-word translation
function translateText(text) {
  if (!text) return text;
  
  let result = text;
  
  // Try exact category/attribute translation first
  const lower = text.trim();
  if (ATTRIBUTE_TRANSLATIONS[lower]) return ATTRIBUTE_TRANSLATIONS[lower];
  if (CATEGORY_TRANSLATIONS[lower]) return CATEGORY_TRANSLATIONS[lower];
  if (BRAND_TRANSLATIONS[lower]) return BRAND_TRANSLATIONS[lower];
  
  // Word-by-word translation for mixed text
  const words = text.split(/(\s+|[.,;:!?()])/);
  result = words.map(word => {
    const w = word.toLowerCase().trim();
    if (TECH_TERMS[w]) return TECH_TERMS[w];
    if (ATTRIBUTE_TRANSLATIONS[word.trim()]) return ATTRIBUTE_TRANSLATIONS[word.trim()];
    return word;
  }).join('');
  
  return result;
}

// Extract specifications from description text using patterns
function extractSpecifications(description) {
  if (!description) return {};
  
  const specs = {};
  
  // Remove HTML tags for pattern matching
  const text = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  
  // Pattern: "Key: Value" or "Key - Value"
  const patterns = [
    // Weight patterns
    { regex: /(?:вес|weight)\s*[:\-–]\s*([\d.,]+\s*(?:кг|г|kg|g))/i, key: 'weight' },
    { regex: /(?:взлетный вес|takeoff weight)\s*[:\-–]\s*([\d.,]+\s*(?:кг|г|kg|g))/i, key: 'takeoff_weight' },
    
    // Dimensions
    { regex: /(?:размеры|dimensions|габариты)\s*[:\-–]\s*([\d.,]+\s*[xх×*]\s*[\d.,]+\s*[xх×*]\s*[\d.,]+\s*(?:мм|см|mm|cm|м)?)/i, key: 'dimensions' },
    { regex: /(?:размер|size)\s*[:\-–]\s*([\d.,]+\s*[xх×*]\s*[\d.,]+\s*(?:мм|см|mm|cm|м)?)/i, key: 'size' },
    
    // Battery
    { regex: /(?:емкость аккумулятора|battery capacity)\s*[:\-–]\s*([\d.,]+\s*(?:мАч|mAh|Ач|Ah))/i, key: 'battery_capacity' },
    { regex: /(?:напряжение|voltage)\s*[:\-–]\s*([\d.,]+\s*[ВV])/i, key: 'voltage' },
    { regex: /(?:тип аккумулятора|battery type)\s*[:\-–]\s*(Li[A-Za-z-]+|[A-Za-z]+-?[Ii]on|[A-Za-z]+)/i, key: 'battery_type' },
    
    // Flight performance
    { regex: /(?:время полета|flight time|время работы)\s*[:\-–]\s*([\d.,]+\s*(?:мин|min|минут|час|hour|ч))/i, key: 'flight_time' },
    { regex: /(?:максимальная скорость|max speed)\s*[:\-–]\s*([\d.,]+\s*(?:км\/ч|km\/h|м\/с|m\/s|mph))/i, key: 'max_speed' },
    { regex: /(?:дальность полета|flight range|дальность)\s*[:\-–]\s*([\d.,]+\s*(?:км|km|м|m))/i, key: 'flight_range' },
    { regex: /(?:максимальная высота|max altitude)\s*[:\-–]\s*([\d.,]+\s*(?:м|m|км|km))/i, key: 'max_altitude' },
    
    // Camera
    { regex: /(?:разрешение|resolution)\s*[:\-–]\s*([\d]+[xх×*][\d]+\s*(?:пикселей|pixels|MP|Мп)?)/i, key: 'resolution' },
    { regex: /(?:угол обзора|field of view|fov)\s*[:\-–]\s*([\d.,]+\s*°?)/i, key: 'fov' },
    
    // Motor
    { regex: /(?:KV|кв)\s*[:\-–]\s*([\d.,]+)/i, key: 'kv_rating' },
    { regex: /(?:диаметр вала|shaft diameter)\s*[:\-–]\s*([\d.,]+\s*(?:мм|mm))/i, key: 'shaft_diameter' },
    { regex: /(?:диаметр|diameter)\s*[:\-–]\s*([\d.,]+\s*(?:мм|mm|см|cm|дюйм|inch))/i, key: 'diameter' },
    
    // Power
    { regex: /(?:мощность|power)\s*[:\-–]\s*([\d.,]+\s*(?:Вт|W|кВт|kW))/i, key: 'power' },
    { regex: /(?:ток|current)\s*[:\-–]\s*([\d.,]+\s*(?:А|A|мА|mA))/i, key: 'current' },
    
    // Frequency
    { regex: /(?:частота|frequency)\s*[:\-–]\s*([\d.,]+\s*(?:ГГц|GHz|МГц|MHz))/i, key: 'frequency' },
    { regex: /(?:количество каналов|channels)\s*[:\-–]\s*([\d]+)/i, key: 'channels' },
    
    // Material
    { regex: /(?:материал|material)\s*[:\-–]\s*([A-Za-zА-Яа-я\s]+)/i, key: 'material' },
    
    // Brand
    { regex: /(?:бренд|brand|производитель|manufacturer)\s*[:\-–]\s*([A-Za-zА-Яа-я0-9\s]+)/i, key: 'brand_text' },
  ];
  
  patterns.forEach(({ regex, key }) => {
    const match = text.match(regex);
    if (match && match[1]) {
      specs[key] = match[1].trim();
    }
  });
  
  return specs;
}

// Map raw category to standard category
function mapToStandardCategory(rawCategory) {
  const name = decodeRussian(rawCategory.name);
  
  // Check direct mapping
  if (CATEGORY_MAPPING[name]) {
    return CATEGORY_MAPPING[name];
  }
  
  // Fuzzy matching - check if any mapping key is contained in the name
  for (const [ruName, stdSlug] of Object.entries(CATEGORY_MAPPING)) {
    if (name.includes(ruName) || ruName.includes(name)) {
      return stdSlug;
    }
  }
  
  // Check if it's a brand name (those should be handled by brand field)
  // For now, return 'other' for unmapped
  return 'accessories';
}

// ============================================================
// MAIN PROCESSING
// ============================================================

console.log('=== Aegisky Medusa Data Enrichment ===');
console.log('');

// 1. Process categories
console.log('Processing categories...');
const rawCategories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));

const enrichedCategories = rawCategories.map(cat => {
  const ruName = decodeRussian(cat.name);
  const enName = CATEGORY_TRANSLATIONS[ruName] || translateText(ruName);
  const standardSlug = mapToStandardCategory(cat);
  const standardCat = STANDARD_CATEGORIES.find(sc => sc.slug === standardSlug);
  
  return {
    id: cat.id,
    name: {
      en: enName,
      ru: ruName,
    },
    slug: generateSlug(enName, cat.id),
    originalSlug: cat.slug,
    productCount: cat.productCount,
    standardCategory: standardSlug,
    standardCategoryName: standardCat ? standardCat.name.en : 'Other',
  };
});

// Create standard categories lookup
const standardCategoriesWithCounts = STANDARD_CATEGORIES.map(sc => {
  const mappedProducts = enrichedCategories
    .filter(ec => ec.standardCategory === sc.slug)
    .reduce((sum, ec) => sum + ec.productCount, 0);
  return {
    ...sc,
    name: sc.name,
    totalProducts: mappedProducts,
  };
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'categories_enriched.json'),
  JSON.stringify(enrichedCategories, null, 2)
);
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'standard_categories.json'),
  JSON.stringify(standardCategoriesWithCounts, null, 2)
);
console.log(`  Processed ${enrichedCategories.length} categories → ${STANDARD_CATEGORIES.length} standard categories`);

// 2. Process brands
console.log('Processing brands...');
const rawBrands = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'brands.json'), 'utf8'));

const enrichedBrands = rawBrands.map(brand => {
  const ruName = decodeRussian(brand.name);
  const enName = BRAND_TRANSLATIONS[ruName] || ruName; // Most brands are already in English
  
  return {
    id: brand.id,
    name: {
      en: enName,
      ru: ruName,
    },
    slug: brand.slug || generateSlug(enName, brand.id),
    productCount: brand.productCount,
  };
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'brands_enriched.json'),
  JSON.stringify(enrichedBrands, null, 2)
);
console.log(`  Processed ${enrichedBrands.length} brands`);

// 3. Process attributes
console.log('Processing attributes...');
const rawAttributes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'attributes.json'), 'utf8'));

const enrichedAttributes = rawAttributes.map(attr => {
  const ruName = attr.name;
  const enName = ATTRIBUTE_TRANSLATIONS[ruName] || translateText(ruName);
  
  const enrichedTerms = (attr.terms || []).map(term => ({
    id: term.id,
    name: {
      en: translateText(decodeRussian(term.name)),
      ru: decodeRussian(term.name),
    },
    slug: term.slug,
    productCount: term.productCount,
  }));
  
  return {
    id: attr.id,
    name: {
      en: enName,
      ru: ruName,
    },
    taxonomy: attr.taxonomy,
    hasVariations: attr.hasVariations,
    productCount: attr.productCount,
    terms: enrichedTerms,
  };
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'attributes_enriched.json'),
  JSON.stringify(enrichedAttributes, null, 2)
);
console.log(`  Processed ${enrichedAttributes.length} attributes with ${enrichedAttributes.reduce((s,a)=>s+a.terms.length,0)} terms`);

// 4. Process products
console.log('Processing products...');
const rawProducts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));

const enrichedProducts = rawProducts.map((p, idx) => {
  if (idx % 500 === 0) console.log(`  Processing product ${idx}/${rawProducts.length}...`);
  
  // Basic info
  const ruName = p.name;
  const enName = translateText(ruName);
  
  // Categories
  const categories = (p.categories || []).map(c => {
    const enriched = enrichedCategories.find(ec => ec.id === c.id);
    return {
      id: c.id,
      name: enriched ? enriched.name : { en: translateText(c.name), ru: c.name },
      slug: enriched ? enriched.slug : generateSlug(c.name, c.id),
      standardCategory: enriched ? enriched.standardCategory : 'accessories',
    };
  });
  
  // Primary category (first one)
  const primaryCategory = categories[0] || null;
  
  // Brand
  let brand = null;
  if (p.brand) {
    const enrichedBrand = enrichedBrands.find(b => b.id === p.brand.id);
    brand = enrichedBrand || {
      id: p.brand.id,
      name: { en: p.brand.name, ru: p.brand.name },
      slug: generateSlug(p.brand.name, p.brand.id),
    };
  }
  
  // Extract specifications from description
  const extractedSpecs = extractSpecifications(p.description);
  
  // Process images
  const galleryImages = (p.galleryImages || []).map(img => {
    if (typeof img === 'string') return img;
    return img.src || img.url || '';
  }).filter(Boolean);
  
  const descriptionImages = (p.descriptionImages || []).map(img => {
    if (typeof img === 'string') return img;
    return img.src || img.url || '';
  }).filter(Boolean);
  
  // Translate description (basic word-by-word for now)
  const translatedDescription = p.description ? translateText(p.description) : '';
  const translatedShortDesc = p.shortDescription ? translateText(p.shortDescription) : '';
  
  return {
    id: p.id,
    name: {
      en: enName,
      ru: ruName,
    },
    slug: p.slug || generateSlug(enName, p.id),
    sku: p.sku,
    permalink: p.permalink,
    type: p.type || 'simple',
    
    // Categories
    categories,
    primaryCategory: primaryCategory ? primaryCategory.standardCategory : 'accessories',
    primaryCategoryName: primaryCategory ? primaryCategory.name.en : 'Accessories',
    
    // Brand
    brand,
    
    // Pricing
    price: p.price || 0,
    regularPrice: p.regularPrice || p.price || 0,
    salePrice: p.salePrice || null,
    onSale: p.onSale || false,
    currency: 'RUB',
    
    // Stock
    inStock: p.inStock !== false,
    stockStatus: p.stockStatus || 'instock',
    
    // Content
    description: {
      en: translatedDescription,
      ru: p.description || '',
    },
    shortDescription: {
      en: translatedShortDesc,
      ru: p.shortDescription || '',
    },
    
    // Media
    images: {
      gallery: galleryImages,
      description: descriptionImages,
      all: [...galleryImages, ...descriptionImages],
    },
    imageCount: galleryImages.length + descriptionImages.length,
    
    // Attributes/Specifications
    attributes: extractedSpecs,
    rawAttributes: p.rawAttributes || [],
    
    // Physical
    weight: p.weight || extractedSpecs.weight || null,
    dimensions: p.dimensions || null,
    
    // Reviews
    averageRating: p.averageRating || 0,
    reviewCount: p.reviewCount || 0,
    
    // Tags
    tags: (p.tags || []).map(t => ({
      id: t.id,
      name: { en: translateText(t.name), ru: t.name },
      slug: t.slug,
    })),
    
    // Metadata
    hasVariations: p.variations && p.variations.length > 0,
    variations: p.variations || [],
  };
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'products_enriched.json'),
  JSON.stringify(enrichedProducts, null, 2)
);
console.log(`  Processed ${enrichedProducts.length} products`);

// 5. Generate statistics
console.log('Generating statistics...');
const stats = {
  generatedAt: new Date().toISOString(),
  totalProducts: enrichedProducts.length,
  totalCategories: enrichedCategories.length,
  totalStandardCategories: STANDARD_CATEGORIES.length,
  totalBrands: enrichedBrands.length,
  totalAttributes: enrichedAttributes.length,
  
  productsWithPrice: enrichedProducts.filter(p => p.price > 0).length,
  productsInStock: enrichedProducts.filter(p => p.inStock).length,
  productsWithGallery: enrichedProducts.filter(p => p.images.gallery.length > 0).length,
  productsWithExtractedSpecs: enrichedProducts.filter(p => Object.keys(p.attributes).length > 0).length,
  
  productsByStandardCategory: {},
  productsByBrand: {},
  
  priceRange: {
    min: Math.min(...enrichedProducts.map(p => p.price).filter(p => p > 0)),
    max: Math.max(...enrichedProducts.map(p => p.price)),
  },
};

// Count by standard category
STANDARD_CATEGORIES.forEach(sc => {
  stats.productsByStandardCategory[sc.slug] = {
    name: sc.name.en,
    count: enrichedProducts.filter(p => p.primaryCategory === sc.slug).length,
  };
});

// Count top brands
enrichedBrands.slice(0, 20).forEach(b => {
  stats.productsByBrand[b.slug] = {
    name: b.name.en,
    count: b.productCount,
  };
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'stats_enriched.json'),
  JSON.stringify(stats, null, 2)
);

console.log('');
console.log('=== ENRICHMENT COMPLETE ===');
console.log(`Output directory: ${OUTPUT_DIR}`);
console.log('');
console.log('Files generated:');
console.log('  - categories_enriched.json (' + enrichedCategories.length + ' categories)');
console.log('  - standard_categories.json (' + STANDARD_CATEGORIES.length + ' standard categories)');
console.log('  - brands_enriched.json (' + enrichedBrands.length + ' brands)');
console.log('  - attributes_enriched.json (' + enrichedAttributes.length + ' attributes)');
console.log('  - products_enriched.json (' + enrichedProducts.length + ' products)');
console.log('  - stats_enriched.json');
console.log('');
console.log('Products with extracted specifications:', stats.productsWithExtractedSpecs);
console.log('Products with images:', stats.productsWithGallery);
console.log('Products with price:', stats.productsWithPrice);
