import { getDB } from "@/lib/db";

export type PublicPrayer = {
  id: string;
  title: string;
  body: string;
  firstName: string | null;
  isAnonymous: boolean;
  category: string;
  createdAt: string;
  prayerCount: number;
  isAnswered: boolean;
  answeredStory?: string | null;
};

export type WallStats = {
  totalPrayers: number;
  totalPrayed: number;
  answeredCount: number;
};

export async function getApprovedPrayers(category?: string): Promise<PublicPrayer[]> {
  const sql = getDB();
  if (category && category !== "All") {
    return await sql<PublicPrayer[]>`
      SELECT id,title,body,"firstName","isAnonymous",category,"createdAt","prayerCount","isAnswered"
      FROM "Prayer"
      WHERE status='approved' AND category=${category}
      ORDER BY "createdAt" DESC
    `;
  }
  return await sql<PublicPrayer[]>`
    SELECT id,title,body,"firstName","isAnonymous",category,"createdAt","prayerCount","isAnswered"
    FROM "Prayer"
    WHERE status='approved'
    ORDER BY "createdAt" DESC
  `;
}

export async function getApprovedPrayerById(id: string): Promise<PublicPrayer | null> {
  const sql = getDB();
  const [prayer] = await sql<PublicPrayer[]>`
    SELECT id,title,body,"firstName","isAnonymous",category,"createdAt","prayerCount","isAnswered","answeredStory"
    FROM "Prayer"
    WHERE id=${id} AND status='approved'
  `;
  return prayer ?? null;
}

export async function getWallStats(): Promise<WallStats> {
  const sql = getDB();
  const [row] = await sql<WallStats[]>`
    SELECT
      COUNT(*)::int AS "totalPrayers",
      COALESCE(SUM("prayerCount"), 0)::int AS "totalPrayed",
      COUNT(*) FILTER (WHERE "isAnswered" = true)::int AS "answeredCount"
    FROM "Prayer"
    WHERE status = 'approved'
  `;
  return {
    totalPrayers: row?.totalPrayers ?? 0,
    totalPrayed: row?.totalPrayed ?? 0,
    answeredCount: row?.answeredCount ?? 0,
  };
}
