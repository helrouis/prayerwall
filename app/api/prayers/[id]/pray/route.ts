export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { hashIP } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = hashIP(ip);
  try {
    const sql = getDB();
    const existing = await sql`SELECT id FROM "PrayerReaction" WHERE "prayerId"=${id} AND "ipHash"=${ipHash}`;
    if (existing.length > 0) return NextResponse.json({ message: "Already prayed" });
    await sql.begin(async sql => {
      await sql`INSERT INTO "PrayerReaction" (id,"prayerId","ipHash","createdAt") VALUES (gen_random_uuid(),${id},${ipHash},NOW())`;
      await sql`UPDATE "Prayer" SET "prayerCount"="prayerCount"+1 WHERE id=${id}`;
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not record prayer." }, { status: 500 });
  }
}
