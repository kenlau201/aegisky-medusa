import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/control-tower/db';

// GET /api/control-tower/rules
// 获取所有合规规则
export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d';
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const activeOnly = searchParams.get('active') === 'true';

  let sql = 'SELECT * FROM ct_compliance_rules WHERE tenant_id = $1';
  const params: any[] = [tenantId];

  if (category) {
    params.push(category);
    sql += ` AND rule_category = $${params.length}`;
  }
  if (activeOnly) {
    sql += ' AND is_active = true';
  }

  sql += ' ORDER BY priority ASC';

  const result = await query(sql, params);

  // 获取规则执行统计
  const statsResult = await query(
    `SELECT rule_code, COUNT(*) as executions,
            SUM(CASE WHEN matched THEN 1 ELSE 0 END) as matches
     FROM ct_rule_execution_log
     WHERE tenant_id = $1 AND executed_at > NOW() - INTERVAL '30 days'
     GROUP BY rule_code`,
    [tenantId]
  );

  return NextResponse.json({
    rules: result.rows,
    stats: statsResult.rows,
    categories: ['SANCTIONS', 'EMBARGO', 'LICENSE', 'RED_FLAG', 'END_USE'],
    actions: ['BLOCK_TRANSACTION', 'REQUIRE_LICENSE', 'REQUIRE_REVIEW', 'REQUIRE_EUS', 'LOG_ALERT'],
    severities: ['BLOCK', 'REJECT', 'REVIEW', 'WARNING', 'INFO']
  });
}

// POST /api/control-tower/rules
// 创建新规则
export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d';
  const body = await request.json();

  const result = await query(
    `INSERT INTO ct_compliance_rules
      (tenant_id, rule_code, rule_name, rule_description, rule_category, severity,
       conditions, action, action_message, priority, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      tenantId,
      body.rule_code,
      body.rule_name,
      body.rule_description,
      body.rule_category,
      body.severity || 'WARNING',
      JSON.stringify(body.conditions),
      body.action,
      body.action_message,
      body.priority || 100,
      body.is_active !== false
    ]
  );

  return NextResponse.json({ rule: result.rows[0] });
}

// PUT /api/control-tower/rules/:id
// 更新规则
export async function PUT(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d';
  const body = await request.json();

  const result = await query(
    `UPDATE ct_compliance_rules SET
      rule_name = $1,
      rule_description = $2,
      rule_category = $3,
      severity = $4,
      conditions = $5,
      action = $6,
      action_message = $7,
      priority = $8,
      is_active = $9,
      version = version + 1,
      updated_at = NOW()
     WHERE id = $10 AND tenant_id = $11
     RETURNING *`,
    [
      body.rule_name,
      body.rule_description,
      body.rule_category,
      body.severity,
      JSON.stringify(body.conditions),
      body.action,
      body.action_message,
      body.priority,
      body.is_active,
      body.id,
      tenantId
    ]
  );

  return NextResponse.json({ rule: result.rows[0] });
}
