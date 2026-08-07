require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Client } = require('pg')

const CONFIG = {
  SOURCE_DATA_DIR: 'D:/scraper/data',
  LOCAL_IMAGE_DIR: 'D:/scraper/images_original',
  DB: {
    host: 'localhost',
    port: 5434,
    user: 'medusa',
    password: 'medusa_password',
    database: 'medusa-aegisky'
  },
  EXCHANGE_RATE: 0.0112,
  DATA_DIR: path.resolve(__dirname, '../data'),
}

// 52个标准分类
const STANDARD_CATEGORIES = [
  { slug: 'quadcopters', name: '四旋翼机', name_en: 'Quadcopters' },
  { slug: 'training-drones', name: '训练用无人机', name_en: 'Training Drones' },
  { slug: 'thermal-imaging-drones', name: '热成像无人机', name_en: 'Thermal Imaging Drones' },
  { slug: 'waterproof-drones', name: '防水无人机', name_en: 'Waterproof Drones' },
  { slug: 'fpv-drones', name: 'FPV无人机', name_en: 'FPV Drones' },
  { slug: 'russian-drones', name: '俄罗斯联邦无人机', name_en: 'Russian Drones' },
  { slug: 'multirotors', name: '多旋翼机', name_en: 'Multirotors' },
  { slug: 'aerial-drones', name: '航空型无人机', name_en: 'Aerial Drones' },
  { slug: 'vtol-drones', name: '垂直起降无人机', name_en: 'VTOL Drones' },
  { slug: 'fixed-wing-drones', name: '固定翼无人机', name_en: 'Fixed Wing Drones' },
  { slug: 'accessories', name: '配件', name_en: 'Accessories' },
  { slug: 'robots', name: '机器人', name_en: 'Robots' },
  { slug: 'portable-power-stations', name: '便携式发电站', name_en: 'Portable Power Stations' },
  { slug: 'solar-panels', name: '太阳能电池板', name_en: 'Solar Panels' },
  { slug: 'underwater-drones', name: '水下无人机', name_en: 'Underwater Drones' },
  { slug: 'vehicles', name: '车辆', name_en: 'Vehicles' },
  { slug: 'drone-kits', name: '无人机组装套件', name_en: 'Drone Kits' },
  { slug: 'counter-drones', name: '反无人机', name_en: 'Counter Drones' },
  { slug: 'frames', name: '框架', name_en: 'Frames' },
  { slug: 'autopilots', name: '自动驾驶仪', name_en: 'Autopilots' },
  { slug: 'lidar', name: '激光雷达', name_en: 'LiDAR' },
  { slug: 'launch-pads', name: '发射台', name_en: 'Launch Pads' },
  { slug: 'receivers', name: '接收器', name_en: 'Receivers' },
  { slug: 'remote-radiometry', name: '远程辐射测量系统', name_en: 'Remote Radiometry' },
  { slug: 'control-panels', name: '控制面板', name_en: 'Control Panels' },
  { slug: 'antennas', name: '天线', name_en: 'Antennas' },
  { slug: 'motors', name: '电机', name_en: 'Motors' },
  { slug: 'servos', name: '舵机', name_en: 'Servos' },
  { slug: 'blades-propellers', name: '螺旋桨', name_en: 'Propellers' },
  { slug: 'cameras-video', name: '摄像机', name_en: 'Cameras & Video' },
  { slug: 'machine-vision-cameras', name: '机器视觉摄像机', name_en: 'Machine Vision Cameras' },
  { slug: 'spectrum-analyzers', name: '频谱分析仪', name_en: 'Spectrum Analyzers' },
  { slug: 'fpv-integration', name: 'FPV积分', name_en: 'FPV Integration' },
  { slug: 'esc-controllers', name: 'ESC电调', name_en: 'ESC Controllers' },
  { slug: 'lanterns', name: '灯光', name_en: 'Lanterns' },
  { slug: 'batteries', name: '电池', name_en: 'Batteries' },
  { slug: 'charging-equipment', name: '充电设备', name_en: 'Charging Equipment' },
  { slug: 'rifle-scopes', name: '步枪瞄准镜', name_en: 'Rifle Scopes' },
  { slug: 'thermal-scopes', name: '热成像瞄准镜', name_en: 'Thermal Scopes' },
  { slug: 'tools', name: '工具', name_en: 'Tools' },
  { slug: 'microcomputers', name: '微型计算机', name_en: 'Microcomputers' },
  { slug: 'chips', name: '芯片', name_en: 'Chips' },
  { slug: 'monitors', name: '监视器', name_en: 'Monitors' },
  { slug: 'radio-stations', name: '广播电台', name_en: 'Radio Stations' },
  { slug: 'gimbals', name: '云台', name_en: 'Gimbals' },
  { slug: 'thermal-cameras', name: '热成像相机', name_en: 'Thermal Cameras' },
  { slug: 'carbon-materials', name: '碳材料', name_en: 'Carbon Materials' },
  { slug: 'rings', name: '环形', name_en: 'Rings' },
  { slug: 'network-equipment', name: '网络设备', name_en: 'Network Equipment' },
  { slug: 'kyocera-repair-kits', name: '京瓷维修套件', name_en: 'Kyocera Repair Kits' },
  { slug: 'hosts', name: '主机', name_en: 'Hosts' },
  { slug: 'other', name: '其他', name_en: 'Other' },
]

function generateId() {
  return crypto.randomUUID()
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

// 加载分类映射
const fullMap = require('../data/category-full-map.js')

function mapCategory(catId, catName) {
  const id = catId?.toString()
  const name = (catName || '').toLowerCase().trim()
  
  // 0. 源网站"прочее"分类才是真正的"其他"
  if (name === 'прочее') return 'other'
  
  // 1. 品牌分类映射
  for (const [brand, slug] of Object.entries(fullMap.brandCategoryMap)) {
    if (name.includes(brand.toLowerCase())) return slug
  }
  
  // 2. 关键词映射
  for (const [keyword, slug] of Object.entries(fullMap.keywordMap)) {
    if (name.includes(keyword.toLowerCase())) return slug
  }
  
  // 3. 如果是纯英文品牌名（没有匹配到关键词），根据品牌主营产品判断
  if (/^[a-z0-9][a-z0-9\s\-&+.]+$/.test(name) && name.length > 1 && name.length < 30) {
    // 未识别的品牌，默认归为配件
    return 'accessories'
  }
  
  // 4. 未匹配的俄文分类，默认归为配件（而不是其他）
  return 'accessories'
}

// 获取本地图片列表
function getLocalImages(productId) {
  const dir = path.join(CONFIG.LOCAL_IMAGE_DIR, productId.toString())
  if (!fs.existsSync(dir)) return []
  
  try {
    const files = fs.readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .sort()
    
    // 优先gallery，然后其他，最后desc
    const gallery = files.filter(f => f.toLowerCase().startsWith('gallery_'))
    const main = files.filter(f => !f.toLowerCase().startsWith('gallery_') && !f.toLowerCase().startsWith('desc_'))
    const desc = files.filter(f => f.toLowerCase().startsWith('desc_'))
    
    return [...gallery, ...main, ...desc].map(f => `/api/media/images_original/${productId}/${f}`)
  } catch {
    return []
  }
}

function extractBrand(product) {
  // 1. 从attributes提取
  const brandAttr = (product.attributes || []).find(a => a.name === 'Бренд')
  if (brandAttr?.terms?.[0]?.name) {
    return brandAttr.terms[0].name.trim()
  }
  
  // 2. 从分类提取（纯英文分类名作为品牌）
  for (const c of (product.categories || [])) {
    const name = c.name.trim()
    if (/^[A-Za-z0-9][A-Za-z0-9\s\-&+.]+$/.test(name) && name.length > 1 && name.length < 30) {
      const commonWords = ['other', 'accessories', 'parts', 'new', 'sale', 'hot', 'popular', 'featured', 'copterparts']
      if (!commonWords.includes(name.toLowerCase())) {
        return name
      }
    }
  }
  
  return 'Generic'
}

function extractAndTransform() {
  log('开始读取原始数据...')
  
  const files = fs.readdirSync(CONFIG.SOURCE_DATA_DIR).filter(f => f.endsWith('.json'))
  const allProducts = []
  
  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(CONFIG.SOURCE_DATA_DIR, file), 'utf8'))
      const products = Array.isArray(content) ? content : (content.products || [])
      allProducts.push(...products)
    } catch(e) {
      log(`跳过文件 ${file}: ${e.message}`)
    }
  }
  
  // 去重
  const unique = new Map()
  allProducts.forEach(p => unique.set(p.id, p))
  const products = Array.from(unique.values())
  log(`读取完成: ${products.length} 个唯一商品`)
  
  // 转换
  const categoryStats = {}
  const brandStats = {}
  let totalImages = 0
  
  const transformed = products.map(p => {
    // 分类映射 - 遍历所有分类，找到第一个非other的
    let categorySlug = 'other'
    for (const c of (p.categories || [])) {
      const mapped = mapCategory(c.id, c.name)
      if (mapped !== 'other') {
        categorySlug = mapped
        break
      }
    }
    
    // 价格
    const priceRub = parseFloat(p.price) || 0
    const priceUsd = Math.round(priceRub * CONFIG.EXCHANGE_RATE * 100) // 分
    
    // 品牌
    const brand = extractBrand(p)
    
    // 图片 - 优先本地，然后原始URL
    let images = getLocalImages(p.id)
    if (images.length === 0) {
      images = (p.images || []).map(img => img.src).filter(Boolean)
    }
    totalImages += images.length
    
    // 描述
    const description = (p.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 20000)
    
    // 统计
    categoryStats[categorySlug] = (categoryStats[categorySlug] || 0) + 1
    brandStats[brand] = (brandStats[brand] || 0) + 1
    
    return {
      external_id: p.id.toString(),
      title: p.name || `Product ${p.id}`,
      handle: `product-${p.id}`,
      sku: p.sku || `SKU-${p.id}`,
      description,
      price_cents: priceUsd > 0 ? priceUsd : 1,
      status: p.status === 'publish' ? 'published' : 'draft',
      category_slug: categorySlug,
      brand,
      images,
      thumbnail: images[0] || null,
    }
  })
  
  // 处理重复SKU
  const skuCount = {}
  transformed.forEach(p => {
    if (!skuCount[p.sku]) skuCount[p.sku] = 0
    skuCount[p.sku]++
    if (skuCount[p.sku] > 1) {
      p.sku = `${p.sku}-${p.external_id}`
    }
  })
  
  // 输出统计
  log(`\n=== 分类分布 ===`)
  const sortedCats = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])
  sortedCats.forEach(([slug, count]) => {
    const cat = STANDARD_CATEGORIES.find(c => c.slug === slug)
    log(`  ${cat?.name || slug}: ${count}个 (${Math.round(count / products.length * 100)}%)`)
  })
  
  log(`\n=== 品牌统计 ===`)
  log(`  品牌总数: ${Object.keys(brandStats).length}`)
  
  log(`\n=== 图片统计 ===`)
  log(`  图片总数: ${totalImages}`)
  log(`  平均每商品: ${(totalImages / products.length).toFixed(1)}张`)
  
  // 保存暂存数据
  fs.writeFileSync(
    path.join(CONFIG.DATA_DIR, 'staging-products.json'),
    JSON.stringify(transformed, null, 2)
  )
  
  // 保存品牌列表
  const brands = Object.entries(brandStats).map(([name, count]) => ({
    id: generateId(),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9а-я]+/gi, '-').replace(/^-|-$/g, ''),
    product_count: count
  })).sort((a, b) => b.product_count - a.product_count)
  
  fs.writeFileSync(
    path.join(CONFIG.DATA_DIR, 'brands.json'),
    JSON.stringify(brands, null, 2)
  )
  
  log('\n暂存数据已保存')
  return { products: transformed, brands }
}

async function main() {
  const client = new Client(CONFIG.DB)
  await client.connect()
  log('数据库连接成功')
  
  try {
    const { products, brands } = extractAndTransform()
    
    await client.query('BEGIN')
    
    // 清空旧数据
    log('\n清空旧数据...')
    await client.query('TRUNCATE TABLE product_category_product CASCADE')
    await client.query('TRUNCATE TABLE product_variant_product_image CASCADE')
    await client.query('TRUNCATE TABLE product_variant_option CASCADE')
    await client.query('TRUNCATE TABLE product_variant_price_set CASCADE')
    await client.query('TRUNCATE TABLE price CASCADE')
    await client.query('TRUNCATE TABLE price_set CASCADE')
    await client.query('TRUNCATE TABLE product_variant CASCADE')
    await client.query('TRUNCATE TABLE product_option_value CASCADE')
    await client.query('TRUNCATE TABLE product_product_option CASCADE')
    await client.query('TRUNCATE TABLE product_option CASCADE')
    await client.query('TRUNCATE TABLE image CASCADE')
    await client.query('TRUNCATE TABLE product CASCADE')
    await client.query('TRUNCATE TABLE product_category CASCADE')
    log('旧数据已清空')
    
    // 导入52个分类
    log('导入52个标准分类...')
    const categoryIdMap = {}
    for (const cat of STANDARD_CATEGORIES) {
      const id = generateId()
      categoryIdMap[cat.slug] = id
      await client.query(
        `INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, created_at, updated_at, external_id)
         VALUES ($1, $2, $3, $4, $5, true, false, $6, NOW(), NOW(), $7)`,
        [id, cat.name, cat.name_en, cat.slug, cat.slug, STANDARD_CATEGORIES.indexOf(cat), cat.slug]
      )
    }
    log(`✅ 分类导入完成: ${STANDARD_CATEGORIES.length} 个`)
    
    // 导入商品
    log(`\n开始导入 ${products.length} 个商品...`)
    let successCount = 0
    let imageCount = 0
    const batchSize = 100
    
    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      try {
        const productId = generateId()
        const categoryId = categoryIdMap[p.category_slug] || categoryIdMap['other']
        
        // 插入商品
        await client.query(
          `INSERT INTO product (id, title, handle, description, status, thumbnail, is_giftcard, discountable, external_id, created_at, updated_at, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, false, true, $7, NOW(), NOW(), $8)`,
          [productId, p.title, p.handle, p.description, p.status, p.thumbnail, p.external_id,
           JSON.stringify({ brand: p.brand, sku: p.sku })]
        )
        
        // 商品-分类关联
        await client.query(
          'INSERT INTO product_category_product (product_id, product_category_id) VALUES ($1, $2)',
          [productId, categoryId]
        )
        
        // 创建默认选项和变体
        const optionId = generateId()
        await client.query(
          `INSERT INTO product_option (id, title, created_at, updated_at, metadata)
           VALUES ($1, $2, NOW(), NOW(), $3)`,
          [optionId, `Default-${p.external_id}`, JSON.stringify({})]
        )
        
        await client.query(
          'INSERT INTO product_product_option (product_id, product_option_id) VALUES ($1, $2)',
          [productId, optionId]
        )
        
        const optionValueId = generateId()
        await client.query(
          `INSERT INTO product_option_value (id, value, option_id, created_at, updated_at, metadata, rank)
           VALUES ($1, $2, $3, NOW(), NOW(), $4, 0)`,
          [optionValueId, 'Default', optionId, JSON.stringify({})]
        )
        
        // 变体
        const variantId = generateId()
        await client.query(
          `INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, variant_rank, created_at, updated_at)
           VALUES ($1, $2, $3, $4, false, true, 0, NOW(), NOW())`,
          [variantId, 'Default Variant', p.sku, productId]
        )
        
        await client.query(
          'INSERT INTO product_variant_option (variant_id, option_value_id) VALUES ($1, $2)',
          [variantId, optionValueId]
        )
        
        // 价格
        const priceSetId = generateId()
        await client.query('INSERT INTO price_set (id) VALUES ($1)', [priceSetId])
        
        await client.query(
          `INSERT INTO price (id, price_set_id, amount, currency_code, min_quantity, created_at, updated_at, raw_amount, raw_min_quantity)
           VALUES ($1, $2, $3, 'usd', 1, NOW(), NOW(), $4, $5)`,
          [generateId(), priceSetId, p.price_cents,
           JSON.stringify({ value: p.price_cents, precision: 20 }),
           JSON.stringify({ value: 1, precision: 20 })]
        )
        
        await client.query(
          'INSERT INTO product_variant_price_set (id, variant_id, price_set_id) VALUES ($1, $2, $3)',
          [generateId(), variantId, priceSetId]
        )
        
        // 图片
        for (let j = 0; j < p.images.length; j++) {
          const imgUrl = p.images[j]
          const imageId = generateId()
          await client.query(
            `INSERT INTO image (id, url, product_id, rank, created_at, updated_at, metadata)
             VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)`,
            [imageId, imgUrl, productId, j, JSON.stringify({})]
          )
          imageCount++
          
          // 第一张图关联到变体
          if (j === 0) {
            await client.query(
              'INSERT INTO product_variant_product_image (id, variant_id, image_id) VALUES ($1, $2, $3)',
              [generateId(), variantId, imageId]
            )
          }
        }
        
        successCount++
      } catch (e) {
        console.error(`商品 ${p.external_id} 导入失败:`, e.message)
      }
      
      if ((i + 1) % 500 === 0) {
        log(`进度: ${i + 1}/${products.length}, 成功: ${successCount}, 图片: ${imageCount}`)
      }
    }
    
    await client.query('COMMIT')
    
    log(`\n${'='.repeat(60)}`)
    log(`✅ ETL 全量导入完成!`)
    log(`   商品总数: ${products.length}`)
    log(`   成功导入: ${successCount}`)
    log(`   品牌总数: ${brands.length}`)
    log(`   图片总数: ${imageCount}`)
    log(`   分类总数: ${STANDARD_CATEGORIES.length}`)
    log(`${'='.repeat(60)}`)
    
    // 验证
    const verify = await client.query('SELECT COUNT(*) as c FROM product WHERE external_id IS NOT NULL')
    log(`验证: 数据库商品数 = ${verify.rows[0].c}`)
    
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('导入失败:', e)
    throw e
  } finally {
    await client.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
