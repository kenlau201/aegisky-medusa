/**
 * Aegisky Medusa v5.0 - JSON DSL Rule Engine
 * 可配置规则引擎 - 合规判断核心
 * 
 * 规则用JSON定义，存在数据库，业务人员可配置
 * 不需要OPA、不需要Drools、不需要任何中间件
 * 核心代码不到300行
 */

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// ============== 类型定义 ==============

export type Operator =
  | 'equals' | 'notEquals'
  | 'in' | 'notIn'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'startsWith' | 'endsWith' | 'contains'
  | 'matches' | 'exists' | 'notExists';

export type RuleDecision = 'APPROVE' | 'REJECT' | 'REVIEW' | 'WARNING' | 'ROUTE';

export interface RuleCondition {
  field: string;
  op: Operator;
  value?: any;
}

export interface RuleGroup {
  all?: RuleCondition[];
  any?: RuleCondition[];
  not?: RuleGroup;
}

export interface RuleAction {
  decision: RuleDecision;
  riskScore?: number;
  reason: string;
  remediation?: string;
  priority?: number;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  jurisdiction?: string;  // 'US_EAR', 'EU_DUAL_USE', 'UN', 'OFAC', 'GLOBAL'
  effectiveFrom?: Date;
  effectiveTo?: Date;
  when: RuleGroup;
  then: RuleAction;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  decision: RuleDecision;
  priority: number;
  riskScore: number;
  reason: string;
  remediation?: string;
  matchedFields: string[];
}

export interface EvaluationContext {
  [key: string]: any;
}

export interface EvaluationOutcome {
  finalDecision: RuleDecision;
  totalRiskScore: number;
  matchedRules: RuleEvaluationResult[];
  allResults: RuleEvaluationResult[];
  highestPriority: number;
  reasoning: string[];
}

// ============== 条件求值器 ==============

function getFieldValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
}

function evaluateCondition(condition: RuleCondition, context: EvaluationContext): boolean {
  const actual = getFieldValue(context, condition.field);

  switch (condition.op) {
    case 'exists':
      return actual !== undefined && actual !== null && actual !== '';
    case 'notExists':
      return actual === undefined || actual === null || actual === '';
    case 'equals':
      // 不区分大小写比较
      return String(actual).toLowerCase() === String(condition.value).toLowerCase();
    case 'notEquals':
      return String(actual).toLowerCase() !== String(condition.value).toLowerCase();
    case 'in':
      if (!Array.isArray(condition.value)) return false;
      return condition.value.some(v => String(actual).toLowerCase() === String(v).toLowerCase());
    case 'notIn':
      if (!Array.isArray(condition.value)) return true;
      return !condition.value.some(v => String(actual).toLowerCase() === String(v).toLowerCase());
    case 'gt':
      return Number(actual) > Number(condition.value);
    case 'gte':
      return Number(actual) >= Number(condition.value);
    case 'lt':
      return Number(actual) < Number(condition.value);
    case 'lte':
      return Number(actual) <= Number(condition.value);
    case 'startsWith':
      return String(actual).toLowerCase().startsWith(String(condition.value).toLowerCase());
    case 'endsWith':
      return String(actual).toLowerCase().endsWith(String(condition.value).toLowerCase());
    case 'contains':
      if (Array.isArray(actual)) {
        return actual.some(item => String(item).toLowerCase().includes(String(condition.value).toLowerCase()));
      }
      return String(actual).toLowerCase().includes(String(condition.value).toLowerCase());
    case 'matches':
      try {
        const regex = new RegExp(condition.value, 'i');
        return regex.test(String(actual));
      } catch {
        return false;
      }
    default:
      return false;
  }
}

function evaluateGroup(group: RuleGroup, context: EvaluationContext): boolean {
  // NOT
  if (group.not) {
    return !evaluateGroup(group.not, context);
  }

  // ALL: 所有条件都要满足
  if (group.all && group.all.length > 0) {
    return group.all.every(cond => evaluateCondition(cond, context));
  }

  // ANY: 任意一个满足即可
  if (group.any && group.any.length > 0) {
    return group.any.some(cond => evaluateCondition(cond, context));
  }

  // 空组默认true
  return true;
}

// ============== 规则引擎 ==============

export class RuleEngine {
  private rules: ComplianceRule[] = [];
  private pool: Pool;
  private lastLoaded: Date | null = null;
  private cacheTtlMs = 60000; // 1分钟缓存

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 从数据库加载所有启用的规则
   */
  async loadRules(forceReload = false): Promise<ComplianceRule[]> {
    // 缓存检查
    if (!forceReload && this.lastLoaded && (Date.now() - this.lastLoaded.getTime()) < this.cacheTtlMs) {
      return this.rules;
    }

    const result = await this.pool.query(
      `SELECT rule_id, rule_name, rule_description as description, enabled, priority, jurisdiction,
              effective_from, effective_to, condition_json, action_json
       FROM ct_compliance_rules
       WHERE enabled = true
       ORDER BY priority ASC`
    );

    this.rules = result.rows.map(row => ({
      id: row.rule_id,
      name: row.rule_name,
      description: row.description,
      enabled: row.enabled,
      priority: row.priority,
      jurisdiction: row.jurisdiction,
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      when: row.condition_json || row.conditions, // 兼容旧字段
      then: row.action_json,
    }));

    this.lastLoaded = new Date();
    return this.rules;
  }

  /**
   * 评估单条规则
   */
  evaluateRule(rule: ComplianceRule, context: EvaluationContext): RuleEvaluationResult {
    const matched = evaluateGroup(rule.when, context);
    const matchedFields: string[] = [];

    if (matched) {
      // 收集匹配的字段
      const collectFields = (group: RuleGroup) => {
        if (group.all) group.all.forEach(c => matchedFields.push(c.field));
        if (group.any) group.any.forEach(c => matchedFields.push(c.field));
        if (group.not) collectFields(group.not);
      };
      collectFields(rule.when);
    }

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      matched,
      decision: rule.then.decision,
      priority: rule.priority,
      riskScore: matched ? (rule.then.riskScore || 0) : 0,
      reason: matched ? rule.then.reason : `Rule ${rule.name} not matched`,
      remediation: rule.then.remediation,
      matchedFields: matched ? [...new Set(matchedFields)] : [],
    };
  }

  /**
   * 评估所有规则，得出最终结论
   * 
   * 决策优先级：
   * 1. 任何REJECT → 最终REJECT（硬熔断）
   * 2. 任何REVIEW → 最终REVIEW（人工审核）
   * 3. 任何WARNING → WARNING（通过但记录）
   * 4. 否则 → APPROVE
   */
  evaluateAll(context: EvaluationContext, rules?: ComplianceRule[]): EvaluationOutcome {
    const rulesToEvaluate = rules || this.rules;
    const allResults = rulesToEvaluate.map(rule => this.evaluateRule(rule, context));
    const matchedRules = allResults.filter(r => r.matched);

    let finalDecision: RuleDecision = 'APPROVE';
    let highestPriority = 999;
    let totalRiskScore = 0;
    const reasoning: string[] = [];

    // 按优先级排序
    const sortedMatches = [...matchedRules].sort((a, b) => a.priority - b.priority);

    for (const match of sortedMatches) {
      totalRiskScore += match.riskScore;
      reasoning.push(`[${match.ruleName}] ${match.reason}`);

      if (match.decision === 'REJECT') {
        finalDecision = 'REJECT';
        highestPriority = Math.min(highestPriority, match.priority);
        break; // REJECT是硬熔断，不用看后面了
      }
      if (match.decision === 'REVIEW' && finalDecision !== 'REJECT') {
        finalDecision = 'REVIEW';
        highestPriority = Math.min(highestPriority, match.priority);
      }
      if (match.decision === 'WARNING' && finalDecision === 'APPROVE') {
        finalDecision = 'WARNING';
        highestPriority = Math.min(highestPriority, match.priority);
      }
    }

    // 风险分数上限100
    totalRiskScore = Math.min(100, totalRiskScore);

    if (matchedRules.length === 0) {
      reasoning.push('No compliance rules matched. Transaction approved automatically.');
    }

    return {
      finalDecision,
      totalRiskScore,
      matchedRules: sortedMatches,
      allResults,
      highestPriority,
      reasoning,
    };
  }

  /**
   * 便捷方法：加载规则并评估
   */
  async evaluate(context: EvaluationContext): Promise<EvaluationOutcome> {
    await this.loadRules();
    return this.evaluateAll(context);
  }

  /**
   * 创建新规则
   */
  async createRule(rule: Omit<ComplianceRule, 'id'>): Promise<string> {
    const ruleId = rule.id || `RULE-${uuidv4().substring(0, 8).toUpperCase()}`;

    await this.pool.query(
      `INSERT INTO ct_compliance_rules 
       (rule_id, rule_name, description, enabled, priority, jurisdiction, 
        effective_from, effective_to, condition_json, action_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        ruleId,
        rule.name,
        rule.description || null,
        rule.enabled,
        rule.priority,
        rule.jurisdiction || 'GLOBAL',
        rule.effectiveFrom || null,
        rule.effectiveTo || null,
        JSON.stringify(rule.when),
        JSON.stringify(rule.then),
      ]
    );

    // 刷新缓存
    this.lastLoaded = null;
    return ruleId;
  }

  /**
   * 测试规则（沙箱）
   */
  testRule(rule: ComplianceRule, testContext: EvaluationContext): RuleEvaluationResult {
    return this.evaluateRule(rule, testContext);
  }
}

// ============== 预置规则（v1法规版本） ==============

export const DEFAULT_RULES: Array<Omit<ComplianceRule, 'id'>> = [
  {
    name: '全面制裁国家拦截',
    description: 'OFAC/EU/UN全面制裁国家，任何交易都禁止',
    enabled: true,
    priority: 10,
    jurisdiction: 'GLOBAL',
    when: {
      any: [
        { field: 'buyer.country', op: 'in', value: ['IR', 'KP', 'SY', 'CU', 'VE', 'BY', 'MM', 'SD', 'LY', 'YE', 'SO', 'AF', 'ZW', 'ER'] },
        { field: 'endUser.country', op: 'in', value: ['IR', 'KP', 'SY', 'CU', 'VE', 'BY', 'MM', 'SD', 'LY', 'YE', 'SO', 'AF', 'ZW', 'ER'] },
        { field: 'shipTo.country', op: 'in', value: ['IR', 'KP', 'SY', 'CU', 'VE', 'BY', 'MM', 'SD', 'LY', 'YE', 'SO', 'AF', 'ZW', 'ER'] },
      ]
    },
    then: {
      decision: 'REJECT',
      riskScore: 100,
      reason: 'Destination country is under comprehensive OFAC/EU/UN sanctions. Transaction prohibited.',
      remediation: 'This transaction cannot proceed under any circumstances. No license available.',
    },
  },
  {
    name: '高风险转口国家人工审查',
    description: '已知的转口贸易高风险国家/地区，需要人工审查',
    enabled: true,
    priority: 30,
    jurisdiction: 'GLOBAL',
    when: {
      any: [
        { field: 'buyer.country', op: 'in', value: ['HK', 'AE', 'TR', 'CY', 'MT', 'LU', 'PA', 'KY', 'VG', 'BM', 'GI', 'MU', 'KZ', 'UZ', 'KG'] },
        { field: 'shipTo.country', op: 'in', value: ['HK', 'AE', 'TR', 'CY', 'MT', 'LU', 'PA', 'KY', 'VG', 'BM', 'GI', 'MU', 'KZ', 'UZ', 'KG'] },
      ]
    },
    then: {
      decision: 'REVIEW',
      riskScore: 40,
      reason: 'Jurisdiction is high-risk for transshipment/diversion.',
      remediation: 'Require enhanced due diligence: verify end-user, end-use statement, and final delivery address.',
    },
  },
  {
    name: '军事最终用途红旗',
    description: '最终用户或最终用途表明可能是军事用途',
    enabled: true,
    priority: 50,
    jurisdiction: 'GLOBAL',
    when: {
      any: [
        { field: 'endUser.name', op: 'matches', value: '(?i)military|army|navy|air force|defense|defence|ministry of defense|MOD' },
        { field: 'endUserStatement.endUse', op: 'contains', value: 'military' },
        { field: 'endUserStatement.endUse', op: 'contains', value: 'weapon' },
        { field: 'endUserStatement.endUse', op: 'contains', value: 'defense' },
      ]
    },
    then: {
      decision: 'REVIEW',
      riskScore: 60,
      reason: 'Military end-use indicators detected.',
      remediation: 'Escalate to senior compliance officer. Verify end-user certificate and applicable export license.',
    },
  },
  {
    name: '异常数量红旗',
    description: '采购数量异常大，可能是囤积或转口',
    enabled: true,
    priority: 60,
    jurisdiction: 'GLOBAL',
    when: {
      all: [
        { field: 'product.category', op: 'in', value: ['drones', 'flight-controllers', 'vtol', 'propulsion'] },
        { field: 'order.quantity', op: 'gt', value: 100 },
      ]
    },
    then: {
      decision: 'WARNING',
      riskScore: 20,
      reason: 'Order quantity exceeds normal commercial threshold (>100 units for controlled category).',
      remediation: 'Verify buyer is legitimate business, not a front for diversion.',
    },
  },
  {
    name: '两用物项需要最终用户声明',
    description: '受控两用品类必须提供EUS',
    enabled: true,
    priority: 70,
    jurisdiction: 'GLOBAL',
    when: {
      all: [
        { field: 'product.eccn', op: 'startsWith', value: '7A' },
        { field: 'documents.eusUploaded', op: 'notExists' },
      ]
    },
    then: {
      decision: 'REJECT',
      riskScore: 50,
      reason: 'Dual-use item requires End-User Statement (EUS).',
      remediation: 'Buyer must complete and upload signed End-User Statement before compliance review.',
    },
  },
  {
    name: '9A012军用无人机需要许可证',
    description: 'ECCN 9A012受控无人机需要出口许可证',
    enabled: true,
    priority: 40,
    jurisdiction: 'US_EAR',
    when: {
      all: [
        { field: 'product.eccn', op: 'equals', value: '9A012' },
        { field: 'license.hasValidLicense', op: 'notExists' },
      ]
    },
    then: {
      decision: 'REVIEW',
      riskScore: 55,
      reason: 'ECCN 9A012 military UAV requires valid BIS export license.',
      remediation: 'Verify buyer has valid import permit and apply for BIS export license.',
    },
  },
  {
    name: '7A003导航系统控制',
    enabled: true,
    priority: 45,
    jurisdiction: 'US_EAR',
    when: {
      all: [
        { field: 'product.eccn', op: 'startsWith', value: '7A003' },
        { field: 'buyer.country', op: 'notIn', value: ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU', 'NZ', 'KR'] },
      ]
    },
    then: {
      decision: 'REVIEW',
      riskScore: 45,
      reason: 'ECCN 7A003 navigation equipment to non-NATO+ country requires license.',
      remediation: 'Confirm license exception availability or apply for export license.',
    },
  },
];

// 单例
let ruleEngineInstance: RuleEngine | null = null;

export function getRuleEngine(pool: Pool): RuleEngine {
  if (!ruleEngineInstance) {
    ruleEngineInstance = new RuleEngine(pool);
  }
  return ruleEngineInstance;
}
