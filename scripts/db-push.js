// Usage: node scripts/db-push.js
// Applies db/schema.sql to DATABASE_URL (Supabase Postgres)
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const postgres = require("postgres");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const schemaPath = path.join(__dirname, "../db/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  const sql = postgres(url, { max: 1, ssl: "require" });
  await sql.unsafe(schema);
  console.log("Database schema applied successfully.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
