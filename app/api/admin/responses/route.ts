export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { verifySupabaseToken } from "@/lib/auth";

async function auth(req: NextRequest) {
  const h = req.headers.get("Authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return await verifySupabaseToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = new URL(req.url).searchParams.get("status") || "pending";
  try {
    const sql = getDB();
    const responses = await sql`
      SELECT r.*, p.title AS "prayerTitle"
      FROM "PrayerResponse" r
      JOIN "Prayer" p ON p.id = r."prayerId"
      WHERE r.status=${status}
      ORDER BY r."createdAt" DESC
    `;
    return NextResponse.json({ responses });
  } catch {
    return NextResponse.json({ responses: [] });
  }
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "ID and status required" }, { status: 400 });
  try {
    const sql = getDB();
    await sql`UPDATE "PrayerResponse" SET status=${status} WHERE id=${id}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
