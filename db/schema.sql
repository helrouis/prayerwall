-- Run this in Supabase SQL editor or any PostgreSQL instance

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "Prayer" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  "firstName"     TEXT,
  "isAnonymous"   BOOLEAN NOT NULL DEFAULT false,
  email           TEXT,
  category        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "prayerCount"   INT NOT NULL DEFAULT 0,
  "isAnswered"    BOOLEAN NOT NULL DEFAULT false,
  "answeredStory" TEXT,
  phone           TEXT
);

CREATE TABLE IF NOT EXISTS "PrayerReaction" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "prayerId"  TEXT NOT NULL REFERENCES "Prayer"(id) ON DELETE CASCADE,
  "ipHash"    TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("prayerId", "ipHash")
);

CREATE TABLE IF NOT EXISTS "Admin" (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username       TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prayer_status   ON "Prayer"(status);
CREATE INDEX IF NOT EXISTS idx_prayer_category ON "Prayer"(category);
CREATE INDEX IF NOT EXISTS idx_prayer_created  ON "Prayer"("createdAt" DESC);

CREATE TABLE IF NOT EXISTS "PrayerResponse" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "prayerId"  TEXT NOT NULL REFERENCES "Prayer"(id) ON DELETE CASCADE,
  "firstName" TEXT NOT NULL,
  type        TEXT NOT NULL,
  content     TEXT NOT NULL,
  platform    TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prayer_response_prayer ON "PrayerResponse"("prayerId");
CREATE INDEX IF NOT EXISTS idx_prayer_response_status ON "PrayerResponse"(status);
