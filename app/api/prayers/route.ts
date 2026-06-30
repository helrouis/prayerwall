export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getApprovedPrayers } from "@/lib/prayers";

const CATEGORIES = ["Health","Family","Relationships","Financial","School","Work","Thanksgiving","Salvation","Other"];
const submissions = new Map<string, number[]>();
function rateLimit(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now(), window = 60_000, limit = 50;
  const times = (submissions.get(ip) || []).filter(t => now - t < window);
  if (times.length >= limit) return true;
  submissions.set(ip, [...times, now]);
  return false;
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });
  const data = await res.json();
  return data.success === true;
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
  const { title, body: prayer, category, isAnonymous, firstName, email, phone, agreed, turnstileToken } = body;

  if (!title?.trim() || !prayer?.trim()) return NextResponse.json({ error: "Title and prayer required." }, { status: 400 });
  if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  if (!agreed) return NextResponse.json({ error: "Please agree to the terms." }, { status: 400 });
  if (!firstName?.trim()) return NextResponse.json({ error: "Your name is required." }, { status: 400 });
  if (firstName.trim().length > 100) return NextResponse.json({ error: "Name too long." }, { status: 400 });
  if (title.trim().length > 200) return NextResponse.json({ error: "Title too long." }, { status: 400 });
  if (prayer.trim().length > 5000) return NextResponse.json({ error: "Prayer too long (max 5000 characters)." }, { status: 400 });
  if (email && email.trim().length > 254) return NextResponse.json({ error: "Email too long." }, { status: 400 });
  if (phone && phone.trim().length > 20) return NextResponse.json({ error: "Phone too long." }, { status: 400 });

  if (!turnstileToken) return NextResponse.json({ error: "Security check required." }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const valid = await verifyTurnstile(turnstileToken, ip);
  if (!valid) return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });

  if (rateLimit(req)) return NextResponse.json({ error: "Too many submissions. Try again shortly." }, { status: 429 });
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
