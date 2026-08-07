const { Client } = require('pg');
const pg = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY || 'aegisky-meilisearch-master-key-2026';

(async () => {
  await pg.connect();

  // Get Meilisearch client
  const { MeiliSearch } = require('meilisearch');
  const client = new MeiliSearch({ host: MEILISEARCH_HOST, apiKey: MEILISEARCH_MASTER_KEY });

  // Delete existing index
  try {
    await client.index('products').delete();
    console.log('Deleted old products index');
  } catch(e) {}

  // Create index
  await client.createIndex('products', { primaryKey: 'id' });
  console.log('Created products index');

  // Fetch all products with categories
  const res = await pg.query(`
    SELECT id, name, slug, sku, price, sale_price, regular_price, description, images, categories, brands, in_stock
    FROM aegisky_products ORDER BY id
  `);

  const products = res.rows.map(p => ({
    id: p.id,
    name: p.name || '',
    slug: p.slug || '',
    sku: p.sku || '',
    price: p.price || 0,
    oldPrice: p.regular_price || p.sale_price || 0,
    description: (p.description || '').replace(/<[^>]+>/g, ' ').substring(0, 2000),
    images: p.images || [],
    categories: (p.categories || []).map(c => ({ id: c.id, name: c.name, slug: c.slug })),
    categoryIds: (p.categories || []).map(c => c.id),
    brands: p.brands || [],
    inStock: p.in_stock !== false
  }));

  console.log(`Indexing ${products.length} products...`);

  // Index in batches
  const batchSize = 500;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await client.index('products').addDocuments(batch);
    console.log(`  Indexed ${Math.min(i + batchSize, products.length)}/${products.length}`);
  }

  // Update settings
  await client.index('products').updateSettings({
    searchableAttributes: ['name', 'description', 'sku', 'brands'],
    filterableAttributes: ['categoryIds', 'inStock', 'brands'],
    sortableAttributes: ['price', 'id'],
    displayedAttributes: ['id', 'name', 'slug', 'sku', 'price', 'oldPrice', 'images', 'categories', 'brands', 'inStock']
  });

  // Also index categories
  try { await client.index('categories').delete(); } catch(e) {}
  await client.createIndex('categories', { primaryKey: 'id' });

  const cats = await pg.query(`SELECT id, name, slug, parent, product_count FROM aegisky_categories WHERE id >= 10000`);
  const catDocs = cats.rows.map(c => ({
    id: c.id, name: c.name, slug: c.slug, parent: c.parent, productCount: c.product_count
  }));
  await client.index('categories').addDocuments(catDocs);
  await client.index('categories').updateSettings({
    searchableAttributes: ['name', 'slug'],
    filterableAttributes: ['parent']
  });

  console.log(`Indexed ${catDocs.length} categories`);
  console.log('\nMeilisearch index rebuilt successfully!');

  await pg.end();
})();
