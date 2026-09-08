-- ==============================================================================
-- Migración: Deprecación de Modo Mapa de Tiros y Consolidación en Planilla Técnica
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ==============================================================================

-- 1. MIGRACIÓN / BACKFILL DE DATOS HISTÓRICOS (Resguardo de Datos)
-- Para partidos antiguos grabados exclusivamente con "shot-chart" que tienen registros
-- en la tabla `shots` pero no en `tally_stats`: migramos sus goles, triples y fallos
-- agregados a `tally_stats` para que sus tanteadores y estadísticas queden intactos.

INSERT INTO tally_stats (game_id, player_number, period, goles, triples, fallos, recuperos, perdidas, rebote_ofensivo, rebote_defensivo, asistencias, golescontra, faltas_personales)
SELECT 
    s.game_id,
    COALESCE(s.player_number::text, '0') AS player_number,
    COALESCE(s.period, 'First Half') AS period,
    COUNT(*) FILTER (WHERE s.is_gol = true AND (s.gol_value IS NULL OR s.gol_value = 2)) AS goles,
    COUNT(*) FILTER (WHERE s.is_gol = true AND s.gol_value = 3) AS triples,
    COUNT(*) FILTER (WHERE s.is_gol = false) AS fallos,
    0 AS recuperos,
    0 AS perdidas,
    0 AS rebote_ofensivo,
    0 AS rebote_defensivo,
    0 AS asistencias,
    0 AS golescontra,
    0 AS faltas_personales
FROM shots s
WHERE NOT EXISTS (
    SELECT 1 FROM tally_stats t 
    WHERE t.game_id = s.game_id 
      AND t.player_number = COALESCE(s.player_number::text, '0') 
      AND t.period = COALESCE(s.period, 'First Half')
)
GROUP BY s.game_id, s.player_number, s.period
ON CONFLICT (game_id, player_number, period) DO NOTHING;


-- 2. NORMALIZACIÓN DEL MODO DE PARTIDO
-- Actualizar todos los partidos existentes para que tengan el modo unificado 'stats-tally'
UPDATE games 
SET game_mode = 'stats-tally' 
WHERE game_mode IS NULL OR game_mode != 'stats-tally';


-- 3. (OPCIONAL) LIMPIEZA DE TABLA DE TIROS OBSOLETA
-- NOTA: Por seguridad y preservación de auditoría, la tabla `shots` puede mantenerse
-- como histórico/archivo. Si deseas liberar espacio y eliminarla definitivamente,
-- descomenta la siguiente línea:
-- DROP TABLE IF EXISTS shots CASCADE;


-- 4. (OPCIONAL) LIMPIEZA DE SUBSISTEMA DE FIXTURE / TORNEOS
-- Si también deseas remover las tablas residuales de fixture y torneos:
-- DROP TABLE IF EXISTS fixture CASCADE;
-- DROP TABLE IF EXISTS tournaments CASCADE;
-- ALTER TABLE games DROP COLUMN IF EXISTS fixture_id;
