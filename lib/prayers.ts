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
  responseCount: number;
};

export type PublicResponse = {
  id: string;
  prayerId: string;
  firstName: string;
  type: "comment" | "link";
  content: string;
  platform?: string | null;
  createdAt: string;
};

export type WallStats = {
  totalPrayers: number;
  totalPrayed: number;
  totalResponses: number;
  answeredCount: number;
};

export async function getApprovedPrayers(category?: string): Promise<PublicPrayer[]> {
  const sql = getDB();
  if (category && category !== "All") {
    return await sql<PublicPrayer[]>`
      SELECT p.id,p.title,p.body,p."firstName",p."isAnonymous",p.category,p."createdAt",p."prayerCount",p."isAnswered",
             COALESCE(COUNT(r.id),0)::int AS "responseCount"
      FROM "Prayer" p
      LEFT JOIN "PrayerResponse" r ON r."prayerId"=p.id AND r.status='approved'
      WHERE p.status='approved' AND p.category=${category}
      GROUP BY p.id
      ORDER BY p."createdAt" DESC
    `;
  }
  return await sql<PublicPrayer[]>`
    SELECT p.id,p.title,p.body,p."firstName",p."isAnonymous",p.category,p."createdAt",p."prayerCount",p."isAnswered",
           COALESCE(COUNT(r.id),0)::int AS "responseCount"
    FROM "Prayer" p
    LEFT JOIN "PrayerResponse" r ON r."prayerId"=p.id AND r.status='approved'
    WHERE p.status='approved'
    GROUP BY p.id
    ORDER BY p."createdAt" DESC
  `;
}

export async function getApprovedResponses(prayerId: string): Promise<PublicResponse[]> {
  const sql = getDB();
  return await sql<PublicResponse[]>`
    SELECT id,"prayerId","firstName",type,content,platform,"createdAt"
    FROM "PrayerResponse"
    WHERE "prayerId"=${prayerId} AND status='approved'
    ORDER BY "createdAt" ASC
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
  const [[row], [responseRow]] = await Promise.all([
    sql<WallStats[]>`
      SELECT
        COUNT(*)::int AS "totalPrayers",
        COALESCE(SUM("prayerCount"), 0)::int AS "totalPrayed",
        COUNT(*) FILTER (WHERE "isAnswered" = true)::int AS "answeredCount"
      FROM "Prayer"
      WHERE status = 'approved'
    `,
    sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM "PrayerResponse" WHERE status = 'approved'
    `,
  ]);
  return {
    totalPrayers: row?.totalPrayers ?? 0,
    totalPrayed: row?.totalPrayed ?? 0,
    totalResponses: responseRow?.count ?? 0,
    answeredCount: row?.answeredCount ?? 0,
  };
}
