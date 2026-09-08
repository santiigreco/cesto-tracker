
import { TallyStatsPeriod } from '../types';

export const mapTallyPeriodToDb = (stats: TallyStatsPeriod) => ({
    goles: stats.goles,
    triples: stats.triples,
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
    triples: dbStats.triples || 0,
    fallos: dbStats.fallos,
    recuperos: dbStats.recuperos,
    perdidas: dbStats.perdidas,
    reboteOfensivo: dbStats.rebote_ofensivo,
    reboteDefensivo: dbStats.rebote_defensivo,
    asistencias: dbStats.asistencias,
    golesContra: dbStats.golescontra,
    faltasPersonales: dbStats.faltas_personales || 0,
});