export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getApprovedPrayers } from "@/lib/prayers";

const CATEGORIES = ["Health","Family","Relationships","Financial","School","Work","Thanksgiving","Salvation","Other"];
const submissions = new Map<string, number[]>();

function getIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
function rateLimit(ip: string) {
  const now = Date.now(), window = 3_600_000, limit = 3;
  const times = (submissions.get(ip) || []).filter(t => now - t < window);
  if (times.length >= limit) return true;
  submissions.set(ip, [...times, now]);
  return false;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  try {
    const prayers = await getApprovedPrayers(category);
    return NextResponse.json({ prayers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ prayers: [] });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, body: prayer, category, isAnonymous, firstName, email, phone, agreed } = body;
  if (!title?.trim() || !prayer?.trim()) return NextResponse.json({ error: "Title and prayer required." }, { status: 400 });
  if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  if (!agreed) return NextResponse.json({ error: "Please agree to public display." }, { status: 400 });
  if (!firstName?.trim()) return NextResponse.json({ error: "Your name is required." }, { status: 400 });
  if (!email?.trim() && !phone?.trim()) return NextResponse.json({ error: "Please provide an email or phone number." }, { status: 400 });

  const ip = getIP(req);
  if (rateLimit(ip)) return NextResponse.json({ error: "Too many submissions. Try later." }, { status: 429 });
  try {
    const sql = getDB();
    const [row] = await sql`
      INSERT INTO "Prayer" (id,title,body,"firstName","isAnonymous",email,phone,category,status,"createdAt","prayerCount","isAnswered")
      VALUES (gen_random_uuid(),${title.trim()},${prayer.trim()},
        ${firstName.trim()},
        ${!!isAnonymous},${email?.trim()||null},${phone?.trim()||null},${category},'pending',NOW(),0,false)
      RETURNING id
    `;
    return NextResponse.json({ id: row.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save prayer." }, { status: 500 });
  }
}
