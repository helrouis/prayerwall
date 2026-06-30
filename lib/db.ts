import postgres from "postgres";

let sql: ReturnType<typeof postgres>;

function getDB() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const isSupabase = url.includes("supabase.co");
    sql = postgres(url, { max: 5, ...(isSupabase && { ssl: "require" }) });
  }
  return sql;
}

export { getDB };
