const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky' });

// Legacy map from our redirects file
const LEGACY_KEYS = new Set([
  'двигатели','esc-регуляторы','лопасти-и-пропеллеры','сервоприводы-для-квадрокоптера',
  'автопилоты','пульты-управления','приёмники','антенны','радиостанции','передатчики',
  'сетевое-оборудование','fpv-очки','мониторы','fpv-дроны','фото-и-видео','тепловизоры',
  'подвесы','лидары','камеры-машинного-зрения','дроны-с-тепловизором','квадрокоптеры',
  'дроны-с-неподвижным-крылом','дроны-самолётного-типа','дроны-с-вертикальным-взлётом-и-посадк',
  'подводные-дроны','водонепроницаемые-дроны','дроны-рф','дроны-для-обучения','мультикоптеры',
  'акб','зарядные-устройства','портативные-электростанции-2','солнечные-панели-2',
  'купить-раму-для-квадрокоптера','карбоновые-материалы','микрокомпьютеры','микросхемы-чипы',
  'роботы','противодействия-дронам-и-бпла','инструмент','ремкомплекты-kyocera',
  'средства-передвижения','комплекты-для-сборки-дронов','аксессуары','анализаторы-спектра',
  'дальнобойные-системы-радиометрии','тепловизионные-прицелы','шлейфы','lanterns',
  'игровые-консоли-и-приставки',
  // Also add partial matches
  'оптические-прицелы','фонари','консоли','транспорт'
]);

(async () => {
  await c.connect();

  // 1. Get ALL old categories (id < 10000) with product_count > 0
  const oldCats = await c.query(`
    SELECT id, name, slug, parent, product_count
    FROM aegisky_categories
    WHERE id < 10000 AND product_count > 0
    ORDER BY product_count DESC
  `);

  console.log('=== OLD CATEGORIES WITH PRODUCTS ===');
  console.log(`Total: ${oldCats.rows.length}\n`);

  // 2. Check which old categories are NOT in our legacy map
  const unmapped = [];
  const mapped = [];
  for (const cat of oldCats.rows) {
    const slug = cat.slug || '';
    const name = (cat.name || '').toLowerCase();
    let found = false;
    for (const key of LEGACY_KEYS) {
      if (slug.includes(key) || name.includes(key)) {
        found = true;
        break;
      }
    }
    if (found) {
      mapped.push(cat);
    } else {
      unmapped.push(cat);
    }
  }

  console.log(`Mapped (product type categories): ${mapped.length}`);
  console.log(`Unmapped (likely brand or misc categories): ${unmapped.length}\n`);

  if (unmapped.length > 0) {
    console.log('=== UNMAPPED OLD CATEGORIES (check if these are brands) ===');
    unmapped.slice(0, 30).forEach(cat => {
      console.log(`  [${cat.id}] ${cat.name} (${cat.slug}) - ${cat.product_count} products, parent=${cat.parent}`);
    });
  }

  // 3. Check products that might only have brand categories
  console.log('\n=== CHECKING PRODUCTS WITH ONLY BRAND-TYPE CATEGORIES ===');
  // Get products where ALL their old categories are unmapped (brand) categories
  const sampleProducts = await c.query(`
    SELECT p.id, p.name, p.categories
    FROM aegisky_products p
    WHERE jsonb_array_length(p.categories) > 0
    LIMIT 10
  `);

  // Check if any product has categories that are all unmapped
  let brandOnlyCount = 0;
  const brandOnlySamples = [];
  const allProds = await c.query('SELECT id, name, categories FROM aegisky_products');

  for (const prod of allProds.rows) {
    const cats = prod.categories || [];
    if (cats.length === 0) continue;

    let allNew = true;
    let hasProductType = false;

    for (const cat of cats) {
      const catId = parseInt(cat.id);
      if (catId >= 10000) {
        hasProductType = true;
        continue;
      }
      // Old category - check if it's a mapped product type
      const catSlug = (cat.slug || '').toLowerCase();
      const catName = (cat.name || '').toLowerCase();
      let isMapped = false;
      for (const key of LEGACY_KEYS) {
        if (catSlug.includes(key) || catName.includes(key)) {
          isMapped = true;
          break;
        }
      }
      if (!isMapped) {
        allNew = false;
      } else {
        hasProductType = true;
      }
    }

    if (!hasProductType) {
      brandOnlyCount++;
      if (brandOnlySamples.length < 10) {
        brandOnlySamples.push({ id: prod.id, name: prod.name?.substring(0, 60), cats: cats.map(c => c.name || c.id) });
      }
    }
  }

  console.log(`Products with NO product-type category (brand-only or misc): ${brandOnlyCount}`);
  if (brandOnlySamples.length > 0) {
    console.log('Samples:');
    brandOnlySamples.forEach(s => {
      console.log(`  [${s.id}] ${s.name} | cats: ${s.cats.join(', ')}`);
    });
  }

  // 4. Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total products: ${allProds.rows.length}`);
  console.log(`Products mapped to new categories: ${allProds.rows.length - brandOnlyCount}`);
  console.log(`Products needing review: ${brandOnlyCount}`);

  await c.end();
})();
