import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'
import { v4 as uuidv4 } from 'uuid'

const TENANT_ID = '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'

export async function POST(request: NextRequest) {
  try {
    await pool.query(`SELECT app.set_tenant_id($1)`, [TENANT_ID])

    const body = await request.json()
    const {
      companyName,
      registrationNumber,
      taxId,
      vatNumber,
      country,
      foundedYear,
      website,
      contactName,
      contactEmail,
      contactPhone,
      annualRevenue,
      employeeCount,
      businessType,
      productCategories,
      description,
      beneficialOwners,
    } = body

    // 验证必填字段
    if (!companyName || !country || !contactEmail || !contactName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const entityId = uuidv4()

    // 开始事务
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // 创建KYC实体
      await client.query(
        `INSERT INTO ct_kyc_entities (
          entity_id, tenant_id, entity_type, entity_name,
          registration_number, tax_id, vat_number,
          country_of_incorporation, date_of_incorporation,
          website, contact_name, contact_email, contact_phone,
          annual_revenue_usd, employee_count, industry,
          risk_level, status, created_at, updated_at
        ) VALUES ($1, $2, 'BUSINESS', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'LOW', 'PENDING_REVIEW', NOW(), NOW())`,
        [
          entityId,
          TENANT_ID,
          companyName,
          registrationNumber || null,
          taxId || null,
          vatNumber || null,
          country,
          foundedYear ? `${foundedYear}-01-01` : null,
          website || null,
          contactName,
          contactEmail,
          contactPhone || null,
          annualRevenue ? Number(annualRevenue) : null,
          employeeCount ? Number(employeeCount) : null,
          businessType || 'distributor',
        ]
      )

      // 添加受益所有人（只保存持股>=25%的）
      if (Array.isArray(beneficialOwners)) {
        for (const ubo of beneficialOwners) {
          if (Number(ubo.ownershipPercentage) >= 25) {
            const isHighRiskCountry = ['IR', 'KP', 'SY', 'CU', 'VE', 'RU', 'BY'].includes(ubo.nationality)
            const isPep = ubo.isPep === true

            await client.query(
              `INSERT INTO ct_kyc_beneficial_owners (
                ubo_id, entity_id, tenant_id,
                full_name, date_of_birth, nationality,
                country_of_residence, passport_number,
                ownership_percentage, ownership_type,
                is_pep, is_sanctioned, risk_flag,
                created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, $12, NOW())`,
              [
                uuidv4(),
                entityId,
                TENANT_ID,
                ubo.fullName,
                ubo.dateOfBirth || null,
                ubo.nationality,
                ubo.countryOfResidence || ubo.nationality,
                ubo.passportNumber || null,
                Number(ubo.ownershipPercentage),
                ubo.ownershipType || 'direct',
                isPep,
                isHighRiskCountry || isPep ? 'HIGH' : 'LOW',
              ]
            )
          }
        }
      }

      // 记录审计日志
      await client.query(
        `INSERT INTO ct_audit_trail (tenant_id, actor, action, entity_type, entity_id, new_values, created_at)
         VALUES ($1, 'PUBLIC_APPLICATION', 'SUPPLIER_APPLY', 'KYC_ENTITY', $2, $3::jsonb, NOW())`,
        [TENANT_ID, entityId, JSON.stringify({ companyName, country, contactEmail })]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        entityId,
        message: 'Application submitted successfully. Our compliance team will review your application within 2-3 business days.',
      })
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Supplier application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
