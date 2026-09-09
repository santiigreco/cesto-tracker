-- ==============================================================================
-- Migración: Creación de Tabla de Auditoría match_activity_logs y Blindaje RLS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.match_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.match_activity_logs ENABLE ROW LEVEL SECURITY;

-- Índices de alto rendimiento para auditoría y búsquedas por partido/usuario
CREATE INDEX IF NOT EXISTS idx_match_activity_logs_game_id_created 
    ON public.match_activity_logs (game_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_activity_logs_user_id_created 
    ON public.match_activity_logs (user_id, created_at DESC);

-- Políticas RLS:
-- 1. Lectura: Administradores y propietarios del partido
DROP POLICY IF EXISTS "Users and admins can view match logs" ON public.match_activity_logs;
CREATE POLICY "Users and admins can view match logs"
    ON public.match_activity_logs FOR SELECT
    TO authenticated
    USING (
        public.is_admin() OR 
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.games 
            WHERE games.id = match_activity_logs.game_id 
              AND games.user_id = auth.uid()
        )
    );

-- 2. Inserción: Usuarios autenticados que sean propietarios del partido o administradores
DROP POLICY IF EXISTS "Authenticated users can insert match logs" ON public.match_activity_logs;
CREATE POLICY "Authenticated users can insert match logs"
    ON public.match_activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id OR 
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.games 
            WHERE games.id = match_activity_logs.game_id 
              AND games.user_id = auth.uid()
        )
    );
