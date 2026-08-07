require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Client } = require('pg')

// 配置
const CONFIG = {
  SOURCE_DATA_DIR: 'D:/scraper/data',
  DB: {
    host: 'localhost',
    port: 5434,
    user: 'medusa',
    password: 'medusa_password',
    database: 'medusa-aegisky'
  },
  EXCHANGE_RATE: 0.0112,
  DATA_DIR: path.resolve(__dirname, '../data'),
  BATCH_SIZE: 500,
}

// 52个标准分类定义
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

/**
 * 提取和转换数据
 */
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
  
  // 加载手动分类映射
  const manualMap = require('../data/category-manual-map.js')
  
  // 分类映射函数
  function mapCategory(catId, catName) {
    const id = catId?.toString()
    const name = (catName || '').toLowerCase()
    
    // 1. 优先按ID精确映射
    if (manualMap.idMap[id]) {
      return manualMap.idMap[id]
    }
    
    // 2. 按关键词匹配
    for (const [keyword, slug] of Object.entries(manualMap.keywordMap)) {
      if (name.includes(keyword.toLowerCase())) {
        return slug
      }
    }
    
    // 3. 默认其他
    return 'other'
  }
  
  // 转换
  const categoryStats = {}
  const transformed = products.map(p => {
    // 分类 - 遍历所有分类，找到第一个匹配的非other分类
    let categorySlug = 'other'
    for (const c of (p.categories || [])) {
      const mapped = mapCategory(c.id, c.name)
      if (mapped !== 'other') {
        categorySlug = mapped
        break
      }
    }
    
    // 统计分类分布
    categoryStats[categorySlug] = (categoryStats[categorySlug] || 0) + 1
    
    // 价格
    const priceRub = parseFloat(p.price) || 0
    const priceUsd = Math.round(priceRub * CONFIG.EXCHANGE_RATE * 100) // 分
    
    // 品牌
    const brandAttr = (p.attributes || []).find(a => a.name === 'Бренд')
    const brand = brandAttr?.terms?.[0]?.name?.trim() || 'Generic'
    
    // 图片
    const images = (p.images || []).map(img => img.src).filter(Boolean)
    
    // 描述
    const description = (p.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 10000)
    
    return {
      external_id: p.id.toString(),
      title: p.name || `Product ${p.id}`,
      handle: `product-${p.id}`,
      sku: p.sku || `SKU-${p.id}`,
      description,
      price_cents: priceUsd > 0 ? priceUsd : 1, // 1美分
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
  
  // 输出分类分布
  log('分类分布统计:')
  const sortedStats = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])
  sortedStats.forEach(([slug, count]) => {
    const cat = STANDARD_CATEGORIES.find(c => c.slug === slug)
    log(`  ${cat?.name || slug}: ${count}个 (${Math.round(count / products.length * 100)}%)`)
  })
  log(`"其他"分类商品数: ${categoryStats['other'] || 0}个 (${Math.round((categoryStats['other'] || 0) / products.length * 100)}%)`)
  
  // 保存暂存数据
  fs.writeFileSync(
    path.join(CONFIG.DATA_DIR, 'staging-products.json'),
    JSON.stringify(transformed, null, 2)
  )
  log('暂存数据已保存')
  
  return transformed
}

/**
 * 主导入函数
 */
async function main() {
  const client = new Client(CONFIG.DB)
  await client.connect()
  log('数据库连接成功')
  
  try {
    await client.query('BEGIN')
    
    // 1. 清空现有数据（只清空我们导入的，保留系统数据）
    log('清空旧数据...')
    await client.query('DELETE FROM product_category_product')
    await client.query('DELETE FROM product_variant_product_image')
    await client.query('DELETE FROM product_variant_option')
    await client.query('DELETE FROM product_variant_price_set')
    await client.query('DELETE FROM price')
    await client.query('DELETE FROM price_set')
    await client.query('DELETE FROM product_variant')
    await client.query('DELETE FROM product_option_value')
    await client.query('DELETE FROM product_product_option')
    await client.query('DELETE FROM product_option')
    await client.query('DELETE FROM image')
    await client.query('DELETE FROM product WHERE external_id IS NOT NULL')
    await client.query("DELETE FROM product_category WHERE handle LIKE '%' AND id NOT IN (SELECT id FROM product_category WHERE name = 'Homepage')")
    log('旧数据已清空')
    
    // 2. 导入52个分类
    log('导入52个标准分类...')
    const categoryIdMap = {}
    for (let i = 0; i < STANDARD_CATEGORIES.length; i++) {
      const cat = STANDARD_CATEGORIES[i]
      const id = generateId()
      await client.query(`
        INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, created_at, updated_at)
        VALUES ($1, $2, '', $3, $4, true, false, $5, NOW(), NOW())
      `, [id, cat.name, cat.slug, `/${cat.slug}`, i])
      categoryIdMap[cat.slug] = id
    }
    log(`✅ 分类导入完成: ${Object.keys(categoryIdMap).length} 个`)
    
    // 3. 提取转换数据
    const products = extractAndTransform()
    
    // 4. 批量导入商品
    log(`开始导入 ${products.length} 个商品...`)
    
    let successCount = 0
    let imageCount = 0
    
    for (let i = 0; i < products.length; i += CONFIG.BATCH_SIZE) {
      const batch = products.slice(i, i + CONFIG.BATCH_SIZE)
      
      for (const p of batch) {
        try {
          const productId = generateId()
          const variantId = generateId()
          const optionId = generateId()
          const optionValueId = generateId()
          const priceSetId = generateId()
          
          // 插入商品
          await client.query(`
            INSERT INTO product (
              id, title, handle, description, status, thumbnail, 
              is_giftcard, discountable, weight, external_id, 
              created_at, updated_at, metadata
            ) VALUES (
              $1, $2, $3, $4, $5, $6,
              false, true, 0, $7,
              NOW(), NOW(), $8
            )
          `, [
            productId, p.title, p.handle, p.description, p.status, p.thumbnail,
            p.external_id,
            JSON.stringify({ brand: p.brand, original_price_rub: Math.round(p.price_cents / 100 / CONFIG.EXCHANGE_RATE) })
          ])
          
          // 插入分类关联
          if (categoryIdMap[p.category_slug]) {
            await client.query(`
              INSERT INTO product_category_product (product_id, product_category_id)
              VALUES ($1, $2)
            `, [productId, categoryIdMap[p.category_slug]])
          }
          
          // 插入默认选项
          await client.query(`
            INSERT INTO product_option (id, title, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
          `, [optionId, `Default-${p.external_id}`])
          
          // 关联商品和选项
          await client.query(`
            INSERT INTO product_product_option (id, product_id, product_option_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [generateId(), productId, optionId])
          
          await client.query(`
            INSERT INTO product_option_value (id, option_id, value, created_at, updated_at)
            VALUES ($1, $2, 'Default', NOW(), NOW())
          `, [optionValueId, optionId])
          
          // 插入变体
          await client.query(`
            INSERT INTO product_variant (
              id, product_id, title, sku, manage_inventory,
              allow_backorder, variant_rank, created_at, updated_at
            ) VALUES (
              $1, $2, 'Default', $3, false,
              false, 0, NOW(), NOW()
            )
          `, [variantId, productId, p.sku])
          
          // 变体选项关联
          await client.query(`
            INSERT INTO product_variant_option (variant_id, option_value_id)
            VALUES ($1, $2)
          `, [variantId, optionValueId])
          
          // 插入价格
          await client.query(`
            INSERT INTO price_set (id, created_at, updated_at)
            VALUES ($1, NOW(), NOW())
          `, [priceSetId])
          
          await client.query(`
            INSERT INTO price (
              id, price_set_id, amount, currency_code, min_quantity, 
              max_quantity, raw_amount, raw_min_quantity, created_at, updated_at
            ) VALUES (
              $1, $2, $3, 'usd', 1,
              NULL, $4, $5, NOW(), NOW()
            )
          `, [
            generateId(), 
            priceSetId, 
            p.price_cents,
            JSON.stringify({ value: p.price_cents, precision: 20 }),
            JSON.stringify({ value: 1, precision: 20 })
          ])
          
          await client.query(`
            INSERT INTO product_variant_price_set (id, variant_id, price_set_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
          `, [generateId(), variantId, priceSetId])
          
          // 插入图片
          for (let j = 0; j < Math.min(p.images.length, 10); j++) {
            const imgUrl = p.images[j]
            const imageId = generateId()
            await client.query(`
              INSERT INTO image (id, url, product_id, rank, created_at, updated_at, metadata)
              VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
            `, [imageId, imgUrl, productId, j, JSON.stringify({})])
            
            await client.query(`
              INSERT INTO product_variant_product_image (id, variant_id, image_id, created_at, updated_at)
              VALUES ($1, $2, $3, NOW(), NOW())
            `, [generateId(), variantId, imageId])
            imageCount++
          }
          
          successCount++
        } catch(e) {
          log(`商品 ${p.external_id} 导入失败: ${e.message}`)
        }
      }
      
      log(`进度: ${Math.min(i + CONFIG.BATCH_SIZE, products.length)}/${products.length}, 成功: ${successCount}, 图片: ${imageCount}`)
    }
    
    await client.query('COMMIT')
    
    log('')
    log('='.repeat(60))
    log('✅ ETL 数据库导入完成!')
    log(`   商品总数: ${products.length}`)
    log(`   成功导入: ${successCount}`)
    log(`   图片总数: ${imageCount}`)
    log(`   分类总数: ${STANDARD_CATEGORIES.length}`)
    log('='.repeat(60))
    
    // 验证
    const countRes = await client.query('SELECT COUNT(*) as count FROM product WHERE external_id IS NOT NULL')
    log(`验证: 数据库商品数 = ${countRes.rows[0].count}`)
    
  } catch(e) {
    await client.query('ROLLBACK')
    console.error('❌ 导入失败:', e)
    throw e
  } finally {
    await client.end()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
