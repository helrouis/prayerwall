export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

const ALLOWED_HOSTS: Record<string, string> = {
  "open.spotify.com": "spotify",
  "spotify.com": "spotify",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "facebook.com": "facebook",
  "fb.watch": "facebook",
  "instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "vm.tiktok.com": "tiktok",
};

function detectPlatform(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return ALLOWED_HOSTS[host] ?? null;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sql = getDB();
    const responses = await sql`
      SELECT id,"firstName",type,content,platform,"createdAt"
      FROM "PrayerResponse"
      WHERE "prayerId"=${id} AND status='approved'
      ORDER BY "createdAt" ASC
    `;
    return NextResponse.json({ responses });
  } catch {
    return NextResponse.json({ responses: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { firstName, type, content } = body;

  if (!firstName?.trim()) return NextResponse.json({ error: "First name is required." }, { status: 400 });
  if (!["comment", "link"].includes(type)) return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  if (!content?.trim()) return NextResponse.json({ error: "Content is required." }, { status: 400 });
  if (type === "comment" && content.trim().length > 1000)
    return NextResponse.json({ error: "Comment too long (max 1000 characters)." }, { status: 400 });

  let platform: string | null = null;
  if (type === "link") {
    platform = detectPlatform(content.trim());
    if (!platform)
      return NextResponse.json(
        { error: "Only Spotify, YouTube, Facebook, Instagram, and TikTok links are allowed." },
        { status: 400 }
      );
  }

  try {
    const sql = getDB();
    const [prayer] = await sql`SELECT id FROM "Prayer" WHERE id=${id} AND status='approved'`;
    if (!prayer) return NextResponse.json({ error: "Prayer not found." }, { status: 404 });
    await sql`
      INSERT INTO "PrayerResponse" (id,"prayerId","firstName",type,content,platform,status,"createdAt")
      VALUES (gen_random_uuid(),${id},${firstName.trim()},${type},${content.trim()},${platform},'pending',NOW())
    `;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save response." }, { status: 500 });
  }
}
