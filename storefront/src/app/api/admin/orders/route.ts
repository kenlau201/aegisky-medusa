import { NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";
export async function GET() {
  try {
    const result = await db.query(`SELECT id, order_number, customer_name, total, status, created_at FROM "order" ORDER BY created_at DESC LIMIT 100`);
    return NextResponse.json({ orders: result.rows });
  } catch (e: any) {
    return NextResponse.json({ orders: [] });
  }
}
