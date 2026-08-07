import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/control-tower/db';

// POST /api/control-tower/rules/evaluate
// 评估交易是否符合所有合规规则
export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d';
  const transaction = await request.json();

  // 获取所有激活的规则，按优先级排序
  const rulesResult = await query(
    'SELECT * FROM ct_compliance_rules WHERE tenant_id = $1 AND is_active = true ORDER BY priority ASC',
    [tenantId]
  );

  const results = [];
  let shouldBlock = false;
  let requiresReview = false;
  let requiresLicense = false;
  let requiresEUS = false;
  const alerts = [];

  for (const rule of rulesResult.rows) {
    const conditions = rule.conditions;
    let matched = false;
    let matchDetails = '';

    // 根据规则类型执行评估
    switch (conditions.type) {
      case 'country_check':
        const destCountry = transaction.destination_country?.toUpperCase();
        if (destCountry && conditions.countries?.includes(destCountry)) {
          matched = true;
          matchDetails = `Country ${destCountry} in restricted list`;
        }
        break;

      case 'entity_screening':
        const buyerName = (transaction.buyer_company_name || '').toLowerCase();
        const sampleDeniedParties = ['dji', 'russian ministry of defense', 'wagner', 'irgc'];
        for (const party of sampleDeniedParties) {
          if (buyerName.includes(party)) {
            matched = true;
            matchDetails = `Entity matches denied party: ${party}`;
            break;
          }
        }
        break;

      case 'license_required':
        const eccn = transaction.eccn_code?.toUpperCase();
        const dest = transaction.destination_country?.toUpperCase();
        if (eccn && eccn !== 'EAR99' && !conditions.exempt_countries?.includes(dest)) {
          matched = true;
          matchDetails = `ECCN ${eccn} requires license for ${dest}`;
        }
        break;

      case 'keyword_check':
        const statement = (transaction.end_use_statement || '').toLowerCase();
        const foundKeyword = conditions.keywords?.find((kw: string) => statement.includes(kw.toLowerCase()));
        if (foundKeyword) {
          matched = true;
          matchDetails = `Keyword found: ${foundKeyword}`;
        }
        break;

      case 'quantity_threshold':
        if (transaction.quantity > conditions.threshold) {
          matched = true;
          matchDetails = `Quantity ${transaction.quantity} exceeds threshold ${conditions.threshold}`;
        }
        break;

      case 'required_document':
        if (conditions.applies_to === 'controlled_items' && transaction.eccn_code && transaction.eccn_code !== 'EAR99') {
          if (!transaction.has_eus) {
            matched = true;
            matchDetails = 'EUS document required for controlled items';
          }
        }
        break;
    }

    // 记录规则执行
    await query(
      `INSERT INTO ct_rule_execution_log
        (tenant_id, transaction_id, rule_id, rule_code, matched, severity, action_taken, context_snapshot)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        tenantId,
        transaction.id || null,
        rule.id,
        rule.rule_code,
        matched,
        matched ? rule.severity : null,
        matched ? rule.action : null,
        JSON.stringify(transaction)
      ]
    );

    results.push({
      rule_code: rule.rule_code,
      rule_name: rule.rule_name,
      category: rule.rule_category,
      severity: rule.severity,
      matched,
      match_details: matchDetails,
      action: matched ? rule.action : null,
      message: matched ? rule.action_message : null
    });

    if (matched) {
      switch (rule.action) {
        case 'BLOCK_TRANSACTION':
          shouldBlock = true;
          alerts.push({ level: 'BLOCK', message: rule.action_message, details: matchDetails });
          break;
        case 'REQUIRE_REVIEW':
          requiresReview = true;
          alerts.push({ level: 'REVIEW', message: rule.action_message, details: matchDetails });
          break;
        case 'REQUIRE_LICENSE':
          requiresLicense = true;
          alerts.push({ level: 'LICENSE', message: rule.action_message, details: matchDetails });
          break;
        case 'REQUIRE_EUS':
          requiresEUS = true;
          alerts.push({ level: 'EUS', message: rule.action_message, details: matchDetails });
          break;
        case 'LOG_ALERT':
          alerts.push({ level: 'WARNING', message: rule.action_message, details: matchDetails });
          break;
      }
    }
  }

  // 计算总体合规状态
  let overallStatus = 'APPROVED';
  if (shouldBlock) overallStatus = 'BLOCKED';
  else if (requiresReview) overallStatus = 'PENDING_REVIEW';
  else if (requiresLicense) overallStatus = 'LICENSE_REQUIRED';
  else if (requiresEUS) overallStatus = 'EUS_REQUIRED';

  return NextResponse.json({
    transaction_id: transaction.id,
    overall_status: overallStatus,
    should_block: shouldBlock,
    requires_review: requiresReview,
    requires_license: requiresLicense,
    requires_eus: requiresEUS,
    rules_evaluated: results.length,
    rules_matched: results.filter(r => r.matched).length,
    alerts,
    rule_results: results,
    risk_score: Math.min(100, alerts.reduce((sum, a) => {
      const weights: Record<string, number> = { BLOCK: 40, REVIEW: 20, LICENSE: 15, EUS: 10, WARNING: 5 };
      return sum + (weights[a.level] || 0);
    }, 0))
  });
}
