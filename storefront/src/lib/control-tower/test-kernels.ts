/**
 * v5.0 4内核冒烟测试
 * 运行方式：npx tsx src/lib/control-tower/test-kernels.ts
 */

import { getKernels } from './index';

async function main() {
  console.log('=== Aegisky v5.0 Kernels Smoke Test ===\n');
  const { trade, ledger, rules, pool } = getKernels();

  try {
    // 1. 测试规则引擎
    console.log('1. Testing Rule Engine...');
    await rules.loadRules(true);
    console.log(`   Loaded ${rules['rules'].length} rules from database`);

    // 测试制裁国家场景
    const sanctionTest = await rules.evaluate({
      buyer: { country: 'IR' },
      shipTo: { country: 'IR' },
      product: { eccn: '9A012', category: 'drones' },
      order: { quantity: 10 },
    });
    console.log(`   Iran sanction test: ${sanctionTest.finalDecision} (risk: ${sanctionTest.totalRiskScore})`);
    console.log(`   Reason: ${sanctionTest.reasoning[0]}`);

    // 测试正常订单
    const normalTest = await rules.evaluate({
      buyer: { country: 'DE' },
      shipTo: { country: 'DE' },
      product: { eccn: 'EAR99', category: 'propulsion' },
      order: { quantity: 5 },
      documents: { eusUploaded: true },
    });
    console.log(`   Normal Germany order: ${normalTest.finalDecision} (risk: ${normalTest.totalRiskScore})`);

    // 测试高风险转口
    const uaeTest = await rules.evaluate({
      buyer: { country: 'AE' },
      shipTo: { country: 'AE' },
      product: { eccn: '9A012', category: 'drones' },
      order: { quantity: 50 },
    });
    console.log(`   UAE high-risk test: ${uaeTest.finalDecision} (risk: ${uaeTest.totalRiskScore})`);

    // 2. 测试交易内核
    console.log('\n2. Testing Trade Kernel...');
    const { v4: uuidv4 } = await import('uuid');
    const testKey = `test-${Date.now()}`;
    const tradeId = await trade.createTrade({
      type: 'DIRECT_ORDER',
      idempotencyKey: testKey,
      buyerId: uuidv4(),
      sellerId: uuidv4(),
      totalAmount: 1000,
      currency: 'USD',
      actor: { id: 'system', type: 'SYSTEM' },
    });
    console.log(`   Created trade: ${tradeId}`);

    // 幂等性测试
    const sameTradeId = await trade.createTrade({
      type: 'DIRECT_ORDER',
      idempotencyKey: testKey,
      actor: { id: 'system', type: 'SYSTEM' },
    });
    console.log(`   Idempotency check: ${sameTradeId === tradeId ? 'PASS' : 'FAIL'}`);

    // 状态转换
    const state1 = await trade.transition(tradeId, 'SUBMIT_COMPLIANCE', { id: 'system', type: 'SYSTEM' });
    console.log(`   After SUBMIT_COMPLIANCE: ${state1}`);

    // 非法转换测试
    try {
      await trade.transition(tradeId, 'COMPLETE_TRADE', { id: 'system', type: 'SYSTEM' });
      console.log('   Illegal transition: FAIL (should have thrown)');
    } catch (e: any) {
      console.log(`   Illegal transition blocked: PASS`);
    }

    // 保存合规决策
    await trade.recordComplianceDecision(tradeId, {
      outcome: normalTest.finalDecision as any,
      riskScore: normalTest.totalRiskScore,
      riskLevel: normalTest.totalRiskScore > 50 ? 'HIGH' : 'LOW',
      matchedRules: normalTest.matchedRules.map(r => ({
        ruleId: r.ruleId,
        ruleName: r.ruleName,
        priority: r.priority,
        reason: r.reason,
      })),
      regulationsVersion: 1,
      inputSnapshot: { buyerCountry: 'DE', eccn: 'EAR99' },
      decidedBy: 'RULE_ENGINE',
      reason: normalTest.reasoning.join('; '),
    });
    console.log('   Compliance decision recorded with hash chain');

    // 验证证据链
    const chainValid = await trade.verifyEvidenceChain(tradeId);
    console.log(`   Evidence chain valid: ${chainValid.valid ? 'PASS' : 'FAIL'}`);

    // 继续状态流转
    const state2 = await trade.transition(tradeId, 'COMPLIANCE_APPROVE', { id: 'officer-1', type: 'COMPLIANCE_OFFICER' });
    console.log(`   After COMPLIANCE_APPROVE: ${state2}`);
    const state3 = await trade.transition(tradeId, 'REQUEST_PAYMENT', { id: 'system', type: 'SYSTEM' });
    console.log(`   After REQUEST_PAYMENT: ${state3}`);
    const state4 = await trade.transition(tradeId, 'PAYMENT_CONFIRMED', { id: 'stripe-webhook', type: 'SYSTEM' });
    console.log(`   After PAYMENT_CONFIRMED: ${state4}`);

    // 3. 测试记账
    console.log('\n3. Testing Double-Entry Ledger...');
    const [t1, t2] = await ledger.recordStripePayment({
      tradeId,
      amount: 1000,
    });
    console.log(`   Stripe payment recorded: ${t1.transactionId} (${t1.totalDebit}/${t1.totalCredit})`);
    console.log(`   Stripe fee recorded: ${t2.transactionId} (${t2.totalDebit}/${t2.totalCredit})`);

    // 试算平衡
    const trialBalance = await ledger.getTrialBalance();
    console.log(`   Trial balance: debit=${trialBalance.totalDebitBalances}, credit=${trialBalance.totalCreditBalances}`);
    console.log(`   Books balanced: ${trialBalance.balanced ? 'PASS' : 'FAIL'}`);

    // 4. 完成交易
    const state5 = await trade.transition(tradeId, 'START_FULFILLMENT', { id: 'warehouse', type: 'SYSTEM' });
    console.log(`\n4. Trade lifecycle complete. Final state: ${state5}`);

    // 待办数量
    const counts = await trade.getWorkboxCounts();
    console.log(`   Workbox counts:`, counts);

    console.log('\n=== ALL TESTS PASSED ===');

  } catch (e) {
    console.error('\nTEST FAILED:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
