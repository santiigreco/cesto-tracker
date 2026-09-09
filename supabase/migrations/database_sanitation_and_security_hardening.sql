-- ==============================================================================
-- Migración: Saneamiento de Base de Datos y Blindaje Estructural (DBA)
-- Aplicada exitosamente vía Supabase MCP Server
-- ==============================================================================

-- 1. BACKUP / TABLAS DE RESGUARDO PREVIO
CREATE TABLE IF NOT EXISTS _backup_games_sanitation_20260908 AS 
SELECT * FROM games;

CREATE TABLE IF NOT EXISTS _backup_tally_stats_sanitation_20260908 AS 
SELECT * FROM tally_stats;

ALTER TABLE public._backup_games_sanitation_20260908 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_tally_stats_sanitation_20260908 ENABLE ROW LEVEL SECURITY;

-- 2. LIMPIEZA DE ESTRUCTURAS OBSOLETAS
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_team_id_fkey;
ALTER TABLE games DROP COLUMN IF EXISTS fixture_id;
ALTER TABLE games DROP COLUMN IF EXISTS tournament_id;
ALTER TABLE games DROP COLUMN IF EXISTS team_id;
DROP TABLE IF EXISTS teams CASCADE;

-- 3. AJUSTE DE CONSTRAINTS EN games Y tally_stats
ALTER TABLE games DROP CONSTRAINT IF EXISTS games_game_mode_check;
ALTER TABLE games ADD CONSTRAINT games_game_mode_check CHECK (game_mode = 'stats-tally');

ALTER TABLE games DROP CONSTRAINT IF EXISTS chk_games_views_positive;
ALTER TABLE games ADD CONSTRAINT chk_games_views_positive CHECK (views >= 0);

ALTER TABLE tally_stats DROP CONSTRAINT IF EXISTS tally_stats_period_check;
ALTER TABLE tally_stats ADD CONSTRAINT tally_stats_period_check CHECK (
    period IN ('First Half', 'Second Half', 'First Overtime', 'Second Overtime')
);

ALTER TABLE tally_stats DROP CONSTRAINT IF EXISTS chk_tally_positive_values;
ALTER TABLE tally_stats ADD CONSTRAINT chk_tally_positive_values CHECK (
    goles >= 0 AND 
    triples >= 0 AND 
    fallos >= 0 AND 
    recuperos >= 0 AND 
    perdidas >= 0 AND 
    rebote_ofensivo >= 0 AND 
    rebote_defensivo >= 0 AND 
    asistencias >= 0 AND 
    golescontra >= 0 AND 
    faltas_personales >= 0
);

-- 4. BACKFILL DE USUARIOS Y TRIGGER AUTOMÁTICO DE PERFILES
INSERT INTO public.profiles (id, full_name, role, is_admin, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1), 'Usuario') AS full_name,
    'jugador' AS role,
    false AS is_admin,
    NOW() AS updated_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role, is_admin, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Usuario'),
        NEW.raw_user_meta_data->>'avatar_url',
        'jugador',
        false,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 5. BLINDAJE DE FUNCIONES SECURITY DEFINER Y SEARCH PATH
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
          AND (is_admin = true OR permission_role = 'admin')
    );
END;
$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'delete_user') THEN
        ALTER FUNCTION public.delete_user(uuid) SET search_path = public;
        REVOKE EXECUTE ON FUNCTION public.delete_user(uuid) FROM PUBLIC, anon;
    END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_admin_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;

-- 6. SANEAMIENTO Y BLINDAJE DE POLÍTICAS RLS
DROP POLICY IF EXISTS "Enable public access for all users" ON games;
DROP POLICY IF EXISTS "Users can view their own games" ON games;
DROP POLICY IF EXISTS "Users can insert their own games" ON games;
DROP POLICY IF EXISTS "Users can update their own games" ON games;
DROP POLICY IF EXISTS "Public can view games" ON games;
DROP POLICY IF EXISTS "Authenticated users can insert games" ON games;
DROP POLICY IF EXISTS "Owners and admins can update games" ON games;
DROP POLICY IF EXISTS "Owners and admins can delete games" ON games;

CREATE POLICY "Public can view games" 
    ON games FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can insert games" 
    ON games FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners and admins can update games" 
    ON games FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Owners and admins can delete games" 
    ON games FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id OR public.is_admin());

-- Tally Stats
DROP POLICY IF EXISTS "Enable public access for all users" ON tally_stats;
DROP POLICY IF EXISTS "Public can view tally_stats" ON tally_stats;
DROP POLICY IF EXISTS "Owners and admins can modify tally_stats" ON tally_stats;

CREATE POLICY "Public can view tally_stats" 
    ON tally_stats FOR SELECT 
    USING (true);

CREATE POLICY "Owners and admins can modify tally_stats" 
    ON tally_stats FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM games 
            WHERE games.id = tally_stats.game_id 
              AND (games.user_id = auth.uid() OR public.is_admin())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM games 
            WHERE games.id = tally_stats.game_id 
              AND (games.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Los perfiles son públicos para ver" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON profiles;

CREATE POLICY "Public can view profiles" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users and admins can update profiles" 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());
