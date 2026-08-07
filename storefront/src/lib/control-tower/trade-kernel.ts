/**
 * Aegisky Medusa v5.0 - Trade Kernel
 * 统一交易内核 - 系统唯一真相源
 * 
 * v5.0最终版：9个状态，YAGNI原则，不预留扩展
 * 
 * 状态流转：
 * INIT → COMPLIANCE_PENDING → COMPLIANCE_APPROVED/COMPLIANCE_REJECTED
 * COMPLIANCE_APPROVED → PAYMENT_PENDING → PAYMENT_CONFIRMED
 * PAYMENT_CONFIRMED → FULFILLMENT → COMPLETED
 * 任意非终态 → CANCELLED
 * PAYMENT_CONFIRMED及之后 → DISPUTED
 */

import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// ============== 类型定义 ==============

export type TradeType = 'RFQ' | 'DIRECT_ORDER';

export type TradeState =
  | 'INIT'
  | 'COMPLIANCE_PENDING'
  | 'COMPLIANCE_APPROVED'
  | 'COMPLIANCE_REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'FULFILLMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type TradeEvent =
  | 'CREATE_TRADE'
  | 'SUBMIT_COMPLIANCE'
  | 'COMPLIANCE_APPROVE'
  | 'COMPLIANCE_REJECT'
  | 'REQUEST_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'START_FULFILLMENT'
  | 'COMPLETE_TRADE'
  | 'OPEN_DISPUTE'
  | 'CANCEL_TRADE';

export type ActorType = 'USER' | 'SYSTEM' | 'AI' | 'COMPLIANCE_OFFICER' | 'BUYER' | 'SELLER';

export interface Actor {
  id: string;
  type: ActorType;
}

export interface ComplianceDecision {
  outcome: 'APPROVE' | 'REJECT' | 'REVIEW' | 'ROUTE';
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  matchedRules: Array<{
    ruleId: string;
    ruleName: string;
    priority: number;
    reason: string;
  }>;
  regulationsVersion: number;
  inputSnapshot: Record<string, any>;
  remediationSteps?: string[];
  alternativePaths?: Array<{
    description: string;
    estimatedCost: number;
    estimatedDays: number;
    riskLevel: string;
  }>;
  decidedBy: string;
  reason: string;
}

export interface RoutingDecision {
  warehouseId: string;
  warehouseName: string;
  route: string[];
  estimatedCost: number;
  estimatedDays: number;
  riskPenalty: number;
  reason: string;
}

export interface PaymentDecision {
  method: 'STRIPE' | 'WIRE_TRANSFER' | 'LETTER_OF_CREDIT' | 'ESCROW';
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  transactionId?: string;
  paidAt?: Date;
  fees?: number;
}

// ============== 状态转换表（白名单，不在里面的一律拒绝） ==============

const ALLOWED_TRANSITIONS: Record<TradeState, TradeState[]> = {
  'INIT': ['COMPLIANCE_PENDING', 'CANCELLED'],
  'COMPLIANCE_PENDING': ['COMPLIANCE_APPROVED', 'COMPLIANCE_REJECTED', 'CANCELLED'],
  'COMPLIANCE_APPROVED': ['PAYMENT_PENDING', 'CANCELLED'],
  'COMPLIANCE_REJECTED': ['CANCELLED'],
  'PAYMENT_PENDING': ['PAYMENT_CONFIRMED', 'CANCELLED'],
  'PAYMENT_CONFIRMED': ['FULFILLMENT', 'DISPUTED'],
  'FULFILLMENT': ['COMPLETED', 'DISPUTED'],
  'COMPLETED': ['DISPUTED'],
  'CANCELLED': [],
  'DISPUTED': ['COMPLETED', 'CANCELLED'],
};

const EVENT_TO_NEXT_STATE: Partial<Record<TradeEvent, TradeState>> = {
  'CREATE_TRADE': 'INIT',
  'SUBMIT_COMPLIANCE': 'COMPLIANCE_PENDING',
  'COMPLIANCE_APPROVE': 'COMPLIANCE_APPROVED',
  'COMPLIANCE_REJECT': 'COMPLIANCE_REJECTED',
  'REQUEST_PAYMENT': 'PAYMENT_PENDING',
  'PAYMENT_CONFIRMED': 'PAYMENT_CONFIRMED',
  'START_FULFILLMENT': 'FULFILLMENT',
  'COMPLETE_TRADE': 'COMPLETED',
  'OPEN_DISPUTE': 'DISPUTED',
  'CANCEL_TRADE': 'CANCELLED',
};

// ============== Trade Kernel 类 ==============

export class TradeKernel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 创建新交易（幂等）
   */
  async createTrade(params: {
    type: TradeType;
    idempotencyKey?: string;
    tenantId?: string;
    buyerId?: string;
    sellerId?: string;
    rfqId?: string;
    medusaOrderId?: string;
    medusaCartId?: string;
    totalAmount?: number;
    currency?: string;
    actor: Actor;
  }): Promise<string> {
    // 幂等性检查
    if (params.idempotencyKey) {
      const existing = await this.pool.query(
        'SELECT trade_id FROM ct_trade_kernel WHERE tenant_id = $1 AND idempotency_key = $2',
        [params.tenantId || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d', params.idempotencyKey]
      );
      if (existing.rows.length > 0) {
        return existing.rows[0].trade_id;
      }
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const tradeId = uuidv4();
      const tenantId = params.tenantId || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d';

      await client.query(
        `INSERT INTO ct_trade_kernel 
         (trade_id, tenant_id, trade_type, current_state, idempotency_key,
          buyer_id, seller_id, rfq_id, medusa_order_id, medusa_cart_id, 
          total_amount, currency, version)
         VALUES ($1, $2, $3, 'INIT', $4, $5, $6, $7, $8, $9, $10, $11, 1)`,
        [
          tradeId,
          tenantId,
          params.type,
          params.idempotencyKey || null,
          params.buyerId || null,
          params.sellerId || null,
          params.rfqId || null,
          params.medusaOrderId || null,
          params.medusaCartId || null,
          params.totalAmount || 0,
          params.currency || 'USD',
        ]
      );

      await this.recordStateHistoryInTx(client, tradeId, null, 'INIT', 'CREATE_TRADE', params.actor);

      await this.publishEventInTx(client, 'TradeCreated', 'Trade', tradeId, {
        type: params.type,
        buyerId: params.buyerId,
        sellerId: params.sellerId,
        totalAmount: params.totalAmount,
        currency: params.currency,
      });

      await client.query('COMMIT');
      return tradeId;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * 触发状态转换（带乐观锁和行级锁）
   */
  async transition(
    tradeId: string,
    event: TradeEvent,
    actor: Actor,
    context?: Record<string, any>
  ): Promise<TradeState> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // SELECT FOR UPDATE: 行级锁，防止并发修改
      const result = await client.query(
        'SELECT current_state, version FROM ct_trade_kernel WHERE trade_id = $1 FOR UPDATE',
        [tradeId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Trade ${tradeId} not found`);
      }

      const currentState = result.rows[0].current_state as TradeState;
      const currentVersion = result.rows[0].version;
      const nextState = EVENT_TO_NEXT_STATE[event];

      if (!nextState) {
        throw new Error(`Unknown event: ${event}`);
      }

      // 白名单检查：不在合法转换列表里的一律拒绝
      const allowedStates = ALLOWED_TRANSITIONS[currentState] || [];
      if (!allowedStates.includes(nextState)) {
        throw new Error(
          `Illegal state transition: ${currentState} → ${nextState} (event: ${event}). ` +
          `Allowed next states from ${currentState}: ${allowedStates.join(', ')}`
        );
      }

      // 乐观锁更新
      const updateResult = await client.query(
        `UPDATE ct_trade_kernel 
         SET current_state = $2, version = $3, updated_at = NOW()
         WHERE trade_id = $1 AND version = $4`,
        [tradeId, nextState, currentVersion + 1, currentVersion]
      );

      if (updateResult.rowCount === 0) {
        throw new Error('Concurrent modification detected, please retry');
      }

      // 记录状态历史
      await this.recordStateHistoryInTx(client, tradeId, currentState, nextState, event, actor, context);

      // 事件日志
      await this.publishEventInTx(client, event, 'Trade', tradeId, {
        fromState: currentState,
        toState: nextState,
        actor,
        context,
      });

      // PostgreSQL实时通知
      await client.query(
        'SELECT pg_notify($1, $2)',
        [`trade:${tradeId}`, JSON.stringify({ event, fromState: currentState, toState: nextState })]
      );

      await client.query('COMMIT');
      return nextState;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * 保存合规决策（同时写入证据存储）
   */
  async recordComplianceDecision(
    tradeId: string,
    decision: ComplianceDecision,
    client?: PoolClient
  ): Promise<void> {
    const shouldRelease = !client;
    const pgClient = client || await this.pool.connect();

    try {
      if (!client) await pgClient.query('BEGIN');

      // 更新交易主表
      await pgClient.query(
        `UPDATE ct_trade_kernel 
         SET compliance_decision = $2, risk_score = $3, risk_level = $4, updated_at = NOW()
         WHERE trade_id = $1`,
        [tradeId, JSON.stringify(decision), decision.riskScore, decision.riskLevel]
      );

      // 写入合规证据表（不可变）
      const previousHash = await this.getLatestDecisionHash(pgClient, tradeId);
      const payloadToHash = JSON.stringify({
        tradeId,
        outcome: decision.outcome,
        riskScore: decision.riskScore,
        inputSnapshot: decision.inputSnapshot,
        regulationsVersion: decision.regulationsVersion,
        previousHash,
        timestamp: new Date().toISOString(),
      });

      // SHA-256哈希
      const hashResult = await pgClient.query(
        "SELECT encode(digest($1::text, 'sha256'), 'hex') as hash",
        [payloadToHash]
      );
      const decisionHash = hashResult.rows[0].hash;

      await pgClient.query(
        `INSERT INTO ct_compliance_decisions
         (trade_id, outcome, risk_score, risk_level, input_snapshot, 
          regulations_version, matched_rules, remediation_steps, alternative_paths,
          decided_by, previous_hash, decision_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          tradeId,
          decision.outcome,
          decision.riskScore,
          decision.riskLevel,
          JSON.stringify(decision.inputSnapshot),
          decision.regulationsVersion,
          JSON.stringify(decision.matchedRules),
          decision.remediationSteps ? JSON.stringify(decision.remediationSteps) : null,
          decision.alternativePaths ? JSON.stringify(decision.alternativePaths) : null,
          decision.decidedBy,
          previousHash,
          decisionHash,
        ]
      );

      if (!client) await pgClient.query('COMMIT');
    } catch (e) {
      if (!client) await pgClient.query('ROLLBACK');
      throw e;
    } finally {
      if (shouldRelease) pgClient.release();
    }
  }

  /**
   * 更新路由决策
   */
  async setRoutingDecision(tradeId: string, decision: RoutingDecision): Promise<void> {
    await this.pool.query(
      'UPDATE ct_trade_kernel SET routing_decision = $2, updated_at = NOW() WHERE trade_id = $1',
      [tradeId, JSON.stringify(decision)]
    );
  }

  /**
   * 更新支付决策
   */
  async setPaymentDecision(tradeId: string, decision: PaymentDecision): Promise<void> {
    await this.pool.query(
      'UPDATE ct_trade_kernel SET payment_decision = $2, updated_at = NOW() WHERE trade_id = $1',
      [tradeId, JSON.stringify(decision)]
    );
  }

  /**
   * 获取交易详情
   */
  async getTrade(tradeId: string) {
    const result = await this.pool.query(
      'SELECT * FROM ct_trade_kernel WHERE trade_id = $1',
      [tradeId]
    );
    return result.rows[0];
  }

  /**
   * 获取交易状态历史
   */
  async getStateHistory(tradeId: string) {
    const result = await this.pool.query(
      'SELECT * FROM ct_trade_state_history WHERE trade_id = $1 ORDER BY created_at ASC',
      [tradeId]
    );
    return result.rows;
  }

  /**
   * 获取合规决策历史（证据链）
   */
  async getComplianceHistory(tradeId: string) {
    const result = await this.pool.query(
      'SELECT * FROM ct_compliance_decisions WHERE trade_id = $1 ORDER BY decided_at ASC',
      [tradeId]
    );
    return result.rows;
  }

  /**
   * 验证证据链完整性
   */
  async verifyEvidenceChain(tradeId: string): Promise<{ valid: boolean; brokenAt?: string }> {
    const decisions = await this.getComplianceHistory(tradeId);
    let previousHash: string | null = null;

    for (const d of decisions) {
      if (d.previous_hash !== previousHash) {
        return { valid: false, brokenAt: d.decision_id };
      }
      previousHash = d.decision_hash;
    }

    return { valid: true };
  }

  /**
   * 按状态列出交易
   */
  async listTradesByState(state: TradeState, tenantId?: string) {
    const result = await this.pool.query(
      `SELECT * FROM ct_trade_kernel 
       WHERE current_state = $1 AND ($2::uuid IS NULL OR tenant_id = $2)
       ORDER BY created_at DESC`,
      [state, tenantId || null]
    );
    return result.rows;
  }

  /**
   * 别名：按状态列出交易（支持limit/offset分页）
   */
  async listTransactionsByState(state: TradeState, limit = 50, offset = 0, tenantId?: string) {
    const result = await this.pool.query(
      `SELECT * FROM ct_trade_kernel 
       WHERE current_state = $1 AND ($4::uuid IS NULL OR tenant_id = $4)
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [state, limit, offset, tenantId || null]
    );
    return result.rows;
  }

  /**
   * 获取待办队列数量
   */
  async getWorkboxCounts(tenantId?: string) {
    const result = await this.pool.query(
      `SELECT current_state, COUNT(*) as count
       FROM ct_trade_kernel
       WHERE ($1::uuid IS NULL OR tenant_id = $1)
       GROUP BY current_state`,
      [tenantId || null]
    );
    const counts: Record<string, number> = {};
    for (const row of result.rows) {
      counts[row.current_state] = parseInt(row.count);
    }
    return counts;
  }

  // ============== 私有方法 ==============

  private async getLatestDecisionHash(client: PoolClient, tradeId: string): Promise<string | null> {
    const result = await client.query(
      'SELECT decision_hash FROM ct_compliance_decisions WHERE trade_id = $1 ORDER BY decided_at DESC LIMIT 1',
      [tradeId]
    );
    return result.rows[0]?.decision_hash || null;
  }

  private async recordStateHistoryInTx(
    client: PoolClient,
    tradeId: string,
    fromState: TradeState | null,
    toState: TradeState,
    event: TradeEvent,
    actor: Actor,
    context?: Record<string, any>
  ) {
    await client.query(
      `INSERT INTO ct_trade_state_history 
       (trade_id, from_state, to_state, event, actor_id, actor_type, context)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tradeId, fromState, toState, event, actor.id, actor.type, context ? JSON.stringify(context) : null]
    );
  }

  private async publishEventInTx(
    client: PoolClient,
    eventType: string,
    aggregateType: string,
    aggregateId: string,
    payload: Record<string, any>
  ) {
    await client.query(
      `INSERT INTO ct_event_log (event_type, aggregate_type, aggregate_id, payload, metadata, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        eventType,
        aggregateType,
        aggregateId,
        JSON.stringify(payload),
        JSON.stringify({ source: 'trade-kernel', timestamp: new Date().toISOString() }),
        '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d',
      ]
    );
  }
}

// 单例实例
let tradeKernelInstance: TradeKernel | null = null;

export function getTradeKernel(pool: Pool): TradeKernel {
  if (!tradeKernelInstance) {
    tradeKernelInstance = new TradeKernel(pool);
  }
  return tradeKernelInstance;
}
