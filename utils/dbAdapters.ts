
import { TallyStatsPeriod, Shot } from '../types';

export const mapTallyPeriodToDb = (stats: TallyStatsPeriod) => ({
    goles: stats.goles,
    fallos: stats.fallos,
    recuperos: stats.recuperos,
    perdidas: stats.perdidas,
    rebote_ofensivo: stats.reboteOfensivo,
    rebote_defensivo: stats.reboteDefensivo,
    asistencias: stats.asistencias,
    golescontra: stats.golesContra,
    faltas_personales: stats.faltasPersonales,
});

export const mapTallyPeriodFromDb = (dbStats: any): TallyStatsPeriod => ({
    goles: dbStats.goles,
    fallos: dbStats.fallos,
    recuperos: dbStats.recuperos,
    perdidas: dbStats.perdidas,
    reboteOfensivo: dbStats.rebote_ofensivo,
    reboteDefensivo: dbStats.rebote_defensivo,
    asistencias: dbStats.asistencias,
    golesContra: dbStats.golescontra,
    faltasPersonales: dbStats.faltas_personales || 0,
});

export const mapShotToDb = (shot: Shot, gameId: string) => ({
    game_id: gameId,
    player_number: shot.playerNumber,
    position: shot.position,
    is_gol: shot.isGol,
    gol_value: shot.golValue,
    period: shot.period,
});

export const mapShotFromDb = (s: any): Shot => ({
    id: s.id,
    playerNumber: s.player_number,
    position: s.position,
    isGol: s.is_gol,
    golValue: s.gol_value,
    period: s.period,
});
