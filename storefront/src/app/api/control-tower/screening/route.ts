import { NextRequest, NextResponse } from 'next/server'
import { pool, DENIED_PARTIES_SAMPLE } from '@/lib/control-tower/db'

function generateScreeningId() {
  const date = new Date()
  const yymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `SCR-${yymm}-${rand}`
}

// 模糊匹配算法
function fuzzyMatch(name1: string, name2: string): number {
  const a = name1.toLowerCase().replace(/[^a-z0-9]/g, '')
  const b = name2.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!a || !b) return 0
  if (a === b) return 100
  if (a.includes(b) || b.includes(a)) return 85

  // 简单的Levenshtein距离
  const m = a.length, n = b.length
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  const maxLen = Math.max(m, n)
  return Math.round((1 - dp[m][n] / maxLen) * 100)
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const result = await pool.query(
      'SELECT * FROM ct_screening_results WHERE tenant_id = $1 ORDER BY screened_at DESC LIMIT 100',
      [tenantId]
    )
    return NextResponse.json({ screenings: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-aegisky-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d'
    const body = await request.json()

    const entityName = body.entity_name || ''
    const entityCountry = body.entity_country || ''

    // 对所有被拒绝方名单进行模糊匹配
    let bestMatch = null
    let bestScore = 0

    for (const denied of DENIED_PARTIES_SAMPLE) {
      const score = fuzzyMatch(entityName, denied.name)
      if (score > bestScore) {
        bestScore = score
        bestMatch = denied
      }
    }

    // 同时检查数据库中的KYC实体
    const kycMatches = await pool.query(
      `SELECT legal_name, country, risk_rating FROM ct_kyc_entities
       WHERE similarity(LOWER(legal_name), LOWER($1)) > 0.3`,
      [entityName]
    )

    const matchFound = bestScore >= 75
    const screeningId = generateScreeningId()

    const result = await pool.query(
      `INSERT INTO ct_screening_results
       (tenant_id, screening_id, entity_type, entity_name, entity_country, transaction_id,
        lists_checked, match_found, match_score, matched_name, matched_list, matched_entry, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        tenantId, screeningId, body.entity_type || 'COMPANY',
        entityName, entityCountry, body.transaction_id,
        ['SDN', 'ENTITY_LIST', 'DENIED_PERSONS', 'UN_1267', 'EU_SANCTIONS'],
        matchFound, bestScore,
        matchFound ? bestMatch.name : null,
        matchFound ? bestMatch.list : null,
        matchFound ? JSON.stringify(bestMatch) : null,
        matchFound ? 'REVIEW_REQUIRED' : 'CLEARED',
      ]
    )

    return NextResponse.json({
      screening: result.rows[0],
      match_found: matchFound,
      match_score: bestScore,
      matched_party: matchFound ? bestMatch : null,
      kyc_suggestions: kycMatches.rows,
      recommendation: matchFound ?
        (bestScore >= 90 ? 'BLOCK - Exact match on sanctions list' : 'REVIEW - Potential match, manual verification required') :
        'CLEARED - No matches found',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
