-- ==============================================================================
-- Migration: Query Performance Indexes & RLS initPlan Optimization
-- Purpose: Eliminate sequential scans on foreign keys/sort columns and optimize
--          per-row auth.uid() evaluation in Row Level Security policies.
-- ==============================================================================

-- 1. COMPOSITE & FOREIGN KEY B-TREE INDEXES
-- Speeds up ProfileRoute, AuthContext games count, and RLS user_id checks
CREATE INDEX IF NOT EXISTS idx_games_user_id_created_at
    ON public.games (user_id, created_at DESC);

-- Speeds up LoadGameModal and AdminGamesView (ORDER BY created_at DESC LIMIT 100)
CREATE INDEX IF NOT EXISTS idx_games_created_at_desc
    ON public.games (created_at DESC);

-- Speeds up SyncContext handleLoadGame/handleDeleteGame and tally_stats RLS EXISTS check
CREATE INDEX IF NOT EXISTS idx_tally_stats_game_id
    ON public.tally_stats (game_id);

-- Speeds up useTeamManager (WHERE user_id = $1 ORDER BY created_at DESC) and ProfileRoute count
CREATE INDEX IF NOT EXISTS idx_saved_teams_user_id_created_at
    ON public.saved_teams (user_id, created_at DESC);

-- 2. RLS INITPLAN OPTIMIZATION ((SELECT auth.uid()) cached per query instead of per row)
DROP POLICY IF EXISTS "Authenticated users can insert games" ON public.games;
CREATE POLICY "Authenticated users can insert games"
    ON public.games FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Owners and admins can update games" ON public.games;
CREATE POLICY "Owners and admins can update games"
    ON public.games FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
    WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Owners and admins can delete games" ON public.games;
CREATE POLICY "Owners and admins can delete games"
    ON public.games FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Owners and admins can modify tally_stats" ON public.tally_stats;
CREATE POLICY "Owners and admins can modify tally_stats"
    ON public.tally_stats FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.games
            WHERE games.id = tally_stats.game_id
              AND (games.user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.games
            WHERE games.id = tally_stats.game_id
              AND (games.user_id = (SELECT auth.uid()) OR (SELECT public.is_admin()))
        )
    );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.profiles;
CREATE POLICY "Users and admins can update profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id OR (SELECT public.is_admin()))
    WITH CHECK ((SELECT auth.uid()) = id OR (SELECT public.is_admin()));
