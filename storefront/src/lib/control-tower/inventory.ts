/**
 * Aegisky Control Tower - 库存调度引擎
 * 全球多仓智能路由 + 行级锁防超卖 + 库存分配
 */
import { pool, getPreferredWarehouse, WAREHOUSES, type InventoryStock, type DispatchRecord } from './db'
import { randomUUID } from 'crypto'

// 区域到仓库的映射
const ZONE_WAREHOUSE_MAP: Record<string, string[]> = {
  EU_EAST: ['Poland_Central', 'Germany_North', 'UAE_Freezone'],
  EU_WEST: ['Germany_North', 'Poland_Central', 'UAE_Freezone'],
  MIDDLE_EAST: ['UAE_Freezone', 'Poland_Central', 'Singapore_Hub'],
  APAC: ['Singapore_Hub', 'UAE_Freezone', 'Poland_Central'],
  AMERICAS: ['US_West', 'Poland_Central', 'Germany_North'],
}

// 获取所有仓库库存
export async function getAllInventory(): Promise<(InventoryStock & { product_name?: string })[]> {
  const result = await pool.query(`
    SELECT s.*, p.name as product_name
    FROM ct_inventory_stocks s
    LEFT JOIN aegisky_products p ON s.product_id = p.sku
    ORDER BY s.product_id, s.warehouse
  `)
  return result.rows
}

// 获取指定商品在各仓库的库存
export async function getProductInventory(productId: string): Promise<InventoryStock[]> {
  const result = await pool.query(
    'SELECT * FROM ct_inventory_stocks WHERE product_id = $1 ORDER BY warehouse',
    [productId]
  )
  return result.rows
}

// 获取仓库汇总
export async function getWarehouseSummary(): Promise<Array<{
  warehouse: string
  name: string
  country: string
  zone: string
  total_skus: number
  total_units: number
  total_reserved: number
  available_units: number
}>> {
  const result = await pool.query(`
    SELECT
      warehouse,
      COUNT(*) as total_skus,
      SUM(quantity) as total_units,
      SUM(reserved) as total_reserved,
      SUM(quantity - reserved) as available_units
    FROM ct_inventory_stocks
    GROUP BY warehouse
    ORDER BY warehouse
  `)

  return result.rows.map(row => {
    const wh = WAREHOUSES.find(w => w.code === row.warehouse)
    return {
      warehouse: row.warehouse,
      name: wh?.name || row.warehouse,
      country: wh?.country || '',
      zone: wh?.zone || '',
      total_skus: parseInt(row.total_skus),
      total_units: parseInt(row.total_units),
      total_reserved: parseInt(row.total_reserved),
      available_units: parseInt(row.available_units),
    }
  })
}

// 智能库存分配（带行级锁防超卖）
export async function allocateStock(params: {
  tenantId?: string
  productId: string
  quantity: number
  zone: string
  destinationCountry?: string
}): Promise<{ success: boolean; status?: number; data?: any; error?: string }> {
  const tenantId = params.tenantId || '00000000-0000-0000-0000-000000000001'
  const client = await pool.connect()

  try {
    // 获取优先仓库列表
    const warehousePriority = ZONE_WAREHOUSE_MAP[params.zone] || [WAREHOUSES[0].code]

    await client.query('BEGIN')

    let allocatedWarehouse: string | null = null
    let availableQty = 0

    // 按优先级尝试每个仓库，使用SELECT FOR UPDATE锁定行
    for (const warehouse of warehousePriority) {
      const result = await client.query(
        `SELECT quantity, reserved FROM ct_inventory_stocks
         WHERE product_id = $1 AND warehouse = $2
         FOR UPDATE`,
        [params.productId, warehouse]
      )

      if (result.rows.length > 0) {
        const available = result.rows[0].quantity - result.rows[0].reserved
        if (available >= params.quantity) {
          allocatedWarehouse = warehouse
          availableQty = available
          break
        }
      }
    }

    if (!allocatedWarehouse) {
      await client.query('ROLLBACK')

      // 计算所有仓库总可用量
      const totalResult = await client.query(
        `SELECT COALESCE(SUM(quantity - reserved), 0) as total_available
         FROM ct_inventory_stocks WHERE product_id = $1`,
        [params.productId]
      )
      const totalAvailable = parseInt(totalResult.rows[0].total_available)

      return {
        success: false,
        status: 409,
        data: {
          status: 'INVENTORY_DEFICIT',
          requested_quantity: params.quantity,
          total_available: totalAvailable,
          recommended_action: totalAvailable > 0
            ? `Only ${totalAvailable} units available globally. Consider split shipment or backorder.`
            : 'Initiate peer-to-peer backordered transit routing via SaaS control tower.',
        },
      }
    }

    // 执行库存扣减（增加预留）
    await client.query(
      `UPDATE ct_inventory_stocks SET reserved = reserved + $1, updated_at = NOW()
       WHERE product_id = $2 AND warehouse = $3`,
      [params.quantity, params.productId, allocatedWarehouse]
    )

    // 记录调度
    const dispatchId = randomUUID()
    await client.query(
      `INSERT INTO ct_dispatch_records (id, tenant_id, product_id, quantity, zone, warehouse, status, destination_country)
       VALUES ($1, $2, $3, $4, $5, $6, 'ROUTING_AUTHORIZED', $7)`,
      [dispatchId, tenantId, params.productId, params.quantity, params.zone, allocatedWarehouse, params.destinationCountry]
    )

    await client.query('COMMIT')

    return {
      success: true,
      status: 200,
      data: {
        status: 'ROUTING_AUTHORIZED',
        dispatch_id: dispatchId,
        allocated_warehouse: allocatedWarehouse,
        warehouse_name: WAREHOUSES.find(w => w.code === allocatedWarehouse)?.name,
        dispatched_quantity: params.quantity,
        remaining_available: availableQty - params.quantity,
        estimated_delivery: getEstimatedDelivery(params.zone),
      },
    }
  } catch (e: any) {
    await client.query('ROLLBACK')
    return {
      success: false,
      status: 500,
      error: 'Inventory allocation failed: ' + e.message,
    }
  } finally {
    client.release()
  }
}

// 获取调度记录
export async function getDispatchHistory(params: {
  tenantId?: string
  limit?: number
}): Promise<DispatchRecord[]> {
  const tenantId = params.tenantId || '00000000-0000-0000-0000-000000000001'
  const limit = params.limit || 50

  const result = await pool.query(
    `SELECT * FROM ct_dispatch_records WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [tenantId, limit]
  )
  return result.rows
}

// 获取控制塔仪表盘统计
export async function getDashboardStats(): Promise<{
  totalInventory: number
  totalReserved: number
  availableUnits: number
  pendingAudits: number
  approvedAudits: number
  rejectedAudits: number
  totalDispatches: number
  warehouseCount: number
  zoneStats: Record<string, number>
}> {
  const inventoryResult = await pool.query(`
    SELECT
      COALESCE(SUM(quantity), 0) as total,
      COALESCE(SUM(reserved), 0) as reserved,
      COALESCE(SUM(quantity - reserved), 0) as available
    FROM ct_inventory_stocks
  `)

  const auditResult = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
      COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
      COUNT(*) FILTER (WHERE status IN ('REJECTED', 'REJECTED_BY_REGULATORY_SYSTEM')) as rejected
    FROM ct_compliance_audits
  `)

  const dispatchResult = await pool.query('SELECT COUNT(*) as cnt FROM ct_dispatch_records')

  const zoneResult = await pool.query(`
    SELECT zone, COUNT(*) as cnt FROM ct_dispatch_records GROUP BY zone
  `)
  const zoneStats: Record<string, number> = {}
  zoneResult.rows.forEach(r => { zoneStats[r.zone] = parseInt(r.cnt) })

  return {
    totalInventory: parseInt(inventoryResult.rows[0].total),
    totalReserved: parseInt(inventoryResult.rows[0].reserved),
    availableUnits: parseInt(inventoryResult.rows[0].available),
    pendingAudits: parseInt(auditResult.rows[0].pending),
    approvedAudits: parseInt(auditResult.rows[0].approved),
    rejectedAudits: parseInt(auditResult.rows[0].rejected),
    totalDispatches: parseInt(dispatchResult.rows[0].cnt),
    warehouseCount: WAREHOUSES.filter(w => w.active).length,
    zoneStats,
  }
}

// 估算送达时间
function getEstimatedDelivery(zone: string): string {
  const estimates: Record<string, string> = {
    EU_EAST: '2-3 business days',
    EU_WEST: '1-2 business days',
    MIDDLE_EAST: '3-5 business days',
    APAC: '4-6 business days',
    AMERICAS: '5-8 business days',
  }
  return estimates[zone] || '3-7 business days'
}
