import { NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";
export async function GET() {
  try {
    const result = await db.query(`SELECT MAX(id) as max_id FROM aegisky_products`);
    return NextResponse.json({ maxId: parseInt(result.rows[0]?.max_id || 70000) });
  } catch (e: any) {
    return NextResponse.json({ maxId: 70000 });
  }
}
