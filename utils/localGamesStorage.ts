import { LOCAL_GAMES_STORAGE_KEY } from '../constants';
import { GamePeriod, GameState, TallyStats } from '../types';

export const LOCAL_GAME_ID_PREFIX = 'local_';
export const MAX_LOCAL_GAMES = 20;

export interface LocalSavedGame {
    localId: string;
    cloudGameId: string | null;
    updatedAt: string;
    createdAt: string;
    myTeam: string;
    gameName: string;
    tournamentName: string | null;
    myScore: number;
    opponentScore: number;
    currentPeriod: GamePeriod;
    eventsCount: number;
    snapshot: GameState;
}

export const isLocalGameId = (id?: string | null): boolean =>
    Boolean(id && id.startsWith(LOCAL_GAME_ID_PREFIX));

export const generateLocalGameId = (): string =>
    `${LOCAL_GAME_ID_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const computeMyScoreFromTally = (tallyStats?: Record<string, TallyStats>): number => {
    if (!tallyStats) return 0;
    let total = 0;
    Object.entries(tallyStats).forEach(([playerNumber, playerTally]) => {
        if (playerNumber === 'Equipo' || !playerTally) return;
        Object.values(playerTally).forEach((periodStats) => {
            if (!periodStats) return;
            total += ((periodStats.goles || 0) * 2) + ((periodStats.triples || 0) * 3);
        });
    });
    return total;
};

const readLocalGamesRaw = (): LocalSavedGame[] => {
    if (typeof localStorage === 'undefined') return [];
    try {
        const raw = localStorage.getItem(LOCAL_GAMES_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (item): item is LocalSavedGame =>
                Boolean(item && typeof item === 'object' && typeof item.localId === 'string' && item.snapshot)
        );
    } catch {
        return [];
    }
};

const persistLocalGames = (games: LocalSavedGame[]): void => {
    if (typeof localStorage === 'undefined') return;
    const bounded = games.slice(0, MAX_LOCAL_GAMES);
    try {
        localStorage.setItem(LOCAL_GAMES_STORAGE_KEY, JSON.stringify(bounded));
    } catch {
        // Fallback on QuotaExceededError: keep the 10 most recent local matches
        try {
            localStorage.setItem(LOCAL_GAMES_STORAGE_KEY, JSON.stringify(bounded.slice(0, 10)));
        } catch {
            // Ignore storage write failure to keep in-app gameplay uninterrupted
        }
    }
};

export const listLocalGames = (): LocalSavedGame[] => {
    return readLocalGamesRaw().sort((a, b) => {
        const timeA = Date.parse(a.updatedAt || a.createdAt || '') || 0;
        const timeB = Date.parse(b.updatedAt || b.createdAt || '') || 0;
        return timeB - timeA;
    });
};

export const getLocalGameById = (id: string): LocalSavedGame | null => {
    if (!id) return null;
    const games = listLocalGames();
    return games.find((g) => g.localId === id || (g.cloudGameId !== null && g.cloudGameId === id)) || null;
};

export const upsertLocalGame = (state: GameState): LocalSavedGame | null => {
    if (!state.isSetupComplete || state.isReadOnly) return null;

    const games = readLocalGamesRaw();
    const existingIndex = games.findIndex(
        (g) =>
            (state.localId && g.localId === state.localId) ||
            (state.gameId && (g.cloudGameId === state.gameId || g.localId === `${LOCAL_GAME_ID_PREFIX}cloud_${state.gameId}`))
    );

    const existing = existingIndex >= 0 ? games[existingIndex] : null;
    const localId =
        state.localId ||
        existing?.localId ||
        (state.gameId ? `${LOCAL_GAME_ID_PREFIX}cloud_${state.gameId}` : generateLocalGameId());

    const nowIso = new Date().toISOString();
    const myTeam = state.settings?.myTeam?.trim() || '';
    const gameName = state.settings?.gameName?.trim() || '';

    const entry: LocalSavedGame = {
        localId,
        cloudGameId: state.gameId || existing?.cloudGameId || null,
        updatedAt: nowIso,
        createdAt: existing?.createdAt || nowIso,
        myTeam,
        gameName,
        tournamentName: state.settings?.tournamentName || null,
        myScore: computeMyScoreFromTally(state.tallyStats),
        opponentScore: state.opponentScore || 0,
        currentPeriod: state.currentPeriod || 'First Half',
        eventsCount: state.gameLog?.length || 0,
        snapshot: {
            ...state,
            localId,
            tallyRedoLog: [],
        },
    };

    const nextGames =
        existingIndex >= 0
            ? games.map((g, idx) => (idx === existingIndex ? entry : g))
            : [entry, ...games];

    nextGames.sort((a, b) => {
        const timeA = Date.parse(a.updatedAt || a.createdAt || '') || 0;
        const timeB = Date.parse(b.updatedAt || b.createdAt || '') || 0;
        return timeB - timeA;
    });

    persistLocalGames(nextGames);
    return entry;
};

export const deleteLocalGame = (id: string): boolean => {
    if (!id) return false;
    const games = readLocalGamesRaw();
    const filtered = games.filter((g) => g.localId !== id && g.cloudGameId !== id);
    if (filtered.length === games.length) return false;
    persistLocalGames(filtered);
    return true;
};

export const linkLocalGameToCloud = (localId: string, cloudGameId: string): void => {
    if (!localId || !cloudGameId) return;
    const games = readLocalGamesRaw();
    let changed = false;
    const updated = games.map((g) => {
        if (g.localId !== localId) return g;
        changed = true;
        return {
            ...g,
            cloudGameId,
            snapshot: {
                ...g.snapshot,
                gameId: cloudGameId,
                localId,
            },
        };
    });
    if (changed) {
        persistLocalGames(updated);
    }
};
