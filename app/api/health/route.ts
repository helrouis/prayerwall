export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  const url = process.env.DATABASE_URL || "NOT SET";
  const masked = url.replace(/:([^@]+)@/, ":***@");
  try {
    const sql = getDB();
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true, url: masked });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, url: masked, error: msg }, { status: 500 });
  }
}
