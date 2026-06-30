export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { story } = await req.json();
  if (!story?.trim()) return NextResponse.json({ error: "Testimony is required." }, { status: 400 });
  try {
    const sql = getDB();
    const [prayer] = await sql`SELECT id, status FROM "Prayer" WHERE id=${id}`;
    if (!prayer) return NextResponse.json({ error: "Prayer not found." }, { status: 404 });
    if (prayer.status !== "approved") return NextResponse.json({ error: "Prayer not found." }, { status: 404 });
    await sql`UPDATE "Prayer" SET "answeredStory"=${story.trim()} WHERE id=${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save testimony." }, { status: 500 });
  }
}
