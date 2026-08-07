import { NextRequest, NextResponse } from "next/server";
import { pool as db } from "@/lib/control-tower/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    await db.query(
      `UPDATE coupon SET name=$1, type=$2, discount_amount=$3, discount_percentage=$4, min_spend=$5, total_issue=$6, per_user_limit=$7, start_at=$8, end_at=$9 WHERE id=$10`,
      [body.name, body.type, body.discount_amount, body.discount_percentage, body.min_spend, body.total_issue, body.per_user_limit, body.start_at ? new Date(body.start_at) : null, body.end_at ? new Date(body.end_at) : null, params.id]
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

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
