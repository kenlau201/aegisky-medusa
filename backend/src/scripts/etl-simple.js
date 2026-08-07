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

async function main() {
  const client = new Client(CONFIG.DB)
  await client.connect()
  log('数据库连接成功')

  try {
    // 读取已转换好的staging数据
    const products = JSON.parse(fs.readFileSync(path.join(CONFIG.DATA_DIR, 'staging-products.json'), 'utf8'))
    const brands = JSON.parse(fs.readFileSync(path.join(CONFIG.DATA_DIR, 'brands.json'), 'utf8'))
    log(`读取staging数据: ${products.length}商品, ${brands.length}品牌`)

    // 52个标准分类
    const STANDARD_CATEGORIES = [
      { slug: 'quadcopters', name: '四旋翼机' }, { slug: 'training-drones', name: '训练用无人机' },
      { slug: 'thermal-imaging-drones', name: '热成像无人机' }, { slug: 'waterproof-drones', name: '防水无人机' },
      { slug: 'fpv-drones', name: 'FPV无人机' }, { slug: 'russian-drones', name: '俄罗斯联邦无人机' },
      { slug: 'multirotors', name: '多旋翼机' }, { slug: 'aerial-drones', name: '航空型无人机' },
      { slug: 'vtol-drones', name: '垂直起降无人机' }, { slug: 'fixed-wing-drones', name: '固定翼无人机' },
      { slug: 'accessories', name: '配件' }, { slug: 'robots', name: '机器人' },
      { slug: 'portable-power-stations', name: '便携式发电站' }, { slug: 'solar-panels', name: '太阳能电池板' },
      { slug: 'underwater-drones', name: '水下无人机' }, { slug: 'vehicles', name: '车辆' },
      { slug: 'drone-kits', name: '无人机组装套件' }, { slug: 'counter-drones', name: '反无人机' },
      { slug: 'frames', name: '框架' }, { slug: 'autopilots', name: '自动驾驶仪' },
      { slug: 'lidar', name: '激光雷达' }, { slug: 'launch-pads', name: '发射台' },
      { slug: 'receivers', name: '接收器' }, { slug: 'remote-radiometry', name: '远程辐射测量系统' },
      { slug: 'control-panels', name: '控制面板' }, { slug: 'antennas', name: '天线' },
      { slug: 'motors', name: '电机' }, { slug: 'servos', name: '舵机' },
      { slug: 'blades-propellers', name: '螺旋桨' }, { slug: 'cameras-video', name: '摄像机' },
      { slug: 'machine-vision-cameras', name: '机器视觉摄像机' }, { slug: 'spectrum-analyzers', name: '频谱分析仪' },
      { slug: 'fpv-integration', name: 'FPV积分' }, { slug: 'esc-controllers', name: 'ESC电调' },
      { slug: 'lanterns', name: '灯光' }, { slug: 'batteries', name: '电池' },
      { slug: 'charging-equipment', name: '充电设备' }, { slug: 'rifle-scopes', name: '步枪瞄准镜' },
      { slug: 'thermal-scopes', name: '热成像瞄准镜' }, { slug: 'tools', name: '工具' },
      { slug: 'microcomputers', name: '微型计算机' }, { slug: 'chips', name: '芯片' },
      { slug: 'monitors', name: '监视器' }, { slug: 'radio-stations', name: '广播电台' },
      { slug: 'gimbals', name: '云台' }, { slug: 'thermal-cameras', name: '热成像相机' },
      { slug: 'carbon-materials', name: '碳材料' }, { slug: 'rings', name: '环形' },
      { slug: 'network-equipment', name: '网络设备' }, { slug: 'kyocera-repair-kits', name: '京瓷维修套件' },
      { slug: 'hosts', name: '主机' }, { slug: 'other', name: '其他' },
    ]

    // 清空
    log('清空旧数据...')
    await client.query('SET session_replication_role = replica')
    await client.query('TRUNCATE TABLE product_category_product, product_variant_product_image, product_variant_option, product_variant_price_set, price, price_set, product_variant, product_option_value, product_product_option, product_option, image, product, product_category CASCADE')
    await client.query('SET session_replication_role = DEFAULT')

    // 导入分类
    log('导入52个分类...')
    const categoryIdMap = {}
    for (let i = 0; i < STANDARD_CATEGORIES.length; i++) {
      const cat = STANDARD_CATEGORIES[i]
      const id = generateId()
      categoryIdMap[cat.slug] = id
      await client.query(
        `INSERT INTO product_category (id, name, handle, mpath, is_active, is_internal, rank, created_at, updated_at, external_id)
         VALUES ($1, $2, $3, $4, true, false, $5, NOW(), NOW(), $6)`,
        [id, cat.name, cat.slug, cat.slug, i, cat.slug]
      )
    }

    // 导入商品
    log(`导入 ${products.length} 个商品...`)
    let success = 0, failed = 0, imageCount = 0

    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      try {
        const productId = generateId()
        const categoryId = categoryIdMap[p.category_slug] || categoryIdMap['other']

        await client.query(
          `INSERT INTO product (id, title, handle, description, status, thumbnail, is_giftcard, discountable, external_id, created_at, updated_at, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, false, true, $7, NOW(), NOW(), $8)`,
          [productId, p.title.substring(0, 500), p.handle, (p.description || '').substring(0, 20000),
           p.status, p.thumbnail, p.external_id, JSON.stringify({ brand: p.brand, sku: p.sku })]
        )

        await client.query(
          'INSERT INTO product_category_product (product_id, product_category_id) VALUES ($1, $2)',
          [productId, categoryId]
        )

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
        log(`进度: ${i+1}/${products.length}, 成功:${success}, 失败:${failed}, 图片:${imageCount}`)
      }
    }

    log('\n' + '='.repeat(60))
    log(`✅ 导入完成!`)
    log(`   商品: ${success}成功 / ${failed}失败`)
    log(`   品牌: ${brands.length}`)
    log(`   图片: ${imageCount}`)
    log(`   分类: ${STANDARD_CATEGORIES.length}`)
    log('='.repeat(60))

  } catch (e) {
    console.error('错误:', e)
  } finally {
    await client.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
