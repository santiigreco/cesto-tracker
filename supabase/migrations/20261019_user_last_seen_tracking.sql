-- Migration: seguimiento de actividad real de usuarios.
-- auth.users.last_sign_in_at solo cambia en logins explícitos (no en refresh de sesión),
-- por lo que se agrega profiles.last_seen_at, actualizado desde la app.

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Marca al usuario autenticado como activo (solo toca su propia fila).
CREATE OR REPLACE FUNCTION public.touch_last_seen()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.profiles
    SET last_seen_at = now()
    WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.touch_last_seen() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.touch_last_seen() TO authenticated;

-- El tipo de retorno cambia, hay que recrear la función.
DROP FUNCTION IF EXISTS public.get_admin_users();

CREATE FUNCTION public.get_admin_users()
RETURNS TABLE (
    id              uuid,
    email           text,
    created_at      timestamptz,
    last_sign_in_at timestamptz,
    last_seen_at    timestamptz,
    last_game_at    timestamptz,
    full_name       text,
    avatar_url      text,
    role            text,
    permission_role text,
    favorite_club   text,
    is_admin        boolean,
    updated_at      timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND (profiles.is_admin = true OR profiles.permission_role = 'admin')
    ) THEN
        RAISE EXCEPTION 'Acceso denegado: solo administradores pueden listar usuarios.';
    END IF;

    RETURN QUERY
    SELECT
        au.id,
        au.email::text,
        au.created_at,
        au.last_sign_in_at,
        p.last_seen_at,
        (SELECT max(g.created_at) FROM public.games g WHERE g.user_id = au.id),
        p.full_name,
        p.avatar_url,
        p.role,
        p.permission_role,
        p.favorite_club,
        COALESCE(p.is_admin, false) AS is_admin,
        p.updated_at
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    ORDER BY au.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
