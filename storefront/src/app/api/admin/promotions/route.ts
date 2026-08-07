import { NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";
export async function GET() {
  try {
    const promos = await db.query(`SELECT * FROM promotion ORDER BY created_at DESC LIMIT 100`);
    const coupons = await db.query(`SELECT * FROM coupon ORDER BY created_at DESC LIMIT 100`);
    return NextResponse.json({ promotions: promos.rows, coupons: coupons.rows });
  } catch (e: any) {
    return NextResponse.json({ promotions: [], coupons: [] });
  }
}
