import { NextRequest, NextResponse } from 'next/server';
import { pool as db } from '@/lib/control-tower/db';

// 12个无人机系统解决方案分类（参考unmannedsystemstechnology.com）
export const solutionCategories = [
  { id: 'counter-uas', name: 'Counter-UAS', icon: 'target', description: '反无人机系统与探测' },
  { id: 'command-control', name: 'Command, Control & Communications', icon: 'radio', description: '指挥控制与通信数据链' },
  { id: 'electronics', name: 'Electronics & Subsystems', icon: 'cpu', description: '电子子系统与组件' },
  { id: 'structural', name: 'Structural & Mechanical Systems', icon: 'grid', description: '结构与机械系统' },
  { id: 'positioning', name: 'Positioning, Navigation & Guidance', icon: 'navigation', description: '定位导航与制导' },
  { id: 'sensors', name: 'Mission Sensors & Payloads', icon: 'camera', description: '任务传感器与载荷' },
  { id: 'propulsion', name: 'Propulsion & Power', icon: 'zap', description: '推进与动力系统' },
  { id: 'materials', name: 'Materials & Manufacturing', icon: 'settings', description: '材料与制造' },
  { id: 'safety', name: 'Safety Systems', icon: 'shield', description: '安全系统' },
  { id: 'services', name: 'Professional Services', icon: 'briefcase', description: '专业服务' },
  { id: 'software', name: 'Software & Autonomy', icon: 'monitor', description: '软件与自主系统' },
  { id: 'vehicles', name: 'Unmanned Vehicles & Platforms', icon: 'drone', description: '无人飞行器平台' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR tagline ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND $${paramIndex} = ANY(solution_categories)`;
      params.push(category);
      paramIndex++;
    }

    // 总数
    const countResult = await db.query(`SELECT COUNT(*) FROM aegisky_brands ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    // 品牌列表
    const result = await db.query(`
      SELECT id, name, slug, logo_url, description, tagline, country, product_count, solution_categories
      FROM aegisky_brands
      ${whereClause}
      ORDER BY product_count DESC, name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, pageSize, offset]);

    // 统计每个分类的品牌数
    const categoryStats = await db.query(`
      SELECT unnest(solution_categories) as cat_id, COUNT(*) as count
      FROM aegisky_brands
      WHERE solution_categories IS NOT NULL AND array_length(solution_categories, 1) > 0
      GROUP BY cat_id
    `);

    const categoryCounts: Record<string, number> = {};
    categoryStats.rows.forEach((r: any) => {
      categoryCounts[r.cat_id] = parseInt(r.count);
    });

    return NextResponse.json({
      suppliers: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      categories: solutionCategories.map(c => ({ ...c, count: categoryCounts[c.id] || 0 })),
    });
  } catch (error: any) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({ suppliers: [], total: 0, categories: solutionCategories, error: error.message });
  }
}
