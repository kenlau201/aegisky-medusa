import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'

function generateReportNumber() {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RPT-${yymm}-${rand}`
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const result = await pool.query(
      'SELECT * FROM ct_compliance_reports WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    )
    return NextResponse.json({ reports: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()

    const reportNumber = generateReportNumber()
    const periodStart = body.period_start ? new Date(body.period_start) : new Date(new Date().getFullYear(), 0, 1)
    const periodEnd = body.period_end ? new Date(body.period_end) : new Date()

    // 生成报告数据
    let reportData: any = {}

    switch (body.report_type) {
      case 'BIS_711':
      case 'LICENSE_USAGE': {
        const licenses = await pool.query(
          `SELECT license_number, license_type, eccn_codes, quantity_approved, quantity_used,
                  consignee_name, consignee_country, issue_date, expiry_date
           FROM ct_export_licenses
           WHERE tenant_id = $1 AND status = 'ACTIVE'`,
          [tenantId]
        )

        const shipments = await pool.query(
          `SELECT t.transaction_ref, t.consignee_country, t.items_description, t.total_value,
                  t.created_at, l.license_number
           FROM ct_trade_transactions t
           LEFT JOIN ct_license_usage lu ON lu.transaction_id = t.id
           LEFT JOIN ct_export_licenses l ON l.id = lu.license_id
           WHERE t.tenant_id = $1 AND t.status = 'COMPLETED'
             AND t.created_at BETWEEN $2 AND $3`,
          [tenantId, periodStart, periodEnd]
        )

        reportData = {
          reporting_period: { start: periodStart, end: periodEnd },
          licenses: licenses.rows,
          shipments_under_license: shipments.rows,
          total_licenses_active: licenses.rowCount,
          total_shipments: shipments.rowCount,
          total_value: shipments.rows.reduce((sum: number, s: any) => sum + (Number(s.total_value) || 0), 0),
        }
        break
      }

      case 'RED_FLAG': {
        const redFlags = await pool.query(
          `SELECT transaction_ref, consignee_name, consignee_country, risk_score, risk_factors,
                  created_at, status
           FROM ct_trade_transactions
           WHERE tenant_id = $1 AND risk_score >= 45
             AND created_at BETWEEN $2 AND $3
           ORDER BY risk_score DESC`,
          [tenantId, periodStart, periodEnd]
        )

        const alerts = await pool.query(
          `SELECT * FROM ct_compliance_alerts
           WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
           ORDER BY severity DESC`,
          [tenantId, periodStart, periodEnd]
        )

        reportData = {
          reporting_period: { start: periodStart, end: periodEnd },
          high_risk_transactions: redFlags.rows,
          alerts: alerts.rows,
          total_red_flags: redFlags.rowCount,
          total_alerts: alerts.rowCount,
        }
        break
      }

      case 'SANCTIONS_SCREENING': {
        const screenings = await pool.query(
          `SELECT screening_id, entity_name, entity_country, match_found, match_score,
                  matched_name, matched_list, status, screened_at
           FROM ct_screening_results
           WHERE tenant_id = $1 AND screened_at BETWEEN $2 AND $3
           ORDER BY screened_at DESC`,
          [tenantId, periodStart, periodEnd]
        )

        reportData = {
          reporting_period: { start: periodStart, end: periodEnd },
          screenings: screenings.rows,
          total_screened: screenings.rowCount,
          matches_found: screenings.rows.filter((s: any) => s.match_found).length,
          pending_review: screenings.rows.filter((s: any) => s.status === 'REVIEW_REQUIRED').length,
        }
        break
      }

      default:
        reportData = { message: 'Report type not fully implemented' }
    }

    const result = await pool.query(
      `INSERT INTO ct_compliance_reports
       (tenant_id, report_number, report_type, period_start, period_end, report_data, generated_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'GENERATED')
       RETURNING *`,
      [
        tenantId, reportNumber, body.report_type, periodStart, periodEnd,
        JSON.stringify(reportData), body.generated_by || 'Compliance Team',
      ]
    )

    return NextResponse.json({ report: result.rows[0], report_data: reportData }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
