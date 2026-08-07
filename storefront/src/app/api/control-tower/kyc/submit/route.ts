import { NextResponse } from 'next/server'
import { pool, writeAuditLog } from '@/lib/control-tower/db'
import { validateTenant } from '@/lib/control-tower/compliance'
import { initControlTowerTables } from '@/lib/control-tower/db'

/**
 * KYC/KYB提交端点 v5.0
 * 支持企业信息 + 受益所有人(UBO)批量提交
 */
export async function POST(request: Request) {
  try {
    await initControlTowerTables()

    const tenantHeader = request.headers.get('X-AEGISKY-TENANT-ID')
    const tenantCheck = validateTenant(tenantHeader)
    if (!tenantCheck.valid) {
      return NextResponse.json({ error: tenantCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const {
      legal_name, trading_name, entity_type = 'CORPORATE',
      registration_number, business_registration_number,
      tax_id, vat_number, country, address, city, postal_code,
      industry, website, date_of_incorporation, tax_residency_country,
      annual_revenue, employee_count,
      beneficial_owners = [],
    } = body

    if (!legal_name || !country || !registration_number) {
      return NextResponse.json({ error: 'Missing required fields: legal_name, country, registration_number' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // 1. 创建/更新实体
      const existingResult = await client.query(
        'SELECT id FROM ct_kyc_entities WHERE registration_number = $1 AND country = $2 AND tenant_id = $3',
        [registration_number, country.toUpperCase(), tenantCheck.tenantId]
      )

      let entityId: string
      if (existingResult.rows.length > 0) {
        entityId = existingResult.rows[0].id
        await client.query(
          `UPDATE ct_kyc_entities SET
            legal_name = $1, trading_name = $2, entity_type = $3,
            tax_id = $4, vat_number = $5, address = $6, city = $7, postal_code = $8,
            industry = $9, website_url = $10, date_of_incorporation = $11,
            tax_residency_country = $12, annual_revenue = $13, employee_count = $14,
            updated_at = NOW()
          WHERE id = $15`,
          [
            legal_name, trading_name, entity_type,
            tax_id, vat_number, address, city, postal_code,
            industry, website, date_of_incorporation,
            tax_residency_country, annual_revenue, employee_count,
            entityId
          ]
        )
      } else {
        const { v4: uuidv4 } = await import('uuid')
        entityId = uuidv4()
        await client.query(
          `INSERT INTO ct_kyc_entities
            (id, tenant_id, legal_name, trading_name, entity_type, registration_number,
             business_registration_number, tax_id, vat_number, country, address, city,
             postal_code, industry, website_url, date_of_incorporation, tax_residency_country,
             annual_revenue, employee_count, kyc_status, risk_rating, ubo_declared)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'SUBMITTED','MEDIUM',$20)`,
          [
            entityId, tenantCheck.tenantId, legal_name, trading_name, entity_type, registration_number,
            business_registration_number, tax_id, vat_number, country.toUpperCase(), address, city,
            postal_code, industry, website, date_of_incorporation, tax_residency_country?.toUpperCase(),
            annual_revenue, employee_count, beneficial_owners.length > 0
          ]
        )
      }

      // 2. 保存受益所有人(UBO) - 只保存>=25%的
      await client.query('DELETE FROM ct_kyc_beneficial_owners WHERE entity_id = $1', [entityId])

      const savedUbos: any[] = []
      for (const ubo of beneficial_owners) {
        if (parseFloat(ubo.ownership_percentage) < 25) continue

        const { v4: uuidv4 } = await import('uuid')
        const uboId = uuidv4()
        const uboResult = await client.query(
          `INSERT INTO ct_kyc_beneficial_owners
            (id, tenant_id, entity_id, first_name, last_name, date_of_birth, nationality,
             country_of_residence, passport_number, passport_expiry, national_id,
             ownership_percentage, ownership_type, is_pep, address_line1, city,
             postal_code, country, verification_status)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'PENDING')
          RETURNING *`,
          [
            uboId, tenantCheck.tenantId, entityId,
            ubo.first_name, ubo.last_name, ubo.date_of_birth,
            ubo.nationality?.toUpperCase(), ubo.country_of_residence?.toUpperCase(),
            ubo.passport_number, ubo.passport_expiry, ubo.national_id,
            parseFloat(ubo.ownership_percentage),
            ubo.ownership_type || 'DIRECT',
            ubo.is_pep || false,
            ubo.address_line1, ubo.city, ubo.postal_code, ubo.country?.toUpperCase()
          ]
        )
        savedUbos.push(uboResult.rows[0])
      }

      // 3. 自动风险标记
      const highRiskCountries = ['IR','KP','SY','CU','VE','BY','RU','MM','SD','LY']
      const hasPep = savedUbos.some(u => u.is_pep)
      const hasHighRisk = savedUbos.some(u =>
        highRiskCountries.includes(u.nationality) || highRiskCountries.includes(u.country_of_residence)
      )

      if (hasPep || hasHighRisk) {
        await client.query(
          `UPDATE ct_kyc_entities SET risk_rating = 'HIGH', enhanced_due_diligence = true,
           edd_notes = 'Auto-flagged: PEP or high-risk country UBO detected'
           WHERE id = $1`,
          [entityId]
        )
      }

      await client.query('COMMIT')

      // 审计
      await writeAuditLog({
        tenantId: tenantCheck.tenantId,
        entityType: 'KYC_ENTITY',
        entityId,
        action: 'KYC_SUBMITTED_V5',
        actorId: 'api-user',
        actorType: 'USER',
        newValues: {
          legalName: legal_name,
          country,
          uboCount: savedUbos.length,
          totalOwnership: savedUbos.reduce((s, u) => s + parseFloat(u.ownership_percentage), 0),
          requiresEdd: hasPep || hasHighRisk
        }
      })

      return NextResponse.json({
        success: true,
        entity_id: entityId,
        beneficial_owners_saved: savedUbos.length,
        requires_edd: hasPep || hasHighRisk,
        status: 'SUBMITTED',
        next_steps: [
          'Upload certificate of incorporation',
          'Upload passport copies for all UBOs',
          'Upload proof of address (utility bill/bank statement)',
          'Compliance team will review within 24 hours'
        ]
      }, { status: 201 })

    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }

  } catch (error: any) {
    console.error('[KYC v5] Submit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
