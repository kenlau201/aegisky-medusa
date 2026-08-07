require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const fs = require('fs/promises')
const fsSync = require('fs')
const path = require('path')
const crypto = require('crypto')

// 配置
const CONFIG = {
  SOURCE_DATA_DIR: 'D:/scraper/data',
  MEDUSA_URL: 'http://localhost:9000',
  ADMIN_EMAIL: 'admin@aegisky.com',
  ADMIN_PASSWORD: 'admin123456',
  BATCH_SIZE: 20,
  MAX_RETRIES: 3,
  EXCHANGE_RATE: 0.0112, // 1 RUB = 0.0112 USD
  DATA_DIR: path.resolve(__dirname, '../data'),
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

let authToken = null

// 日志
function log(step, message, data) {
  const time = new Date().toISOString()
  console.log(`[${time}] [${step}] ${message}`, data || '')
}

// 延迟
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// API调用
async function api(path, options = {}) {
  const url = `${CONFIG.MEDUSA_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  }
  
  for (let i = 0; i < CONFIG.MAX_RETRIES; i++) {
    try {
      const res = await fetch(url, { ...options, headers })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`HTTP ${res.status}: ${err}`)
      }
      return await res.json()
    } catch (e) {
      if (i === CONFIG.MAX_RETRIES - 1) throw e
      await sleep(1000 * (i + 1))
    }
  }
}

// 计算哈希
function hashData(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

/**
 * 第一步：提取原始数据
 */
async function extract() {
  log('EXTRACT', '开始读取原始数据...')
  
  const files = fsSync.readdirSync(CONFIG.SOURCE_DATA_DIR).filter(f => f.endsWith('.json'))
  const allProducts = []
  
  for (const file of files) {
    try {
      const content = JSON.parse(fsSync.readFileSync(path.join(CONFIG.SOURCE_DATA_DIR, file), 'utf8'))
      const products = Array.isArray(content) ? content : (content.products || [])
      allProducts.push(...products)
    } catch(e) {
      log('EXTRACT', `跳过文件 ${file}: ${e.message}`)
    }
  }
  
  // 去重
  const unique = new Map()
  allProducts.forEach(p => unique.set(p.id, p))
  const products = Array.from(unique.values())
  
  log('EXTRACT', `读取完成: ${products.length} 个唯一商品`)
  
  // 校验
  if (products.length < 6000) throw new Error(`商品数量异常: ${products.length}`)
  
  return products
}

/**
 * 第二步：清洗转换
 */
async function transform(products) {
  log('TRANSFORM', '开始数据清洗转换...')
  
  // 加载分类映射
  const categoryMap = JSON.parse(fsSync.readFileSync(
    path.join(CONFIG.DATA_DIR, 'category-map.json'), 'utf8'
  ))
  
  // 提取品牌
  const brandsSet = new Set()
  products.forEach(p => {
    const brandAttr = (p.attributes || []).find(a => a.name === 'Бренд')
    if (brandAttr?.terms?.[0]?.name) {
      brandsSet.add(brandAttr.terms[0].name.trim())
    }
  })
  const brands = Array.from(brandsSet).sort()
  log('TRANSFORM', `提取到 ${brands.length} 个品牌`)
  
  // 转换每个商品
  const transformed = products.map(p => {
    // 分类映射
    let categorySlug = 'other'
    for (const c of (p.categories || [])) {
      if (categoryMap[c.id?.toString()]) {
        categorySlug = categoryMap[c.id.toString()]
        break
      }
    }
    
    // 价格转换
    const priceRub = parseFloat(p.price) || 0
    const priceUsd = Math.round(priceRub * CONFIG.EXCHANGE_RATE * 100) / 100
    
    // 品牌
    const brandAttr = (p.attributes || []).find(a => a.name === 'Бренд')
    const brand = brandAttr?.terms?.[0]?.name?.trim() || 'Generic'
    
    // 图片
    const images = (p.images || []).map(img => img.src).filter(Boolean)
    
    // 描述：去HTML
    const description = (p.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 10000)
    
    // 生成handle
    const handle = `product-${p.id}`
    
    return {
      external_id: p.id.toString(),
      title: p.name || `Product ${p.id}`,
      original_name_ru: p.name,
      description,
      handle,
      sku: p.sku || `SKU-${p.id}`,
      price: priceUsd > 0 ? priceUsd : 0.01,
      original_price_rub: priceRub,
      status: p.status === 'publish' ? 'published' : 'draft',
      brand,
      category_slug: categorySlug,
      images,
      source_url: `https://copterparts.ru/product/${p.slug}/`,
      data_hash: hashData(p),
      weight: 0,
    }
  })
  
  // 处理重复SKU
  const skuCount = {}
  transformed.forEach(p => {
    if (!skuCount[p.sku]) {
      skuCount[p.sku] = 0
    }
    skuCount[p.sku]++
    if (skuCount[p.sku] > 1) {
      p.sku = `${p.sku}-${p.external_id}`
    }
  })
  
  // 分类统计
  const categoryStats = {}
  transformed.forEach(p => {
    categoryStats[p.category_slug] = (categoryStats[p.category_slug] || 0) + 1
  })
  log('TRANSFORM', '分类分布:', categoryStats)
  
  return { products: transformed, brands }
}

/**
 * 第三步：Staging校验
 */
async function validate(data) {
  log('VALIDATE', '开始数据校验...')
  const errors = []
  
  // 1. 非空检查
  const noTitle = data.products.filter(p => !p.title)
  if (noTitle.length > 0) errors.push(`${noTitle.length} 个商品无标题`)
  
  // 2. 价格检查
  const invalidPrice = data.products.filter(p => !p.price || p.price <= 0)
  if (invalidPrice.length > 0) log('VALIDATE', `警告: ${invalidPrice.length} 个商品价格为0，设为默认价`)
  
  // 3. SKU唯一
  const skus = data.products.map(p => p.sku)
  if (new Set(skus).size !== skus.length) errors.push('SKU有重复')
  
  // 4. 分类有效
  const validSlugs = new Set(STANDARD_CATEGORIES.map(c => c.slug))
  const invalidCat = data.products.filter(p => !validSlugs.has(p.category_slug))
  if (invalidCat.length > 0) errors.push(`${invalidCat.length} 个商品分类无效`)
  
  // 5. external_id唯一
  const ids = data.products.map(p => p.external_id)
  if (new Set(ids).size !== ids.length) errors.push('external_id有重复')
  
  if (errors.length > 0) {
    log('VALIDATE', '校验失败:', errors)
    throw new Error('校验失败: ' + errors.join('; '))
  }
  
  log('VALIDATE', '✅ 所有校验通过!')
}

/**
 * 登录
 */
async function login() {
  log('IMPORT', '登录Medusa管理后台...')
  const res = await api('/auth/user/emailpass', {
    method: 'POST',
    body: JSON.stringify({
      email: CONFIG.ADMIN_EMAIL,
      password: CONFIG.ADMIN_PASSWORD,
    }),
  })
  authToken = res.token
  log('IMPORT', '登录成功')
}

/**
 * 导入分类
 */
async function importCategories() {
  log('IMPORT', '开始导入52个标准分类...')
  const idMap = {}
  
  for (const cat of STANDARD_CATEGORIES) {
    try {
      // 查找是否存在
      const list = await api(`/admin/product-categories?q=${encodeURIComponent(cat.name)}`)
      const existing = list.product_categories?.find(c => c.name === cat.name)
      
      if (existing) {
        idMap[cat.slug] = existing.id
      } else {
        const created = await api('/admin/product-categories', {
          method: 'POST',
          body: JSON.stringify({
            name: cat.name,
            handle: cat.slug,
            is_active: true,
            is_internal: false,
          }),
        })
        idMap[cat.slug] = created.product_category.id
        log('IMPORT', `创建分类: ${cat.name}`)
      }
    } catch(e) {
      log('IMPORT', `分类 ${cat.name} 处理失败: ${e.message}`)
    }
  }
  
  log('IMPORT', `✅ 分类导入完成: ${Object.keys(idMap).length} 个`)
  return idMap
}

/**
 * 导入商品
 */
async function importProducts(products, categoryIdMap) {
  log('IMPORT', `开始导入 ${products.length} 个商品...`)
  
  let success = 0
  let failed = 0
  let updated = 0
  let created = 0
  const failedItems = []
  
  for (let i = 0; i < products.length; i += CONFIG.BATCH_SIZE) {
    const batch = products.slice(i, i + CONFIG.BATCH_SIZE)
    
    for (const product of batch) {
      try {
        // 查找是否已存在（按external_id）
        const list = await api(`/admin/products?q=&external_id=${product.external_id}`)
        const existing = list.products?.find(p => p.external_id === product.external_id)
        
        if (existing) {
          // 更新
          await api(`/admin/products/${existing.id}`, {
            method: 'POST',
            body: JSON.stringify({
              title: product.title,
              description: product.description,
              status: product.status,
              external_id: product.external_id,
              source_url: product.source_url,
              original_name_ru: product.original_name_ru,
              original_price_rub: product.original_price_rub,
              data_hash: product.data_hash,
              last_synced_at: new Date().toISOString(),
              sync_status: 'success',
            }),
          })
          updated++
        } else {
          // 创建
          await api('/admin/products', {
            method: 'POST',
            body: JSON.stringify({
              title: product.title,
              description: product.description,
              status: product.status,
              handle: product.handle,
              external_id: product.external_id,
              source_url: product.source_url,
              original_name_ru: product.original_name_ru,
              original_price_rub: product.original_price_rub,
              data_hash: product.data_hash,
              imported_at: new Date().toISOString(),
              last_synced_at: new Date().toISOString(),
              sync_status: 'success',
              categories: [{ id: categoryIdMap[product.category_slug] }],
              prices: [{
                amount: Math.round(product.price * 100),
                currency_code: 'usd',
              }],
              options: [{ title: 'Default', values: ['Default'] }],
              variants: [{
                title: 'Default',
                sku: product.sku,
                prices: [{ amount: Math.round(product.price * 100), currency_code: 'usd' }],
                options: { Default: 'Default' },
                manage_inventory: false,
                inventory_quantity: 100,
              }],
            }),
          })
          created++
        }
        success++
      } catch(e) {
        failed++
        failedItems.push({
          external_id: product.external_id,
          title: product.title,
          error: e.message.substring(0, 200),
        })
      }
    }
    
    log('IMPORT', `进度: ${Math.min(i + CONFIG.BATCH_SIZE, products.length)}/${products.length}, 成功: ${success} (新建${created}/更新${updated}), 失败: ${failed}`)
    await sleep(500)
  }
  
  // 保存失败记录
  if (failedItems.length > 0) {
    await fs.writeFile(
      path.join(CONFIG.DATA_DIR, 'import-failed.json'),
      JSON.stringify(failedItems, null, 2)
    )
    log('IMPORT', `失败记录已保存，共 ${failedItems.length} 条`)
  }
  
  log('IMPORT', `✅ 商品导入完成: 成功 ${success} (新建${created}/更新${updated}), 失败 ${failed}`)
  return { success, failed, created, updated, failedItems }
}

/**
 * 对账
 */
async function reconcile(expected) {
  log('RECONCILE', '开始导入后对账...')
  
  const res = await api('/admin/products?limit=1')
  const count = res.count
  
  log('RECONCILE', `数据库商品数: ${count}, 预期: ${expected}`)
  
  if (Math.abs(count - expected) > 500) {
    throw new Error(`对账失败! 数量差异过大: ${count} vs ${expected}`)
  }
  
  log('RECONCILE', '✅ 对账完成!')
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60))
  console.log('  Aegisky Medusa ETL 全量数据导入')
  console.log('='.repeat(60))
  console.log('')
  
  try {
    // 1. 提取
    const rawProducts = await extract()
    
    // 2. 转换
    const transformed = await transform(rawProducts)
    
    // 保存转换后的数据
    await fs.writeFile(
      path.join(CONFIG.DATA_DIR, 'staging-products.json'),
      JSON.stringify(transformed.products, null, 2)
    )
    log('TRANSFORM', '暂存数据已保存到 staging-products.json')
    
    // 3. 校验
    await validate(transformed)
    
    // 4. 登录
    await login()
    
    // 5. 导入分类
    const categoryIdMap = await importCategories()
    
    // 6. 导入商品
    // 测试模式：只导入前50个
    const testLimit = process.env.ETL_LIMIT ? parseInt(process.env.ETL_LIMIT) : 0
    const productsToImport = testLimit > 0 ? transformed.products.slice(0, testLimit) : transformed.products
    log('IMPORT', testLimit > 0 ? `测试模式：只导入前 ${testLimit} 个商品` : '全量导入模式')
    
    const result = await importProducts(productsToImport, categoryIdMap)
    
    // 7. 对账
    await reconcile(productsToImport.length)
    
    console.log('')
    console.log('='.repeat(60))
    console.log('  ✅ ETL 导入完成!')
    console.log(`  总商品数: ${transformed.products.length}`)
    console.log(`  新建: ${result.created}`)
    console.log(`  更新: ${result.updated}`)
    console.log(`  失败: ${result.failed}`)
    console.log('='.repeat(60))
    
  } catch(e) {
    console.error('❌ ETL失败:', e.message)
    console.error(e.stack)
    process.exit(1)
  }
}

main()
