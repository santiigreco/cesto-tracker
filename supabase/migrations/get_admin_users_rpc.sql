-- Migration: RPC para listar todos los usuarios (auth.users + profiles) desde el admin panel
-- La función corre como SECURITY DEFINER para acceder a auth.users sin exponerlo públicamente.
-- Solo puede ser llamada por usuarios con is_admin = true o permission_role = 'admin'.

CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
    id              uuid,
    email           text,
    created_at      timestamptz,
    last_sign_in_at timestamptz,
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
    -- Solo admins pueden llamar esta función
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

-- Revocar acceso público y conceder solo a usuarios autenticados
REVOKE ALL ON FUNCTION get_admin_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_admin_users() TO authenticated;
