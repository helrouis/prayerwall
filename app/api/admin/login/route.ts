export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDB } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) return NextResponse.json({ error: "Credentials required." }, { status: 400 });
  try {
    const sql = getDB();
    const [admin] = await sql`SELECT id,username,"passwordHash" FROM "Admin" WHERE username=${username}`;
    if (!admin) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    const token = signToken({ adminId: admin.id, username: admin.username });
    return NextResponse.json({ token });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
