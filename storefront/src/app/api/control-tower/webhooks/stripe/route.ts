import { NextResponse } from 'next/server'
import { getKernels } from '@/lib/control-tower'
import { pool, writeAuditLog } from '@/lib/control-tower/db'
import { initControlTowerTables } from '@/lib/control-tower/db'

/**
 * Stripe Webhook v5.0 - 自动记账 + 状态机推进
 * 
 * 处理的事件：
 * - payment_intent.succeeded: 支付成功，自动记账，推进到PAYMENT_CONFIRMED
 * - charge.refunded: 退款，自动冲账，推进到DISPUTED/REFUND
 * - payment_intent.payment_failed: 支付失败
 */

// 注意：生产环境应该用Stripe SDK验证签名
// 这里简化处理，直接解析事件
export async function POST(request: Request) {
  try {
    await initControlTowerTables()
    const { trade, ledger } = getKernels()

    const body = await request.text()
    let event: any
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // 生产环境在这里验证Stripe签名
    // const sig = request.headers.get('stripe-signature')
    // event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    console.log(`[Stripe Webhook v5] Received event: ${event.type}`)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const { amount, currency, metadata, id: paymentIntentId } = paymentIntent
        const { tradeId, kernelId } = metadata || {}

        if (!tradeId && !kernelId) {
          console.warn('[Stripe] No tradeId in metadata, skipping')
          return NextResponse.json({ received: true, warning: 'no tradeId' })
        }

        const amountInDollars = amount / 100 // Stripe金额是分

        // ========== 1. 复式记账 ==========
        const [paymentEntry, feeEntry] = await ledger.recordStripePayment({
          tradeId: kernelId || tradeId,
          amount: amountInDollars,
          currency: (currency || 'usd').toUpperCase(),
          paymentIntentId,
        })

        console.log(`[Stripe] Recorded payment: debit=${paymentEntry.totalDebit}, credit=${paymentEntry.totalCredit}`)
        console.log(`[Stripe] Recorded Stripe fee: debit=${feeEntry.totalDebit}, credit=${feeEntry.totalCredit}`)

        // ========== 2. 推进状态机 ==========
        if (kernelId) {
          await trade.transition(kernelId, 'PAYMENT_CONFIRMED', {
            id: 'stripe-webhook',
            type: 'SYSTEM',
            metadata: {
              paymentIntentId,
              amount: amountInDollars,
              currency,
              ledgerTransactionId: paymentEntry.transactionId,
            }
          })
        }

        // ========== 3. 更新旧表 ==========
        if (tradeId) {
          await pool.query(
            `UPDATE ct_trade_transactions 
             SET compliance_status = 'APPROVED',
                 notes = CONCAT(COALESCE(notes, ''), ' | payment_confirmed:', $2),
                 updated_at = NOW()
             WHERE id = $1`,
            [tradeId, paymentIntentId]
          )
        }

        // 审计
        await writeAuditLog({
          entityType: 'PAYMENT',
          entityId: kernelId || tradeId,
          action: 'PAYMENT_CONFIRMED_STRIPE',
          actorId: 'stripe-webhook',
          actorType: 'SYSTEM',
          newValues: {
            paymentIntentId,
            amount: amountInDollars,
            currency,
            ledgerPaymentTx: paymentEntry.transactionId,
            ledgerFeeTx: feeEntry.transactionId,
          }
        })

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        const { amount_refunded, currency, payment_intent, metadata } = charge
        const { tradeId, kernelId } = metadata || {}
        const refundAmount = amount_refunded / 100

        // 退款记账（冲回收入）
        await ledger.recordRefund({
          tradeId: kernelId || tradeId,
          amount: refundAmount,
          currency: (currency || 'usd').toUpperCase(),
          reason: 'customer_refund',
        })

        if (kernelId) {
          await trade.transition(kernelId, 'OPEN_DISPUTE', {
            id: 'stripe-webhook',
            type: 'SYSTEM',
            reason: 'Refund processed',
          })
        }

        await writeAuditLog({
          entityType: 'PAYMENT',
          entityId: kernelId || tradeId,
          action: 'REFUND_PROCESSED',
          actorId: 'stripe-webhook',
          actorType: 'SYSTEM',
          newValues: { refundAmount, paymentIntent: payment_intent }
        })

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const { last_payment_error, metadata } = paymentIntent
        const { kernelId } = metadata || {}

        if (kernelId) {
          await trade.transition(kernelId, 'CANCEL_TRADE', {
            id: 'stripe-webhook',
            type: 'SYSTEM',
            reason: `Payment failed: ${last_payment_error?.message || 'unknown error'}`,
          })
        }

        break
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('[Stripe Webhook v5] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
