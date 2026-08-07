require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Client } = require('pg')

const CONFIG = {
  DB: {
    host: 'localhost', port: 5434, user: 'medusa',
    password: 'medusa_password', database: 'medusa-aegisky'
  },
  DATA_DIR: path.resolve(__dirname, '../data'),
}

function generateId() { return crypto.randomUUID() }
function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`) }

// 正确的51个分类（删除"其他"，修正翻译错误）
const STANDARD_CATEGORIES = [
  // 无人机整机类
  { slug: 'quadcopters', name: 'Quadcopters', name_cn: '四旋翼机' },
  { slug: 'training-drones', name: 'Training Drones', name_cn: '训练用无人机' },
  { slug: 'thermal-drones', name: 'Thermal Imaging Drones', name_cn: '热成像无人机' },
  { slug: 'waterproof-drones', name: 'Waterproof Drones', name_cn: '防水无人机' },
  { slug: 'fpv-drones', name: 'FPV Drones', name_cn: 'FPV无人机' },
  { slug: 'rf-drones', name: 'Russian Federation Drones', name_cn: '俄罗斯联邦无人机' },
  { slug: 'multicopters', name: 'Multicopters', name_cn: '多旋翼机' },
  { slug: 'fixed-wing-aircraft', name: 'Fixed-Wing Aircraft', name_cn: '航空型无人机' },
  { slug: 'vtol-drones', name: 'VTOL Drones', name_cn: '垂直起降无人机' },
  { slug: 'fixed-wing-drones', name: 'Fixed-Wing Drones', name_cn: '固定翼无人机' },
  // 通用产品与配件
  { slug: 'accessories', name: 'Accessories', name_cn: '通用配件' },
  { slug: 'robots', name: 'Robots', name_cn: '机器人' },
  { slug: 'power-stations', name: 'Portable Power Stations', name_cn: '便携式发电站' },
  { slug: 'solar-panels', name: 'Solar Panels', name_cn: '太阳能电池板' },
  { slug: 'underwater-drones', name: 'Underwater Drones', name_cn: '水下无人机' },
  { slug: 'vehicles', name: 'Electric Vehicles', name_cn: '电动车辆' },
  { slug: 'drone-kits', name: 'Drone Assembly Kits', name_cn: '无人机组装套件' },
  { slug: 'anti-drone', name: 'Anti-Drone Systems', name_cn: '反无人机系统' },
  // 结构与飞控系统
  { slug: 'frames', name: 'Frames', name_cn: '机架/框架' },
  { slug: 'autopilots', name: 'Autopilots & Flight Controllers', name_cn: '自动驾驶仪/飞控' },
  { slug: 'lidars', name: 'Lidars', name_cn: '激光雷达' },
  { slug: 'transmitters', name: 'Video Transmitters', name_cn: '图传发射器' },
  { slug: 'receivers', name: 'Receivers', name_cn: '接收器' },
  { slug: 'telemetry', name: 'Long-Range Telemetry', name_cn: '远程辐射测量系统' },
  { slug: 'controllers', name: 'Radio Controllers', name_cn: '遥控器' },
  { slug: 'antennas', name: 'Antennas', name_cn: '天线' },
  // 动力与成像系统
  { slug: 'motors', name: 'Motors', name_cn: '电机' },
  { slug: 'servos', name: 'Servos', name_cn: '舵机' },
  { slug: 'propellers', name: 'Propellers', name_cn: '螺旋桨' },
  { slug: 'cameras-video', name: 'Cameras & Video', name_cn: '摄像机与视频' },
  { slug: 'vision-cameras', name: 'Machine Vision Cameras', name_cn: '机器视觉相机' },
  { slug: 'spectrum-analyzers', name: 'Spectrum Analyzers', name_cn: '频谱分析仪' },
  { slug: 'fpv-goggles', name: 'FPV Goggles', name_cn: 'FPV眼镜' },
  { slug: 'esc', name: 'ESC Speed Controllers', name_cn: 'ESC电调' },
  { slug: 'flashlights', name: 'Flashlights & Lighting', name_cn: '手电筒/灯光' },
  { slug: 'batteries', name: 'Batteries', name_cn: '电池' },
  // 充电与计算工具
  { slug: 'chargers', name: 'Battery Chargers', name_cn: '充电器' },
  { slug: 'optical-sights', name: 'Optical Sights', name_cn: '光学瞄准镜' },
  { slug: 'thermal-sights', name: 'Thermal Sights', name_cn: '热成像瞄准镜' },
  { slug: 'tools', name: 'Tools', name_cn: '工具' },
  { slug: 'microcomputers', name: 'Microcomputers', name_cn: '微型计算机' },
  { slug: 'chips', name: 'Chips & Modules', name_cn: '芯片/模块' },
  { slug: 'monitors', name: 'FPV Monitors', name_cn: '监视器' },
  { slug: 'radios', name: 'Radio Stations', name_cn: '对讲机/电台' },
  // 云台与杂项配件
  { slug: 'gimbals', name: 'Gimbals', name_cn: '云台' },
  { slug: 'thermal-cameras', name: 'Thermal Cameras', name_cn: '热成像相机' },
  { slug: 'carbon', name: 'Carbon Materials', name_cn: '碳材料' },
  { slug: 'cables', name: 'FFC Cables & Wires', name_cn: 'FFC排线' },
  { slug: 'network', name: 'Network Equipment', name_cn: '网络设备' },
  { slug: 'kyocera', name: 'Kyocera Repair Kits', name_cn: '京瓷维修套件' },
  { slug: 'consoles', name: 'Consoles & Mini PCs', name_cn: '游戏/迷你主机' },
]

async function main() {
  const client = new Client(CONFIG.DB)
  await client.connect()
  log('数据库连接成功')

  try {
    // 读取v3 staging数据
    const products = JSON.parse(fs.readFileSync(path.join(CONFIG.DATA_DIR, 'staging-products-v3.json'), 'utf8'))
    const brands = JSON.parse(fs.readFileSync(path.join(CONFIG.DATA_DIR, 'brands-v3.json'), 'utf8'))
    log(`读取staging数据: ${products.length}商品, ${brands.length}品牌`)

    // 清空旧数据
    log('清空旧数据...')
    await client.query('SET session_replication_role = replica')
    await client.query('TRUNCATE TABLE product_category_product, product_variant_product_image, product_variant_option, product_variant_price_set, price, price_set, product_variant, product_option_value, product_product_option, product_option, image, product, product_category CASCADE')
    await client.query('SET session_replication_role = DEFAULT')

    // 导入51个分类
    log(`导入${STANDARD_CATEGORIES.length}个分类...`)
    const categoryIdMap = {}
    for (let i = 0; i < STANDARD_CATEGORIES.length; i++) {
      const cat = STANDARD_CATEGORIES[i]
      const id = generateId()
      categoryIdMap[cat.slug] = id
      await client.query(
        `INSERT INTO product_category (id, name, handle, mpath, is_active, is_internal, rank, created_at, updated_at, external_id, description)
         VALUES ($1, $2, $3, $4, true, false, $5, NOW(), NOW(), $6, $7)`,
        [id, cat.name, cat.slug, cat.slug, i, cat.slug, cat.name_cn]
      )
    }

    // 导入商品
    log(`导入 ${products.length} 个商品...`)
    let success = 0, failed = 0, imageCount = 0, categoryLinkCount = 0

    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      try {
        const productId = generateId()

        await client.query(
          `INSERT INTO product (id, title, handle, description, status, thumbnail, is_giftcard, discountable, external_id, created_at, updated_at, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, false, true, $7, NOW(), NOW(), $8)`,
          [productId, p.title.substring(0, 500), p.handle, (p.description || '').substring(0, 20000),
           p.status, p.thumbnail, p.external_id, JSON.stringify({ brand: p.brand, sku: p.sku, categories: p.categories })]
        )

        // 多分类关联
        for (const catSlug of p.categories) {
          const catId = categoryIdMap[catSlug]
          if (catId) {
            await client.query(
              'INSERT INTO product_category_product (product_id, product_category_id) VALUES ($1, $2)',
              [productId, catId]
            )
            categoryLinkCount++
          }
        }

        // 选项和变体
        const optionId = generateId()
        await client.query(
          `INSERT INTO product_option (id, title, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`,
          [optionId, `Default-${p.external_id}`]
        )
        await client.query(
          'INSERT INTO product_product_option (id, product_id, product_option_id) VALUES ($1, $2, $3)',
          [generateId(), productId, optionId]
        )

        const optionValueId = generateId()
        await client.query(
          `INSERT INTO product_option_value (id, value, option_id, created_at, updated_at, rank)
           VALUES ($1, 'Default', $2, NOW(), NOW(), 0)`,
          [optionValueId, optionId]
        )

        const variantId = generateId()
        await client.query(
          `INSERT INTO product_variant (id, title, sku, product_id, manage_inventory, allow_backorder, variant_rank, created_at, updated_at)
           VALUES ($1, 'Default', $2, $3, false, true, 0, NOW(), NOW())`,
          [variantId, (p.sku || '').substring(0, 100), productId]
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
          const imgId = generateId()
          await client.query(
            `INSERT INTO image (id, url, product_id, rank, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [imgId, p.images[j], productId, j]
          )
          imageCount++
          if (j === 0) {
            await client.query(
              'INSERT INTO product_variant_product_image (id, variant_id, image_id) VALUES ($1, $2, $3)',
              [generateId(), variantId, imgId]
            )
          }
        }

        success++
      } catch (e) {
        failed++
        if (failed <= 5) console.error(`商品 ${p.external_id} 失败:`, e.message)
      }

      if ((i + 1) % 500 === 0) {
        log(`进度: ${i+1}/${products.length}, 成功:${success}, 失败:${failed}, 图片:${imageCount}, 分类关联:${categoryLinkCount}`)
      }
    }

    log('\n' + '='.repeat(60))
    log(`✅ 导入完成!`)
    log(`   商品: ${success}成功 / ${failed}失败`)
    log(`   品牌: ${brands.length}`)
    log(`   图片: ${imageCount}`)
    log(`   分类: ${STANDARD_CATEGORIES.length}个`)
    log(`   分类关联: ${categoryLinkCount}条（支持多分类）`)
    log('='.repeat(60))

  } catch (e) {
    console.error('错误:', e)
  } finally {
    await client.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
