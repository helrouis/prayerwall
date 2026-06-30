**Project: Prayer Wall**
A public community prayer wall web app. Stack: Next.js 15 (App Router, TypeScript), Tailwind CSS, postgres.js, PostgreSQL (Supabase), bcryptjs + jsonwebtoken for admin auth.

**Design system:** Custom palette — cream `#FAF8F3` bg, white cards, gold `#C9963F` accent, deep navy `#1B2F4E` text. Font: Lora (serif, headings/display) + Inter (body/UI). Rounded-2xl cards, no shadows, subtle border `border-cream-200`, hover adds faint gold border + shadow. Fade-in-up animation on cards (staggered by index). 🙏 button pulses on tap via `pray-animate` keyframe.

**File structure:**
```
app/
  layout.tsx          — root layout, Navbar, footer with Bible verse
  page.tsx            — home: hero stats, category filter pills, CSS columns masonry grid
  submit/page.tsx     — prayer submission form (client component)
  about/page.tsx      — about page (static)
  jesus/page.tsx      — gospel page: 4 steps + sample prayer (static)
  admin/page.tsx      — JWT-protected dashboard (client, login + approve/reject/answered tabs)
  prayer/[id]/page.tsx — prayer detail with answered testimony section
  api/
    prayers/route.ts              — GET (list approved) / POST (submit, rate-limited 3/hr/IP)
    prayers/[id]/pray/route.ts    — POST (increment prayerCount, IP-deduplicated)
    admin/login/route.ts          — POST (bcrypt verify, returns JWT)
    admin/prayers/route.ts        — GET/PATCH/DELETE (JWT-protected, all statuses)
components/
  Navbar.tsx          — sticky, responsive, active link in gold
  PrayerCard.tsx      — card with category badge, truncated body, pray button, read more
lib/
  db.ts               — postgres.js singleton via getDB()
  auth.ts             — signToken / verifyToken (JWT), hashIP (for deduplication)
db/
  schema.sql          — raw SQL for tables: Prayer, PrayerReaction, Admin + indexes
scripts/
  seed-admin.js       — node script to upsert admin user (uses DATABASE_URL + bcrypt)
```

**Database schema (PostgreSQL, camelCase columns in quotes):**
```sql
"Prayer": id, title, body, "firstName", "isAnonymous", email, category,
           status (pending|approved|rejected), "createdAt", "prayerCount",
           "isAnswered", "answeredStory"
"PrayerReaction": id, "prayerId" (FK→Prayer), "ipHash", "createdAt"
                  UNIQUE("prayerId","ipHash")
"Admin": id, username (UNIQUE), "passwordHash"
```

**Categories:** Health, Family, Relationships, Financial, School, Work, Thanksgiving, Salvation, Other

**Moderation flow:** Every submission enters `pending`. Admin approves → `approved` (public). No auto-publish ever.

**Auth:** Admin login POSTs to `/api/admin/login` → returns JWT. All admin API calls send `Authorization: Bearer <token>`. JWT secret from `JWT_SECRET` env var.

**Env vars needed:**
```
DATABASE_URL       — PostgreSQL connection string (Supabase recommended)
JWT_SECRET         — long random string
IP_SALT            — second random string for IP hashing
ADMIN_USERNAME     — for seed script
ADMIN_PASSWORD     — for seed script
```

**Current state / what's NOT yet built:**
- Home page uses hardcoded sample data (8 prayers). Needs `getDB()` wired in to query live data.
- No search or full-text filter UI
- No answered prayer submission form for the original requester
- No email notifications
- No CAPTCHA
- No SEO metadata per page
- No share button on prayer detail
- No profanity filter
- Admin dashboard loads from API but has no statistics view
- `answeredStory` field exists in DB but no UI for submitting it (admin can set `isAnswered` but can't write the story yet)

**Key conventions:**
- All API routes have `export const dynamic = "force-dynamic"` at top
- postgres.js tagged template literals for all queries (no ORM)
- IP hashing: simple djb2-style hash of `ip + IP_SALT`, returned as base36
- Rate limiting is in-memory Map (needs Redis for multi-instance prod)
- Cards use CSS columns (`columns-1 sm:columns-2 lg:columns-3`) not a JS masonry library