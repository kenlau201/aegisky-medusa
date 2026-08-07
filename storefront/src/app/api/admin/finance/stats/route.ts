import { NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";
export async function GET() {
  try {
    const balance = await db.query(`SELECT COALESCE(SUM(balance),0) as total FROM user_wallet`);
    const recharge = await db.query(`SELECT COALESCE(SUM(amount),0) as total FROM recharge_order WHERE payment_status='paid'`);
    const withdraw = await db.query(`SELECT COALESCE(SUM(actual_amount),0) as total FROM withdrawal_request WHERE status='paid'`);
    const pendingW = await db.query(`SELECT COUNT(*) FROM withdrawal_request WHERE status='pending'`);
    const commission = await db.query(`SELECT COALESCE(SUM(amount),0) as total FROM commission_record WHERE status='settled'`);
    return NextResponse.json({
      totalBalance: parseFloat(balance.rows[0]?.total || 0),
      totalRecharge: parseFloat(recharge.rows[0]?.total || 0),
      totalWithdraw: parseFloat(withdraw.rows[0]?.total || 0),
      pendingWithdraw: parseInt(pendingW.rows[0]?.count || 0),
      totalCommission: parseFloat(commission.rows[0]?.total || 0),
    });
  } catch (e: any) {
    return NextResponse.json({ totalBalance:0, totalRecharge:0, totalWithdraw:0, pendingWithdraw:0, totalCommission:0 });
  }
}
