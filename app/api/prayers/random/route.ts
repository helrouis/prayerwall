export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDB();
    const [row] = await sql`
      SELECT id FROM "Prayer"
      WHERE status = 'approved'
      ORDER BY RANDOM()
      LIMIT 1
    `;
    if (!row) return NextResponse.json({ id: null });
    return NextResponse.json({ id: row.id });
  } catch {
    return NextResponse.json({ id: null });
  }
}
