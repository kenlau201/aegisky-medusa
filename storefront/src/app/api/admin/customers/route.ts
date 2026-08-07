import { NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";
export async function GET() {
  try {
    const result = await db.query(`SELECT id, first_name, last_name, email, phone, created_at FROM customer ORDER BY created_at DESC LIMIT 100`);
    return NextResponse.json({ customers: result.rows });
  } catch (e: any) {
    return NextResponse.json({ customers: [] });
  }
}
