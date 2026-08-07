import { NextRequest, NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";
export async function GET() {
  const result = await db.query(`SELECT config_key, config_value FROM system_config`);
  const config: any = {};
  result.rows.forEach((r: any) => { config[r.config_key] = r.config_value; });
  return NextResponse.json(config);
}
export async function POST(request: NextRequest) {
  const body = await request.json();
  for (const [key, value] of Object.entries(body)) {
    await db.query(`INSERT INTO system_config (config_key, config_value) VALUES ($1, $2) ON CONFLICT (config_key) DO UPDATE SET config_value=$2`, [key, JSON.stringify(value)]);
  }
  return NextResponse.json({ success: true });
}
