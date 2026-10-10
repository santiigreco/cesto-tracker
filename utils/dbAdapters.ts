import { TallyStatsPeriod } from '../types';

export const mapTallyPeriodToDb = (stats: TallyStatsPeriod) => ({
    goles: stats?.goles ?? 0,
    triples: stats?.triples ?? 0,
    fallos: stats?.fallos ?? 0,
    recuperos: stats?.recuperos ?? 0,
    perdidas: stats?.perdidas ?? 0,
    rebote_ofensivo: stats?.reboteOfensivo ?? 0,
    rebote_defensivo: stats?.reboteDefensivo ?? 0,
    asistencias: stats?.asistencias ?? 0,
    golescontra: stats?.golesContra ?? 0,
    faltas_personales: stats?.faltasPersonales ?? 0,
});

export const mapTallyPeriodFromDb = (dbStats: any): TallyStatsPeriod => ({
    goles: dbStats?.goles ?? 0,
    triples: dbStats?.triples ?? 0,
    fallos: dbStats?.fallos ?? 0,
    recuperos: dbStats?.recuperos ?? 0,
    perdidas: dbStats?.perdidas ?? 0,
    reboteOfensivo: dbStats?.rebote_ofensivo ?? dbStats?.reboteOfensivo ?? 0,
    reboteDefensivo: dbStats?.rebote_defensivo ?? dbStats?.reboteDefensivo ?? 0,
    asistencias: dbStats?.asistencias ?? 0,
    golesContra: dbStats?.golescontra ?? dbStats?.goles_contra ?? dbStats?.golesContra ?? 0,
    faltasPersonales: dbStats?.faltas_personales ?? dbStats?.faltasPersonales ?? 0,
});

/**
 * Computes a deterministic signature of all persistable match state.
 * Any modification to score, period, fouls, logs, names, or individual player
 * tally stats (all 10 metrics across all periods) alters this signature.
 */
export const computeGameStateSignature = (state: {
    gameId?: string | null;
    gameLog?: any[];
    teamFouls?: any;
    opponentScore?: number;
    currentPeriod?: string;
    playerNames?: Record<string, string>;
    availablePlayers?: string[];
    tallyStats?: Record<string, any>;
    settings?: any;
}): string => {
    const tallySummary = Object.entries(state.tallyStats || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([p, perMap]) => {
            const periods = Object.entries(perMap || {})
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([per, s]: [string, any]) =>
                    `${per}:${s?.goles || 0},${s?.triples || 0},${s?.fallos || 0},${s?.recuperos || 0},${s?.perdidas || 0},${s?.reboteOfensivo || 0},${s?.reboteDefensivo || 0},${s?.asistencias || 0},${s?.golesContra || 0},${s?.faltasPersonales || 0}`
                )
                .join('|');
            return `${p}:${periods}`;
        })
        .join(';');

    const lastLog = state.gameLog && state.gameLog.length > 0
        ? state.gameLog[state.gameLog.length - 1]
        : null;

    return JSON.stringify({
        gameId: state.gameId || null,
        logLen: state.gameLog?.length || 0,
        lastLogId: lastLog ? (lastLog.id || `${lastLog.timestamp}_${lastLog.playerNumber}_${lastLog.action}`) : '',
        fouls: state.teamFouls || {},
        oppScore: state.opponentScore || 0,
        period: state.currentPeriod || 'First Half',
        names: state.playerNames || {},
        available: state.availablePlayers || [],
        gameName: state.settings?.gameName || '',
        myTeam: state.settings?.myTeam || '',
        tally: tallySummary
    });
};