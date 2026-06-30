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
    const prayers = status === "testimonies"
      ? await sql`SELECT * FROM "Prayer" WHERE status='approved' AND "answeredStory" IS NOT NULL AND "isAnswered"=false ORDER BY "createdAt" DESC`
      : await sql`SELECT * FROM "Prayer" WHERE status=${status} ORDER BY "createdAt" DESC`;
    return NextResponse.json({ prayers });
  } catch { return NextResponse.json({ prayers: [] }); }
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, isAnswered, answeredStory } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  try {
    const sql = getDB();
    if (status !== undefined) await sql`UPDATE "Prayer" SET status=${status} WHERE id=${id}`;
    if (isAnswered !== undefined) await sql`UPDATE "Prayer" SET "isAnswered"=${isAnswered} WHERE id=${id}`;
    if (answeredStory !== undefined) await sql`UPDATE "Prayer" SET "answeredStory"=${answeredStory} WHERE id=${id}`;
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Update failed." }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  try {
    const sql = getDB();
    await sql`DELETE FROM "Prayer" WHERE id=${id}`;
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Delete failed." }, { status: 500 }); }
}
