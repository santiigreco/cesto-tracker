-- Migration: link games to fixture entries
-- Run this in the Supabase Dashboard → SQL Editor

-- 1. Add the column (nullable — the fixture link is always optional)
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS fixture_id TEXT DEFAULT NULL;

-- 2. Index for fast lookups in FixtureView (fetches all linked games at once)
CREATE INDEX IF NOT EXISTS idx_games_fixture_id
  ON games(fixture_id)
  WHERE fixture_id IS NOT NULL;

-- NOTE: No FK constraint to fixture.id intentionally.
-- Fixture entries can be deleted without cascading to game records.
