// Usage: node scripts/seed-admin.js
// Set ADMIN_USERNAME, ADMIN_PASSWORD, DATABASE_URL in .env first
require("dotenv").config();
const postgres = require("postgres");
const bcrypt = require("bcryptjs");

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO "Admin" (id, username, "passwordHash")
    VALUES (gen_random_uuid()::text, ${username}, ${passwordHash})
    ON CONFLICT (username) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash"
  `;

  console.log(`Admin "${username}" ready.`);
  await sql.end();
}

main().catch(e => { console.error(e); process.exit(1); });
