# Prayer Wall

A warm, minimal community prayer wall where anyone can submit prayer requests and the community can pray together.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** with custom cream/gold/navy palette
- **postgres.js** for database access (no binary dependencies)
- **PostgreSQL** via Supabase (recommended) or any Postgres host
- **bcryptjs** + **jsonwebtoken** for admin auth

## Local Setup

### 1. Clone and install

```bash
npm install
```

### 2. Database

Create a PostgreSQL database (free tier on [Supabase](https://supabase.com) works great).

Run `db/schema.sql` in the SQL editor.

### 3. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` — your Postgres connection string
- `JWT_SECRET` — a long random string
- `IP_SALT` — another long random string (for IP hashing)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin credentials

### 4. Create admin user

```bash
node scripts/seed-admin.js
```

### 5. Run

```bash
npm run dev
```

## Deployment (Vercel + Supabase)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

## Pages

| Route | Description |
|-------|-------------|
| `/` | Prayer wall masonry grid |
| `/submit` | Submit a prayer request |
| `/prayer/:id` | Full prayer detail |
| `/about` | About the wall |
| `/jesus` | Gospel page |
| `/admin` | Admin dashboard (login required) |

## Moderation Flow

Every submitted prayer enters `pending` status. Admin approves or rejects from `/admin`. Only approved prayers appear publicly.

## Admin Dashboard

Visit `/admin` and log in with the credentials you set up. From there you can:
- Approve or reject pending prayers
- Mark approved prayers as answered
- Remove prayers
