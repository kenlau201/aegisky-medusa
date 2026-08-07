/**
 * Aegisky Medusa v5.0 - Double Entry Ledger
 * 复式记账系统 - 财务真相源
 * 
 * 会计恒等式：资产 = 负债 + 所有者权益
 * 每笔交易至少2条分录，借贷必相等（数据库触发器强制保证）
 * 
 * 注意：这个文件里不要创新，不要简化。这是500年会计实践的结晶。
 */

import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface LedgerEntry {
  accountCode: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface TransactionResult {
  transactionId: string;
  entries: Array<{
    accountCode: string;
    debit: number;
    credit: number;
    description?: string;
  }>;
  totalDebit: number;
  totalCredit: number;
}

export class LedgerSystem {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 记录一笔复式记账交易
   * @throws 如果借贷不平（数据库触发器也会再检查一次）
   */
  async recordTransaction(params: {
    entries: LedgerEntry[];
    tradeId?: string;
    currency?: string;
    fxRate?: number;
    description?: string;
    createdBy?: string;
    tenantId?: string;
  }): Promise<TransactionResult> {
    const transactionId = uuidv4();
    const currency = params.currency || 'USD';
    const fxRate = params.fxRate || 1;
    const tenantId = params.tenantId || '4a8b9c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d';

    // 应用层先验证一次（快速失败）
    const totalDebit = params.entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = params.entries.reduce((sum, e) => sum + e.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(
        `Transaction not balanced: total debit ${totalDebit} != total credit ${totalCredit}`
      );
    }

    if (totalDebit === 0 && totalCredit === 0) {
      throw new Error('Transaction has zero amount');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 设置RLS租户上下文
      await client.query('SELECT app.set_tenant_id($1)', [tenantId]);

      // 先插入交易头
      await client.query(
        `INSERT INTO ct_ledger_transactions 
         (transaction_id, tenant_id, trade_id, description, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [transactionId, tenantId, params.tradeId || null, params.description || null, params.createdBy || 'SYSTEM']
      );

      // 插入分录
      for (const entry of params.entries) {
        const accountResult = await client.query(
          'SELECT account_id FROM ct_ledger_accounts WHERE account_code = $1 AND currency = $2 AND tenant_id = $3',
          [entry.accountCode, currency, tenantId]
        );

        if (accountResult.rows.length === 0) {
          throw new Error(`Account not found: ${entry.accountCode} (${currency})`);
        }

        const accountId = accountResult.rows[0].account_id;

        await client.query(
          `INSERT INTO ct_ledger_entries 
           (transaction_id, account_id, debit, credit, currency, fx_rate, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            transactionId,
            accountId,
            entry.debit,
            entry.credit,
            currency,
            fxRate,
            entry.description || params.description,
          ]
        );
      }

      // 事件日志
      await client.query(
        `INSERT INTO ct_event_log (event_type, aggregate_type, aggregate_id, payload, tenant_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'LedgerTransactionRecorded',
          'Ledger',
          transactionId,
          JSON.stringify({
            tradeId: params.tradeId,
            totalDebit,
            totalCredit,
            currency,
            entries: params.entries.map(e => ({
              account: e.accountCode,
              debit: e.debit,
              credit: e.credit,
            })),
          }),
          tenantId,
        ]
      );

      await client.query('COMMIT');

      return {
        transactionId,
        entries: params.entries.map(e => ({
          accountCode: e.accountCode,
          debit: e.debit,
          credit: e.credit,
          description: e.description,
        })),
        totalDebit,
        totalCredit,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * 记录Stripe支付（标准模板）
   * 
   * 分录1：收到客户付款
   *   借：Stripe准备金 100.00
   *     贷：应付供应商 97.00
   *     贷：佣金收入 3.00
   * 
   * 分录2：扣除Stripe手续费
   *   借：支付手续费 2.90
   *     贷：Stripe准备金 2.90
   */
  async recordStripePayment(params: {
    tradeId: string;
    amount: number;
    commissionRate?: number;  // 默认3%
    stripeFeeRate?: number;   // 默认2.9% + $0.30
    stripeFeeFixed?: number;
  }): Promise<TransactionResult[]> {
    const commissionRate = params.commissionRate ?? 0.03;
    const stripeFeeRate = params.stripeFeeRate ?? 0.029;
    const stripeFeeFixed = params.stripeFeeFixed ?? 0.30;

    const commission = this.round2(params.amount * commissionRate);
    const payableToSupplier = this.round2(params.amount - commission);
    const stripeFee = this.round2(params.amount * stripeFeeRate + stripeFeeFixed);

    const t1 = await this.recordTransaction({
      tradeId: params.tradeId,
      description: `Stripe payment received for trade ${params.tradeId}`,
      entries: [
        { accountCode: 'ASSET_STRIPE_RESERVE', debit: params.amount, credit: 0, description: 'Customer payment received' },
        { accountCode: 'LIABILITY_ACCOUNTS_PAYABLE', debit: 0, credit: payableToSupplier, description: 'Payable to supplier' },
        { accountCode: 'REVENUE_COMMISSION', debit: 0, credit: commission, description: 'Platform commission (3%)' },
      ],
    });

    const t2 = await this.recordTransaction({
      tradeId: params.tradeId,
      description: `Stripe processing fee for trade ${params.tradeId}`,
      entries: [
        { accountCode: 'EXPENSE_STRIPE_FEES', debit: stripeFee, credit: 0, description: 'Stripe fee (2.9% + $0.30)' },
        { accountCode: 'ASSET_STRIPE_RESERVE', debit: 0, credit: stripeFee, description: 'Stripe fee deducted' },
      ],
    });

    return [t1, t2];
  }

  /**
   * 记录电汇/银行转账
   * 
   * 借：现金USD 1000.00
   *   贷：应付供应商 970.00
   *   贷：佣金收入 30.00
   * 借：银行手续费 25.00
   *   贷：现金USD 25.00
   */
  async recordWirePayment(params: {
    tradeId: string;
    amount: number;
    commissionRate?: number;
    bankFee?: number;
  }): Promise<TransactionResult[]> {
    const commissionRate = params.commissionRate ?? 0.03;
    const bankFee = params.bankFee ?? 25;

    const commission = this.round2(params.amount * commissionRate);
    const payableToSupplier = this.round2(params.amount - commission);

    const t1 = await this.recordTransaction({
      tradeId: params.tradeId,
      description: `Wire transfer received for trade ${params.tradeId}`,
      entries: [
        { accountCode: 'ASSET_CASH_USD', debit: params.amount, credit: 0, description: 'Wire transfer received' },
        { accountCode: 'LIABILITY_ACCOUNTS_PAYABLE', debit: 0, credit: payableToSupplier, description: 'Payable to supplier' },
        { accountCode: 'REVENUE_COMMISSION', debit: 0, credit: commission, description: 'Platform commission' },
      ],
    });

    let t2: TransactionResult | undefined;
    if (bankFee > 0) {
      t2 = await this.recordTransaction({
        tradeId: params.tradeId,
        description: `Bank wire fee for trade ${params.tradeId}`,
        entries: [
          { accountCode: 'EXPENSE_BANK_FEES', debit: bankFee, credit: 0, description: 'Bank wire fee' },
          { accountCode: 'ASSET_CASH_USD', debit: 0, credit: bankFee, description: 'Bank fee deducted' },
        ],
      });
    }

    return t2 ? [t1, t2] : [t1];
  }

  /**
   * 记录SaaS订阅收入
   * 
   * 借：Stripe准备金 199.00
   *   贷：SaaS订阅收入 199.00
   */
  async recordSaaSSubscription(params: {
    tenantId: string;
    amount: number;
    plan: 'professional' | 'enterprise';
    stripeFeeRate?: number;
  }): Promise<TransactionResult[]> {
    const stripeFeeRate = params.stripeFeeRate ?? 0.029;
    const stripeFee = this.round2(params.amount * stripeFeeRate + 0.30);

    const t1 = await this.recordTransaction({
      tenantId: params.tenantId,
      description: `SaaS subscription - ${params.plan} ($${params.amount}/mo)`,
      entries: [
        { accountCode: 'ASSET_STRIPE_RESERVE', debit: params.amount, credit: 0 },
        { accountCode: 'REVENUE_SAAS_SUBSCRIPTION', debit: 0, credit: params.amount },
      ],
    });

    const t2 = await this.recordTransaction({
      tenantId: params.tenantId,
      description: `Stripe fee for ${params.plan} subscription`,
      entries: [
        { accountCode: 'EXPENSE_STRIPE_FEES', debit: stripeFee, credit: 0 },
        { accountCode: 'ASSET_STRIPE_RESERVE', debit: 0, credit: stripeFee },
      ],
    });

    return [t1, t2];
  }

  /**
   * 记录合规服务费
   */
  async recordComplianceFee(params: {
    tradeId?: string;
    amount: number;
    serviceType: 'single_review' | 'annual_package' | 'classification';
  }): Promise<TransactionResult> {
    return this.recordTransaction({
      tradeId: params.tradeId,
      description: `Compliance service fee: ${params.serviceType}`,
      entries: [
        { accountCode: 'ASSET_STRIPE_RESERVE', debit: params.amount, credit: 0 },
        { accountCode: 'REVENUE_COMPLIANCE_FEES', debit: 0, credit: params.amount },
      ],
    });
  }

  /**
   * 记录付款给供应商
   * 
   * 借：应付供应商 970.00
   *   贷：现金USD 970.00
   */
  async recordSupplierPayout(params: {
    tradeId: string;
    amount: number;
    method: 'wire' | 'stripe_connect';
  }): Promise<TransactionResult> {
    const payoutFee = params.method === 'wire' ? 25 : 0;
    const netAmount = this.round2(params.amount - payoutFee);

    return this.recordTransaction({
      tradeId: params.tradeId,
      description: `Payout to supplier for trade ${params.tradeId} via ${params.method}`,
      entries: [
        { accountCode: 'LIABILITY_ACCOUNTS_PAYABLE', debit: params.amount, credit: 0, description: 'Settle payable to supplier' },
        { accountCode: 'ASSET_CASH_USD', debit: 0, credit: netAmount, description: 'Wire to supplier' },
        ...(payoutFee > 0 ? [{
          accountCode: 'EXPENSE_BANK_FEES',
          debit: payoutFee,
          credit: 0,
          description: 'Payout wire fee',
        }] : []),
      ],
    });
  }

  /**
   * 记录退款
   * 
   * 借：佣金收入（冲回） 30.00
   * 借：应付供应商（冲回） 970.00
   *   贷：Stripe准备金 1000.00
   */
  async recordRefund(params: {
    tradeId: string;
    amount: number;
    commission?: number;
    reason: string;
  }): Promise<TransactionResult> {
    const commission = params.commission ?? this.round2(params.amount * 0.03);
    const supplierAmount = this.round2(params.amount - commission);

    return this.recordTransaction({
      tradeId: params.tradeId,
      description: `Refund for trade ${params.tradeId}: ${params.reason}`,
      entries: [
        { accountCode: 'REVENUE_COMMISSION', debit: commission, credit: 0, description: 'Reverse commission' },
        { accountCode: 'LIABILITY_ACCOUNTS_PAYABLE', debit: supplierAmount, credit: 0, description: 'Reverse payable' },
        { accountCode: 'ASSET_STRIPE_RESERVE', debit: 0, credit: params.amount, description: 'Refund to customer' },
      ],
    });
  }

  /**
   * 获取账户余额
   */
  async getAccountBalance(accountCode: string, currency: string = 'USD'): Promise<{
    accountCode: string;
    accountName: string;
    accountType: AccountType;
    totalDebit: number;
    totalCredit: number;
    balance: number;
  }> {
    const result = await this.pool.query(
      `SELECT 
         a.account_code,
         a.account_name,
         a.account_type,
         COALESCE(SUM(e.debit), 0) as total_debit,
         COALESCE(SUM(e.credit), 0) as total_credit
       FROM ct_ledger_accounts a
       LEFT JOIN ct_ledger_entries e ON a.account_id = e.account_id
       WHERE a.account_code = $1 AND a.currency = $2
       GROUP BY a.account_id, a.account_code, a.account_name, a.account_type`,
      [accountCode, currency]
    );

    if (result.rows.length === 0) {
      throw new Error(`Account not found: ${accountCode} (${currency})`);
    }

    const row = result.rows[0];
    const totalDebit = parseFloat(row.total_debit);
    const totalCredit = parseFloat(row.total_credit);

    // 资产/费用：借方余额（正常为正）
    // 负债/权益/收入：贷方余额（正常为正）
    let balance: number;
    if (row.account_type === 'ASSET' || row.account_type === 'EXPENSE') {
      balance = totalDebit - totalCredit;
    } else {
      balance = totalCredit - totalDebit;
    }

    return {
      accountCode: row.account_code,
      accountName: row.account_name,
      accountType: row.account_type,
      totalDebit,
      totalCredit,
      balance,
    };
  }

  /**
   * 获取试算平衡表（所有账户余额）
   * 用于验证：所有借方余额合计 = 所有贷方余额合计
   */
  async getTrialBalance(): Promise<{
    accounts: Array<{
      accountCode: string;
      accountName: string;
      accountType: AccountType;
      currency: string;
      balance: number;
      normalBalance: 'debit' | 'credit';
    }>;
    totalDebitBalances: number;
    totalCreditBalances: number;
    balanced: boolean;
  }> {
    const result = await this.pool.query(
      `SELECT 
         a.account_code,
         a.account_name,
         a.account_type,
         a.currency,
         COALESCE(SUM(e.debit), 0) as total_debit,
         COALESCE(SUM(e.credit), 0) as total_credit
       FROM ct_ledger_accounts a
       LEFT JOIN ct_ledger_entries e ON a.account_id = e.account_id
       GROUP BY a.account_id, a.account_code, a.account_name, a.account_type, a.currency
       ORDER BY a.account_type, a.account_code`
    );

    let totalDebitBalances = 0;
    let totalCreditBalances = 0;

    const accounts = result.rows.map(row => {
      const totalDebit = parseFloat(row.total_debit);
      const totalCredit = parseFloat(row.total_credit);
      const normalBalance: 'debit' | 'credit' = 
        (row.account_type === 'ASSET' || row.account_type === 'EXPENSE') ? 'debit' : 'credit';
      
      const balance = normalBalance === 'debit' 
        ? totalDebit - totalCredit 
        : totalCredit - totalDebit;

      if (balance > 0) {
        if (normalBalance === 'debit') totalDebitBalances += balance;
        else totalCreditBalances += balance;
      }

      return {
        accountCode: row.account_code,
        accountName: row.account_name,
        accountType: row.account_type,
        currency: row.currency,
        balance,
        normalBalance,
      };
    });

    return {
      accounts,
      totalDebitBalances: this.round2(totalDebitBalances),
      totalCreditBalances: this.round2(totalCreditBalances),
      balanced: Math.abs(totalDebitBalances - totalCreditBalances) < 0.01,
    };
  }

  /**
   * 获取交易的所有分录
   */
  async getTransactionEntries(transactionId: string) {
    const result = await this.pool.query(
      `SELECT 
         e.*,
         a.account_code,
         a.account_name,
         a.account_type
       FROM ct_ledger_entries e
       JOIN ct_ledger_accounts a ON e.account_id = a.account_id
       WHERE e.transaction_id = $1
       ORDER BY e.entry_id`,
      [transactionId]
    );
    return result.rows;
  }

  /**
   * 获取某笔交易的所有记账记录
   */
  async getEntriesForTrade(tradeId: string) {
    const result = await this.pool.query(
      `SELECT 
         t.transaction_id,
         t.description,
         t.created_at,
         a.account_code,
         a.account_name,
         e.debit,
         e.credit,
         e.currency
       FROM ct_ledger_transactions t
       JOIN ct_ledger_entries e ON t.transaction_id = e.transaction_id
       JOIN ct_ledger_accounts a ON e.account_id = a.account_id
       WHERE t.trade_id = $1
       ORDER BY t.created_at, e.entry_id`,
      [tradeId]
    );
    return result.rows;
  }

  // ============== 工具方法 ==============

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}

// 单例
let ledgerInstance: LedgerSystem | null = null;

export function getLedgerSystem(pool: Pool): LedgerSystem {
  if (!ledgerInstance) {
    ledgerInstance = new LedgerSystem(pool);
  }
  return ledgerInstance;
}
