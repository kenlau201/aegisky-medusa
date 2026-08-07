import { NextRequest, NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const sets: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowed = ["name", "status", "total_issue", "end_at"];
    for (const f of allowed) {
      if (body[f] !== undefined) {
        sets.push(`${f} = $${paramIndex++}`);
        values.push(body[f] === "end_at" ? new Date(body[f]) : body[f]);
      }
    }

    if (sets.length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });
    values.push(params.id);

    await db.query(`UPDATE coupon SET ${sets.join(", ")} WHERE id = $${paramIndex}`, values);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.query(`DELETE FROM coupon WHERE id = $1`, [params.id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
