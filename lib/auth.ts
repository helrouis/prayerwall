import jwt from "jsonwebtoken";

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
