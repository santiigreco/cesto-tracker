import { GameEvent, GameState, LastSetupData, Settings, TallyStats, TallyStatsPeriod } from '../types';

export const DEFAULT_QUICK_PLAYERS: string[] = Array.from({ length: 15 }, (_, i) => String(i + 1));
export const LAST_SETUP_STORAGE_KEY = 'cesto_last_team_setup';

const TALLY_METRIC_KEYS: Array<keyof TallyStatsPeriod> = [
    'goles',
    'triples',
    'fallos',
    'recuperos',
    'perdidas',
    'reboteOfensivo',
    'reboteDefensivo',
    'asistencias',
    'golesContra',
    'faltasPersonales',
];

const sortPlayerNumbers = (players: string[]): string[] =>
    [...players].sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
    });

export const hasCompleteMatchMetadata = (settings?: Partial<Settings> | null): boolean =>
    Boolean(settings?.myTeam?.trim() && settings?.gameName?.trim());

export const readLastTeamSetup = (): LastSetupData | null => {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(LAST_SETUP_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.myTeam === 'string' && parsed.myTeam.trim().length > 0) {
            return parsed as LastSetupData;
        }
        return null;
    } catch {
        return null;
    }
};

export const saveLastTeamSetup = (
    myTeam: string,
    players: string[],
    playerNames: Record<string, string>
): void => {
    const trimmedTeam = myTeam.trim();
    if (!trimmedTeam || typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(
            LAST_SETUP_STORAGE_KEY,
            JSON.stringify({
                myTeam: trimmedTeam,
                players,
                playerNames,
            })
        );
    } catch {
        // Ignore storage write errors on quota-restricted contexts
    }
};

export const hasPlayerActivity = (
    playerNumber: string,
    tallyStats?: Record<string, TallyStats>,
    gameLog?: GameEvent[]
): boolean => {
    if (!playerNumber || playerNumber === 'Equipo') return false;

    if (Array.isArray(gameLog) && gameLog.some((e) => e.playerNumber === playerNumber)) {
        return true;
    }

    const playerTally = tallyStats?.[playerNumber];
    if (!playerTally) return false;

    return Object.values(playerTally).some((periodStats) => {
        if (!periodStats) return false;
        return TALLY_METRIC_KEYS.some((key) => (periodStats[key] || 0) > 0);
    });
};

const collectAllUniquePlayers = (
    availablePlayers: string[] = [],
    tallyStats?: Record<string, TallyStats>,
    gameLog?: GameEvent[]
): string[] => {
    const set = new Set<string>();
    availablePlayers.forEach((p) => {
        if (p && p !== 'Equipo') set.add(p);
    });
    Object.keys(tallyStats || {}).forEach((p) => {
        if (p && p !== 'Equipo') set.add(p);
    });
    (gameLog || []).forEach((e) => {
        if (e?.playerNumber && e.playerNumber !== 'Equipo') {
            set.add(e.playerNumber);
        }
    });
    return sortPlayerNumbers(Array.from(set));
};

export const getActivePlayersFromMatch = (
    state: Pick<GameState, 'availablePlayers' | 'tallyStats' | 'gameLog'>
): string[] => {
    const allPlayers = collectAllUniquePlayers(
        state.availablePlayers,
        state.tallyStats,
        state.gameLog
    );
    return allPlayers.filter((p) => hasPlayerActivity(p, state.tallyStats, state.gameLog));
};

const hasRealPlayerName = (name?: string): boolean =>
    Boolean(name && name.trim().length > 0 && !name.includes('Jugador #'));

export const getPrioritizedPlayersForExcel = (
    state: Pick<GameState, 'availablePlayers' | 'tallyStats' | 'playerNames' | 'gameLog'>,
    maxPlayers: number = 12
): string[] => {
    const allPlayers = collectAllUniquePlayers(
        state.availablePlayers,
        state.tallyStats,
        state.gameLog
    );

    const tier1Active: string[] = [];
    const tier2Named: string[] = [];
    const tier3Other: string[] = [];

    allPlayers.forEach((p) => {
        if (hasPlayerActivity(p, state.tallyStats, state.gameLog)) {
            tier1Active.push(p);
        } else if (hasRealPlayerName(state.playerNames?.[p])) {
            tier2Named.push(p);
        } else {
            tier3Other.push(p);
        }
    });

    return sortPlayerNumbers([...tier1Active, ...tier2Named, ...tier3Other].slice(0, maxPlayers));
};
