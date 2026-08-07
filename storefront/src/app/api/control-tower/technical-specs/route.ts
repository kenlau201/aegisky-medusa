import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/control-tower/db';

// GET /api/control-tower/technical-specs
// 获取工业级技术参数矩阵
export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d';
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let sql = 'SELECT * FROM ct_product_technical_specs WHERE tenant_id = $1';
  const params: any[] = [tenantId];

  if (category) {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }

  sql += ' ORDER BY category, sku';

  const result = await query(sql, params);

  return NextResponse.json({
    specs: result.rows,
    categories: ['BLDC_MOTOR', 'FLIGHT_CTRL', 'FPV_V_TX', 'ESC', 'PROPELLER', 'GPS_MODULE', 'BATTERY', 'CAMERA', 'GIMBAL', 'RADIO'],
    matrix_fields: {
      mtbf_hours: '平均无故障工作时间(小时)',
      frequency_hopping: '跳频支持',
      anti_emi_grade: '抗EMI等级',
      max_thrust_g: '最大推力(克)',
      ingress_protection: 'IP防护等级',
      working_temp_range: '工作温度范围(°C)',
      power_consumption_w: '功耗(瓦)',
      weight_g: '重量(克)',
      operating_voltage_v: '工作电压',
      data_interface: '数据接口',
      certification_standards: '认证标准',
      cad_assets: 'CAD/3D模型资产'
    }
  });
}

// POST /api/control-tower/technical-specs
// 创建或更新技术参数
export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d';
  const body = await request.json();

  const result = await query(
    `INSERT INTO ct_product_technical_specs
      (tenant_id, product_id, sku, category, mtbf_hours, frequency_hopping, anti_emi_grade,
       max_thrust_g, ingress_protection, working_temp_min_c, working_temp_max_c,
       power_consumption_w, weight_g, dimensions_mm, operating_voltage_v, data_interface,
       certification_standards, cad_step_url, cad_obj_url, preview_3d)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
     ON CONFLICT (tenant_id, sku) DO UPDATE SET
       category = EXCLUDED.category,
       mtbf_hours = EXCLUDED.mtbf_hours,
       frequency_hopping = EXCLUDED.frequency_hopping,
       anti_emi_grade = EXCLUDED.anti_emi_grade,
       max_thrust_g = EXCLUDED.max_thrust_g,
       ingress_protection = EXCLUDED.ingress_protection,
       working_temp_min_c = EXCLUDED.working_temp_min_c,
       working_temp_max_c = EXCLUDED.working_temp_max_c,
       power_consumption_w = EXCLUDED.power_consumption_w,
       weight_g = EXCLUDED.weight_g,
       dimensions_mm = EXCLUDED.dimensions_mm,
       operating_voltage_v = EXCLUDED.operating_voltage_v,
       data_interface = EXCLUDED.data_interface,
       certification_standards = EXCLUDED.certification_standards,
       cad_step_url = EXCLUDED.cad_step_url,
       cad_obj_url = EXCLUDED.cad_obj_url,
       preview_3d = EXCLUDED.preview_3d,
       updated_at = NOW()
     RETURNING *`,
    [
      tenantId,
      body.product_id,
      body.sku,
      body.category,
      body.mtbf_hours,
      body.frequency_hopping || false,
      body.anti_emi_grade,
      body.max_thrust_g,
      body.ingress_protection,
      body.working_temp_min_c,
      body.working_temp_max_c,
      body.power_consumption_w,
      body.weight_g,
      body.dimensions_mm,
      body.operating_voltage_v,
      body.data_interface,
      JSON.stringify(body.certification_standards || []),
      body.cad_step_url,
      body.cad_obj_url,
      body.preview_3d || false
    ]
  );

  return NextResponse.json({ spec: result.rows[0] });
}
