/**
 * Aegisky Medusa v5.0 - Control Tower Kernels
 * 4个P0内核统一导出
 * 
 * 1. TradeKernel - 9状态交易状态机
 * 2. LedgerSystem - 复式记账
 * 3. RuleEngine - JSON DSL规则引擎
 * 4. ComplianceEvidence - 合规证据存储（通过TradeKernel集成）
 */

export { pool, query, initControlTowerTables, writeAuditLog } from './db';
export * from './constants';

export {
  TradeKernel,
  getTradeKernel,
  type TradeState,
  type TradeEvent,
  type TradeType,
  type Actor,
  type ActorType,
  type ComplianceDecision,
  type RoutingDecision,
  type PaymentDecision,
} from './trade-kernel';

export {
  LedgerSystem,
  getLedgerSystem,
  type AccountType,
  type LedgerEntry,
  type TransactionResult,
} from './ledger';

export {
  RuleEngine,
  getRuleEngine,
  DEFAULT_RULES,
  type Operator,
  type RuleDecision,
  type RuleCondition,
  type RuleGroup,
  type RuleAction,
  type ComplianceRule,
  type RuleEvaluationResult,
  type EvaluationContext,
  type EvaluationOutcome,
} from './rule-engine';

// 保留旧版风险引擎兼容
export * from './risk-engine';
export * from './compliance';

// 单例初始化助手
import { Pool } from 'pg';
import { getTradeKernel } from './trade-kernel';
import { getLedgerSystem } from './ledger';
import { getRuleEngine } from './rule-engine';

let poolInstance: Pool | null = null;

export function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      host: 'localhost',
      port: 5434,
      user: 'medusa',
      password: 'medusa_password',
      database: 'medusa-aegisky',
      max: 20,
      idleTimeoutMillis: 30000,
    });
  }
  return poolInstance;
}

export function getKernels() {
  const pool = getPool();
  return {
    pool,
    trade: getTradeKernel(pool),
    ledger: getLedgerSystem(pool),
    rules: getRuleEngine(pool),
  };
}
