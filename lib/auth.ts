import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const SECRET = process.env.JWT_SECRET || "prayer-wall-dev-secret-change-in-prod";

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export async function verifySupabaseToken(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export function hashIP(ip: string) {
  // Simple deterministic hash for IP deduplication
  let hash = 0;
  const str = ip + (process.env.IP_SALT || "prayer-salt");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
